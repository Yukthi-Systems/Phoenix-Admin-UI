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

// Tasks (Calendar) Service - mirrors api/chat.js's endpoints, against the
// /tasks-calendar/* router (api/routers/tasks_conf.py).

export const getTasksServiceConfig = async (organization_id) => {
  const method = "GET";
  const url = `${API_URL}/tasks-calendar/config/${organization_id}`;

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

    // get_tasks_settings_for_organization 404s until the first save - the
    // settings row is created lazily by update_create_tasks_service_settings,
    // not when the org's tasks_service_enabled flag is turned on. Treat a
    // 404 here as "nothing saved yet", not an error.
    if (response?.status === 404) {
      return {
        data: {
          organization_id,
          is_external_sharing_enabled: false,
          updated_at: null,
        },
      };
    }

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_tasks_service_config",
      payload: { organization_id },
      message: `Failed to retrieve tasks service configuration - Organization ID: ${organization_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get tasks service configuration.",
    );
  }
};

export const updateTasksServiceConfig = async (data) => {
  const method = "POST";
  const url = `${API_URL}/tasks-calendar/config/update`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_tasks_service_config",
      payload: data,
      message: `Tasks service configuration updated successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_tasks_service_config",
      payload: data,
      message: `Failed to update tasks service configuration`,
    });

    throw new Error(
      response?.data?.message || "Failed to update tasks service configuration.",
    );
  }
};

export const getTasksUsers = async (domain, perPage, page) => {
  const method = "GET";
  const url = `${API_URL}/tasks-calendar/users/${domain}?page=${page}&size=${perPage}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to get task users data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to get task users data");
  }
};

// Unlike Chat/File's create-user endpoints (domain in the URL, email as a
// query param), the Tasks Service create endpoint takes a single JSON body -
// TaskCalUserCreateForm{ email_identity, domain_name, enable_user } - posted
// to a path with no domain segment. See create_tasks_user_for_domain in
// api/routers/tasks_conf.py.
export const createTasksUser = async (domain, email, enable = true) => {
  const method = "POST";
  const url = `${API_URL}/tasks-calendar/user/create`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: {
        email_identity: email,
        domain_name: domain,
        enable_user: enable,
      },
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to create task user");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_tasks_user",
      payload: { domain, email, enable },
      message: `Task user ${email} created successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_tasks_user",
      payload: { domain, email, enable },
      message: `Failed to create task user ${email}`,
    });

    throw new Error(response?.data?.message || "Failed to create task user");
  }
};

// Despite the "disable" naming on the backend route, this flips is_enabled
// (NOT is_enabled) - i.e. it toggles, same as Chat/File's equivalent.
export const toggleTasksUserStatus = async (domain, email) => {
  const method = "PUT";
  const url = `${API_URL}/tasks-calendar/user/${domain}/disable/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to toggle task user status");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "toggle_tasks_user_status",
      payload: { domain, email },
      message: `Task user ${email} status toggled successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(
      response?.data?.message || "Failed to toggle task user status",
    );
  }
};

export const deleteTasksUser = async (domain, email) => {
  const method = "DELETE";
  const url = `${API_URL}/tasks-calendar/user/${domain}/delete/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to delete task user");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_tasks_user",
      payload: { domain, email },
      message: `Task user ${email} deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_tasks_user",
      payload: { domain, email },
      message: `Failed to delete task user ${email}`,
    });

    throw new Error(response?.data?.message || "Failed to delete task user");
  }
};
