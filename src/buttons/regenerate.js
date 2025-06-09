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

import { createErrorEmbed, createActionButtons } from '../utils/embedUtils.js';
import { generateChatCompletion } from '../services/groqService.js';
import User from '../models/User.js'
import Conversation from '../models/Conversation.js';

export const customId = 'regenerate';

export async function execute(interaction) {
    await interaction.deferUpdate();

    try {
        const userId = interaction.user.id;
        const channelId = interaction.channelId;
        const username = interaction.user.username;

        const user = await User.findOrCreateUser(userId, username);
        const conversation = await Conversation.getOrCreateConversation(userId, channelId);

        if (conversation.messages.length > 0 && conversation.messages[conversation.messages.length - 1].role === 'assistant') {
            conversation.messages.pop();
            await conversation.save();
        }

        const aiResponse = await generateChatCompletion(conversation.getFormattedMessages(), {
            model: user.settings.aiModel,
            temperture: user.settings.temperture + 0.2,
            maxTokens: user.settings.maxTokens,
        });

        await conversation.addMessage('assistant', aiResponse);

        const actionRow = createActionButtons();

        await interaction.editReply({
            content: aiResponse,
            components: [actionRow],
            embeds: []
        });
    } catch (error) {
        console.error('Lỗi khi tạo lại nút:', error);

        const errorEmbed = createErrorEmbed(`Lỗi khi tạo câu trả lời mới: ${error.message}`)

        await interaction.editReply({
            embeds: [errorEmbed],
            components: [],
        });
    }
}