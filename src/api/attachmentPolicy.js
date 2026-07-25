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
import { API_URL } from "@/constants/constants";
import { trimInput } from "@/utils/textUtils";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

// ✅ Get Attachment Policy List
export const getAttachmentPolicyList = async (
  organization_id,
  domain_name,
  query = "",
  page = 1,
  page_size = 10,
) => {
  const method = "GET";
  const url = `${API_URL}/policy/attachments/list/${organization_id}?domain_name=${domain_name}&page=${page}&limit=${page_size}&query=${encodeURIComponent(query)}`;

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
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_attachment_policy_list",
      payload: { organization_id, domain_name },
      message: `Failed to retrieve attachment policies list - Domain: "${domain_name}", Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get attachment policy list.",
    );
  }
};

// ✅ Get Attachment Policy By ID
export const getAttachmentPolicyById = async (
  organization_id,
  domain_name,
  policy_id,
) => {
  const method = "GET";
  const url = `${API_URL}/policy/attachments/get/${organization_id}/${policy_id}?domain_name=${domain_name}`;

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
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_attachment_policy_details",
      payload: { organization_id, domain_name, policy_id },
      message: `Failed to fetch attachment policy details - Policy ID: ${policy_id}, Domain: "${domain_name}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get attachment policy details.",
    );
  }
};

// ✅ Create New Attachment Policy
export const createAttachmentPolicy = async (
  organization_id,
  domain_name,
  data,
  addLog = true,
) => {
  const method = "POST";
  const url = `${API_URL}/policy/attachments/create/${organization_id}?domain_name=${domain_name}`;
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
        res?.data?.message || "Failed to create attachment policy.",
      );
    if (addLog) {
      const policyName =
        data?.policy_name || data?.name || "New Attachment Policy";
      await addLogs({
        values: res,
        type: "success",
        method,
        action_type: "create_attachment_policy",
        payload: { organization_id, domain_name, ...data },
        message: `Attachment policy created successfully - "${policyName}" for Domain: "${domain_name}"`,
      });
    }
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    if (addLog) {
      const policyName = data?.policy_name || data?.name || "Unknown Policy";
      await addLogs({
        values: response,
        type: "error",
        method,
        action_type: "create_attachment_policy",
        payload: { organization_id, domain_name, ...data },
        message: `Failed to create attachment policy - "${policyName}" for Domain: "${domain_name}"`,
      });
    }
    throw new Error(
      response?.data?.message || "Failed to create attachment policy.",
    );
  }
};

// ✅ Edit Attachment Policy
export const editAttachmentPolicy = async (
  organization_id,
  domain_name,
  policy_id,
  data,
) => {
  const method = "PUT";
  const url = `${API_URL}/policy/attachments/edit/${organization_id}/${policy_id}?domain_name=${domain_name}`;
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
      throw new Error(
        res?.data?.message || "Failed to update attachment policy.",
      );

    const policyName =
      data?.policy_name || data?.name || `Policy ID: ${policy_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_attachment_policy",
      payload: { organization_id, domain_name, policy_id, ...data },
      message: `Attachment policy updated successfully - "${policyName}" for Domain: "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    const policyName =
      data?.policy_name || data?.name || `Policy ID: ${policy_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_attachment_policy",
      payload: { organization_id, domain_name, policy_id, ...data },
      message: `Failed to update attachment policy - "${policyName}" for Domain: "${domain_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update attachment policy.",
    );
  }
};

// ✅ Delete Attachment Policy
export const deleteAttachmentPolicy = async (
  organization_id,
  domain_name,
  policy_id,
) => {
  const method = "DELETE";
  const url = `${API_URL}/policy/attachments/delete/${organization_id}/${policy_id}?domain_name=${domain_name}`;

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
        res?.data?.message || "Failed to delete attachment policy.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_attachment_policy",
      payload: { organization_id, domain_name, policy_id },
      message: `Attachment policy deleted successfully - Policy ID: ${policy_id} for Domain: "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_attachment_policy",
      payload: { organization_id, domain_name, policy_id },
      message: `Failed to delete attachment policy - Policy ID: ${policy_id} for Domain: "${domain_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to delete attachment policy.",
    );
  }
};

// ✅ Export Attachment Policy List
export const exportAttachmentPolicyList = async (
  organization_id,
  domain_name,
) => {
  const method = "GET";
  const url = `${API_URL}/policy/attachments/export/${organization_id}?domain_name=${domain_name}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    if (res.status !== 200)
      throw new Error("Failed to export attachment policy list.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "export_attachment_policy_list",
      payload: { organization_id, domain_name },
      message: `Attachment policies exported successfully - Domain: "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_attachment_policy_list",
      payload: { organization_id, domain_name },
      message: `Failed to export attachment policies - Domain: "${domain_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to export attachment policy list.",
    );
  }
};
