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

export const getIdentities = async (
  domain_name,
  page,
  pageSize,
  query = "",
) => {
  const method = "GET";
  const url = `${API_URL}/identities/list/${domain_name}/${page}/${pageSize}?query=${encodeURIComponent(query)}`;

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
      action_type: "get_identities_list",
      payload: { domain_name, page, pageSize },
      message: `Failed to retrieve identities list - Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get identities list.",
    );
  }
};

export const getIdentity = async (domain_name, email_prefix) => {
  const method = "GET";
  const url = `${API_URL}/identities/details/${domain_name}/${email_prefix}`;

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
      action_type: "get_identity_details",
      payload: { domain_name, email_prefix },
      message: `Failed to fetch identity details - Email: ${email_prefix}@${domain_name}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get identity details.",
    );
  }
};

export const createIdentity = async (data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/identities/create`;
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
      throw new Error(res?.data?.message || "Failed to create identity.");

    if (!addLog) return res.data;
    const identityName = `${data.email_prefix}@${data.email_domain}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_identity",
      payload: data,
      message: `Identity created successfully - "${identityName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    if (!addLog)
      throw new Error(
        response?.data?.message || "Failed to create identity.",
      );
    const identityName = `${data.email_prefix}@${data.email_domain}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_identity",
      payload: data,
      message: `Failed to create identity - "${identityName}"`,
    });

    throw new Error(response?.data?.message || "Failed to create identity.");
  }
};

export const updateIdentity = async (data) => {
  const method = "PUT";
  const url = `${API_URL}/identities/update`;
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

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update identity.");

    const identityName = `${data.email_prefix}@${data.email_domain}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_identity",
      payload: data,
      message: `Identity updated successfully - "${identityName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const identityName = `${data.email_prefix}@${data.email_domain}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_identity",
      payload: data,
      message: `Failed to update identity - "${identityName}"`,
    });

    throw new Error(response?.data?.message || "Failed to update identity.");
  }
};

export const deleteIdentity = async (
  domain_name,
  email_prefix,
  identity_name = "Unknown Identity",
) => {
  const method = "DELETE";
  const url = `${API_URL}/identities/delete/${domain_name}/${email_prefix}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete identity.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_identity",
      payload: { domain_name, email_prefix },
      message: `${identity_name} Identity deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_identity",
      payload: { domain_name, email_prefix },
      message: `Failed to delete ${identity_name} identity`,
    });

    throw new Error(response?.data?.message || "Failed to delete identity.");
  }
};

export const exportIdentities = async (domain_name, page, pageSize) => {
  const method = "GET";
  const url = `${API_URL}/identities/list/${domain_name}/${page}/${pageSize}?query=`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 5000,
    });
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "export_identities_list",
      payload: { domain_name, page, pageSize },
      message: `Identities exported successfully - Page: ${page}, Page Size: ${pageSize}`,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_identities_list",
      payload: { domain_name, page, pageSize },
      message: `Failed to export identities - Page: ${page}, Page Size: ${pageSize}`,
    });

    throw new Error(
      response?.data?.message || "Failed to export identities list.",
    );
  }
};

export const updateIdentityPassword = async (domain_name, email_prefix, new_base64_password) => {
  const method = "PATCH";
  const url = `${API_URL}/identities/update/password`;
  const payload = {
    email: `${email_prefix}@${domain_name}`.toLowerCase(),
    new_base64_password,
    email_domain: domain_name,
    domain_name: domain_name
  };

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: payload,
    });

    if (res.status !== 200)
      throw new Error(res?.data?.message || "Failed to update identity password.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_identity_password",
      payload: { domain_name, email_prefix },
      message: `Successfully updated password for ${email_prefix}@${domain_name}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_identity_password",
      payload: { domain_name, email_prefix },
      message: `Failed to update password for ${email_prefix}@${domain_name}`,
    });

    throw new Error(
      response?.data?.message || "Failed to update identity password.",
    );
  }
};
