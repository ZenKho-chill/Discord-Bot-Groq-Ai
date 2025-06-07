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

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Hiển thị thông tin về các lệnh và tính năng của bot");

export async function execute(interaction) {
  const helpEmbed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("Trợ lý AI")
    .setDescription("Dưới đây là các lệnh và tính năng có sẵn:")
    .addFields(
      {
        name: "💬 Lệnh Chat AI",
        value:
          "`/chat [tin nhắn]` - Trò chuyện với trợ lý AI\n`/clear` - Xóa lịch sử trò chuyện của bạn",
      },
      {
        name: "🔧 Cài đặt Người Dùng",
        value: "`/settings` - Cấu hình sở thích AI của bạn",
      },
      {
        name: "📋 Quản lý Kênh",
        value:
          "`/setup-channel` - Thiết lập kênh cho phản hồi tự động của AI\n`/remove-channel` - Xóa AI khỏi một kênh\n`/list-channels` - Liệt kê tất cả các kênh AI trong máy chủ này",
      },
      {
        name: "❓ Trợ giúp & Thông tin",
        value: "`/help` - Hiển thị thông tin trợ giúp này",
      },
      {
        name: "🔘 Các Nút Phản Hồi",
        value:
          "🔄 **Tạo lại**: Tạo phản hồi mới\n➕ **Tiếp tục**: Tiếp tục phản hồi\n💾 **Lưu**: Lưu phản hồi\n🗑️ **Xóa**: Xóa tin nhắn",
      },
      {
        name: "📝 Sử Dụng Kênh AI",
        value:
          "Khi một kênh được thiết lập với `/setup-channel`, AI sẽ tự động phản hồi tin nhắn dựa trên xác suất bạn đã cấu hình. Phản hồi tự động hoạt động song song với lệnh `/chat` thủ công.",
      },
      {
        name: "ℹ️ Giới Thiệu",
        value:
          "Bot này sử dụng API AI (mô hình Llama-3) để cung cấp phản hồi AI nhanh và miễn phí.\n\nTham gia server hỗ trợ của chúng tôi: [discord.gg/EWr3GgP6fe](https://discord.gg/EWr3GgP6fe)",
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [helpEmbed],
    ephemeral: false,
  });
}
