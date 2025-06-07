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

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Channel from '../models/Channel';

export const data = new SlashCommandBuilder()
    .setName('remove-channel')
    .setDescription('Xóa phản hồi tự động bởi AI khỏi một kênh')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('Kênh để xóa AI khỏi (mặc định là kênh hiện tại)')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
    try {
        await interaction.deferREply();

        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

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

        const isAIChannel = await Channel.isAIChannel(interaction.guild.id, targetChannel.id);

        if (!isAIChannel) {
            return await interaction.editReply({
                content: `❌ <#${targetChannel.id}> không được thiết lập là kênh AI.`,
                ephemeral: true
            });
        }

        const success = await Channel.removeChannel(interaction.guild.id, targetChannel.id);

        if (!success) {
            return await interaction.editReply({
                content: `❌ Không thể xóa AI khỏi <#${targetChannel.id}>.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('Kênh AI đã bị xóa')
            .setDescription(`✅ <#${targetChannel.id}> đã được xóa thành công khỏi danh sách kênh AI`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        if (targetChannel.id !== interaction.channelId) {
            try {
                await targetChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('Kênh AI đã bị vô hiệu hóa')
                            .setDescription(`Chức năng AI của kênh này đã bị xóa bởi <@${interaction.user.id}>`)
                    ]
                });
            } catch (error) {
                console.error('Lỗi khi gửi xác nhận tới kênh mục tiêu:', error);
            }
        }
    } catch (error) {
        console.error('Lỗi trong lệnh remove-channel:', error);

        await interaction.editReply({
            content: `❌ Không thể xóa kênh AI: ${error.message}`,
            ephemeral: true
        });
    }
}