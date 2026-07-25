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
  toDateTimeLocalStringDefault,
  toDateTimeLocalStringDefaultReduce,
} from "@/utils/dateFormat";

export const emailLogDefaultValue = {
  organization_id: "",
  date_range: {
    from_date: "",
    to_date: "",
  },
  domain_name: "",
  euid: "",
  from_email_id: "",
  log_status: "",
  log_type: "",
  subject: "",
  to_email_ids: [],
};
