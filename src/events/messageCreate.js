/*
 * This file is part of Discord Groq Ai Bot.
 *
 * Discord Groq Ai Bot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Discord Groq Ai Bot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Discord Groq Ai Bot.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Events, EmbedBuilder } from 'discord.js';
import { generateChatCompletion } from '../services/groqService';
import { createActionButtons } from '../utils/embedUtils';
import Channel from '../models/Channel';
import Conversation from '../models/Conseration';

export const name = Events.MessageCreate;
export const once = false;

const DISCORD_MESSAGE_LIMIT = 2000;

function splitMessage(content) {
    if (content.length <= DISCORD_MESSAGE_LIMIT) {
        return [content];
    }

    const parts = [];
    let currentPart = '';

    const paragraphs = content.split('\n\n');

    for (const paragraph of paragraphs) {
        if (paragraph.length > DISCORD_MESSAGE_LIMIT) {
            if (currentPart.length > 0) {
                parts.push(currentPart);
                currentPart = '';
            }

            const lines = paragraph.split('\n');
            for (const line of lines) {
                if (line.length > DISCORD_MESSAGE_LIMIT) {
                    if (currentPart.length > 0) {
                        parts.push(currentPart);
                        currentPart = '';
                    }

                    let remaningLine = line;
                    while (remaningLine.length > 0) {
                        const chunk = remaningLine.slice(0, DISCORD_MESSAGE_LIMIT);
                        parts.push(chunk);
                        remaningLine = remaningLine.slice(DISCORD_MESSAGE_LIMIT);
                    }
                }
                else if (currentPart.length + line.length + 1 > DISCORD_MESSAGE_LIMIT) {
                    parts.push(currentPart);
                    currentPart = line;
                }
                else {
                    currentPart = currentPart.length > 0 ? `${currentPart}\n${line}` : line;
                }
            }
        }
        else if (currentPart.length + paragraph.length + 2 > DISCORD_MESSAGE_LIMIT) {
            parts.push(currentPart);
            currentPart = paragraph;
        }
        else {
            currentPart = currentPart.length > 0 ? `${currentPart}\n\n${paragraph}` : paragraph;
        }
    }

    if (currentPart.length > 0) {
        parts.push(currentPart);
    }

    return parts;
}

export async function execute(message) {
    if (message.author.bot) return;

    if (!message.guild) return;

    try {
        const aiChannel = await Channel.findOne({
            guildId: message.guild.id,
            channelId: message.channel.id
        });

        if (!aiChannel) return;

        const conversation = await Conversation.getOrCreateConversation(
            message.author.id,
            message.channel.id
        );

        if (conversation.lastMessageId) {
            try {
                const previousMessage = await message.channel.messages.fetch(conversation.lastMessageId);
                if (previousMessage && previousMessage.editable) {
                    await previousMessage.edit({ components: [] });
                }
            } catch (error) {
                console.error('Lỗi khi xóa nút từ tin nhắn trước:', error);
            }
        }

        await conversation.addMessage('user', message.content);

        await message.channel.sendTyping();

        const aiResponse = await generateChatCompletion(
            conversation.getFormattedMessages(),
            { model: aiChannel.settings.aiModel }
        );

        await conversation.addMessage('assistant', aiResponse);

        const actionRow = createActionButtons();

        let sentMessage;

        const responseParts = splitMessage(aiResponse);
        if (responseParts.length === 1) {
            sentMessage = await message.reply({
                content: aiResponse,
                components: [actionRow],
            });
        } else {
            sentMessage = await message.reply({
                content: responseParts[0],
                components: [],
            });

            for (let i = 1; i < responseParts.length - 1; i++) {
                await message.channel.send({
                    content: responseParts[i],
                    components: [],
                });
            }

            const lastMessage = await message.channel.send({
                content: responseParts[responseParts.length - 1],
                components: [actionRow],
            });

            sentMessage = lastMessage;
        }

        await conversation.updateLastMessageId(sendMessage.id);
    } catch (error) {
        console.error('Lỗi trong xử lý sự kiện tin nhắn:', error);

        try {
            await message.reply({
                content: 'Xin lỗi, tôi gặp lỗi khi xử lý tin nhắn của ban. Hãy thử lại với tin nhắn ngắn hơn hoặc truy vấn khác',
            });
        } catch (replyError) {
            console.error('Không thể gửi tin nhắn lỗi:', replyError);
        }
    }
}