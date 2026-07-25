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

export const loginFormSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .max(100, "Username must be at most 100 characters")
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Only letters, numbers, underscores, dots, and hyphens are allowed",
    ),
  password: yup
    .string()
    .required("Password is required")
    .max(100, "Password must be at most 100 characters"),
});
