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
import {
  NAME_TOKEN_REGEX,
  PLACE_NAME_REGEX,
  ADDRESS_LINE_REGEX,
  POSTAL_CODE_REGEX,
} from "@/utils/validators";

export const organizationFormSchema = yup.object().shape({
  name: yup
    .string()
    .required("Organization name is required")
    .min(2, "Organization name must be at least 2 characters")
    .max(150, "Organization name has maximum 150 characters")
    .matches(
      /^[a-zA-Z0-9 _-]+$/,
      "Organization name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  email_service_enabled: yup
    .boolean()
    .required("Email service status is required"),
  chat_service_enabled: yup
    .boolean()
    .required("Chat service status is required"),
  file_service_enabled: yup
    .boolean()
    .required("File service status is required"),

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
              NAME_TOKEN_REGEX.test(branch.name.trim()) &&
              typeof branch?.address_one === "string" &&
              branch.address_one.trim() !== "" &&
              ADDRESS_LINE_REGEX.test(branch.address_one.trim()) &&
              typeof branch?.city === "string" &&
              branch.city.trim() !== "" &&
              PLACE_NAME_REGEX.test(branch.city.trim()) &&
              typeof branch?.state === "string" &&
              branch.state.trim() !== "" &&
              PLACE_NAME_REGEX.test(branch.state.trim()) &&
              typeof branch?.country === "string" &&
              branch.country.trim() !== "" &&
              typeof branch?.pincode === "string" &&
              branch.pincode.trim() !== "" &&
              POSTAL_CODE_REGEX.test(branch.pincode.trim()),
          );
        },
      ),
    contact_info: yup
      .object()
      .test(
        "all-contacts-have-required-fields",
        "Each contact must have a valid Name, and Phone/Email must be in a valid format",
        function (value) {
          if (!value || typeof value !== "object") return true;

          return Object.values(value).every(
            (contact) =>
              typeof contact?.name === "string" &&
              contact.name.trim() !== "" &&
              PLACE_NAME_REGEX.test(contact.name.trim()) &&
              (!contact.phone ||
                /^\+?\d{1,15}$/.test(contact.phone)) &&
              (!contact.email ||
                (typeof contact.email === "string" &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim()))),
          );
        },
      ),
  }),

  parent_organization_id: yup.string(),
});
