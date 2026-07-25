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
import { AlertTriangle, Info } from "lucide-react";
import EditModelBox from "@/components/common/EditModelBox";
import { Button } from "@/components/common/Buttons";
import { Slider } from "@/components/common/Slider";
import { useToastify } from "@/hooks/useToastify";

const BUFFER_GB = 0.1; // Buffer space in GB

const SpaceAllocationModal = ({
  isOpen = false,
  organization,
  parentAvailableSpace = 0,
  onClose = () => {},
  onConfirm = () => {},
  isLoading = false,
}) => {
  const toast = useToastify();
  const [spaceValue, setSpaceValue] = useState("");
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  // Calculate space metrics
  const currentUtilized = organization?.quota_utilized || 0;
  const currentAllocated = organization?.quota_allocated || 0;
  const freeSpaceInCurrent = Math.max(0, currentAllocated - currentUtilized);
  const maxAvailableSpace = parseFloat(
    (parentAvailableSpace + currentAllocated).toFixed(2)
  );
  const recommendedMax = Math.max(0, maxAvailableSpace - BUFFER_GB);

  // Min/Max calculations
  const minValue = currentUtilized;
  const maxValue = maxAvailableSpace;

  useEffect(() => {
    if (isOpen && organization) {
      setSpaceValue(currentAllocated.toString());
      setError("");
      setShowWarning(false);
    }
  }, [isOpen, organization, currentAllocated]);

  const validateInput = (value) => {
    const numValue = parseFloat(value);

    if (!value || isNaN(numValue) || numValue < 0) {
      return "Please enter a valid number";
    }

    if (value.includes(".") && value.split(".")[1]?.length > 2) {
      return "Maximum 2 decimal places allowed";
    }

    if (numValue < currentUtilized) {
      return `Minimum is ${currentUtilized} GB (currently in use)`;
    }

    if (numValue > maxAvailableSpace) {
      return `Maximum is ${maxAvailableSpace} GB (parent limit)`;
    }

    return "";
  };

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value).toFixed(2);
    setSpaceValue(value);
    
    const validationError = validateInput(value);
    setError(validationError);

    if (!validationError) {
      const numValue = parseFloat(value);
      setShowWarning(numValue > recommendedMax && recommendedMax > 0);
    } else {
      setShowWarning(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSpaceValue(value);

    const validationError = validateInput(value);
    setError(validationError);

    if (!validationError) {
      const numValue = parseFloat(value);
      setShowWarning(numValue > recommendedMax && recommendedMax > 0);
    } else {
      setShowWarning(false);
    }
  };

  const handleQuickSet = (percentage) => {
    const quickValue =
      Math.floor(maxAvailableSpace * (percentage / 100) * 100) / 100;
    const finalValue = Math.max(currentUtilized, quickValue);
    setSpaceValue(finalValue.toFixed(2));
    setError("");
    setShowWarning(finalValue > recommendedMax && recommendedMax > 0);
  };

  const handleSubmit = () => {
    const validationError = validateInput(spaceValue);

    if (validationError) {
      setError(validationError);
      return;
    }

    const newAllocation = parseFloat(spaceValue);

    // Show confirmation for allocations that exceed recommended limit
    if (showWarning) {
      const confirmed = window.confirm(
        `This allocation (${newAllocation} GB) exceeds the recommended limit (${recommendedMax} GB) and leaves less than ${BUFFER_GB} GB buffer space. Continue?`
      );
      if (!confirmed) return;
    }

    onConfirm({
      organization_id: organization.organization_id,
      space: newAllocation,
    });
  };

  if (!isOpen || !organization) return null;

  const currentValue = parseFloat(spaceValue) || 0;
  const allocationChange = currentValue - currentAllocated;
  const availableAfterAllocation = currentValue - currentUtilized;
  const utilizationPercent = (currentUtilized / (currentValue || 1)) * 100;

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Storage Space Allocation"
      handleCancel={onClose}
      outsideClick={false}
    >
      <div className="w-xl text-left space-y-4 mt-4">
        {/* Context Header */}
        <div className="bg-accent/20 p-3 rounded-lg border">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                Organization: {organization.organization_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set storage allocation between {minValue} GB (in use) and{" "}
                {maxValue.toFixed(2)} GB (available)
              </p>
            </div>
          </div>
        </div>

        {/* Parent & Organization Overview */}
        <div className="grid grid-cols-2 gap-3">
          {/* Parent Space */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              Parent Available
            </h4>
            <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-success">
                  {parentAvailableSpace.toFixed(2)} GB
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t">
                <span className="text-muted-foreground">Max Allocatable</span>
                <span className="font-medium">{maxValue.toFixed(2)} GB</span>
              </div>
            </div>
          </div>

          {/* Current Organization */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              Current Organization
            </h4>
            <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Allocated</span>
                <span className="font-medium">{currentAllocated} GB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">In Use</span>
                <span className="font-medium text-destructive">
                  {currentUtilized} GB
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t">
                <span className="text-muted-foreground">Free</span>
                <span className="font-semibold">
                  {freeSpaceInCurrent.toFixed(2)} GB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buffer Warning */}
        {BUFFER_GB > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-2.5 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Recommended to keep{" "}
                <span className="font-medium text-foreground">{BUFFER_GB} GB</span>{" "}
                buffer space
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
                disabled={isLoading}
                className={`w-28 px-3 py-1.5 text-sm text-right border rounded focus:outline-none focus:ring-2 transition-colors ${
                  error
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
            disabled={isLoading}
          />

          {/* Quick Set Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-muted-foreground">Quick:</span>
            {[25, 50, 75, 90].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handleQuickSet(percentage)}
                disabled={isLoading}
                className="px-2 py-1 border rounded hover:bg-accent hover:border-primary transition-colors disabled:opacity-50"
              >
                {percentage}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSpaceValue(currentUtilized.toFixed(2));
                setError("");
                setShowWarning(false);
              }}
              disabled={isLoading}
              className="px-2 py-1 border rounded hover:bg-accent hover:border-primary transition-colors disabled:opacity-50"
            >
              Min
            </button>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Min: <span className="font-medium text-destructive">{minValue} GB</span>
            </span>
            <span>
              Recommended:{" "}
              <span className="font-medium text-warning">
                {recommendedMax.toFixed(2)} GB
              </span>
            </span>
            <span>
              Max: <span className="font-medium text-success">{maxValue.toFixed(2)} GB</span>
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {showWarning && (
            <div className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                This allocation leaves less than {BUFFER_GB} GB buffer. Recommended:{" "}
                {recommendedMax.toFixed(2)} GB or less.
              </span>
            </div>
          )}
        </div>

       

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t m-1">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={!!error || !spaceValue || isLoading}
          >
            Update Allocation
          </Button>
        </div>
      </div>
    </EditModelBox>
  );
};

export default SpaceAllocationModal;