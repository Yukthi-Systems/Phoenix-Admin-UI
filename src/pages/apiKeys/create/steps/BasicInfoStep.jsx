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
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input, TextArea } from "@/components/common/Inputs";
import { Key, FileText, Trash2, Plus, Tag, Info } from "lucide-react";

const BasicInfoStep = () => {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_details",
  });

  return (
    <div className="space-y-6 text-left">
      {/* Section Header */}
      <div className="border-border border-b pb-4">
        <h2 className="text-foreground text-lg font-semibold">
          {t("General Information")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "Provide the essential details to identify and manage this API key.",
          )}
        </p>
      </div>

      {/* Primary Information */}
      <div className="space-y-4">
        <div className="grid gap-6">
          <Input
            label="Key Name"
            name="key_name"
            register={register}
            errors={errors}
            placeholder="e.g. Production Service Key"
            isRequired={true}
            icon={<Key className="text-muted-foreground h-4 w-4" />}
          />
        </div>
        <TextArea
          label="Description"
          name="description"
          register={register}
          errors={errors}
          placeholder="Describe the purpose of this key..."
          icon={<FileText className="text-muted-foreground h-4 w-4" />}
          rows={3}
        />
      </div>

      {/* Dynamic Details Section */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Tag size={16} className="text-primary" />
              {t("Metadata Tags")}
            </label>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("Add custom key-value pairs for additional context.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus size={14} />
            {t("Add Tag")}
          </button>
        </div>

        <div className="space-y-3">
          {fields.length === 0 && (
            <div className="bg-background border-border text-muted-foreground flex flex-col items-center justify-center rounded-md border border-dashed py-6 text-center text-xs">
              <Info className="mb-2 h-8 w-8 opacity-50" />
              {t("No additional metadata added.")}
              <span className="opacity-70">
                {t("Click 'Add Tag' to define custom attributes.")}
              </span>
            </div>
          )}

{fields.map((field, index) => (
            <div key={field.id} className="group flex items-start gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <div className="relative">
                  <Input
                    placeholder="Key (e.g. Environment)"
                    name={`custom_details.${index}.key`}
                    register={register}
                    errors={errors}
                    // customStyle="mb-0"
                    // Compact styling for list items
                    // className="!mt-0 h-9 py-1 text-sm" 
                  />
                </div>
                <div className="relative">
                  <Input
                    placeholder="Value (e.g. Production)"
                    name={`custom_details.${index}.value`}
                    register={register}
                    errors={errors}
                    // customStyle="mb-0"
                    // className="!mt-0 h-9 py-1 text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-0.5 rounded p-2 transition-colors"
                title={t("Remove detail")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;