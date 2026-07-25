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

// CRM Purchase Order APIs
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


export const getCRMPO = async (organization_id, page, limit) => {
  const method = "GET";
  const url = `${API_URL}/crm/purchase-orders/${organization_id}/${page}/${limit}`;

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
      action_type: "get_crm_po_list",
      payload: { organization_id, page, limit },
      message: `Failed to fetch CRM purchase orders list - Page: ${page}, Limit: ${limit}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get CRM purchase order list.",
    );
  }
};

export const addCRMPO = async (data) => {
  const method = "POST";
  const url = `${API_URL}/crm/purchase-order`;
  const poIdentifier = data?.name ||  'New Purchase Order';
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
      throw new Error(res?.data?.message || "Failed to create CRM purchase order.");

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_crm_po",
      payload: data,
      message: `CRM purchase order created successfully - "${poIdentifier}"`,
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
      action_type: "create_crm_po",
      payload: data,
      message: `Failed to create CRM purchase order - "${poIdentifier}"`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to create CRM purchase order.");
  }
};

export const getCRMPOItem = async (organization_id, po_id) => {
  const method = "GET";
  const url = `${API_URL}/crm/purchase-order/${organization_id}/${po_id}`;

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
      action_type: "get_crm_po_details",
      payload: { organization_id, po_id },
      message: `Failed to fetch CRM purchase order details - PO ID: ${po_id}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get CRM purchase order details.",
    );
  }
};

export const editCRMPO = async (po_id, data) => {
  const method = "PUT";
  const url = `${API_URL}/crm/purchase-order/${po_id}`;

   const poIdentifier = data?.name || data?.po_name ||  `PO ID: ${po_id}`;

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
      throw new Error(
        res?.data?.message || "Failed to update CRM purchase order.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_crm_po",
      payload: { po_id, ...data },
      message: `CRM purchase order updated successfully - "${poIdentifier}"`,
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
      action_type: "update_crm_po",
      payload: { po_id, ...data },
      message: `Failed to update CRM purchase order - "${poIdentifier}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to update CRM purchase order.",
    );
  }
};

export const deleteCRMPO = async (organization_id, po_id , po_name = "Unknown PO") => {
  const method = "DELETE";
  const url = `${API_URL}/crm/purchase-order/${organization_id}/${po_id}`;

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
        res?.data?.message || "Failed to delete CRM purchase order.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_crm_po",
      payload: { organization_id, po_id },
      message: `"${ po_name || po_id}" CRM purchase order deleted successfully`,
      org_Id: organization_id,
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
      action_type: "delete_crm_po",
      payload: { organization_id, po_id },
      message: `Failed to delete "${ po_name || po_id}" CRM purchase order`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to delete CRM purchase order.",
    );
  }
};

export const addCRMPOLink = async (
  organization_id,
  po_id,
  service_code,
  data,
) => {
  const method = "POST";
  const url = `${API_URL}/crm/link/${organization_id}/${po_id}/${service_code}`;
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
      throw new Error(
        res?.data?.message || "Failed to link CRM purchase order.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "create_crm_po_link",
      payload: data,
      message: `CRM purchase order linked successfully - PO ID: ${po_id}, Service: ${service_code}`,
      org_Id: organization_id,
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
      action_type: "create_crm_po_link",
      payload: data,
      message: `Failed to link CRM purchase order - PO ID: ${po_id}, Service: ${service_code}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to link CRM purchase order.",
    );
  }
};

export const deleteCRMPOLink = async (
  organization_id,
  po_id,
  assignment_id,
) => {
  const method = "DELETE";
  const url = `${API_URL}/crm/link/${organization_id}/${po_id}/${assignment_id}`;

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
        res?.data?.message || "Failed to delete CRM purchase order link.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "delete_crm_po_link",
      payload: { organization_id, po_id, assignment_id },
      message: `CRM purchase order link removed successfully - PO ID: ${po_id}, Assignment: ${assignment_id}`,
      org_Id: organization_id,
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
      action_type: "delete_crm_po_link",
      payload: { organization_id, po_id, assignment_id },
      message: `Failed to remove CRM purchase order link - PO ID: ${po_id}, Assignment: ${assignment_id}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to delete CRM purchase order link.",
    );
  }
};

export const editCRMPOLink = async (
  organization_id,
  po_id,
  service_code,
  assignment_id,
  data,
) => {
  const method = "PUT";
  const url = `${API_URL}/crm/link/${organization_id}/${po_id}/${service_code}/${assignment_id}`;

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
      throw new Error(
        res?.data?.message || "Failed to update CRM purchase order link.",
      );

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_crm_po_link",
      payload: { po_id, ...data },
      message: `CRM purchase order link updated successfully - PO ID: ${po_id}, Service: ${service_code}`,
      org_Id: organization_id,
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
      action_type: "update_crm_po_link",
      payload: { po_id, ...data },
      message: `Failed to update CRM purchase order link - PO ID: ${po_id}, Service: ${service_code}`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to update CRM purchase order link.",
    );
  }
};

export const exportCRMPO = async (organization_id, page, limit) => {
  const method = "GET";
  const url = `${API_URL}/crm/export/purchase-orders/${organization_id}/${page}/${limit}`;

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
      action_type: "export_crm_po_list",
      payload: { organization_id, page, limit },
      message: `CRM purchase orders exported successfully - Page: ${page}, Limit: ${limit}`,
      org_Id: organization_id,
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
      action_type: "export_crm_po_list",
      payload: { organization_id, page, limit },
      message: `Failed to export CRM purchase orders - Page: ${page}, Limit: ${limit}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get CRM purchase order list.",
    );
  }
};