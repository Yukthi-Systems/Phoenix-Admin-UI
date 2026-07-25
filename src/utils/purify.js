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

// src/utils/sanitization.js

/**
 * Remove all script-related tags from input
 * @param {string} value - The input value to sanitize
 * @returns {string} - Sanitized value
 */
export const sanitizeInput = (value) => {
  if (typeof value !== "string") return value;

  let sanitized = value;

  // Remove complete script tags: <script>...</script>
  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

  // Remove opening script tags: <script>, <script type="...">, etc.
  sanitized = sanitized.replace(/<script[^>]*>/gi, "");

  // Remove closing script tags: </script>
  sanitized = sanitized.replace(/<\/script>/gi, "");

  // Remove self-closing script tags: <script/>, <script />
  sanitized = sanitized.replace(/<script[^>]*\/>/gi, "");

  // Remove partial script tags: <script, <scrip, <scri, <scr, <sc
  sanitized = sanitized.replace(/<\s*script[^>]*/gi, "");
  sanitized = sanitized.replace(/<\s*scrip[^>]*/gi, "");

  return sanitized;
};
