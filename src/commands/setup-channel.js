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

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Channel from '../models/Channel.js';

export const data = new SlashCommandBuilder()
  .setName('setup-channel')
  .setDescription('Thiết lập kênh để tương tác với AI')
  .addChannelOption(option => 
    option.setName('channel')
      .setDescription('Kênh sẽ được thiết lập cho AI (mặc định là kênh hiện tại)')
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildText))
  .addStringOption(option =>
    option.setName('model')
      .setDescription('Chọn mô hình AI sử dụng cho kênh này')
      .setRequired(false)
      .addChoices(
        { name: 'Llama-3 70B (Mặc định)', value: 'llama3-70b-8192' },
        { name: 'Llama-3 8B (Nhanh hơn)', value: 'llama3-8b-8192' },
        { name: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' }
      ))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  try {
    // Trì hoãn phản hồi để xử lý
    await interaction.deferReply();
    
    // Lấy tùy chọn
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const model = interaction.options.getString('model');
    
    // Kiểm tra quyền hạn
    const member = interaction.member;
    const channel = interaction.guild.channels.cache.get(targetChannel.id);
    
    if (!channel) {
      return await interaction.editReply({
        content: '❌ Không thể tìm thấy kênh đã chỉ định.',
        ephemeral: true
      });
    }
    
    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.editReply({
        content: '❌ Bạn cần quyền "Quản lý kênh" để sử dụng lệnh này.',
        ephemeral: true
      });
    }
    
    // Tạo đối tượng cài đặt với những tùy chọn được cung cấp
    const settings = {};
    if (model) settings.aiModel = model;
    
    // Thiết lập kênh
    const aiChannel = await Channel.findOrCreateChannel(
      interaction.guild.id,
      targetChannel.id,
      interaction.user.id
    );
    
    // Cập nhật cài đặt nếu có
    if (Object.keys(settings).length > 0) {
      await aiChannel.updateSettings(settings);
    }
    
    // Tạo thông báo thành công
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Thiết Lập Kênh AI')
      .setDescription(`✅ <#${targetChannel.id}> đã được thiết lập thành công làm kênh AI.`)
      .addFields(
        { name: 'Mô hình AI', value: aiChannel.settings.aiModel, inline: true },
        { name: 'Cách sử dụng', value: 'Bot sẽ phản hồi tất cả tin nhắn trong kênh này.', inline: true },
      )
      .setFooter({ 
        text: 'Trợ Lý AI Groq | Được tạo bởi ZenKho',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();
    
    // Gửi phản hồi
    await interaction.editReply({ embeds: [embed] });
    
    // Gửi thông báo tới kênh nếu không phải kênh hiện tại
    if (targetChannel.id !== interaction.channelId) {
      try {
        await targetChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle('Kênh AI Đã Được Kích Hoạt')
              .setDescription(`Kênh này đã được thiết lập để tương tác với AI bởi <@${interaction.user.id}>.\n\nAI sẽ tự động phản hồi tất cả tin nhắn trong kênh này.`)
              .setFooter({ 
                text: 'Trợ Lý AI Groq | Được tạo bởi ZenKho',
                iconURL: interaction.client.user.displayAvatarURL()
              })
          ]
        });
      } catch (error) {
        console.error('Lỗi khi gửi thông báo đến kênh được chọn:', error);
      }
    }
    
  } catch (error) {
    console.error('Lỗi trong lệnh setup-channel:', error);
    
    await interaction.editReply({
      content: `❌ Thiết lập kênh AI thất bại: ${error.message}`,
      ephemeral: true
    });
  }
}
