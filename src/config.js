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

import dotenv from 'dotenv';
import { GatewatIntentBits, Parials } from 'discord.js';

dotenv.config();

export const BOT_CONFIG = {
    token: process.env.DISCORD_TOKEN,
    client: process.env.DISCORD_CLIENT_ID,
};

export const GROQ_CONFIG = {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama3-70b-8192',
    temperature: 0.7,
    maxTokens: 500,
};

export const MONGODB_CONFIG = {
    uri: process.env.MONGODB_URI,
};

export const CLIENT_OPTIONS = {
    intents: [
        GatewatIntentBits.Guilds,
        GatewatIntentBits.GuildMessages,
        GatewatIntentBits.MessageContent,
        GatewatIntentBits.GuildMembers,
    ],
    partials: [
        Parials.Channel,
        Parials.Message,
        Parials.User,
    ],
};