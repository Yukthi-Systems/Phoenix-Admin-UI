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

import { useState } from "react";
import {
  User,
  Clock,
  Activity,
  Globe,
  FileText,
  Copy,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import ViewModelBox from "@/components/common/ViewModelBox";
import { Button } from "@/components/common/Buttons";
import { useToastify } from "@/hooks/useToastify";
import { useUserTimezone } from "@/hooks/useTimezone";
import GetOrganizationName from "@/components/common/GetOrganizationName";

const AuditLogDetailsModal = ({ isOpen, auditLog, onClose }) => {
  const [showRawData, setShowRawData] = useState(false);
  const toast = useToastify();
  const { formatUserDateNice } = useUserTimezone();

  if (!auditLog) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast("success", `${label} copied to clipboard`);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  // Extract details for easier access
  const details = auditLog.details || {};

  // Basic information fields
  // Note: raw user_id is intentionally omitted — "User Name"/"Created By"
  // below already show the resolved name, and the ID added nothing but noise.
  const basicFields = [
    {
      key: "action_type",
      label: "Action Type",
      value: auditLog.action_type || "Unknown Action",
    },
    { key: "user_email", label: "Email", value: auditLog.user_email },
    {
      key: "user_name",
      label: "User Name",
      value: details.user_name || auditLog.user_name,
    },
    {
      key: "action_timestamp",
      label: "Timestamp",
      value: auditLog.action_timestamp
        ? formatUserDateNice(auditLog.action_timestamp)
        : "N/A",
    },
    { key: "ip_address", label: "IP Address", value: auditLog.ip_address },
    ...(auditLog.organization_id
      ? [
          {
            key: "organization_id",
            label: "Organization",
            value: <GetOrganizationName id={auditLog.organization_id} />,
          },
        ]
      : []),
    { key: "created_by", label: "Created By", value: details.created_by },
  ];

  // Get additional fields (excluding basic fields, details object, and empty values)
  const excludedKeys = [
    "action_type",
    "user_id",
    "user_email",
    "user_name",
    "action_timestamp",
    "ip_address",
    "organization_id",
    "message",
    "details",
  ];
  const additionalFields = [
    // Add specific fields from details object
    ...(details.action_method
      ? [
          {
            key: "action_method",
            label: "Action Method",
            value: details.action_method,
          },
        ]
      : []),
    ...(details.action_status_code
      ? [
          {
            key: "action_status_code",
            label: "Status Code",
            value: details.action_status_code,
          },
        ]
      : []),
    ...(details.action_respone_message
      ? [
          {
            key: "action_response_message",
            label: "Response Message",
            value: details.action_respone_message,
          },
        ]
      : []),
    ...(details.action_track_id && details.action_track_id !== "No trackback id"
      ? [
          {
            key: "action_track_id",
            label: "Track ID",
            value: details.action_track_id,
          },
        ]
      : []),
    ...(details.action_type && details.action_type !== auditLog.action_type
      ? [
          {
            key: "action_result",
            label: "Action Result",
            value: details.action_type,
          },
        ]
      : []),
    // Add other root level fields
    ...Object.entries(auditLog)
      .filter(
        ([key, value]) =>
          !excludedKeys.includes(key) &&
          value !== null &&
          value !== undefined &&
          value !== "",
      )
      .map(([key, value]) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value:
          typeof value === "object" ? JSON.stringify(value) : String(value),
      })),
  ];

  return (
    <ViewModelBox
      isOpen={isOpen}
      label="Audit Log Details"
      handleCancel={onClose}
    >
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 bg-card border rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground text-left">
                {auditLog.action_type || "Unknown Action"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{getTimeAgo(auditLog.action_timestamp)}</span>
                <span>•</span>
                <span>{formatUserDateNice(auditLog.action_timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Section */}
        {auditLog.message && (
          <div className="mb-6 p-5 bg-card border rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {/* <h4 className="text-sm font-semibold text-foreground mb-3">Description</h4> */}
                <p className="text-sm text-foreground leading-relaxed break-words">
                  {auditLog.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="bg-card border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Information
            </h4>

            <div className="space-y-4">
              {basicFields
                .filter((field) => field.value && field.value !== "N/A")
                .map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground font-medium">
                      {field.label}
                    </span>
                    <span
                      className={`text-sm font-semibold text-foreground break-words ${
                        field.key === "user_email" ? "break-all" : ""
                      }`}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
            </div>

            {/* User Agent in Basic Information if it exists */}
            {auditLog.user_agent && (
              <div className="mt-6 pt-4 border-t border-border">
                <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Browser Information
                </h5>
                <div className="bg-muted/50 p-3 rounded border text-xs font-mono text-foreground break-all leading-relaxed">
                  {auditLog.user_agent}
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-card border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
              <Info className="w-4 h-4" />
              Additional Information
            </h4>

            {additionalFields.length > 0 ? (
              <div className="space-y-4">
                {additionalFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="text-sm text-muted-foreground font-medium flex-shrink-0">
                      {field.label}
                    </span>
                    <span
                      className="text-sm font-semibold text-foreground text-right break-words"
                      title={field.value}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No additional information available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Raw Data Section */}
        <div className="bg-card border rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              Raw JSON Data
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center"
              onClick={() => setShowRawData(!showRawData)}
              icon={showRawData ? EyeOff : Eye}
            >
              {showRawData ? "Hide Data" : "Show Data"}
            </Button>
          </div>

          {showRawData && (
            <div className="p-5">
              <div className="relative bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    JSON Format
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(auditLog, null, 2),
                        "Raw JSON data",
                      )
                    }
                    className="h-6 px-2"
                    icon={Copy}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="text-xs p-4 font-mono text-foreground overflow-auto max-h-80 leading-relaxed text-left">
                  {JSON.stringify(auditLog, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewModelBox>
  );
};

export default AuditLogDetailsModal;
