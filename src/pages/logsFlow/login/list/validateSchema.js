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
  email_id: Yup.string().notRequired(),
  origin_ip_address: Yup.string().notRequired(),
  domain_name: Yup.string().required("Domain selection is required"),
  date_range: Yup.object()
    .shape({
      startDate: Yup.date().nullable().notRequired(),
      endDate: Yup.date().nullable().notRequired(),
    })
    .test("date-range", "Date range is invalid", function (value) {
      const { startDate, endDate } = value || {};

      if (!startDate && !endDate) {
        return true; // Both null is valid (no filter)
      }

      if (startDate && endDate) {
        if (startDate >= endDate) {
          return this.createError({
            message: "Start date must be before end date",
            path: "date_range",
          });
        }

        // Check for max 30 days
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 30) {
          return this.createError({
            message: "Maximum date range is 30 days",
            path: "date_range",
          });
        }
      }

      return true;
    }),
});
