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

import {
  getLocalDateWithTimeDefault,
  toDateTimeLocalStringDefault,
} from "@/utils/dateFormat";

export const loginLogDefaultValue = {
  organization_id: "",
  date_range: {
    from_date: toDateTimeLocalStringDefault(
      getLocalDateWithTimeDefault(0, 0, 0),
    ),
    to_date: toDateTimeLocalStringDefault(
      getLocalDateWithTimeDefault(23, 59, 59),
    ),
  },
  domain_name: "",
  email_id: "",
  origin_ip_address: "",
};
