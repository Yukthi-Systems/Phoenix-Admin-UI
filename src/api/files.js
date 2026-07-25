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

export const getFileServiceConfig = async (organization_id) => {
  const method = "GET";
  const url = `${API_URL}/files/config/${organization_id}`;

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
      action_type: "get_file_service_config",
      payload: { organization_id },
      message: `Failed to retrieve file service configuration - Organization ID: ${organization_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get file service configuration.",
    );
  }
};

export const updateFileServiceConfig = async (data) => {
  const method = "POST";
  const url = `${API_URL}/files/config/update`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: data,
    });

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_file_service_config",
      payload: data,
      message: `File service configuration updated successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_file_service_config",
      payload: data,
      message: `Failed to update file service configuration`,
    });

    throw new Error(
      response?.data?.message || "Failed to update file service configuration.",
    );
  }
};

export const getFileUsers = async (domain, perPage, page) => {
  const method = "GET";
  const url = `${API_URL}/files/users/${domain}?page=${page}&size=${perPage}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to get file users data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to get file users data");
  }
};

export const createFileUser = async ({
  domain_name,
  email_identity,
  quota_allocated,
  enable_user,
}) => {
  const method = "POST";
  const url = `${API_URL}/files/user/create`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: { domain_name, email_identity, quota_allocated, enable_user },
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to create file user");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_file_user",
      payload: { domain_name, email_identity, quota_allocated, enable_user },
      message: `File user ${email_identity} created successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to create file user");
  }
};

export const toggleFileUserStatus = async (domain, email) => {
  const method = "PUT";
  const url = `${API_URL}/files/user/${domain}/disable/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to toggle file user status");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "toggle_file_user_status",
      payload: { domain, email },
      message: `File user ${email} status toggled successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to toggle file user status");
  }
};

export const deleteFileUser = async (domain, email) => {
  const method = "DELETE";
  const url = `${API_URL}/files/user/${domain}/delete/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to delete file user");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_file_user",
      payload: { domain, email },
      message: `File user ${email} deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to delete file user");
  }
};

export const updateFileUserQuota = async (domain, email, new_quota) => {
  const method = "PUT";
  const url = `${API_URL}/files/user/${domain}/quota/${email}?new_quota=${new_quota}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_file_user_quota",
      payload: { domain, email, new_quota },
      message: `File user ${email} quota updated successfully to ${new_quota}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_file_user_quota",
      payload: { domain, email, new_quota },
      message: `Failed to update file user quota`,
    });

    throw new Error(
      response?.data?.message || "Failed to update file user quota.",
    );
  }
};
