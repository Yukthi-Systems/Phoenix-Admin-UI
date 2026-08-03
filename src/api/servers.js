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

export const getServers = async (page, pageSize, searchParams = null) => {

  const method = "GET";
  let url = `${API_URL}/server/list/${page}/${pageSize}`;

  if (searchParams) {
    const queryString = new URLSearchParams({
      query: searchParams,
    }).toString();
    url += `?${queryString}`;
  }

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
      action_type: "get_server_list",
      payload: { page, pageSize },
      message: `Failed to retrieve servers list - Page: ${page}, Page Size: ${pageSize}, Search: "${searchParams?.query || ""}"`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get server list.");
  }
};

export const getServer = async (server_id) => {
  const method = "GET";
  const url = `${API_URL}/server/details/${server_id}`;

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
      action_type: "get_server_details",
      payload: { server_id },
      message: `Failed to fetch server details - Server ID: ${server_id}`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get server details.");
  }
};

export const addServer = async (data) => {
  const method = "POST";
  const url = `${API_URL}/server/create`;

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
      throw new Error(res?.data?.message || "Failed to create server.");

    const serverName =
      data?.server_name || data?.name || data?.hostname || "New Server";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_server",
      payload: data,
      message: `Server created successfully - "${serverName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const serverName =
      data?.server_name || data?.name || data?.hostname || "Unknown Server";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_server",
      payload: data,
      message: `Failed to create server - "${serverName}"`,
    });

    throw new Error(response?.data?.message || "Failed to create server.");
  }
};

export const updateServer = async (server_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/server/edit/${server_id}`;

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
      throw new Error(res?.data?.message || "Failed to update server.");

    const serverName =
      data?.server_name ||
      data?.name ||
      data?.hostname ||
      `Server ID: ${server_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_server",
      payload: { server_id, ...data },
      message: `Server updated successfully - "${serverName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const serverName =
      data?.server_name ||
      data?.name ||
      data?.hostname ||
      `Server ID: ${server_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_server",
      payload: { server_id, ...data },
      message: `Failed to update server - "${serverName}"`,
    });

    throw new Error(response?.data?.message || "Failed to update server.");
  }
};

export const deleteServer = async (server_id, server_name) => {
  const method = "DELETE";
  const url = `${API_URL}/server/delete/${server_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error("Failed to delete server.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_server",
      payload: { server_id },
      message: `Server deleted successfully - "${server_name || server_id}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_server",
      payload: { server_id },
      message: `Failed to delete "${server_name || server_id}" server `,
    });

    throw new Error(response?.data?.message || "Failed to delete server.");
  }
};

export const startMailboxMigration = async (
  source_server_id,
  target_server_id,
  email,
) => {
  const method = "POST";
  const url = `${API_URL}/server/migrations/start/${source_server_id}/to/${target_server_id}?email=${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "start_mailbox_migration",
      payload: { source_server_id, target_server_id, email },
      message: `Mailbox migration started successfully - Email: "${email}", From Server: ${source_server_id}, To Server: ${target_server_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "start_mailbox_migration",
      payload: { source_server_id, target_server_id, email },
      message: `Failed to start mailbox migration - Email: "${email}", From Server: ${source_server_id}, To Server: ${target_server_id}`,
    });

    throw new Error(response?.data?.message || "Failed to start migration.");
  }
};

export const startManualMailboxMigration = async (
  source_server_id,
  target_server_id,
  email,
) => {
  const method = "POST";
  const url = `${API_URL}/server/migrations/manual/${source_server_id}/to/${target_server_id}?email=${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "start_manual_mailbox_migration",
      payload: { source_server_id, target_server_id, email },
      message: `Manual mailbox migration started successfully - Email: "${email}", From Server: ${source_server_id}, To Server: ${target_server_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "start_manual_mailbox_migration",
      payload: { source_server_id, target_server_id, email },
      message: `Failed to start manual mailbox migration - Email: "${email}", From Server: ${source_server_id}, To Server: ${target_server_id}`,
    });

    throw new Error(
      response?.data?.message || "Failed to start manual migration.",
    );
  }
};

export const lockMailbox = async (email, is_locked) => {
  const method = "POST";
  const url = `${API_URL}/server/lock/mailbox/${email}?is_locked=${is_locked}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    const lockStatus = is_locked ? "locked" : "unlocked";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_mailbox_lock",
      payload: { email, is_locked },
      message: `Mailbox ${lockStatus} successfully - "${email}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const lockStatus = is_locked ? "lock" : "unlock";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_mailbox_lock",
      payload: { email, is_locked },
      message: `Failed to ${lockStatus} mailbox - "${email}"`,
    });

    throw new Error(
      error?.response?.data?.message || "Failed to update mailbox lock status.",
    );
  }
};

export const getMailboxLockStatus = async (email) => {
  const method = "GET";
  const url = `${API_URL}/server/lock/status/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 6000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(
      response?.data?.message || "Failed to get mailbox lock status.",
    );
  }
};

export const getMailboxMigrationStatus = async (email) => {
  const method = "GET";
  const url = `${API_URL}/server/migration/status/${email}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 6000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(
      response?.data?.message || "Failed to get migration status.",
    );
  }
};

export const getMailboxesFromServer = async (
  server_id,
  emailStartsWith = "",
  page = 1,
  pageSize = 10,
) => {
  const method = "GET";
  const url = `${API_URL}/server/list_mailboxes/${server_id}?email_starts_with=${emailStartsWith}&page=${page}&page_size=${pageSize}`;

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
    throw new Error(
      response?.data?.message || "Failed to get mailboxes from server.",
    );
  }
};

export const getMailboxMigrationLogs = async (
  email,
  page = 1,
  pageSize = 25,
) => {
  const method = "GET";
  const url = `${API_URL}/server/migrations/from/mailbox/${email}?page=${page}&page_size=${pageSize}`;

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
    throw new Error(
      response?.data?.message ||
      "Failed to get migration logs for this mailbox.",
    );
  }
};

export const getMigrationsFromSourceServer = async (
  server_id,
  page = 1,
  pageSize = 25,
) => {
  const method = "GET";
  const url = `${API_URL}/server/migrations/from/source_server/${server_id}?page=${page}&page_size=${pageSize}`;

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
    throw new Error(
      error?.response?.data?.message ||
      "Failed to get migrations from source server.",
    );
  }
};

export const getServerMigrationStats = async (server_id) => {
  const method = "GET";
  const url = `${API_URL}/server/migrations/stats/${server_id}`;

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
    throw new Error(
      error?.response?.data?.message || "Failed to get server migration stats.",
    );
  }
};

//domain related

export const lockDomain = async (domain_name, is_locked, servers) => {
  const method = "POST";
  const url = `${API_URL}/server/lock/domain/${domain_name}?is_locked=${is_locked}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
      data: servers,
    });

    const lockStatus = is_locked ? "locked" : "unlocked";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_domain_lock",
      payload: { domain_name, is_locked, servers },
      message: `Domain ${lockStatus} successfully - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const lockStatus = is_locked ? "lock" : "unlock";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_domain_lock",
      payload: { domain_name, is_locked, servers },
      message: `Failed to ${lockStatus} domain - "${domain_name}"`,
    });

    throw new Error(
      error?.response?.data?.message || "Failed to update domain lock status.",
    );
  }
};

export const getDomainLockStatus = async (domain_name) => {
  const method = "GET";
  const url = `${API_URL}/server/lock/domain/status/${domain_name}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 6000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(
      response?.data?.message || "Failed to get domain lock status.",
    );
  }
};

