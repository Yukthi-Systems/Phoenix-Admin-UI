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
import { csrfTokenAtom } from "../store/csrftoken";
import { adminStore } from "../store/store";
import { addLogs } from "./logs";
import { API_URL } from "@/constants/constants";

export const generateQRCode = async (
  org_id = "",
  user_id = "",
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/totp/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to generate QR code");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_generate_QRCode",
      payload: data,
      message: `QR code generated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_generate_QRCode",
      payload: data,
      message: `Failed to generate QR code for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to generate QR code.");
  }
};

export const enabledisbaleTFA = async (
  org_id = "",
  user_id = "",
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "PUT",
    url: `${API_URL}/2fa/totp/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;
  let action_type_choose = queryParams.enable ? "2fa_enable" : "2fa_disable";
  let action_message_choose_ = queryParams.enable
    ? `TOTP 2FA enabled successfully for "${userNameValue}"`
    : `TOTP 2FA disabled successfully for "${userNameValue}"`;
  let action_message_choose_fails = queryParams.enable
    ? `Failed to enable TOTP 2FA for "${userNameValue}"`
    : `Failed to disable TOTP 2FA for "${userNameValue}"`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to Enable / Disable 2FA");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "PUT",
      action_type: action_type_choose,
      payload: data,
      message: action_message_choose_,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "PUT",
      action_type: action_type_choose,
      payload: data,
      message: action_message_choose_fails,
    });
    throw new Error(response?.data?.message || "Failed to enable/disable 2FA.");
  }
};

export const generateBackupCode = async (org_id = "", user_id = "", userName = "") => {
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/backup/${org_id}/${user_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to generate Backup code");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_generate_backupcode",
      payload: data,
      message: `Backup codes generated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_generate_backupcode",
      payload: data,
      message: `Failed to generate backup codes for "${userNameValue}"`,
    });
    throw new Error(
      response?.data?.message || "Failed to generate Backup code.",
    );
  }
};

export const validateTFA = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "PATCH",
    url: `${API_URL}/2fa/totp/validate?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    queryParams,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to Validate 2FA Code");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "PATCH",
      action_type: "2fa_totp_validation",
      payload: data,
      message: "TOTP code validated successfully",
      notify: false,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "PATCH",
      action_type: "2fa_totp_validation",
      payload: data,
      message: "Failed to validate TOTP code",
      notify: false,
    });
    throw new Error(response?.data?.message || "Failed to Validate 2FA Code.");
  }
};

export const backupcodeLogin = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "PATCH",
    url: `${API_URL}/2fa/backup/validate?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    queryParams,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to validate backup code");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "PATCH",
      action_type: "2fa_backupcode_validation",
      payload: data,
      message: "Backup code validated successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "PATCH",
      action_type: "2fa_backupcode_validation",
      payload: data,
      message: "Failed to validate backup code",
    });
    throw new Error(response?.data?.message || "Failed to validate backup code.");
  }
};

export const getUserTFA = async (org_id = "", user_id = "", userName = "") => {
  let config = {
    method: "GET",
    url: `${API_URL}/2fa/totp/${org_id}/${user_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };
  let data = {
    org_id,
    user_id,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to get TOTP configuration");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "GET",
      action_type: "2fa_get_totp_list",
      payload: data,
      message: `TOTP configuration retrieved successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "2fa_get_totp_list",
      payload: data,
      message: `Failed to get TOTP configuration for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to get TOTP configuration.");
  }
};

export const editUserTFA = async (
  org_id = "",
  user_id = "",
  totp_id = "",
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "PATCH",
    url: `${API_URL}/2fa/totp/${org_id}/${user_id}/${totp_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    totp_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to update TOTP configuration");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "PATCH",
      action_type: "2fa_edit_totp",
      payload: data,
      message: `TOTP configuration updated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "PATCH",
      action_type: "2fa_edit_totp",
      payload: data,
      message: `Failed to update TOTP configuration for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to edit TOTP configuration.");
  }
};

export const deleteUserTFA = async (
  org_id = "",
  user_id = "",
  totp_id = "",
  userName = "",
) => {
  let config = {
    method: "DELETE",
    url: `${API_URL}/2fa/totp/${org_id}/${user_id}/${totp_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    totp_id,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to delete TOTP configuration");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "DELETE",
      action_type: "2fa_delete_totp",
      payload: data,
      message: `TOTP configuration deleted successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "DELETE",
      action_type: "2fa_delete_totp",
      payload: data,
      message: `Failed to delete TOTP configuration for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to delete TOTP configuration.");
  }
};

export const generateEmailOTP = async (
  org_id = "",
  user_id = "",
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/email/verify/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to generate email OTP");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_generate_email_otp",
      payload: data,
      message: `Email OTP generated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_generate_email_otp",
      payload: data,
      message: `Failed to generate email OTP for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to generate email OTP.");
  }
};

export const validateEmailOTP = async (
  org_id = "",
  user_id = "",
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/email/validate-email/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to validate email OTP.");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_validate_email_otp",
      payload: data,
      message: `Email OTP validated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_validate_email_otp",
      payload: data,
      message: `Failed to validate email OTP for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to validate email OTP.");
  }
};

export const enabledisbaleEmailAuth = async (
  org_id,
  user_id,
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/email/manage/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;
  let action_type_choose = queryParams.enable
    ? "2fa_enable_email_auth"
    : "2fa_disable_email_auth";
  let action_message_choose_ = queryParams.enable
    ? `Email authentication enabled successfully for "${userNameValue}"`
    : `Email authentication disabled successfully for "${userNameValue}"`;
  let action_message_choose_fails = queryParams.enable
    ? `Failed to enable email authentication for "${userNameValue}"`
    : `Failed to disable email authentication for "${userNameValue}"`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to Enable/Disable Email Auth.");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: action_type_choose,
      payload: data,
      message: action_message_choose_,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: action_type_choose,
      payload: data,
      message: action_message_choose_fails,
    });
    throw new Error(
      response?.data?.message || "Failed to Enable/Disable Email Auth.",
    );
  }
};

export const sendEmailOTP = async () => {
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/email/send-otp`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to send email OTP.");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_send_email_otp",
      payload: {},
      message: "Email OTP sent successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_send_email_otp",
      payload: {},
      message: "Failed to send email OTP",
    });
    throw new Error(response?.data?.message || "Failed to send email OTP.");
  }
};

