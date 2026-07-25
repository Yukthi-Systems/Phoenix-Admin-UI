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
export const userEditFormSchema = yup.object().shape({
  user_name: yup.string().required("User name is required"),
  display_name: yup.string().required("Display name is required"),
  user_email: yup
    .string()
    .required("User email is required")
    .email("Invalid email format"),
  primary_phone: yup
    .string()
    .required("Primary phone number is required")
    .matches(
      /^\+\d{1,4}\d{7,15}$/,
      "Enter a valid phone number with country code",
    )
    .test(
      "phone-length",
      "Phone number must be between 8 and 19 digits",
      (value) => {
        if (!value) return false;
        const digitsOnly = value.replace(/\+/g, "");
        return digitsOnly.length >= 8 && digitsOnly.length <= 19;
      },
    ),
  user_details: yup.object().shape({
    first_name: yup.string().required("First Name is required"),
    last_name: yup.string().required("Last Name is required"),
    timezone: yup.string().required("TimeZone is required"),
    other_email: yup
      .string()
      .email("Invalid email format")
      .optional()
      .nullable(),

    locale: yup.string().optional(),
    address: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
    zip_code: yup.string().optional(),
  }),
});
