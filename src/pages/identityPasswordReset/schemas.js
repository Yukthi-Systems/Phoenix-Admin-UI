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
import { emailDotsTest } from "@/utils/emailValidation";

// The backend only enforces a breach check, so the strength rules live here.
// Kept identical to the existing identity reset flow's rules. Checked in this
// order; only the first unmet rule is shown under the field.
const PASSWORD_RULES = [
  {
    name: "length",
    test: (v) => v.length >= 8,
    message: "Use at least 8 characters",
  },
  {
    name: "upper",
    test: (v) => /[A-Z]/.test(v),
    message: "Add an uppercase letter",
  },
  {
    name: "lower",
    test: (v) => /[a-z]/.test(v),
    message: "Add a lowercase letter",
  },
  { name: "number", test: (v) => /[0-9]/.test(v), message: "Add a number" },
  {
    name: "special",
    test: (v) => /[@$!%*?&#]/.test(v),
    message: "Add a special character (@$!%*?&#)",
  },
];

const email = yup
  .string()
  .trim()
  .required("Email address is required")
  .email("Enter a valid email address")
  .test(...emailDotsTest);

const newPassword = PASSWORD_RULES.reduce(
  (schema, rule) =>
    schema.test(rule.name, rule.message, (value = "") => rule.test(value)),
  yup.string().required("New password is required"),
);

const confirmPassword = yup
  .string()
  .required("Please confirm your new password")
  .oneOf([yup.ref("new_password")], "Passwords don't match");

export const currentPasswordSchema = yup.object({
  email,
  current_password: yup.string().required("Existing password is required"),
  new_password: newPassword.notOneOf(
    [yup.ref("current_password")],
    "New password must be different from the existing one",
  ),
  confirm_password: confirmPassword,
});

export const requestLinkSchema = yup.object({ email });

// Used to check the `email` query param on the reset-link landing page
export const isValidEmail = (value) => email.isValidSync(value);

// The email comes from the link itself, so only the passwords are entered
export const completeLinkSchema = yup.object({
  new_password: newPassword,
  confirm_password: confirmPassword,
});
