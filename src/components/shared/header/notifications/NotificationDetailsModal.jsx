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
import ProfilePicture from "@/pages/profile/ProfilePic";
import { useUserTimezone } from "@/hooks/useTimezone";

const NotificationDetailsModal = ({ isOpen, notification, onClose }) => {
  const [showRawData, setShowRawData] = useState(false);
  const { formatUserDateNice } = useUserTimezone();
  const toast = useToastify();

  if (!notification) return null;

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

  const details = notification.details || {};
  const nestedDetails = details.details || {};

  const basicFields = [
    {
      key: "action_type",
      label: "Action Type",
      value: details.action_type || "Unknown Action",
    },
    {
      key: "user_id",
      label: "User ID",
      value: notification.user_id || "System User",
    },
    {
      key: "user_name",
      label: "User Name",
      value: nestedDetails.user_name || notification.user_name,
    },
    {
      key: "action_timestamp",
      label: "Timestamp",
      value: details.action_timestamp
        ? formatUserDateNice(details.action_timestamp)
        : "N/A",
    },
    {
      key: "organization_id",
      label: "Organization",
      value: notification.organization_id,
    },
    {
      key: "organization_name",
      label: "Organization Name",
      value: notification.organization_name,
    },
    { key: "created_by", label: "Created By", value: nestedDetails.created_by },
  ];

  const excludedKeys = [
    "action_type",
    "user_id",
    "user_name",
    "action_timestamp",
    "organization_id",
    "organization_name",
    "message",
    "details",
  ];
  const additionalFields = [
    ...(nestedDetails.action_method
      ? [
          {
            key: "action_method",
            label: "Action Method",
            value: nestedDetails.action_method,
          },
        ]
      : []),
    ...(nestedDetails.action_status_code
      ? [
          {
            key: "action_status_code",
            label: "Status Code",
            value: nestedDetails.action_status_code,
          },
        ]
      : []),
    ...(nestedDetails.action_respone_message
      ? [
          {
            key: "action_response_message",
            label: "Response Message",
            value: nestedDetails.action_respone_message,
          },
        ]
      : []),
    ...(nestedDetails.action_track_id &&
    nestedDetails.action_track_id !== "No trackback id"
      ? [
          {
            key: "action_track_id",
            label: "Track ID",
            value: nestedDetails.action_track_id,
          },
        ]
      : []),
    ...(nestedDetails.action_type &&
    nestedDetails.action_type !== details.action_type
      ? [
          {
            key: "action_result",
            label: "Action Result",
            value: nestedDetails.action_type,
          },
        ]
      : []),
    ...Object.entries(notification)
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
      label="Notification Details"
      handleCancel={onClose}
    >
      <div className="mx-auto w-full">
        <div className="bg-card mb-6 flex items-center justify-between rounded-lg border p-5">
          <div className="flex items-center gap-4">
            <ProfilePicture
              userId={notification.user_id}
              displayName={nestedDetails.created_by}
              showStatus={false}
              showUpload={false}
              size="small"
            />
            <div>
              <h3 className="text-foreground text-left text-xl font-bold">
                {details.action_type || "Unknown Action"}
              </h3>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(details.action_timestamp)}</span>
                <span>•</span>
                <span>{formatUserDateNice(details.action_timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        {details.message && (
          <div className="bg-card mb-6 rounded-lg border p-5">
            <div className="flex items-start gap-3">
              <FileText className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  Description
                </h4>
                <p className="text-foreground text-sm leading-relaxed break-words">
                  {details.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-lg border p-5">
            <h4 className="text-foreground border-border mb-4 flex items-center gap-2 border-b pb-2 text-sm font-semibold">
              <User className="h-4 w-4" />
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
                    <span className="text-muted-foreground text-sm font-medium">
                      {field.label}
                    </span>
                    <span
                      className={`text-foreground text-sm font-semibold break-words ${
                        field.key === "user_id" ||
                        field.key === "organization_id"
                          ? "bg-muted rounded px-2 py-1 font-mono"
                          : field.key === "user_email"
                            ? "break-all"
                            : ""
                      }`}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
            </div>

            {notification.user_agent && (
              <div className="border-border mt-6 border-t pt-4">
                <h5 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4" />
                  Browser Information
                </h5>
                <div className="bg-muted/50 text-foreground rounded border p-3 font-mono text-xs leading-relaxed break-all">
                  {notification.user_agent}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border p-5">
            <h4 className="text-foreground border-border mb-4 flex items-center gap-2 border-b pb-2 text-sm font-semibold">
              <Info className="h-4 w-4" />
              Additional Information
            </h4>

            {additionalFields.length > 0 ? (
              <div className="space-y-4">
                {additionalFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="text-muted-foreground flex-shrink-0 text-sm font-medium">
                      {field.label}
                    </span>
                    <span
                      className="text-foreground text-right text-sm font-semibold break-words"
                      title={field.value}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center justify-center py-8">
                <div className="text-center">
                  <Info className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No additional information available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border">
          <div className="border-border flex items-center justify-between border-b p-5">
            <h4 className="text-foreground text-sm font-semibold">
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
              <div className="bg-muted/50 relative rounded-lg border">
                <div className="border-border flex items-center justify-between border-b p-3">
                  <span className="text-muted-foreground text-xs font-medium">
                    JSON Format
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(notification, null, 2),
                        "Raw JSON data",
                      )
                    }
                    className="h-6 px-2"
                    icon={Copy}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="text-foreground max-h-80 overflow-auto p-4 text-left font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(notification, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewModelBox>
  );
};

export default NotificationDetailsModal;
