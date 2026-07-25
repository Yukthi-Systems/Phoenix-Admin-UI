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

import React from "react";
import Dropdown from "@/components/common/Dropdown";
import InfoBox from "@/components/common/InfoBox";
import { Input, PasswordInput } from "@/components/common/Inputs";

const SourceConfigStep = ({ register, errors, control }) => {
  const encryptionOptions = [
    { label: "SSL", value: "SSL" },
    { label: "TLS", value: "TLS" },
    { label: "STARTTLS", value: "STARTTLS" },
    { label: "None", value: "NONE" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <InfoBox
        title="Source Configuration"
        description="Enter the details of the external email account you want to sync from."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Source Email"
          name="source_email"
          type="email"
          placeholder="user@external-domain.com"
          register={register}
          error={errors?.source_email}
          required
        />

        <PasswordInput
          label="Source Password"
          name="source_password"
          type="password"
          placeholder="Enter password"
          register={register}
          error={errors?.source_password}
          required
        />

        <Input
          label="IMAP Host"
          name="source_host"
          placeholder="imap.gmail.com"
          register={register}
          error={errors?.source_host}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Port"
            name="source_port"
            type="number"
            placeholder="993"
            register={register}
            error={errors?.source_port}
            required
          />

          <Dropdown
            label="Encryption"
            name="source_encryption"
            control={control}
            options={encryptionOptions}
            error={errors?.source_encryption}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default SourceConfigStep;