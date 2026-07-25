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

export const serverFormSchema = yup.object().shape({
  host_name: yup
    .string()
    .required("Host name is required")
    .max(255, "Host name must not exceed 255 characters")
    .matches(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/,
      "Enter a valid hostname",
    ),

  is_active: yup.boolean().required("Status is required"),
  is_monitoring: yup.boolean().required("Monitoring status is required"),
  is_mailbox_server: yup.boolean().required("Mailbox server status is required"),
  is_accepting_new_mailboxes: yup
    .boolean()
    .required("Accepting new mailboxes status is required"),

  quota_allocated: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Quota is required")
    .min(10, "Minimum allocation is 10 GB ")
    .test(
      "precision",
      "Maximum precision is 0.01 GB (10 MB)",
      function (value) {
        if (value === undefined || value === null) return true;
        const decimal = value.toString().split(".")[1];
        return !decimal || decimal.length <= 2;
      },
    ),

  server_info: yup.object().shape({
    description: yup
      .string()
      .required("Description is required")
      .max(500, "Description must not exceed 500 characters"),

    ipv4: yup
      .string()
      .required("IPv4 is required")
      .max(15, "IPv4 must not exceed 15 characters")
      .matches(
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
        "Enter a valid IPv4 address",
      ),

    ipv6: yup
      .string()
      .transform((value) => (!value ? undefined : value))
      .notRequired()
      .max(45, "IPv6 must not exceed 45 characters"),

    location: yup
      .string()
      .required("Location is required")
      .max(100, "Location must not exceed 100 characters"),

    os: yup
      .string()
      .required("Operating system info is required")
      .max(100, "Operating system info must not exceed 100 characters"),
  }),

  smtp_port: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("SMTP port is required")
    .min(1, "Invalid SMTP port")
    .max(65535, "Invalid SMTP port"),

  storage_path: yup
    .string()
    .required("Storage path is required")
    .max(4096, "Storage path must not exceed 4096 characters")
    .matches(/^\/.*/, "Storage path must be an absolute path"),
});
