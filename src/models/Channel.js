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

import mongoose from 'mongoose';

// Định nghĩa schema cho kênh AI
const channelSchema = new mongoose.Schema({
  guild: {
    type: String,
    required: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  settings: {
    aiModel: {
      type: String,
      default: 'llama3-70b-8192',
    },
    systemPrompt: {
      type: String,
      default: 'Bạn là trợ lý AI hữu ích và tích hợp với Discord. Bạn cung cấp phản hồi ngắn gọn và chính xác.',
    },
  },
});

// Tạo chỉ mục duy nhất dựa trên guild + channel
channelSchema.index({ guild: 1, channelId: 1 }, { unique: true });

// Tìm hoặc tạo mới một kênh AI
channelSchema.statics.findOrCreateChannel = async function (guildId, channelId, userId) {
  try {
    let channel = await this.findOne({ guild: guildId, channelId });

    if (!channel) {
      channel = new this({
        guild: guildId,
        channelId,
        createdBy: userId,
      });
      await channel.save();
    }

    return channel;
  } catch (error) {
    console.error('Lỗi ở findOrCreateChannel:', error);
    throw error;
  }
};

// Xóa kênh AI khỏi hệ thống
channelSchema.statics.removeChannel = async function (guildId, channelId) {
  try {
    const result = await this.deleteOne({ guild: guildId, channelId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi ở removeChannel:', error);
    throw error;
  }
};

// Lấy danh sách các kênh AI theo guild
channelSchema.statics.getGuildChannels = async function (guildId) {
  try {
    return await this.find({ guild: guildId });
  } catch (error) {
    console.error('Lỗi ở getGuildChannels:', error);
    throw error;
  }
};

// Kiểm tra xem kênh có đang là kênh AI không
channelSchema.statics.isAIChannel = async function (guildId, channelId) {
  try {
    const channel = await this.findOne({ guild: guildId, channelId });
    return !!channel;
  } catch (error) {
    console.error('Lỗi ở isAIChannel:', error);
    return false;
  }
};

// Cập nhật cài đặt cho kênh
channelSchema.methods.updateSettings = async function (newSettings) {
  if (newSettings.aiModel) this.settings.aiModel = newSettings.aiModel;
  if (newSettings.systemPrompt) this.settings.systemPrompt = newSettings.systemPrompt;

  await this.save();
  return this;
};

// Tạo model Channel
const Channel = mongoose.model('AIChannel', channelSchema);

export default Channel;
