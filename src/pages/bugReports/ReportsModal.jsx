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

import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { useUserTimezone } from "@/hooks/useTimezone";
import {
  Download,
  X,
  File,
  Image as ImageIcon,
  FileText,
  Bug,
  User,
  Clock,
  Mail,
  Phone,
  Building2,
  Monitor,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToastify } from "@/hooks/useToastify";
import { useGetBugFile } from "@/hooks/useReportBug";
import { Link } from "react-router-dom";

// Helper to get file icon
const getFileIcon = (fileType) => {
  if (fileType?.startsWith("image/")) return ImageIcon;
  if (fileType?.includes("pdf")) return FileText;
  return File;
};

export default function BugReportDetailsModal({
  isOpen,
  onClose,
  report,
  statusFilter,
}) {
  const { formatUserDateNice } = useUserTimezone();
  const toast = useToastify();
  const [viewer, setViewer] = useState({ open: false, src: null, name: null });
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!isOpen || !report) return null;

  const attachments = Array.isArray(report.additional_info.attachments)
    ? report.additional_info.attachments
    : [];

  const details = report.additional_info.details || {};
  const description = report.description || "";
  const isLongDescription = description.length > 300;

  /** OPEN IMAGE PREVIEW */
  const openPreview = (src, name) => {
    if (!src) {
      toast("error", "Preview not available for this file.");
      return;
    }
    setViewer({ open: true, src, name });
  };

  /** CLOSE FULLSCREEN VIEWER */
  const closePreview = () => setViewer({ open: false, src: null, name: null });

  return (
    <>
      {/* Custom Modal */}
      <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card text-left border border-border rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="from-primary/5 to-primary/10 border-primary/20 border-b bg-gradient-to-r p-5 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-card-foreground">
                    Report #{report.report_id}
                  </h3>
                  <StatusBadge status={statusFilter} />
                </div>

                <h4 className="text-2xl font-bold text-card-foreground mb-3">
                  {report.subject}
                </h4>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <User size={14} />
                    <span className="font-medium text-foreground">
                      {report.additional_info.user_name || "Unknown"}
                    </span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatUserDateNice(report.created_at)}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-md p-2 text-muted-foreground hover:text-destructive transition flex-shrink-0"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN - Attachments & System Info */}
              <div className="space-y-5">
                {/* ATTACHMENTS */}
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FileText size={16} className="text-primary" />
                    Attachments
                    <span className="text-xs font-normal text-muted-foreground">
                      ({attachments.length})
                    </span>
                  </h4>

                  {attachments.length === 0 ? (
                    <div className="bg-background border border-border rounded-lg p-8 text-center">
                      <File
                        size={40}
                        className="mx-auto text-muted-foreground/40 mb-3"
                      />
                      <p className="text-sm text-muted-foreground">
                        No attachments
                      </p>
                    </div>
                  ) : (
                    <div
                      className="
                    grid 
                    grid-cols-[repeat(auto-fill,minmax(130px,1fr))]
                    gap-3
                  "
                    >
                      {attachments.map((att, idx) => {
                        const { data: fileBinary } = useGetBugFile(att.file_id);
                        let previewUrl = null;

                        if (fileBinary && att.file_type?.startsWith("image/")) {
                          const blob = new Blob([fileBinary], {
                            type: att.file_type,
                          });
                          previewUrl = URL.createObjectURL(blob);
                        }

                        const downloadFile = () => {
                          if (!fileBinary) {
                            toast("error", "File not available yet");
                            return;
                          }
                          const blob = new Blob([fileBinary], {
                            type: att.file_type,
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = att.file_name || "file";
                          a.click();
                          URL.revokeObjectURL(url);
                        };

                        const FileIconComponent = getFileIcon(att.file_type);

                        return (
                          <div
                            key={idx}
                            className="flex flex-col border border-border rounded-lg bg-card hover:shadow-md transition-all overflow-hidden group"
                          >
                            {/* File Preview/Icon */}
                            {previewUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openPreview(previewUrl, att.file_name)
                                }
                                className="w-full h-32 overflow-hidden hover:ring-2 hover:ring-primary transition"
                              >
                                <img
                                  src={previewUrl}
                                  alt={att.file_name}
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition"
                                />
                              </button>
                            ) : (
                              <div className="w-full h-32 flex items-center justify-center bg-accent">
                                <FileIconComponent
                                  size={32}
                                  className="text-muted-foreground"
                                />
                              </div>
                            )}

                            {/* File Info & Download */}
                            <div className="p-3 flex items-center gap-2 border-t border-border bg-background/50">
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs font-medium text-card-foreground truncate"
                                  title={att.file_name}
                                >
                                  {att.file_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {att.file_type
                                    ?.split("/")[1]
                                    ?.toUpperCase() || "File"}
                                </p>
                              </div>
                              <button
                                onClick={downloadFile}
                                className="flex-shrink-0 p-1.5 rounded-md hover:bg-accent transition text-muted-foreground hover:text-foreground"
                                title="Download"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SYSTEM INFORMATION */}
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Monitor size={16} className="text-primary" />
                    System Information
                  </h4>
                  <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">Type</p>
                      <p className="font-medium text-foreground capitalize">
                        {details.type || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        Application
                      </p>
                      <p className="font-medium text-foreground">
                        {details.appName || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">Version</p>
                      <p className="font-medium text-foreground font-mono text-sm">
                        {details.version || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        Environment
                      </p>
                      <p className="font-medium text-foreground">
                        {details.environment || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">Platform</p>
                      <p className="font-medium text-foreground">
                        {details.platform || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        API Version
                      </p>
                      <p className="font-medium text-foreground font-mono text-sm">
                        {details.apiVersion || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        Build Date
                      </p>
                      <p className="font-medium text-foreground text-sm">
                        {details.buildDate || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Description & Reporter Info */}
              <div className="space-y-5">
                {/* DESCRIPTION */}
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Bug size={16} className="text-primary" />
                    Description
                  </h4>
                  <div className="bg-background border border-border rounded-lg p-4">
                    {!description ? (
                      <span className="text-muted-foreground italic text-sm">
                        No description provided.
                      </span>
                    ) : (
                      <>
                        <div
                          className={`text-sm text-foreground leading-relaxed whitespace-pre-wrap ${
                            !showFullDescription && isLongDescription
                              ? "line-clamp-6"
                              : ""
                          }`}
                        >
                          {description}
                        </div>
                        {isLongDescription && (
                          <button
                            onClick={() =>
                              setShowFullDescription(!showFullDescription)
                            }
                            className="mt-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition"
                          >
                            {showFullDescription ? (
                              <>
                                Show Less <ChevronUp size={16} />
                              </>
                            ) : (
                              <>
                                Show More <ChevronDown size={16} />
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Reporter Information */}
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <User size={16} className="text-primary" />
                    Reporter Information
                  </h4>
                  <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">Username</p>
                      <p className="font-medium text-foreground">
                        {report.additional_info.user_name || "-"}
                      </p>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <Mail size={12} />
                        Email
                      </p>
                      <p className="font-medium text-foreground text-right break-all text-sm">
                        {report.additional_info.contact_email || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <Phone size={12} />
                        Phone
                      </p>
                      <p className="font-medium text-foreground">
                        {report.additional_info.contact_phone || "-"}
                      </p>
                    </div>

                    <Link
                      to={`/organization/${report.additional_info.user_organization_id}`}
                      className="flex items-center justify-between"
                    >
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <Building2 size={12} />
                        Organization
                      </p>
                      <p className="font-medium text-foreground underline hover:text-blue-500">
                        {report.additional_info.user_organization_id || "-"}
                      </p>
                    </Link>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Clock size={16} className="text-primary" />
                    Timeline
                  </h4>
                  <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        Created At
                      </p>
                      <p className="font-medium text-foreground text-sm">
                        {formatUserDateNice(report.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        Last Updated
                      </p>
                      <p className="font-medium text-foreground text-sm">
                        {formatUserDateNice(report.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {viewer.open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
          onClick={closePreview}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <button
              onClick={closePreview}
              className="absolute -top-12 right-0 p-2.5 z-20 text-white bg-black/50 rounded-full hover:bg-black/70 transition shadow-lg"
              title="Close"
            >
              <X size={24} />
            </button>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 shadow-2xl">
              <img
                src={viewer.src}
                alt={viewer.name}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded"
              />
              {viewer.name && (
                <p className="text-white text-sm text-center mt-4 px-4 font-medium">
                  {viewer.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
