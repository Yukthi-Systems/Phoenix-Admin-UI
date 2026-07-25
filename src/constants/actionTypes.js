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

export const ACTION_TYPES = {
  // Auth
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  GET_USER_PROFILE: "get_user_profile",

  // Caution
  CREATE_CAUTION: "create_caution",
  GET_CAUTION_DETAILS: "get_caution_details",
  UPDATE_CAUTION: "update_caution",
  DELETE_CAUTION: "delete_caution",
  GET_CAUTIONS_LIST: "get_cautions_list",
  EXPORT_CAUTIONS_LIST: "export_cautions_list",

  // CRM Purchase Order
  GET_CRM_PO_LIST: "get_crm_po_list",
  CREATE_CRM_PO: "create_crm_po",
  GET_CRM_PO_DETAILS: "get_crm_po_details",
  UPDATE_CRM_PO: "update_crm_po",
  DELETE_CRM_PO: "delete_crm_po",
  CREATE_CRM_PO_LINK: "create_crm_po_link",
  DELETE_CRM_PO_LINK: "delete_crm_po_link",
  UPDATE_CRM_PO_LINK: "update_crm_po_link",
  EXPORT_CRM_PO_LINK: "export_crm_po_list",

  // CRM Service
  GET_CRM_SERVICE_LIST: "get_crm_service_list",
  CREATE_CRM_SERVICE: "create_crm_service",
  GET_CRM_SERVICE_DETAILS: "get_crm_service_details",
  UPDATE_CRM_SERVICE: "update_crm_service",
  DELETE_CRM_SERVICE: "delete_crm_service",

  // Department
  GET_DEPARTMENT_LIST: "get_department_list",
  GET_DEPARTMENT_DETAILS: "get_department_details",
  CREATE_DEPARTMENT: "create_department",
  UPDATE_DEPARTMENT: "update_department",
  DELETE_DEPARTMENT: "delete_department",
  EXPORT_DEPARTMENT_LIST: "export_department_list",

  // Domain
  GET_DOMAIN_LIST: "get_domain_list",
  GET_DOMAIN_DETAILS: "get_domain_details",
  CREATE_DOMAIN: "create_domain",
  UPDATE_DOMAIN: "update_domain",
  UPDATE_DOMAIN_STATUS: "update_domain_status",
  UPDATE_DOMAIN_QUOTA: "update_domain_quota",
  DELETE_DOMAIN: "delete_domain",
  GET_DNS_DETAILS: "get_dns_details",
  MOVE_DOMAIN: "move_domain",

  // General Policy
  GET_GENERAL_POLICY_LIST: "get_general_policy_list",
  GET_GENERAL_POLICY_DETAILS: "get_general_policy_details",
  CREATE_GENERAL_POLICY: "create_general_policy",
  UPDATE_GENERAL_POLICY: "update_general_policy",
  DELETE_GENERAL_POLICY: "delete_general_policy",
  EXPORT_GENERAL_POLICY_LIST: "export_general_policy_list",

  // Filters Policy
  GET_FILTERS_POLICY_LIST: "get_filters_policy_list",
  GET_FILTERS_POLICY_DETAILS: "get_filters_policy_details",
  CREATE_FILTERS_POLICY: "create_filters_policy",
  UPDATE_FILTERS_POLICY: "update_filters_policy",
  DELETE_FILTERS_POLICY: "delete_filters_policy",
  EXPORT_FILTERS_POLICY_LIST: "export_filters_policy_list",

  // Attachment Policy
  GET_ATTACHMENT_POLICY_LIST: "get_attachment_policy_list",
  GET_ATTACHMENT_POLICY_DETAILS: "get_attachment_policy_details",
  CREATE_ATTACHMENT_POLICY: "create_attachment_policy",
  UPDATE_ATTACHMENT_POLICY: "update_attachment_policy",
  DELETE_ATTACHMENT_POLICY: "delete_attachment_policy",
  EXPORT_ATTACHMENT_POLICY_LIST: "export_attachment_policy_list",

  // Logs
  LOGS_DYNAMIC: "logs_dynamic", // since in logs.js it's type-based, maybe keep dynamic placeholder

  // Mailbox
  GET_MAILBOX_LIST: "get_mailbox_list",
  GET_MAILBOX_DETAILS: "get_mailbox_details",
  CREATE_MAILBOX: "create_mailbox",
  UPDATE_MAILBOX: "update_mailbox",
  UPDATE_MAILBOX_STATUS: "update_mailbox_status",
  UPDATE_MAILBOX_QUOTA: "update_mailbox_quota",
  UPDATE_MAILBOX_PASSWORD: "update_mailbox_password",
  DELETE_MAILBOX: "delete_mailbox",
  EXPORT_MAILBOX_LIST: "export_mailbox_list",

  // Organization
  GET_ORGANIZATION_LIST: "get_organization_list",
  GET_ORGANIZATION_DETAILS: "get_organization_details",
  CREATE_ORGANIZATION: "create_organization",
  UPDATE_ORGANIZATION: "update_organization",
  DELETE_ORGANIZATION: "delete_organization",
  UPDATE_ORGANIZATION_STATUS: "update_organization_status",
  UPDATE_ORGANIZATION_QUOTA: "update_organization_quota",
  RENAME_ORGANIZATION: "rename_organization",

  // Permission Template
  UPDATE_PERMISSIONS_TEMPLATE: "update_permissions_template",

  // Policy Rules
  GET_POLICY_RULES_LIST: "get_policy_rules_list",
  CREATE_POLICY_RULES: "create_policy_rules",
  GET_POLICY_RULE_DETAILS: "get_policy_rule_details",
  UPDATE_POLICY_RULE: "update_policy_rule",
  DELETE_POLICY_RULE: "delete_policy_rule",

  // Servers
  GET_SERVER_LIST: "get_server_list",
  GET_SERVER_DETAILS: "get_server_details",
  CREATE_SERVER: "create_server",
  UPDATE_SERVER: "update_server",
  DELETE_SERVER: "delete_server",
  START_MAILBOX_MIGRATION: "start_mailbox_migration",

  // User
  GET_USER_LIST: "get_user_list",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  UPDATE_USER_PASSWORD: "update_user_password",
  UPDATE_USER_PERMISSIONS: "update_user_permissions",

  // 2FA
  TFA_GENERATE_QRCODE: "2fa_generate_QRCode",
  TFA_ENABLE: "2fa_enable",
  TFA_DISABLE: "2fa_disable",
  TFA_GENERATE_BACKUPCODE: "2fa_generate_backupcode",
  TFA_BACKUPCODE_VALIDATION: "2fa_backupcode_validation",
  TFA_TOTP_VALIDATION: "2fa_totp_validation",
  TFA_GET_TOTP_LIST: "2fa_get_totp_list",
  TFA_EDIT: "2fa_edit",
  TFA_DELETE: "2fa_delete",
  TFA_GENERATE_EMAIL_OTP: "2fa_generate_email_otp",
  TFA_VALIDATE_EMAIL_OTP: "2fa_validate_email_otp",
  TFA_ENABLE_EMAIL_AUTH: "2fa_enable_email_auth",
  TFA_DISABLE_EMAIL_AUTH: "2fa_disable_email_auth",
  TFA_SEND_EMAIL_OTP: "2fa_send_email_otp",
  TFA_GENERATE_PHONE_OTP: "2fa_generate_phone_otp",
  TFA_VALIDATE_PHONE_OTP: "2fa_validate_phone_otp",
  TFA_ENABLE_PHONE_AUTH: "2fa_enable_phone_auth",
  TFA_DISABLE_PHONE_AUTH: "2fa_disable_phone_auth",
  TFA_SEND_PHONE_OTP: "2fa_send_phone_otp",
  TFA_GET_BACKUPCODE: "2fa_get_backupcode",

  //Email Client Sessions
  GET_EMAIL_CLIENT_SESSIONS: "get_email_client_sessions",
  SWITCH_EMAIL_CLIENT_SESSIONS: "switch_email_client_session",
  DELETE_EMAIL_CLIENT_SESSIONS: "delete_email_client_session",

  //Mail Queue
  MAIL_QUEUE_REMOVE: "mailq_remove",
  MAIL_QUEUE_CLEAR_ALL: "mailq_clear_all",
  MAIL_QUEUE_FLUSH: "mailq_flush",
  MAIL_QUEUE_HOLD: "mailq_hold",
  MAIL_QUEUE_HOLD_ALL: "mailq_hold_all",
  MAIL_QUEUE_REQUEUE: "mailq_requeue",
  MAIL_QUEUE_REQUEUE_ALL: "mailq_requeue_all",
};

