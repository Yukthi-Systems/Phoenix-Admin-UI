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

import { Infinity as InfinityIcon, Info, Mail } from "lucide-react";
import { Slider } from "@/components/common/Slider";
import {
  LOG_SLIDER_MAX,
  LOG_SLIDER_RESOLUTION,
  identitiesToLogPosition,
  logPositionToIdentities,
  ABSOLUTE_IDENTITY_PRESETS as ABSOLUTE_PRESETS,
} from "@/utils/identityAllocationScale";

const PERCENTAGE_PRESETS = [25, 50, 75, 90, 100];

const EmailIdentitiesField = ({ watch, setValue, errors, parentOrg }) => {
  const rawValue = watch("allocated_email_identities");
  const numericValue = Number(rawValue) || 0;
  const isUnlimited = numericValue === -1;

  const parentUnlimited = parentOrg?.identitiesAllocated === -1;
  const parentAvailable = parentUnlimited
    ? Infinity
    : parentOrg?.identitiesAllocated != null
      ? Math.max(
          0,
          Number(parentOrg.identitiesAllocated) -
            Number(parentOrg.identitiesUtilized || 0),
        )
      : 1000000;

  const isBounded = Number.isFinite(parentAvailable) && parentAvailable > 0;
  const limitedValue = isUnlimited ? 1 : Math.max(1, numericValue);
  const usagePercent = isBounded
    ? Math.min(100, Math.round((limitedValue / parentAvailable) * 100))
    : 0;

  const commit = (value) =>
    setValue("allocated_email_identities", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

  const handleModeChange = (mode) => {
    if (mode === "unlimited") {
      commit(-1);
    } else {
      commit(isBounded ? Math.min(100, Math.max(1, parentAvailable)) : 100);
    }
  };

  const handleBoundedSliderChange = (e) => {
    commit(Number(e.target.value));
  };

  const handleLogSliderChange = (e) => {
    commit(logPositionToIdentities(Number(e.target.value)));
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      commit("");
      return;
    }
    commit(parseInt(value, 10) || 0);
  };

  const handlePresetClick = (value) => commit(value);

  const error = errors?.allocated_email_identities;

  return (
    <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground px-2 text-left text-base font-medium">
        Email Identities Allocation
        <span className="text-red-500"> *</span>
      </legend>
      <p className="text-muted-foreground mb-5 text-left text-sm">
        Choose how many email identities (mailboxes) this organization is
        allowed to create.
      </p>

      {/* Mode toggle */}
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-muted/50 border-border inline-flex items-center rounded-full border p-1">
          <button
            type="button"
            onClick={() => handleModeChange("limited")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !isUnlimited
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Limited
          </button>
          <button
            type="button"
            disabled={!parentUnlimited}
            title={
              !parentUnlimited
                ? "Unavailable: parent organization does not have unlimited email identities"
                : undefined
            }
            onClick={() => handleModeChange("unlimited")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              isUnlimited
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            } ${!parentUnlimited ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <InfinityIcon className="h-3.5 w-3.5" />
            Unlimited
          </button>
        </div>
        <span className="text-muted-foreground text-xs">
          {isUnlimited
            ? "No cap on identities"
            : !parentUnlimited
              ? "Unlimited requires an unlimited parent"
              : "Set a fixed identity count"}
        </span>
      </div>

      {isUnlimited ? (
        <div className="border-primary/20 bg-primary/5 flex items-center gap-3 rounded-lg border p-4">
          <InfinityIcon className="text-primary h-6 w-6 flex-shrink-0" />
          <p className="text-foreground text-sm">
            This organization will be able to create an{" "}
            <span className="font-semibold">unlimited</span> number of email
            identities, inherited from its unlimited parent organization.
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
          {/* Big value + stat row */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-left text-xs font-medium uppercase">
                Allocating
              </p>
              <p className="text-primary text-3xl font-bold leading-tight">
                {numericValue > 0 ? numericValue.toLocaleString() : "0"}
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  identities
                </span>
              </p>
            </div>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="0"
              value={rawValue === -1 ? "" : rawValue ?? ""}
              onChange={handleNumberChange}
              className={`w-32 rounded-md border bg-card p-2 text-right text-sm text-card-foreground transition-colors focus:border-primary focus:outline-none focus:ring-0 ${
                error ? "border-destructive" : "border-border"
              }`}
            />
          </div>

          {/* Slider */}
          <div>
            {isBounded ? (
              <Slider
                min={1}
                max={parentAvailable}
                step={1}
                value={Math.min(limitedValue, parentAvailable)}
                onChange={handleBoundedSliderChange}
              />
            ) : (
              <Slider
                min={0}
                max={LOG_SLIDER_RESOLUTION}
                step={1}
                value={identitiesToLogPosition(limitedValue)}
                onChange={handleLogSliderChange}
              />
            )}
            <div className="text-muted-foreground mt-1 flex justify-between text-xs">
              <span>1</span>
              <span>
                {isBounded
                  ? `${usagePercent}% of ${parentAvailable.toLocaleString()} available`
                  : "No fixed cap from parent — drag across scale"}
              </span>
              <span>
                {isBounded
                  ? parentAvailable.toLocaleString()
                  : LOG_SLIDER_MAX.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick-set presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">Quick set:</span>
            {isBounded
              ? PERCENTAGE_PRESETS.map((percentage) => (
                  <button
                    key={percentage}
                    type="button"
                    onClick={() =>
                      handlePresetClick(
                        Math.max(1, Math.floor(parentAvailable * (percentage / 100))),
                      )
                    }
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-accent"
                  >
                    {percentage}%
                  </button>
                ))
              : ABSOLUTE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-accent"
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-destructive mt-2 text-left text-sm">
          {error.message}
        </p>
      )}
      {!error && (
        <p className="text-muted-foreground mt-2 flex items-center gap-1 text-left text-sm">
          <Info className="h-4 w-4 flex-shrink-0" />
          {parentUnlimited
            ? "Parent organization has unlimited email identities"
            : `${parentAvailable.toLocaleString()} email identities available from parent organization`}
        </p>
      )}
    </fieldset>
  );
};

export default EmailIdentitiesField;
