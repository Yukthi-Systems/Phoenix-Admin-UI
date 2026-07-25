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
export const validationSchema = Yup.object().shape({
  date_range: Yup.object().shape({
    from_date: Yup.string().required("From date time is required"),
    to_date: Yup.string().required("To date time is required"),
  }),
  domain_name: Yup.string().required("Domain selection is required"),
});
