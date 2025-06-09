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

import { Events } from 'discord.js';
import User from '../models/User.js';

export const name = Events.InteractionCreate;
export const once = false;

async function handleModelSelection(interaction) {
    try {
        await interaction.deferUpdate();

        const userId = interaction.user.id;
        const selectedModel = interaction.values[0];

        const user = await User.findOne({ userId });
        if (user) {
            await user.updateSettings({ aiModel: selectedModel });

            await interaction.followUp({
                content: `Mô hình đã được cập nhật thành ${selectedModel}`,
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý lựa chọn mô hình:', error);
        await interaction.followUp({
            content: 'Không thể cập nhật cài đặt mô hình',
            ephemeral: true,
        });
    }
}

async function handleTemperatureSelection(interaction) {
    try {
        await interaction.deferUpdate();

        const userId = interaction.user.id;
        const selectedTemperature = parseFloat(interaction.values[0]);

        const user = await User.findOne({ userId });
        if (user) {
            await user.updateSettings({ temperature: selectedTemperature });

            await interaction.followUp({
                content: `Độ "chơi" đã được cập nhật thành ${selectedTemperature}`,
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý lựa chọn độ "chơi":', error);
        await interaction.followUp({
            content: 'Không thể cập nhật cài đặt độ "chơi"',
            ephemeral: true,
        });
    }
}

export async function execute(interaction) {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Không tìm thấy lệnh ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Lỗi khi thực thi lệnh ${interaction.commandName}`);
            console.error(error);

            const response = {
                content: 'Đã có lỗi xảy ra khi thực thi lệnh này',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    }

    else if (interaction.isButton()) {
        const [customId] = interaction.customId.split(':');
        const button = interaction.client.buttons.get(customId);

        if (!button) {
            console.error(`Không tìm thấy xử lý nút cho ${customId}`)
            return;
        }

        try {
            await button.execute(interaction);
        } catch (error) {
            console.error(`Lỗi khi thực thi nút ${customId}`);
            console.error(error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Đã có lỗi xảy ra khi thực thi nút này', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Đã có lỗi xảy ra khi thực thi nút này', ephemeral: true });
            }
        }
    }

    else if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;

        if (customId === 'select_model') {
            handleModelSelection(interaction);
        } else if (customId === 'select_temperature') {
            handleTemperatureSelection(interaction);
        }
    }
}