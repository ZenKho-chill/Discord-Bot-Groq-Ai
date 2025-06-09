/*
 * Tệp này là một phần của Discord Groq Ai Bot.
 *
 * Discord Groq Ai Bot là phần mềm miễn phí: bạn có thể phân phối lại hoặc sửa đổi
 * theo các điều khoản của Giấy phép Công cộng GNU được công bố bởi
 * Tổ chức Phần mềm Tự do, phiên bản 3 hoặc (nếu bạn muốn) bất kỳ phiên bản nào sau đó.
 *
 * Discord Groq Ai Bot được phân phối với hy vọng rằng nó sẽ hữu ích,
 * nhưng KHÔNG CÓ BẢO HÀNH; thậm chí không bao gồm cả bảo đảm
 * VỀ TÍNH THƯƠNG MẠI hoặc PHÙ HỢP CHO MỘT MỤC ĐÍCH CỤ THỂ. Xem
 * Giấy phép Công cộng GNU để biết thêm chi tiết.
 *
 * Bạn sẽ nhận được một bản sao của Giấy phép Công cộng GNU cùng với Discord Groq Ai Bot.
 * Nếu không, hãy xem <https://www.gnu.org/licenses/>.
 */

import { Events, EmbedBuilder } from 'discord.js';
import { generateChatCompletion } from '../services/groqService.js';
import { createActionButtons } from '../utils/embedUtils.js';
import Channel from '../models/Channel.js';
import Conversation from '../models/Conversation.js';

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