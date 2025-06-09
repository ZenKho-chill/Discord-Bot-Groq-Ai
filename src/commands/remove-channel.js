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
  .setName('remove-channel')
  .setDescription('Gỡ bỏ tính năng AI tự động phản hồi khỏi một kênh')
  .addChannelOption(option => 
    option.setName('channel')
      .setDescription('Kênh cần gỡ AI (mặc định là kênh hiện tại)')
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildText))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  try {
    // Trì hoãn phản hồi để xử lý
    await interaction.deferReply();
    
    // Lấy tùy chọn
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    
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
    
    // Kiểm tra xem có phải là kênh AI không
    const isAIChannel = await Channel.isAIChannel(interaction.guild.id, targetChannel.id);
    
    if (!isAIChannel) {
      return await interaction.editReply({
        content: `❌ <#${targetChannel.id}> không được thiết lập là kênh AI.`,
        ephemeral: true
      });
    }
    
    // Gỡ bỏ kênh
    const success = await Channel.removeChannel(interaction.guild.id, targetChannel.id);
    
    if (!success) {
      return await interaction.editReply({
        content: `❌ Gỡ AI khỏi <#${targetChannel.id}> thất bại.`,
        ephemeral: true
      });
    }
    
    // Tạo thông báo thành công
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('Đã Gỡ Kênh AI')
      .setDescription(`✅ <#${targetChannel.id}> đã được gỡ bỏ vai trò là kênh AI.`)
      .setFooter({ 
        text: 'Trợ Lý AI Cortex Realm | Được tạo bởi Friday',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();
    
    // Gửi phản hồi
    await interaction.editReply({ embeds: [embed] });
    
    // Gửi thông báo đến kênh nếu khác với kênh hiện tại
    if (targetChannel.id !== interaction.channelId) {
      try {
        await targetChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('Kênh AI Đã Bị Gỡ Bỏ')
              .setDescription(`Tính năng AI trong kênh này đã được <@${interaction.user.id}> gỡ bỏ.`)
              .setFooter({ 
                text: 'Trợ Lý AI Cortex Realm | Được tạo bởi Friday',
                iconURL: interaction.client.user.displayAvatarURL()
              })
          ]
        });
      } catch (error) {
        console.error('Lỗi khi gửi thông báo đến kênh được chọn:', error);
      }
    }
    
  } catch (error) {
    console.error('Lỗi trong lệnh remove-channel:', error);
    
    await interaction.editReply({
      content: `❌ Gỡ kênh AI thất bại: ${error.message}`,
      ephemeral: true
    });
  }
}
