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
import PhoneInput from "@/components/common/PhoneInput";
import { Plus, Trash2 } from "lucide-react";
import InfoBox from "@/components/common/InfoBox";

const DepartmentDetailsStep = ({
  register,
  errors,
  fields,
  append,
  remove,
  watch,
  setValue,
}) => {
  const addAuthorizedPerson = () => append({ name: "", email: "", phone: "" });

  const removeAuthorizedPerson = (index) => {
    if (fields.length > 1) remove(index);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Department Details
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Add optional details and authorized contacts for the department
        </p>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Address"
            name="department_details.address"
            register={register}
            placeholder="Department Address"
            errors={errors}
          />
          <Input
            label="Description"
            name="department_details.description"
            register={register}
            placeholder="Department Description"
            errors={errors}
          />
        </div>

        <Input
          label="Notes"
          name="department_details.notes"
          register={register}
          placeholder="Additional Notes"
          errors={errors}
        />
      </div>

      {/* Authorized Persons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-foreground text-base font-medium">
            Authorized Persons
          </h4>
          <button
            type="button"
            onClick={addAuthorizedPerson}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors"
          >
            <Plus size={16} />
            Add Person
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border-border bg-muted/20 grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <Input
                label="Name"
                name={`department_details.authorized_persons.${index}.name`}
                register={register}
                placeholder="Full Name"
                errors={errors}
              />
              <Input
                label="Email"
                name={`department_details.authorized_persons.${index}.email`}
                register={register}
                placeholder="email@example.com"
                errors={errors}
              />
              <PhoneInput
                setValue={setValue}
                label="Phone"
                name={`department_details.authorized_persons.${index}.phone`}
                register={register}
                watch={watch}
                placeholder="Phone Number"
                errors={errors}
              />

              {fields.length > 1 && (
                <div className="flex items-end justify-center">
                  <button
                    type="button"
                    onClick={() => removeAuthorizedPerson(index)}
                    disabled={fields.length <= 1}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center rounded-md p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove person"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <InfoBox
        title="Optional Details"
        description="All fields in this step are optional. Add authorized persons who can manage or represent this department."
      />
    </div>
  );
};

export default DepartmentDetailsStep;
