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

export const templateFormSchema = yup.object().shape({
  template_name: yup
    .string()
    .required("Permission Template Name is Required")
    .max(100, "Permission Template Name must not exceed 100 characters")
    .matches(
      /^[a-zA-Z0-9_.-][a-zA-Z0-9_.\- ]*$/,
      "Only letters, numbers, spaces, underscores, dots, and hyphens are allowed, and it cannot start with a space",
    ),
});
