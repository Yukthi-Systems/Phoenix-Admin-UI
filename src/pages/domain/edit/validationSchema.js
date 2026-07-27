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

// Updated validationSchema.js for Edit Domain

import * as yup from "yup";

const hybridConnectorPropertiesSchema = yup.object({
  description: yup.string().required("Description is required"),
  fqdn: yup.string().test(
    "fqdn-or-ipv4",
    "Either FQDN or IPv4 is required",
    function (value) {
      return !!(value || this.parent.ipv4);
    },
  ),
  ipv4: yup
    .string()
    .test(
      "fqdn-or-ipv4",
      "Either FQDN or IPv4 is required",
      function (value) {
        return !!(value || this.parent.fqdn);
      },
    )
    .matches(
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/,
      { message: "Invalid IPv4 address", excludeEmptyString: true },
    ),
  ipv6: yup
    .string()
    .nullable()
    .notRequired()
    .test("is-ipv6", "Invalid IPv6 address", function (value) {
      if (!value) return true;
      const ipv6Regex =
        /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|([0-9a-fA-F]{1,4}::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}))$/;
      return ipv6Regex.test(value);
    }),
  port: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Port is required"),
});

export const domainFormSchema = yup.object().shape({
  domain_name: yup
    .string()
    .required("Domain name is required")
    .max(254, "Domain name must not exceed 254 characters")
    .matches(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/,
      "Invalid domain name",
    ),

  details: yup.object().shape({
    address: yup
      .string()
      .nullable()
      .transform((curr, orig) => (orig === "" ? null : curr)),
    description: yup
      .string()
      .nullable()
      .transform((curr, orig) => (orig === "" ? null : curr))
      .max(500, "Description must not exceed 500 characters"),
  }),

  anti_phishing_secret_code: yup
    .string()
    .required("Anti-phishing secret code is required")
    .min(4, "Must be at least 4 characters (spaces count)")
    .max(20, "Must not exceed 20 characters (spaces count)")
    .matches(
      /^[A-Za-z0-9_ -]+$/,
      "Only letters, numbers, spaces, underscores (_) and hyphens (-) are allowed",
    )
    .test(
      "not-only-spaces",
      "Cannot be made up of just spaces",
      (value) => !!value && value.trim().length > 0,
    )
    .test(
      "no-leading-trailing-space",
      "Cannot start or end with a space",
      (value) => value === value?.trim(),
    ),



  // Updated password age validation - keep at root level for form functionality
  enable_max_password_age: yup.boolean().required(),
  session_timeout: yup
    .number()
    .min(30, "Minimum session timeout is 30 minutes")
    .max(720, "Maximum session timeout is 720 minutes (12 hours)")
    .required("Session timeout is required"),
  max_password_age: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .when("enable_max_password_age", {
      is: true,
      then: (schema) =>
        schema
          .required("Max password age is required")
          .min(3, "Minimum password age is 3 days")
          .max(365, "Maximum password age is 365 days"),
      otherwise: (schema) =>
        schema.transform(() => 0).oneOf([0], "Must be 0 when disabled"),
    }),

  notify_1: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .when("enable_max_password_age", {
      is: true,
      then: (schema) =>
        schema
          .required("Notify 1 is required")
          .min(2, "Minimum notification period is 2 days")
          .test(
            "less-than-max-age",
            "Must be less than max password age",
            function (value) {
              const maxAge = this.parent.max_password_age;
              return !maxAge || value < maxAge;
            },
          )
          .test(
            "unique-notification",
            "Notification periods must be unique",
            function (value) {
              const { notify_2, notify_3 } = this.parent;
              if (
                (notify_2 && value === notify_2) ||
                (notify_3 && value === notify_3)
              ) {
                return this.createError({
                  message: "Notification periods must be unique",
                  path: "notify_1",
                });
              }
              return true;
            },
          ),
      otherwise: (schema) => schema.transform(() => undefined).nullable(),
    }),

  notify_2: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .when("enable_max_password_age", {
      is: true,
      then: (schema) =>
        schema
          .required("Notify 2 is required")
          .min(2, "Minimum notification period is 2 days")
          .test(
            "less-than-max-age",
            "Must be less than max password age",
            function (value) {
              const maxAge = this.parent.max_password_age;
              return !maxAge || value < maxAge;
            },
          )
          .test(
            "unique-notification",
            "Notification periods must be unique",
            function (value) {
              const { notify_1, notify_3 } = this.parent;
              if (
                (notify_1 && value === notify_1) ||
                (notify_3 && value === notify_3)
              ) {
                return this.createError({
                  message: "Notification periods must be unique",
                  path: "notify_2",
                });
              }
              return true;
            },
          ),
      otherwise: (schema) => schema.transform(() => undefined).nullable(),
    }),

  notify_3: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .when("enable_max_password_age", {
      is: true,
      then: (schema) =>
        schema
          .required("Notify 3 is required")
          .min(2, "Minimum notification period is 2 days")
          .test(
            "less-than-max-age",
            "Must be less than max password age",
            function (value) {
              const maxAge = this.parent.max_password_age;
              return !maxAge || value < maxAge;
            },
          )
          .test(
            "unique-notification",
            "Notification periods must be unique",
            function (value) {
              const { notify_1, notify_2 } = this.parent;
              if (
                (notify_1 && value === notify_1) ||
                (notify_2 && value === notify_2)
              ) {
                return this.createError({
                  message: "Notification periods must be unique",
                  path: "notify_3",
                });
              }
              return true;
            },
          ),
      otherwise: (schema) => schema.transform(() => undefined).nullable(),
    }),

  spam_destination: yup
    .string()
    .required("Spam destination is required")
    .oneOf(["FOLDER", "INBOX", "TRASH", "DELETE", "SEND_DIGEST", "SPAM"], "Invalid spam destination"),

  // delete_spam: yup.boolean().required(),

  enable_catch_all: yup.boolean().required(),

  catch_all_forwarding_address: yup
    .string()
    .nullable()
    .when("enable_catch_all", {
      is: true,
      then: (schema) =>
        schema.required("Email is required").email("Invalid email"),
      otherwise: (schema) =>
        schema
          .transform(() => null)
          .oneOf([null], "Must be null when catch all is disabled"),
    }),

  enable_hybrid_mode: yup
    .boolean()
    .required()
    .test(
      "not-with-catch-all",
      "Hybrid Mode and Catch All cannot both be enabled for the same domain",
      function (value) {
        return !(value && this.parent.enable_catch_all);
      },
    ),
  hybrid_connector_properties: yup
    .mixed()
    .nullable()
    .when("enable_hybrid_mode", {
      is: true,
      then: () =>
        hybridConnectorPropertiesSchema.required(
          "Hybrid connector properties are required",
        ),
      otherwise: () =>
        yup
          .mixed()
          .nullable()
          .transform(() => null)
          .oneOf([null]),
    }),

  spam_destination_properties: yup.object().shape({
    description: yup
      .string()
      // .required("Spam destination description is required")
      .max(500, "Description must not exceed 500 characters"),

    folder_name: yup
      .string()
      .test(
        "folder-required-if-folder",
        "Folder name is required if destination is 'Folder'",
        function (value) {
          const root = this.from?.[1]?.value;
          const spam_destination = root?.spam_destination;
          if (
            spam_destination === "Folder" &&
            (!value || value.trim() === "")
          ) {
            return this.createError({
              message: "Folder name is required if destination is 'Folder'",
              path: `${this.path}`,
            });
          }
          return true;
        },
      )
      .nullable(),
  }),
});
