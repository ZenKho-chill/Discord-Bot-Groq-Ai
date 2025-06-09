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
          "Bot này sử dụng API AI (mô hình Llama-3) để cung cấp phản hồi AI nhanh và miễn phí.\n\nCần hỗ trợ, hãy gọi tôi: [ZenKho](<https://zenkho.top>)",
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [helpEmbed],
    ephemeral: false,
  });
}
