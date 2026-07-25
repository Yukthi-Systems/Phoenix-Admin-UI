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

export const getOrganizations = async (page, pageSize, orgId) => {
  const method = "GET";
  const url = `${API_URL}/organization/list/${orgId}?page=${page}&limit=${pageSize}`;

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
      action_type: "get_organization_list",
      payload: { orgId, page, pageSize },
      message: `Failed to retrieve organizations list - Page: ${page}, Page Size: ${pageSize}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get organization list.",
    );
  }
};

export const getOrganizationDetail = async (orgId) => {
  const method = "GET";
  const url = `${API_URL}/organization/details/${orgId}`;

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
    if (orgId !== undefined && orgId !== null) {
      await addLogs({
        values: response,
        type: "error",
        method,
        action_type: "get_organization_details",
        payload: { orgId },
        message: `Failed to fetch organization details - Organization ID: ${orgId}`,
        notify: false,
      });
    }

    throw new Error(
      response?.data?.message || "Failed to get organization details.",
    );
  }
};

export const createOrganization = async (data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/organization/create`;

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
      throw new Error(res?.data?.message || "Failed to create organization.");

    if (!addLog) return res.data;
    const orgName = data?.organization_name || data?.name || "New Organization";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_organization",
      payload: data,
      message: `Organization created successfully - "${orgName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    if (!addLog) throw new Error(response?.data?.message || "Failed to create organization.");
    const orgName =
      data?.organization_name || data?.name || "Unknown Organization";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_organization",
      payload: data,
      message: `Failed to create organization - "${orgName}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to create organization.",
    );
  }
};

export const uploadOrganizationLogo = async (organization_id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  let config = {
    method: "PUT",
    url: `${API_URL}/organization/logo/${organization_id}`,
    headers: {
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
    data: formData,
  };

  const res = await axios(config);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(res?.data?.message || "Failed to upload organization logo");
  }

  await addLogs({
    values: res,
    type: "success",
    method: "PUT",
    action_type: "upload_organization_logo",
    payload: { organization_id, file_name: file?.name || "Unknown file" },
    message: `Organization logo uploaded successfully - Organization ID: ${organization_id}`,
  });

  return res.data;
};

export const getOrganizationLogoUrl = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/organization/logo/${organization_id}`,
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
      error?.response?.data?.message || "Failed to get organization logo",
    );
  }
};

export const editOrganization = async (organization_id, data) => {
  const method = "PATCH";
  const { email_service_enabled, chat_service_enabled, file_service_enabled, ...rest } = data;
  const url = `${API_URL}/organization/edit/${organization_id}?email_service_enabled=${email_service_enabled}&chat_service_enabled=${chat_service_enabled}&file_service_enabled=${file_service_enabled}`;
  const cleanData = trimInput(rest);
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
      throw new Error("Failed to update organization.");

    const orgName =
      data?.organization_name ||
      data?.name ||
      `Organization ID: ${organization_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_organization",
      payload: { organization_id, ...data },
      message: `Organization updated successfully - "${orgName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const orgName =
      data?.organization_name ||
      data?.name ||
      `Organization ID: ${organization_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_organization",
      payload: { organization_id, ...data },
      message: `Failed to update organization - "${orgName}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update organization.",
    );
  }
};

export const deleteOrganization = async (
  organization_id,
  organization_name = "Unknown Organization",
) => {
  const method = "DELETE";
  const url = `${API_URL}/organization/delete/${organization_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete organization.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_organization",
      payload: { organization_id },
      message: `Organization deleted successfully - "${organization_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_organization",
      payload: { organization_id },
      message: `Failed to delete "${organization_name}"  organization`,
    });

    throw new Error(
      response?.data?.message || "Failed to delete organization.",
    );
  }
};

export const updateOrganizationStatus = async (organization_id, status) => {
  const method = "PUT";
  const url = `${API_URL}/organization/activation/${organization_id}?activate=${status}`;

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
        res?.data?.message || "Failed to update organization status.",
      );

    const statusText = status ? "activated" : "deactivated";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_organization_status",
      payload: { organization_id, status },
      message: `Organization ${statusText} successfully - Organization ID: ${organization_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const statusText = status ? "activate" : "deactivate";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_organization_status",
      payload: { organization_id, status },
      message: `Failed to ${statusText} organization - Organization ID: ${organization_id}`,
    });

    throw new Error(
      response?.data?.message || "Failed to update organization status.",
    );
  }
};

export const updateOrganizationSpace = async (organization_id, space) => {
  const method = "PUT";
  const url = `${API_URL}/organization/quota/storage/${organization_id}?new_allocated_quota=${space}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error("Failed to update organization quota.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_organization_quota",
      payload: { organization_id, space },
      message: `Organization quota updated to ${space} - Organization ID: ${organization_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_organization_quota",
      payload: { organization_id, space },
      message: `Failed to update organization quota to ${space} - Organization ID: ${organization_id}`,
    });

    throw new Error(
      response?.data?.message || "Failed to update organization quota.",
    );
  }
};

export const updateOrganizationIdentityQuota = async (organization_id, quota) => {
  const method = "PUT";
  const url = `${API_URL}/organization/quota/identity/${organization_id}?new_allocated_quota=${quota}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error("Failed to update organization identity quota.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_organization_identity_quota",
      payload: { organization_id, quota },
      message: `Organization identity quota updated to ${quota} - Organization ID: ${organization_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_organization_identity_quota",
      payload: { organization_id, quota },
      message: `Failed to update organization identity quota to ${quota} - Organization ID: ${organization_id}`,
    });

    throw new Error(
      response?.data?.message || "Failed to update organization identity quota.",
    );
  }
};

export const renameOrganization = async (organization_id, name) => {
  const method = "PATCH";
  const url = `${API_URL}/organization/update/name/${organization_id}?new_org_name=${name}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error("Failed to rename organization.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "rename_organization",
      payload: { organization_id, name },
      message: `Organization renamed successfully to "${name}" - Organization ID: ${organization_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "rename_organization",
      payload: { organization_id, name },
      message: `Failed to rename organization to "${name}" - Organization ID: ${organization_id}`,
    });

    throw new Error(
      response?.data?.message || "Failed to rename organization.",
    );
  }
};
