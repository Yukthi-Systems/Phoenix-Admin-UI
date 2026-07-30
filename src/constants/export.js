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

export const FIELD_MAPPINGS = {
  cautions: [
    {
      key: "caution_id",
      header: "Caution ID",
      type: "string",
      width: 15,
    },
    {
      key: "caution_name",
      header: "Caution Name",
      type: "string",
      width: 25,
    }, 
    {
      key:"html_content",
      header:"HTML Content",
      type:"string",
      width:40,
    },
    {
      key:"text_content",
      header:"Text Content",
      type:"string",
      width:40,
    },
    {
      key:"info.description",
      header:"Description",
      type:"string",
      width:30,
    },
    {
      key:"info.severity",
      header:"Severity",
      type:"string",
      width:15,
    },
    {
      key:"info.notes",
      header:"Notes",
      type:"string",
      width:30,
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],

  disclaimers: [
    {
      key: "disclaimer_id",
      header: "Disclaimer ID",
      type: "string",
      width: 15,
    },
    {
      key: "disclaimer_name",
      header: "Disclaimer Name",
      type: "string",
      width: 25,
    },
    {
      key:"html_content",
      header:"HTML Content",
      type:"string",
      width:40,
    },
    {
      key:"text_content",
      header:"Text Content",
      type:"string",
      width:40,
    },
    {
      key:"info.description",
      header:"Description",
      type:"string",
      width:30,
    },
    {
      key: "is_active",
      header: "Status",
      type: "boolean",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
  ],

  departments: [
    {
      key: "department_id",
      header: "Department ID",
      type: "string",
      width: 15,
    },
    {
      key: "department_name",
      header: "Department Name",
      type: "string",
      width: 25,
    },
    {
      key:"department_details.description",
      header:"Description",
      type:"string",
      width:40,
    },
    {
      key:"department_details.address",
      header:"Address",
      type:"string",
      width:30,
    },
    {
      key:"department_details.notes",
      header:"Notes",
      type:"string",
      width:30,
    },
    {
      key:"department_details.authorized_persons",
      header:"Authorized Persons",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],

  // Headers here are kept in sync 1:1 with the domain bulk-import template
  // (IMPORT_FIELD_MAPPINGS.domains in src/constants/import.js) so an exported
  // domains file can be re-imported without editing — e.g. for migrating
  // domains between environments. The values are sourced from a normalized
  // domain_details object (see fetchDomainsForExport in domain/list/index.jsx
  // and normalizeDomainDetailsForForm in src/utils/domainUtils.js), not the
  // lean domain-list row, since most of these fields aren't in the list response.
  domains: [
    {
      key: "domain_name",
      header: "Domain Name",
      type: "string",
      width: 30,
    },
    {
      key: "is_active",
      header: "Status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "session_timeout",
      header: "Session Timeout (Minutes)",
      type: "number",
      width: 20,
    },
    {
      key: "anti_phishing_secret_code",
      header: "Anti-Phishing Secret Code",
      type: "string",
      width: 25,
    },
    {
      key: "caution_id",
      header: "Caution ID",
      type: "string",
      width: 20,
    },
    {
      key: "disclaimer_id",
      header: "Disclaimer ID",
      type: "string",
      width: 20,
    },
    {
      key: "details.address",
      header: "Address",
      type: "string",
      width: 30,
    },
    {
      key: "details.description",
      header: "Details Description",
      type: "string",
      width: 30,
    },
    {
      key: "enable_max_password_age",
      header: "Enable Password Age Policy",
      type: "boolean",
      width: 15,
    },
    {
      key: "max_password_age",
      header: "Max Password Age (Days)",
      type: "number",
      width: 15,
    },
    {
      key: "notify_1",
      header: "Notification 1 (Days Before)",
      type: "number",
      width: 20,
    },
    {
      key: "notify_2",
      header: "Notification 2 (Days Before)",
      type: "number",
      width: 20,
    },
    {
      key: "notify_3",
      header: "Notification 3 (Days Before)",
      type: "number",
      width: 20,
    },
    {
      key: "enable_catch_all",
      header: "Enable Catch All",
      type: "boolean",
      width: 15,
    },
    {
      key: "catch_all_forwarding_address",
      header: "Catch All Email",
      type: "string",
      width: 30,
    },
    {
      key: "enable_hybrid_mode",
      header: "Enable Hybrid Mode",
      type: "boolean",
      width: 15,
    },
    {
      key: "hybrid_connector_properties.description",
      header: "Hybrid Description",
      type: "string",
      width: 35,
    },
    {
      key: "hybrid_connector_properties.fqdn",
      header: "Hybrid FQDN",
      type: "string",
      width: 30,
    },
    {
      key: "hybrid_connector_properties.ipv4",
      header: "Hybrid IPv4",
      type: "string",
      width: 20,
    },
    {
      key: "hybrid_connector_properties.ipv6",
      header: "Hybrid IPv6",
      type: "string",
      width: 25,
    },
    {
      key: "hybrid_connector_properties.port",
      header: "Hybrid Port",
      type: "number",
      width: 12,
    },
    {
      key: "spam_destination",
      header: "Spam Destination",
      type: "string",
      width: 15,
    },
    {
      key: "spam_destination_properties.description",
      header: "Spam Policy Description",
      type: "string",
      width: 30,
    },
    {
      key: "spam_destination_properties.folder_name",
      header: "Spam Folder Name",
      type: "string",
      width: 25,
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
  ],

  mailboxes: [
    {
      key: "email",
      header: "Email Address",
      type: "string",
      width: 35,
    },
    {
      key: "is_active",
      header: "Status",
      type: "string",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "quota_allocated",
      header: "Quota Allocated (GB)",
      type: "number",
      width: 18,
    },
    {
      key: "quota_utilized_bytes",
      header: "Quota Used (GB)",
      type: "number",
      width: 16,
      transform: (bytes) => (bytes ? (bytes / 1024 ** 3).toFixed(3) : "0.000"),
    },
    {
      key: "total_messages_count",
      header: "Total Messages",
      type: "number",
      width: 15,
    },
    {
      key: "is_group",
      header: "Is Group",
      type: "string",
      width: 12,
      transform: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "department_id",
      header: "Department ID",
      type: "string",
      width: 25,
    },
    {
      key: "ip_restriction",
      header: "IP Restrictions",
      type: "string",
      width: 25,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "geo_restriction",
      header: "Geo Restrictions",
      type: "string",
      width: 20,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "mailbox_info.phone",
      header: "Phone",
      type: "string",
      width: 15,
    },
    {
      key: "mailbox_info.address",
      header: "Address",
      type: "string",
      width: 30,
    },
    {
      key: "mailbox_info.description",
      header: "Description",
      type: "string",
      width: 35,
    },
    {
      key: "mailbox_info.secondary_email",
      header: "Secondary Email",
      type: "string",
      width: 30,
    },
    {
      key: "group_members.internal",
      header: "Internal Group Members",
      type: "string",
      width: 40,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "group_members.external",
      header: "External Group Members",
      type: "string",
      width: 40,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],

  servers: [
    {
      key: "server_id",
      header: "Server ID",
      type: "string",
      width: 15,
    },
    {
      key: "host_name",
      header: "Host Name",
      type: "string",
      width: 30,
    },
    {
      key: "quota_allocated",
      header: "Quota Allocated",
      type: "number",
      width: 15,
    },
    {
      key: "quota_utilized",
      header: "Quota Utilized",
      type: "number",
      width: 15,
    },
    {
      key: "is_active",
      header: "Status",
      type: "boolean",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
  ],

  users: [
    {
      key: "user_id",
      header: "User ID",
      type: "string",
      width: 15,
    },
    {
      key: "user_name",
      header: "User Name",
      type: "string",
      width: 20,
    },
    {
      key: "display_name",
      header: "Display Name",
      type: "string",
      width: 25,
    },
    {
      key: "user_email",
      header: "Email",
      type: "string",
      width: 30,
    },
    {
      key: "is_active",
      header: "Status",
      type: "boolean",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "is_totp_2fa_active",
      header: "2FA Status",
      type: "boolean",
      width: 12,
      transform: (value) => (value ? "Enabled" : "Disabled"),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
  ],

  purchaseOrder: [
    {
      key: "po_id",
      header: "PO ID",
      type: "string",
      width: 15,
    },
    {
      key: "po_name",
      header: "PO Name",
      type: "string",
      width: 20,
    },
    {
      key: "total_amount",
      header: "Total Amount",
      type: "number",
      width: 25,
    },
    {
      key: "po_status",
      header: "Status",
      type: "string",
      width: 12,
    },
    {
      key: "po_date",
      header: "PO Date",
      type: "date",
      width: 20,
    },
  ],

  generalPolicies: [
    {
      key: "policy_id",
      header: "Policy ID",
      type: "string",
      width: 15,
    },
    {
      key: "policy_name",
      header: "Policy Name",
      type: "string",
      width: 20,
    },
    {
      key:"policy_description",
      header:"Policy Description",
      type:"string",
      width:40,
    },
    {
      key:"domain_name",
      header:"Domain",
      type:"string",
      width:25,
    },
    {
      key: "is_active",
      header: "Status",
      type: "status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key:"block_all_incoming_emails",
      header:"Block All Incoming Emails",
      type:"boolean",
      width:20,
      transform: (value) => (value ? "Yes" : "No"),
    },
    {
      key:"block_all_outgoing_emails",
      header:"Block All Outgoing Emails",
      type:"boolean",
      width:20,
      transform: (value) => (value ? "Yes" : "No"),
    },
    {
      key:"incoming_exception_domains",
      header:"Incoming Exception Domains",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "incoming_exception_emails",
      header: "Incoming Exception Emails",
      type: "string",
      width: 30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"outgoing_exception_domains",
      header:"Outgoing Exception Domains",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "outgoing_exception_emails",
      header: "Outgoing Exception Emails",
      type: "string",
      width: 30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"outgoing_size_limit_mb",
      header:"Outgoing Size Limit (MB)",
      type:"number",
      width:20,
      // transform: (value) => (value > 0 ? value : "No Limit"),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],


  filtersPolicies: [
    {
      key: "policy_id",
      header: "Policy ID",
      type: "string",
      width: 15,
    },
    {
      key: "policy_name",
      header: "Policy Name",
      type: "string",
      width: 20,
    },
    {
      key: "is_active",
      header: "Status",
      type: "status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "white_entries",
      header: "Allowed Entries",
      type: "array",
      width: 30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "black_entries",
      header: "Blocked Entries",
      type: "array",
      width: 30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],

  distributionPolicies:[
    {
      key: "policy_id",
      header: "Policy ID",
      type: "string",
      width: 15,
    },
    {
      key: "policy_name",
      header: "Policy Name",
      type: "string",
      width: 30,
    },
    {
      key: "policy_description",
      header: "Policy Description",
      type: "string",
      width: 40,
    },
    {
      key: "domain_name",
      header: "Domain",
      type: "string",
      width: 25,
    },
    {
      key:"rule_type",
      header:"Rule Type",
      type:"string",
      width:20,
    },
    {
      key:"internal_members",
      header:"Internal Members",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"external_members",
      header:"External Members",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"specific_emails",
      header:"Specific Emails",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "is_active",
      header: "Status",
      type: "status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    }
  ],

  attachmentPolicies: [
    {
      key: "policy_id",
      header: "Policy ID",
      type: "string",
      width: 15,
    },
    {
      key: "policy_name",
      header: "Policy Name",
      type: "string",
      width: 30,
    },
    {
      key: "policy_description",
      header: "Description",
      type: "string",
      width: 40,
    },
    {
      key: "domain_name",
      header: "Domain",
      type: "string",
      width: 25,
    },
    {
      key: "max_attachment_size_mb",
      header: "Max Size (MB)",
      type: "number",
      width: 15,
      transform: (value) => (value > 0 ? value : "No Limit"),
    },
    {
      key: "is_active",
      header: "Status",
      type: "status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "allowed_file_types",
      header: "Allowed Types",
      type: "string",
      width: 50,
      transform: (value) =>
        Array.isArray(value) && value.length > 0 ? value.join(", ") : "None",
    },
    {
      key: "blocked_file_types",
      header: "Blocked Types",
      type: "string",
      width: 50,
      transform: (value) =>
        Array.isArray(value) && value.length > 0 ? value.join(", ") : "None",
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],
  
  restrictionPolicies:[
    {
      key: "policy_id",
      header: "Policy ID",
      type: "string",
      width: 15,
    },
    {
      key: "policy_name",
      header: "Policy Name",
      type: "string",
      width: 20,
    },
    {
      key:"policy_description",
      header:"Policy Description",
      type:"string",
      width:40,
    },
    {
      key:"domain_name",
      header:"Domain",
      type:"string",
      width:25,
    },
    {
      key: "is_active",
      header: "Status",
      type: "status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key:"geo_restrictions",
      header:"Geo Restrictions (Country Codes)",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"ip_restrictions",
      header:"IP Restrictions",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],

  forwardingPolicies:[
    {
      key: "policy_id",
      header: "Policy ID",
      type: "string",
      width: 15,
    },
    {
      key: "policy_name",
      header: "Policy Name",
      type: "string",
      width: 20,
    },
    {
      key:"policy_description",
      header:"Policy Description",
      type:"string",
      width:40,
    },
    {
      key:"domain_name",
      header:"Domain",
      type:"string",
      width:25,
    },
    {
      key: "is_active",
      header: "Status",
      type: "status",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key:"forward_to_emails",
      header:"Forward To Emails",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"from_emails",
      header:"From Emails",
      type:"string",
      width:30,
      transform: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    {
      key:"subject_contains",
      header:"Subject Contains",
      type:"string",
      width:30,
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
    {
      key: "updated_at",
      header: "Updated Date",
      type: "date",
      width: 20,
    },
  ],
  
  audit_logs: [
    { header: "Date (UTC)", key: "action_timestamp" },
    { header: "Action Type", key: "action_type" },
    { header: "Message", key: "message" },
    { header: "User Email", key: "user_email" },
    { header: "User Name", key: "user_name" },
    { header: "User ID", key: "user_id" },
    { header: "Created By", key: "details.created_by" },
    { header: "IP Address", key: "ip_address" },
    { header: "Method", key: "details.action_method" },
    { header: "Status Code", key: "details.action_status_code" },
    { header: "Track ID", key: "details.action_track_id" },
    { header: "Response Message", key: "details.action_respone_message" },
    { header: "User Agent", key: "user_agent" },
  ],

  imap_sync: [
    { header: "Job ID", key: "job_id" },
    { header: "Source Account", key: "from_email" },
    { header: "Source Server", key: "from_imap_server" },
    { header: "Source Port", key: "from_imap_port" },
    { header: "Destination Account", key: "to_email" },
    { header: "Status", key: "sync_status" },
    { header: "Created Date", key: "created_at" },
    { header: "Last Updated", key: "updated_at" },
  ],

  identities: [
    {
      key: "email",
      header: "Email Address",
      type: "string",
      width: 35,
    },
    {
      key: "first_name",
      header: "First Name",
      type: "string",
      width: 20,
    },
    {
      key: "last_name",
      header: "Last Name",
      type: "string",
      width: 20,
    },
    {
      key: "primary_phone",
      header: "Phone",
      type: "string",
      width: 15,
    },
    {
      key: "secondary_email",
      header: "Secondary Email",
      type: "string",
      width: 30,
    },
    {
      key: "is_enabled",
      header: "Status",
      type: "string",
      width: 12,
      transform: (value) => (value ? "Active" : "Inactive"),
    },
    {
      key: "is_app_2fa_enabled",
      header: "App 2FA",
      type: "string",
      width: 12,
      transform: (value) => (value ? "Enabled" : "Disabled"),
    },
    {
      key: "is_sms_2fa_enabled",
      header: "SMS 2FA",
      type: "string",
      width: 12,
      transform: (value) => (value ? "Enabled" : "Disabled"),
    },
    {
      key: "is_email_2fa_enabled",
      header: "Email 2FA",
      type: "string",
      width: 12,
      transform: (value) => (value ? "Enabled" : "Disabled"),
    },
    {
      key: "is_mailbox_present",
      header: "Mailbox Status",
      type: "string",
      width: 16,
      transform: (value, item) =>
        !value
          ? "Not Provisioned"
          : item.is_mailbox_enabled
            ? "Enabled"
            : "Disabled",
    },
    {
      key: "is_chat_user_present",
      header: "Chat Status",
      type: "string",
      width: 16,
      transform: (value, item) =>
        !value
          ? "Not Provisioned"
          : item.is_chat_user_enabled
            ? "Enabled"
            : "Disabled",
    },
    {
      key: "is_file_user_present",
      header: "Files Status",
      type: "string",
      width: 16,
      transform: (value, item) =>
        !value
          ? "Not Provisioned"
          : item.is_file_user_enabled
            ? "Enabled"
            : "Disabled",
    },
    {
      key: "restriction_policy_id",
      header: "Restriction Policy ID",
      type: "string",
      width: 25,
    },
    {
      key: "created_at",
      header: "Created Date",
      type: "date",
      width: 20,
    },
  ],
};
