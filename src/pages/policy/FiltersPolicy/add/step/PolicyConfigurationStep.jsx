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

import { Input, Checkbox } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import InfoBox from "@/components/common/InfoBox";
import FiltersListEditor from "../FilterListEditor";
import { CheckCircle, Ban, AlertCircle } from "lucide-react";

const PolicyConfigurationStep = ({
  register,
  errors,
  control,
  watch,
  domain_name,
  whiteEntries,
  setWhiteEntries,
  blackEntries,
  setBlackEntries,
}) => {
  const listError =
    errors.white_entries?.message || errors.black_entries?.message;
  return (
    <div className="space-y-8 text-left">
      {/* --- Section 1: Policy Details --- */}
      <div className="space-y-6">
        <div className="text-left">
          <h3 className="text-foreground text-lg font-semibold">
            Policy Configuration
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure the policy name and status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {/* Domain Display */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Domain:</span>
              <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-3 py-1 text-sm font-medium">
                {domain_name}
              </span>
            </div>

            {/* Policy Name Input */}
            <Input
              label="Policy Name"
              name="policy_name"
              placeholder="Enter policy name"
              register={register}
              errors={errors}
              isRequired
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="">
            <Switch
              control={control}
              name="is_active"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="Inactive"
              falseSublabel="Policy is disabled"
              trueLabel="Active"
              trueSublabel="Policy is enabled"
            />
          </div>
          {/* <div className="space-y-2">
            <Checkbox
              label="Delete Mails"
              name="delete_mails"
              register={register}
              errors={errors}
            />
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 mt-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Enabling this option will permanently delete emails matching the blocked list. This action cannot be undone.
              </span>
            </div>
          </div> */}
        </div>
      </div>

      <hr className="border-border" />

      {/* --- Section 2: Lists Management --- */}
      <div className="space-y-6">
        <div className="text-left">
          <h3 className="text-foreground text-base font-semibold">
            Access Control Lists
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage Allow and Block lists. You can add both email addresses
            (e.g., user@example.com) and domains (e.g., example.com).
          </p>
        </div>

        {/* Global Conflict Error Message from Form */}
        {listError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{listError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Allowed List (White Entries) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <h4 className="font-semibold text-sm">
                Allowed List (White Entries)
              </h4>
            </div>
            <fieldset className="border-border/60 rounded-md border p-4 bg-success/5">
              <FiltersListEditor
                list={whiteEntries}
                setList={setWhiteEntries}
                placeholder="Add allowed email or domain..."
              />
            </fieldset>
            <p className="text-xs text-muted-foreground px-1">
              Emails or domains added here will be permitted.
            </p>
          </div>

          {/* Blocked List (Black Entries) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              <h4 className="font-semibold text-sm">
                Blocked List (Black Entries)
              </h4>
            </div>
            <fieldset className="border-border/60 rounded-md border p-4 bg-destructive/5">
              <FiltersListEditor
                list={blackEntries}
                setList={setBlackEntries}
                placeholder="Add blocked email or domain..."
              />
            </fieldset>
            <p className="text-xs text-muted-foreground px-1">
              Emails or domains added here will be denied.
            </p>
          </div>
        </div>

        <InfoBox
          title="Validation Rules"
          description="A specific email cannot be allowed if its domain is blocked. Conversely, a domain cannot be allowed if a specific email from it is blocked. Ensure lists do not conflict."
        />
      </div>
    </div>
  );
};

export default PolicyConfigurationStep;
