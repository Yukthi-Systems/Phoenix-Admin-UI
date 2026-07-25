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
  Mail,
  Clock,
  Activity,
  Globe,
  FileText,
  Copy,
  Eye,
  EyeOff,
  Info,
  User,
  Shield,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import ViewModelBox from "@/components/common/ViewModelBox";
import { Button } from "@/components/common/Buttons";
import { useToastify } from "@/hooks/useToastify";
import { useUserTimezone } from "@/hooks/useTimezone";

const EmailFlowLogDetailsModal = ({ isOpen, emailLog, onClose }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [showMetaData, setShowMetaData] = useState(false);
  const toast = useToastify();
  const { formatUserDateNice } = useUserTimezone();
  if (!emailLog) return null;

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

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (["passed", "validated", "sent"].includes(statusLower)) {
      return <CheckCircle className="w-5 h-5 text-success" />;
    }
    if (["failed", "rejected", "blocked"].includes(statusLower)) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    if (["continue", "pending", "processing"].includes(statusLower)) {
      return <AlertCircle className="w-5 h-5 text-warning" />;
    }
    return <Activity className="w-5 h-5 text-muted-foreground" />;
  };

  const getTypeIcon = (type) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === "relay")
      return <Server className="w-5 h-5 text-blue-600" />;
    if (typeLower === "cloud")
      return <Layers className="w-5 h-5 text-purple-600" />;
    return <Activity className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (["passed", "validated", "sent"].includes(statusLower)) {
      return "text-success";
    }
    if (["failed", "rejected", "blocked"].includes(statusLower)) {
      return "text-destructive";
    }
    if (["continue", "pending", "processing"].includes(statusLower)) {
      return "text-warning";
    }
    return "text-muted-foreground";
  };

  const getTypeColor = (type) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === "relay") return "text-blue-600";
    if (typeLower === "cloud") return "text-purple-600";
    return "text-muted-foreground";
  };

  // Basic information fields
  const basicFields = [
    { key: "euid", label: "Email UID", value: emailLog.euid },
    { key: "from_email_id", label: "From", value: emailLog.from_email_id },
    {
      key: "to_email_ids",
      label: "To",
      value: Array.isArray(emailLog.to_email_ids)
        ? emailLog.to_email_ids.join(", ")
        : emailLog.to_email_ids,
    },
    {
      key: "email_domains",
      label: "Domains",
      value: Array.isArray(emailLog.email_domains)
        ? emailLog.email_domains.join(", ")
        : emailLog.email_domains,
    },
    { key: "type", label: "Type", value: emailLog.type },
    { key: "status", label: "Status", value: emailLog.status },
    {
      key: "email_timestamp",
      label: "Email Time",
      value: emailLog.email_timestamp
        ? formatUserDateNice(emailLog.email_timestamp)
        : "N/A",
    },
    {
      key: "log_timestamp",
      label: "Log Time",
      value: emailLog.log_timestamp
        ? formatUserDateNice(emailLog.log_timestamp)
        : "N/A",
    },
    {
      key: "insert_timestamp",
      label: "Insert Time",
      value: emailLog.insert_timestamp
        ? formatUserDateNice(emailLog.insert_timestamp)
        : "N/A",
    },
  ];

  // Metadata information
  const metaData = emailLog.meta_data || {};
  const debugInfo = metaData.debug_info || {};
  const receivedHeaders = metaData.received_headers || [];
  const spamScore = metaData.spam_score;

  return (
    <ViewModelBox
      isOpen={isOpen}
      label="Email Flow Log Details"
      handleCancel={onClose}
    >
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 bg-card border rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground text-left">
                {emailLog.subject || "No Subject"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{getTimeAgo(emailLog.email_timestamp)}</span>
                <span>•</span>
                <span>
                  {formatUserDateNice(
                    emailLog.email_timestamp || emailLog.log_timestamp,
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(emailLog.status)}
              <span
                className={`font-medium ${getStatusColor(emailLog.status)}`}
              >
                {emailLog.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getTypeIcon(emailLog.type)}
              <span className={`font-medium ${getTypeColor(emailLog.type)}`}>
                {emailLog.type}
              </span>
            </div>
          </div>
        </div>

        {/* Status Description */}
        {emailLog.status_description && (
          <div className="mb-6 p-5 bg-card border rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Status Description
                </h4>
                <p className="text-sm text-foreground leading-relaxed break-words">
                  {emailLog.status_description}
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
              <Mail className="w-4 h-4" />
              Email Information
            </h4>

            <div className="space-y-4">
              {basicFields
                .filter((field) => field.value && field.value !== "N/A")
                .map((field) => (
                  <div
                    key={field.key}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="text-sm text-muted-foreground font-medium flex-shrink-0">
                      {field.label}
                    </span>
                    <span
                      className={`text-sm font-semibold text-foreground break-words text-right ${
                        field.key === "euid"
                          ? "font-mono bg-muted px-2 py-1 rounded text-xs"
                          : field.key.includes("email")
                            ? "break-all"
                            : ""
                      }`}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
            </div>

            {/* Spam Score */}
            {spamScore && (
              <div className="mt-6 pt-4 border-t border-border">
                <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Spam Analysis
                </h5>
                <div className="bg-muted/50 p-3 rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Spam Score
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        parseFloat(spamScore) > 5
                          ? "text-destructive"
                          : parseFloat(spamScore) > 2
                            ? "text-warning"
                            : "text-success"
                      }`}
                    >
                      {spamScore}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Debug Information */}
          <div className="bg-card border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
              <Info className="w-4 h-4" />
              Debug Information
            </h4>

            {debugInfo.message ? (
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded border">
                  <span className="text-sm text-muted-foreground font-medium">
                    Message
                  </span>
                  <p className="text-sm text-foreground mt-1 break-words">
                    {debugInfo.message}
                  </p>
                </div>

                {debugInfo.spf_result && (
                  <div className="bg-muted/50 p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">
                        SPF Result
                      </span>
                      <span
                        className={`text-sm font-bold uppercase ${
                          debugInfo.spf_result === "pass"
                            ? "text-success"
                            : debugInfo.spf_result === "fail"
                              ? "text-destructive"
                              : "text-warning"
                        }`}
                      >
                        {debugInfo.spf_result}
                      </span>
                    </div>
                  </div>
                )}

                {/* Additional debug info fields */}
                {Object.entries(debugInfo)
                  .filter(
                    ([key, value]) =>
                      key !== "message" && key !== "spf_result" && value,
                  )
                  .map(([key, value]) => (
                    <div key={key} className="bg-muted/50 p-3 rounded border">
                      <span className="text-sm text-muted-foreground font-medium block mb-1">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-foreground break-words">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No debug information available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Received Headers - Email Route */}
        {receivedHeaders.length > 0 && (
          <div className="bg-card border rounded-lg mb-6">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Server className="w-4 h-4" />
                Email Route ({receivedHeaders.length} hops)
              </h4>
            </div>
            <div className="p-5">
              <div className="space-y-4 relative">
                {/* Route line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border"></div>

                {receivedHeaders.map((header, index) => (
                  <div key={index} className="flex items-start gap-4 relative">
                    {/* Route point */}
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Route info */}
                    <div className="flex-1 bg-muted/30 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground font-medium">
                              From:{" "}
                            </span>
                            <span className="text-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                              {header.received_header_from || "Unknown"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-medium">
                              By:{" "}
                            </span>
                            <span className="text-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                              {header.received_header_by || "Unknown"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground font-medium">
                              Time:{" "}
                            </span>
                            <span className="text-foreground text-xs">
                              {header.received_header_timestamp
                                ? formatUserDateNice(
                                    header.received_header_timestamp,
                                  )
                                : "N/A"}
                            </span>
                          </div>
                          {header.received_header_for &&
                            header.received_header_for !== "null" && (
                              <div>
                                <span className="text-muted-foreground font-medium">
                                  For:{" "}
                                </span>
                                <span className="text-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                                  {header.received_header_for}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Arrow for next hop */}
                    {index < receivedHeaders.length - 1 && (
                      <div className="absolute left-6 top-12 z-20">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className="bg-card border rounded-lg mb-6">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              Complete Metadata
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center"
              onClick={() => setShowMetaData(!showMetaData)}
              icon={showMetaData ? EyeOff : Eye}
            >
              {showMetaData ? "Hide Metadata" : "Show Metadata"}
            </Button>
          </div>

          {showMetaData && Object.keys(metaData).length > 0 && (
            <div className="p-5">
              <div className="relative bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    Metadata JSON
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(metaData, null, 2),
                        "Metadata",
                      )
                    }
                    className="h-6 px-2"
                    icon={Copy}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-left text-xs p-4 font-mono text-foreground overflow-auto max-h-80 leading-relaxed">
                  {JSON.stringify(metaData, null, 2)}
                </pre>
              </div>
            </div>
          )}
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
                    Complete JSON
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(emailLog, null, 2),
                        "Raw JSON data",
                      )
                    }
                    className="h-6 px-2"
                    icon={Copy}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-left text-xs p-4 font-mono text-foreground overflow-auto max-h-80 leading-relaxed">
                  {JSON.stringify(emailLog, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewModelBox>
  );
};

export default EmailFlowLogDetailsModal;
