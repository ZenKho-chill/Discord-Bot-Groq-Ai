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

import { SlashCommandBuilder } from 'discord.js';
import { createLoadingEmbed, createErrorEmbed, createActionButtons } from '../utils/embedUtils';
import { generateChatCompletion } from '../services/groqService';
import User from '../models/User';
import Conversation from '../models/Conseration';

export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Trò chuyện với trợ lý AI')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('Tin nhắn của bạn gửi tới AI')
            .setRequired(true));

export async function execute(interaction) {
    // Tạm hoãn để AI xử lý
    await interaction.deferReply();

    try {
        const userMessage = interaction.options.getString('message');
        const userId = interaction.user.id;
        const channelId = interaction.channelId;
        const username = interaction.user.username;

        // Lấy hoặc tạo người dùng trong cơ sở dữ liệu
        const user = await User.findOrCreateUser(userId, username);

        // Lấy hoặc tạo cuộc trò chuyện
        const conversation = await Conversation.getOrCreateConversation(userId, channelId);

        // Thêm tin nhắn của người dùng vào cuộc trò chuyện
        await conversation.addMessage('user', userMessage);

        // Tạo phản hồi từ AI sử dụng các tin nhắn đã định dạng mà khong có trong trường _id của MongoDB
        const aiResponse = await generateChatCompletion(conversation.getFormattedMessages(), {
            model: user.settings.aiModel,
            temperature: user.settings.temperature,
            maxTokens: user.settings.maxTokens,
        });

        // Thêm phản hồi của AI vào cuộc trò chuyện
        await conversation.addMessage('assistant', aiResponse);

        // Tạo các nút hành động
        const actionRow = createActionButtons();

        // Gửi phản hồi
        await interaction.editReply({
            content: aiResponse,
            components: [actionRow],
        });
    } catch (error) {
        console.error('Lỗi trong lệnh trò chuyện:', error);

        const errorEmbed = createErrorEmbed(`Không thể xử lý yêu cầu của bạn: ${error.message}`);

        await interaction.editReply({
            embeds: [errorEmbed],
        });
    }
}