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

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Tạo kiểu embed cho câu trả lời của bot
 * @param {string} content - Nội dung của embed
 * @param {Object} options - Tùy chọn bổ sung cho embed
 * @returns {EmbedBuilder} - Discord Embed
 */

export function createResponseEmbed(content, options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || '#5865F2')
        .setDescription(content)

    if (options.title) {
        embed.setTitle(options.title);
    }

    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    if (options.image) {
        embed.setImage(options.image);
    }

    if (options.author) {
        embed.SetAuthor({
            name: options.author.name,
            iconURL: options.author.iconURL,
            url: options.author.url,
        });
    }

    if (options.timestamp) {
        embed.setTimestamp();
    }

    return embed;
}

/**
 * Tạo kiểu embed cho lỗi
 * @param {string} errorMessage - Thông báo lỗi
 * @returns {EmbedBuilder} - Discord Embed
 */

export function createErrorEmbed(errorMessage) {
    return new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('Lỗi')
        .setDescription(errorMessage)
        .setTimestamp();
}

/**
 * Tạo kiểu embed cho loading
 * @returns {EmbedBuilder} - Discord Embed
 */

export function createLoadingEmbed() {
    return new EmbedBuilder()
        .setColor('#5865F2')
}

/**
 * Tạo giao diện các nút chức năng
 * @returns {ActionRowBuilder} - Discord Action Row
 */

export function createNavigationButtons() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev_page')
                .setLabel('Trang trước')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️'),
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Trang tiếp theo')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('➡️'),
            new ButtonBuilder()
                .setCustomId('delete_message')
                .setLabel('Xóa tin nhắn')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️'),
        );

        return row;
}

/**
 * Tạo giao diện nút để tải lại câu trả lời
 * @returns {ActionRowBuilder} - Discord Action Row
 */

export function createActionButtons() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('regenerate')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄')
        );

    return row;
}