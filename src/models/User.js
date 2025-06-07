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

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type:String,
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
    createAt: {
        type: Date,
        default: Date.now,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', function(next) {
    this.lastActive = Date.now();
    next();
});

userSchema.statics.findOrCreate = async function (userId, username) {
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

userSchema.methods.updateSettings = async function (newSettings) {
    if (newSettings.aiModel) this.settings.aiModel = newSettings.aiModel;
    if (newSettings.temperature !== undefined) this.settings.temperature = newSettings.temperature;
    if (newSettings.maxTokens !== undefined) this.settings.maxTokens = newSettings.maxTokens;
    if (newSettings.saveHistory !== undefined) this.settings.saveHistory = newSettings.saveHistory;

    await this.save();
    return this;
};

const User = mongoose.model('User', userSchema);

export default User;