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
import { trimInput } from "@/utils/textUtils";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

export const getMailboxes = async (domain_name, page, pageSize, query = "") => {
  const method = "GET";
  const url = `${API_URL}/mailbox/list/${domain_name}?page=${page}&limit=${pageSize}&query=${encodeURIComponent(query)}`;

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
      action_type: "get_mailbox_list",
      payload: { domain_name, page, pageSize },
      message: `Failed to retrieve mailboxes list - Domain: "${domain_name}", Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw error;
  }
};

export const getMailbox = async (domain_name, email_prefix) => {
  const method = "GET";
  const url = `${API_URL}/mailbox/details/${domain_name}/${email_prefix}`;

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
      action_type: "get_mailbox_details",
      payload: { domain_name, email_prefix },
      message: `Failed to fetch mailbox details - "${email_prefix}@${domain_name}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get mailbox details.",
    );
  }
};

export const getFullIdentityInfoByAdmin = async (email) => {
  const method = "GET";
  const url = `${API_URL}/mailbox/admin/details/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_full_identity_info_by_admin",
      payload: { email },
      message: `Failed to fetch full identity info - "${email}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get full identity info.",
    );
  }
};

export const addMailbox = async (data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/mailbox/create`;
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
    let changeData = { ...data };
    changeData.password_hash = "********";
    if (res.status !== 201)
      throw new Error(res?.data?.message || "Failed to create mailbox.");

    if (addLog) return res.data;
    const emailAddress = data?.email_address || data?.email_identity || `${data?.email_prefix}@${data?.domain_name}` || 'New Mailbox';
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_mailbox",
      payload: changeData,
      message: `Mailbox created successfully - "${emailAddress}"`,
    });

    return res.data;
  } catch (error) {
    let changeData = { ...data };
    changeData.password_hash = "********";
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    if (!addLog) throw new Error(response?.data?.message || "Failed to create mailbox.");

    const emailAddress = data?.email_address || data?.email_identity || `${data?.email_prefix}@${data?.domain_name}` || 'Unknown Mailbox';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_mailbox",
      payload: changeData,
      message: `Failed to create mailbox - "${emailAddress}"`,
    });

    throw new Error(response?.data?.message || "Failed to create mailbox.");
  }
};

export const editMailbox = async (domain_name, email_prefix, data) => {
  const method = "PATCH";
  const url = `${API_URL}/mailbox/edit/info/${domain_name}/${email_prefix}`;
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
      throw new Error(res?.data?.message || "Failed to update mailbox");

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_mailbox",
      payload: { domain_name, email_prefix, ...data },
      message: `Mailbox updated successfully - "${emailAddress}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_mailbox",
      payload: { domain_name, email_prefix, ...data },
      message: `Failed to update mailbox - "${emailAddress}"`,
    });

    throw new Error(response?.data?.message || "Failed to update mailbox");
  }
};

export const updateMailboxStatus = async (
  domain_name,
  email_prefix,
  status,
) => {
  const method = "PUT";
  const url = `${API_URL}/mailbox/edit/activation/${domain_name}/${email_prefix}?is_enabled=${status}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update mailbox status.");

    const emailAddress = `${email_prefix}@${domain_name}`;
    const statusText = status ? 'activated' : 'deactivated';
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_mailbox_status",
      payload: { domain_name, email_prefix, status },
      message: `Mailbox ${statusText} successfully - "${emailAddress}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const emailAddress = `${email_prefix}@${domain_name}`;
    const statusText = status ? 'activate' : 'deactivate';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_mailbox_status",
      payload: { domain_name, email_prefix, status },
      message: `Failed to ${statusText} mailbox - "${emailAddress}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update mailbox status.",
    );
  }
};

export const updateMailboxSpace = async (domain_name, email_prefix, space) => {
  const method = "PATCH";
  const url = `${API_URL}/mailbox/edit/quota/${domain_name}/${email_prefix}?new_quota_allocated=${space}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update mailbox quota.");

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_mailbox_quota",
      payload: { domain_name, email_prefix, space },
      message: `Mailbox quota updated to ${space} (GB) for - "${emailAddress}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_mailbox_quota",
      payload: { domain_name, email_prefix, space },
      message: `Failed to update mailbox quota to ${space} (GB) for - "${emailAddress}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update mailbox quota.",
    );
  }
};

export const updateMailboxPassword = async (
  domain_name,
  email_prefix,
  password,
) => {
  const method = "PUT";
  const url = `${API_URL}/mailbox/edit/password/${domain_name}/${email_prefix}?passwd_hash=${password}`;

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
        res?.data?.message || "Failed to update mailbox password.",
      );

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_mailbox_password",
      payload: { domain_name, email_prefix, password: "********" },
      message: `Mailbox password updated successfully - "${emailAddress}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_mailbox_password",
      payload: { domain_name, email_prefix, password: "********" },
      message: `Failed to update mailbox password - "${emailAddress}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update mailbox password.",
    );
  }
};

export const deleteMailbox = async (domain_name, email_prefix) => {
  const method = "DELETE";
  const url = `${API_URL}/mailbox/delete/${domain_name}/${email_prefix}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete mailbox.");

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_mailbox",
      payload: { domain_name, email_prefix },
      message: `Mailbox deleted successfully - "${emailAddress}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const emailAddress = `${email_prefix}@${domain_name}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_mailbox",
      payload: { domain_name, email_prefix },
      message: `Failed to delete mailbox - "${emailAddress}"`,
    });

    throw new Error(response?.data?.message || "Failed to delete mailbox.");
  }
};

export const exportMailBox = async (domain_name, page, pageSize) => {
  const method = "GET";
  const url = `${API_URL}/mailbox/export/${domain_name}?page=${page}&size=${pageSize}`;

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
      action_type: "export_mailbox_list",
      payload: { domain_name, page, pageSize },
      message: `Mailboxes exported successfully - Domain: "${domain_name}", Page: ${page}, Page Size: ${pageSize}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_mailbox_list",
      payload: { domain_name, page, pageSize },
      message: `Failed to export mailboxes - Domain: "${domain_name}", Page: ${page}, Page Size: ${pageSize}`,
    });

    throw error;
  }
};