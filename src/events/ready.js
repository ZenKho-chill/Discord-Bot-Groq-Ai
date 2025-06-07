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

import { Events, ActivityType } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(client) {
    console.log(`Bot đã đăng nhập với tên ${client.user.tag}`);
    client.user.setActivity('Trợ lý AI | /help', { type: ActivityType.Playing });

    console.log(`Bot đang hoạt động trong ${client.guilds.cache.size} máy chủ`);
}