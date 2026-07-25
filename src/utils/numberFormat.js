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

/**
 * Utility functions for formatting numbers in a readable way
 */

// Format large numbers with K, M, B suffixes
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "0";

  const number = Number(num);

  if (number === 0) return "0";

  const absNumber = Math.abs(number);

  if (absNumber >= 1000000000) {
    return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }

  if (absNumber >= 1000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (absNumber >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return number.toString();
};

// Format numbers with commas (for tooltips and detailed views)
export const formatNumberWithCommas = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Number(num).toLocaleString();
};

// Format file sizes (bytes to GB, MB, KB)
export const formatFileSize = (bytes, decimals = 1) => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return "0 B";

  const number = Number(bytes);

  if (number === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(number) / Math.log(k));

  return parseFloat((number / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Format percentages
export const formatPercentage = (value, total, decimals = 0) => {
  if (!value || !total || total === 0) return "0%";
  const percentage = (value / total) * 100;
  return percentage.toFixed(decimals) + "%";
};

// Format space usage with appropriate units
export const formatSpaceUsage = (used, total, unit = "GB") => {
  if (!used && !total) return "N/A";

  const usedNum = Number(used) || 0;
  const totalNum = Number(total) || 0;

  if (totalNum === 0) return `${usedNum} ${unit}`;

  const percentage = Math.round((usedNum / totalNum) * 100);
  return `${usedNum} ${unit} of ${totalNum} ${unit} (${percentage}%)`;
};

// Smart number formatting for different contexts
export const smartFormat = (num, context = "default") => {
  const number = Number(num);

  switch (context) {
    case "storage":
      return formatFileSize(number * 1024 * 1024 * 1024); // Assuming input is in GB
    case "count":
      return formatNumber(number);
    case "detailed":
      return formatNumberWithCommas(number);
    case "percentage":
      return number.toFixed(1) + "%";
    default:
      return formatNumber(number);
  }
};

export const toFixedNumber = (value, decimals = 2) => {
  if (typeof value !== "number") {
    value = parseFloat(value);
    if (isNaN(value)) return null;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const formatDuration = (minutes) => {
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.length > 0 ? parts.join(" ") : "0m";
};
