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
import { API_URL } from "@/constants/constants";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

export const getApiVersion = async () => {
  const method = "GET";
  const url = `${API_URL}/api/version`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
    });

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to fetch API version information."
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    throw new Error(
      response?.data?.message || "Failed to fetch API version information."
    );
  }
};

export const getApiHealth = async () => {
  const method = "GET";
  const url = `${API_URL}/api/health`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
    });

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to fetch API health status."
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    throw new Error(
      response?.data?.message || "Failed to fetch API health status."
    );
  }
};

export const getServerTime = async () => {
  const method = "GET";
  const url = `${API_URL}/api/time`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
    });

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to fetch server time."
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    throw new Error(
      response?.data?.message || "Failed to fetch server time."
    );
  }
};