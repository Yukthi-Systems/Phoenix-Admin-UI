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

import axios from "axios";
import { adminStore } from "../store/store";
import { csrfTokenAtom } from "../store/csrftoken";
import Cookies from "js-cookie";
import { addLogs } from "./logs";
import { notifiTokenAtom } from "@/store/notifitoken";
import { API_URL } from "@/constants/constants";

export const login = async (username, password, recaptcha_token) => {
  const url = `${API_URL}/user/login`;
  const method = "POST";
  const payload = {
    user_name: username,
    password: btoa(password),
    recaptcha_token,
  };

  try {
    const res = await axios({
      method,
      url,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      data: payload,
      timeout: 5000,
    });

    const csrfToken = res.headers["x-csrf-token"] || null;
    const notiToken = res.headers["x-notifications-token"] || null;

    adminStore.set(notifiTokenAtom, notiToken);
    adminStore.set(csrfTokenAtom, csrfToken);

    // X-Session-Expiry (seconds, from MAX_AGE_OF_CACHE) is sent on every
    // /login response regardless of whether 2FA follows - confirmed with
    // backend. The 2FA validation endpoints re-issue the session cookie with
    // their own fresh MAX_AGE_OF_CACHE window but don't send this header
    // themselves, so for a 2FA login this timestamp is captured slightly
    // before the real cookie is set - the displayed countdown runs a little
    // ahead of the actual expiry rather than behind it, which is the safe
    // direction to be wrong in (timer hitting zero a bit early beats it
    // saying you have time when you're already logged out).
    const sessionExpirySeconds = Number(res.headers["x-session-expiry"]);
    if (!isNaN(sessionExpirySeconds) && sessionExpirySeconds > 0) {
      localStorage.setItem(
        "session_expires_at",
        String(Date.now() + sessionExpirySeconds * 1000),
      );
    }

    const { is_totp_2fa_active, is_sms_2fa_active, is_email_2fa_active } =
      res.data?.details || {};
    if (!is_totp_2fa_active && !is_sms_2fa_active && !is_email_2fa_active) {
      await addLogs({
        values: res,
        type: "success",
        method,
        action_type: "user_login",
        payload: { user_name: username },
        message: `User ${username} successfully authenticated and logged in`,
      });
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "user_login",
      payload: { user_name: username },
      message: `Login attempt failed for user ${username}`,
    });

    throw new Error(
      response?.data?.message || "Login failed. Please check your credentials.",
    );
  }
};



export const logout = async () => {
  const url = `${API_URL}/user/logout`;
  const method = "DELETE";
  const headers = {
    "Content-Type": "application/json",
    "X-Csrf-Token": adminStore.get(csrfTokenAtom),
  };

  try {
    await addLogs({
      values: {
        message: "User session terminated successfully",
      },
      type: "success",
      method,
      action_type: "user_logout",
      payload: {},
      message: "User successfully logged out and session terminated",
    });
    const res = await axios({
      method,
      url,
      headers,
      withCredentials: true,
      timeout: 5000,
    });

    if (res.status !== 200) {
      throw new Error(res?.data?.message || "Logout failed");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "user_logout",
      payload: {},
      message: "Logout process failed",
    });

    console.error("Logout error:", response || error);
    throw new Error("Logout failed. Please try again.");
  }
};

export const profile = async (user_id, organization_id) => {
  const url = `${API_URL}/user/details/${organization_id}/${user_id}`;
  const method = "GET";

  try {
    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": adminStore.get(csrfTokenAtom),
      },
      withCredentials: true,
      timeout: 5000,
    };

    const res = await axios(config);
    return res.data;
  } catch (error) {
    const response = error?.response || {};

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_user_profile",
      payload: { user_id, organization_id },
      message: "Failed to fetch user profile details",
      notify: false,
    });

    if (response.status === 401) {
      Object.keys(Cookies.get()).forEach(Cookies.remove);
      localStorage.clear();
      window.location.href = "/login";
    } else {
      throw new Error("Failed to get user profile details...!");
    }
  }
};
