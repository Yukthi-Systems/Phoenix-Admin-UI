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
import { csrfTokenAtom } from "../store/csrftoken";
import { adminStore } from "../store/store";
import { addLogs } from "./logs";
import { AuthAPI } from "@/utils/authAPI";
import { API_URL } from "@/constants/constants";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

export const getPolicyRules = async (org_id, domain_name, page, pageSize) => {
  const method = "GET";
  const url = `${API_URL}/policy/rule/list/${org_id}?domain_name=${domain_name}&page=${page}&page_size=${pageSize}`;

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
      action_type: "get_policy_rules_list",
      payload: { domain_name, page, pageSize },
      message: `Failed to retrieve policy rules list - Domain: "${domain_name}", Page: ${page}, Page Size: ${pageSize}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get policy rules list.",
    );
  }
};

export const addPolicyRule = async (organization_id, data) => {
  const method = "POST";
  const url = `${API_URL}/policy/rule/create/${organization_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data,
    });

    if (res.status !== 201)
      throw new Error(res?.data?.message || "Failed to create policy rule.");

    const ruleName = data?.rule_name || data?.name || 'New Policy Rule';
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_policy_rule",
      payload: data,
      message: `Policy rule created successfully - "${ruleName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const ruleName = data?.rule_name || data?.name || 'Unknown Policy Rule';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_policy_rule",
      payload: data,
      message: `Failed to create policy rule - "${ruleName}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to create policy rule.",
    );
  }
};

export const getPolicyRule = async (org_id, rule_id) => {
  const method = "GET";
  const url = `${API_URL}/policy/rule/get/${org_id}/${rule_id}`;

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
      action_type: "get_policy_rule_details",
      payload: { org_id, rule_id },
      message: `Failed to fetch policy rule details - Rule ID: ${rule_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get policy rule details.",
    );
  }
};

export const editPolicyRule = async (org_id, rule_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/policy/rule/edit/${org_id}/${rule_id}`;

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
      throw new Error(res?.data?.message || "Failed to update policy rule.");

    const ruleName = data?.rule_name || data?.name || `Rule ID: ${rule_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_policy_rule",
      payload: { org_id, rule_id, ...data },
      message: `Policy rule updated successfully - "${ruleName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const ruleName = data?.rule_name || data?.name || `Rule ID: ${rule_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_policy_rule",
      payload: { org_id, rule_id, ...data },
      message: `Failed to update policy rule - "${ruleName}"`,
    });

    throw new Error(response?.data?.message || "Failed to update policy rule.");
  }
};

export const deletePolicyRule = async (org_id, rule_id) => {
  const method = "DELETE";
  const url = `${API_URL}/policy/rule/delete/${org_id}/${rule_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete policy rule.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_policy_rule",
      payload: { org_id, rule_id },
      message: `Policy rule deleted successfully - Rule ID: ${rule_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_policy_rule",
      payload: { org_id, rule_id },
      message: `Failed to delete policy rule - Rule ID: ${rule_id}`,
    });

    throw new Error(response?.data?.message || "Failed to delete policy rule.");
  }
};