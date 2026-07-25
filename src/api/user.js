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
import { trimInput } from "@/utils/textUtils";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

export const getUsers = async (org_id, page, pageSize) => {
  const method = "GET";
  const url = `${API_URL}/user/list/${org_id}/${page}?limit=${pageSize}`;

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
      action_type: "get_user_list",
      payload: { org_id, page, pageSize },
      message: `Failed to retrieve users list - Page: ${page}, Page Size: ${pageSize}`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get user list.");
  }
};

export const addUser = async (data) => {
  const method = "POST";
  const url = `${API_URL}/user/create`;
  const cleanData = trimInput(data);
  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: cleanData,
    });

    if (res.status !== 201)
      throw new Error(res?.data?.message || "Failed to create user.");

    const userName =
      data?.username || data?.user_name || data?.email || "New User";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_user",
      payload: data,
      message: `User created successfully - "${userName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const userName =
      data?.username || data?.user_name || data?.email || "Unknown User";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_user",
      payload: data,
      message: `Failed to create user - "${userName}"`,
    });

    throw new Error(response?.data?.message || "Failed to create user.");
  }
};

export const updateUser = async (org_id, data = {}, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const cleanData = trimInput(data);
  const method = "PATCH";
  const url = `${API_URL}/user/edit/${org_id}?${queryString}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: cleanData,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update user.");

    const userName =
      queryParams?.user_name || `User ID: ${queryParams.user_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_user",
      payload: { org_id, ...queryParams, ...data },
      message: `User updated successfully - "${userName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const userName =
      queryParams?.user_name || `User ID: ${queryParams.user_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_user",
      payload: { org_id, ...queryParams, ...data },
      message: `Failed to update user - "${userName}"`,
    });

    throw new Error(response?.data?.message || "Failed to update user.");
  }
};

export const deleteUser = async (org_id, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();

  const method = "DELETE";
  const url = `${API_URL}/user/delete/${org_id}?${queryString}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete user.");

    const userName =
      queryParams?.username ||
      queryParams?.user_name ||
      queryParams?.email ||
      `User ID: ${queryParams.user_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_user",
      payload: { org_id, ...queryParams },
      message: `User deleted successfully - "${userName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const userName =
      queryParams?.username ||
      queryParams?.user_name ||
      queryParams?.email ||
      `User ID: ${queryParams.user_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_user",
      payload: { org_id, ...queryParams },
      message: `Failed to delete user - "${userName}"`,
    });

    throw new Error("Failed to delete user.");
  }
};

export const changePassword = async (org_id, data = {}, userName = "") => {
  const method = "PUT";
  const url = `${API_URL}/user/password/${org_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update user password.");

    const userNameValue = userName || `User ID: ${data.user_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_user_password",
      payload: { org_id, password: "********" },
      message: `User password updated successfully - "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const userNameValue = userName || `User ID: ${data.user_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_user_password",
      payload: { org_id, password: "********" },
      message: `Failed to update user password - "${userNameValue}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update user password.",
    );
  }
};

export const changePermission = async (
  org_id,
  user_id,
  data = {},
  userName = "",
) => {
  const method = "PUT";
  const url = `${API_URL}/user/permissions/${org_id}?user_id=${user_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    if (![200, 204].includes(res.status))
      throw new Error(
        res?.data?.message || "Failed to update user permissions.",
      );

    const userNameValue = userName || `User ID: ${user_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_user_permissions",
      payload: { org_id, user_id, data },
      message: `User permissions updated successfully - "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const userNameValue = userName || `User ID: ${user_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_user_permissions",
      payload: { org_id, user_id, data },
      message: `Failed to update user permissions - "${userNameValue}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update user permissions.",
    );
  }
};

export const validateUsername = async (username) => {
  let config = {
    method: "GET",
    url: `${API_URL}/user/validate/user_name?user_name=${encodeURIComponent(username)}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 5 * 1000,
  };

  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error(res?.data?.message || "Failed to validate username");
  }
  return res.data;
};

export const uploadProfilePicture = async (organization_id, user_id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  let config = {
    method: "POST",
    url: `${API_URL}/user/profile-photo/${organization_id}/${user_id}`,
    headers: {
      // Don't set Content-Type - let browser set it for FormData with boundary
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
    data: formData, // Send FormData directly
  };

  const res = await axios(config);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(res?.data?.message || "Failed to upload profile picture");
  }

  await addLogs({
    values: res,
    type: "success",
    method: "POST",
    action_type: "upload_user_profile_picture",
    payload: {
      organization_id,
      user_id,
      file_name: file?.name || "Unknown file",
    },
    message: `Profile picture uploaded successfully for User ID: ${user_id}`,
  });

  return res.data;
};

export const getProfilePictureUrl = async (organization_id, user_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/user/profile-photo/${organization_id}/${user_id}`,
    headers: {
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 10 * 1000,
    responseType: "blob",
  };

  try {
    const res = await axios(config);
    if (res.status === 200) {
      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "image/png",
      });
      const imageUrl = URL.createObjectURL(blob);

      return {
        url: imageUrl,
        blob: blob,
        contentType: res.headers["content-type"] || "image/png",
        hasImage: true,
      };
    }
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        url: null,
        hasImage: false,
      };
    }
    throw new Error(
      error?.response?.data?.message || "Failed to get profile picture",
    );
  }
};

//user ui
export const getUserUiInfo = async () => {
  const method = "GET";
  const url = `${API_URL}/user/ui/info`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 5000,
    });

    if (res.status !== 200) {
      throw new Error("Failed to retrieve UI related data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to retrieve UI related data");
  }
};

export const storeUserUiInfo = async (data) => {
  const method = "PUT";
  const url = `${API_URL}/user/ui/info`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to store UI related data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to store UI related data");
  }
};

export const getUserAppSessions = async (domain, perPage, page) => {
  const method = "GET";
  const url = `${API_URL}/user/app/sessions/${domain}?page=${page}&size=${perPage}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to get user app sessions data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to get user app sessions data");
  }
};

export const deleteUserAppSession = async (domain, sessionId) => {
  const method = "DELETE";
  const url = `${API_URL}/user/app/session/${domain}/${sessionId}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to delete user app session");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "DELETE",
      action_type: "delete_user_app_session",
      payload: { domain, sessionId },
      message: `User App-Session deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to delete user app session");
  }
};

export const getSSOSessions = async (domain, perPage, page) => {
  const method = "GET";
  const url = `${API_URL}/user/sso/sessions/${domain}?page=${page}&size=${perPage}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to get SSO sessions data");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to get SSO sessions data");
  }
};

export const deleteSSOSession = async (domain, sessionId) => {
  const method = "DELETE";
  const url = `${API_URL}/user/sso/session/${domain}/${sessionId}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to delete SSO session");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "DELETE",
      action_type: "delete_sso_session",
      payload: { domain, sessionId },
      message: `SSO Session deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to delete SSO session");
  }
};

export const updateSSOSessionStatus = async (domain, sessionId, isActive) => {
  const method = "PATCH";
  const url = `${API_URL}/user/sso/session/${domain}/${sessionId}/status?is_active=${isActive}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status)) {
      throw new Error("Failed to update SSO session status");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "PATCH",
      action_type: "update_sso_session_status",
      payload: { domain, sessionId, isActive },
      message: `SSO Session ${isActive ? "activated" : "deactivated"} successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error("Failed to update SSO session status");
  }
};

