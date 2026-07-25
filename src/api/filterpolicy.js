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

export const getFiltersPolicy = async (
  org_id,
  domain_name,
  page,
  pageSize,
  query = "",
) => {
  const method = "GET";
  const url = `${API_URL}/policy/filters/list/${org_id}/${domain_name}?page=${page}&limit=${pageSize}&query=${encodeURIComponent(query)}`;

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
      action_type: "get_filters_policy_list",
      payload: { org_id, domain_name, page, pageSize },
      message: `Failed to retrieve filters policy list - Domain: "${domain_name}", Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get filters policy list.",
    );
  }
};

export const getFiltersPolicyEntry = async (org_id, policy_id) => {
  const method = "GET";
  const url = `${API_URL}/policy/filters/entry/${org_id}/${policy_id}`;
 
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
      action_type: "get_filters_policy_details",
      payload: { org_id, policy_id },
      message: `Failed to fetch filters policy details - Policy ID: ${policy_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get filters policy details.",
    );
  }
};

export const addFiltersPolicy = async (org_id, data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/policy/filters/create/${org_id}`;
  const cleanData = trimInput(data);
  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data:cleanData,
    });

    if (res.status !== 201)
      throw new Error(res?.data?.message || "Failed to create filters policy.");
    if (addLog) {
      const policyName = data?.policy_name || data?.name || 'New Filters Policy';
      await addLogs({
        values: res,
        type: "success",
        method,
        action_type: "create_filters_policy",
        payload: data,
        message: `Filters policy created successfully - "${policyName}"`,
      });
    }
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    if (addLog) {
      const policyName = data?.policy_name || data?.name || 'Unknown Policy';
      await addLogs({
        values: response,
        type: "error",
        method,
        action_type: "create_filters_policy",
        payload: data,
        message: `Failed to create filters policy - "${policyName}"`,
      });
    }
    throw new Error(
      response?.data?.message || "Failed to create filters policy.",
    );
  }
};

export const editFiltersPolicy = async (org_id, policy_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/policy/filters/edit/${org_id}/${policy_id}`;
  const cleanData = trimInput(data);
  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data:cleanData,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update filters policy.");

    const policyName = data?.policy_name || data?.name || `Policy ID: ${policy_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_filters_policy",
      payload: { org_id, policy_id, ...data },
      message: `Filters policy updated successfully - "${policyName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const policyName = data?.policy_name || data?.name || `Policy ID: ${policy_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_filters_policy",
      payload: { org_id, policy_id, ...data },
      message: `Failed to update filters policy - "${policyName}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update filters policy.",
    );
  }
};

export const deleteFiltersPolicy = async (org_id, policy_id, policy_name = "Unknown Policy") => {
  const method = "DELETE";
  const url = `${API_URL}/policy/filters/delete/${org_id}/${policy_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete filters policy.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_filters_policy",
      payload: { org_id, policy_id },
      message: `Filters policy deleted successfully - "${policy_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_filters_policy",
      payload: { org_id, policy_id },
      message: `Failed to delete "${policy_name}" filters policy `,
    });

    throw new Error(
      response?.data?.message || "Failed to delete filters policy.",
    );
  }
};

export const exportFiltersPolicy = async (
  org_id,
  domain_name,
  page,
  pageSize,
) => {
  const method = "GET";
  const url = `${API_URL}/policy/filters/export/${org_id}/${domain_name}?page=${page}&limit=${pageSize}`;

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
      action_type: "export_filters_policy_list",
      payload: { org_id, domain_name, page, pageSize },
      message: `Filters policies exported successfully - Domain: "${domain_name}", Page: ${page}, Page Size: ${pageSize}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_filters_policy_list",
      payload: { org_id, domain_name, page, pageSize },
      message: `Failed to export filters policies - Domain: "${domain_name}", Page: ${page}, Page Size: ${pageSize}`,
    });

    throw new Error(
      response?.data?.message || "Failed to export filters policy list.",
    );
  }
};