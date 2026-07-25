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

// Create Caution Message
export const createCaution = async (data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/caution/create`;
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
      throw new Error(res?.data?.message || "Failed to create Caution.");

    if (!addLog) return res.data;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_caution",
      payload: data,
      message: `New caution message created successfully - Name: "${data.caution_message_name || 'Untitled'}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    if (!addLog) throw new Error(response?.data?.message || "Failed to create caution message.");
    const cautionTitle = data?.caution_message_name || 'Unknown title';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_caution",
      payload: data,
      message: `Failed to create caution message "${cautionTitle}"`,
    });

    throw new Error(response?.data?.message || "Failed to create caution message.");
  }
};

// Get Caution Details
export const getCautionDetails = async (organization_id, caution_id) => {
  const method = "GET";
  const url = `${API_URL}/caution/details/${organization_id}/${caution_id}`;

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
      action_type: "get_caution_details",
      payload: { organization_id, caution_id },
      message: `Failed to retrieve caution details Caution ID: ${caution_id}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get caution details.",
    );
  }
};

// Update Caution Message
export const updateCaution = async (organization_id, caution_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/caution/update/${organization_id}/${caution_id}`;
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
      throw new Error(res?.data?.message || "Failed to update caution.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_caution",
      payload: { organization_id, caution_id, ...data },
      message: `Caution message updated successfully - Title: "${data.caution_message_name || 'Untitled'}"`,
      org_Id: organization_id,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const cautionTitle = data?.caution_message_name || 'Unknown title';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_caution",
      payload: { organization_id, caution_id, ...data },
      message: `Failed to update caution message -  Name: "${cautionTitle}"`,
      org_Id: organization_id,
    });

    throw new Error(response?.data?.message || "Failed to update caution message.");
  }
};

// Delete Caution Message
export const deleteCaution = async (organization_id, caution_id, caution_name) => {
  const method = "DELETE";
  const url = `${API_URL}/caution/delete/${organization_id}/${caution_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete caution.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_caution",
      payload: { organization_id, caution_id },
      message: `"${caution_name}" Caution message permanently deleted.`,
      org_Id: organization_id,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_caution",
      payload: { organization_id, caution_id },
      message: `Failed to delete "${caution_name}" caution message`,
      org_Id: organization_id,
    });

    throw new Error(response?.data?.message || "Failed to delete caution message.");
  }
};

// List Caution Messages
export const getCautionsList = async (
  organization_id,
  page,
  page_size,
  query = "",
) => {
  const method = "GET";
  const url = `${API_URL}/caution/list/${organization_id}/${page}/${page_size}?query=${encodeURIComponent(query)}`;

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
      action_type: "get_cautions_list",
      payload: { organization_id, page, page_size, query },
      message: `Failed to retrieve cautions list - Page: ${page}, Query: "${query}"`,
      notify: false,
    });

    throw new Error("Failed to get cautions list.");
  }
};

// Export Caution Messages
export const exportCautionsList = async (organization_id, page, page_size) => {
  const method = "GET";
  const url = `${API_URL}/caution/export/${organization_id}/${page}/${page_size}`;

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
      type: "success", // Changed from "error" to "success"
      method,
      action_type: "export_cautions_list",
      payload: { organization_id, page, page_size },
      message: `Caution messages exported successfully - Page: ${page}, Page Size: ${page_size}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_cautions_list",
      payload: { organization_id, page, page_size },
      message: `Failed to export caution messages - Page: ${page}, Page Size: ${page_size}`,
    });

    throw new Error("Failed to export cautions list.");
  }
};