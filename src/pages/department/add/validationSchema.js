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

import * as yup from "yup";

export const departmentFormSchema = yup.object().shape({
  department_name: yup
    .string()
    .required("Department name is required")
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must not exceed 100 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_.&()]+$/,
      "Department name can only contain letters, numbers, spaces, and common punctuation",
    ),

  associated_organization_id: yup
    .string()
    .required("Associated organization is required")
    .max(50, "Associated organization ID must not exceed 50 characters"),

  department_details: yup
    .object()
    .shape({
      address: yup
        .string()
        .max(200, "Address must not exceed 200 characters")
        .optional(),

      description: yup
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

      notes: yup
        .string()
        .max(1000, "Notes must not exceed 1000 characters")
        .optional(),

      authorized_persons: yup
        .array()
        .of(
          yup.object().shape({
            name: yup
              .string()
              .max(100, "Name must not exceed 100 characters")
              .optional(),

            email: yup
              .string()
              .email("Please enter a valid email address")
              .max(100, "Email must not exceed 100 characters")
              .optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});
