/*
 * This file is part of Discord Groq Ai Bot.
 *
 * Discord Groq Ai Bot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Discord Groq Ai Bot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Discord Groq Ai Bot.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Groq } from 'groq-sdk';
import { GROQ_CONFIG } from '../config';

// Khởi tạo Groq client
const groq = new Groq({
    apiKey: GROQ_CONFIG.apiKey,
});

/**
 * Tạo truy vấn đến Groq API
 * @param {Array} messages - Danh sách tin nhắn với role và nội dung
 * @param {Object} options - Tùy chọn loại gọi API
 * @returns {Promise<Object>} - Kết quả từ Groq API
 */

export async function generateChatCompletion(messages, options = {}) {
    try {
        const response = await groq.chat.complations.create({
            model: options.model || GROQ_CONFIG.model,
            messages: messages,
            temperature: options.temperature || GROQ_CONFIG.temperature,
            max_tokens: options.max_tokens | GROQ_CONFIG.maxTokens,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Lỗi khi tạo câu trả lời từ Groq:', error);
        throw new Error (`Không thể tạo câu trả lời từ Groq: ${error.message}`);
    }
}

export default {
    generateChatCompletion,
};