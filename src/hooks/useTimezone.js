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

import { useAtomValue } from "jotai";
import moment from "moment-timezone";
import { userProfileAtom } from "@/store/userProfile";

export const useUserTimezone = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const timezone = userProfile?.user_details?.timezone || "UTC";

  /**
   * Convert a date in user's timezone to UTC ISO string
   * Useful before sending dates to the API
   */
  const convertToUTC = (dateInput) => {
    if (!dateInput) return null;

    try {
      // Accept string or Date
      const utcDate = moment.tz(dateInput, timezone).utc().toISOString();
      return utcDate;
    } catch (error) {
      console.error("Error converting to UTC:", error);
      return null;
    }
  };

  /**
   * Format a UTC date into user's local timezone
   */
  const formatUserDate = (date, formatString = "MMM DD, YYYY HH:mm") => {
    if (!date) return "";

    try {
      return moment.utc(date).tz(timezone).format(formatString);
    } catch {
      return "Invalid Date";
    }
  };

  const formatUserDateNice = (date) => {
    const result = formatUserDate(date, "DD MMM YYYY, hh:mm A");

    return result;
  };

  const formatUserDateOnly = (date) => {
    return formatUserDate(date, "DD MMM YYYY");
  };

  const formatUserTimeOnly = (date) => {
    return formatUserDate(date, "hh:mm A");
  };

  const formatUserDateShort = (date) => {
    return formatUserDate(date, "MMM DD, YYYY");
  };

  const formatUserDateTable = (date) => {
    return formatUserDate(date, "DD/MM/YYYY HH:mm");
  };

  const formatUserDateDash = (date) => {
    return formatUserDate(date, "DD-MM-YYYY");
  };

  return {
    formatUserDate,
    formatUserDateNice,
    formatUserDateOnly,
    formatUserTimeOnly,
    formatUserDateShort,
    formatUserDateTable,
    convertToUTC,
    formatUserDateDash,
    userTimezone: timezone,
  };
};
