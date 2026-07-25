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

export const getDomains = async (org_id, page, pageSize, query = "") => {
  const method = "GET";
  const url = `${API_URL}/domain/list/${org_id}?page=${page}&limit=${pageSize}&query=${encodeURIComponent(query)}`;

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
      action_type: "get_domain_list",
      payload: { org_id, page, pageSize },
      message: `Failed to retrieve domains list - Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get domain list.");
  }
};

export const getDomain = async (domain_name) => {
  const method = "GET";
  const url = `${API_URL}/domain/details/${domain_name}`;

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
      action_type: "get_domain_details",
      payload: { domain_name },
      message: `Failed to fetch domain details - "${domain_name}"`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get domain details.");
  }
};

export const addDomain = async (data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/domain/create`;
  const cleanData = trimInput(data);
  if (cleanData?.spam_destination_properties?.folder_name) {
    cleanData.spam_destination_properties.folder_name = encodeURIComponent(
      cleanData.spam_destination_properties.folder_name,
    );
  }
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
      throw new Error(res?.data?.message || "Failed to create domain.");

    if (addLog) {
      const domainName = data?.domain_name || data?.name || 'New Domain';
      await addLogs({
        values: res,
        type: "success",
        method,
        action_type: "create_domain",
        payload: data,
        message: `Domain created successfully - "${domainName}"`,
      });
    }
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    if (addLog) {
      const domainName = data?.domain_name || data?.name || 'Unknown Domain';
      await addLogs({
        values: response,
        type: "error",
        method,
        action_type: "create_domain",
        payload: data,
        message: `Failed to create domain - "${domainName}"`,
      });
    }
    throw new Error(response?.data?.message || "Failed to create domain.");
  }
};

export const updateDomain = async (organization_id, domain_name, data) => {
  const method = "PATCH";
  const url = `${API_URL}/domain/edit/info/${organization_id}/${domain_name}`;
  const cleanData = trimInput(data);
  if (cleanData?.spam_destination_properties?.folder_name) {
    cleanData.spam_destination_properties.folder_name = encodeURIComponent(
      cleanData.spam_destination_properties.folder_name,
    );
  }
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
      throw new Error(res?.data?.message || "Failed to update domain.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_domain",
      payload: { organization_id, domain_name, ...data },
      message: `Domain updated successfully - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_domain",
      payload: { organization_id, domain_name, ...data },
      message: `Failed to update domain - "${domain_name}"`,
    });

    throw new Error(response?.data?.message || "Failed to update domain.");
  }
};

export const updateDomainStatus = async (
  organization_id,
  domain_name,
  status,
) => {
  const method = "PUT";
  const url = `${API_URL}/domain/edit/activation/${organization_id}/${domain_name}?is_active=${status}`;

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

    const statusText = status ? 'activated' : 'deactivated';
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_domain_status",
      payload: { organization_id, domain_name, status },
      message: `Domain ${statusText} successfully - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const statusText = status ? 'activate' : 'deactivate';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_domain_status",
      payload: { organization_id, domain_name, status },
      message: `Failed to ${statusText} domain - "${domain_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update domain status.",
    );
  }
};

export const updateDomainSpace = async (
  organization_id,
  domain_name,
  space,
) => {
  const method = "PUT";
  const url = `${API_URL}/domain/edit/quota/${organization_id}/${domain_name}?new_quota_allocated=${space}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to update domain quota.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_domain_quota",
      payload: { organization_id, domain_name, space },
      message: `Domain quota updated to ${space} (GB) for - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_domain_quota",
      payload: { organization_id, domain_name, space },
      message: `Failed to update domain quota to ${space} for - "${domain_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to update domain quota.",
    );
  }
};

export const deleteDomain = async (organization_id, domain_name) => {
  const method = "DELETE";
  const url = `${API_URL}/domain/delete/${organization_id}/${domain_name}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete domain.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_domain",
      payload: { organization_id, domain_name },
      message: `Domain deleted successfully - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_domain",
      payload: { organization_id, domain_name },
      message: `Failed to delete domain - "${domain_name}"`,
    });

    throw new Error(response?.data?.message || "Failed to delete domain.");
  }
};

export const getDNSRecord = async (domain_name) => {
  const method = "GET";
  const url = `${API_URL}/domain/dns/${domain_name}`;

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
      action_type: "get_dns_details",
      payload: { domain_name },
      message: `Failed to fetch DNS records for domain - "${domain_name}"`,
    });

    throw new Error(response?.data?.message || "Failed to get dns details.");
  }
};

export const getDomainTxtKey = async (domain_name) => {
  const method = "GET";
  const url = `${API_URL}/domain/dns-txt-verification-key/${domain_name}`;

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
      action_type: "get_domain_txt_key",
      payload: { domain_name },
      message: `Failed to fetch DNS TXT verification key for domain - "${domain_name}"`,
    });

    throw new Error(
      response?.data?.message || "Failed to get DNS TXT verification key.",
    );
  }
};

export const verifyDomainDns = async (domain_name) => {
  const method = "PATCH";
  const url = `${API_URL}/domain/dns-txt-verification-key/validate/${domain_name}`;

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
      action_type: "verify_domain_dns",
      payload: { domain_name },
      message: `Domain DNS TXT record verified successfully - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    // A 400 here means the TXT record wasn't found/matched yet - an expected
    // outcome, not a hard failure, so callers should branch on this flag.
    const isVerificationMismatch = response?.status === 400;
    await addLogs({
      values: response,
      type: isVerificationMismatch ? "warning" : "error",
      method,
      action_type: "verify_domain_dns",
      payload: { domain_name },
      message: isVerificationMismatch
        ? `Domain DNS TXT record not verified yet - "${domain_name}"`
        : `Failed to verify DNS TXT record for domain - "${domain_name}"`,
    });

    const err = new Error(
      response?.data?.message || "Failed to verify domain DNS record.",
    );
    err.isVerificationMismatch = isVerificationMismatch;
    throw err;
  }
};

export const moveDomain = async (
  organization_id,
  domain_name,
  target_organization_id,
) => {
  const method = "POST";
  const url = `${API_URL}/domain/migrate/${organization_id}/${domain_name}/to/${target_organization_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to move domain.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "move_domain",
      payload: { organization_id, domain_name },
      message: `Domain moved successfully - "${domain_name}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "move_domain",
      payload: { organization_id, domain_name },
      message: `Failed to move domain - "${domain_name}"`,
    });

    throw new Error(response?.data?.message || "Failed to move domain.");
  }
};