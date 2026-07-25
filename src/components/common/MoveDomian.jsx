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
import OrganizationSelectorLocal from "../shared/header/organization/OrganizationSelector";
import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "@/store/userInfo";
import {
  ArrowRightLeft,
  CircleX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { TableCancelButton, TableMoveButton } from "./Buttons";
import CopyOrganizationSelector from "../shared/header/organization/CopyOrgSelector";

function MoveDomain({
  isOpen = false,
  onClose = () => { },
  domains = [], // Can be single domain or multiple domains
  onMove = async (currentOrg, domainId, targetOrgId) => { },
  onComplete = () => { },
  title = "Move Domain",
  description = "Are you sure you want to move the selected domain?",
  itemName = "domain",
  isSingle = false, // New prop for single domain UI
}) {
  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);
  const [isMoving, setIsMoving] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [originalItemsCount, setOriginalItemsCount] = useState(0);
  const [progress, setProgress] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add ref for cancellation control
  const cancelledRef = useRef(false);

  const [moveOrg, setMoveOrg] = useState({
    id: null,
    name: "None",
  });

  // Normalize domains to always be an array
  const domainsArray = Array.isArray(domains) ? domains : [domains];
  console.error("Multi", domains);

  const isBulkMove = domainsArray.length > 1 && !isSingle;
  const showSingleUI = isSingle || domainsArray.length === 1;

  useEffect(() => {
    if (isOpen) {
      setIsMoving(false);
      setProgress([]);
      setCurrentIndex(0);
      setHasStarted(false);
      setIsCompleted(false);
      setIsCancelled(false);
      setOriginalItemsCount(domainsArray.length);
      cancelledRef.current = false;
      // Reset target organization
      setMoveOrg({
        id: null,
        name: "None",
      });
    }
  }, [isOpen, domainsArray.length]);

  const handleCancel = () => {
    if (isMoving) {
      // Cancel the ongoing operation
      cancelledRef.current = true;
      setIsCancelled(true);
      setIsMoving(false);

      // Mark pending items as cancelled
      setProgress((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "cancelled" } : p,
        ),
      );
    }
  };

  const handleStartMove = async () => {
    if (!moveOrg.id) {
      alert("Please select a target organization");
      return;
    }

    setIsMoving(true);
    setHasStarted(true);
    setIsCancelled(false);
    cancelledRef.current = false;

    const newProgress = domainsArray.map((domain) => ({
      id: domain.id,
      label:
        domain.label || domain.name || domain.domain || `Domain ${domain.id}`,
      status: "pending",
      error: null,
    }));
    setProgress(newProgress);

    const successfulMoves = [];
    const failedMoves = [];

    for (let i = 0; i < domainsArray.length; i++) {
      // Check if operation was cancelled
      if (cancelledRef.current) {
        break;
      }

      setCurrentIndex(i);
      const domain = domainsArray[i];

      setProgress((prev) =>
        prev.map((p) => (p.id === domain.id ? { ...p, status: "moving" } : p)),
      );

      try {
        await onMove(
          selectedOrg?.organization_id,
          domain?.name || domain?.label,
          moveOrg.id,
        );

        // Check again after async operation
        if (cancelledRef.current) {
          break;
        }

        successfulMoves.push(domain.id);
        setProgress((prev) =>
          prev.map((p) =>
            p.id === domain.id ? { ...p, status: "success" } : p,
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

        failedMoves.push({ id: domain.id, error: errMsg });

        setProgress((prev) =>
          prev.map((p) =>
            p.id === domain.id
              ? {
                ...p,
                status: "error",
                error: errMsg || "Unknown error",
              }
              : p,
          ),
        );
      }

      // Add delay between moves, but check for cancellation
      if (i < domainsArray.length - 1 && !cancelledRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsMoving(false);

    if (!cancelledRef.current) {
      setIsCompleted(true);
    }
  };

  const handleClose = () => {
    if (!isMoving) {
      // If completed, call onComplete with results before closing
      if ((isCompleted || isCancelled) && onComplete) {
        const successfulMoves = progress
          .filter((p) => p.status === "success")
          .map((p) => p.id);
        const failedMoves = progress
          .filter((p) => p.status === "error")
          .map((p) => ({ id: p.id, error: p.error }));
        const cancelledMoves = progress
          .filter((p) => p.status === "cancelled")
          .map((p) => p.id);

        onComplete({
          successful: successfulMoves,
          failed: failedMoves,
          cancelled: cancelledMoves,
          total: originalItemsCount,
          wasCancelled: isCancelled,
          targetOrgId: moveOrg.id,
          targetOrgName: moveOrg.name,
        });
      }
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isMoving) {
      handleClose();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="bg-muted border-border h-4 w-4 animate-pulse rounded-full border-2"></div>
        );
      case "moving":
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
      case "moving":
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

  const handleParentOrgSelect = (organization) => {
    setMoveOrg({
      id: organization.organization_id,
      name: organization.organization_name,
    });
  };

  const successCount = progress.filter((p) => p.status === "success").length;
  const errorCount = progress.filter((p) => p.status === "error").length;
  const cancelledCount = progress.filter(
    (p) => p.status === "cancelled",
  ).length;
  const processedCount = successCount + errorCount + cancelledCount;
  const totalItemsCount = originalItemsCount || domainsArray.length;
  const progressPercentage =
    totalItemsCount > 0 ? (processedCount / totalItemsCount) * 100 : 0;

  if (!isOpen) return null;

  // Single Domain UI - Simplified version
  if (showSingleUI && !hasStarted) {
    const singleDomain = domainsArray[0];
    const domainName =
      singleDomain?.label ||
      singleDomain?.name ||
      singleDomain?.domain ||
      "Domain";

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-left backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-card border-border/50 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border shadow-2xl">
          <div className="border-border/50 from-muted/20 to-muted/10 flex items-center justify-between border-b bg-gradient-to-r p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                <ArrowRightLeft className="text-blue-500" size={20} />
              </div>
              <div>
                <h2 className="text-card-foreground text-xl font-semibold">
                  {title}
                </h2>
                <p className="text-muted-foreground text-left text-sm">
                  Move domain to another organization
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-2 transition-all duration-200"
            >
              <CircleX size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <ArrowRightLeft className="text-blue-500" size={28} />
                </div>
                <p className="text-card-foreground mb-2 text-lg">
                  Move <strong className="text-blue-500">{domainName}</strong>?
                </p>
                <p className="text-muted-foreground text-sm">
                  This will move the domain to the selected organization.
                </p>
              </div>

              {/* Domain Info */}
              <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                    <span className="text-sm font-medium text-blue-500">D</span>
                  </div>
                  <div>
                    <p className="text-card-foreground text-sm font-medium">
                      {domainName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Domain to move
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Selector */}
              <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
                <label className="text-card-foreground mb-3 block text-left text-sm font-medium">
                  Target Organization
                  <span className="text-red-500"> *</span>
                </label>
                <CopyOrganizationSelector
                  selectedOrgId={moveOrg.id}
                  selectedOrgName={moveOrg.name}
                  onSelect={handleParentOrgSelect}
                  placeholder="Select target organization"
                />
                {/* <OrganizationSelectorLocal
                  selectedOrgId={moveOrg.id}
                  selectedOrgName={moveOrg.name}
                  onSelect={handleParentOrgSelect} 
                  placeholder="Select target organization"
                  label=""
                  showLabel={false}
                  excludeOrgId="current"
                /> */}
                <p className="text-muted-foreground mt-2 text-xs">
                  Select the organization where you want to move the domain
                </p>
              </div>
            </div>
          </div>

          <div className="border-border/50 bg-muted/10 flex justify-end gap-3 border-t p-6">
            <TableCancelButton handleClick={handleClose} label="Cancel" />
            <TableMoveButton
              handleClick={handleStartMove}
              label="Move Domain"
              disabled={!moveOrg.id}
            />
          </div>
        </div>
      </div>
    );
  }

  // Single Domain UI - In Progress & Completed States
  if (showSingleUI && hasStarted) {
    const singleDomain = domainsArray[0];
    const domainName =
      singleDomain?.label ||
      singleDomain?.name ||
      singleDomain?.domain ||
      "Domain";
    const currentStatus = progress[0]?.status || "pending";

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-left backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-card border-border/50 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border shadow-2xl">
          <div className="border-border/50 from-muted/20 to-muted/10 flex items-center justify-between border-b bg-gradient-to-r p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                <ArrowRightLeft className="text-blue-500" size={20} />
              </div>
              <div>
                <h2 className="text-card-foreground text-xl font-semibold">
                  {isMoving
                    ? "Moving Domain"
                    : isCancelled
                      ? "Move Cancelled"
                      : "Move Complete"}
                </h2>
                <p className="text-muted-foreground text-left text-sm">
                  {isMoving
                    ? "Moving in progress..."
                    : isCancelled
                      ? "Operation was cancelled"
                      : "Domain move completed"}
                </p>
              </div>
            </div>

            {!isMoving && (
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-2 transition-all duration-200"
              >
                <CircleX size={20} />
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Status Display */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                  {isMoving ? (
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  ) : currentStatus === "success" ? (
                    <CheckCircle className="text-success h-12 w-12" />
                  ) : currentStatus === "error" ? (
                    <XCircle className="text-destructive h-12 w-12" />
                  ) : (
                    <ArrowRightLeft className="text-muted-foreground h-12 w-12" />
                  )}
                </div>

                <h3 className="text-card-foreground mb-2 text-lg font-semibold">
                  {isMoving
                    ? "Moving Domain..."
                    : currentStatus === "success"
                      ? "Move Successful!"
                      : currentStatus === "error"
                        ? "Move Failed"
                        : "Move Cancelled"}
                </h3>

                <p className="text-muted-foreground mb-4 text-sm">
                  <strong className="text-card-foreground">{domainName}</strong>
                </p>

                {isMoving && (
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                )}

                {progress[0]?.error && (
                  <div className="bg-destructive/10 border-destructive/20 mt-4 rounded-lg border p-3">
                    <p className="text-destructive text-left text-sm">
                      {progress[0].error}
                    </p>
                  </div>
                )}
              </div>

              {/* Target Organization Info */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-950/20">
                <p className="text-center text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Target: </span>
                  {moveOrg.name}
                </p>
              </div>

              {/* Action Result */}
              {!isMoving && (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    {currentStatus === "success"
                      ? "The domain has been successfully moved to the target organization."
                      : currentStatus === "error"
                        ? "Failed to move the domain. Please try again."
                        : "The move operation was cancelled."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-border/50 bg-muted/10 flex justify-end gap-3 border-t p-6">
            {isMoving ? (
              <>
                <TableCancelButton
                  handleClick={handleClose}
                  label="Close"
                  disabled={true}
                />
                <TableMoveButton
                  handleClick={handleCancel}
                  label="Cancel Move"
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

  // Original Bulk Move UI (for multiple domains)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-left backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border-border/50 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border shadow-2xl">
        <div className="border-border/50 from-muted/20 to-muted/10 flex items-center justify-between border-b bg-gradient-to-r p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
              <ArrowRightLeft className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className="text-card-foreground text-xl font-semibold">
                {isBulkMove ? "Bulk Move Domains" : title}
              </h2>
              <p className="text-muted-foreground text-left text-sm">
                {!hasStarted
                  ? `${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "s" : ""} selected`
                  : isCancelled
                    ? "Operation cancelled"
                    : isCompleted
                      ? "Operation completed"
                      : "Move in progress..."}
              </p>
            </div>
          </div>

          {!isMoving && (
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-2 transition-all duration-200"
            >
              <CircleX size={20} />
            </button>
          )}
        </div>

        <div className="p-6">
          {!hasStarted ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <ArrowRightLeft className="text-blue-500" size={28} />
                </div>
                <p className="text-card-foreground mb-2 text-lg">
                  {isBulkMove
                    ? `Move ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "s" : ""} to another organization?`
                    : description}
                </p>
                <p className="text-muted-foreground text-sm">
                  {isBulkMove
                    ? `This will move ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "s" : ""} to the selected organization.`
                    : `This will move the domain to the selected organization.`}
                </p>
              </div>

              {/* Organization Selector */}
              <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
                <label className="text-card-foreground mb-3 block text-left text-sm font-medium">
                  Target Organization
                  <span className="text-red-500"> *</span>
                </label>
                <CopyOrganizationSelector
                  selectedOrgId={moveOrg.id}
                  selectedOrgName={moveOrg.name}
                  onSelect={handleParentOrgSelect}
                  placeholder="Select target organization"
                />
                {/* <OrganizationSelectorLocal
                  selectedOrgId={moveOrg.id}
                  selectedOrgName={moveOrg.name}
                  onSelect={handleParentOrgSelect}
                  placeholder="Select target organization"
                  label=""
                  showLabel={false}
                  excludeOrgId="current"
                /> */}
                <p className="text-muted-foreground mt-2 text-xs">
                  Select the organization where you want to move the{" "}
                  {isBulkMove ? "domains" : "domain"}
                </p>
              </div>

              {/* Items List */}
              <div className="bg-muted/30 border-border/50 rounded-lg border">
                <div className="border-border/50 border-b p-4">
                  <h4 className="text-card-foreground flex items-center gap-2 text-sm font-semibold">
                    <ArrowRightLeft size={16} />
                    {isBulkMove ? "Domains to move:" : "Domain to move:"}
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto p-4">
                  <div className="grid gap-0">
                    {domainsArray.map((domain, index) => (
                      <div
                        key={domain.id}
                        className="bg-background/50 border-border/30 flex items-center gap-3 rounded-md border p-2"
                      >
                        <span className="text-muted-foreground bg-muted min-w-[24px] rounded-full px-2 py-1 text-center text-xs">
                          {index + 1}
                        </span>
                        <span className="text-foreground truncate text-sm font-medium">
                          {domain.label ||
                            domain.name ||
                            domain.domain ||
                            `Domain ${domain.id}`}
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
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-card-foreground text-lg font-semibold">
                    {isCancelled
                      ? "Bulk Move Cancelled"
                      : isCompleted
                        ? "Bulk Move Complete"
                        : `Moving ${itemName}${isBulkMove ? "s" : ""}...`}
                  </span>
                  <span className="text-muted-foreground bg-muted rounded-full px-3 py-1 text-sm">
                    {processedCount} / {totalItemsCount}
                  </span>
                </div>

                <div className="relative">
                  <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${isCancelled
                          ? "from-muted-foreground to-muted-foreground/80 bg-gradient-to-r"
                          : "bg-gradient-to-r from-blue-500 to-blue-500/80"
                        }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-foreground/70 text-xs font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>

                {/* Target Organization Info */}
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/30 dark:bg-blue-950/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Target Organization:</span>{" "}
                    {moveOrg.name}
                  </p>
                </div>
              </div>

              {/* Progress List */}
              <div className="bg-muted/20 border-border/50 overflow-hidden rounded-lg border">
                <div className="max-h-64 overflow-y-auto">
                  <div className="divide-border/30 divide-y">
                    {progress.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-4 transition-all duration-200 ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        <span className="flex-1 truncate text-sm font-medium">
                          {item.label}
                        </span>
                        {item.status === "cancelled" && (
                          <span className="text-muted-foreground bg-muted/20 rounded-md px-2 py-1 text-xs">
                            Cancelled
                          </span>
                        )}
                        {item.error && (
                          <span className="text-destructive bg-destructive/10 line-clamp-2 max-w-[300px] rounded-md px-2 py-1 text-xs">
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
                <div className="from-muted/30 to-muted/20 border-border/50 rounded-lg border bg-gradient-to-r p-4">
                  <div className="mb-4 text-center">
                    <h3 className="text-card-foreground mb-2 text-lg font-semibold">
                      {isCancelled
                        ? "Operation Cancelled"
                        : "Operation Complete!"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {isCancelled
                        ? "The bulk move operation was cancelled. Here's what was completed:"
                        : "The bulk move operation has finished. Here's a summary:"}
                    </p>
                  </div>

                  <div
                    className={`mb-4 grid gap-4 ${cancelledCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}
                  >
                    <div className="bg-success/10 border-success/20 rounded-lg border p-3 text-center">
                      <div className="mb-1 flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="text-success" />
                        <span className="text-success text-lg font-bold">
                          {successCount}
                        </span>
                      </div>
                      <p className="text-success text-xs font-medium">
                        Successfully Moved
                      </p>
                    </div>

                    <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3 text-center">
                      <div className="mb-1 flex items-center justify-center gap-2">
                        <XCircle size={16} className="text-destructive" />
                        <span className="text-destructive text-lg font-bold">
                          {errorCount}
                        </span>
                      </div>
                      <p className="text-destructive text-xs font-medium">
                        Failed to Move
                      </p>
                    </div>

                    {cancelledCount > 0 && (
                      <div className="bg-muted/30 border-muted/50 rounded-lg border p-3 text-center">
                        <div className="mb-1 flex items-center justify-center gap-2">
                          <X size={16} className="text-muted-foreground" />
                          <span className="text-muted-foreground text-lg font-bold">
                            {cancelledCount}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs font-medium">
                          Cancelled
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-border/30 border-t pt-2 text-center">
                    <p className="text-muted-foreground text-sm">
                      Total items processed:{" "}
                      <span className="text-foreground font-semibold">
                        {processedCount}
                      </span>{" "}
                      /{" "}
                      <span className="text-foreground font-semibold">
                        {totalItemsCount}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      Target:{" "}
                      <span className="font-semibold">{moveOrg.name}</span>
                    </p>
                    {(errorCount > 0 || cancelledCount > 0) && (
                      <p className="text-muted-foreground mt-1 text-xs">
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

        <div className="border-border/50 bg-muted/10 flex justify-end gap-3 border-t p-6">
          {!hasStarted ? (
            <>
              <TableCancelButton handleClick={handleClose} label="Cancel" />
              <TableMoveButton
                handleClick={handleStartMove}
                label={
                  isBulkMove
                    ? `Move ${totalItemsCount} ${itemName}${totalItemsCount !== 1 ? "s" : ""}`
                    : `Move ${itemName}`
                }
                disabled={!moveOrg.id}
              />
            </>
          ) : isMoving ? (
            <>
              <TableCancelButton
                handleClick={handleClose}
                label="Close"
                disabled={true}
              />
              <TableMoveButton
                handleClick={handleCancel}
                label="Cancel Move"
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

export default MoveDomain;
