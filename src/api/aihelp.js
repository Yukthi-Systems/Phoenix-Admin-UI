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

export const getAISupport = async (query) => {
  const method = "POST";
  const url = `${API_URL}/user/support`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 30000, // 30 seconds for AI response
      data: { query },
    });

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to get AI support response.",
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    throw new Error(
      response?.data?.message || "Failed to get AI support response.",
    );
  }
};

export const generateAiStyle = async (query) => {
  const method = "POST";
  const url = `${API_URL}/user/generate-style`;

  try {
    const res = await axios({
      method,
      url,
      headers: getHeaders(),
      withCredentials: true,
      timeout: 30000, // 30 seconds for AI response
      data: { query: query },
    });

    if (res.status !== 200) {
      throw new Error(
        res?.data?.message || "Failed to get AI support response.",
      );
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};

    throw new Error(
      response?.data?.message || "Failed to get AI support response.",
    );
  }
};
