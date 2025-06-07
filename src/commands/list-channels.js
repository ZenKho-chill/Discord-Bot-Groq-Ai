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

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Channel from '../models/Channel.js';

export const data = new SlashCommandBuilder()
  .setName('list-channels')
  .setDescription('Liệt kê tất cả các kênh AI trong máy chủ này')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  try {
    // Tạm hoãn trả lời để có thời gian xử lý
    await interaction.deferReply();
    
    // Lấy tất cả các kênh AI trong máy chủ
    const channels = await Channel.getGuildChannels(interaction.guild.id);
    
    if (!channels || channels.length === 0) {
      return await interaction.editReply({
        content: '❌ Chưa có kênh AI nào được thiết lập trong máy chủ này.',
        ephemeral: true
      });
    }
    
    // Tạo embed với danh sách kênh
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Các Kênh AI')
      .setDescription(`Máy chủ này có ${channels.length} ${channels.length === 1 ? 'kênh' : 'kênh'} AI:`)
      .setTimestamp();
    
    // Thêm các trường cho từng kênh
    for (const channel of channels) {
      try {
        // Cố gắng lấy thông tin kênh
        const discordChannel = interaction.guild.channels.cache.get(channel.channelId);
        const channelName = discordChannel ? discordChannel.name : 'Kênh không xác định';
        
        embed.addFields({
          name: `#${channelName}`,
          value: `• **Mô hình**: ${channel.settings.aiModel}\n• **Thiết lập bởi**: <@${channel.createdBy}>`
        });
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin kênh cho ${channel.channelId}:`, error);
        embed.addFields({
          name: `Channel ID: ${channel.channelId}`,
          value: `• **Mô hình**: ${channel.settings.aiModel}\n• **Thiết lập bởi**: <@${channel.createdBy}>`
        });
      }
    }
    
    // Thêm ghi chú về cách hoạt động
    embed.addFields({
      name: 'Cách Hoạt Động',
      value: 'AI sẽ tự động phản hồi tất cả các tin nhắn trong các kênh này.'
    });
    
    // Gửi phản hồi
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Lỗi trong lệnh list-channels:', error);
    
    await interaction.editReply({
      content: `❌ Không thể liệt kê các kênh AI: ${error.message}`,
      ephemeral: true
    });
  }
}
