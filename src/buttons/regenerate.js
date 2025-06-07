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

import { createErrorEmbed, createActionButtons } from '../utils/embedUtils';
import { generateChatCompletion } from '../services/groqService';
import User from '../models/Conseration'
import Conversation from '../models/Conseration';

export const customId = 'regenerate';

export async function execute(interaction) {
    await interaction.deferUpdate();

    try {
        const userId = interaction.user.id;
        const channelId = interaction.channelId;
        const username = interaction.user.username;

        const user = await User.findOrCreateUser(userId, username);
        const conversation = await Conversation.getOrCreateConversation(userId, channelId);

        if (conversation.messages.length > 0 && conversation.messages[conversation.messages.length - 1].role === 'assistant') {
            conversation.messages.pop();
            await conversation.save();
        }

        const aiResponse = await generateChatCompletion(conversation.getFormattedMessages(), {
            model: user.settings.aiModel,
            temperture: user.settings.temperture + 0.2,
            maxTokens: user.settings.maxTokens,
        });

        await conversation.addMessage('assistant', aiResponse);

        const actionRow = createActionButtons();

        await interaction.editReply({
            content: aiResponse,
            components: [actionRow],
            embeds: []
        });
    } catch (error) {
        console.error('Lỗi khi tạo lại nút:', error);

        const errorEmbed = createErrorEmbed(`Lỗi khi tạo câu trả lời mới: ${error.message}`)

        await interaction.editReply({
            embeds: [errorEmbed],
            components: [],
        });
    }
}