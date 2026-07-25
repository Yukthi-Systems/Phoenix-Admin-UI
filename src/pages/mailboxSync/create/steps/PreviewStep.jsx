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

// src/pages/server/mailboxSync/add/steps/PreviewStep.jsx
import React from "react";
import moment from "moment";
import InfoBox from "@/components/common/InfoBox";

const PreviewItem = ({ label, value, isPassword = false }) => (
  <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-0">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground break-all">
      {isPassword ? "••••••••" : value || "-"}
    </span>
  </div>
);

const PreviewStep = ({ formData }) => {
  // Construct the full destination email for display
  const destinationEmail = `${formData.to_email_prefix}@${formData.to_email_domain}`;
  
  // Format dates for display
  const startDate = formData.date_range?.startDate 
    ? moment(formData.date_range.startDate).format("YYYY-MM-DD") 
    : "-";
  const endDate = formData.date_range?.endDate 
    ? moment(formData.date_range.endDate).format("YYYY-MM-DD") 
    : "-";

  return (
    <div className="flex flex-col text-left gap-6">
      <InfoBox
        title="Review Sync Job"
        description="Please review the configuration below before starting the synchronization process."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Source Configuration */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold text-primary border-b border-border pb-2">
            External Source (From)
          </h3>
          <PreviewItem label="IMAP Server" value={formData.imap_server} />
          <PreviewItem label="Port" value={formData.imap_port} />
          <PreviewItem label="Username" value={formData.imap_username} />
          <PreviewItem label="Password" value={formData.imap_password} isPassword />
        </div>

        {/* Destination & Scope */}
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary border-b border-border pb-2">
              Local Destination (To)
            </h3>
            <PreviewItem label="Destination Email" value={destinationEmail} />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary border-b border-border pb-2">
              Sync Scope
            </h3>
            <PreviewItem label="Folder" value={formData.sync_specific_folder} />
            <div className="grid grid-cols-2 gap-4">
                <PreviewItem label="From Date" value={startDate} />
                <PreviewItem label="To Date" value={endDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;