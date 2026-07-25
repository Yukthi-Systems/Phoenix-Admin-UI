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

export const organizationFormSchema = yup.object().shape({
  name: yup
    .string()
    .required("Organization name is required")
    .min(2, "Organization name must be at least 2 characters")
    .max(150, "Organization name has maximum 150 characters"),
  email_service_enabled: yup.boolean().required("Email service status is required"),
  chat_service_enabled: yup.boolean().required("Chat service status is required"),
  file_service_enabled: yup.boolean().required("File service status is required"),

  details: yup.object().shape({
    description: yup.string().optional(),
    gst_number: yup.string().optional(),
    website: yup.string().optional().url("Invalid website URL"),

    branches: yup
      .object()
      .test(
        "all-branches-have-required-fields",
        "Each branch must have Name, Address Line One, City, State, Country, and Pincode",
        function (value) {
          if (!value || typeof value !== "object") return false;
          return Object.values(value).every(
            (branch) =>
              typeof branch?.name === "string" &&
              branch.name.trim() !== "" &&
              typeof branch?.address_one === "string" &&
              branch.address_one.trim() !== "" &&
              typeof branch?.city === "string" &&
              branch.city.trim() !== "" &&
              typeof branch?.state === "string" &&
              branch.state.trim() !== "" &&
              typeof branch?.country === "string" &&
              branch.country.trim() !== "" &&
              typeof branch?.pincode === "string" &&
              branch.pincode.trim() !== "",
          );
        },
      ),
    contact_info: yup
      .object()
      .test(
        "contact-phone-validation",
        "Phone numbers must be in international format (e.g., +123456789012)",
        function (value) {
          if (!value || typeof value !== "object") return true;

          return Object.values(value).every(
            (contact) =>
              !contact.phone || // Skip validation if phone is empty
              /^\+?\d{1,15}$/.test(contact.phone), // Validate if phone exists
          );
        },
      ),
  }),

  parent_organization_id: yup.string(),
});
