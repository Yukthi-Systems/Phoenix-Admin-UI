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

import { Input, TextArea } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";

const BasicInformationStep = ({ register, errors, control, watch }) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Basic Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure disclaimer details and settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Disclaimer Name"
          name="disclaimer_name"
          isRequired
          register={register}
          errors={errors}
          placeholder="Enter disclaimer name"
        />

        <TextArea
          customStyle="md:col-span-2"
          label="Description"
          name="details.description"
          register={register}
          errors={errors}
          placeholder="Enter description"
          rows={3}
          isRequired
        />
      </div>
    </div>
  );
};

export default BasicInformationStep;
