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

export const generalPolicyDefaultValues = {
  block_all_incoming_emails: false,
  block_all_outgoing_emails: false,
  domain: "",
  incoming_exception_domains: [],
  incoming_exception_emails: [],
  is_active: true,
  outgoing_exception_domains: [],
  outgoing_exception_emails: [],
  outgoing_size_limit_mb: 0,
  policy_description: "",
  policy_name: "",
  block_all_incoming_domains : false,
  block_all_outgoing_domains : false,
};
