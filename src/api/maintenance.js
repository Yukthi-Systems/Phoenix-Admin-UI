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

export const getMaintenanceStatus = async (is_active = true) => {
  const method = "GET";
  const url = `${API_URL}/maintenance/status?is_active=${is_active}`;

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

    throw new Error(
      response?.data?.message || "Failed to get maintenance status.",
    );
  }
};

export const createMaintenanceStatus = async (data) => {
  const method = "POST";
  const url = `${API_URL}/maintenance/status`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 5000,
      data,
    });
    
    const maintenanceTitle = data?.title || data?.maintenance_title || 'New Maintenance Status';
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_maintenance_status",
      payload: { data },
      message: `Maintenance status created successfully - "${maintenanceTitle}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const maintenanceTitle = data?.title || data?.maintenance_title || 'Unknown Maintenance';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_maintenance_status",
      payload: { ...data },
      message: `Failed to create maintenance status - "${maintenanceTitle}"`,
    });
    throw new Error(
      response?.data?.message || "Failed to create maintenance status.",
    );
  }
};

export const updateMaintenanceStatus = async ({ data, maintenance_id }) => {
  const method = "PUT";
  const url = `${API_URL}/maintenance/status/${maintenance_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 5000,
      data,
    });
    
    const maintenanceTitle = data?.title || data?.maintenance_title || `Maintenance ID: ${maintenance_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_maintenance_status",
      payload: { ...data, maintenance_id },
      message: `Maintenance status updated successfully - "${maintenanceTitle}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const maintenanceTitle = data?.title || data?.maintenance_title || `Maintenance ID: ${maintenance_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_maintenance_status",
      payload: { ...data, maintenance_id },
      message: `Failed to update maintenance status - "${maintenanceTitle}"`,
    });
    throw new Error(
      response?.data?.message || "Failed to update maintenance status.",
    );
  }
};

export const deleteMaintenanceStatus = async ({ maintenance_id, maintenance_title = "Unknown Maintenance" }) => {
  const method = "DELETE";
  const url = `${API_URL}/maintenance/status/${maintenance_id}`;

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
      action_type: "delete_maintenance_status",
      payload: { maintenance_id },
      message: `Maintenance status deleted successfully - ${maintenance_title}`,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_maintenance_status",
      payload: { maintenance_id },
      message: `Failed to delete ${maintenance_title} maintenance status`,
    });
    throw new Error(
      response?.data?.message || "Failed to delete maintenance status.",
    );
  }
};