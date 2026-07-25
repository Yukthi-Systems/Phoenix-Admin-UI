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

import React, { useState, useEffect, useRef } from "react";
import {
  CircleX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { TableCancelButton, TableDeleteButton } from "./Buttons";
import { evaluateDeleteChecks } from "@/hooks/usePreDeleteCheck";

function BulkDeleteModal({
  isOpen = false,
  items = [],
  onDelete = async (id, label) => {},
  onClose = () => {},
  onComplete = () => {},
  title = "Bulk Delete",
  description = "Are you sure you want to delete the selected items?",
  itemName = "item",
  // Optional: (item) => [{ label, fn: (id) => Promise<count> }, ...]
  // Same shape as usePreDeleteCheck's `checks`. Run per-item right before
  // its delete call - if any check finds a dependent count > 0, that item
  // is skipped (marked "blocked") instead of hitting the backend and
  // surfacing a raw error.
  getChecks = null,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [originalItemsCount, setOriginalItemsCount] = useState(0);
  const [confirmText, setConfirmText] = useState("");

  // Add ref for cancellation control and auto-scroll
  const cancelledRef = useRef(false);
  const progressListRef = useRef(null);
  const prevProgressLengthRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setProgress([]);
      setCurrentIndex(0);
      setHasStarted(false);
      setIsCompleted(false);
      setIsCancelled(false);
      setOriginalItemsCount(items.length);
      setConfirmText("");
      cancelledRef.current = false;
      prevProgressLengthRef.current = 0;
    }
  }, [isOpen, items.length]);

  const handleCancel = () => {
    if (isDeleting) {
      cancelledRef.current = true;
      setIsCancelled(true);
      setIsDeleting(false);

      setProgress((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "cancelled" } : p,
        ),
      );
    }
  };

  const handleStartDelete = async () => {
    setIsDeleting(true);
    setHasStarted(true);
    setIsCancelled(false);
    cancelledRef.current = false;

    const newProgress = items.map((item) => ({
      id: item.id,
      label: item.label,
      status: "pending",
      error: null,
    }));
    setProgress(newProgress);

    const successfulDeletes = [];
    const failedDeletes = [];
    const blockedDeletes = [];

    for (let i = 0; i < items.length; i++) {
      if (cancelledRef.current) {
        break;
      }

      setCurrentIndex(i);
      const item = items[i];

      const checks = getChecks?.(item) || [];
      if (checks.length > 0) {
        setProgress((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "checking" } : p,
          ),
        );

        const reasons = await evaluateDeleteChecks(item.id, checks);

        if (cancelledRef.current) {
          break;
        }

        if (reasons.length > 0) {
          const reasonText = reasons
            .map((r) => `${r.count} ${r.label}${r.count !== 1 ? "s" : ""}`)
            .join(", ");
          blockedDeletes.push({ id: item.id, reasons });
          setProgress((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: "blocked", error: `Still has ${reasonText}` }
                : p,
            ),
          );

          if (i < items.length - 1 && !cancelledRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
          continue;
        }
      }

      setProgress((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "deleting" } : p)),
      );

      try {
        await onDelete(item.id, item.label);

        if (cancelledRef.current) {
          break;
        }

        successfulDeletes.push(item.id);
        setProgress((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "success" } : p)),
        );
      } catch (error) {
        if (cancelledRef.current) {
          break;
        }

        const errMsg =
          error?.response?.data?.message ||
          error?.message ||
          error?.response?.data ||
          "Unknown error";

        failedDeletes.push({ id: item.id, error: errMsg });

        setProgress((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: "error",
                  error: errMsg || "Unknown error",
                }
              : p,
          ),
        );
      }

      if (i < items.length - 1 && !cancelledRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsDeleting(false);

    if (!cancelledRef.current) {
      setIsCompleted(true);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      if ((isCompleted || isCancelled) && onComplete) {
        const successfulDeletes = progress
          .filter((p) => p.status === "success")
          .map((p) => p.id);
        const failedDeletes = progress
          .filter((p) => p.status === "error")
          .map((p) => ({ id: p.id, error: p.error }));
        const cancelledDeletes = progress
          .filter((p) => p.status === "cancelled")
          .map((p) => p.id);
        const blockedDeletes = progress
          .filter((p) => p.status === "blocked")
          .map((p) => ({ id: p.id, error: p.error }));

        onComplete({
          successful: successfulDeletes,
          failed: failedDeletes,
          blocked: blockedDeletes,
          cancelled: cancelledDeletes,
          total: originalItemsCount,
          wasCancelled: isCancelled,
        });
      }
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      handleClose();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full bg-muted border-2 border-border animate-pulse"></div>
        );
      case "checking":
        return <Loader2 size={16} className="animate-spin text-warning" />;
      case "deleting":
        return <Loader2 size={16} className="animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle size={16} className="text-success" />;
      case "error":
        return <XCircle size={16} className="text-destructive" />;
      case "blocked":
        return <ShieldAlert size={16} className="text-warning" />;
      case "cancelled":
        return <X size={16} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-muted-foreground bg-muted/30 border-border/50";
      case "checking":
        return "text-warning bg-warning/10 border-warning/30 dark:bg-warning/5 dark:border-warning/20";
      case "deleting":
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300";
      case "success":
        return "text-success bg-success/10 border-success/30 dark:bg-success/5 dark:border-success/20";
      case "error":
        return "text-destructive bg-destructive/10 border-destructive/30 dark:bg-destructive/5 dark:border-destructive/20";
      case "blocked":
        return "text-warning bg-warning/10 border-warning/30 dark:bg-warning/5 dark:border-warning/20";
      case "cancelled":
        return "text-muted-foreground bg-muted/20 border-muted/40";
      default:
        return "text-foreground bg-background border-border";
    }
  };

  const successCount = progress.filter((p) => p.status === "success").length;
  const errorCount = progress.filter((p) => p.status === "error").length;
  const blockedCount = progress.filter((p) => p.status === "blocked").length;
  const cancelledCount = progress.filter(
    (p) => p.status === "cancelled",
  ).length;
  const processedCount =
    successCount + errorCount + blockedCount + cancelledCount;
  const totalItemsCount = originalItemsCount || items.length;
  const progressPercentage =
    totalItemsCount > 0 ? (processedCount / totalItemsCount) * 100 : 0;

  const isConfirmValid = confirmText === "Delete";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card text-left rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-border/50">
        <div className="flex justify-between items-center p-4 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="text-destructive" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                {title}
              </h2>
              <p className="text-xs text-left text-muted-foreground">
                {!hasStarted
                  ? `${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "s" : ""} selected`
                  : isCancelled
                    ? "Operation cancelled"
                    : isCompleted
                      ? "Operation completed"
                      : "Deletion in progress..."}
              </p>
            </div>
          </div>
          {!isDeleting && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <CircleX size={18} />
            </button>
          )}
        </div>

        <div className="p-4">
          {!hasStarted ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-3">
                  <Trash2 className="text-destructive" size={24} />
                </div>
                <p className="text-base text-card-foreground mb-1.5">
                  {description}
                </p>
                <p className="text-xs text-muted-foreground">
                  This will permanently delete{" "}
                  <strong className="text-destructive">
                    {totalItemsCount}
                  </strong>{" "}
                  {itemName}
                  {totalItemsCount !== 1 ? "s" : ""}. This action cannot be
                  undone.
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg border border-border/50">
                <div className="p-3 border-b border-border/50">
                  <h4 className="text-xs font-semibold text-card-foreground flex items-center gap-2">
                    <Trash2 size={14} />
                    Items to delete:
                  </h4>
                </div>
                <div className="max-h-40 overflow-y-auto p-3">
                  <div className="grid gap-1.5">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 bg-background/50 rounded-md border border-border/30"
                      >
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                          {index + 1}
                        </span>
                        <span className="text-xs text-foreground font-medium truncate">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="text-destructive mt-0.5 flex-shrink-0"
                    size={16}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-destructive mb-1">
                      Confirmation Required
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type{" "}
                      <span className="font-mono font-semibold text-foreground bg-muted px-1 py-0.5 rounded">
                        Delete
                      </span>{" "}
                      to confirm this action
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'Delete' to confirm"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive"
                  autoComplete="off"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-semibold text-card-foreground">
                    {isCancelled
                      ? "Bulk Delete Cancelled"
                      : isCompleted
                        ? "Bulk Delete Complete"
                        : `Deleting ${itemName}s...`}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {processedCount} / {totalItemsCount}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                        isCancelled
                          ? "bg-gradient-to-r from-muted-foreground to-muted-foreground/80"
                          : "bg-gradient-to-r from-primary to-primary/80"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-foreground/70">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
                <div className="max-h-56 overflow-y-auto" ref={progressListRef}>
                  <div className="divide-y divide-border/30">
                    {progress.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2.5 p-3 transition-all duration-200 ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        <span className="flex-1 text-xs font-medium truncate">
                          {item.label}
                        </span>
                        {item.status === "cancelled" && (
                          <span className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded-md">
                            Cancelled
                          </span>
                        )}
                        {item.error && (
                          <span className="text-[10px] max-w-[280px] line-clamp-2 text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md">
                            {item.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(isCompleted || isCancelled) && (
                <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg border border-border/50 p-3">
                  <div className="text-center mb-3">
                    <h3 className="text-base font-semibold text-card-foreground mb-1">
                      {isCancelled
                        ? "Operation Cancelled"
                        : "Operation Complete!"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isCancelled
                        ? "The bulk delete operation was cancelled. Here's what was completed:"
                        : "The bulk delete operation has finished. Here's a summary:"}
                    </p>
                  </div>

                  <div
                    className={`grid gap-3 mb-3 ${
                      [cancelledCount, blockedCount].filter((c) => c > 0)
                        .length === 2
                        ? "grid-cols-4"
                        : [cancelledCount, blockedCount].filter((c) => c > 0)
                              .length === 1
                          ? "grid-cols-3"
                          : "grid-cols-2"
                    }`}
                  >
                    <div className="text-center p-2.5 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <CheckCircle size={14} className="text-success" />
                        <span className="text-base font-bold text-success">
                          {successCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-success font-medium">
                        Successfully Deleted
                      </p>
                    </div>

                    <div className="text-center p-2.5 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <XCircle size={14} className="text-destructive" />
                        <span className="text-base font-bold text-destructive">
                          {errorCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-destructive font-medium">
                        Failed to Delete
                      </p>
                    </div>

                    {blockedCount > 0 && (
                      <div className="text-center p-2.5 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <ShieldAlert size={14} className="text-warning" />
                          <span className="text-base font-bold text-warning">
                            {blockedCount}
                          </span>
                        </div>
                        <p className="text-[10px] text-warning font-medium">
                          Blocked
                        </p>
                      </div>
                    )}

                    {cancelledCount > 0 && (
                      <div className="text-center p-2.5 bg-muted/30 rounded-lg border border-muted/50">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <X size={14} className="text-muted-foreground" />
                          <span className="text-base font-bold text-muted-foreground">
                            {cancelledCount}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Cancelled
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      Total items processed:{" "}
                      <span className="font-semibold text-foreground">
                        {processedCount}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-foreground">
                        {totalItemsCount}
                      </span>
                    </p>
                    {(errorCount > 0 || blockedCount > 0 || cancelledCount > 0) && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {errorCount > 0 &&
                          "Check the list above for specific error details"}
                        {errorCount > 0 && cancelledCount > 0 && " • "}
                        {cancelledCount > 0 &&
                          `${cancelledCount} item${cancelledCount !== 1 ? "s" : ""} not processed due to cancellation`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 p-4 border-t border-border/50 bg-muted/10">
          {!hasStarted ? (
            <>
              <TableCancelButton handleClick={handleClose} label="Cancel" />
              <TableDeleteButton
                handleClick={handleStartDelete}
                label={`Delete ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "s" : ""}`}
                disabled={!isConfirmValid}
              />
            </>
          ) : isDeleting ? (
            <>
              <TableCancelButton
                handleClick={handleClose}
                label="Close"
                disabled={true}
              />
              <TableDeleteButton
                handleClick={handleCancel}
                label="Cancel Deletion"
                className="bg-destructive hover:bg-destructive/90"
              />
            </>
          ) : (
            <TableCancelButton handleClick={handleClose} label="Close" />
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkDeleteModal;
