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

export const crmLinkFormSchema = Yup.object().shape({
  notes: Yup.string().required("Notes is required"),
  service_code: Yup.string().required("CRM Service code is required"),
  details: Yup.object().shape({
    start_date: Yup.string(),
    expiry_date: Yup.string().test(
      "is-after-start",
      "Expiry date must be after start date",
      function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        const startDate = new Date(start_date);
        const expiryDate = new Date(value);

        return expiryDate >= startDate;
      },
    ),
  }),
});
