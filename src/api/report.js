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

// ✔ Report a bug
export const reportBug = async (payload) => {
  const url = `${API_URL}/maintenance/report/bug`;
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
    const response = error?.response || {};

    throw new Error(
      response?.data?.message || "Failed to report bug. Please try again.",
    );
  }
};

// ✔ Get bug reports by status
export const getBugReports = async (bug_status, page, size) => {
  const url = `${API_URL}/maintenance/report/bug/${bug_status}?page=${page}&size=${size}`;
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
    const response = error?.response || {};

    throw new Error(
      response?.data?.message ||
        "Failed to fetch bug reports. Please try again.",
    );
  }
};

// ✔ Update bug report status
export const updateBugReportStatus = async (report_id, bug_status) => {
  const url = `${API_URL}/maintenance/report/bug/${report_id}?bug_status=${bug_status}`;
  const method = "PUT";

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
      response?.data?.message ||
        "Failed to update bug status. Please try again.",
    );
  }
};

export const deleteBugReport = async (report_id, bug_status) => {
  const url = `${API_URL}/maintenance/report/bug/${report_id}`;
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
    const response = error?.response || {};

    throw new Error(
      response?.data?.message || "Failed to delete bug . Please try again.",
    );
  }
};

// ----------- UPLOAD FILE (binary FormData) -----------
export const uploadBugFile = async (formData) => {
  const url = `${API_URL}/maintenance/file/upload`;

  try {
    const res = await axios.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Csrf-Token": adminStore.get(csrfTokenAtom),
      },

      withCredentials: true,
      timeout: 10000,
    });

    return res.data; // should contain file_id
  } catch (error) {
    const response = error?.response;
    throw new Error(
      response?.data?.message || "Failed to upload file. Please try again.",
    );
  }
};

// ----------- GET FILE BY ID -----------
export const getBugFile = async (file_id) => {
  const url = `${API_URL}/maintenance/file/${file_id}`;

  try {
    const res = await axios.get(url, {
      withCredentials: true,
      headers: {
        "X-Csrf-Token": adminStore.get(csrfTokenAtom),
      },
      responseType: "arraybuffer", // supports binary
    });

    return res.data;
  } catch (error) {
    const response = error?.response;
    throw new Error(
      response?.data?.message || "Failed to fetch file. Please try again.",
    );
  }
};
