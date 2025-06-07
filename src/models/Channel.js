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

import mongoose from 'mongoose';

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
        }
    }
});

channelSchema.index({ guildId: 1, channelId: 1 }, { unique: true });

channelSchema.statics.findOrCreateChannel = async function (guildId, channelId, userId) {
    try {
        let channel = await this.fineOne({ guildId, channelId });

        if (!channel) {
            channel = new this({
                guildId,
                channelId,
                createBy: userId,
            });
            await channel.save();
        }

        return channel;
    } catch (error) {
        console.error('Lỗi ở findOrCreateChannel:', error);
        throw error;
    }
};

channelSchema.statics.removeChannel = async function (guildId, channelId) {
    try {
        const result = await this.deleteOne({ guildId, channelId });
        return result.deleteCount > 0;
    } catch (error) {
        console.error('Lỗi ở removeChannel:', error);
        throw error;
    }
};

channelSchema.statics.getGuildchannels = async function (guildId) {
    try {
        return await this.find({ guildId });
    } catch (error) {
        console.error('Lỗi ở getGuildChannels:', error);
        throw error;
    }
};

channelSchema.statics.isAIChannel = async function (guildId, channelId) {
    try {
        const channel = await this.fineOne({ guildId, channelId });
        return !!channel;
    } catch (error) {
        console.error('Lỗi ở isAIChannel:', error);
        return false;
    }
};

channelSchema.methods.updateSettings = async function (newSettings) {
    if (newSettings.aiModel) this.settings.aiModel = newSettings.aiModel;
    if (newSettings.systemPrompt) this.settings.systemPrompt = newSettings.systemPrompt;

    await this.save;
    return this;
};

const Channel = mongoose.model('AIChannel', channelSchema);

export default Channel;