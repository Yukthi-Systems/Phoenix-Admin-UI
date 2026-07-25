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

export const getCRMService = async () => {
  const method = "GET";
  const url = `${API_URL}/crm/services`;

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
      action_type: "get_crm_service_list",
      payload: {},
      message: "Failed to fetch CRM services list",
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get CRM service list.",
    );
  }
};

export const addCRMService = async (data) => {
  const method = "POST";
  const url = `${API_URL}/crm/service`;
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
      throw new Error(res?.data?.message || "Failed to create CRM service.");

    const serviceName = data?.service_name || data?.name || "New Service";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_crm_service",
      payload: data,
      message: `CRM service created successfully - "${serviceName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const serviceName = data?.service_name || data?.name || "Unknown Service";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_crm_service",
      payload: data,
      message: `Failed to create CRM service - "${serviceName}"`,
    });

    throw new Error(response?.data?.message || "Failed to create CRM service.");
  }
};

export const getCRMServiceItem = async (service_code) => {
  const method = "GET";
  const url = `${API_URL}/crm/service/${service_code}`;

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
      action_type: "get_crm_service_details",
      payload: { service_code },
      message: `Failed to fetch CRM service details - Service Code: ${service_code}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get CRM service details.",
    );
  }
};

export const editCRMService = async (service_code, data) => {
  const method = "PUT";
  const url = `${API_URL}/crm/service/${service_code}`;

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
      throw new Error(res?.data?.message || "Failed to update CRM service.");

    const serviceName =
      data?.service_name || data?.name || `Service Code: ${service_code}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_crm_service",
      payload: { service_code, ...data },
      message: `CRM service updated successfully - "${serviceName}"`,
      notify: false,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const serviceName =
      data?.service_name || data?.name || `Service Code: ${service_code}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_crm_service",
      payload: { service_code, ...data },
      message: `Failed to update CRM service - "${serviceName}"`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to update CRM service.");
  }
};

export const deleteCRMService = async (service_code) => {
  const method = "DELETE";
  const url = `${API_URL}/crm/service/${service_code}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete CRM service.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_crm_service",
      payload: { service_code },
      message: `CRM service deleted successfully - Service Code: ${service_code}`,
      notify: false,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_crm_service",
      payload: { service_code },
      message: `Failed to delete CRM service - Service Code: ${service_code}`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to delete CRM service.");
  }
};
