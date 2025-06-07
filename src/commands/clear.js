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

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Conversation from '../models/Conseration';

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Xóa lịch sử trò chuyện của bạn với AI');

export async function execute(interaction) {
    try {
        const userId = interaction.user.id;
        const channelId = interaction.channelId;

        // Lấy cuộc trò chuyện đang hoạt động
        const conversation = await Conversation.getOrCreateConversation(userId, channelId);

        // Xóa lịch sử trò chuyện (ngoại trừ các tin nhắn hệ thống)
        await conversation.clearHistory();

        // Tạo embed thành công
        const successEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Lịch sử trò chuyện đã được xóa')
            .setDescription('Lịch sử trò chuyện của bạn sẽ được xóa. Trợ lý AI sẽ không còn nhớ các tin nhắn trước đây của bạn trong kênh này.')
            .setFooter({
                text: 'Trợ lý AI',
                iconURL: interaction.client.user.displayAvtarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [successEmbed],
            ephemeral: true,
        });
    } catch (error) {
        console.error('Lỗi trong lệnh xóa:', error);

        await interaction.reply({
            content: 'Đã có lỗi xảy ra khi xóa lịch sử trò chuyện của bạn!',
            ephemeral: true,
        });
    }
}