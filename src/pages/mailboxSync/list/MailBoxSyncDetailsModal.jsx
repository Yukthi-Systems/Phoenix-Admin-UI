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

import React from "react";
import EditModelBox from "@/components/common/EditModelBox";
import { useUserTimezone } from "@/hooks/useTimezone";
import {
  Mail,
  Server,
  ArrowRight,
  Clock,
  Hash,
  Calendar,
  ShieldCheck,
  Folder,
} from "lucide-react";

const MailBoxSyncDetailsModal = ({ isOpen, onClose, job }) => {
  const { formatUserDateNice } = useUserTimezone();

  if (!job) return null;

  // Custom Status Badge Logic
  const renderStatus = (status) => {
    let badgeClass = "bg-gray-500/10 text-gray-600 border-gray-500/20";
    if (status === "PENDING")
      badgeClass = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    else if (status === "IN_PROGRESS")
      badgeClass =
        "bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse";
    else if (status === "SYNCED" || status === "COMPLETED")
      badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    else if (status === "FAILED")
      badgeClass = "bg-destructive/10 text-destructive border-destructive/20";

    return (
      <span
        className={`rounded-2xl border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
      >
        {status ? status.replace(/_/g, " ") : "UNKNOWN"}
      </span>
    );
  };

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Sync Job Details"
      handleCancel={onClose}
      outsideClick={true}
    >
      <div className="w-full max-w-5xl min-w-[920px] text-left">
        {/* Header Section - Flow Visualization */}
        <div className="from-primary/5 to-primary/10 border-primary/20 mt-4 mb-5 rounded-xl border bg-gradient-to-r p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 w-full">
              {/* Source */}
              <div className="flex-1">
                <p className="text-muted-foreground mb-1.5 text-left text-xs tracking-wide uppercase">
                  Source Account
                </p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary flex-shrink-0" />
                  <p
                    className="text-foreground text-lg font-semibold truncate"
                    title={job?.from_email || ""}
                  >
                    {job?.from_email || "Unknown Source"}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center px-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ArrowRight size={20} className="text-primary" />
                </div>
              </div>

              {/* Destination */}
              <div className="flex-1 text-right">
                <p className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase">
                  Destination Account
                </p>
                <div className="flex items-center justify-end gap-2">
                  <p
                    className="text-foreground text-lg font-semibold truncate"
                    title={job?.to_email || ""}
                  >
                    {job?.to_email || "Unknown Destination"}
                  </p>
                  <Mail size={16} className="text-primary flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Grid Layout */}
        <div className="mb-5 grid grid-cols-2 gap-6 items-start">
          {/* Left Column - Configuration */}
          <div className="space-y-3">
            <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Server size={16} className="text-primary" />
              Source Configuration
            </h4>

            {/* Boxed Content for Symmetrical Look */}
            <div className="bg-card border-border rounded-lg border p-4 space-y-4 h-full">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">IMAP Server</p>
                <p className="text-foreground text-sm font-semibold">
                  {job?.from_imap_server || "-"}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <p className="text-muted-foreground text-xs">Port</p>
                <p className="text-foreground font-mono text-sm font-semibold">
                  {job?.from_imap_port || "993"}
                </p>
              </div>

              {/* Show Folder if available */}
              {job?.sync_specific_folder && (
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2">
                    <Folder size={12} className="text-muted-foreground" />
                    <p className="text-muted-foreground text-xs">
                      Specific Folder
                    </p>
                  </div>
                  <p className="text-foreground text-sm font-semibold">
                    {job.sync_specific_folder}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Job Meta */}
          <div className="space-y-3">
            <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Hash size={16} className="text-primary" />
              Job Information
            </h4>

            {/* Boxed Content for Symmetrical Look */}
            <div className="bg-card border-border rounded-lg border p-4 space-y-4 h-full">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">Job ID</p>
                <p
                  className="text-foreground font-mono text-xs font-semibold"
                  title={job?.job_id}
                >
                  {job?.job_id}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <p className="text-muted-foreground text-xs">Current Status</p>
                {renderStatus(job?.sync_status)}
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <p className="text-muted-foreground text-xs">Created</p>
                </div>
                <p className="text-foreground text-sm font-medium">
                  {formatUserDateNice(job?.created_at)}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <p className="text-muted-foreground text-xs">Last Updated</p>
                </div>
                <p className="text-foreground text-sm font-medium">
                  {formatUserDateNice(job?.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditModelBox>
  );
};

export default MailBoxSyncDetailsModal;
