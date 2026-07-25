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
  Copy,
  CircleX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { TableCancelButton, TableMoveButton } from "./Buttons";
import { DomainInfiniteSelect } from "./DomainSelect";

function CopyPolicies({
  isOpen = false,
  onClose = () => {},
  policies = [], // Can be single policy or multiple policies
  onCopy = async (sourceDomain, policyId, targetDomain) => {}, // Updated signature
  onComplete = () => {},
  title = "Copy Policies",
  description = "Are you sure you want to copy the selected policies?",
  itemName = "policy",
  isSingle = false, // New prop for single policy UI
  organization_id = "",
  currentDomain = "",
}) {
  const [isCopying, setIsCopying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [originalItemsCount, setOriginalItemsCount] = useState(0);
  const [progress, setProgress] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add ref for cancellation control
  const cancelledRef = useRef(false);

  const [targetDomain, setTargetDomain] = useState({
    id: null,
    name: "None",
  });

  // Normalize policies to always be an array
  const policiesArray = Array.isArray(policies) ? policies : [policies];

  const isBulkCopy = policiesArray.length > 1 && !isSingle;
  const showSingleUI = isSingle || policiesArray.length === 1;

  useEffect(() => {
    if (isOpen) {
      setIsCopying(false);
      setProgress([]);
      setCurrentIndex(0);
      setHasStarted(false);
      setIsCompleted(false);
      setIsCancelled(false);
      setOriginalItemsCount(policiesArray.length);
      cancelledRef.current = false;
      // Reset target domain
      setTargetDomain({
        id: null,
        name: "None",
      });
    }
  }, [isOpen, policiesArray.length]);

  const handleCancel = () => {
    if (isCopying) {
      // Cancel the ongoing operation
      cancelledRef.current = true;
      setIsCancelled(true);
      setIsCopying(false);

      // Mark pending items as cancelled
      setProgress((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "cancelled" } : p,
        ),
      );
    }
  };

  const handleStartCopy = async () => {
    if (!targetDomain.id) {
      alert("Please select a target domain");
      return;
    }

    setIsCopying(true);
    setHasStarted(true);
    setIsCancelled(false);
    cancelledRef.current = false;

    const newProgress = policiesArray.map((policy) => ({
      id: policy.id,
      label:
        policy.label ||
        policy.name ||
        policy.policy_name ||
        `Policy ${policy.id}`,
      status: "pending",
      error: null,
    }));
    setProgress(newProgress);

    const successfulCopies = [];
    const failedCopies = [];

    for (let i = 0; i < policiesArray.length; i++) {
      // Check if operation was cancelled
      if (cancelledRef.current) {
        break;
      }

      setCurrentIndex(i);
      const policy = policiesArray[i];

      setProgress((prev) =>
        prev.map((p) => (p.id === policy.id ? { ...p, status: "copying" } : p)),
      );

      try {
        await onCopy(currentDomain, policy?.id, targetDomain.name);

        // Check again after async operation
        if (cancelledRef.current) {
          break;
        }

        successfulCopies.push(policy.id);
        setProgress((prev) =>
          prev.map((p) =>
            p.id === policy.id ? { ...p, status: "success" } : p,
          ),
        );
      } catch (error) {
        // Check if cancelled during error handling
        if (cancelledRef.current) {
          break;
        }

        const errMsg =
          error?.response?.data?.message ||
          error?.message ||
          error?.response?.data ||
          "Unknown error";

        failedCopies.push({ id: policy.id, error: errMsg });

        setProgress((prev) =>
          prev.map((p) =>
            p.id === policy.id
              ? {
                  ...p,
                  status: "error",
                  error: errMsg || "Unknown error",
                }
              : p,
          ),
        );
      }

      // Add delay between copies, but check for cancellation
      if (i < policiesArray.length - 1 && !cancelledRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsCopying(false);

    if (!cancelledRef.current) {
      setIsCompleted(true);
    }
  };

  const handleClose = () => {
    if (!isCopying) {
      // If completed, call onComplete with results before closing
      if ((isCompleted || isCancelled) && onComplete) {
        const successfulCopies = progress
          .filter((p) => p.status === "success")
          .map((p) => p.id);
        const failedCopies = progress
          .filter((p) => p.status === "error")
          .map((p) => ({ id: p.id, error: p.error }));
        const cancelledCopies = progress
          .filter((p) => p.status === "cancelled")
          .map((p) => p.id);

        onComplete({
          successful: successfulCopies,
          failed: failedCopies,
          cancelled: cancelledCopies,
          total: originalItemsCount,
          wasCancelled: isCancelled,
          targetDomainId: targetDomain.id,
          targetDomainName: targetDomain.name,
        });
      }
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isCopying) {
      handleClose();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full bg-muted border-2 border-border animate-pulse"></div>
        );
      case "copying":
        return <Loader2 size={16} className="animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle size={16} className="text-success" />;
      case "error":
        return <XCircle size={16} className="text-destructive" />;
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
      case "copying":
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300";
      case "success":
        return "text-success bg-success/10 border-success/30 dark:bg-success/5 dark:border-success/20";
      case "error":
        return "text-destructive bg-destructive/10 border-destructive/30 dark:bg-destructive/5 dark:border-destructive/20";
      case "cancelled":
        return "text-muted-foreground bg-muted/20 border-muted/40";
      default:
        return "text-foreground bg-background border-border";
    }
  };

  const handleTargetDomainSelect = (domainValue) => {
    // Find the selected domain from the options to get both id and name
    // This would need to be adjusted based on how DomainInfiniteSelectField works
    setTargetDomain({
      id: domainValue, // This might need adjustment based on your data structure
      name: domainValue,
    });
  };

  const successCount = progress.filter((p) => p.status === "success").length;
  const errorCount = progress.filter((p) => p.status === "error").length;
  const cancelledCount = progress.filter(
    (p) => p.status === "cancelled",
  ).length;
  const processedCount = successCount + errorCount + cancelledCount;
  const totalItemsCount = originalItemsCount || policiesArray.length;
  const progressPercentage =
    totalItemsCount > 0 ? (processedCount / totalItemsCount) * 100 : 0;

  if (!isOpen) return null;

  // Single Policy UI - Simplified version
  if (showSingleUI && !hasStarted) {
    const singlePolicy = policiesArray[0];
    const policyName =
      singlePolicy?.label ||
      singlePolicy?.name ||
      singlePolicy?.policy_name ||
      "Policy";

    return (
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-card rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-border/50">
          <div className="flex justify-between items-center p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Copy className="text-blue-500" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  {title}
                </h2>
                <p className="text-sm text-left text-muted-foreground">
                  Copy policy to another domain
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <CircleX size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <Copy className="text-blue-500" size={28} />
                </div>
                <p className="text-lg text-card-foreground mb-2">
                  Copy <strong className="text-blue-500">{policyName}</strong>?
                </p>
                <p className="text-sm text-muted-foreground">
                  This will copy the policy to the selected domain.
                </p>
              </div>

              {/* Policy Info */}
              <div className="bg-muted/30 rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <span className="text-blue-500 text-sm font-medium">P</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {policyName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Policy to copy
                    </p>
                  </div>
                </div>
              </div>

              {/* Domain Selector */}
              <div className="bg-muted/30 rounded-lg border border-border/50 p-4">
                <label className="text-card-foreground mb-3 block text-left text-sm font-medium">
                  Target Domain
                  <span className="text-red-500"> *</span>
                </label>
                <DomainInfiniteSelect
                  value={targetDomain.name}
                  onChange={handleTargetDomainSelect}
                  label=""
                  placeholder="Select target domain"
                  url={`/domain/list/${organization_id}`} // Adjust URL as needed
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Select the domain where you want to copy the policy
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-muted/10">
            <TableCancelButton handleClick={handleClose} label="Cancel" />
            <TableMoveButton
              handleClick={handleStartCopy}
              label="Copy Policy"
              disabled={!targetDomain.id}
            />
          </div>
        </div>
      </div>
    );
  }

  // Single Policy UI - In Progress & Completed States
  if (showSingleUI && hasStarted) {
    const singlePolicy = policiesArray[0];
    const policyName =
      singlePolicy?.label ||
      singlePolicy?.name ||
      singlePolicy?.policy_name ||
      "Policy";
    const currentStatus = progress[0]?.status || "pending";

    return (
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-card rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-border/50">
          <div className="flex justify-between items-center p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Copy className="text-blue-500" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  {isCopying
                    ? "Copying Policy"
                    : isCancelled
                      ? "Copy Cancelled"
                      : "Copy Complete"}
                </h2>
                <p className="text-sm text-left text-muted-foreground">
                  {isCopying
                    ? "Copy in progress..."
                    : isCancelled
                      ? "Operation was cancelled"
                      : "Policy copy completed"}
                </p>
              </div>
            </div>

            {!isCopying && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                <CircleX size={20} />
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Status Display */}
              <div className="text-center">
                <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
                  {isCopying ? (
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  ) : currentStatus === "success" ? (
                    <CheckCircle className="w-12 h-12 text-success" />
                  ) : currentStatus === "error" ? (
                    <XCircle className="w-12 h-12 text-destructive" />
                  ) : (
                    <Copy className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {isCopying
                    ? "Copying Policy..."
                    : currentStatus === "success"
                      ? "Copy Successful!"
                      : currentStatus === "error"
                        ? "Copy Failed"
                        : "Copy Cancelled"}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-card-foreground">{policyName}</strong>
                </p>

                {isCopying && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                )}

                {progress[0]?.error && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive text-left">
                      {progress[0].error}
                    </p>
                  </div>
                )}
              </div>

              {/* Target Domain Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30 p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  <span className="font-medium">Target: </span>
                  {targetDomain.name}
                </p>
              </div>

              {/* Action Result */}
              {!isCopying && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {currentStatus === "success"
                      ? "The policy has been successfully copied to the target domain."
                      : currentStatus === "error"
                        ? "Failed to copy the policy. Please try again."
                        : "The copy operation was cancelled."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-muted/10">
            {isCopying ? (
              <>
                <TableCancelButton
                  handleClick={handleClose}
                  label="Close"
                  disabled={true}
                />
                <TableMoveButton
                  handleClick={handleCancel}
                  label="Cancel Copy"
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

  // Original Bulk Copy UI (for multiple policies)
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Copy className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {isBulkCopy ? "Bulk Copy Policies" : title}
              </h2>
              <p className="text-sm text-left text-muted-foreground">
                {!hasStarted
                  ? `${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "ies" : "y"} selected`
                  : isCancelled
                    ? "Operation cancelled"
                    : isCompleted
                      ? "Operation completed"
                      : "Copy in progress..."}
              </p>
            </div>
          </div>

          {!isCopying && (
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <CircleX size={20} />
            </button>
          )}
        </div>

        <div className="p-6">
          {!hasStarted ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <Copy className="text-blue-500" size={28} />
                </div>
                <p className="text-lg text-card-foreground mb-2">
                  {isBulkCopy
                    ? `Copy ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "ies" : "y"} to another domain?`
                    : description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isBulkCopy
                    ? `This will copy ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "ies" : "y"} to the selected domain.`
                    : `This will copy the policy to the selected domain.`}
                </p>
              </div>

              {/* Domain Selector */}
              <div className="bg-muted/30 rounded-lg border border-border/50 p-4">
                <label className="text-card-foreground mb-3 block text-left text-sm font-medium">
                  Target Domain
                  <span className="text-red-500"> *</span>
                </label>
                <DomainInfiniteSelect
                  value={targetDomain.name}
                  onChange={handleTargetDomainSelect}
                  label=""
                  placeholder="Select target domain"
                  url={`/domain/list/${organization_id}`} // Adjust URL as needed
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Select the domain where you want to copy the{" "}
                  {isBulkCopy ? "policies" : "policy"}
                </p>
              </div>

              {/* Items List */}
              <div className="bg-muted/30 rounded-lg border border-border/50">
                <div className="p-4 border-b border-border/50">
                  <h4 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                    <Copy size={16} />
                    {isBulkCopy ? "Policies to copy:" : "Policy to copy:"}
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto p-4">
                  <div className="grid gap-0">
                    {policiesArray.map((policy, index) => (
                      <div
                        key={policy.id}
                        className="flex items-center gap-3 p-2 bg-background/50 rounded-md border border-border/30"
                      >
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full min-w-[24px] text-center">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground font-medium truncate">
                          {policy.label ||
                            policy.name ||
                            policy.policy_name ||
                            `Policy ${policy.id}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold text-card-foreground">
                    {isCancelled
                      ? "Bulk Copy Cancelled"
                      : isCompleted
                        ? "Bulk Copy Complete"
                        : `Copying ${itemName}${isBulkCopy ? "ies" : "y"}...`}
                  </span>
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {processedCount} / {totalItemsCount}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${
                        isCancelled
                          ? "bg-gradient-to-r from-muted-foreground to-muted-foreground/80"
                          : "bg-gradient-to-r from-blue-500 to-blue-500/80"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground/70">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>

                {/* Target Domain Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Target Domain:</span>{" "}
                    {targetDomain.name}
                  </p>
                </div>
              </div>

              {/* Progress List */}
              <div className="bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <div className="divide-y divide-border/30">
                    {progress.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-4 transition-all duration-200 ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        <span className="flex-1 text-sm font-medium truncate">
                          {item.label}
                        </span>
                        {item.status === "cancelled" && (
                          <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                            Cancelled
                          </span>
                        )}
                        {item.error && (
                          <span className="text-xs max-w-[300px] line-clamp-2 text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                            {item.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {(isCompleted || isCancelled) && (
                <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      {isCancelled
                        ? "Operation Cancelled"
                        : "Operation Complete!"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isCancelled
                        ? "The bulk copy operation was cancelled. Here's what was completed:"
                        : "The bulk copy operation has finished. Here's a summary:"}
                    </p>
                  </div>

                  <div
                    className={`grid gap-4 mb-4 ${cancelledCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}
                  >
                    <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle size={16} className="text-success" />
                        <span className="text-lg font-bold text-success">
                          {successCount}
                        </span>
                      </div>
                      <p className="text-xs text-success font-medium">
                        Successfully Copied
                      </p>
                    </div>

                    <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <XCircle size={16} className="text-destructive" />
                        <span className="text-lg font-bold text-destructive">
                          {errorCount}
                        </span>
                      </div>
                      <p className="text-xs text-destructive font-medium">
                        Failed to Copy
                      </p>
                    </div>

                    {cancelledCount > 0 && (
                      <div className="text-center p-3 bg-muted/30 rounded-lg border border-muted/50">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <X size={16} className="text-muted-foreground" />
                          <span className="text-lg font-bold text-muted-foreground">
                            {cancelledCount}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Cancelled
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-2 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      Total items processed:{" "}
                      <span className="font-semibold text-foreground">
                        {processedCount}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-foreground">
                        {totalItemsCount}
                      </span>
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Target:{" "}
                      <span className="font-semibold">{targetDomain.name}</span>
                    </p>
                    {(errorCount > 0 || cancelledCount > 0) && (
                      <p className="text-xs text-muted-foreground mt-1">
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

        <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-muted/10">
          {!hasStarted ? (
            <>
              <TableCancelButton handleClick={handleClose} label="Cancel" />
              <TableMoveButton
                handleClick={handleStartCopy}
                label={
                  isBulkCopy
                    ? `Copy ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "ies" : "y"}`
                    : `Copy ${itemName}`
                }
                disabled={!targetDomain.id}
              />
            </>
          ) : isCopying ? (
            <>
              <TableCancelButton
                handleClick={handleClose}
                label="Close"
                disabled={true}
              />
              <TableMoveButton
                handleClick={handleCancel}
                label="Cancel Copy"
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

export default CopyPolicies;
