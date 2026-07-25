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

import { domainHelp } from "./domain";
import { userHelp } from "./user";
// Import other sections as you add them
// import { mailboxHelp } from "./mailbox";
// import { groupHelp } from "./group";

export const helpDeskData = {
  ...domainHelp,
  ...userHelp,
  // ...mailboxHelp,
  // ...groupHelp,
};

// Helper to get help data for a route
export const getHelpForRoute = (route) => {
  // Exact match
  if (helpDeskData[route]) {
    return helpDeskData[route];
  }

  // Dynamic route matching (e.g., /user/edit/:user_id)
  const routeParts = route.split("/").filter(Boolean);
  const matchingKey = Object.keys(helpDeskData).find((key) => {
    const keyParts = key.split("/").filter(Boolean);
    if (keyParts.length !== routeParts.length) return false;

    return keyParts.every((part, idx) => {
      return part.startsWith(":") || part === routeParts[idx];
    });
  });

  return matchingKey ? helpDeskData[matchingKey] : null;
};