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

import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import {
  Mail,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Users,
  Activity,
  History,
  Loader2,
} from "lucide-react";
import { useToastify } from "@/hooks/useToastify";
import {
  useLockMailbox,
  useGetMailboxMigrationStatus,
} from "@/hooks/useServer";
import { useQueryClient } from "@tanstack/react-query";
import MigrationLogsModal from "./MigrationLogsModal";

const MailboxCard = ({
  mailbox,
  isSelected,
  onSelectionChange,
  canMigrate,
  sourceServerId,
  targetServers,
  selectedMailboxes = {},
  selectedMailboxQuotas = {},
  selectedCount = 0,
  allServers = [],
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showMigrationLogs, setShowMigrationLogs] = useState(false);
  const [shouldCheckStatus, setShouldCheckStatus] = useState(false);
  const [migrationInProgress, setMigrationInProgress] = useState(false);

  const { mutate: lockMailbox, isPending: isLocking } = useLockMailbox();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data: migrationStatusData, isLoading: isCheckingStatus } =
    useGetMailboxMigrationStatus(shouldCheckStatus ? mailbox.email : null);

  useEffect(() => {
    if (migrationStatusData?.data) {
      setMigrationInProgress(migrationStatusData.data.migration_in_progress);
    }
  }, [migrationStatusData]);

  const actualCanMigrate = canMigrate && !migrationInProgress;

  const isMultiSelectionDrag = selectedCount > 1 && isSelected;

  const getDragData = () => {
    if (isMultiSelectionDrag) {
      const selectedEmails = Object.keys(selectedMailboxes).filter(
        (email) => selectedMailboxes[email],
      );
      return {
        emails: selectedEmails,
        mailboxQuotas: Object.fromEntries(
          selectedEmails.map((email) => [email, selectedMailboxQuotas[email]]),
        ),
        sourceServerId,
        canMigrate: actualCanMigrate,
        isMultiple: true,
        count: selectedEmails.length,
      };
    }

    return {
      email: mailbox.email,
      emails: [mailbox.email],
      mailboxQuotas: { [mailbox.email]: Number(mailbox.quota_allocated) },
      sourceServerId,
      canMigrate: actualCanMigrate,
      isMultiple: false,
      count: 1,
    };
  };

  const [{ isDragging }, drag] = useDrag({
    type: "mailbox",
    item: getDragData(),
    canDrag: actualCanMigrate,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleMouseEnter = () => {
    setShowActions(true);
    if (canMigrate && !shouldCheckStatus) {
      setShouldCheckStatus(true);
    }
  };

  const handleMouseLeave = () => {
    setShowActions(false);
  };

  const handleLockToggle = async () => {
    const newLockState = !mailbox.is_locked;

    lockMailbox(
      { email: mailbox.email, is_locked: newLockState },
      {
        onSuccess: () => {
          toast(
            "success",
            `Mailbox ${mailbox.is_locked ? "unlocked" : "locked"} successfully`,
          );

          queryClient.invalidateQueries({
            queryKey: ["mailboxes_from_server", sourceServerId],
          });
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          const tracebackId = error.response?.data?.traceback_id;
          toast(
            "error",
            `Failed to ${mailbox.is_locked ? "unlock" : "lock"} mailbox: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
        },
      },
    );
  };

  const handleShowMigrationLogs = (e) => {
    e.stopPropagation();
    setShowMigrationLogs(true);
  };

  const getMigrationStatusInfo = () => {
    if (migrationInProgress) {
      return {
        icon: Activity,
        color: "text-primary bg-primary/20",
        label: "In Progress",
      };
    }

    if (!mailbox.migration_status) return null;

    const statusConfig = {
      INITIALIZING: {
        icon: Clock,
        color: "text-warning bg-warning/20",
        label: "Initializing",
      },
      IN_PROGRESS: {
        icon: Activity,
        color: "text-primary bg-primary/20",
        label: "In Progress",
      },
      COMPLETED: {
        icon: CheckCircle,
        color: "text-success bg-success/20",
        label: "Completed",
      },
      FAILED: {
        icon: XCircle,
        color: "text-destructive bg-destructive/20",
        label: "Failed",
      },
    };

    return statusConfig[mailbox.migration_status] || null;
  };

  const migrationInfo = getMigrationStatusInfo();

  const quotaUtilizedGB = mailbox.quota_utilized_bytes
    ? mailbox.quota_utilized_bytes / (1024 * 1024 * 1024)
    : mailbox.quota_utilized || 0;

  const quotaPercentage =
    mailbox.quota_allocated > 0
      ? (quotaUtilizedGB / mailbox.quota_allocated) * 100
      : 0;

  const getQuotaColor = () => {
    if (quotaPercentage >= 90) return "bg-destructive";
    if (quotaPercentage >= 75) return "bg-warning";
    return "bg-primary";
  };

  return (
    <>
      <div
        ref={actualCanMigrate ? drag : null}
        className={`
          relative p-3 bg-background border rounded-md transition-all duration-200 group
          ${actualCanMigrate ? "cursor-move" : "cursor-default"}
          ${isDragging ? "opacity-50 scale-95" : ""}
          ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-border/60"}
          ${!actualCanMigrate ? "opacity-60" : "hover:shadow-sm"}
          ${isMultiSelectionDrag ? "ring-2 ring-primary/50" : ""}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isCheckingStatus && (
          <div className="absolute top-1 right-1 z-10">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
          </div>
        )}

        {isMultiSelectionDrag && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <Users className="w-3 h-3" />
            {selectedCount}
          </div>
        )}

        <div className="absolute top-2 left-2">
          {actualCanMigrate ? (
            <button
              onClick={() => onSelectionChange(!isSelected)}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="p-1">
              <Square className="w-4 h-4 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <button
            onClick={handleLockToggle}
            disabled={isLocking}
            className={`p-1 rounded transition-colors ${
              mailbox.is_locked
                ? "text-destructive hover:bg-destructive/10"
                : "text-success hover:bg-success/10"
            } ${isLocking ? "opacity-50 cursor-not-allowed" : ""}`}
            title={mailbox.is_locked ? "Unlock mailbox" : "Lock mailbox"}
          >
            {isLocking ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : mailbox.is_locked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="mt-6 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary flex-shrink-0" />
            <span
              onClick={handleShowMigrationLogs}
              className="font-medium text-foreground truncate text-sm hover:underline cursor-pointer hover:text-blue-500"
            >
              {mailbox.email}
            </span>
          </div>

          {migrationInfo && (
            <div className="flex items-center gap-2 mb-2">
              <migrationInfo.icon className="w-3 h-3" />
              <span
                className={`text-xs px-2 py-1 rounded ${migrationInfo.color}`}
              >
                {migrationInfo.label}
                {migrationInProgress && (
                  <span className="ml-1">
                    ({migrationStatusData?.data?.migration_count || 0} active)
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Quota Usage</span>
              <span>
                {quotaUtilizedGB.toFixed(3)}/{mailbox.quota_allocated} GB
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${getQuotaColor()}`}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span
                  className={
                    (mailbox.is_active ?? mailbox.is_enabled) ? "text-success" : "text-destructive"
                  }
                >
                  {(mailbox.is_active ?? mailbox.is_enabled) ? "Active" : "Inactive"}
                </span>
                {mailbox.total_messages_count !== undefined && (
                  <span className="text-muted-foreground">
                    {mailbox.total_messages_count} msgs
                  </span>
                )}
              </div>
              <span>{quotaPercentage.toFixed(1)}% used</span>
            </div>
          </div>

          {!actualCanMigrate && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              <span>
                {mailbox.is_locked
                  ? "Locked"
                  : migrationInProgress
                    ? "Migration in progress"
                    : migrationInfo
                      ? `Migration ${migrationInfo.label.toLowerCase()}`
                      : "Cannot migrate"}
              </span>
            </div>
          )}
        </div>

        {actualCanMigrate && isDragging && (
          <div className="absolute inset-0 bg-primary/20 border-2 border-primary border-dashed rounded-md flex items-center justify-center">
            {isMultiSelectionDrag ? (
              <div className="text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-1" />
                <span className="text-xs text-primary font-medium">
                  {selectedCount} selected
                </span>
              </div>
            ) : (
              <ArrowRight className="w-6 h-6 text-primary" />
            )}
          </div>
        )}
      </div>

      {showMigrationLogs && (
        <MigrationLogsModal
          isOpen={showMigrationLogs}
          onClose={() => setShowMigrationLogs(false)}
          email={mailbox.email}
          allServers={allServers}
        />
      )}
    </>
  );
};

export default MailboxCard;
