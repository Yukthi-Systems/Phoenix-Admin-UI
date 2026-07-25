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

export const createTicketSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(250, "Title must be at most 250 characters"),

  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),

  category: yup
    .string()
    .required("Category is required")
    .max(150, "Category must not exceed 150 characters"),

  sub_category: yup
    .string()
    .required("Sub-category is required")
    .max(150, "Sub-category must not exceed 150 characters"),

  priority: yup
    .string()
    .required("Priority is required")
    .max(20, "Priority must not exceed 20 characters"),
});
