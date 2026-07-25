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

// src/pages/server/mailboxSync/add/validationSchema.js
import * as yup from "yup";

export const imapSyncValidationSchema = yup.object().shape({
  // Required Fields
  imap_server: yup
    .string()
    .required("IMAP Server is required")
    .matches(/\./, "IMAP Server must contains a dot (e.g. imap.example.com)"), // Validation for dot
  imap_username: yup.string().required("IMAP Username is required"),
  imap_password: yup.string().required("IMAP Password is required"),
  to_email_prefix: yup
    .string()
    .required("Destination email prefix is required")
    .matches(/^[a-zA-Z0-9._-]+$/, "Invalid characters in email prefix"),
  to_email_domain: yup.string().required("Domain is required"),

  // Optional Advanced Settings
  imap_port: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    )
    .nullable()
    .notRequired()
    .positive()
    .integer()
    .max(65535, "Port number cannot exceed 65535"), // Validation for Max Port

  sync_specific_folder: yup.string().nullable().notRequired(),

  date_range: yup
    .object()
    .shape({
      startDate: yup.date().nullable().notRequired(),
      endDate: yup
        .date()
        .nullable()
        .notRequired()
        .when("startDate", ([startDate], schema) => {
          return startDate
            ? schema.min(startDate, "End date must be after start date")
            : schema;
        }),
    })
    .nullable()
    .notRequired(),
});