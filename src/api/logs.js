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
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { toLocalISOString } from "@/utils/dateFormat";
import axios from "axios";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

// React Query re-invokes a failed query/mutation's fn on each retry, and every
// api/*.js catch block calls addLogs itself — so one real failure with `retry: 3`
// can otherwise produce up to 4 near-identical error log entries. Collapse
// error logs for the same action+payload seen within a short window into one.
const RECENT_ERROR_LOG_WINDOW_MS = 10000;
const recentErrorLogs = new Map();

const isDuplicateErrorLog = (action_type, payload) => {
  const signature = `${action_type}:${JSON.stringify(payload)}`;
  const now = Date.now();

  // Opportunistically prune stale entries so the map doesn't grow unbounded.
  if (recentErrorLogs.size > 200) {
    for (const [key, seenAt] of recentErrorLogs) {
      if (now - seenAt > RECENT_ERROR_LOG_WINDOW_MS) recentErrorLogs.delete(key);
    }
  }

  const lastSeenAt = recentErrorLogs.get(signature);
  if (lastSeenAt && now - lastSeenAt < RECENT_ERROR_LOG_WINDOW_MS) {
    return true;
  }

  recentErrorLogs.set(signature, now);
  return false;
};

export const addLogs = async ({
  values = {},
  method = "",
  type = "",
  action_type = "",
  payload = {},
  message = "",
  org_Id = "",
  user = "",
  notify = true,
}) => {
  if (type === "error" && isDuplicateErrorLog(action_type, payload)) {
    return;
  }

  const userProfile = adminStore.get(userProfileAtom) || {};
  const orgdetail = adminStore.get(selectedOrganizationAtom) || {};
  const userInfo = adminStore.get(userInfoAtom);

  const addMethod = "POST";
  const url = `${API_URL}/logs/audit/add?notify=${notify}`;

  const {
    display_name = "",
    user_name = "",
    organization_id = "",
  } = userProfile;
  const isSameOrg = orgdetail?.organization_id === organization_id;

  const responseDetails = values?.data?.details || {};
  const actionStatusCode = values?.status || 200;

  const createLogData = (orgId) => ({
    action_type,
    action_timestamp: toLocalISOString(new Date()),
    details: {
      created_by:
        display_name ||
        responseDetails?.display_name ||
        userInfo?.display_name ||
        user ||
        "",
      user_name:
        user_name ||
        responseDetails?.user_name ||
        userInfo?.user_name ||
        user ||
        "",
      action_payload: payload,
      action_method: method,
      action_type: type,
      action_respone_message: values?.data?.message || "No response message",
      action_status_code: actionStatusCode,
      action_track_id: values?.data?.traceback_id || "No trackback id",
    },
    message,
    organization_id:
      orgId ||
      responseDetails.organization_id ||
      userInfo?.organization_id ||
      "",
  });

  const sendLog = async (logData) => {
    try {
      await axios({
        method: addMethod,
        url,
        headers: getHeaders(),
        withCredentials: true,
        timeout: 8000,
        data: logData,
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  if (org_Id) {
    if (isSameOrg) {
      await sendLog(createLogData(organization_id));
    } else {
      await sendLog(createLogData(orgdetail?.organization_id));
      await sendLog(createLogData(organization_id));
    }
  } else {
    sendLog(createLogData(organization_id));
  }
};

export const getAuditLogs = async (data, pageIndex = 1, pageSize = 10) => {
  let config = {
    method: "POST",
    url: `${API_URL}/logs/audit/search?current_page=${pageIndex}&page_size=${pageSize}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data,
  };

  const res = await axios(config);

  if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
    throw new Error("Failed to log list");
  }

  return res.data;
};

export const getAuditLogsReq = async (data) => {
  let config = {
    method: "PUT",
    url: `${API_URL}/logs/audit/request`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data,
  };

  const res = await axios(config);

  if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
    throw new Error("Failed to log list");
  }

  return res.data;
};

export const getEmailLogs = async (data, pageIndex = 1, pageSize = 10) => {
  let config = {
    method: "POST",
    url: `${API_URL}/logs/mail-flow/search?current_page=${pageIndex}&page_size=${pageSize}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data,
  };

  const res = await axios(config);

  if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
    throw new Error("Failed to log list");
  }

  return res.data;
};

export const getEmailLogsReq = async (data) => {
  let config = {
    method: "PUT",
    url: `${API_URL}/logs/mail-flow/request`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data,
  };

  const res = await axios(config);

  if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
    throw new Error("Failed to log list");
  }

  return res.data;
};

export const getLoginLogs = async (data, pageIndex = 1, pageSize = 10) => {
  let config = {
    method: "POST",
    url: `${API_URL}/logs/login-attempts/search?current_page=${pageIndex}&page_size=${pageSize}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data,
  };

  const res = await axios(config);

  if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
    throw new Error("Failed to log list");
  }

  return res.data;
};

export const getLoginLogsReq = async (data) => {
  let config = {
    method: "PUT",
    url: `${API_URL}/logs/login-attempts/request`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data,
  };

  const res = await axios(config);

  if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
    throw new Error("Failed to log list");
  }

  return res.data;
};
