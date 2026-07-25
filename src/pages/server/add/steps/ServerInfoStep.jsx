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

const ServerInformationStep = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Server Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Provide detailed information about the server infrastructure
        </p>
      </div>

      <fieldset className="border border-border rounded-md p-6">
        <legend className="text-lg font-semibold text-card-foreground text-left">
          Server Details
        </legend>
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Description"
            name="server_info.description"
            placeholder="Primary mail server"
            register={register}
            errors={errors}
            isRequired={true}
          />
          <Input
            label="Location"
            name="server_info.location"
            placeholder="Data Center A, New York"
            register={register}
            errors={errors}
            isRequired={true}
          />
          <Input
            label="IPv4 Address"
            name="server_info.ipv4"
            placeholder="192.168.1.100"
            register={register}
            errors={errors}
            isRequired={true}
          />
          <Input
            label="IPv6 Address"
            name="server_info.ipv6"
            placeholder="2001:db8::1"
            register={register}
            errors={errors}
          />
          <Input
            label="Operating System"
            name="server_info.os"
            placeholder="Ubuntu 22.04 LTS"
            register={register}
            errors={errors}
            customStyle="md:col-span-2"
            isRequired={true}
          />
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
              Server Information
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Provide accurate server details for proper identification and
              management. IPv6 is optional but recommended for future
              compatibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerInformationStep;
