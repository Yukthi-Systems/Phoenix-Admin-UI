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
import {
  LOG_SLIDER_MAX,
  LOG_SLIDER_RESOLUTION,
  identitiesToLogPosition,
  logPositionToIdentities,
  ABSOLUTE_IDENTITY_PRESETS,
} from "@/utils/identityAllocationScale";

const QUICK_SET_PERCENTAGES = [25, 50, 75, 90];

const IdentityAllocationModal = ({
  isOpen = false,
  organization,
  parentAvailableIdentities = 0,
  onClose = () => {},
  onConfirm = () => {},
  isLoading = false,
}) => {
  const [identityValue, setIdentityValue] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [error, setError] = useState("");

  const currentUtilized = organization?.utilized_email_identities || 0;
  const currentAllocated = organization?.allocated_email_identities ?? 0;
  const isCurrentlyUnlimited = currentAllocated === -1;
  const parentIsUnlimited = parentAvailableIdentities === -1;

  const maxAvailableIdentities = parentIsUnlimited
    ? Infinity
    : parentAvailableIdentities + (isCurrentlyUnlimited ? 0 : currentAllocated);

  const minValue = currentUtilized;
  const maxValue = maxAvailableIdentities;

  useEffect(() => {
    if (isOpen && organization) {
      setIsUnlimited(isCurrentlyUnlimited);
      setIdentityValue(
        isCurrentlyUnlimited ? currentUtilized.toString() : currentAllocated.toString(),
      );
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, organization]);

  const validateInput = (value) => {
    const numValue = parseInt(value, 10);

    if (!value || isNaN(numValue) || numValue < 0) {
      return "Please enter a valid whole number";
    }

    if (!Number.isInteger(Number(value))) {
      return "Email identities must be a whole number";
    }

    if (numValue < currentUtilized) {
      return `Minimum is ${currentUtilized} (currently in use)`;
    }

    if (Number.isFinite(maxAvailableIdentities) && numValue > maxAvailableIdentities) {
      return `Maximum is ${maxAvailableIdentities} (parent limit)`;
    }

    return "";
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setIdentityValue(value);
    setError(validateInput(value));
  };

  const handleLogSliderChange = (e) => {
    const value = Math.max(
      minValue,
      logPositionToIdentities(Number(e.target.value)),
    ).toString();
    setIdentityValue(value);
    setError(validateInput(value));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIdentityValue(value);
    setError(validateInput(value));
  };

  const handleQuickSet = (percentage) => {
    if (!Number.isFinite(maxAvailableIdentities)) return;
    const quickValue = Math.floor(maxAvailableIdentities * (percentage / 100));
    const finalValue = Math.max(currentUtilized, quickValue);
    setIdentityValue(finalValue.toString());
    setError("");
  };

  const handlePresetSet = (value) => {
    const finalValue = Math.max(currentUtilized, value);
    setIdentityValue(finalValue.toString());
    setError(validateInput(finalValue.toString()));
  };

  const handleUnlimitedToggle = (checked) => {
    setIsUnlimited(checked);
    if (!checked) {
      const fallback = Number.isFinite(maxAvailableIdentities)
        ? Math.max(currentUtilized, maxAvailableIdentities)
        : currentUtilized;
      setIdentityValue(fallback.toString());
      setError(validateInput(fallback.toString()));
    } else {
      setError("");
    }
  };

  const handleSubmit = () => {
    if (isUnlimited) {
      onConfirm({
        organization_id: organization.organization_id,
        quota: -1,
      });
      return;
    }

    const validationError = validateInput(identityValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm({
      organization_id: organization.organization_id,
      quota: parseInt(identityValue, 10),
    });
  };

  if (!isOpen || !organization) return null;

  const currentValue = parseInt(identityValue, 10) || 0;
  const allocationChange = isCurrentlyUnlimited ? 0 : currentValue - currentAllocated;

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Email Identity Allocation"
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
                {parentIsUnlimited
                  ? `Parent organization has unlimited email identities. Set at least ${minValue} (in use).`
                  : `Set email identities between ${minValue} (in use) and ${Number.isFinite(maxValue) ? maxValue : "—"} (available)`}
              </p>
            </div>
          </div>
        </div>

        {/* Parent & Organization Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              Parent Available
            </h4>
            <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-success">
                  {parentIsUnlimited ? "Unlimited" : parentAvailableIdentities}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t">
                <span className="text-muted-foreground">Max Allocatable</span>
                <span className="font-medium">
                  {Number.isFinite(maxValue) ? maxValue : "Unlimited"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              Current Organization
            </h4>
            <div className="bg-muted/30 p-2.5 rounded border space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Allocated</span>
                <span className="font-medium">
                  {isCurrentlyUnlimited ? "Unlimited" : currentAllocated}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">In Use</span>
                <span className="font-medium text-destructive">
                  {currentUtilized}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unlimited toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Unlimited Email Identities</p>
            <p className="text-xs text-muted-foreground">
              {parentIsUnlimited
                ? "Allow this organization to create unlimited email identities"
                : "Unavailable: parent organization does not have unlimited email identities"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isUnlimited}
              disabled={!parentIsUnlimited || isLoading}
              onChange={(e) => handleUnlimitedToggle(e.target.checked)}
            />
            <div
              className={`relative w-11 h-6 bg-muted border border-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px]
                after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-primary transition-colors duration-200
                ${!parentIsUnlimited || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            ></div>
          </label>
        </div>

        {/* Allocation Control */}
        {!isUnlimited && (
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
                    {allocationChange}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={minValue}
                max={Number.isFinite(maxValue) ? maxValue : undefined}
                step={1}
                value={identityValue}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-28 px-3 py-1.5 text-sm text-right border rounded focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>

            {Number.isFinite(maxValue) ? (
              <Slider
                min={minValue}
                max={maxValue}
                step={1}
                value={parseInt(identityValue, 10) || minValue}
                onChange={handleSliderChange}
                disabled={isLoading}
              />
            ) : (
              <div>
                <Slider
                  min={0}
                  max={LOG_SLIDER_RESOLUTION}
                  step={1}
                  value={identitiesToLogPosition(parseInt(identityValue, 10) || minValue)}
                  onChange={handleLogSliderChange}
                  disabled={isLoading}
                />
                <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                  <span>{minValue}</span>
                  <span>No fixed cap from parent — drag across scale</span>
                  <span>{LOG_SLIDER_MAX.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground">Quick:</span>
              {Number.isFinite(maxAvailableIdentities)
                ? QUICK_SET_PERCENTAGES.map((percentage) => (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => handleQuickSet(percentage)}
                      disabled={isLoading}
                      className="px-2 py-1 border rounded hover:bg-accent hover:border-primary transition-colors disabled:opacity-50"
                    >
                      {percentage}%
                    </button>
                  ))
                : ABSOLUTE_IDENTITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSet(preset)}
                      disabled={isLoading}
                      className="px-2 py-1 border rounded hover:bg-accent hover:border-primary transition-colors disabled:opacity-50"
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
              <button
                type="button"
                onClick={() => {
                  setIdentityValue(currentUtilized.toString());
                  setError("");
                }}
                disabled={isLoading}
                className="px-2 py-1 border rounded hover:bg-accent hover:border-primary transition-colors disabled:opacity-50"
              >
                Min
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t m-1">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={(!isUnlimited && (!!error || !identityValue)) || isLoading}
          >
            Update Allocation
          </Button>
        </div>
      </div>
    </EditModelBox>
  );
};

export default IdentityAllocationModal;
