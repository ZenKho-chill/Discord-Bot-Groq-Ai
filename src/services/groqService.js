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

import { Groq } from 'groq-sdk';
import { GROQ_CONFIG } from '../config.js';

// Khởi tạo client Groq
const groq = new Groq({
  apiKey: GROQ_CONFIG.apiKey,
});

/**
 * Tạo phản hồi trò chuyện bằng API Groq
 * @param {Array} messages - Mảng các tin nhắn gồm vai trò và nội dung
 * @param {Object} options - Các tuỳ chọn cho cuộc gọi API
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
export async function generateChatCompletion(messages, options = {}) {
  try {
    const response = await groq.chat.completions.create({
      model: options.model || GROQ_CONFIG.model,
      messages: messages,
      temperature: options.temperature || GROQ_CONFIG.temperature,
      max_tokens: options.maxTokens || GROQ_CONFIG.maxTokens,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi khi tạo phản hồi từ Groq:', error);
    throw new Error(`Không thể tạo câu trả lời từ Groq: ${error.message}`);
  }
}

export default {
  generateChatCompletion,
};
