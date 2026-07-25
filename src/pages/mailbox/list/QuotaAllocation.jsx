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

import { useState, useEffect } from "react";
import EditModelBox from "@/components/common/EditModelBox";
import { Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Buttons";
import { Slider } from "@/components/common/Slider";

const MailboxQuotaAllocationModal = ({
  showSpaceModal,
  handleSpaceClose,
  spaceValue,
  setSpaceValue,
  spaceLoad,
  OnSpaceChange,
  mailData,
  domainData,
  buffer = 0,
}) => {
  const [validationError, setValidationError] = useState("");

  const safeDomainData = domainData || {};
  const safeMailData = mailData || {};

  // Domain data (assumed to be in GB)
  const domainAllocatedSpace = safeDomainData.quota_allocated || 0;
  const domainUtilizedSpace = safeDomainData.quota_utilized || 0;
  const domainAvailableSpace = domainAllocatedSpace - domainUtilizedSpace;

  // Mailbox allocation (in GB)
  const currentMailboxAllocation =
    parseFloat(safeMailData.quota_allocated) || 0;

  // Convert bytes to GB precisely (1 GB = 1073741824 bytes)
  const BYTES_PER_GB = 1073741824;
  const utilizedBytes = parseFloat(safeMailData.quota_utilized_bytes) || 0;
  const currentUtilizedSpace = utilizedBytes / BYTES_PER_GB;

  // Min/Max calculations
  const minValue = currentUtilizedSpace + buffer;

  const maxAllocatableInDomain =
    domainAllocatedSpace - domainUtilizedSpace + currentMailboxAllocation;
  const maxValue = maxAllocatableInDomain - buffer;

  useEffect(() => {
    const numValue = parseFloat(spaceValue) || 0;
    const formattedMinValue = Math.max(0, minValue).toFixed(3);
    const formattedMaxValue = Math.max(0, maxValue).toFixed(2);

    if (numValue < minValue) {
      const minMessage =
        buffer > 0
          ? `Minimum is ${formattedMinValue} GB (utilized ${currentUtilizedSpace.toFixed(3)} GB + ${buffer} GB buffer)`
          : `Minimum is ${formattedMinValue} GB (currently in use)`;
      setValidationError(minMessage);
    } else if (numValue > maxValue) {
      const maxMessage =
        buffer > 0
          ? `Maximum is ${formattedMaxValue} GB (organization limit - ${buffer} GB buffer)`
          : `Maximum is ${formattedMaxValue} GB (organization limit)`;
      setValidationError(maxMessage);
    } else {
      setValidationError("");
    }
  }, [spaceValue, minValue, maxValue, buffer, currentUtilizedSpace]);

  const handleSliderChange = (e) => {
    setSpaceValue(parseFloat(e.target.value).toFixed(2));
  };

  const handleInputChange = (e) => {
    setSpaceValue(e.target.value);
  };

  const isValidInput =
    !validationError &&
    parseFloat(spaceValue) >= minValue &&
    parseFloat(spaceValue) <= maxValue;

  const currentValue = parseFloat(spaceValue) || 0;
  const allocationChange = currentValue - currentMailboxAllocation;
  const availableAfterAllocation = Math.max(
    currentValue - currentUtilizedSpace - buffer,
    0
  );
  const utilizationPercent = (currentUtilizedSpace / (currentValue || 1)) * 100;
  const bufferPercent = (buffer / (currentValue || 1)) * 100;

  // Helper function to format storage display
  const formatStorage = (gb) => {
    if (gb < 0.001) {
      // Show in MB if very small
      return `${(gb * 1024).toFixed(2)} MB`;
    }
    return `${gb.toFixed(3)} GB`;
  };

  return (
    showSpaceModal && (
      <EditModelBox
        isOpen={showSpaceModal}
        label="Mailbox Quota Allocation"
        handleCancel={handleSpaceClose}
        outsideClick={false}
      >
        <div className="w-xl text-left space-y-4 mt-4">
          {/* Context Header */}
          <div className="bg-accent/20 p-3 rounded-lg border">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Mailbox: {safeMailData.email || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set storage allocation between {formatStorage(Math.max(0, minValue))}{" "}
                  {buffer > 0 && "(with buffer)"} and{" "}
                  {Math.max(0, maxValue).toFixed(2)} GB (available)
                </p>
              </div>
            </div>
          </div>

          {/* Domain & Mailbox Overview */}
          <div className="grid grid-cols-2 gap-3">
            {/* Domain Space */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Organization ({safeDomainData.organization_name || "N/A"})
              </h4>
              <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{domainAllocatedSpace} GB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">{domainUtilizedSpace} GB</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-semibold text-success">
                    {domainAvailableSpace.toFixed(2)} GB
                  </span>
                </div>
              </div>
            </div>

            {/* Current Mailbox */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Current Mailbox
              </h4>
              <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium">
                    {currentMailboxAllocation} GB
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">In Use</span>
                  <span className="font-medium text-destructive">
                    {formatStorage(currentUtilizedSpace)}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground">Free</span>
                  <span className="font-semibold">
                    {(currentMailboxAllocation - currentUtilizedSpace).toFixed(3)}{" "}
                    GB
                  </span>
                </div>
              </div>
            </div>
          </div>

         

          {/* Buffer Notice */}
          {buffer > 0 && (
            <div className="bg-warning/10 p-2.5 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-warning flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  A buffer of <span className="font-medium text-warning">{buffer} GB</span> is
                  maintained for optimal performance
                </p>
              </div>
            </div>
          )}

          {/* Allocation Control */}
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium block">
                  New Allocation
                </label>
                {allocationChange !== 0 && (
                  <span
                    className={`text-xs ${
                      allocationChange > 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {allocationChange > 0 ? "+" : ""}
                    {allocationChange.toFixed(2)} GB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={minValue}
                  max={maxValue}
                  step="0.01"
                  value={spaceValue}
                  onChange={handleInputChange}
                  className={`w-28 px-3 py-1.5 text-sm text-right border rounded focus:outline-none focus:ring-2 transition-colors ${
                    validationError
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
                <span className="text-sm font-medium text-muted-foreground">GB</span>
              </div>
            </div>

            <Slider
              min={minValue}
              max={maxValue}
              step={0.01}
              value={parseFloat(spaceValue) || minValue}
              onChange={handleSliderChange}
              disabled={spaceLoad}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Min:{" "}
                <span className="font-medium text-destructive">
                  {formatStorage(Math.max(0, minValue))}
                </span>
              </span>
              <span>
                Max:{" "}
                <span className="font-medium text-success">
                  {Math.max(0, maxValue).toFixed(2)} GB
                </span>
              </span>
            </div>

            {validationError && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

        

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-2 border-t m-1">
            <Button
              disabled={spaceLoad}
              onClick={handleSpaceClose}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
            <Button
              disabled={spaceLoad || !isValidInput}
              onClick={OnSpaceChange}
              variant="primary"
              size="md"
              loading={spaceLoad}
            >
              Update Allocation
            </Button>
          </div>
        </div>
      </EditModelBox>
    )
  );
};

export default MailboxQuotaAllocationModal;