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

// Định nghĩa schema cho cuộc trò chuyện giữa người dùng và AI
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  lastMessageId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Cập nhật thời gian chỉnh sửa mỗi khi lưu
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Thêm một tin nhắn vào cuộc trò chuyện
conversationSchema.methods.addMessage = async function(role, content) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
  });
  
  await this.save();
  return this;
};

// Cập nhật ID của tin nhắn cuối cùng
conversationSchema.methods.updateLastMessageId = async function(messageId) {
  this.lastMessageId = messageId;
  await this.save();
  return this;
};

// Chuyển đổi định dạng tin nhắn để gửi qua API (bỏ _id của MongoDB)
conversationSchema.methods.getFormattedMessages = function() {
  return this.messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

// Xoá toàn bộ lịch sử trò chuyện (giữ lại tin nhắn hệ thống nếu có)
conversationSchema.methods.clearHistory = async function() {
  this.messages = this.messages.filter(msg => msg.role === 'system');
  await this.save();
  return this;
};

// Lấy cuộc trò chuyện đang hoạt động hoặc tạo mới nếu chưa có
conversationSchema.statics.getOrCreateConversation = async function(userId, channelId) {
  let conversation = await this.findOne({
    userId,
    channelId,
    isActive: true,
  });
  
  if (!conversation) {
    conversation = new this({
      userId,
      channelId,
      messages: [{
        role: 'system',
        content: 'Bạn là một trợ lý AI hữu ích, được tích hợp với Discord và hỗ trợ bởi Groq. Hãy đưa ra các phản hồi ngắn gọn và chính xác.',
      }],
    });
    await conversation.save();
  }
  
  return conversation;
};

// Khởi tạo model từ schema
const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
