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

const currentDate = new Date();
const nextMonth = new Date(currentDate);
nextMonth.setMonth(currentDate.getMonth() + 1);

export const invoiceDefaultValues = {
  invoice_id: "",

  basic_details: {
    description: "",
    currency: "INR",
    amount: 0,
    is_refundable: false,
  },

  invoice_date: currentDate.toISOString().split("T")[0],
  due_date: nextMonth.toISOString().split("T")[0],

  items: [
    {
      description: "",
      rate: "",
      amount: 0,
    },
  ],

  tax_details: {
    tax_rate: 18,
    tax_amount: 0,
    total_amount: 0,
  },

  total_amount: 0,
};

export const step1DefaultValues = {
  selected_branch: "",
  invoice_id: "",
  invoice_date: new Date().toISOString().split("T")[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16),
  description: "",
  is_paid: false,
  is_refundable: false,
  client_details: null,
};

// Default values for step 2
export const step2DefaultValues = {
  items: [
    {
      description: "",
      rate: "",
      amount: 0,
    },
  ],
  sgst_rate: 9,
  cgst_rate: 9,
  igst_rate: 18,
  manual_total_amount: null,
};
