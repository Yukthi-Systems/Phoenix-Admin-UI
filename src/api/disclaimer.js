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

// Create Domain Disclaimer
export const createDisclaimer = async (data, addLog = true) => {
    const cleanData = trimInput(data);
  let config = {
    method: "POST",
    url: `${API_URL}/disclaimer/create`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data: cleanData,
  };

  try {
    const res = await axios(config);

    if (res.status !== 201) {
      throw new Error(res?.data?.message || "Failed to create disclaimer.");
    }
    if (!addLog) return res.data;

    const disclaimerName = data?.disclaimer_name || data?.name || 'New Disclaimer';
    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "create_disclaimer",
      payload: data,
      message: `Disclaimer created successfully - "${disclaimerName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    if (!addLog) throw new Error(response?.data?.message || "Failed to create disclaimer.");
    const disclaimerName = data?.disclaimer_name || data?.name || 'Unknown Disclaimer';
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "create_disclaimer",
      payload: data,
      message: `Failed to create disclaimer - "${disclaimerName}"`,
    });
    throw new Error(response?.data?.message || "Failed to create disclaimer.");
  }
};

// Get Disclaimer Details
export const getDisclaimerDetails = async (organization_id, disclaimer_id) => {
  let config = {
    method: "GET",
    url: `${API_URL}/disclaimer/details/${organization_id}/${disclaimer_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 5 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to get disclaimer details...!",
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "get_disclaimer",
      payload: { organization_id, disclaimer_id },
      message: `Failed to fetch disclaimer details - Disclaimer ID: ${disclaimer_id}`,
      notify: false,
    });
    throw new Error(
      response?.data?.message || "Failed to get disclaimer details...!",
    );
  }
};

// Update Disclaimer
export const updateDisclaimer = async (disclaimer_id, data) => {
  const cleanData = trimInput(data);
  let config = {
    method: "PUT",
    url: `${API_URL}/disclaimer/edit/${disclaimer_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
    data: cleanData,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 204) {
      throw new Error(res?.data?.message || "Failed to update disclaimer.");
    }

    const disclaimerName = data?.disclaimer_name || data?.name || `Disclaimer ID: ${disclaimer_id}`;
    await addLogs({
      values: res,
      type: "success",
      method: "PUT",
      action_type: "update_disclaimer",
      payload: data,
      message: `Disclaimer updated successfully - "${disclaimerName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const disclaimerName = data?.disclaimer_name || data?.name || `Disclaimer ID: ${disclaimer_id}`;
    await addLogs({
      values: response,
      type: "error",
      method: "PUT",
      action_type: "update_disclaimer",
      payload: data,
      message: `Failed to update disclaimer - "${disclaimerName}"`,
    });
    throw new Error(response?.data?.message || "Failed to update disclaimer.");
  }
};

// Delete Disclaimer
export const deleteDisclaimer = async (organization_id, disclaimer_id, disclaimer_name = "Unknown Disclaimer") => {
  let config = {
    method: "DELETE",
    url: `${API_URL}/disclaimer/delete/${organization_id}/${disclaimer_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };
  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 204) {
      throw new Error(res?.data?.message || "Failed to delete disclaimer.");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "DELETE",
      action_type: "delete_disclaimer",
      payload: { organization_id, disclaimer_id },
      message: ` "${disclaimer_name}" Disclaimer deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "DELETE",
      action_type: "delete_disclaimer",
      payload: { organization_id, disclaimer_id },
      message: `Failed to delete ${disclaimer_name}" disclaimer`,
    });
    throw new Error(response?.data?.message || "Failed to delete disclaimer.");
  }
};

// List Disclaimers
export const getDisclaimersList = async (
  organization_id,
  page,
  limit,
  query = "",
) => {
  let config = {
    method: "GET",
    url: `${API_URL}/disclaimer/list/${organization_id}/${page}/${limit}?query=${encodeURIComponent(query)}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 5 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to get disclaimers list...!",
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "get_disclaimer_list",
      payload: { organization_id, page, limit, query },
      message: `Failed to retrieve disclaimers list - Page: ${page}, Search: "${query}"`,
      notify: false,
    });
    throw new Error(
      response?.data?.message || "Failed to get disclaimers list.",
    );
  }
};

// Export Disclaimers
export const exportDisclaimersList = async (organization_id, page, limit) => {
  let config = {
    method: "GET",
    url: `${API_URL}/disclaimer/export/${organization_id}/${page}/${limit}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 5 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to export disclaimers list...!",
      );
    }
    await addLogs({
      values: res,
      type: "success",
      method: "GET",
      action_type: "export_disclaimer_list",
      payload: { organization_id, page, limit },
      message: `Disclaimers exported successfully - Page: ${page}, Limit: ${limit}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "export_disclaimer_list",
      payload: { organization_id, page, limit },
      message: `Failed to export disclaimers - Page: ${page}, Limit: ${limit}`,
    });
    throw new Error(
      response?.data?.message || "Failed to export disclaimers list.",
    );
  }
};