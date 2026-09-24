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

// Single token (e.g. branch name): letters, numbers, hyphen, underscore. No spaces or symbols.
export const NAME_TOKEN_REGEX = /^[A-Za-z0-9_-]+$/;

// Proper-noun style names (city, state, person name): must start with a letter,
// then letters/spaces/apostrophe/hyphen/period only.
export const PLACE_NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

// Street address: must start with a letter or digit, then common address punctuation.
export const ADDRESS_LINE_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s,./#'-]*$/;

// Postal / zip code: alphanumeric, optionally with spaces or hyphens.
export const POSTAL_CODE_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s-]*$/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
