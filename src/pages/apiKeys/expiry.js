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

// Compliance: an API key may be valid for at most 6 months from creation.
// The expiry is set once at creation and can't be edited afterwards.
export const MAX_EXPIRY_MONTHS = 6;

const pad = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DD" in local time, as used by <input type="date">
export const toDateInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Parses "YYYY-MM-DD" as a local date (new Date("YYYY-MM-DD") would be UTC)
export const fromDateInputValue = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getMinExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
};

export const getMaxExpiryDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + MAX_EXPIRY_MONTHS);
  return toDateInputValue(date);
};

// The key stays valid through the whole chosen day (local time)
export const expiryDateToISO = (dateValue) => {
  const date = fromDateInputValue(dateValue);
  date.setHours(23, 59, 59);
  return date.toISOString();
};

export const isApiKeyExpired = (expiredAt) =>
  !!expiredAt && new Date(expiredAt).getTime() <= Date.now();
