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

export const getDepartments = async (
  organization_id,
  page,
  pageSize,
  query = "",
) => {
  const method = "GET";
  const url = `${API_URL}/department/list/${organization_id}/${page}/${pageSize}?query=${encodeURIComponent(query)}`;

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
      action_type: "get_department_list",
      payload: { organization_id, page, pageSize },
      message: `Failed to retrieve departments list - Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get department list.",
    );
  }
};

export const getDepartment = async (organization_id, department_id) => {
  const method = "GET";
  const url = `${API_URL}/department/details/${organization_id}/${department_id}`;

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
      action_type: "get_department_details",
      payload: { organization_id, department_id },
      message: `Failed to fetch department details - Department ID: ${department_id}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get department details.",
    );
  }
};

export const createDepartment = async (data, addLog = true) => {
  const method = "POST";
  const url = `${API_URL}/department/create`;
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
      throw new Error(res?.data?.message || "Failed to create department.");

    if (!addLog) return res.data;
    const departmentName =
      data?.department_name || data?.name || "New Department";
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_department",
      payload: data,
      message: `Department created successfully - "${departmentName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    if (!addLog)
      throw new Error(
        response?.data?.message || "Failed to create department.",
      );
    const departmentName =
      data?.department_name || data?.name || "Unknown Department";
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "create_department",
      payload: data,
      message: `Failed to create department - "${departmentName}"`,
    });

    throw new Error(response?.data?.message || "Failed to create department.");
  }
};

export const updateDepartment = async (department_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/department/update/${department_id}`;
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
      throw new Error(res?.data?.message || "Failed to update department.");

    const departmentName =
      data?.department_name || data?.name || `Department ID: ${department_id}`;
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_department",
      payload: { department_id, ...data },
      message: `Department updated successfully - "${departmentName}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });

    const departmentName =
      data?.department_name || data?.name || `Department ID: ${department_id}`;
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_department",
      payload: { department_id, ...data },
      message: `Failed to update department - "${departmentName}"`,
    });

    throw new Error(response?.data?.message || "Failed to update department.");
  }
};

export const deleteDepartment = async (
  organization_id,
  department_id,
  department_name = "Unknown Department",
) => {
  const method = "DELETE";
  const url = `${API_URL}/department/delete/${organization_id}/${department_id}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 8000,
    });

    if (![200, 204].includes(res.status))
      throw new Error(res?.data?.message || "Failed to delete department.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_department",
      payload: { organization_id, department_id },
      message: `${department_name}  Department deleted successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "delete_department",
      payload: { organization_id, department_id },
      message: `Failed to delete ${department_name} department`,
    });

    throw new Error(response?.data?.message || "Failed to delete department.");
  }
};

export const exportDepartments = async (organization_id, page, pageSize) => {
  const method = "GET";
  const url = `${API_URL}/department/export/${organization_id}/${page}/${pageSize}`;

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
      action_type: "export_department_list",
      payload: { organization_id, page, pageSize },
      message: `Departments exported successfully - Page: ${page}, Page Size: ${pageSize}`,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "export_department_list",
      payload: { organization_id, page, pageSize },
      message: `Failed to export departments - Page: ${page}, Page Size: ${pageSize}`,
    });

    throw new Error(
      response?.data?.message || "Failed to get department list.",
    );
  }
};
