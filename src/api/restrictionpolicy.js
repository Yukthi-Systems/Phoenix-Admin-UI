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

export const getRestrictionPolicy = async ({
  organization_id,
  page,
  pageSize,
  query = "",
}) => {
  const method = "GET";
  const url = `${API_URL}/policy/restrictions/list/${organization_id}?page=${page}&page_size=${pageSize}&query=${encodeURIComponent(query)}`;

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
      action_type: "get_restriction_policy_list",
      payload: { organization_id, page, pageSize },
      message: `Failed to retrieve restriction policies list - Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get restriction policy list.",
    );
  }
};

export const getRestrictionPolicyEntry = async (org_id, policy_id) => {
  const method = "GET";
  const url = `${API_URL}/policy/restrictions/get/${org_id}/${policy_id}`;

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
      action_type: "get_restriction_policy_details",
      payload: { org_id, policy_id },
      message: `Failed to fetch restriction policy details - Policy ID: ${policy_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get restriction policy details.",
    );
  }
};

export const addRestrictionPolicy = async (org_id, data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/policy/restrictions/create/${org_id}`;
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
      throw new Error(
        res?.data?.message || "Failed to create restriction policy.",
      );

    if (addLog) {
      const policyName =
        data?.policy_name || data?.name || "New Restriction Policy";
      await addLogs({
        values: res,
        type: "success",
        method,
        action_type: "create_restriction_policy",
        payload: data,
        message: `Restriction policy created successfully - "${policyName}"`,
      });
    }
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    if (addLog) {
      const policyName = data?.policy_name || data?.name || "Unknown Policy";
      await addLogs({
        values: response,
        type: "error",
        method,
        action_type: "create_restriction_policy",
        payload: { org_id, ...data },
        message: `Failed to create restriction policy - "${policyName}"`,
      });
    }

    throw new Error(
      response?.data?.message || "Failed to create restriction policy.",
    );
  }
};

export const editRestrictionPolicy = async (org_id, policy_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/policy/restrictions/edit/${org_id}/${policy_id}`;
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
      throw new Error(
        res?.data?.message || "Failed to update restriction policy.",
      );

    const policyName =
      data?.policy_name || data?.name || `Policy ID: ${policy_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_restriction_policy",
      payload: { org_id, policy_id, ...data },
      message: `Restriction policy updated successfully - "${policyName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const policyName =
      data?.policy_name || data?.name || `Policy ID: ${policy_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_restriction_policy",
      payload: { policy_id, ...data },
      message: `Failed to update restriction policy - "${policyName}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update restriction policy.",
    );
  }
};

export const deleteRestrictionPolicy = async (
  org_id,
  policy_id,
  policy_name = "Unknown Policy",
) => {
  const method = "DELETE";
  const url = `${API_URL}/policy/restrictions/delete/${org_id}/${policy_id}`;

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
        res?.data?.message || "Failed to delete restriction policy.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_restriction_policy",
      payload: { org_id, policy_id },
      message: `Restriction policy deleted successfully - Name : "${policy_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_restriction_policy",
      payload: { org_id, policy_id },
      message: `Failed to delete restriction policy - Name : "${policy_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to delete restriction policy.",
    );
  }
};

export const exportRestrictionPolicy = async ({
  organization_id,
  page,
  pageSize,
}) => {
  const method = "GET";
  const url = `${API_URL}/policy/restrictions/export/${organization_id}?page=${page}&page_size=${pageSize}`;

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
      action_type: "export_restriction_policy_list",
      payload: { organization_id, page, pageSize },
      message: `Restriction policies exported successfully - Page: ${page}, Page Size: ${pageSize}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_restriction_policy_list",
      payload: { organization_id, page, pageSize },
      message: `Failed to export restriction policies - Page: ${page}, Page Size: ${pageSize}`,
    });

    throw new Error(
      response?.data?.message || "Failed to export restriction policy list.",
    );
  }
};
