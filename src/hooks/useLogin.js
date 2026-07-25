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

import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useSetAtom } from "jotai";
import { userInfoAtom } from "../store/userInfo";

export function useLogin() {
  const setUserInfo = useSetAtom(userInfoAtom);
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ username, password, recaptcha_token }) =>
      login(username, password, recaptcha_token),
    onSuccess: (data) => {
      const user_info = {
        user_id: data?.details?.user_id || null,
        organization_id: data?.details?.organization_id || null,
        is_active: data?.details?.is_active || false,
        parent_org_id: data?.details?.organization_id || null,
        display_name: data?.details?.display_name || null,
        user_name: data?.details?.user_name || null,
      };
      setUserInfo(user_info);
    },
  });
}
