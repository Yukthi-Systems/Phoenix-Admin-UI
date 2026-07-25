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

import * as Yup from "yup";

// Helper to extract domain from email
const getDomain = (entry) =>
  entry.includes("@") ? entry.split("@")[1] : entry;
const isDomain = (entry) => !entry.includes("@");

export const filtersPolicyValidationSchema = Yup.object().shape({
  policy_name: Yup.string()
    .required("Policy Name is required")
    .min(3, "Policy name must be at least 3 characters")
    .max(200, "Policy name must not exceed 200 characters"),
  is_active: Yup.boolean(),
  // delete_mails: Yup.boolean(),

  white_entries: Yup.array()
    .of(Yup.string())
    // Ensure at least one entry exists in either list
    .test(
      "at-least-one-required",
      "At least one entry is required in either Allowed or Blocked list",
      function (whiteEntries) {
        const blackEntries = this.parent.black_entries || [];
        const currentWhite = whiteEntries || [];
        return currentWhite.length > 0 || blackEntries.length > 0;
      },
    )
    // Validation for Allowed List Conflicts
    .test(
      "white-list-conflict",
      "Conflict in Allowed List",
      function (whiteEntries) {
        const blackEntries = this.parent.black_entries || [];
        if (!whiteEntries || !blackEntries) return true;

        for (const w of whiteEntries) {
          const wIsDomain = isDomain(w);
          const wDomain = wIsDomain ? w : getDomain(w);

          for (const b of blackEntries) {
            const bIsDomain = isDomain(b);
            const bDomain = bIsDomain ? b : getDomain(b);

            // 1. Duplicate Check
            if (w.toLowerCase() === b.toLowerCase()) {
              return this.createError({
                message: `Entry '${w}' cannot exist in both lists.`,
              });
            }

            // 2. Case: Trying to allow Email, but its Domain is Blocked
            if (
              !wIsDomain &&
              bIsDomain &&
              wDomain.toLowerCase() === b.toLowerCase()
            ) {
              return this.createError({
                message:
                  "Cannot add or whitelist an email address while its domain is blacklisted",
              });
            }

            // 3. Case: Trying to allow Domain, but a specific Email from it is Blocked
            if (
              wIsDomain &&
              !bIsDomain &&
              bDomain.toLowerCase() === w.toLowerCase()
            ) {
              return this.createError({
                message: `Cannot allow domain '${w}' because specific email '${b}' from this domain is blocked.`,
              });
            }
          }
        }
        return true;
      },
    ),

  black_entries: Yup.array()
    .of(Yup.string())
    // Validation for Blocked List Conflicts
    .test(
      "black-list-conflict",
      "Conflict in Blocked List",
      function (blackEntries) {
        const whiteEntries = this.parent.white_entries || [];
        if (!blackEntries || !whiteEntries) return true;

        for (const b of blackEntries) {
          const bIsDomain = isDomain(b);
          const bDomain = bIsDomain ? b : getDomain(b);

          for (const w of whiteEntries) {
            const wIsDomain = isDomain(w);
            const wDomain = wIsDomain ? w : getDomain(w);

            // 1. Duplicate Check
            if (b.toLowerCase() === w.toLowerCase()) {
              return this.createError({
                message: `Entry '${b}' cannot exist in both lists.`,
              });
            }

            // 2. Case: Trying to block Domain, but an Email from it is Whitelisted
            if (
              bIsDomain &&
              !wIsDomain &&
              wDomain.toLowerCase() === b.toLowerCase()
            ) {
              return this.createError({
                message:
                  "This domain cannot be blocked because one or more email addresses from it are whitelisted.",
              });
            }

            // 3. Case: Trying to block Email, but its Domain is Whitelisted
            if (
              !bIsDomain &&
              wIsDomain &&
              bDomain.toLowerCase() === w.toLowerCase()
            ) {
              return this.createError({
                message: `Cannot block email '${b}' because its domain '${w}' is allowed.`,
              });
            }
          }
        }
        return true;
      },
    ),
});
