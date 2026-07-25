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

import * as Yup from "yup";

export const apiKeyValidationSchema = Yup.object().shape({
  key_name: Yup.string()
    .required("Key Name is required")
    .max(100, "Key Name must not exceed 100 characters"),

  description: Yup.string()
    .optional()
    .max(500, "Description must not exceed 500 characters"),

  custom_details: Yup.array().of(
    Yup.object().shape({
      key: Yup.string()
        .required("Key is required")
        .max(100, "Key must not exceed 100 characters"),

      value: Yup.string()
        .required("Value is required")
        .max(500, "Value must not exceed 500 characters"),
    }),
  ),

  permissions: Yup.array()
    .of(Yup.string().max(100, "Permission must not exceed 100 characters"))
    .optional(),
});
