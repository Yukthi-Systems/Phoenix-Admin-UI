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
  activate: yup.boolean().required("Status is required"),

  allocated_quota: yup
    .number()
    .typeError("Allocated quota must be a number")
    .positive("Allocated quota must be positive")
    .required("Allocated quota is required")
    .min(1, "Allocated quota must be at least 1 GB")
    .test(
      "max-quota",
      "Allocated quota exceeds available parent organization quota . Refresh the page after updating parent organization details.",
      function (value) {
        const { parentOrg } = this.options.context || {};
        const maxQuota = parentOrg?.size || 10000000;
        return value <= maxQuota;
      },
    ),
  allocated_email_identities: yup
    .number()
    .typeError("Allocated email identities must be a number")
    .integer("Allocated email identities must be a whole number")
    .required("Allocated email identities is required")
    .test(
      "valid-identities-value",
      "Value must be -1 (unlimited) or at least 1",
      (value) => value === -1 || value >= 1,
    )
    .test(
      "unlimited-requires-parent-unlimited",
      "Cannot allocate unlimited email identities because the parent organization does not have unlimited email identities",
      function (value) {
        if (value !== -1) return true;
        const { parentOrg } = this.options.context || {};
        return parentOrg?.identitiesAllocated === -1;
      },
    )
    .test(
      "max-identities",
      "Allocated email identities exceeds available parent organization identities. Refresh the page after updating parent organization details.",
      function (value) {
        if (value === -1) return true;
        const { parentOrg } = this.options.context || {};
        if (parentOrg?.identitiesAllocated === -1) return true;
        const maxIdentities =
          parentOrg?.identitiesAllocated != null
            ? Math.max(
                0,
                Number(parentOrg.identitiesAllocated) -
                  Number(parentOrg.identitiesUtilized || 0),
              )
            : 1000000;
        return value <= maxIdentities;
      },
    ),

  email_service_enabled: yup.boolean().required("Email service status is required"),
  chat_service_enabled: yup.boolean().required("Chat service status is required"),
  file_service_enabled: yup.boolean().required("File service status is required"),

  name: yup
    .string()
    .required("Organization name is required")
    .min(2, "Organization name must be at least 2 characters")
    .max(250, "Organization name has maximum 250 characters")
    .matches(
      /^[a-zA-Z0-9 _-]+$/,
      "Organization name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),

  details: yup.object().shape({
    type: yup
      .string()
      .required("Organization type is required")
      .max(50, "Organization type must not exceed 50 characters"),

    description: yup
      .string()
      .optional()
      .max(500, "Description must not exceed 500 characters"),

    gst_number: yup
      .string()
      .optional()
      .max(50, "GST number must not exceed 50 characters"),

    website: yup
      .string()
      .optional()
      .url("Invalid website URL")
      .max(2048, "Website URL must not exceed 2048 characters"),

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
              branch.name.length <= 100 &&
              typeof branch?.address_one === "string" &&
              branch.address_one.trim() !== "" &&
              branch.address_one.length <= 200 &&
              typeof branch?.city === "string" &&
              branch.city.trim() !== "" &&
              branch.city.length <= 100 &&
              /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(branch.city) &&
              typeof branch?.state === "string" &&
              branch.state.trim() !== "" &&
              branch.state.length <= 100 &&
              /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(branch.state) &&
              typeof branch?.country === "string" &&
              branch.country.trim() !== "" &&
              branch.country.length <= 100 &&
              typeof branch?.pincode === "string" &&
              branch.pincode.trim() !== "" &&
              branch.pincode.length <= 20,
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
              !contact.phone ||
              (typeof contact.phone === "string" &&
                contact.phone.length <= 20 &&
                /^\+?\d{1,15}$/.test(contact.phone)),
          );
        },
      ),
  }),

  parent_organization_id: yup
    .string()
    .required("Please select organization")
   
});
