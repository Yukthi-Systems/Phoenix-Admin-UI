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

import { ALLOWED_EXTENSIONS, GLOBAL_BLOCKED } from "./blockedFileTypes";
import { generateSecretCode } from "@/utils/secretCode";

// Backend IDs (policy/department/organization/etc.) are UUIDs of any RFC 4122
// version - e.g. "530b2473-b224-5f54-9185-89189ee72df8" is a v5 UUID, not v4 -
// so this intentionally accepts any version/variant nibble, not just v4.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validator factory for optional foreign-key ID columns (policy IDs,
 * department ID, etc.): empty values pass through untouched (field is
 * optional), non-empty values must be a well-formed UUID so a typo'd or
 * copy-pasted-wrong ID fails fast in the import preview instead of being
 * silently sent to the backend.
 */
const validateOptionalUUID = (fieldLabel) => (value) => {
  if (!value) return value;
  const trimmed = String(value).trim();
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`${fieldLabel} must be a valid ID (UUID)`);
  }
  return trimmed;
};

export const IMPORT_FIELD_MAPPINGS = {
  cautions: [
    {
      key: "caution_id",
      header: "Caution ID",
      csvHeader: "Caution ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Caution ID"),
    },
    {
      key: "caution_message_name",
      header: "Caution Name",
      csvHeader: "Caution Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "Important Security Notice",
      sampleValue2: "Data Privacy Alert",
    },
    {
      key: "html_content",
      header: "HTML Content",
      csvHeader: "HTML Content",
      type: "string",
      required: true,
      width: 40,
      sampleValue:
        "<p>This is an important <strong>security notice</strong>.</p>",
      sampleValue2: "<p>Please review our updated <em>privacy policy</em>.</p>",
    },
    {
      key: "text_content",
      header: "Text Content",
      csvHeader: "Text Content",
      type: "string",
      required: true,
      width: 40,
      sampleValue: "This is an important security notice.",
      sampleValue2: "Please review our updated privacy policy.",
    },
    {
      key: "info.description",
      header: "Description",
      csvHeader: "Description",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "Critical security update notification",
      sampleValue2: "Privacy policy update notification",
    },
    {
      key: "info.severity",
      header: "Severity",
      csvHeader: "Severity",
      type: "select",
      required: false,
      width: 12,
      defaultValue: "Medium",
      options: [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
      ],
      sampleValue: "High",
      sampleValue2: "Medium",
    },
    {
      key: "info.notes",
      header: "Notes",
      csvHeader: "Notes",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "Requires immediate user attention",
      sampleValue2: "Optional update for users",
    },
  ],

  disclaimers: [
    {
      key: "disclaimer_id",
      header: "Disclaimer ID",
      csvHeader: "Disclaimer ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Disclaimer ID"),
    },
    {
      key: "disclaimer_name",
      header: "Disclaimer Name",
      csvHeader: "Disclaimer Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "Terms and Conditions",
      sampleValue2: "Privacy Policy Disclaimer",
    },
    {
      key: "html_content",
      header: "HTML Content",
      csvHeader: "HTML Content",
      type: "string",
      required: true,
      width: 40,
      sampleValue: "<p>This is our <strong>terms and conditions</strong>.</p>",
      sampleValue2: "<p>Privacy policy <em>content</em> here.</p>",
    },
    {
      key: "text_content",
      header: "Text Content",
      csvHeader: "Text Content",
      type: "string",
      required: true,
      width: 40,
      sampleValue: "This is our terms and conditions.",
      sampleValue2: "Privacy policy content here.",
    },
    {
      key: "activate",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "details.description",
      header: "Description",
      csvHeader: "Description",
      type: "string",
      required: false,
      // Backend's CreateDisclaimerForm.details is a required (non-Optional)
      // dict - the "details" key must always be sent, even as "", or the
      // request 422s with "Field required" on "details" itself (not on a
      // sub-field), since with both description and address empty the
      // whole nested object was never being created at all.
      alwaysSend: true,
      width: 30,
      sampleValue: "Legal terms and conditions document",
      sampleValue2: "Privacy policy document",
    },
    {
      key: "details.address",
      header: "Address",
      csvHeader: "Address",
      type: "string",
      required: false,
      alwaysSend: true,
      width: 30,
      sampleValue: "123 Company Street, City, State",
      sampleValue2: "456 Business Ave, Town, State",
    },
  ],

  departments: [
    {
      key: "department_id",
      header: "Department ID",
      csvHeader: "Department ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Department ID"),
    },
    {
      key: "department_name",
      header: "Department Name",
      csvHeader: "Department Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "Information Technology",
      sampleValue2: "Human Resources",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Department name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Department name must not exceed 100 characters");
        }
        if (!/^[a-zA-Z0-9\s\-_.&()]+$/.test(value)) {
          throw new Error(
            "Department name can only contain letters, numbers, spaces, and common punctuation",
          );
        }
        return value;
      },
    },
    {
      key: "department_details.description",
      header: "Description",
      csvHeader: "Description",
      type: "string",
      required: false,
      width: 40,
      sampleValue: "Manages all IT infrastructure and support",
      sampleValue2: "Handles employee relations and policies",
    },
    {
      key: "department_details.address",
      header: "Address",
      csvHeader: "Address",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "Floor 3, IT Wing, Main Building",
      sampleValue2: "Floor 2, HR Department, Main Building",
    },
    {
      key: "department_details.notes",
      header: "Notes",
      csvHeader: "Notes",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "Contact for technical support",
      sampleValue2: "Available for employee queries",
    },

    {
      key: "department_details.authorized_persons",
      header: "Authorized Persons",
      csvHeader: "Authorized Persons",
      type: "array",
      required: false,
      width: 50,
      sampleValue:
        "John Doe <john.doe@company.com> [+1234567890]; Jane Smith <jane.smith@company.com> [+0987654321]",
      sampleValue2: "Bob Wilson <bob.wilson@company.com> [+1122334455]",
      transform: (value) => {
        if (!value || value.trim() === "") return [];

        const personStrings = value
          .split(";")
          .map((person) => person.trim())
          .filter((person) => person.length > 0);

        return personStrings.map((personString) => {
          const person = { name: "", email: "", phone: "" };

          const emailMatch = personString.match(/<([^>]+)>/);
          const phoneMatch = personString.match(/\[([^\]]+)\]/);

          if (emailMatch) {
            person.email = emailMatch[1].trim();
            personString = personString.replace(/<[^>]+>/, "").trim();
          }

          if (phoneMatch) {
            person.phone = phoneMatch[1].trim();
            personString = personString.replace(/\[[^\]]+\]/, "").trim();
          }
          person.name = personString.trim();

          return person;
        });
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^\+?\d{10,15}$/;

          value.forEach((person, index) => {
            if (person.email && !emailRegex.test(person.email)) {
              throw new Error(
                `Invalid email format for person ${index + 1}: ${person.email}`,
              );
            }
            if (
              person.phone &&
              !phoneRegex.test(person.phone.replace(/[\s\-\(\)]/g, ""))
            ) {
              throw new Error(
                `Invalid phone format for person ${index + 1}: ${person.phone}`,
              );
            }
          });
        }
        return value;
      },
    },
  ],

  domains: [
    {
      key: "domain_name",
      header: "Domain Name",
      csvHeader: "Domain Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(value)) {
          throw new Error("Invalid domain name");
        }
        return value;
      },
    },
    {
      key: "activate",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: true,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "session_timeout",
      header: "Session Timeout (Minutes)",
      csvHeader: "Session Timeout (Minutes)",
      type: "select",
      required: true,
      width: 20,
      defaultValue: 720,
      options: [
        { value: 30, label: "30 minutes" },
        { value: 60, label: "1 hour" },
        { value: 120, label: "2 hours" },
        { value: 180, label: "3 hours" },
        { value: 240, label: "4 hours" },
        { value: 360, label: "6 hours" },
        { value: 480, label: "8 hours" },
        { value: 720, label: "12 hours" },
      ],
      sampleValue: 720,
      sampleValue2: 480,
      transform: (value) => {
        const num = Number(value);
        if (isNaN(num)) return 720; // default to 12 hours

        // Validate range (30 to 720 minutes)
        if (num < 30 || num > 720) {
          throw new Error("Session timeout must be between 30 and 720 minutes");
        }

        return num;
      },
    },
    {
      key: "anti_phishing_secret_code",
      header: "Anti-Phishing Secret Code",
      csvHeader: "Anti-Phishing Secret Code",
      type: "string",
      // Backend requires this on every domain creation, but it's absent
      // from exports/files created before this column existed. alwaysSend
      // (rather than required) so a missing/blank value falls through to
      // validate() and gets auto-generated instead of failing the import.
      required: false,
      alwaysSend: true,
      width: 25,
      sampleValue: "Secure Phrase 1",
      sampleValue2: "Another Safe Code",
      validate: (value) => {
        const trimmed = typeof value === "string" ? value.trim() : "";
        if (!trimmed) {
          return generateSecretCode();
        }
        if (trimmed.length < 4 || trimmed.length > 20) {
          throw new Error(
            "Anti-Phishing Secret Code must be between 4 and 20 characters",
          );
        }
        if (!/^[A-Za-z0-9_ -]+$/.test(trimmed)) {
          throw new Error(
            "Anti-Phishing Secret Code may only contain letters, numbers, spaces, underscores (_) and hyphens (-)",
          );
        }
        return trimmed;
      },
    },

    // Add missing caution_id and disclaimer_id
    {
      key: "caution_id",
      header: "Caution ID",
      csvHeader: "Caution ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Caution ID"),
    },
    {
      key: "disclaimer_id",
      header: "Disclaimer ID",
      csvHeader: "Disclaimer ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Disclaimer ID"),
    },

    {
      key: "details.address",
      header: "Address",
      csvHeader: "Address",
      type: "string",
      // Backend's `details` is a generic dict — no sub-field is actually
      // enforced server-side, and real domains commonly have this blank.
      // alwaysSend so the `details` object itself always survives (it IS a
      // required key on the backend, even though its contents aren't checked).
      required: false,
      alwaysSend: true,
      width: 30,
      sampleValue: "123 Company Street, City, State",
      sampleValue2: "456 Business Ave, Town, State",
    },
    {
      key: "details.description",
      header: "Details Description",
      csvHeader: "Details Description",
      type: "string",
      // Backend's `details` is a generic dict — no sub-field is actually
      // enforced server-side, and real domains commonly have this blank.
      required: false,
      alwaysSend: true,
      width: 30,
      sampleValue: "Primary company domain for email services",
      sampleValue2: "Secondary organization domain",
    },
    // Updated Password Age Configuration
    {
      key: "enable_max_password_age",
      header: "Enable Password Age Policy",
      csvHeader: "Enable Password Age Policy",
      type: "boolean",
      required: true,
      width: 20,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "max_password_age",
      header: "Max Password Age (Days)",
      csvHeader: "Max Password Age (Days)",
      type: "number",
      required: false,
      width: 20,
      defaultValue: 90,
      sampleValue: "",
      sampleValue2: 90,
      validate: (value, item) => {
        if (item && item.enable_max_password_age) {
          const num = Number(value);
          if (isNaN(num) || num < 3 || num > 365) {
            throw new Error(
              "Max password age must be between 3 and 365 days when enabled",
            );
          }
          return num;
        }
        return 0; // When disabled
      },
    },
    {
      key: "notify_1",
      header: "Notification 1 (Days Before)",
      csvHeader: "Notification 1 (Days Before)",
      type: "number",
      required: false,
      width: 20,
      defaultValue: 2,
      sampleValue: "",
      sampleValue2: 2,
      validate: (value, item) => {
        if (item && item.enable_max_password_age) {
          const num = Number(value);
          const maxAge = Number(item.max_password_age) || 90;
          if (isNaN(num) || num < 2 || num >= maxAge) {
            throw new Error(
              `Notification 1 must be between 2 and ${maxAge - 1} days`,
            );
          }
          return num;
        }
        return undefined;
      },
    },
    {
      key: "notify_2",
      header: "Notification 2 (Days Before)",
      csvHeader: "Notification 2 (Days Before)",
      type: "number",
      required: false,
      width: 20,
      defaultValue: 5,
      sampleValue: "",
      sampleValue2: 5,
      validate: (value, item) => {
        if (item && item.enable_max_password_age) {
          const num = Number(value);
          const maxAge = Number(item.max_password_age) || 90;
          const notify1 = Number(item.notify_1);

          if (isNaN(num) || num < 2 || num >= maxAge) {
            throw new Error(
              `Notification 2 must be between 2 and ${maxAge - 1} days`,
            );
          }

          // Check for uniqueness
          if (num === notify1) {
            throw new Error("Notification periods must be unique");
          }

          return num;
        }
        return undefined;
      },
    },
    {
      key: "notify_3",
      header: "Notification 3 (Days Before)",
      csvHeader: "Notification 3 (Days Before)",
      type: "number",
      required: false,
      width: 20,
      defaultValue: 9,
      sampleValue: "",
      sampleValue2: 9,
      validate: (value, item) => {
        if (item && item.enable_max_password_age) {
          const num = Number(value);
          const maxAge = Number(item.max_password_age) || 90;
          const notify1 = Number(item.notify_1);
          const notify2 = Number(item.notify_2);

          if (isNaN(num) || num < 2 || num >= maxAge) {
            throw new Error(
              `Notification 3 must be between 2 and ${maxAge - 1} days`,
            );
          }

          // Check for uniqueness
          if (num === notify1 || num === notify2) {
            throw new Error("Notification periods must be unique");
          }

          return num;
        }
        return undefined;
      },
    },

    {
      key: "enable_catch_all",
      header: "Enable Catch All",
      csvHeader: "Enable Catch All",
      type: "boolean",
      required: true,
      width: 15,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "No",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "catch_all_forwarding_address",
      header: "Catch All Email",
      csvHeader: "Catch All Email",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "", // Empty when catch all disabled
      sampleValue2: "", // Only when enabled
      validate: (value, item) => {
        // Only required if enable_catch_all is true
        if (item && item.enable_catch_all) {
          if (!value || !value.trim()) {
            throw new Error("Email is required when catch all is enabled");
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error("Invalid email format");
          }
        }
        // Transform to null when catch all is disabled
        return item && !item.enable_catch_all ? null : value || null;
      },
    },

    {
      key: "enable_hybrid_mode",
      header: "Enable Hybrid Mode",
      csvHeader: "Enable Hybrid Mode",
      type: "boolean",
      required: true,
      width: 15,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
      validate: (value, item) => {
        if (value && item && item.enable_catch_all) {
          throw new Error(
            "Enable Catch All and Enable Hybrid Mode cannot both be Yes for the same domain",
          );
        }
        return value;
      },
    },

    {
      key: "hybrid_connector_properties.description",
      header: "Hybrid Description",
      csvHeader: "Hybrid Description",
      type: "string",
      required: false,
      // Backend's ConnectorProperties.description is a required (non-Optional)
      // str, same as fqdn/ipv4 below - must always be sent, even as "", or
      // the request 422s with "Field required".
      alwaysSend: true,
      width: 35,
      sampleValue: "", // Empty when hybrid disabled
      sampleValue2: "Connection to on-premise Exchange server",
      validate: (value, item) => {
        if (item && item.enable_hybrid_mode) {
          if (!value || !value.trim()) {
            throw new Error(
              "Description is required when hybrid mode is enabled",
            );
          }
          return value;
        }
        return "";
      },
    },
    {
      key: "hybrid_connector_properties.fqdn",
      header: "Hybrid FQDN",
      csvHeader: "Hybrid FQDN",
      type: "string",
      required: false,
      // Backend's ConnectorProperties.fqdn is a required (non-Optional) str —
      // must always be sent, even as "", or the create request 422s.
      alwaysSend: true,
      width: 30,
      sampleValue: "",
      sampleValue2: "hybrid.company.org",
      validate: (value, item) => {
        if (item && item.enable_hybrid_mode) {
          if (!value || !value.trim()) {
            // Not required on its own — enforced together with IPv4 below.
            return "";
          }
          return value;
        }
        return "";
      },
    },
    {
      key: "hybrid_connector_properties.ipv4",
      header: "Hybrid IPv4",
      csvHeader: "Hybrid IPv4",
      type: "string",
      required: false,
      // Backend's ConnectorProperties.ipv4 is a required (non-Optional) str —
      // must always be sent, even as "", or the create request 422s.
      alwaysSend: true,
      width: 20,
      sampleValue: "",
      sampleValue2: "10.0.0.5",
      validate: (value, item) => {
        if (item && item.enable_hybrid_mode) {
          const hasFqdn = !!item?.hybrid_connector_properties?.fqdn;
          if (!value || !value.trim()) {
            if (!hasFqdn) {
              throw new Error(
                "Either Hybrid FQDN or Hybrid IPv4 is required when hybrid mode is enabled",
              );
            }
            return "";
          }
          if (
            !/^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(
              value,
            )
          ) {
            throw new Error("Invalid IPv4 address");
          }
          return value;
        }
        return "";
      },
    },
    {
      key: "hybrid_connector_properties.ipv6",
      header: "Hybrid IPv6",
      csvHeader: "Hybrid IPv6",
      type: "string",
      required: false,
      width: 25,
      sampleValue: "",
      sampleValue2: "fe80::1",
      validate: (value, item) => {
        if (value && value.trim() && item && item.enable_hybrid_mode) {
          const ipv6Regex =
            /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|([0-9a-fA-F]{1,4}::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}))$/;
          if (!ipv6Regex.test(value)) {
            throw new Error("Invalid IPv6 address");
          }
          return value;
        }
        return item && item.enable_hybrid_mode ? value || "" : undefined;
      },
    },
    {
      key: "hybrid_connector_properties.port",
      header: "Hybrid Port",
      csvHeader: "Hybrid Port",
      type: "number",
      required: false,
      // Backend's ConnectorProperties.port is a required (non-Optional) int,
      // same as fqdn/ipv4 above - must always be sent or the request 422s
      // with "Field required".
      alwaysSend: true,
      width: 12,
      defaultValue: 25,
      sampleValue: "",
      sampleValue2: 587,
      validate: (value, item) => {
        if (item && item.enable_hybrid_mode) {
          const num = Number(value);
          if (isNaN(num)) {
            throw new Error("Port is required when hybrid mode is enabled");
          }
          if (num < 1 || num > 65535) {
            throw new Error("Port must be between 1 and 65535");
          }
          return num;
        }
        return 25;
      },
    },

    {
      key: "spam_destination",
      header: "Spam Destination",
      csvHeader: "Spam Destination",
      type: "select",
      required: true,
      width: 15,
      defaultValue: "FOLDER",
      // Must match the manual Add/Edit Domain form's options exactly
      // (src/pages/domain/add/steps/SpamDestination.jsx) and the backend's
      // yup .oneOf(["FOLDER","INBOX","TRASH","DELETE","SEND_DIGEST","SPAM"]).
      options: [
        { value: "INBOX", label: "Inbox" },
        { value: "SPAM", label: "Spam" },
        { value: "TRASH", label: "Trash" },
        { value: "DELETE", label: "Permanently Delete" },
        { value: "SEND_DIGEST", label: "Send Digest" },
        { value: "FOLDER", label: "Custom Folder" },
      ],
      sampleValue: "FOLDER",
      sampleValue2: "TRASH",
    },
    {
      key: "spam_destination_properties.description",
      header: "Spam Policy Description",
      csvHeader: "Spam Policy Description",
      type: "string",
      required: true,
      width: 35,
      sampleValue: "Standard spam filtering policy for domain",
      sampleValue2: "Aggressive spam filtering for sensitive domains",
    },
    {
      key: "spam_destination_properties.folder_name",
      header: "Spam Folder Name",
      csvHeader: "Spam Folder Name",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "Junk",
      sampleValue2: "",
      validate: (value, item) => {
        if (
          item &&
          item.spam_destination === "Folder" &&
          (!value || !value.trim())
        ) {
          throw new Error(
            "Folder name is required when spam destination is Folder",
          );
        }
        return value;
      },
    },
  ],

  mailboxes: [
    // NOTE: Mailbox creation only attaches mailbox capability to an ALREADY
    // EXISTING E-Mail Identity - it no longer carries an identity's own
    // profile fields. There is no first/last name, password, phone, address,
    // department, restriction policy, employee ID, or domain_name/email_prefix
    // pair here (those all now live on Identity, see the `identities` mapping
    // above; department_id moved off mailbox entirely per the July 2026
    // backend change). This mirrors the exact payload sent by the single
    // "Add Mailbox" flow (src/pages/mailbox/add/index.jsx onSubmit): only
    // email_identity, enabled, allocate_quota, and the three policy IDs.
    {
      key: "email_identity",
      header: "E-Mail Identity",
      csvHeader: "E-Mail Identity",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "john.doe@example.com",
      sampleValue2: "jane.smith@example.com",
      validate: (value) => {
        const trimmed = String(value).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          throw new Error(
            "Invalid email format - must be an existing E-Mail Identity",
          );
        }
        return trimmed.toLowerCase();
      },
    },
    {
      key: "allocate_quota",
      header: "Allocate Space (GB)",
      csvHeader: "Allocate Space (GB)",
      type: "number",
      required: true,
      width: 18,
      defaultValue: 0.1,
      sampleValue: 2,
      sampleValue2: 5,
      validate: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 0.1) {
          throw new Error("Minimum allocation is 0.1 GB (100 MB)");
        }
        const decimal = num.toString().split(".")[1];
        if (decimal && decimal.length > 2) {
          throw new Error("Maximum precision is 0.01 GB (10 MB)");
        }
        return num;
      },
    },
    {
      key: "enabled",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Active",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "yes"
        );
      },
    },
    {
      key: "general_policy_id",
      header: "General Policy ID",
      csvHeader: "General Policy ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("General Policy ID"),
    },
    {
      key: "forwarding_policy_id",
      header: "Forwarding Policy ID",
      csvHeader: "Forwarding Policy ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Forwarding Policy ID"),
    },
    {
      key: "distribution_policy_id",
      header: "Distribution Policy ID",
      csvHeader: "Distribution Policy ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      // Mirrors the mutual-exclusion rule enforced in the single Add Mailbox
      // form's MailPolicies step: Distribution can't combine with General or
      // Forwarding. Runs last so general_policy_id/forwarding_policy_id are
      // already present on `item` to check against.
      validate: (value, item) => {
        const uuidChecked = validateOptionalUUID("Distribution Policy ID")(
          value,
        );
        if (
          uuidChecked &&
          item &&
          (item.general_policy_id || item.forwarding_policy_id)
        ) {
          throw new Error(
            "Distribution Policy cannot be combined with General or Forwarding Policy",
          );
        }
        return uuidChecked;
      },
    },
  ],

  identities: [
    {
      key: "first_name",
      header: "First Name",
      csvHeader: "First Name",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "John",
      sampleValue2: "Jane",
      validate: (value) => {
        if (!value || value.trim() === "") {
          throw new Error("First name is required");
        }
        return value.trim();
      },
    },
    {
      key: "last_name",
      header: "Last Name",
      csvHeader: "Last Name",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "Doe",
      sampleValue2: "Smith",
      transform: (value) => (value ? String(value).trim() : ""),
    },
    {
      key: "email_prefix",
      header: "Email Prefix",
      csvHeader: "Email Prefix",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "john.doe",
      sampleValue2: "jane.smith",
      validate: (value) => {
        if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
          throw new Error(
            "Only letters, numbers, dot, underscore, and hyphen are allowed",
          );
        }
        return value.toLowerCase();
      },
    },
    {
      key: "primary_phone_number",
      header: "Phone Number",
      csvHeader: "Phone Number",
      type: "string",
      required: true,
      width: 18,
      sampleValue: "+911234567890",
      sampleValue2: "+14155552671",
      validate: (value) => {
        let strValue = String(value).trim();
        if (!strValue.startsWith("+") && /^[0-9]{10,15}$/.test(strValue)) {
          strValue = "+" + strValue;
        }
        strValue = strValue.replace(/^'/, "");
        if (!/^\+[0-9]{10,18}$/.test(strValue)) {
          throw new Error(
            "Phone number must be in E.164 format (e.g., +1234567890)",
          );
        }
        return strValue;
      },
    },
    {
      key: "secondary_email",
      header: "Secondary Email",
      csvHeader: "Secondary Email",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "",
      sampleValue2: "jane.backup@example.com",
      validate: (value) => {
        if (value && String(value).trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value).trim())) {
            throw new Error("Invalid email format");
          }
          return String(value).trim();
        }
        return "";
      },
    },
    {
      key: "base64_password",
      header: "Password",
      csvHeader: "Password",
      type: "string",
      required: true,
      // Only ever meaningful for create - exported files never contain a
      // password column (can't be exported), and bulk edit always sends ""
      // itself (see handleBulkEditIdentity in identity/list/index.jsx), so
      // this field must never even be parsed/required during edit or
      // "Password is required" throws before that "" is ever reached - see
      // BulkImportModal.jsx's effectiveFieldMapping.
      createOnly: true,
      width: 25,
      sampleValue: "Password123",
      sampleValue2: "SecurePass456",
      validate: (value) => {
        const rawValue = String(value ?? "").trim();
        if (!rawValue) {
          throw new Error("Password is required");
        }
        if (rawValue.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        let isBase64 = false;
        try {
          isBase64 = btoa(atob(rawValue)) === rawValue;
        } catch (e) {
          isBase64 = false;
        }
        if (isBase64) return rawValue;
        try {
          return btoa(rawValue);
        } catch (e) {
          throw new Error("Unable to process password");
        }
      },
    },
    {
      key: "is_enabled",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Active",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "yes"
        );
      },
    },
    {
      key: "is_app_2fa_enabled",
      header: "App 2FA",
      csvHeader: "App 2FA",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "No",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "enabled"
        );
      },
    },
    {
      key: "is_sms_2fa_enabled",
      header: "SMS 2FA",
      csvHeader: "SMS 2FA",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "No",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "enabled"
        );
      },
    },
    {
      key: "is_email_2fa_enabled",
      header: "Email 2FA",
      csvHeader: "Email 2FA",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "No",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "enabled"
        );
      },
    },
    {
      key: "restriction_policy_id",
      header: "Restriction Policy ID",
      csvHeader: "Restriction Policy ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Restriction Policy ID"),
    },
    {
      key: "department_id",
      header: "Department ID",
      csvHeader: "Department ID",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Department ID"),
    },
    {
      key: "is_mailbox_enabled",
      header: "Enable Mailbox",
      csvHeader: "Enable Mailbox",
      type: "boolean",
      required: false,
      width: 15,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "enabled"
        );
      },
    },
    {
      key: "allocate_quota",
      header: "Mailbox Quota (GB)",
      csvHeader: "Mailbox Quota (GB)",
      type: "number",
      required: false,
      width: 18,
      defaultValue: 0.1,
      // Kept in sync with "Enable Mailbox" sample values below: 0.1 (the
      // harmless default) when mailbox is off, a real value when it's on -
      // an empty string here would fall back to a misleading 100 via
      // getDefaultSampleValue's generic number default.
      sampleValue: 0.1,
      sampleValue2: 2.5,
      validate: (value, item) => {
        if (item && item.is_mailbox_enabled) {
          const num = Number(value);
          if (isNaN(num) || num < 0.1) return 0.1;
          return num;
        }
        return 0.1;
      },
    },
    {
      key: "is_chat_enabled",
      header: "Enable Chat",
      csvHeader: "Enable Chat",
      type: "boolean",
      required: false,
      width: 15,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "enabled"
        );
      },
      validate: (value, item) => {
        // Chat requires a mailbox, mirror the single Add Identity interlock
        if (value && item) {
          item.is_mailbox_enabled = true;
        }
        return value;
      },
    },
    {
      key: "is_files_enabled",
      header: "Enable Files",
      csvHeader: "Enable Files",
      type: "boolean",
      required: false,
      width: 15,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1" ||
          normalizedValue === "enabled"
        );
      },
    },
    {
      key: "files_quota_allocated",
      header: "Files Quota (GB)",
      csvHeader: "Files Quota (GB)",
      type: "number",
      required: false,
      width: 18,
      defaultValue: 0.1,
      // Same reasoning as "Mailbox Quota (GB)" above: keep this in sync with
      // "Enable Files" sample values so an empty/off row still gets the
      // harmless 0.1 default instead of getDefaultSampleValue's generic 100.
      sampleValue: 0.1,
      sampleValue2: 2.5,
      validate: (value, item) => {
        if (item && item.is_files_enabled) {
          const num = Number(value);
          if (isNaN(num) || num < 0.1) return 0.1;
          return num;
        }
        return 0.1;
      },
    },
  ],

  servers: [
    {
      key: "server_id",
      header: "Server ID",
      csvHeader: "Server ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Server ID"),
    },
    {
      key: "host_name",
      header: "Host Name",
      csvHeader: "Host Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "mail01.company.com",
      sampleValue2: "mail02.company.com",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/.test(value)) {
          throw new Error("Enter a valid hostname");
        }
        return value;
      },
    },
    {
      key: "quota_allocated",
      header: "Quota Allocated (GB)",
      csvHeader: "Quota Allocated (GB)",
      type: "number",
      required: true,
      width: 15,
      defaultValue: 0.1,
      sampleValue: 100.0,
      sampleValue2: 200.0,
      transform: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 0.1) return 0.1;
        return num;
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "is_monitoring",
      header: "Monitoring",
      csvHeader: "Monitoring",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: false,
      sampleValue: "Enabled",
      sampleValue2: "Disabled",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "enabled" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "server_info.description",
      header: "Description",
      csvHeader: "Description",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Primary mail server for domain",
      sampleValue2: "Secondary mail server for backup",
    },
    {
      key: "server_info.ipv4",
      header: "IPv4 Address",
      csvHeader: "IPv4 Address",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "192.168.1.100",
      sampleValue2: "192.168.1.101",
      validate: (value) => {
        if (
          !/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(
            value,
          )
        ) {
          throw new Error("Enter a valid IPv4 address");
        }
        return value;
      },
    },
    {
      key: "server_info.location",
      header: "Location",
      csvHeader: "Location",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "Data Center A, Rack 12",
      sampleValue2: "Data Center B, Rack 15",
    },
    {
      key: "server_info.os",
      header: "Operating System",
      csvHeader: "Operating System",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "Ubuntu 22.04 LTS",
      sampleValue2: "CentOS 8",
    },
    {
      key: "smtp_port",
      header: "SMTP Port",
      csvHeader: "SMTP Port",
      type: "number",
      required: true,
      width: 12,
      defaultValue: 25,
      sampleValue: 587,
      sampleValue2: 465,
      transform: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 1 || num > 65535) return 25;
        return num;
      },
    },
    {
      key: "storage_path",
      header: "Storage Path",
      csvHeader: "Storage Path",
      type: "string",
      required: true,
      width: 25,
      defaultValue: "/data/vmail",
      sampleValue: "/data/vmail",
      sampleValue2: "/var/mail/storage",
      validate: (value) => {
        if (!/^\/.*/.test(value)) {
          throw new Error("Storage path must be an absolute path");
        }
        return value;
      },
    },
  ],

  users: [
    {
      key: "user_name",
      header: "User Name",
      csvHeader: "User Name",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "john.doe",
      sampleValue2: "jane.smith",
    },
    {
      key: "display_name",
      header: "Display Name",
      csvHeader: "Display Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "John Doe",
      sampleValue2: "Jane Smith",
      validate: (value) => {
        if (!/^[a-zA-Z. ]+$/.test(value)) {
          throw new Error("Only letters are allowed");
        }
        return value;
      },
    },
    {
      key: "user_email",
      header: "User Email",
      csvHeader: "User Email",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "john.doe@company.com",
      sampleValue2: "jane.smith@company.com",
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error("Invalid email format");
        }
        return value;
      },
    },
    {
      key: "primary_phone_number_with_country_code",
      header: "Phone Number",
      csvHeader: "Phone Number",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "+911234567890",
      sampleValue2: "+910987654321",
      validate: (value) => {
        if (!/^\+\d{12,15}$/.test(value)) {
          throw new Error("Enter a valid phone number with country code");
        }
        return value;
      },
    },
    {
      key: "password",
      header: "Password",
      csvHeader: "Password",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "SecurePass123!",
      sampleValue2: "StrongPwd456@",
      validate: (value) => {
        if (value.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        if (
          !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/.test(
            value,
          )
        ) {
          throw new Error(
            "Password must contain letters, numbers, and at least one symbol",
          );
        }
        return value;
      },
    },
    {
      key: "activate",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "user_details.first_name",
      header: "First Name",
      csvHeader: "First Name",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "John",
      sampleValue2: "Jane",
    },
    {
      key: "user_details.last_name",
      header: "Last Name",
      csvHeader: "Last Name",
      type: "string",
      required: true,
      width: 20,
      sampleValue: "Doe",
      sampleValue2: "Smith",
    },
    {
      key: "user_details.other_email",
      header: "Other Email",
      csvHeader: "Other Email",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "john.personal@gmail.com",
      sampleValue2: "jane.personal@gmail.com",
      validate: (value) => {
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error("Invalid email format");
          }
        }
        return value;
      },
    },
    {
      key: "user_details.address",
      header: "Address",
      csvHeader: "Address",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "123 Main Street, City, State",
      sampleValue2: "456 Oak Avenue, Town, State",
    },
    {
      key: "user_details.city",
      header: "City",
      csvHeader: "City",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "New York",
      sampleValue2: "Los Angeles",
    },
    {
      key: "user_details.state",
      header: "State",
      csvHeader: "State",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "NY",
      sampleValue2: "CA",
    },
    {
      key: "user_details.country",
      header: "Country",
      csvHeader: "Country",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "United States",
      sampleValue2: "United States",
    },
    {
      key: "user_details.zip_code",
      header: "Zip Code",
      csvHeader: "Zip Code",
      type: "string",
      required: false,
      width: 15,
      sampleValue: "10001",
      sampleValue2: "90001",
    },
    {
      key: "user_details.timezone",
      header: "Timezone",
      csvHeader: "Timezone",
      type: "string",
      required: false,
      width: 25,
      sampleValue: "America/New_York",
      sampleValue2: "America/Los_Angeles",
    },
    {
      key: "user_details.locale",
      header: "Locale",
      csvHeader: "Locale",
      type: "string",
      required: false,
      width: 15,
      sampleValue: "en_US",
      sampleValue2: "en_GB",
    },
  ],

  // Add these to your IMPORT_FIELD_MAPPINGS object

  general_policies: [
    {
      key: "policy_id",
      header: "Policy ID",
      csvHeader: "Policy ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Policy ID"),
    },
    {
      key: "policy_name",
      header: "Policy Name",
      csvHeader: "Policy Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Strict Incoming Policy",
      sampleValue2: "Standard Incoming Filter",
      // Mirrors the "Add General Policy" form's yup schema (3-200 chars) -
      // see src/pages/policy/GeneralPolicy/add/validationSchema.js
      validate: (value) => {
        if (value.length < 3) {
          throw new Error("Policy name must be at least 3 characters");
        }
        if (value.length > 200) {
          throw new Error("Policy name must not exceed 200 characters");
        }
        return value.trim();
      },
    },
    {
      key: "policy_description",
      header: "Policy Description",
      csvHeader: "Policy Description",
      type: "string",
      required: false,
      alwaysSend: true, // backend requires this key present even when empty
      width: 40,
      sampleValue: "Blocks all incoming emails except from trusted domains",
      sampleValue2: "Standard filtering for incoming email security",
    },
    {
      key: "domain",
      header: "Domain",
      csvHeader: "Domain",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(value)) {
          throw new Error("Invalid domain name format");
        }
        return value.trim();
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    // The four blocking toggles + their exception lists below are grouped
    // and ordered to mirror the "Blocking & Exceptions" step's four
    // sections (Incoming Email / Outgoing Email / Incoming Domain /
    // Outgoing Domain Settings) - see BlockingStep.jsx - so the CSV layout
    // reads the same way the form does.
    {
      key: "block_all_incoming_emails",
      header: "Block All Incoming Emails",
      csvHeader: "Block All Incoming Emails",
      type: "boolean",
      required: false,
      width: 20,
      defaultValue: false,
      sampleValue: "Yes",
      sampleValue2: "No",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "incoming_exception_emails",
      header: "Incoming Exception Emails",
      csvHeader: "Incoming Exception Emails",
      type: "array",
      required: false,
      width: 35,
      sampleValue: "admin@trusted.com,support@partner.org",
      sampleValue2: "contact@client.com,info@supplier.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid email format: ${email}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "block_all_incoming_domains",
      header: "Block All Incoming Domains",
      csvHeader: "Block All Incoming Domains",
      type: "boolean",
      required: false,
      width: 20,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "incoming_exception_domains",
      header: "Incoming Exception Domains",
      csvHeader: "Incoming Exception Domains",
      type: "array",
      required: false,
      width: 35,
      sampleValue: "trusted.com,partner.org,vendor.net",
      sampleValue2: "client.com,supplier.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((domain) => domain.trim())
          .filter((domain) => domain.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          value.forEach((domain) => {
            if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(domain)) {
              throw new Error(`Invalid domain format: ${domain}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "block_all_outgoing_emails",
      header: "Block All Outgoing Emails",
      csvHeader: "Block All Outgoing Emails",
      type: "boolean",
      required: false,
      width: 20,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "outgoing_exception_emails",
      header: "Outgoing Exception Emails",
      csvHeader: "Outgoing Exception Emails",
      type: "array",
      required: false,
      width: 35,
      sampleValue: "ceo@company.com,admin@company.com",
      sampleValue2: "manager@company.com,support@company.com",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid email format: ${email}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "block_all_outgoing_domains",
      header: "Block All Outgoing Domains",
      csvHeader: "Block All Outgoing Domains",
      type: "boolean",
      required: false,
      width: 20,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "Yes",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "yes" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "outgoing_exception_domains",
      header: "Outgoing Exception Domains",
      csvHeader: "Outgoing Exception Domains",
      type: "array",
      required: false,
      width: 35,
      sampleValue: "internal.com,subsidiary.org",
      sampleValue2: "branch.com,division.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((domain) => domain.trim())
          .filter((domain) => domain.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          value.forEach((domain) => {
            if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(domain)) {
              throw new Error(`Invalid domain format: ${domain}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "outgoing_size_limit_mb",
      header: "Outgoing Size Limit (MB)",
      csvHeader: "Outgoing Size Limit (MB)",
      type: "number",
      // Matches the "Add General Policy" form, which requires this field
      // (yup .required() in validationSchema.js) - import must not allow
      // creating a policy the manual form couldn't.
      required: true,
      width: 20,
      sampleValue: 25,
      sampleValue2: 50,
    },
  ],

  filters_policies: [
    {
      key: "policy_id",
      header: "Policy ID",
      csvHeader: "Policy ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Policy ID"),
    },
    {
      key: "policy_name",
      header: "Policy Name",
      csvHeader: "Policy Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Spam Filter",
      sampleValue2: "Corporate Allowlist",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Policy name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Policy name must not exceed 100 characters");
        }
        return value.trim();
      },
    },
    {
      key: "domain",
      header: "Domain",
      csvHeader: "Domain",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(value)) {
          throw new Error("Invalid domain name format");
        }
        return value.trim();
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "white_entries",
      header: "Allowed Entries",
      csvHeader: "Allowed Entries",
      type: "array",
      required: false,
      width: 40,
      sampleValue: "allowed.com, user@trusted.com",
      sampleValue2: "partner.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry);
            const isDomain =
              /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(entry);
            if (!isEmail && !isDomain) {
              throw new Error(
                `Invalid entry format (must be email or domain): ${entry}`,
              );
            }
          });
        }
        return value;
      },
    },
    {
      key: "black_entries",
      header: "Blocked Entries",
      csvHeader: "Blocked Entries",
      type: "array",
      required: false,
      width: 40,
      sampleValue: "spam.com, baduser@malware.net",
      sampleValue2: "phishing.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry);
            const isDomain =
              /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(entry);
            if (!isEmail && !isDomain) {
              throw new Error(
                `Invalid entry format (must be email or domain): ${entry}`,
              );
            }
          });
        }
        return value;
      },
    },
  ],
  restriction_policies: [
    {
      key: "policy_id",
      header: "Policy ID",
      csvHeader: "Policy ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Policy ID"),
    },
    {
      key: "policy_name",
      header: "Policy Name",
      csvHeader: "Policy Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Strict Incoming Policy",
      sampleValue2: "Standard Incoming Filter",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Policy name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Policy name must not exceed 100 characters");
        }
        return value.trim();
      },
    },
    {
      key: "policy_description",
      header: "Policy Description",
      csvHeader: "Policy Description",
      type: "string",
      required: false,
      alwaysSend: true, // backend requires this key present even when empty
      width: 40,
      sampleValue: "Blocks all incoming emails except from trusted domains",
      sampleValue2: "Standard filtering for incoming email security",
    },
    {
      key: "domain",
      header: "Domain",
      csvHeader: "Domain",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(value)) {
          throw new Error("Invalid domain name format");
        }
        return value.trim();
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    // ADDED: Geo restrictions
    {
      key: "geo_restrictions",
      header: "Geo Restrictions (Country Codes)",
      csvHeader: "Geo Restrictions (Country Codes)",
      type: "array",
      required: false,
      width: 30,
      sampleValue: "IN,US,GB",
      sampleValue2: "CA,AU,DE",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((code) => code.trim().toUpperCase())
          .filter((code) => code.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          value.forEach((code) => {
            if (!/^[A-Z]{2}$/.test(code)) {
              throw new Error(
                `Invalid country code: ${code}. Must be 2-letter ISO code`,
              );
            }
          });
        }
        return value;
      },
    },

    // ADDED: IP restrictions
    {
      key: "ip_restrictions",
      header: "IP Restrictions",
      csvHeader: "IP Restrictions",
      type: "array",
      required: false,
      width: 40,
      sampleValue: "192.168.1.100/24,10.0.0.1/24",
      sampleValue2: "172.16.0.1/24,203.0.113.1/24",
      transform: (value) => {
        if (!value || value.trim() === "") return ["0.0.0.0"]; // Default as per your sample
        return value
          .split(",")
          .map((ip) => ip.trim())
          .filter((ip) => ip.length > 0);
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          value.forEach((ip) => {
            // Allow the special case
            if (ip === "0.0.0.0") {
              return;
            }

            // Updated regex to handle IP addresses with optional CIDR notation
            const ipWithOptionalCidrRegex =
              /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

            if (!ipWithOptionalCidrRegex.test(ip)) {
              throw new Error(
                `Invalid IP address format: ${ip}. Expected format: IPv4 with optional CIDR (e.g., 192.168.1.100 or 192.168.1.100/24)`,
              );
            }
          });
        }
        return value; // Always return the value if validation passes
      },
    },
  ],
  distribution_policies: [
    {
      key: "policy_id",
      header: "Policy ID",
      csvHeader: "Policy ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Policy ID"),
    },
    {
      key: "policy_name",
      header: "Policy Name",
      csvHeader: "Policy Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Strict Incoming Policy",
      sampleValue2: "Standard Incoming Filter",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Policy name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Policy name must not exceed 100 characters");
        }
        return value.trim();
      },
    },
    {
      key: "policy_description",
      header: "Policy Description",
      csvHeader: "Policy Description",
      type: "string",
      required: false,
      alwaysSend: true, // backend requires this key present even when empty
      width: 40,
      sampleValue: "Blocks all incoming emails except from trusted domains",
      sampleValue2: "Standard filtering for incoming email security",
    },
    {
      key: "domain",
      header: "Domain",
      csvHeader: "Domain",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(value)) {
          throw new Error("Invalid domain name format");
        }
        return value.trim();
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "rule_type",
      header: "Rule Type",
      csvHeader: "Rule Type",
      type: "select",
      required: true,
      width: 15,
      defaultValue: "ANYONE",
      // Mirrors ruleList in DistributionPolicy/add/stepper/PolicyInfoStep.jsx -
      // was previously missing everything but ANYONE, so SPECIFIC_EMAILS
      // (and GROUP_MEMBER/DOMAIN_MEMBER) would fail import validation even
      // though they're valid, creatable values via the single Add form.
      options: [
        { value: "ANYONE", label: "Anyone" },
        { value: "GROUP_MEMBER", label: "Group Member" },
        { value: "DOMAIN_MEMBER", label: "Domain Member" },
        { value: "SPECIFIC_EMAILS", label: "Specific Emails" },
      ],
      sampleValue: "ANYONE",
      sampleValue2: "SPECIFIC_EMAILS",
    },
    {
      key: "internal_members",
      header: "Internal Members",
      csvHeader: "Internal Members",
      type: "array",
      required: false,
      width: 50,
      sampleValue: "abc@gmail.com,xyz@company.com",
      sampleValue2: "test@internal.com,admin@partner.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value, item) => {
        // Only validate if is_group is true and value has content
        if (item && item.is_group && Array.isArray(value) && value.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid internal email format: ${email}`);
            }
          });
        }
        return value;
      },
    },

    {
      key: "external_members",
      header: "External Members",
      csvHeader: "External Members",
      type: "array",
      required: false,
      width: 50,
      sampleValue: "john@example.com,jane@example.com",
      sampleValue2: "admin@company.org,support@company.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value, item) => {
        // Only validate if is_group is true and value has content
        if (item && item.is_group && Array.isArray(value) && value.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid external email format: ${email}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "specific_emails",
      header: "Specific Emails",
      csvHeader: "Specific Emails",
      type: "array",
      required: false,
      width: 50,
      sampleValue: "john11@example.com,jane11@example.com",
      sampleValue2: "admin11@company.org,support11@company.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value, item) => {
        // Only validate if is_group is true and value has content
        if (item && item.is_group && Array.isArray(value) && value.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid internal email format: ${email}`);
            }
          });
        }
        return value;
      },
    },
  ],
  forwarding_policies: [
    {
      key: "policy_id",
      header: "Policy ID",
      csvHeader: "Policy ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Policy ID"),
    },
    {
      key: "policy_name",
      header: "Policy Name",
      csvHeader: "Policy Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Strict Incoming Policy",
      sampleValue2: "Standard Incoming Filter",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Policy name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Policy name must not exceed 100 characters");
        }
        return value.trim();
      },
    },
    {
      key: "policy_description",
      header: "Policy Description",
      csvHeader: "Policy Description",
      type: "string",
      required: false,
      alwaysSend: true, // backend requires this key present even when empty
      width: 40,
      sampleValue: "Blocks all incoming emails except from trusted domains",
      sampleValue2: "Standard filtering for incoming email security",
    },
    {
      key: "domain",
      header: "Domain",
      csvHeader: "Domain",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(value)) {
          throw new Error("Invalid domain name format");
        }
        return value.trim();
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "forward_to_emails",
      header: "Forward to emails",
      csvHeader: "Forward to emails",
      type: "array",
      required: false,
      width: 50,
      sampleValue: "john13@example.com",
      sampleValue2: "support13@company.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value, item) => {
        // Only validate if is_group is true and value has content
        if (item && item.is_group && Array.isArray(value) && value.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid internal email format: ${email}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "from_emails",
      header: "From Emails",
      csvHeader: "From Emails",
      type: "array",
      required: false,
      width: 50,
      sampleValue: "peter13@example.com",
      sampleValue2: "support14@company.org",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value, item) => {
        // Only validate if is_group is true and value has content
        if (item && item.is_group && Array.isArray(value) && value.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid internal email format: ${email}`);
            }
          });
        }
        return value;
      },
    },
    {
      key: "subject_contains",
      header: "Subject Contains",
      csvHeader: "Subject Contains",
      type: "array",
      required: false,
      width: 30,
      sampleValue: "SPAM,URGENT,IMPORTANT",
      sampleValue2: "NOTICE,ALERT",
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((code) => code.trim().toUpperCase())
          .filter((code) => code.length > 0);
      },
    },
  ],
  policy_rules: [
    {
      key: "rule_name",
      header: "Rule Name",
      csvHeader: "Rule Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Department Email Policy",
      sampleValue2: "External Access Rule",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Rule name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Rule name must not exceed 100 characters");
        }
        return value.trim();
      },
    },
    {
      key: "domain_name",
      header: "Domain Name",
      csvHeader: "Domain Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/.test(value)) {
          throw new Error("Invalid domain name format");
        }
        return value.trim();
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        const normalizedValue = String(value).toLowerCase();
        return (
          normalizedValue === "active" ||
          normalizedValue === "true" ||
          normalizedValue === "1"
        );
      },
    },
    {
      key: "rule_type",
      header: "Rule Type",
      csvHeader: "Rule Type",
      type: "select",
      required: true,
      width: 20,
      defaultValue: "ANYONE",
      options: [
        { value: "ANYONE", label: "Anyone" },
        { value: "GROUP_MEMBER", label: "Group Member" },
        { value: "DOMAIN_MEMBER", label: "Domain Member" },
        { value: "SPECIFIC_EMAILS", label: "Specific Emails" },
      ],
      sampleValue: "ANYONE",
      sampleValue2: "SPECIFIC_EMAILS",
      validate: (value) => {
        const validTypes = [
          "ANYONE",
          "GROUP_MEMBER",
          "DOMAIN_MEMBER",
          "SPECIFIC_EMAILS",
        ];
        if (!validTypes.includes(value)) {
          throw new Error(
            `Invalid rule type: ${value}. Valid options: ${validTypes.join(", ")}`,
          );
        }
        return value;
      },
    },
    {
      key: "rule_description",
      header: "Description",
      csvHeader: "Description",
      type: "string",
      required: true,
      width: 50,
      sampleValue: "Allows emails from anyone to be sent to this mailbox group",
      sampleValue2:
        "Restricts email access to specific approved addresses only",
    },
    {
      key: "mailboxes",
      header: "Mailboxes",
      csvHeader: "Mailboxes",
      type: "array",
      required: true,
      width: 40,
      sampleValue: "sales,support,admin",
      sampleValue2: "hr,finance,marketing",
      transform: (value) => {
        if (!value || value.trim() === "") {
          throw new Error("At least one mailbox is required");
        }
        return value
          .split(",")
          .map((mailbox) => mailbox.trim())
          .filter((mailbox) => mailbox.length > 0);
      },
      validate: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("At least one mailbox is required");
        }

        // Validate mailbox format (basic validation)
        value.forEach((mailbox) => {
          if (!/^[a-zA-Z0-9._-]+$/.test(mailbox)) {
            throw new Error(
              `Invalid mailbox format: ${mailbox}. Use only letters, numbers, dots, hyphens, and underscores.`,
            );
          }
        });

        return value;
      },
    },
    {
      key: "specific_emails",
      header: "Specific Emails",
      csvHeader: "Specific Emails",
      type: "array",
      required: false,
      width: 50,
      sampleValue: "", // Empty when rule_type is not SPECIFIC_EMAILS
      sampleValue2: "john@client.com,jane@partner.org,admin@external.com", // Only when rule_type is SPECIFIC_EMAILS
      transform: (value) => {
        if (!value || value.trim() === "") return [];
        return value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      },
      validate: (value, item) => {
        // Only required and validated if rule_type is SPECIFIC_EMAILS
        if (item && item.rule_type === "SPECIFIC_EMAILS") {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error(
              "At least one email is required when rule type is SPECIFIC_EMAILS",
            );
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          value.forEach((email) => {
            if (!emailRegex.test(email)) {
              throw new Error(`Invalid email format: ${email}`);
            }
          });
        }

        return value;
      },
    },
  ],
  attachment_policies: [
    {
      key: "policy_id",
      header: "Policy ID",
      csvHeader: "Policy ID",
      type: "string",
      required: false,
      // Only ever meaningful for bulk EDIT (as the matchKey) - the backend
      // generates this on create, so it's never user-entered and is stripped
      // from create's parsed rows/sample template - see BulkImport.jsx's
      // effectiveFieldMapping and generateSampleFile in importUtils.js.
      editOnly: true,
      width: 15,
      sampleValue: "",
      sampleValue2: "",
      validate: validateOptionalUUID("Policy ID"),
    },
    {
      key: "policy_name",
      header: "Policy Name",
      csvHeader: "Policy Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Standard Attachment Policy",
      sampleValue2: "Restricted Attachment Policy",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Policy name must be at least 2 characters");
        }
        if (value.length > 100) {
          throw new Error("Policy name must not exceed 100 characters");
        }
        return value.trim();
      },
    },
    {
      key: "policy_description",
      header: "Policy Description",
      csvHeader: "Policy Description",
      type: "string",
      required: false,
      alwaysSend: true, // backend requires this key present even when empty
      width: 40,
      sampleValue: "Allows common file types with size limit",
      sampleValue2: "Blocks all executable and potentially dangerous files",
    },
    {
      key: "domain_name",
      header: "Domain Name",
      csvHeader: "Domain Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "example.com",
      sampleValue2: "company.org",
      validate: (value) => {
        if (!value || value.trim() === "") {
          throw new Error("Domain name is required");
        }
        // Basic domain validation regex
        const domainRegex =
          /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
        if (!domainRegex.test(value.trim())) {
          throw new Error("Invalid domain name format");
        }
        return value.trim().toLowerCase();
      },
    },
    {
      key: "max_attachment_size_mb",
      header: "Max Size (MB)",
      csvHeader: "Max Size (MB)",
      type: "number",
      required: false,
      width: 15,
      defaultValue: 0,
      sampleValue: 25,
      sampleValue2: 50,
      transform: (value) => {
        if (!value || value === "" || value === "No Limit") return 0;
        const num = Number(value);
        if (isNaN(num) || num < 0) return 0;
        if (num > 100) {
          throw new Error("Max attachment size cannot exceed 100 MB");
        }
        return num;
      },
    },
    {
      key: "is_active",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Inactive",
      transform: (value) => {
        if (typeof value === "boolean") return value;
        const str = String(value).toLowerCase().trim();
        if (["active", "true", "1", "yes", "enabled"].includes(str))
          return true;
        if (["inactive", "false", "0", "no", "disabled"].includes(str))
          return false;
        return true; // Default to active
      },
    },
    {
      key: "allowed_file_types",
      header: "Allowed File Types",
      csvHeader: "Allowed File Types",
      type: "array",
      required: false,
      width: 50,
      sampleValue: ALLOWED_EXTENSIONS.join(","),
      sampleValue2: ALLOWED_EXTENSIONS.join(","),
      transform: (value) => {
        if (!value || value.trim() === "") return [];

        // Split by comma and normalize extensions
        const extensions = value
          .split(",")
          .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
          .filter((ext) => ext.length > 0 && ext.length <= 10);

        return extensions;
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          const invalidExts = value.filter(
            (ext) => !/^[a-z0-9]+$/.test(ext) || ext.length > 10,
          );
          if (invalidExts.length > 0) {
            throw new Error(
              `Invalid file extensions: ${invalidExts.join(", ")}. Extensions must be alphanumeric and max 10 characters.`,
            );
          }
        }
        return value;
      },
    },
    {
      key: "blocked_file_types",
      header: "Blocked File Types",
      csvHeader: "Blocked File Types",
      type: "array",
      required: false,
      width: 50,
      sampleValue: GLOBAL_BLOCKED.filter(
        (ext) => !ALLOWED_EXTENSIONS.includes(ext),
      ).join(", "),
      sampleValue2: GLOBAL_BLOCKED.filter(
        (ext) => !ALLOWED_EXTENSIONS.includes(ext),
      ).join(", "),
      transform: (value) => {
        if (!value || value.trim() === "") {
          // Return default global blocked list
          return GLOBAL_BLOCKED;
        }

        // Split by comma and normalize extensions
        const extensions = value
          .split(",")
          .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
          .filter((ext) => ext.length > 0 && ext.length <= 10);

        return extensions;
      },
      validate: (value) => {
        if (Array.isArray(value)) {
          const invalidExts = value.filter(
            (ext) => !/^[a-z0-9]+$/.test(ext) || ext.length > 10,
          );
          if (invalidExts.length > 0) {
            throw new Error(
              `Invalid file extensions: ${invalidExts.join(", ")}. Extensions must be alphanumeric and max 10 characters.`,
            );
          }
        }
        return value;
      },
    },
  ],

  imap_sync_jobs: [
    {
      key: "imap_server",
      header: "IMAP Server",
      csvHeader: "IMAP Server",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "imap.gmail.com",
      sampleValue2: "outlook.office365.com",
      validate: (value) => {
        if (!value || !value.includes(".")) {
          throw new Error(
            "Invalid IMAP Server. It must contain a dot (e.g., imap.example.com).",
          );
        }
        return value;
      },
    },
    {
      key: "imap_port",
      header: "IMAP Port",
      csvHeader: "IMAP Port",
      type: "number",
      required: false, // Assuming strictly required for CSV to ensure data integrity, or optional if backend handles it
      width: 10,
      sampleValue: "993",
      sampleValue2: "143",
      validate: (value) => {
        const port = Number(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error("Invalid Port. Must be between 1 and 65535.");
        }
        return port;
      },
    },
    {
      key: "imap_username",
      header: "Source Username",
      csvHeader: "Source Username",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "user@external-domain.com",
      sampleValue2: "employee@old-provider.net",
    },
    {
      key: "imap_password",
      header: "Source Password",
      csvHeader: "Source Password",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "secretPassword123!",
      sampleValue2: "AppSpecificPassword",
    },
    {
      key: "to_email_prefix",
      header: "Dest. Prefix",
      csvHeader: "Dest. Prefix",
      type: "string",
      required: true,
      width: 20,
      description: "The part of the email before @",
      sampleValue: "john.doe",
      sampleValue2: "jane.smith",
    },
    {
      key: "to_email_domain",
      header: "Dest. Domain",
      csvHeader: "Dest. Domain",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "nekonik.com",
      sampleValue2: "nekonik.com",
    },
    {
      key: "sync_specific_folder",
      header: "Folder",
      csvHeader: "Folder",
      type: "string",
      required: false, // Changed to false to match UI optionality
      width: 15,
      sampleValue: "INBOX",
      sampleValue2: "Sent Items",
    },
    {
      key: "date_range_from",
      header: "Start Date",
      csvHeader: "Start Date",
      type: "date",
      required: false, // Changed to false to match UI optionality
      width: 15,
      description: "Format: YYYY-MM-DD",
      sampleValue: "2023-01-01",
      sampleValue2: "2023-06-01",
    },
    {
      key: "date_range_to",
      header: "End Date",
      csvHeader: "End Date",
      type: "date",
      required: false, // Changed to false to match UI optionality
      width: 15,
      description: "Format: YYYY-MM-DD",
      sampleValue: "2023-12-31",
      sampleValue2: "2023-06-30",
    },
  ],

  organizations: [
    {
      key: "name",
      header: "Organization Name",
      csvHeader: "Organization Name",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "Acme Corp",
      sampleValue2: "Globex Inc",
      validate: (value) => {
        if (value.length < 2) {
          throw new Error("Organization name must be at least 2 characters");
        }
        if (value.length > 250) {
          throw new Error("Organization name must not exceed 250 characters");
        }
        return value;
      },
    },
    {
      key: "parent_organization_id",
      header: "Parent Organization ID",
      csvHeader: "Parent Organization ID",
      type: "string",
      required: true,
      width: 40,
      description:
        "The ID of the existing organization this one belongs under. Find it on the Organization Details page.",
      sampleValue: "530b2473-b224-5f54-9185-89189ee72df8",
      sampleValue2: "530b2473-b224-5f54-9185-89189ee72df8",
      validate: validateOptionalUUID("Parent Organization ID"),
    },
    {
      key: "details.type",
      header: "Organization Type",
      csvHeader: "Organization Type",
      type: "select",
      required: true,
      width: 18,
      options: [
        { value: "Customer", label: "Customer" },
        { value: "Partner", label: "Partner" },
        { value: "Re-Seller", label: "Re-Seller" },
      ],
      sampleValue: "Customer",
      sampleValue2: "Partner",
    },
    {
      key: "allocated_quota",
      header: "Allocated Quota (GB)",
      csvHeader: "Allocated Quota (GB)",
      type: "number",
      required: true,
      width: 18,
      sampleValue: 10,
      sampleValue2: 25,
      validate: (value) => {
        if (value < 1) {
          throw new Error("Allocated quota must be at least 1 GB");
        }
        return value;
      },
    },
    {
      key: "allocated_email_identities",
      header: "Allocated Email Identities",
      csvHeader: "Allocated Email Identities",
      type: "number",
      required: true,
      width: 22,
      description: "Use -1 for unlimited",
      sampleValue: 10,
      sampleValue2: -1,
      validate: (value) => {
        if (value !== -1 && value < 1) {
          throw new Error("Value must be -1 (unlimited) or at least 1");
        }
        return value;
      },
    },
    {
      key: "activate",
      header: "Status",
      csvHeader: "Status",
      type: "boolean",
      required: false,
      width: 12,
      defaultValue: true,
      sampleValue: "Active",
      sampleValue2: "Active",
    },
    {
      key: "email_service_enabled",
      header: "Email Service Enabled",
      csvHeader: "Email Service Enabled",
      type: "boolean",
      required: false,
      width: 18,
      defaultValue: false,
      sampleValue: "Yes",
      sampleValue2: "No",
    },
    {
      key: "chat_service_enabled",
      header: "Chat Service Enabled",
      csvHeader: "Chat Service Enabled",
      type: "boolean",
      required: false,
      width: 18,
      defaultValue: false,
      sampleValue: "No",
      sampleValue2: "No",
    },
    {
      key: "details.description",
      header: "Description",
      csvHeader: "Description",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "Regional office for the eastern division",
      sampleValue2: "Reseller partner for the APAC region",
    },
    {
      key: "details.website",
      header: "Website",
      csvHeader: "Website",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "https://www.acmecorp.com",
      sampleValue2: "",
      validate: (value) => {
        if (!value) return value;
        try {
          new URL(value);
        } catch {
          throw new Error("Invalid website URL");
        }
        return value;
      },
    },
    {
      key: "details.gst_number",
      header: "GST Number",
      csvHeader: "GST Number",
      type: "string",
      required: false,
      width: 20,
      sampleValue: "22AAAAA0000A1Z5",
      sampleValue2: "",
    },
    // Every organization needs at least one branch - matches the manual
    // "Add Organization" wizard's own requirement, so these are always required.
    {
      key: "details.branches.branch_1.name",
      header: "Branch Name",
      csvHeader: "Branch Name",
      type: "string",
      required: true,
      width: 25,
      sampleValue: "Head Office",
      sampleValue2: "Regional Office",
    },
    {
      key: "details.branches.branch_1.address_one",
      header: "Branch Address Line 1",
      csvHeader: "Branch Address Line 1",
      type: "string",
      required: true,
      width: 30,
      sampleValue: "123 Main Street",
      sampleValue2: "456 Market Street",
    },
    {
      key: "details.branches.branch_1.address_two",
      header: "Branch Address Line 2",
      csvHeader: "Branch Address Line 2",
      type: "string",
      required: false,
      width: 25,
      sampleValue: "Suite 400",
      sampleValue2: "",
    },
    {
      key: "details.branches.branch_1.city",
      header: "Branch City",
      csvHeader: "Branch City",
      type: "string",
      required: true,
      width: 18,
      sampleValue: "New York",
      sampleValue2: "San Francisco",
    },
    {
      key: "details.branches.branch_1.state",
      header: "Branch State",
      csvHeader: "Branch State",
      type: "string",
      required: true,
      width: 18,
      sampleValue: "NY",
      sampleValue2: "CA",
    },
    {
      key: "details.branches.branch_1.country",
      header: "Branch Country",
      csvHeader: "Branch Country",
      type: "string",
      required: true,
      width: 18,
      sampleValue: "USA",
      sampleValue2: "USA",
    },
    {
      key: "details.branches.branch_1.pincode",
      header: "Branch Pincode",
      csvHeader: "Branch Pincode",
      type: "string",
      required: true,
      width: 15,
      sampleValue: "10001",
      sampleValue2: "94105",
    },
    // Contact is only mandatory for admins with CRM access - the actual
    // `required` flag here gets toggled per-import by
    // getOrganizationImportFieldMapping() below based on that permission.
    {
      key: "details.contact_info.contact_1.name",
      header: "Contact Name",
      csvHeader: "Contact Name",
      type: "string",
      required: false,
      width: 25,
      description: "Required only if your account has CRM access.",
      sampleValue: "Jane Doe",
      sampleValue2: "John Smith",
    },
    {
      key: "details.contact_info.contact_1.email",
      header: "Contact Email",
      csvHeader: "Contact Email",
      type: "string",
      required: false,
      width: 30,
      sampleValue: "jane.doe@acmecorp.com",
      sampleValue2: "",
      validate: (value) => {
        if (!value) return value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error("Invalid email format");
        }
        return value;
      },
    },
    {
      key: "details.contact_info.contact_1.phone",
      header: "Contact Phone",
      csvHeader: "Contact Phone",
      type: "string",
      required: false,
      width: 20,
      description: "International format, e.g. +123456789012",
      sampleValue: "+12125551234",
      sampleValue2: "",
      validate: (value) => {
        if (!value) return value;
        if (!/^\+?\d{1,15}$/.test(value)) {
          throw new Error(
            "Phone must be in international format (e.g. +123456789012)",
          );
        }
        return value;
      },
    },
    {
      key: "details.contact_info.contact_1.type",
      header: "Contact Type",
      csvHeader: "Contact Type",
      type: "string",
      required: false,
      width: 15,
      sampleValue: "Primary",
      sampleValue2: "",
    },
    {
      key: "details.contact_info.contact_1.notes",
      header: "Contact Notes",
      csvHeader: "Contact Notes",
      type: "string",
      required: false,
      width: 25,
      sampleValue: "Main point of contact for billing",
      sampleValue2: "",
      validate: (value, transformedRow) => {
        const contact = transformedRow?.details?.contact_info?.contact_1;
        const hasAnyContactField =
          contact && (contact.email || contact.phone || contact.type || value);
        if (hasAnyContactField && !contact?.name) {
          throw new Error(
            "Contact Name is required when other Contact fields are filled in",
          );
        }
        return value;
      },
    },
  ],
};

// Contact is only mandatory for admins with CRM access (mirrors the manual
// "Add Organization" wizard's `crm:service:view` gate) - build the field
// mapping for the import modal from this rather than the static array above.
export const getOrganizationImportFieldMapping = (hasCrmPermission = false) =>
  IMPORT_FIELD_MAPPINGS.organizations.map((field) =>
    field.key === "details.contact_info.contact_1.name"
      ? { ...field, required: hasCrmPermission }
      : field,
  );
