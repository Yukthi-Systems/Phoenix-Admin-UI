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
import { addLogs } from "./logs";
import { AuthAPI } from "@/utils/authAPI";
import { API_URL } from "@/constants/constants";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

/**
 * Get all email client sessions for a domain
 * GET /user/email/client/sessions/{domain_name}
 * Response structure:
 * {
 *   current_page, page_size, has_more, total_count, total_pages,
 *   data: [{ origin_ip, attempted_by, geo_ip_location, is_active, attempted_at, session_expires_at }]
 * }
 */
export const getEmailClientSessions = async (domain_name, page, pageSize) => {
  const method = "GET";
  const url = `${API_URL}/user/email/client/sessions/${domain_name}?page=${page}&size=${pageSize}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_email_client_sessions",
      payload: { domain_name, page, pageSize },
      message: "Failed to fetch email client sessions",
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get email client sessions.",
    );
  }
};

/**
 * Switch/Update email client session
 * PATCH /user/email/client/session/{attempted_by}/{origin_ip}
 * @param {string} attempted_by - Email address (replaces domain_name)
 * @param {string} origin_ip - Origin IP address (replaces session_id)
 */
export const switchEmailClientSession = async ({
  attempted_by,
  origin_ip,
  domain_name,
  isactive = false,
  value = false,
}) => {
  const method = "PATCH";
  const url = isactive
    ? `${API_URL}/user/email/client/session/${domain_name}/${origin_ip}/${attempted_by}?is_active=${value}`
    : `${API_URL}/user/email/client/session/${domain_name}/${origin_ip}/${attempted_by}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(
        res?.data?.message || "Failed to switch email client session.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "switch_email_client_session",
      payload: { attempted_by, origin_ip },
      message: "Email client session switched successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "switch_email_client_session",
      payload: { attempted_by, origin_ip },
      message: "Failed to switch email client session",
    });

    throw new Error(
      response?.data?.message || "Failed to switch email client session.",
    );
  }
};

/**
 * Delete email client session
 * DELETE /user/email/client/session/{attempted_by}/{origin_ip}
 * @param {string} attempted_by - Email address (replaces domain_name)
 * @param {string} origin_ip - Origin IP address (replaces session_id)
 */
export const deleteEmailClientSession = async ({
  attempted_by,
  origin_ip,
  domain_name,
}) => {
  const method = "DELETE";
  const url = `${API_URL}/user/email/client/session/${domain_name}/${origin_ip}/${attempted_by}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(
        res?.data?.message || "Failed to delete email client session.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_email_client_session",
      payload: { attempted_by, origin_ip },
      message: "Email client session deleted successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_email_client_session",
      payload: { attempted_by, origin_ip },
      message: "Failed to delete email client session",
    });

    throw new Error(
      response?.data?.message || "Failed to delete email client session.",
    );
  }
};
