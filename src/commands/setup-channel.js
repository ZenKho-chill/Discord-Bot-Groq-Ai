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
    .setName('setup-channel')
    .setDescription('Cấu hình một kênh để tương tác với AI')
    .addChannelOption(option => 
        option.setName('channel')
            .setDescription('Kênh để cấu hình cho AI(mặc định là kênh hiện tai)')
            .setRequired(false)
            .addChannelType(ChannelType.GuilText))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Chọn mô hình Ai để sử dụng trong kênh này')
                .setRequired(false)
                .addChoices(
                    { name: 'Llama-3 70B (Mặc định)', value: 'llama3-70b-8192' },
                    { name: 'Llama-3 8B (Nhanh hơn)', value: 'llama3-8b-8192' },
                    { name: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
        const model = interaction.options.getString('model');

        const member = interaction.member;
        const channel = interaction.guild.channels.cache.get(targetChannel.id);

        if (!channel) {
            return await interaction.editReply({
                content: '❌ Không tìm thấy kênh đã chỉ định',
                ephemeral: true
            });
        }

        const settings = {};
        if (model) settings.aiModel = model;

        const aiChannel = await Channel.findOrCreateChannel(
            interaction.guild.id,
            targetChannel.id,
            interaction.user.id
        );

        if (Object.keys(settings).length > 0) {
            await aiChannel.updateSettings(settings);
        }

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Cấu hình kênh AI')
            .setDescription(`✅ <#${targetChannel.id}> đã được cấu hình thành công`)
            .addFields(
                { name: 'Mô hình AI', value: aiChannel.settings.aiModel, inline: true },
                { name: 'Cách sử dụng', value: 'Bot sẽ tự động phản hồi tất cả các tin nhắn trong kênh này', inline: true },
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        if (targetChannel.id !== interaction.channelId) {
            try {
                await targetChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#5865F2')
                            .setTitle('Kênh Ai đẫ được kích hoạt')
                            .setDescription(`Kênh này đã được cấu hình để tương tác với AI bởi <@${interaction.user.id}>.\n\nAI sẽ tự động phản hồi các tin nhắn trong kênh này.`)
                    ]
                });
            } catch (error) {
                console.error('Lỗi khi gửi thông báo đến kênh mục tiêu:', error);
            }
        }
    } catch (error) {
        console.error('Lỗi trong lệnh setup-channel:', error);

        await interaction.editReply({
            content: `❌ Không thể cấu hình kênh AI: ${error.message}`,
            ephemeral: true
        });
    }
}