export const getDomainMigrationStatus = async (domain_name) => {
  const method = "GET";
  const url = `${API_URL}/server/migration/domain/status/${domain_name}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 6000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    throw new Error(
      response?.data?.message || "Failed to get domain migration status.",
    );
  }
};

export const mailMapping = async ({ mailList = [] }) => {
  const method = "POST";
  const url = `${API_URL}/server/email/server-mappings`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 6000,
      data: mailList,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_email_server_mappings",
      payload: { mailList },
      message: `Failed to create email server mappings for ${mailList.length} emails`,
    });
    throw new Error(
      response?.data?.message || "Failed to create email server mappings.",
    );
  }
};

export const updateServerStatus = async (server_id, status, server_name) => {
  const method = "PATCH";
  const url = `${API_URL}/server/switch/${server_id}?is_active=${status}`;
  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update domain status.");

    const statusText = status ? "activated" : "deactivated";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_server_status",
      payload: { server_id, status },
      message: `Server ${statusText} successfully - "${server_name || server_id}"`,
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
      action_type: "update_server_status",
      payload: { server_id, status },
      message: `Failed to ${statusText} server - "${server_name || server_id}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update server status.",
    );
  }
};

export const recalculateQuota = async () => {
  const method = "POST";
  const url = `${API_URL}/server/recalculate/quotas`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 18000,
      data: null,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "recalculate_quota",
      payload: null,
      message: `Failed to recalculate quota `,
    });
    throw new Error(response?.data?.message || "Failed to recalculate quota");
  }
};

export const getPflogsumReport = async (server_host_id, from_when) => {
  const method = "GET";
  const url = `${API_URL}/server/pflogsum/report/${server_host_id}?from_when=${from_when}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 60000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "get_pflogsum_report",
      payload: { server_host_id, from_when },
      message: "Failed to fetch Pflogsum report",
    });

    throw new Error(
      response?.data?.message || "Failed to get Pflogsum report.",
    );
  }
};


/**
 * Fetches the list of server processes for a specific host.
 * @param {string} server_host_id - The ID of the mailbox server host.
 * @returns {Promise<Object>} The process list data.
 */
export const getServerProcs = async (server_host_id) => {
  const method = 'GET';
  const url = `${API_URL}/server/procs/list/${server_host_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 60000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: 'error',
      method,
      action_type: 'get_server_procs_list',
      payload: { server_host_id },
      message: 'Failed to fetch server process list',
    });

    throw new Error(response?.data?.message || 'Failed to get server process list.');
  }
};