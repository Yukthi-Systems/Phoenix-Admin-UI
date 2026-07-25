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
import InfoBox from "@/components/common/InfoBox";

const DepartmentInformationStep = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Department Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Provide basic information about the department
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 gap-5">
        <Input
          label="Department Name"
          name="department_name"
          register={register}
          placeholder="Enter Department Name"
          errors={errors}
          isRequired
          info="This will be the primary identifier for the department"
        />
      </div>

      {/* Info Box */}
      <InfoBox
        title="Department Name"
        description="Choose a clear, descriptive name that identifies the department's purpose or function within your organization."
      />
    </div>
  );
};

export default DepartmentInformationStep;
