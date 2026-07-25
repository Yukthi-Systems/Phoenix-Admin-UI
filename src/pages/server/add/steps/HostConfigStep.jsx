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

import { useEffect } from "react";
import { Input } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";

const HostConfigurationStep = ({ register, errors, control, watch, setValue }) => {
  const isMonitoring = watch("is_monitoring");
  const isMailboxServer = watch("is_mailbox_server");
  const isAcceptingNewMailboxes = watch("is_accepting_new_mailboxes");

  // Mailbox Server requires Monitoring to be enabled; Accepting New Mailboxes
  // requires the server to be a Mailbox Server. Force the dependent switch off
  // whenever its prerequisite is turned off.
  useEffect(() => {
    if (!isMonitoring && isMailboxServer) {
      setValue("is_mailbox_server", false, { shouldValidate: true, shouldDirty: true });
    }
  }, [isMonitoring, isMailboxServer, setValue]);

  useEffect(() => {
    if (!isMailboxServer && isAcceptingNewMailboxes) {
      setValue("is_accepting_new_mailboxes", false, { shouldValidate: true, shouldDirty: true });
    }
  }, [isMailboxServer, isAcceptingNewMailboxes, setValue]);

  return (
    <div className="space-y-6 text-left">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Host Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure the basic host settings for your mail server
        </p>
      </div>

      {/* Host Details */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-card-foreground text-left text-lg font-semibold">
          Host Details
        </legend>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Host Name"
            name="host_name"
            placeholder="mail.example.com"
            register={register}
            errors={errors}
            isRequired={true}
            info="Enter the fully qualified domain name"
          />
          <Input
            type="number"
            label="Allocated Quota (GB)"
            name="quota_allocated"
            placeholder="100"
            register={register}
            errors={errors}
            min={0.1}
            step={0.01}
            isRequired={true}
            info="Minimum: 0.1 GB"
          />
          <Input
            type="number"
            label="SMTP Port"
            name="smtp_port"
            placeholder="587"
            register={register}
            errors={errors}
            min={1}
            max={65535}
            isRequired={true}
          />
          <Input
            label="Mail Storage Path"
            name="storage_path"
            placeholder="/var/mail/vhosts"
            register={register}
            errors={errors}
            customStyle="md:col-span-2 lg:col-span-3"
            isRequired={true}
            info="Absolute path where mail data will be stored"
          />
        </div>
      </fieldset>

      {/* Server Status Switches */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-card-foreground text-left text-lg font-semibold">
          Server Status
        </legend>
        <div className="grid grid-cols-1 gap-5 ">
          <div className="flex items-center">
            <Switch
              control={control}
              name="is_active"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="Server Inactive"
              falseSublabel="Server will be created but remain disabled"
              trueLabel="Server Active"
              trueSublabel="Server will be enabled immediately after creation"
            />
          </div>
          <div className="flex items-center">
            <Switch
              control={control}
              name="is_monitoring"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="Monitoring Enabled: No"
              falseSublabel="This server is not restricted to monitoring"
              trueLabel="Monitoring Enabled: Yes"
              trueSublabel="This server is for monitoring "
            />
          </div>
          <div className="flex items-center">
            <div className="w-full">
              <Switch
                control={control}
                name="is_mailbox_server"
                register={register}
                watch={watch}
                errors={errors}
                disabled={!isMonitoring}
                falseLabel="Mailbox Server: No"
                falseSublabel="This is not a mailbox server"
                trueLabel="Mailbox Server: Yes"
                trueSublabel="This is a mailbox server"
              />
              {!isMonitoring && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Enable Monitoring to make this a mailbox server.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full">
              <Switch
                control={control}
                name="is_accepting_new_mailboxes"
                register={register}
                watch={watch}
                errors={errors}
                disabled={!isMailboxServer}
                falseLabel="Accepting New Mailboxes: No"
                falseSublabel="This server will not receive newly created mailboxes"
                trueLabel="Accepting New Mailboxes: Yes"
                trueSublabel="This server can receive newly created mailboxes"
              />
              {!isMailboxServer && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Enable Mailbox Server to accept new mailboxes.
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* Info Box */}
      <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <svg
            className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-left">
            <p className="text-foreground text-sm font-medium">
              Host Configuration
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Ensure the host name is accessible and the SMTP port is open. The
              storage path must exist and have proper permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostConfigurationStep;
