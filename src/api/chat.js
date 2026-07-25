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

export const getChatConfig = async (organization_id) => {
  const method = "GET";
  const url = `${API_URL}/chat/config/${organization_id}`;

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
      action_type: "get_chat_config",
      payload: { organization_id },
      message: `Failed to retrieve chat configuration - Organization ID: ${organization_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get chat configuration.",
    );
  }
};

export const updateChatConfig = async (data) => {
  const method = "POST";
  const url = `${API_URL}/chat/config/update`;

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
      action_type: "update_chat_config",
      payload: data,
      message: `Chat configuration updated successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_chat_config",
      payload: data,
      message: `Failed to update chat configuration`,
    });

    throw new Error(
      response?.data?.message || "Failed to update chat configuration.",
    );
  }
};

export const updateChatQuota = async (organization_id, new_quota) => {
  const method = "PUT";
  const url = `${API_URL}/chat/config/quota/update/${organization_id}?new_quota=${new_quota}`;

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
      action_type: "update_chat_quota",
      payload: { organization_id, new_quota },
      message: `Chat quota updated successfully to ${new_quota}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_chat_quota",
      payload: { organization_id, new_quota },
      message: `Failed to update chat quota`,
    });

    throw new Error(
      response?.data?.message || "Failed to update chat quota.",
    );
  }
};

export const getChatUsers = async (domain, perPage, page) => {
  const method = "GET";
  const url = `${API_URL}/chat/users/${domain}?page=${page}&size=${perPage}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to get chat users data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to get chat users data");
  }
};

export const createChatUser = async (domain, email) => {
  const method = "POST";
  const url = `${API_URL}/chat/user/${domain}/create?user_email=${encodeURIComponent(email)}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to create chat user");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_chat_user",
      payload: { domain, email },
      message: `Chat user ${email} created successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to create chat user");
  }
};

export const toggleChatUserStatus = async (domain, email) => {
  const method = "PUT";
  const url = `${API_URL}/chat/user/${domain}/disable/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to toggle chat user status");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "toggle_chat_user_status",
      payload: { domain, email },
      message: `Chat user ${email} status toggled successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to toggle chat user status");
  }
};

export const deleteChatUser = async (domain, email) => {
  const method = "DELETE";
  const url = `${API_URL}/chat/user/${domain}/delete/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to delete chat user");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_chat_user",
      payload: { domain, email },
      message: `Chat user ${email} deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(response?.data?.message || "Failed to delete chat user");
  }
};
