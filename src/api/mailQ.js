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
import { addLogs } from "./logs";
import { API_URL } from "@/constants/constants";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

export const SearchMailQueue = async (serverHostId) => {
  const method = "GET";
  const url = `${API_URL}/server/mailq/${serverHostId}`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 60000,
    });

    return res.data;
  } catch (error) {
    // Properly throw the error object so React Query can handle it
    // Don't wrap it in another Error object
    throw error;
  }
};

export const doMailQueueAction = async (server_host_id, action, body = {}) => {
  const method = "POST";
  const url = `${API_URL}/server/mailq/${action}/${server_host_id}`;
  const payload = body;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 120000,
      data: payload,
    });

    if (![200, 201, 202, 204].includes(res.status)) {
      throw new Error(res?.data?.message || "Failed to perform queue action");
    }

    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: `mailq_${action}`,
      payload: { server_host_id, action, ...body },
      message: `Mail queue action '${action}' completed successfully`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: `mailq_${action}`,
      payload: { server_host_id, action, ...body },
      message: `Failed to perform mail queue action '${action}'`,
    });

    throw new Error(
      response?.data?.message ||
        error.message ||
        "Failed to perform queue action",
    );
  }
};

export const removeMessage = (server_host_id, message_id) =>
  doMailQueueAction(server_host_id, "remove", { message_id });

export const clearAllQueue = (server_host_id) =>
  doMailQueueAction(server_host_id, "clear_all");

export const flushQueue = (server_host_id) =>
  doMailQueueAction(server_host_id, "flush");

export const holdMessage = (server_host_id, message_id) =>
  doMailQueueAction(server_host_id, "hold", { message_id });

export const holdAllQueue = (server_host_id) =>
  doMailQueueAction(server_host_id, "hold_all");

export const requeueMessage = (server_host_id, message_id) =>
  doMailQueueAction(server_host_id, "requeue", { message_id });

export const requeueAllQueue = (server_host_id) =>
  doMailQueueAction(server_host_id, "requeue_all");
