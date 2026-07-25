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

import { useMutation, useQuery } from "@tanstack/react-query";
import * as twoFAApi from "../api/twoFA";

// --- Helpers ---
const createMutation = (key, fn) => () =>
  useMutation({ mutationKey: [key], mutationFn: fn });

const createParamMutation = (key, fn) => () =>
  useMutation({
    mutationKey: [key],
    mutationFn: async (params) => fn(...Object.values(params)),
  });

// --- QR Code ---
export const useGenerateQR = createParamMutation(
  "generate_qr",
  twoFAApi.generateQRCode,
);

// --- Enable/Disable ---
export const useEnableDisableTFA = createParamMutation(
  "enable_disable_tfa",
  twoFAApi.enabledisbaleTFA,
);

export const useEnableDisableEmailAuth = createParamMutation(
  "enable_disable_email_auth",
  twoFAApi.enabledisbaleEmailAuth,
);

export const useEnableDisablePhoneAuth = createParamMutation(
  "enable_disable_phone_auth",
  twoFAApi.enabledisbalePhoneAuth,
);

// --- Backup Codes ---
export const useGenerateBackupCode = createParamMutation(
  "generate_backup_code",
  twoFAApi.generateBackupCode,
);

export const useBackupLogin = createMutation(
  "backup_login",
  ({ queryParams }) => twoFAApi.backupcodeLogin(queryParams),
);

export const useBackupCheck = ({ organization_id, user_id, userName }) =>
  useQuery({
    queryKey: ["check_backup_code", organization_id, user_id],
    queryFn: () => twoFAApi.getBackupCheck(organization_id, user_id, userName),
  });

// --- TOTP ---
export const useValidateTFA = createMutation(
  "validate_tfa",
  ({ queryParams }) => twoFAApi.validateTFA(queryParams),
);

// --- User TFA Info ---
export const useGetUserTFA = ({ organization_id, user_id, userName }) =>
  useQuery({
    queryKey: ["get_user_tfa", organization_id, user_id],
    queryFn: () => twoFAApi.getUserTFA(organization_id, user_id, userName),
  });

// --- Update/Delete TFA ---
export const useUpdateUserTFA = createMutation(
  "update_user_tfa",
  ({ org_id, user_id, totp_id, queryParams = {}, userName }) =>
    twoFAApi.editUserTFA(org_id, user_id, totp_id, queryParams, userName),
);

export const useDeleteUserTFA = createMutation(
  "delete_user_tfa",
  ({ org_id, user_id, totp_id, userName }) =>
    twoFAApi.deleteUserTFA(org_id, user_id, totp_id, userName),
);

// --- Email OTP ---
export const useGenerateEmailOTP = createParamMutation(
  "generate_email_otp",
  twoFAApi.generateEmailOTP,
);

export const useValidateEmailOTP = createParamMutation(
  "validate_email_otp",
  twoFAApi.validateEmailOTP,
);

export const useSendEmailOTP = createMutation("send_email_otp", () =>
  twoFAApi.sendEmailOTP(),
);

export const useValidateEmailAuthOTP = createMutation(
  "validate_email_auth_otp",
  ({ queryParams }) => twoFAApi.validateEmailAuthOTP(queryParams),
);

// --- Phone OTP ---
export const useGeneratePhoneOTP = createParamMutation(
  "generate_phone_otp",
  twoFAApi.generatePhoneOTP,
);

export const useValidatePhoneOTP = createParamMutation(
  "validate_phone_otp",
  twoFAApi.validatePhoneOTP,
);

export const useSendPhoneOTP = createMutation("send_phone_otp", () =>
  twoFAApi.sendPhoneOTP(),
);

export const useValidatePhoneAuthOTP = createMutation(
  "validate_phone_auth_otp",
  ({ queryParams }) => twoFAApi.validatePhoneAuthOTP(queryParams),
);
