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

// src/pages/server/mailboxSync/add/steps/ConfigurationStep.jsx
import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Input, PasswordInput } from "@/components/common/Inputs";
import InfoBox from "@/components/common/InfoBox";
import DateTimeRangePicker from "@/components/common/DateRangePicker"; // Adjusted import based on your snippet

const JobConfigurationStep = ({
  register,
  errors,
  domain_name,
  setValue,
  watch,
  control,
}) => {
  // Set the domain automatically
  useEffect(() => {
    if (domain_name) {
      setValue("to_email_domain", domain_name);
    }
  }, [domain_name, setValue]);

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          IMAP Sync Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure the external IMAP source, local destination, and sync
          period.
        </p>
      </div>

      {/* External Source Configuration */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground text-left text-base font-medium px-2">
          External Source (From)
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="IMAP Server"
            name="imap_server"
            placeholder="imap.gmail.com"
            register={register}
            error={errors?.imap_server}
            required
          />

          <Input
            label="IMAP Port"
            name="imap_port"
            type="number"
            placeholder="993"
            register={register}
            error={errors?.imap_port}
            required
          />

          <Input
            label="IMAP Username"
            name="imap_username"
            placeholder="user@source-domain.com"
            register={register}
            error={errors?.imap_username}
            required
          />

          <PasswordInput
            label="IMAP Password"
            name="imap_password"
            placeholder="Enter source password"
            register={register}
            error={errors?.imap_password}
            required
          />
        </div>
      </fieldset>

      {/* Local Destination Configuration */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground text-left text-base font-medium px-2">
          Local Destination (To)
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          <Input
            label="Destination Email Prefix"
            name="to_email_prefix"
            placeholder="username"
            register={register}
            error={errors?.to_email_prefix}
            required
            note={`Full email: ${watch("to_email_prefix") || "username"}@${domain_name}`}
          />

          <Input
            label="Destination Domain"
            name="to_email_domain"
            register={register}
            error={errors?.to_email_domain}
            disabled={true}
            required
          />
        </div>
      </fieldset>

      {/* Sync Settings with Date Range Controller */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground text-left text-base font-medium px-2">
          Sync Settings
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Folder to Sync"
            name="sync_specific_folder"
            placeholder="INBOX"
            register={register}
            error={errors?.sync_specific_folder}
            required
          />

          {/* Date Range Picker using Controller */}
          <div className="w-full">
            <Controller
              name="date_range"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DateTimeRangePicker
                  value={value}
                  onChange={onChange}
                  label="Sync Date Range *"
                  placeholder="Select date range..."
                  includeTime={true} // Only dates needed for Sync usually
                  maxDays={365} // Allow 1 year range for sync, unlike 30 days for logs
                  error={
                    errors?.date_range?.message ||
                    errors?.date_range?.startDate?.message ||
                    errors?.date_range?.endDate?.message
                  }
                  isClearable={false}
                />
              )}
            />
          </div>
        </div>
      </fieldset>

      <InfoBox
        title="Sync Process"
        description="The system will synchronize emails from the specified IMAP folder within the selected date range. Ensure the source credentials allow external IMAP access."
      />
    </div>
  );
};

export default JobConfigurationStep;
