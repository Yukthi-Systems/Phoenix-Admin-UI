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
  primary_phone: Yup.string()
    .required("Phone number is required")
    .matches(
      /^\+[0-9]{10,18}$/,
      "Phone number must start with '+' and contain 10-18 digits",
    ),

  details: Yup.object().shape({
    first_name: Yup.string().required("First Name is required"),
    // address: Yup.string().required("Address is required"),

    description: Yup.string().required("Description is required"),
    secondary_email: Yup.string()
      .required("Secondary email is required")
      .email("Invalid email format"),
  }),
});
