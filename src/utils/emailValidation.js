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


export const EMAIL_DOTS_MESSAGE =
  "Email can't start or end with a dot, or have two dots in a row";

/** True unless the part before @ has a leading, trailing or doubled dot. */
export const hasValidEmailDots = (value) => {
  if (!value) return true; // leave empty values to .required()
  const at = String(value).lastIndexOf("@");
  const local = at === -1 ? String(value) : String(value).slice(0, at);
  return (
    !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
  );
};

/** Yup test args: `yup.string().email().test(...emailDotsTest)` */
export const emailDotsTest = [
  "email-dots",
  EMAIL_DOTS_MESSAGE,
  hasValidEmailDots,
];
