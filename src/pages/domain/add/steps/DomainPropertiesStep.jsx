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

import { Info } from "lucide-react";
import { Input } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";

const DomainPropertiesStep = ({ register, errors, control, watch }) => {
  const enableHybridMode = watch("enable_hybrid_mode");

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Domain Properties
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure advanced domain settings including hybrid mode
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-primary">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p className="text-xs text-left">
          Catch-all forwarding isn't available while creating a domain. You
          can enable it afterwards from the domain's Edit page.
        </p>
      </div>

      <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground  text-left text-base font-medium">
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
              falseLabel="Hybrid Mode Disabled"
              falseSublabel="Standard cloud-only or on-premise-only setup"
              trueLabel="Hybrid Mode Enabled"
              trueSublabel="Mixed cloud and on-premise connector configuration"
            />
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
