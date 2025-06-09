/*
 * Tệp này là một phần của Discord Groq Ai Bot.
 *
 * Discord Groq Ai Bot là phần mềm miễn phí: bạn có thể phân phối lại hoặc sửa đổi
 * theo các điều khoản của Giấy phép Công cộng GNU được công bố bởi
 * Tổ chức Phần mềm Tự do, phiên bản 3 hoặc (nếu bạn muốn) bất kỳ phiên bản nào sau đó.
 *
 * Discord Groq Ai Bot được phân phối với hy vọng rằng nó sẽ hữu ích,
 * nhưng KHÔNG CÓ BẢO HÀNH; thậm chí không bao gồm cả bảo đảm
 * VỀ TÍNH THƯƠNG MẠI hoặc PHÙ HỢP CHO MỤC ĐÍCH CỤ THỂ. Xem
 * Giấy phép Công cộng GNU để biết thêm chi tiết.
 *
 * Bạn sẽ nhận được một bản sao của Giấy phép Công cộng GNU cùng với Discord Groq Ai Bot.
 * Nếu không, hãy xem <https://www.gnu.org/licenses/>.
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Conversation from '../models/Conversation.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Xoá lịch sử trò chuyện của bạn với trợ lý AI');

export async function execute(interaction) {
  try {
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    
    // Lấy cuộc trò chuyện đang hoạt động
    const conversation = await Conversation.getOrCreateConversation(userId, channelId);
    
    // Xoá lịch sử trò chuyện (trừ các tin hệ thống)
    await conversation.clearHistory();
    
    // Tạo thông báo thành công
    const successEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Đã Xoá Trò Chuyện')
      .setDescription('Lịch sử trò chuyện của bạn đã được xoá. AI sẽ không còn ghi nhớ các tin nhắn trước đó trong kênh này.')
      .setFooter({ 
        text: 'Trợ Lý AI',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Lỗi trong lệnh clear:', error);
    
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi xoá lịch sử trò chuyện của bạn!',
      ephemeral: true,
    });
  }
}
