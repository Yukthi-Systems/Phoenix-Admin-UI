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

export const organizationDefaultValues = {
  activate: true,
  allocated_quota: 1.0,
  allocated_email_identities: 1,
  details: {
    description: "",
    gst_number: "",
    website: "",
    branches: {},
    contact_info: {},
    type: "Customer",
  },
  email_service_enabled: false,
  chat_service_enabled: false,
  file_service_enabled: false,
  name: "",
  parent_organization_id: "",
};
