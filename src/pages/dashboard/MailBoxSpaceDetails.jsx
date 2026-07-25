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

import { AlertCircle, Mail } from "lucide-react";

const MailboxSpaceDetails = ({ processedData, mailboxesSpace }) => {
  const bytesToGB = (bytes) => {
    if (!bytes || bytes === 0) return 0;
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 80) return "bg-warning";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const MailboxProgressItem = ({
    domain,
    allocated,
    utilizedBytes,
    percentage,
    totalMailboxes,
    activeMailboxes,
    inactiveMailboxes,
    emailsCount,
  }) => {
    const utilizedGB = bytesToGB(utilizedBytes);

    return (
      <div className="bg-muted/20 space-y-2 rounded-lg p-3">
        {/* Domain name and usage */}
        <div className="flex items-center justify-between">
          <span
            className="text-card-foreground max-w-[140px] truncate text-sm font-medium"
            title={domain}
          >
            {domain}
          </span>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {utilizedGB} / {allocated} GB
          </span>
        </div>

        <div className="relative">
          <div className="bg-muted h-1.5 w-full rounded-full">
            <div
              className={`${getProgressBarColor(percentage)} h-1.5 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-muted-foreground absolute -top-10 right-0 text-xs">
            {percentage.toFixed(1)}%
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-card-foreground font-medium">
                {totalMailboxes}
              </div>
              <div className="text-muted-foreground text-[10px]">Total</div>
            </div>
            <div className="text-center">
              <div className="text-success font-medium">{activeMailboxes}</div>
              <div className="text-muted-foreground text-[10px]">Active</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground font-medium">
                {inactiveMailboxes}
              </div>
              <div className="text-muted-foreground text-[10px]">Inactive</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-card-foreground font-medium">
              {emailsCount.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-[10px]">Emails</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border-border rounded-lg border shadow-sm">
      <div className="border-border border-b p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-card-foreground text-left text-lg font-semibold">
            Mailbox Space Details
          </h3>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm sm:text-right">
            <div>{processedData.totalMailboxes} Mailboxes</div>
            <span className="hidden sm:inline">•</span>
            <div>
              {Number(processedData.totalMailboxQuotaUsedGB).toFixed(2)} /{" "}
              {Number(processedData.totalMailboxQuota).toFixed(2)} GB
            </div>
          </div>
        </div>
      </div>
      <div className="max-h-[350px] overflow-y-auto p-4">
        {mailboxesSpace.isLoading ? (
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted/20 space-y-2 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-1.5 w-full animate-pulse rounded-full" />
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="bg-muted h-6 w-8 animate-pulse rounded" />
                    <div className="bg-muted h-6 w-8 animate-pulse rounded" />
                    <div className="bg-muted h-6 w-8 animate-pulse rounded" />
                  </div>
                  <div className="bg-muted h-6 w-12 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : mailboxesSpace.isError ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <AlertCircle className="text-muted-foreground h-8 w-8" />
            <span className="text-muted-foreground text-sm">
              Failed to load mailbox space data
            </span>
          </div>
        ) : processedData.mailboxProgressData.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {processedData.mailboxProgressData.map((mailbox) => (
              <MailboxProgressItem
                key={mailbox.domain}
                domain={mailbox.domain}
                allocated={mailbox.allocated}
                utilizedBytes={mailbox.utilizedBytes}
                percentage={mailbox.percentage}
                totalMailboxes={mailbox.totalMailboxes}
                activeMailboxes={mailbox.activeMailboxes}
                inactiveMailboxes={mailbox.inactiveMailboxes}
                emailsCount={mailbox.emailsCount}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <Mail className="text-muted-foreground h-8 w-8" />
            </div>
            <span className="text-muted-foreground text-sm">
              No mailbox space data available
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailboxSpaceDetails;
