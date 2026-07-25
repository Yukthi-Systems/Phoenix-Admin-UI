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
import InfoBox from "@/components/common/InfoBox";
import { Input, PasswordInput } from "@/components/common/Inputs";

const DestinationConfigStep = ({ register, errors }) => {
  return (
    <div className="flex flex-col gap-6">
      <InfoBox
        title="Destination Configuration"
        description="Enter the credentials for the local mailbox where emails will be migrated to."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Destination Email"
          name="destination_email"
          type="email"
          placeholder="user@your-domain.com"
          register={register}
          error={errors?.destination_email}
          required
        />

        <PasswordInput
          label="Destination Password"
          name="destination_password"
          type="password"
          placeholder="Enter local mailbox password"
          register={register}
          error={errors?.destination_password}
          required
        />
      </div>
    </div>
  );
};

export default DestinationConfigStep;