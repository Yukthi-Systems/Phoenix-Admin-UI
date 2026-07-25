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

export const serverDefaultValues = {
  host_name: "",
  is_active: true,
  quota_allocated: 10,
  is_monitoring: false,
  is_mailbox_server: false,
  is_accepting_new_mailboxes: false,
  server_info: {
    description: "",
    ipv4: "",
    ipv6: "",
    location: "",
    os: "",
  },
  smtp_port: 25,
  storage_path: "/data/vmail",
};
