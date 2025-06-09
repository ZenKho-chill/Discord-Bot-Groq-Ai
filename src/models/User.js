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

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  settings: {
    aiModel: {
      type: String,
      default: 'llama3-70b-8192',
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    maxTokens: {
      type: Number,
      default: 500,
    },
    saveHistory: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

// Update lastActive timestamp before saving
userSchema.pre('save', function(next) {
  this.lastActive = Date.now();
  next();
});

// Create or update user by Discord ID
userSchema.statics.findOrCreateUser = async function(userId, username) {
  let user = await this.findOne({ userId });
  
  if (!user) {
    user = new this({
      userId,
      username,
    });
    await user.save();
  }
  
  return user;
};

// Update user settings
userSchema.methods.updateSettings = async function(newSettings) {
  if (newSettings.aiModel) this.settings.aiModel = newSettings.aiModel;
  if (newSettings.temperature !== undefined) this.settings.temperature = newSettings.temperature;
  if (newSettings.maxTokens !== undefined) this.settings.maxTokens = newSettings.maxTokens;
  if (newSettings.saveHistory !== undefined) this.settings.saveHistory = newSettings.saveHistory;
  
  await this.save();
  return this;
};

const User = mongoose.model('User', userSchema);

export default User; 