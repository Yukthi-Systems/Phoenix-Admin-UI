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

// TEMPORARY: identity password reset by existing password / email link, used
// by /reset/admin's Email Identity tab and the /reset/link landing page
// (pages/identityPasswordReset). Expected to be removed after ~1 month.
//
// All three endpoints are public (no session) - they're used by mailbox
// users who are not admin-panel users.

import { API_URL } from "@/constants/constants";
import axios from "axios";

// The backend runs a breach check and a synchronous SSO password sync on
// every reset, so allow more than the usual 5s before giving up.
const RESET_TIMEOUT = 20000;

// Re-throw with the HTTP status attached so the UI can tell "wrong current
// password" (403) apart from "account not found" (424) etc.
const toResetError = (error, fallback) => {
  const response = error?.response || {};
  const err = new Error(response?.data?.message || fallback);
  err.status = response?.status ?? null;
  err.tracebackId = response?.data?.traceback_id ?? null;
  return err;
};

/**
 * Reset an identity's password by proving the current one.
 * POST /identities/reset/current-password
 */
export const resetIdentityPasswordWithCurrent = async ({
  email,
  current_password_base64,
  new_password_base64,
  recaptcha_token,
}) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${API_URL}/identities/reset/current-password`,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      timeout: RESET_TIMEOUT,
      data: {
        email,
        current_password_base64,
        new_password_base64,
        recaptcha_token,
      },
    });
    return res.data;
  } catch (error) {
    throw toResetError(error, "Failed to reset password. Please try again.");
  }
};

/**
 * Email a one-time reset link to the identity's own (primary) mailbox.
 * POST /identities/reset/password/{email}/init?verify_via=email_link
 */
export const requestIdentityPasswordResetLink = async ({
  email,
  recaptcha_token,
}) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${API_URL}/identities/reset/password/${encodeURIComponent(email)}/init`,
      params: { verify_via: "email_link", recaptcha_token },
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      timeout: RESET_TIMEOUT,
    });
    return res.data;
  } catch (error) {
    throw toResetError(
      error,
      "Failed to send the reset link. Please try again.",
    );
  }
};

/**
 * Complete a reset started via the emailed link.
 * POST /identities/reset/password/{email}/complete
 */
export const completeIdentityPasswordResetLink = async ({
  email,
  secret,
  new_password_base64,
}) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${API_URL}/identities/reset/password/${encodeURIComponent(email)}/complete`,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      timeout: RESET_TIMEOUT,
      data: {
        otp: secret,
        new_password_base64,
        verify_via: "email_link",
      },
    });
    return res.data;
  } catch (error) {
    throw toResetError(error, "Failed to reset password. Please try again.");
  }
};
