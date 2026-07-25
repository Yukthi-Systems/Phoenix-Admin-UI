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

// src/pages/server/mailboxSync/add/imapSyncDefaultValues.js

export const getDefaultDateRange = () => {
  return {
    startDate: null,
    endDate: null,
  };
};

export const imapSyncDefaultValues = {
  imap_server: "",
  imap_port: "", // No default port
  imap_username: "",
  imap_password: "",
  sync_specific_folder: "", // No default folder
  to_email_prefix: "",
  to_email_domain: "",
  to_email_full: "",
  date_range: getDefaultDateRange(), // Empty date range
};
