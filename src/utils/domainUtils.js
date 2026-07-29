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

/**
 * Normalize a raw `domain_details` API response (from GET /domain/details/{name})
 * into the flat field shape used by the Add/Edit Domain forms and the domain
 * bulk-import field mapping (src/constants/import.js `domains` entity).
 *
 * The raw API uses different names/shapes for a few fields than the form does
 * (e.g. `catch_all` -> `enable_catch_all`, `connector_properties` ->
 * `hybrid_connector_properties`, `max_password_age_properties.notify_at[]` ->
 * flat `notify_1`/`notify_2`/`notify_3`). This is the single place that
 * mapping lives, shared by the Edit Domain form (prefill) and the domain
 * export (so an exported file matches the import template exactly).
 */
export const normalizeDomainDetailsForForm = (domain) => {
  if (!domain) return null;

  const notifyAt = domain?.max_password_age_properties?.notify_at || [
    2, 5, 9,
  ];
  const hasMaxPasswordAge = domain?.max_password_age > 0;

  return {
    domain_name: domain?.domain_name || "",
    session_timeout: domain?.session_timeout || 720,
    caution_id: domain?.caution_id || null,
    disclaimer_id: domain?.disclaimer_id || null,
    anti_phishing_secret_code: domain?.anti_phishing_secret_code || "",
    filter_policy_id: domain?.filter_policy_id || null,
    attachment_policy_id: domain?.attachment_policy_id || null,
    details: {
      address: domain?.details?.address || "",
      description: domain?.details?.description || "",
    },
    enable_max_password_age: hasMaxPasswordAge,
    max_password_age: domain?.max_password_age || 90,
    notify_1: notifyAt[0] || 2,
    notify_2: notifyAt[1] || 5,
    notify_3: notifyAt[2] || 9,
    enable_catch_all: domain?.catch_all || false,
    catch_all_forwarding_address: domain?.catch_all_forward_to_email || null,
    enable_hybrid_mode: domain?.is_hybrid || false,
    hybrid_connector_properties: {
      description: domain?.connector_properties?.description || "",
      fqdn: domain?.connector_properties?.fqdn || "",
      ipv4: domain?.connector_properties?.ipv4 || "",
      ipv6: domain?.connector_properties?.ipv6 || "",
      // The backend uses -1 (not just missing/0) as a "not configured"
      // sentinel for domains without hybrid mode — `|| 25` doesn't catch
      // that since -1 is truthy, so check explicitly for a positive port.
      port: domain?.connector_properties?.port > 0
        ? domain.connector_properties.port
        : 25,
    },
    spam_destination: domain?.spam_destination || "Folder",
    spam_destination_properties: {
      description: domain?.spam_destination_properties?.description || "",
      folder_name: domain?.spam_destination_properties?.folder_name
        ? decodeURIComponent(domain?.spam_destination_properties?.folder_name)
        : "",
    },
  };
};
