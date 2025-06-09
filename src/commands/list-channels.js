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
