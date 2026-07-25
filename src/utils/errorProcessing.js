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

export const processError = (error) => {
  let message = "Unknown error occurred";
  let tracebackId = null;

  if (error.response?.data) {
    message =
      error.response.data.message || error.message || "Unknown error occurred";
    tracebackId = error.response.data.traceback_id || null;
  } else {
    message = error.message || "Unknown error occurred";
  }

  return { message, tracebackId };
};

/**
 * Format error for display with traceback ID
 */
export const formatErrorMessage = (error) => {
  const { message, tracebackId } = processError(error);

  let displayMessage = message;
  if (tracebackId) {
    displayMessage += ` (Traceback ID: ${tracebackId})`;
  }

  return displayMessage;
};