export const ACTION_TYPE_OPTIONS = Object.entries(ACTION_TYPES).map(
  ([key, value]) => ({
    label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: value,
  }),
);

export const ACTION_TYPE_GROUPS = [
  {
    label: "Authentication",
    options: [
      { label: "User Login", value: ACTION_TYPES.USER_LOGIN },
      { label: "User Logout", value: ACTION_TYPES.USER_LOGOUT },
      { label: "Get User Profile", value: ACTION_TYPES.GET_USER_PROFILE },
    ],
  },
  {
    label: "User Management",
    options: [
      { label: "Get User List", value: ACTION_TYPES.GET_USER_LIST },
      { label: "Create User", value: ACTION_TYPES.CREATE_USER },
      { label: "Update User", value: ACTION_TYPES.UPDATE_USER },
      { label: "Delete User", value: ACTION_TYPES.DELETE_USER },
      {
        label: "Update User Password",
        value: ACTION_TYPES.UPDATE_USER_PASSWORD,
      },
      {
        label: "Update User Permissions",
        value: ACTION_TYPES.UPDATE_USER_PERMISSIONS,
      },
    ],
  },
  {
    label: "Department Management",
    options: [
      { label: "Get Department List", value: ACTION_TYPES.GET_DEPARTMENT_LIST },
      {
        label: "Get Department Details",
        value: ACTION_TYPES.GET_DEPARTMENT_DETAILS,
      },
      { label: "Create Department", value: ACTION_TYPES.CREATE_DEPARTMENT },
      { label: "Update Department", value: ACTION_TYPES.UPDATE_DEPARTMENT },
      { label: "Delete Department", value: ACTION_TYPES.DELETE_DEPARTMENT },
      {
        label: "Export Department",
        value: ACTION_TYPES.EXPORT_DEPARTMENT_LIST,
      },
    ],
  },
  {
    label: "Domain Management",
    options: [
      { label: "Get Domain List", value: ACTION_TYPES.GET_DOMAIN_LIST },
      { label: "Get Domain Details", value: ACTION_TYPES.GET_DOMAIN_DETAILS },
      { label: "Create Domain", value: ACTION_TYPES.CREATE_DOMAIN },
      { label: "Update Domain", value: ACTION_TYPES.UPDATE_DOMAIN },
      {
        label: "Update Domain Status",
        value: ACTION_TYPES.UPDATE_DOMAIN_STATUS,
      },
      { label: "Update Domain Quota", value: ACTION_TYPES.UPDATE_DOMAIN_QUOTA },
      { label: "Delete Domain", value: ACTION_TYPES.DELETE_DOMAIN },
      { label: "Get DNS Details", value: ACTION_TYPES.GET_DNS_DETAILS },
      { label: "Move Domain", value: ACTION_TYPES.MOVE_DOMAIN },
    ],
  },
  {
    label: "Mailbox Management",
    options: [
      { label: "Get Mailbox List", value: ACTION_TYPES.GET_MAILBOX_LIST },
      { label: "Get Mailbox Details", value: ACTION_TYPES.GET_MAILBOX_DETAILS },
      { label: "Create Mailbox", value: ACTION_TYPES.CREATE_MAILBOX },
      { label: "Update Mailbox", value: ACTION_TYPES.UPDATE_MAILBOX },
      {
        label: "Update Mailbox Status",
        value: ACTION_TYPES.UPDATE_MAILBOX_STATUS,
      },
      {
        label: "Update Mailbox Quota",
        value: ACTION_TYPES.UPDATE_MAILBOX_QUOTA,
      },
      {
        label: "Update Mailbox Password",
        value: ACTION_TYPES.UPDATE_MAILBOX_PASSWORD,
      },
      { label: "Delete Mailbox", value: ACTION_TYPES.DELETE_MAILBOX },
      { label: "Export Mailbox List", value: ACTION_TYPES.EXPORT_MAILBOX_LIST },
    ],
  },
  {
    label: "Organization Management",
    options: [
      {
        label: "Get Organization List",
        value: ACTION_TYPES.GET_ORGANIZATION_LIST,
      },
      {
        label: "Get Organization Details",
        value: ACTION_TYPES.GET_ORGANIZATION_DETAILS,
      },
      { label: "Create Organization", value: ACTION_TYPES.CREATE_ORGANIZATION },
      { label: "Update Organization", value: ACTION_TYPES.UPDATE_ORGANIZATION },
      { label: "Delete Organization", value: ACTION_TYPES.DELETE_ORGANIZATION },
      {
        label: "Update Organization Status",
        value: ACTION_TYPES.UPDATE_ORGANIZATION_STATUS,
      },
      {
        label: "Update Organization Quota",
        value: ACTION_TYPES.UPDATE_ORGANIZATION_QUOTA,
      },
      {
        label: "Rename Organization",
        value: ACTION_TYPES.RENAME_ORGANIZATION,
      },
    ],
  },
  {
    label: "Server Management",
    options: [
      { label: "Get Server List", value: ACTION_TYPES.GET_SERVER_LIST },
      { label: "Get Server Details", value: ACTION_TYPES.GET_SERVER_DETAILS },
      { label: "Create Server", value: ACTION_TYPES.CREATE_SERVER },
      { label: "Update Server", value: ACTION_TYPES.UPDATE_SERVER },
      { label: "Delete Server", value: ACTION_TYPES.DELETE_SERVER },
      {
        label: "Start Mailbox Migration",
        value: ACTION_TYPES.START_MAILBOX_MIGRATION,
      },
    ],
  },
  {
    label: "Caution Management",
    options: [
      { label: "Create Caution", value: ACTION_TYPES.CREATE_CAUTION },
      { label: "Get Caution Details", value: ACTION_TYPES.GET_CAUTION_DETAILS },
      { label: "Update Caution", value: ACTION_TYPES.UPDATE_CAUTION },
      { label: "Delete Caution", value: ACTION_TYPES.DELETE_CAUTION },
      { label: "Get Cautions List", value: ACTION_TYPES.GET_CAUTIONS_LIST },
      {
        label: "Export Cautions List",
        value: ACTION_TYPES.EXPORT_CAUTIONS_LIST,
      },
    ],
  },
  {
    label: "CRM Purchase Orders",
    options: [
      { label: "Get CRM PO List", value: ACTION_TYPES.GET_CRM_PO_LIST },
      { label: "Create CRM PO", value: ACTION_TYPES.CREATE_CRM_PO },
      { label: "Get CRM PO Details", value: ACTION_TYPES.GET_CRM_PO_DETAILS },
      { label: "Update CRM PO", value: ACTION_TYPES.UPDATE_CRM_PO },
      { label: "Delete CRM PO", value: ACTION_TYPES.DELETE_CRM_PO },
      { label: "Create CRM PO Link", value: ACTION_TYPES.CREATE_CRM_PO_LINK },
      { label: "Delete CRM PO Link", value: ACTION_TYPES.DELETE_CRM_PO_LINK },
      { label: "Update CRM PO Link", value: ACTION_TYPES.UPDATE_CRM_PO_LINK },
      { label: "Export CRM PO Link", value: ACTION_TYPES.EXPORT_CRM_PO_LINK },
    ],
  },
  {
    label: "CRM Services",
    options: [
      {
        label: "Get CRM Service List",
        value: ACTION_TYPES.GET_CRM_SERVICE_LIST,
      },
      { label: "Create CRM Service", value: ACTION_TYPES.CREATE_CRM_SERVICE },
      {
        label: "Get CRM Service Details",
        value: ACTION_TYPES.GET_CRM_SERVICE_DETAILS,
      },
      { label: "Update CRM Service", value: ACTION_TYPES.UPDATE_CRM_SERVICE },
      { label: "Delete CRM Service", value: ACTION_TYPES.DELETE_CRM_SERVICE },
    ],
  },
  {
    label: "General Policies",
    options: [
      {
        label: "Get General Policy List",
        value: ACTION_TYPES.GET_GENERAL_POLICY_LIST,
      },
      {
        label: "Get General Policy Details",
        value: ACTION_TYPES.GET_GENERAL_POLICY_DETAILS,
      },
      {
        label: "Create General Policy",
        value: ACTION_TYPES.CREATE_GENERAL_POLICY,
      },
      {
        label: "Update General Policy",
        value: ACTION_TYPES.UPDATE_GENERAL_POLICY,
      },
      {
        label: "Delete General Policy",
        value: ACTION_TYPES.DELETE_GENERAL_POLICY,
      },
      {
        label: "Export General Policy",
        value: ACTION_TYPES.DELETE_GENERAL_POLICY,
      },
    ],
  },
  {
    label: "Filters Policies",
    options: [
      {
        label: "Get Filters Policy List",
        value: ACTION_TYPES.GET_FILTERS_POLICY_LIST,
      },
      {
        label: "Get Filters Policy Details",
        value: ACTION_TYPES.GET_FILTERS_POLICY_DETAILS,
      },
      {
        label: "Create Filters Policy",
        value: ACTION_TYPES.CREATE_FILTERS_POLICY,
      },
      {
        label: "Update Filters Policy",
        value: ACTION_TYPES.UPDATE_FILTERS_POLICY,
      },
      {
        label: "Delete Filters Policy",
        value: ACTION_TYPES.DELETE_FILTERS_POLICY,
      },
      {
        label: "EXport Filters Policy",
        value: ACTION_TYPES.EXPORT_FILTERS_POLICY_LIST,
      },
    ],
  },
  {
    label: "Attachment Policy",
    options: [
      {
        label: "Get Attachment Policy List",
        value: ACTION_TYPES.GET_ATTACHMENT_POLICY_LIST,
      },
      {
        label: "Create Attachment Policy",
        value: ACTION_TYPES.CREATE_ATTACHMENT_POLICY,
      },
      {
        label: "Get Attachment Policy Details",
        value: ACTION_TYPES.GET_ATTACHMENT_POLICY_DETAILS,
      },
      {
        label: "Update Attachment Policy",
        value: ACTION_TYPES.UPDATE_ATTACHMENT_POLICY,
      },
      {
        label: "Delete Attachment Policy",
        value: ACTION_TYPES.DELETE_ATTACHMENT_POLICY,
      },
      {
        label: "Export Attachment Policy",
        value: ACTION_TYPES.EXPORT_ATTACHMENT_POLICY_LIST,
      },
    ],
  },
  {
    label: "Permissions",
    options: [
      {
        label: "Update Permissions Template",
        value: ACTION_TYPES.UPDATE_PERMISSIONS_TEMPLATE,
      },
    ],
  },
  {
    label: "Logs",
    options: [{ label: "Logs (Dynamic)", value: ACTION_TYPES.LOGS_DYNAMIC }],
  },
  {
    label: "Two-Factor Authentication (2FA)",
    options: [
      { label: "Generate QR Code", value: ACTION_TYPES.TFA_GENERATE_QRCODE },
      { label: "Enable 2FA", value: ACTION_TYPES.TFA_ENABLE },
      { label: "Disable 2FA", value: ACTION_TYPES.TFA_DISABLE },
      {
        label: "Generate Backup Code",
        value: ACTION_TYPES.TFA_GENERATE_BACKUPCODE,
      },
      {
        label: "Backup Code Validation",
        value: ACTION_TYPES.TFA_BACKUPCODE_VALIDATION,
      },
      {
        label: "Get 2FA TOTP List",
        value: ACTION_TYPES.TFA_GET_TOTP_LIST,
      },
      { label: "TOTP Validation", value: ACTION_TYPES.TFA_TOTP_VALIDATION },
      { label: "Edit 2FA", value: ACTION_TYPES.TFA_EDIT },
      { label: "Delete 2FA", value: ACTION_TYPES.TFA_DELETE },
      {
        label: "Generate Email OTP",
        value: ACTION_TYPES.TFA_GENERATE_EMAIL_OTP,
      },
      {
        label: "Validate Email OTP",
        value: ACTION_TYPES.TFA_VALIDATE_EMAIL_OTP,
      },
      {
        label: "Enable Email Auth",
        value: ACTION_TYPES.TFA_ENABLE_EMAIL_AUTH,
      },
      {
        label: "Disable Email Auth",
        value: ACTION_TYPES.TFA_DISABLE_EMAIL_AUTH,
      },
      { label: "Send Email OTP", value: ACTION_TYPES.TFA_SEND_EMAIL_OTP },
      {
        label: "Generate Phone OTP",
        value: ACTION_TYPES.TFA_GENERATE_PHONE_OTP,
      },
      {
        label: "Validate Phone OTP",
        value: ACTION_TYPES.TFA_VALIDATE_PHONE_OTP,
      },
      {
        label: "Enable Phone Auth",
        value: ACTION_TYPES.TFA_ENABLE_PHONE_AUTH,
      },
      {
        label: "Disable Phone Auth",
        value: ACTION_TYPES.TFA_DISABLE_PHONE_AUTH,
      },
      { label: "Send Phone OTP", value: ACTION_TYPES.TFA_SEND_PHONE_OTP },
      { label: "Get Backup Code", value: ACTION_TYPES.TFA_GET_BACKUPCODE },
    ],
  },
  {
    label: "Mailbox Sessions",
    options: [
      {
        label: "Get Mailbox Sessions",
        value: ACTION_TYPES.GET_EMAIL_CLIENT_SESSIONS,
      },
      {
        label: "Switch Mailbox Sessions",
        value: ACTION_TYPES.SWITCH_EMAIL_CLIENT_SESSIONS,
      },
      {
        label: "Delete Mailbox Sessions",
        value: ACTION_TYPES.DELETE_EMAIL_CLIENT_SESSIONS,
      },
    ],
  },
  {
    label: "Mail Queue",
    options: [
      { label: "Mail Queue Remove", value: ACTION_TYPES.MAIL_QUEUE_REMOVE },
      {
        label: "Mail Queue Clear All",
        value: ACTION_TYPES.MAIL_QUEUE_CLEAR_ALL,
      },
      { label: "Mail Queue Flush", value: ACTION_TYPES.MAIL_QUEUE_FLUSH },
      { label: "Mail Queue Hold", value: ACTION_TYPES.MAIL_QUEUE_HOLD },
      { label: "Mail Queue Hold All", value: ACTION_TYPES.MAIL_QUEUE_HOLD_ALL },
      { label: "Mail Queue Requeue", value: ACTION_TYPES.MAIL_QUEUE_REQUEUE },
      {
        label: "Mail Queue Requeue All",
        value: ACTION_TYPES.MAIL_QUEUE_REQUEUE_ALL,
      },
    ],
  },
];
