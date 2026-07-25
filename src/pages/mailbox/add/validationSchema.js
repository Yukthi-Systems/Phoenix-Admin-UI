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

export const mailboxFormSchema = Yup.object().shape({
  enabled: Yup.boolean().required(),

  allocate_quota: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Allocate space is required")
    .min(0.1, "Minimum allocation is 0.1 GB (100 MB)")
    .test(
      "precision",
      "Maximum precision is 0.01 GB (10 MB)",
      function (value) {
        if (value === undefined || value === null) return true;
        const decimal = value.toString().split(".")[1];
        return !decimal || decimal.length <= 2;
      },
    ),

  email_identity: Yup.string()
    .required("Email identity is required")
    .email("Invalid email format"),
});

