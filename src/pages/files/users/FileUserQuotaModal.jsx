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

import { useAtomValue } from "jotai";
import { parentOrgAtom } from "@/store/userInfo";
import { useState, useEffect } from "react";
import EditModelBox from "@/components/common/EditModelBox";
import { Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Buttons";
import { Slider } from "@/components/common/Slider";

const FileUserQuotaModal = ({
  isOpen,
  handleCancel,
  spaceValue,
  setSpaceValue,
  isUpdating,
  onUpdate,
  fileUserData,
}) => {
  const parentOrg = useAtomValue(parentOrgAtom);
  const [validationError, setValidationError] = useState("");

  const safeUserData = fileUserData || {};

  // Organization space (assumed to be in GB)
  const orgAvailableSpace = parentOrg?.available_size || 0;

  // Current user allocation (in GB)
  const currentAllocation = parseFloat(safeUserData.quota_allocated) || 0;
  const currentUtilized = parseFloat(safeUserData.quota_utilized) || 0;

  // Min/Max calculations — the user's own current allocation is already
  // counted against org availability, so it needs to be added back to get
  // the true ceiling for this edit.
  const minValue = currentUtilized || 0;
  const maxValue = orgAvailableSpace + currentAllocation;

  useEffect(() => {
    const numValue = parseFloat(spaceValue) || 0;

    if (numValue < minValue) {
      setValidationError(`Minimum is ${minValue} GB (currently in use)`);
    } else if (numValue > maxValue) {
      setValidationError(`Maximum is ${maxValue.toFixed(2)} GB (organization limit)`);
    } else {
      setValidationError("");
    }
  }, [spaceValue, minValue, maxValue]);

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
  const allocationChange = currentValue - currentAllocation;

  return (
    isOpen && (
      <EditModelBox
        isOpen={isOpen}
        label="File User Quota Allocation"
        handleCancel={handleCancel}
        outsideClick={false}
      >
        <div className="w-xl text-left space-y-4 mt-4">
          {/* Context Header */}
          <div className="bg-accent/20 p-3 rounded-lg border">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  File User: {safeUserData.email || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set storage allocation between {minValue} GB (in use) and{" "}
                  {maxValue.toFixed(2)} GB (available)
                </p>
              </div>
            </div>
          </div>

          {/* Organization & User Overview */}
          <div className="grid grid-cols-2 gap-3">
            {/* Organization Space */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Organization
              </h4>
              <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-semibold text-success">
                    {orgAvailableSpace.toFixed(2)} GB
                  </span>
                </div>
              </div>
            </div>

            {/* Current User */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Current User
              </h4>
              <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium">{currentAllocation} GB</span>
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
                    {(currentAllocation - currentUtilized).toFixed(2)} GB
                  </span>
                </div>
              </div>
            </div>
          </div>

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
              disabled={isUpdating}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Min: <span className="font-medium text-destructive">{minValue} GB</span>
              </span>
              <span>
                Max: <span className="font-medium text-success">{maxValue.toFixed(2)} GB</span>
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
              disabled={isUpdating}
              onClick={handleCancel}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdating || !isValidInput}
              onClick={onUpdate}
              variant="primary"
              size="md"
              loading={isUpdating}
            >
              Update Allocation
            </Button>
          </div>
        </div>
      </EditModelBox>
    )
  );
};

export default FileUserQuotaModal;
