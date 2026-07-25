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

import { API_URL } from "@/constants/constants";
import axios from "axios";

export const initiatePasswordReset = async (
  user_name,
  verify_via,
  recaptcha_token,
) => {
  const url = `${API_URL}/user/reset/password/${user_name}/init?verify_via=${verify_via}&recaptcha_token=${recaptcha_token}`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,

      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    throw new Error(
      response?.data?.message ||
        "Failed to initiate password reset. Please try again.",
    );
  }
};

export const completePasswordReset = async (user_name, data) => {
  const url = `${API_URL}/user/reset/password/${user_name}/complete`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      data,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    throw new Error(
      response?.data?.message ||
        "Failed to complete password reset. Please try again.",
    );
  }
};

export const initiatePasswordResetIdentity = async (
  email_id,
  verify_via,
  recaptcha_token,
) => {
  const url = `${API_URL}/identities/reset/password/${email_id}/init?verify_via=${verify_via}&recaptcha_token=${recaptcha_token}`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,

      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    throw new Error(
      response?.data?.message ||
        "Failed to initiate password reset. Please try again.",
    );
  }
};

export const completePasswordResetIdentity = async (email_id, data) => {
  const url = `${API_URL}/identities/reset/password/${email_id}/complete`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      data,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    throw new Error(
      response?.data?.message ||
        "Failed to complete password reset. Please try again.",
    );
  }
};
