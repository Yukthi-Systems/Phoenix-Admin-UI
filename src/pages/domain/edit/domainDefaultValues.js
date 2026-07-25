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

// Updated domainDefaultValues.js for Edit Domain

export const domainDefaultValues = {
  anti_phishing_secret_code: "",
  details: {
    address: "",
    description: "",
  },
  caution_id: null,
  domain_name: "",
  disclaimer_id: null,
  session_timeout: 120,
  filter_policy_id: null,
  attachment_policy_id: null,
  // Updated password age structure - keep fields at root level for form functionality
  enable_max_password_age: false,
  max_password_age: 90,
  notify_1: 2,
  notify_2: 5,
  notify_3: 9,

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
};