export const validateEmailAuthOTP = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/email/validate?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    queryParams,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to validate email OTP.");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_validate_email_otp",
      payload: data,
      message: "Email authentication OTP validated successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_validate_email_otp",
      payload: data,
      message: "Failed to validate email authentication OTP",
    });
    throw new Error(response?.data?.message || "Failed to validate email OTP.");
  }
};

export const generatePhoneOTP = async (org_id, user_id, queryParams = {}, userName = "") => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/phone/verify/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to generate phone OTP");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_generate_phone_otp",
      payload: data,
      message: `Phone OTP generated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_generate_phone_otp",
      payload: data,
      message: `Failed to generate phone OTP for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to generate phone OTP.");
  }
};

export const validatePhoneOTP = async (org_id, user_id, queryParams = {}, userName = "") => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/phone/validate-phone/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to validate phone OTP");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_validate_phone_otp",
      payload: data,
      message: `Phone OTP validated successfully for "${userNameValue}"`,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_validate_phone_otp",
      payload: data,
      message: `Failed to validate phone OTP for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to validate phone OTP.");
  }
};

export const enabledisbalePhoneAuth = async (
  org_id,
  user_id,
  queryParams = {},
  userName = "",
) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/phone/manage/${org_id}/${user_id}?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  let data = {
    org_id,
    user_id,
    queryParams,
  };

  const userNameValue = userName || `User ID: ${user_id}`;
  let action_type_choose = queryParams.enable
    ? "2fa_enable_phone_auth"
    : "2fa_disable_phone_auth";
  let action_message_choose_ = queryParams.enable
    ? `Phone authentication enabled successfully for "${userNameValue}"`
    : `Phone authentication disabled successfully for "${userNameValue}"`;
  let action_message_choose_fails = queryParams.enable
    ? `Failed to enable phone authentication for "${userNameValue}"`
    : `Failed to disable phone authentication for "${userNameValue}"`;

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to Enable/Disable phone authentication");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: action_type_choose,
      payload: data,
      message: action_message_choose_,
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: action_type_choose,
      payload: data,
      message: action_message_choose_fails,
    });
    throw new Error(
      response?.data?.message ||
        "Failed to enable/disable phone authentication.",
    );
  }
};

export const sendPhoneOTP = async () => {
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/phone/send-otp`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to send phone OTP");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_send_phone_otp",
      payload: {},
      message: "Phone OTP sent successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_send_phone_otp",
      payload: {},
      message: "Failed to send phone OTP",
    });
    throw new Error(response?.data?.message || "Failed to send phone OTP.");
  }
};

export const validatePhoneAuthOTP = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  let config = {
    method: "POST",
    url: `${API_URL}/2fa/phone/validate?${queryString}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
      throw new Error("Failed to validate phone OTP");
    }

    await addLogs({
      values: res,
      type: "success",
      method: "POST",
      action_type: "2fa_validate_phone_otp",
      payload: {},
      message: "Phone authentication OTP validated successfully",
    });

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    await addLogs({
      values: response,
      type: "error",
      method: "POST",
      action_type: "2fa_validate_phone_otp",
      payload: {},
      message: "Failed to validate phone authentication OTP",
    });
    throw new Error(response?.data?.message || "Failed to validate phone OTP.");
  }
};

export const getBackupCheck = async (org_id, user_id, userName = "") => {
  let config = {
    method: "GET",
    url: `${API_URL}/2fa/backup/check/${org_id}/${user_id}`,
    headers: {
      "Content-Type": "application/json",
      "X-Csrf-Token": adminStore.get(csrfTokenAtom),
    },
    withCredentials: true,
    timeout: 8 * 1000,
  };

  try {
    const res = await axios(config);

    if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
      throw new Error("Failed to get backup codes status");
    }

    return res.data;
  } catch (error) {
    const response = error?.response || {};
    const userNameValue = userName || `User ID: ${user_id}`;
    await addLogs({
      values: response,
      type: "error",
      method: "GET",
      action_type: "2fa_get_backupcode",
      payload: { org_id: org_id },
      message: `Failed to get backup codes status for "${userNameValue}"`,
    });
    throw new Error(response?.data?.message || "Failed to get backup codes status.");
  }
};