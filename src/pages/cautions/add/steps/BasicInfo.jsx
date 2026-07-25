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

import { Input, SelectField, TextArea } from "@/components/common/Inputs";

const BasicInformationStep = ({ register, errors }) => {
  const severityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Basic Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure caution message details and metadata
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Caution Message Name"
          name="caution_message_name"
          isRequired
          register={register}
          errors={errors}
          placeholder="Enter message name"
        />

        <SelectField
          label="Severity"
          name="info.severity"
          register={register}
          errors={errors}
          options={severityOptions}
        />

        <TextArea
          customStyle="md:col-span-2"
          label="Description"
          name="info.description"
          isRequired
          register={register}
          errors={errors}
          placeholder="Enter description"
          rows={3}
        />

        <TextArea
          customStyle="md:col-span-2"
          label="Notes"
          name="info.notes"
          register={register}
          errors={errors}
          placeholder="Additional notes (optional)"
          rows={2}
        />
      </div>
    </div>
  );
};

export default BasicInformationStep;
