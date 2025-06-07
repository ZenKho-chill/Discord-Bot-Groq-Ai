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

import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Cấu hình các thiết lập trợ lý AI của bạn');

export async function execute(interaction) {
  try {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    
    // Lấy hoặc tạo người dùng
    const user = await User.findOrCreateUser(userId, username);
    
    // Tạo embed cài đặt
    const settingsEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Cài Đặt Trợ Lý AI')
      .setDescription('Cấu hình các tùy chọn cho trợ lý AI của bạn:')
      .addFields(
        { name: 'Mô Hình AI Hiện Tại', value: user.settings.aiModel },
        { name: 'Nhiệt Độ', value: user.settings.temperature.toString(), inline: true },
        { name: 'Số Token Tối Đa', value: user.settings.maxTokens.toString(), inline: true },
        { name: 'Lưu Lịch Sử', value: user.settings.saveHistory ? 'Đã Bật' : 'Đã Tắt', inline: true },
      )
      .setFooter({ 
        text: 'Sử dụng menu dưới đây để thay đổi cài đặt',
        iconURL: interaction.client.user.displayAvatarURL()
      });
    
    // Tạo menu chọn mô hình AI
    const modelRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_model')
          .setPlaceholder('Chọn mô hình AI')
          .addOptions([
            {
              label: 'Llama-3 70B',
              description: 'Mô hình mạnh nhất (được khuyến nghị)',
              value: 'llama3-70b-8192',
              default: user.settings.aiModel === 'llama3-70b-8192',
            },
            {
              label: 'Llama-3 8B',
              description: 'Phản hồi nhanh hơn',
              value: 'llama3-8b-8192',
              default: user.settings.aiModel === 'llama3-8b-8192',
            },
            {
              label: 'Mixtral 8x7B',
              description: 'Mô hình thay thế',
              value: 'mixtral-8x7b-32768',
              default: user.settings.aiModel === 'mixtral-8x7b-32768',
            },
          ]),
      );
    
    // Tạo menu chọn nhiệt độ
    const temperatureRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_temperature')
          .setPlaceholder('Chọn nhiệt độ')
          .addOptions([
            {
              label: 'Thấp (0.3)',
              description: 'Phản hồi có tính quyết đoán cao',
              value: '0.3',
              default: user.settings.temperature === 0.3,
            },
            {
              label: 'Trung Bình (0.7)',
              description: 'Phản hồi cân bằng',
              value: '0.7',
              default: user.settings.temperature === 0.7,
            },
            {
              label: 'Cao (1.0)',
              description: 'Phản hồi sáng tạo hơn',
              value: '1.0',
              default: user.settings.temperature === 1.0,
            },
          ]),
      );
    
    // Tạo nút bấm cho các cài đặt khác
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('toggle_history')
          .setLabel(user.settings.saveHistory ? 'Tắt Lịch Sử' : 'Bật Lịch Sử')
          .setStyle(user.settings.saveHistory ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('reset_settings')
          .setLabel('Đặt lại mặc định')
          .setStyle(ButtonStyle.Secondary),
      );
    
    await interaction.reply({
      embeds: [settingsEmbed],
      components: [modelRow, temperatureRow, buttonRow],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Lỗi trong lệnh settings:', error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi thực thi lệnh này!',
      ephemeral: true,
    });
  }
}
