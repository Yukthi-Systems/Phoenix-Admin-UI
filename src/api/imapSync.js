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

export const createImapSyncJob = async (data) => {
  const method = "POST";
  const url = `${API_URL}/imap-sync/create`;
  const fromAccount = data.imap_username;
  const toAccount = `${data.to_email_prefix}@${data.to_email_domain}`;

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
      throw new Error(res?.data?.message || "Failed to create IMAP sync job.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_imap_sync_job",
      payload: { ...data },

      message: `Created IMAP sync job from ${fromAccount} to ${toAccount}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_imap_sync_job",
      payload: { ...data },
      message: `Failed to create IMAP sync job from ${fromAccount} to ${toAccount}`,
    });

    throw new Error(
      response?.data?.message || "Failed to create IMAP sync job.",
    );
  }
};

// List IMAP Sync Jobs
export const listImapSyncJobs = async (domain_name, page, limit) => {
  const method = "GET";
  const url = `${API_URL}/imap-sync/list/${domain_name}/${page}/${limit}`;

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
      action_type: "list_imap_sync_jobs",
      payload: { domain_name, page, limit },
      message: `Failed to retrieve IMAP sync jobs list - Domain: ${domain_name}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get IMAP sync jobs list.",
    );
  }
};
