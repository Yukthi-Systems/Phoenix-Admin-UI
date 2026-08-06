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

import * as yup from "yup";

export const cautionFormSchema = yup.object({
  caution_message_name: yup
    .string()
    .required("Caution message name is required")
    .max(100, "Caution message name must not exceed 100 characters")
    .matches(
      /^[a-zA-Z0-9 _-]+$/,
      "Caution message name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),

  html_content: yup
    .string()
    .required("HTML content is required")
    .max(10000, "HTML content must not exceed 10000 characters")
    .test(
      "clean-html",
      "HTML content should not contain html, head, body, script, or style block tags, and must only use inline CSS.",
      (value) => {
        if (!value) return true;
        // Match root/main document structure tags, scripts, style blocks, and link tags
        const rootTagsRegex = /<\/?(html|head|body|title|meta|script|style|link)\b/i;
        return !rootTagsRegex.test(value);
      }
    ),

  text_content: yup
    .string()
    .required("Text content is required")
    .min(100, "Text content must be at least 100 characters")
    .max(5000, "Text content must not exceed 5000 characters"),

  info: yup.object({
    description: yup
      .string()
      .required("Description is required")
      .max(500, "Description must not exceed 500 characters"),

    notes: yup.string().max(500, "Notes must not exceed 500 characters"),

    severity: yup
      .string()
      .required("Severity is required")
      .max(50, "Severity must not exceed 50 characters"),
  }),
});
