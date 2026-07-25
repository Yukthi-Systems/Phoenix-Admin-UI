/*
 * Copyright (C) 2026 Yukthi Systems Private Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * version 3 along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 */

import { generate } from "random-words";

// anti_phishing_secret_code rules: 4-20 chars, spaces count towards this
// length and are allowed - letters/numbers/spaces/underscore/hyphen only.
const DISALLOWED_CHARS_REGEX = /[^A-Za-z0-9_ -]/g;

const randomFallback = (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < length; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
};

export function generateSecretCode(maxLength = 20, minLength = 4) {
    for (let attempt = 0; attempt < 10; attempt++) {
        const words = generate({ exactly: 2, maxLength: 8, join: " " });
        const code = words.replace(DISALLOWED_CHARS_REGEX, "");
        if (code.length >= minLength && code.length <= maxLength) {
            return code;
        }
    }

    return randomFallback(Math.min(Math.max(minLength, 8), maxLength));
}
