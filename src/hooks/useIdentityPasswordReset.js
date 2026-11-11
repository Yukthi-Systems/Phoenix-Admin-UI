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

// TEMPORARY: hooks for identity password reset by existing password / email
// link (see api/identityPasswordReset.js). Expected to be removed after ~1 month.

import { useMutation } from "@tanstack/react-query";
import {
  resetIdentityPasswordWithCurrent,
  requestIdentityPasswordResetLink,
  completeIdentityPasswordResetLink,
} from "@/api/identityPasswordReset";

export function useResetIdentityPasswordWithCurrent() {
  return useMutation({
    mutationKey: ["identity_password_reset_current"],
    mutationFn: resetIdentityPasswordWithCurrent,
  });
}

export function useRequestIdentityPasswordResetLink() {
  return useMutation({
    mutationKey: ["identity_password_reset_link_request"],
    mutationFn: requestIdentityPasswordResetLink,
  });
}

export function useCompleteIdentityPasswordResetLink() {
  return useMutation({
    mutationKey: ["identity_password_reset_link_complete"],
    mutationFn: completeIdentityPasswordResetLink,
  });
}
