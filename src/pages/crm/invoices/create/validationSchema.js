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

export const invoiceFormSchema = yup.object().shape({
  invoice_id: yup.string().required("Invoice ID is required"),

  basic_details: yup.object().shape({
    description: yup
      .string()
      .required("Description is required")
      .min(3, "Description must be at least 3 characters"),
    currency: yup.string().required("Currency is required"),
    amount: yup.number().min(0, "Amount must be positive"),
    is_refundable: yup.boolean(),
  }),

  invoice_date: yup
    .date()
    .required("Invoice date is required")
    .max(new Date(), "Invoice date cannot be in the future"),

  due_date: yup
    .date()
    .required("Due date is required")
    .min(yup.ref("invoice_date"), "Due date must be after invoice date"),

  items: yup
    .array()
    .of(
      yup.object().shape({
        description: yup
          .string()
          .required("Item description is required")
          .min(2, "Description must be at least 2 characters"),
        rate: yup.string(),
        amount: yup
          .string()
          .required("Amount is required")
          .min(0, "Amount must be positive"),
      }),
    )
    .min(1, "At least one item is required"),

  tax_details: yup.object().shape({
    tax_rate: yup
      .number()
      .min(0, "Tax rate must be positive")
      .max(100, "Tax rate cannot exceed 100%"),
    tax_amount: yup.number().min(0, "Tax amount must be positive"),
    total_amount: yup.number().min(0, "Total amount must be positive"),
  }),
});

export const step1Schema = yup.object({
  selected_branch: yup.string().required("Please select a branch"),
  invoice_id: yup.string().required("Invoice ID is required"),
  invoice_date: yup.date().required("Invoice date is required"),
  due_date: yup.string().required("Due date is required"),
  description: yup
    .string()
    .required("Description is required")
    .min(3, "Description must be at least 3 characters"),
  is_paid: yup.boolean().default(false),
  is_refundable: yup.boolean().default(false),
});

export const step2Schema = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        description: yup
          .string()
          .required("Item description is required")
          .min(3, "Description must be at least 3 characters"),
        rate: yup.string().optional(),
        amount: yup
          .number()
          .required("Amount is required")
          .min(0.01, "Amount must be greater than 0")
          .typeError("Amount must be a valid number"),
      }),
    )
    .min(1, "At least one item is required"),

  sgst_rate: yup
    .number()
    .min(0, "SGST rate cannot be negative")
    .max(100, "SGST rate cannot exceed 100%")
    .default(9),
  cgst_rate: yup
    .number()
    .min(0, "CGST rate cannot be negative")
    .max(100, "CGST rate cannot exceed 100%")
    .default(9),
  igst_rate: yup
    .number()
    .min(0, "IGST rate cannot be negative")
    .max(100, "IGST rate cannot exceed 100%")
    .default(18),
});
