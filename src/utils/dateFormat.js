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

export const formatDate = (dateString) => {
  const givenDate = new Date(dateString);
  if (isNaN(givenDate)) return "Invalid Date";

  return givenDate.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateWithoutTime = (dateString) => {
  const givenDate = new Date(dateString);
  if (isNaN(givenDate)) return "Invalid Date";

  return givenDate.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export const formatDateOnly = (dateString) => {
  const givenDate = new Date(dateString);
  if (isNaN(givenDate)) return "Invalid Date";

  return givenDate.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function toLocalISOString(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = pad(Math.floor(Math.abs(offset) / 60));
  const minutes = pad(Math.abs(offset) % 60);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hours}:${minutes}`;
}

export function getLocalISOWithTime(hours, minutes, seconds) {
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);

  const tzOffsetMinutes = -date.getTimezoneOffset(); // invert sign
  const offsetHours = Math.floor(Math.abs(tzOffsetMinutes) / 60);
  const offsetMins = Math.abs(tzOffsetMinutes) % 60;
  const offsetSign = tzOffsetMinutes >= 0 ? "+" : "-";

  const pad = (n) => n.toString().padStart(2, "0");
  const offset = `${offsetSign}${pad(offsetHours)}:${pad(offsetMins)}`;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(hours)}:${pad(minutes)}:${pad(seconds)}${offset}`
  );
}

export function toDateTimeLocalStringDefault(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function getLocalDateWithTimeDefault(hours, minutes, seconds) {
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

export function toDateTimeLocalStringDefaultReduce(minutesAgo = 15) {
  let date = new Date();

  let Newdate = new Date(date.getTime() - minutesAgo * 60 * 1000);

  const pad = (n) => n.toString().padStart(2, "0");
  return (
    `${Newdate.getFullYear()}-${pad(Newdate.getMonth() + 1)}-${pad(Newdate.getDate())}` +
    `T${pad(Newdate.getHours())}:${pad(Newdate.getMinutes())}:${pad(Newdate.getSeconds())}`
  );
}

export const getValidDate = (dateInput) => {
  if (!dateInput) return new Date();

  // If it's already a Date object and valid
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }

  // If it's a string, try to parse it
  if (typeof dateInput === "string") {
    const parsedDate = new Date(dateInput);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  // Fallback to current date
  console.warn("Invalid date provided, using current date:", dateInput);
  return new Date();
};
