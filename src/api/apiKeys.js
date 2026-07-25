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

// Get API Keys List
export const getApiKeys = async (organization_id, page, limit) => {
  const method = "GET";
  // Note: OpenAPI spec defines page and limit as query params for this endpoint
  const url = `${API_URL}/organization/api-keys/${organization_id}?page=${page}&limit=${limit}`;

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
      action_type: "get_api_keys_list",
      payload: { organization_id, page, limit },
      message: `Failed to retrieve API keys list - Page: ${page}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get API keys list.");
  }
};

// Get API Key Details
export const getApiKeyDetails = async (organization_id, api_key_id) => {
  const method = "GET";
  const url = `${API_URL}/organization/api-key/${organization_id}/${api_key_id}`;

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
      action_type: "get_api_key_details",
      payload: { organization_id, api_key_id },
      message: `Failed to retrieve API key details ID: ${api_key_id}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get API key details."
    );
  }
};

// Create API Key
export const createApiKey = async (organization_id, data) => {
  const method = "POST";
  const url = `${API_URL}/organization/api-key/${organization_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    if (res.status !== 200 && res.status !== 201)
      throw new Error(res?.data?.message || "Failed to create API Key.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_api_key",
      payload: { organization_id, ...data },
      message: `New API Key created successfully - Name: "${data.name || 'Untitled'}"`,
      org_Id: organization_id,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const keyName = data?.name || 'Unknown name';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_api_key",
      payload: { organization_id, ...data },
      message: `Failed to create API Key "${keyName}"`,
      org_Id: organization_id,
    });

    throw new Error(response?.data?.message || "Failed to create API Key.");
  }
};

// Edit API Key (Activate/Update)
export const editApiKey = async (organization_id, api_key_id, activate, data) => {
  const method = "PATCH";
  const url = `${API_URL}/organization/api-key/${organization_id}/${api_key_id}/${activate}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    if (res.status !== 200)
      throw new Error(res?.data?.message || "Failed to update API Key.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "edit_api_key",
      payload: { organization_id, api_key_id, activate, ...data },
      message: `API Key updated successfully - ID: ${api_key_id}`,
      org_Id: organization_id,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "edit_api_key",
      payload: { organization_id, api_key_id, activate, ...data },
      message: `Failed to update API Key ID: ${api_key_id}`,
      org_Id: organization_id,
    });

    throw new Error(response?.data?.message || "Failed to update API Key.");
  }
};

// Delete API Key
export const deleteApiKey = async (organization_id, api_key_id, key_name) => {
  const method = "DELETE";
  const url = `${API_URL}/organization/api-key/${organization_id}/${api_key_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (res.status !== 200 && res.status !== 204)
      throw new Error(res?.data?.message || "Failed to delete API Key.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_api_key",
      payload: { organization_id, api_key_id },
      message: `"${key_name}" API Key permanently deleted.`,
      org_Id: organization_id,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_api_key",
      payload: { organization_id, api_key_id },
      message: `Failed to delete "${key_name}" API Key`,
      org_Id: organization_id,
    });

    throw new Error(response?.data?.message || "Failed to delete API Key.");
  }
};