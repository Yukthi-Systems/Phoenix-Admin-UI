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

export const userFormSchema = yup.object().shape({
  user_name: yup
    .string()
    .required("User name is required")
    .max(30, "User name must not exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Only letters, numbers, underscores, dots, and hyphens are allowed",
    ),

  activate: yup.boolean().required("Status is required"),

  display_name: yup
    .string()
    .required("Display name is required")
    .max(50, "Display name must not exceed 50 characters")
    .matches(/^[a-zA-Z. ]+$/, "Only letters are allowed"),

  user_email: yup
    .string()
    .required("User email is required")
    .max(254, "Email must not exceed 254 characters")
    .email("Invalid email format"),

  primary_phone_number_with_country_code: yup
    .string()
    .required("Primary phone number is required")
    .max(16, "Phone number must not exceed 16 characters")
    .matches(/^\+\d{12,15}$/, "Enter a valid phone number with country code"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
      "Password must contain letters, numbers, and at least one symbol",
    ),

  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .max(64, "Confirm password must not exceed 64 characters")
    .required("Confirm password is required"),

  user_details: yup.object().shape({
    first_name: yup
      .string()
      .required("First Name is required")
      .max(50, "First name must not exceed 50 characters"),

    last_name: yup
      .string()
      .required("Last Name is required")
      .max(50, "Last name must not exceed 50 characters"),

    timezone: yup
      .string()
      .required("TimeZone is required")
      .max(50, "Time zone must not exceed 50 characters"),
  }),
});
