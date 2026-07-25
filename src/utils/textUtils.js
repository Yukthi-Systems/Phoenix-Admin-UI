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

/**
 * Recursively trims all string values in an object, array, or single string.
 * @param {any} input - The data to sanitize
 * @returns {any} - The sanitized data with whitespace removed from start/end of strings
 */
export const trimInput = (input) => {
    // Handle Strings
    if (typeof input === "string") {
      return input.trim();
    }
  
    // Handle Arrays (recursive)
    if (Array.isArray(input)) {
      return input.map((item) => trimInput(item));
    }
  
    // Handle Objects (recursive)
    if (input !== null && typeof input === "object") {
      return Object.keys(input).reduce((acc, key) => {
        acc[key] = trimInput(input[key]);
        return acc;
      }, {});
    }
  
    // Return primitives (numbers, booleans, null, undefined) as is
    return input;
  };