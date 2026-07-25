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
import {
  initiatePasswordReset,
  completePasswordReset,
  initiatePasswordResetIdentity,
  completePasswordResetIdentity,
} from "../api/passwordReset";

/**
 * Hook to initiate password reset process
 * Generates a reset token and sends it via email or mobile
 */
export function useInitiatePasswordReset() {
  return useMutation({
    mutationKey: ["initiate_password_reset"],
    mutationFn: async ({ user_name, verify_via, recaptcha_token }) =>
      initiatePasswordReset(user_name, verify_via, recaptcha_token),
  });
}

/**
 * Hook to complete password reset process
 * Verifies the reset token and updates the password
 */
export function useCompletePasswordReset() {
  return useMutation({
    mutationKey: ["complete_password_reset"],
    mutationFn: async ({ user_name, data }) =>
      completePasswordReset(user_name, data),
  });
}

/**
 * Hook to initiate password reset process for an E-Mail Identity
 * Generates a reset token and sends it via email or phone
 */
export function useInitiatePasswordResetIdentity() {
  return useMutation({
    mutationKey: ["initiate_password_reset_identity"],
    mutationFn: async ({ email_id, verify_via, recaptcha_token }) =>
      initiatePasswordResetIdentity(email_id, verify_via, recaptcha_token),
  });
}

/**
 * Hook to complete password reset process for an E-Mail Identity
 * Verifies the reset token and updates the password
 */
export function useCompletePasswordResetIdentity() {
  return useMutation({
    mutationKey: ["complete_password_reset_identity"],
    mutationFn: async ({ email_id, data }) =>
      completePasswordResetIdentity(email_id, data),
  });
}
