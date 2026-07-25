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

export const updatePermissionTemplate = async (org_id, user_id, data) => {
  const method = "PATCH";
  const url = `${API_URL}/user/permissions/${org_id}/template?user_id=${user_id}`;

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
        res?.data?.message || "Failed to update permissions template.",
      );

    const templateName = data?.template_name || data?.name || 'Permissions Template';
    await addLogs({
      values: res,
      type: "success",
      method,
      action_type: "update_permissions_template",
      payload: data,
      message: `Permissions template updated successfully - "${templateName}" for User ID: ${user_id}`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    AuthAPI({ status: response?.status });
    
    const templateName = data?.template_name || data?.name || 'Permissions Template';
    await addLogs({
      values: response,
      type: "error",
      method,
      action_type: "update_permissions_template",
      payload: data,
      message: `Failed to update permissions template - "${templateName}" for User ID: ${user_id}`,
    });

    throw new Error(
      response?.data?.message || "Failed to update permissions template.",
    );
  }
};