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

// Updated domainDefaultValues.js

import { generateSecretCode } from "@/utils/secretCode";

// A factory, not a static object: `domainDefaultValues` used to call
// generateSecretCode() once at module-evaluation time, so every domain
// created in the same session (until a full page reload) got the exact
// same anti_phishing_secret_code. Generating it fresh each time these
// defaults are requested gives every domain its own code.
export const getDomainDefaultValues = () => ({
  activate: false,
  anti_phishing_secret_code: generateSecretCode() || "",
  details: {
    address: "",
    description: "",
  },
  caution_id: null,
  domain_name: "",
  disclaimer_id: null,
  session_timeout: 120,
  filter_policy_id: null,
  // Keep fields at root level for form to work properly
  enable_max_password_age: false,
  max_password_age: 90,

  notify_1: 2,
  notify_2: 5,
  notify_3: 9,

  // Keep the object structure for API compatibility
  max_password_age_properties: {
    enable_max_password_age: false,
    max_password_age: 90,
    notify_at: [2, 5, 9],
  },

  enable_catch_all: false,
  catch_all_forwarding_address: null,
  enable_hybrid_mode: false,
  hybrid_connector_properties: {
    description: "",
    fqdn: "",
    ipv4: "",
    ipv6: "",
    port: 25,
  },
  spam_destination: "SPAM",
  // delete_spam: false,
  spam_destination_properties: {
    description: "",
    folder_name: "",
  },
});
