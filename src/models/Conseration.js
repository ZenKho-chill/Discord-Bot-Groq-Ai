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

conversationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

conversationSchema.methods.addMessage = async function (role, content) {
    this.messages.push({
        role,
        content,
        timestamp: new Date(),
    });

    await this.save();
    return this;
};

conversationSchema.methods.updateLastMessageId = async function (messageId) {
    this.lastMessageId = messageId;
    await this.save();
    return this;
};

conversationSchema.methods.getFormattedMessages = function() {
    return this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
};

conversationSchema.methods.clearHistory = async function () {
    this.messages = this.messages.filter(msg => msg.role === 'system');
    await this.save();
    return this;
};

conversationSchema.statics.getorCreateConversation = async function (userId, channelId) {
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
                content: 'Bạn là trợ lý AI hữu ích và tích hợp với Discord. Bạn cung cấp phản hồi ngắn gọn và chính xác.',
            }],
        });
        await conversation.save();
    }

    return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;