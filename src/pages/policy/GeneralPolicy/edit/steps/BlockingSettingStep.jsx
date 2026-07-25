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

import { Input } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import InfoBox from "@/components/common/InfoBox";
import ListEditor from "../../add/ListEditor";

const BlockingSettingsStep = ({
  register,
  errors,
  control,
  watch,
  incomingDomains,
  setIncomingDomains,
  incomingEmails,
  setIncomingEmails,
  outgoingDomains,
  setOutgoingDomains,
  outgoingEmails,
  setOutgoingEmails,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Blocking & Exception Settings
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure email blocking rules, size limits, and exception lists
        </p>
      </div>

      <div className="space-y-8">
        {/* Incoming Emails Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Incoming Email Settings</h4>
          <Switch
            control={control}
            name="block_all_incoming_emails"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="General Emails Allowed"
            falseSublabel="All incoming emails will be processed normally"
            trueLabel="General Emails Blocked"
            trueSublabel="All incoming emails will be blocked (except exceptions)"
          />
          {watch("block_all_incoming_emails") && (
            <div className="pl-4 border-l-2 border-muted mt-4">
              <ListEditor
                placeholder="Enter email address (e.g., user@example.com)"
                label="Incoming Exception Emails"
                list={incomingEmails}
                setList={setIncomingEmails}
                type="email"
                domainLists={[incomingDomains, outgoingDomains]}
              />
            </div>
          )}
        </div>

        {/* Outgoing Emails Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Outgoing Email Settings</h4>
          <Switch
            control={control}
            name="block_all_outgoing_emails"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Outgoing Emails Allowed"
            falseSublabel="All outgoing emails will be sent normally"
            trueLabel="Outgoing Emails Blocked"
            trueSublabel="All outgoing emails will be blocked (except exceptions)"
          />
          {watch("block_all_outgoing_emails") && (
            <div className="pl-4 border-l-2 border-muted mt-4">
              <ListEditor
                placeholder="Enter email address (e.g., user@example.com)"
                label="Outgoing Exception Emails"
                list={outgoingEmails}
                setList={setOutgoingEmails}
                type="email"
                domainLists={[incomingDomains, outgoingDomains]}
              />
            </div>
          )}
        </div>

        {/* Incoming Domains Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Incoming Domain Settings</h4>
          <Switch
            control={control}
            name="block_all_incoming_domains"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Incoming Domains Allowed"
            falseSublabel="All incoming emails from domains will be processed normally"
            trueLabel="Incoming Domains Blocked"
            trueSublabel="All incoming emails from domains will be blocked (except exceptions)"
          />
          {watch("block_all_incoming_domains") && (
            <div className="pl-4 border-l-2 border-muted mt-4">
              <ListEditor
                placeholder="Enter domain (e.g., example.com)"
                label="Incoming Exception Domains"
                list={incomingDomains}
                setList={setIncomingDomains}
                type="domain"
              />
            </div>
          )}
        </div>

        {/* Outgoing Domains Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Outgoing Domain Settings</h4>
          <Switch
            control={control}
            name="block_all_outgoing_domains"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Outgoing Domains Allowed"
            falseSublabel="All outgoing emails from domains will be sent normally"
            trueLabel="Outgoing Domains Blocked"
            trueSublabel="All outgoing emails from domains will be blocked (except exceptions)"
          />
          {watch("block_all_outgoing_domains") && (
            <div className="pl-4 border-l-2 border-muted mt-4">
              <ListEditor
                placeholder="Enter domain (e.g., example.com)"
                label="Outgoing Exception Domains"
                list={outgoingDomains}
                setList={setOutgoingDomains}
                type="domain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Size Limits */}
      <div className="space-y-4">
        <h4 className="font-medium">Size Limits</h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Input
            label="Outgoing Size Limit (MB)"
            name="outgoing_size_limit_mb"
            type="number"
            placeholder="100"
            min="1"
            step="1"
            isRequired
            register={register}
            errors={errors}
            info="Maximum size limit for outgoing emails in megabytes"
          />
        </div>
      </div>

      {/* Info Box */}
      <InfoBox
        title="Blocking Settings"
        description="Adjust blocking and size limit configurations for email handling. Blocking incoming or outgoing messages overrides all other email policy settings unless exceptions are defined."
      />
    </div>
  );
};

export default BlockingSettingsStep;
