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
import { adminStore } from "@/store/store";
import { csrfTokenAtom } from "@/store/csrftoken";
import { addLogs } from "./logs";
import { AuthAPI } from "@/utils/authAPI";
import { API_URL } from "@/constants/constants";
import { trimInput } from "@/utils/textUtils";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

// 1. Create new initial invoice
export const createInitialInvoice = async (organization_id, payload) => {
  const url = `${API_URL}/crm/invoice/initial/${organization_id}`;
 
  try {
    const res = await axios.post(url, payload, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    if (res.status !== 201)
      throw new Error(
        res?.data?.message || "Failed to create initial invoice.",
      );

    const invoiceNumber = payload?.invoice_number || payload?.invoice_id || 'New Invoice';
    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "create_initial_invoice",
      payload,
      message: `Initial invoice created successfully - "${invoiceNumber}"`,
      notify: false,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const invoiceNumber = payload?.invoice_number || payload?.invoice_id || 'Unknown Invoice';
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "create_initial_invoice",
      payload,
      message: `Failed to create initial invoice - "${invoiceNumber}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to create initial invoice.",
    );
  }
};

// 2. Create invoice revision
export const createInvoiceRevision = async (organization_id, payload) => {
  const url = `${API_URL}/crm/invoice/revision/${organization_id}`;

  try {
    const res = await axios.put(url, payload, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    if (![200, 201, 204].includes(res.status))
      throw new Error(
        res?.data?.message || "Failed to create revision invoice.",
      );

    const invoiceNumber = payload?.invoice_number || payload?.invoice_id || 'Invoice Revision';
    await addLogs({
      values: res,
      type: "success",
      method: "PUT",
      action_type: "create_revision_invoice",
      payload,
      message: `Invoice revision created successfully - "${invoiceNumber}"`,
      notify: false,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const invoiceNumber = payload?.invoice_number || payload?.invoice_id || 'Unknown Invoice';
    await addLogs({
      values: response,
      type: "error",
      method: "PUT",
      action_type: "create_revision_invoice",
      payload,
      message: `Failed to create invoice revision - "${invoiceNumber}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to create revision invoice.",
    );
  }
};

// 3. Get all invoices for organization
export const getAllInvoices = async (
  organization_id,
  page,
  page_size,
  query = "",
) => {
  const url = `${API_URL}/crm/invoice/list/${organization_id}?page=${page}&page_size=${page_size}&query=${query}`;

  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "get_invoice_list",
      payload: { organization_id },
      message: `Failed to retrieve invoices list - Page: ${page}, Search: "${query}"`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get invoice list.");
  }
};

export const getAllGlobalInvoices = async (
  page,
  page_size,
  query = "",
) => {
  const url = `${API_URL}/crm/invoice/list-all?page=${page}&page_size=${page_size}&query=${query}`;

  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "get_global_invoice_list",
      payload: { page, page_size, query },
      message: `Failed to retrieve global invoices list - Page: ${page}, Search: "${query}"`,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get global invoice list.");
  }
};

// 4. Get invoice and its revisions
export const fetchInvoiceWithRevisions = async (
  organization_id,
  invoice_id,
) => {
  const url = `${API_URL}/crm/invoice/fetch/${organization_id}?invoice_id=${invoice_id}`;
  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "get_invoice_with_revisions",
      payload: { organization_id, invoice_id },
      message: `Failed to fetch invoice with revisions - Invoice ID: ${invoice_id}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get invoice list.");
  }
};

// 5. Get latest invoice ID
export const getLatestInvoiceId = async () => {
  const url = `${API_URL}/crm/invoice/latest-id`;

  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "get_invoice_latest_id",
      message: "Failed to retrieve latest invoice ID",
      notify: false,
    });

    throw new Error(response?.data?.message || "Failed to get invoice.");
  }
};

// 6. Download invoice revision (PDF or blob)
export const downloadInvoiceRevision = async (organization_id, revision_id) => {
  const url = `${API_URL}/crm/invoice/download/${organization_id}/${revision_id}`;
  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
      withCredentials: true,
      responseType: "blob", // For file download
      timeout: 10000,
    });
    return res.data; // Blob
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "download_invoice_revision",
      payload: { organization_id, revision_id },
      message: `Failed to download invoice revision - Revision ID: ${revision_id}`,
      org_Id: organization_id,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to get invoice download.",
    );
  }
};

export const uploadInvoice = async (organization_id, revision_id, formData) => {
  const url = `${API_URL}/crm/invoice/upload/${organization_id}/${revision_id}`;

  try {
    const res = await axios.post(url, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      timeout: 10000,
    });

    if (res.status !== 201)
      throw new Error(
        res?.data?.message || "Failed to upload invoice.",
      );

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "upload_invoice",
      payload: formData,
      message: `Invoice uploaded successfully - Revision ID: ${revision_id}`,
      notify: false,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "upload_invoice",
      payload: formData,
      message: `Failed to upload invoice - Revision ID: ${revision_id}`,
    });

    throw new Error(response?.data?.message || "Failed to upload invoice.");
  }
};

export const updateInitialInvoice = async (organization_id, payload) => {
  const url = `${API_URL}/crm/invoice/initial/${organization_id}`;
  try {
    const res = await axios.patch(url, payload, {
      headers: getHeaders(),
      withCredentials: true,
      timeout: 10000,
    });

    if (![200, 201, 204].includes(res.status))
      throw new Error(
        res?.data?.message || "Failed to update initial invoice.",
      );

    const invoiceNumber = payload?.invoice_number || payload?.invoice_id || 'Invoice Update';
    await addLogs({
      values: res,
      type: "success",
      method: "PATCH",
      action_type: "update_initial_invoice",
      payload,
      message: `Initial invoice updated successfully - "${invoiceNumber}"`,
      notify: false,
    });
    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const invoiceNumber = payload?.invoice_number || payload?.invoice_id || 'Unknown Invoice';
    await addLogs({
      values: response,
      type: "error",
      method: "PATCH",
      action_type: "update_initial_invoice",
      payload,
      message: `Failed to update initial invoice - "${invoiceNumber}"`,
      notify: false,
    });

    throw new Error(
      response?.data?.message || "Failed to update initial invoice.",
    );
  }
};