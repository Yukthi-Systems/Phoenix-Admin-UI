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
import { API_URL } from "@/constants/constants";

// Get Organization Space Metrics
export const getOrganizationSpaceMetrics = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/organization_space/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get organization space metrics...!");
  }
  return res.data;
};

// Get Domains Space Metrics
export const getDomainsSpaceMetrics = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/domains_space/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get domains space metrics...!");
  }
  return res.data;
};

// Get Domains Metrics
export const getDomainsMetrics = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/domains/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get domains metrics...!");
  }
  return res.data;
};


// Get Mailboxes Space Metrics
export const getMailboxesSpaceMetrics = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/mailboxes_space/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get mailboxes space metrics...!");
  }
  return res.data;
};

// Get Total Users Under Organization
export const getTotalUsersMetrics = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/total_users/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get total users metrics...!");
  }
  return res.data;
};

// Get Top Logins Per Domain
export const getTopLoginsPerDomain = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/top_logins_per_domain/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get top logins per domain...!");
  }
  return res.data;
};

// Get Top IP Logins Per Domain
export const getTopIPLoginsPerDomain = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/top_ip_logins_per_domain/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get top IP logins per domain...!");
  }
  return res.data;
};

// Get Logins Per Domain
export const getLoginsPerDomain = async (organization_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/logins_per_domain/${organization_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get logins per domain...!");
  }
  return res.data;
};

export const getStatus = async () => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/status`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get logins per domain...!");
  }
  return res.data;
};

export const getServerMetrics = async (
  server_id,
  from_date_time,
  to_date_time,
) => {
  const url = `${API_URL}/dashboard/server_metrics/${server_id}?from_date_time=${encodeURIComponent(from_date_time)}&to_date_time=${encodeURIComponent(to_date_time)}`;

  try {
    const res = await axios({
      method: "GET",
      url,
      headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": adminStore.get(csrfTokenAtom),
      },
      withCredentials: true,
      timeout: 30000,
    });

    if (res.status !== 200) {
      throw new Error("Failed to get server metrics.");
    }

    return res.data;
  } catch (error) {
    throw new Error("Failed to get server metrics.");
  }
};

export const getOverallStatus = async () => {
  let config = {
    method: "GET",
    url: `${API_URL}/dashboard/status/maintenance`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 30 * 1000,
  };
  const res = await axios(config);
  if (res.status !== 200) {
    throw new Error("Failed to get logins per domain...!");
  }
  return res.data;
};
