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
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/common/Inputs";
import { AddButton, DeleteButton } from "@/components/common/Buttons";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const DynamicDetailsStep = () => {
  const { t } = useTranslation();
  const { control, register, formState: { errors } } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_details",
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-lg font-medium text-foreground">
          {t("Additional Details")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("Add any extra metadata for this key (e.g. Environment, Department).")}
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-3">
            <div className="flex-1 grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Key (e.g. Environment)"
                name={`custom_details.${index}.key`}
                register={register}
                errors={errors}
                customStyle="mb-0"
              />
              <Input
                placeholder="Value (e.g. Production)"
                name={`custom_details.${index}.value`}
                register={register}
                errors={errors}
                customStyle="mb-0"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-1.5 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-start">
        <AddButton 
            label="Add Detail" 
            handleClick={() => append({ key: "", value: "" })}
            icon={true}
        />
      </div>
    </div>
  );
};

export default DynamicDetailsStep;