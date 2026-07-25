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

export const attachmentPolicyValidationSchema = yup.object().shape({
  policy_name: yup
    .string()
    .required("Policy name is required")
    .min(3, "Policy name must be at least 3 characters")
    .max(100, "Policy name must not exceed 100 characters"),
  policy_description: yup
    .string()
    .max(500, "Policy description must not exceed 500 characters"),
  domain_name: yup.string(),
  is_active: yup.boolean(),
  has_size_limit: yup.boolean(),
  max_attachment_size_mb: yup
    .number()
    .required("Maximum attachment size is required")
    .positive("Size must be a positive number")
    .integer("Size must be an integer")
    .min(1, "Size must be at least 1 MB")
    .max(100, "Size must not exceed 100 MB"),
});
