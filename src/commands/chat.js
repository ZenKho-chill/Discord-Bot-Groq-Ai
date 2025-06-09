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

import { SlashCommandBuilder } from 'discord.js';
import { createLoadingEmbed, createErrorEmbed, createActionButtons } from '../utils/embedUtils.js';
import { generateChatCompletion } from '../services/groqService.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

export const data = new SlashCommandBuilder()
  .setName('chat')
  .setDescription('Trò chuyện với trợ lý AI')
  .addStringOption(option =>
    option.setName('message')
      .setDescription('Tin nhắn bạn muốn gửi đến AI')
      .setRequired(true));

export async function execute(interaction) {
  // Trì hoãn phản hồi để AI có thời gian xử lý
  await interaction.deferReply();

  try {
    const userMessage = interaction.options.getString('message');
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    const username = interaction.user.username;

    // Tìm hoặc tạo người dùng trong cơ sở dữ liệu
    const user = await User.findOrCreateUser(userId, username);
    
    // Tìm hoặc tạo cuộc trò chuyện
    const conversation = await Conversation.getOrCreateConversation(userId, channelId);
    
    // Thêm tin nhắn người dùng vào cuộc trò chuyện
    await conversation.addMessage('user', userMessage);
    
    // Tạo phản hồi từ AI dựa trên lịch sử trò chuyện
    const aiResponse = await generateChatCompletion(conversation.getFormattedMessages(), {
      model: user.settings.aiModel,
      temperature: user.settings.temperature,
      maxTokens: user.settings.maxTokens,
    });
    
    // Thêm phản hồi của AI vào cuộc trò chuyện
    await conversation.addMessage('assistant', aiResponse);
    
    // Tạo các nút hành động
    const actionRow = createActionButtons();
    
    // Gửi phản hồi cho người dùng
    await interaction.editReply({
      content: aiResponse,
      components: [actionRow],
    });
  } catch (error) {
    console.error('Lỗi trong lệnh chat:', error);
    
    const errorEmbed = createErrorEmbed(`❌ Không thể xử lý yêu cầu của bạn: ${error.message}`);
    
    await interaction.editReply({
      embeds: [errorEmbed],
    });
  }
}
