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

const DomainPropertiesStep = ({ register, errors, control, watch }) => {
  const enableCatchAll = watch("enable_catch_all");
  const enableHybridMode = watch("enable_hybrid_mode");

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Domain Properties
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure advanced domain settings including catch-all and hybrid mode
        </p>
      </div>

      <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground  text-left text-base font-medium">
        Email Handling
      </legend>
      <div className="space-y-6">
        {/* Catch All Settings */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div>
            <Switch
              control={control}
              name="enable_catch_all"
              register={register}
              watch={watch}
              errors={errors}
              disabled={enableHybridMode && !enableCatchAll}
              falseLabel="Catch All Disabled"
              falseSublabel="Unknown email addresses will be rejected"
              trueLabel="Catch All Enabled"
              trueSublabel="Unknown email addresses will be forwarded to specified email"
            />
            {enableHybridMode && !enableCatchAll && (
              <p className="text-muted-foreground mt-2 text-xs text-left">
                Disable Hybrid Mode to enable Catch All — only one can be active per domain.
              </p>
            )}
          </div>

          {enableCatchAll && (
            <div>
              <Input
                type="email"
                label="Catch All Forwarding Email Address"
                name="catch_all_forwarding_address"
                placeholder="catchall@example.com"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <p className="text-muted-foreground mt-2 text-xs text-left">
                The forwarding address must be managed by our service.
              </p>
            </div>
          )}
        </div>
      </div>
      </fieldset>

      <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground text-left text-base font-medium">
        Hybrid Configuration
      </legend>
      <div className="space-y-6">
        {/* Hybrid Mode Settings */}
        <div className="grid grid-cols-1 gap-6">
          <div className="w-1/2 pr-3">
            <Switch
              control={control}
              name="enable_hybrid_mode"
              register={register}
              watch={watch}
              errors={errors}
              disabled={enableCatchAll && !enableHybridMode}
              falseLabel="Hybrid Mode Disabled"
              falseSublabel="Standard cloud-only or on-premise-only setup"
              trueLabel="Hybrid Mode Enabled"
              trueSublabel="Mixed cloud and on-premise connector configuration"
            />
            {enableCatchAll && !enableHybridMode && (
              <p className="text-muted-foreground mt-2 text-xs text-left">
                Disable Catch All to enable Hybrid Mode — only one can be active per domain.
              </p>
            )}
          </div>

          {enableHybridMode && (
            <div className="bg-accent/30 border-accent grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-2">
              <Input
                label="Hybrid Connector Description"
                name="hybrid_connector_properties.description"
                placeholder="Enter connector description"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
                label="Connector FQDN"
                name="hybrid_connector_properties.fqdn"
                placeholder="connector.example.com"
                info="Either FQDN or IPv4 is required"
                register={register}
                errors={errors}
              />
              <Input
                label="Connector IPv4"
                name="hybrid_connector_properties.ipv4"
                placeholder="192.168.1.100"
                info="Either FQDN or IPv4 is required"
                register={register}
                errors={errors}
              />
              <Input
                label="Connector IPv6"
                name="hybrid_connector_properties.ipv6"
                placeholder="2001:db8::1"
                register={register}
                errors={errors}
              />
              <Input
                type="number"
                label="Connector Port"
                name="hybrid_connector_properties.port"
                placeholder="25"
                register={register}
                errors={errors}
                isRequired={true}
              />
            </div>
          )}
        </div>
      </div>
      </fieldset>
    </div>
  );
};

export default DomainPropertiesStep;
