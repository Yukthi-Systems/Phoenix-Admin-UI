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
import { csrfTokenAtom } from "@/store/csrftoken";
import { API_URL } from "@/constants/constants";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

const getMultipartHeaders = () => ({
  "Content-Type": "multipart/form-data",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;

  const message =
    data.message ||
    data.error ||
    data.detail ||
    data.details ||
    data.reason ||
    data.msg;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "object" && message !== null) {
    return Object.values(message).flat().join(", ") || fallback;
  }

  return message || error?.message || fallback;
};

// ----------------------------------------------------------------------
// User / General Ticket Operations
// ----------------------------------------------------------------------

// PUT /support/tickets/file/upload
export const uploadTicketFile = async (formData) => {
  const url = `${API_URL}/support/tickets/file/upload`;
  const method = "PUT";

  try {
    const res = await axios({
      method,
      url,
      headers: getMultipartHeaders(),
      data: formData,
      withCredentials: true,
      timeout: 10 * 60 * 1000, // 10 minutes for file upload
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to upload file. Please try again."),
    );
  }
};

// GET /support/tickets/file/{file_id}
export const getTicketFile = async (file_id) => {
  const url = `${API_URL}/support/tickets/file/${file_id}`;
  const method = "GET";

  try {
    const res = await axios({
      method,
      url,
      headers: {
        "X-Csrf-Token": adminStore.get(csrfTokenAtom),
      },
      withCredentials: true,
      responseType: "arraybuffer", // Supports binary data
      timeout: 30000,
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch file. Please try again."),
    );
  }
};

// DELETE /support/tickets/file/{file_id}
export const deleteTicketFile = async (file_id) => {
  const url = `${API_URL}/support/tickets/file/${file_id}`;
  const method = "DELETE";

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
    throw new Error(
      getErrorMessage(error, "Failed to delete file. Please try again."),
    );
  }
};

// POST /support/tickets/ticket
export const createSupportTicket = async (payload) => {
  const url = `${API_URL}/support/tickets/ticket`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      data: payload,
      withCredentials: true,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to create ticket. Please try again."),
    );
  }
};

// POST /support/tickets/follow-up/{organization_id}/{ticket_id}
export const addTicketFollowUp = async (
  organization_id,
  ticket_id,
  payload,
) => {
  const url = `${API_URL}/support/tickets/follow-up/${organization_id}/${ticket_id}`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      data: payload,
      withCredentials: true,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to add follow-up. Please try again."),
    );
  }
};

// GET /support/tickets/ticket/{organization_id}/{ticket_id}
export const getTicktById = async (organization_id, ticket_id) => {
  const url = `${API_URL}/support/tickets/ticket/${organization_id}/${ticket_id}`;
  const method = "GET";

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
    throw new Error(
      getErrorMessage(error, "Failed to load ticket by id. Please try again."),
    );
  }
};

// GET /support/tickets/tickets/{organization_id}
export const getSupportTickets = async (
  organization_id,
  page,
  size,
  query = "",
) => {
  let url = `${API_URL}/support/tickets/tickets/${organization_id}?page=${page}&page_size=${size}`;
  if (query) {
    url += `&query=${encodeURIComponent(query)}`;
  }
  const method = "GET";

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
    throw new Error(
      getErrorMessage(error, "Failed to fetch tickets. Please try again."),
    );
  }
};

// GET /support/tickets/follow-ups/{organization_id}/{ticket_id}
export const getTicketFollowUps = async (
  organization_id,
  ticket_id,
  page,
  size,
) => {
  const url = `${API_URL}/support/tickets/follow-ups/${organization_id}/${ticket_id}?page=${page}&page_size=${size}`;
  const method = "GET";

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
    throw new Error(
      getErrorMessage(error, "Failed to fetch follow-ups. Please try again."),
    );
  }
};

// ----------------------------------------------------------------------
// Admin Operations
// ----------------------------------------------------------------------

// POST /support/tickets/admin/tickets/fetch
export const getAdminSupportTickets = async (page, size, payload) => {
  const url = `${API_URL}/support/tickets/admin/tickets/fetch?page=${page}&page_size=${size}`;
  const method = "POST";

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      data: payload,
      withCredentials: true,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch admin tickets. Please try again."),
    );
  }
};

// PATCH /support/tickets/admin/ticket/{organization_id}/{ticket_id}
export const updateSupportTicketStatus = async (
  organization_id,
  ticket_id,
  payload,
) => {
  const url = `${API_URL}/support/tickets/admin/ticket/${organization_id}/${ticket_id}`;
  const method = "PATCH";

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      data: payload,
      withCredentials: true,
      timeout: 5000,
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Failed to update ticket status. Please try again.",
      ),
    );
  }
};

// DELETE /support/tickets/admin/ticket/{organization_id}/{ticket_id}
export const deleteSupportTicket = async (organization_id, ticket_id) => {
  const url = `${API_URL}/support/tickets/admin/ticket/${organization_id}/${ticket_id}`;
  const method = "DELETE";

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
    throw new Error(
      getErrorMessage(error, "Failed to delete ticket. Please try again."),
    );
  }
};
