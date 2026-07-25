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
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 border-b border-border py-3 text-sm last:border-0">
    <span className="font-medium text-muted-foreground">{label}</span>
    <span className="col-span-2 text-foreground">{value || "-"}</span>
  </div>
);

const PreviewStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext();
  const values = watch();

  return (
    <div className="space-y-8 text-left">
      {/* General Info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-medium text-foreground">{t("Key Information")}</h3>
        <div className="space-y-1">
          <DetailRow label={t("Key Name")} value={values.key_name} />
       
          <DetailRow label={t("Description")} value={values.description} />
        </div>
      </div>

      {/* Custom Details */}
      {values.custom_details?.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium text-foreground">{t("Additional Details")}</h3>
          <div className="space-y-1">
            {values.custom_details.map((detail, idx) => (
              <DetailRow key={idx} label={detail.key} value={detail.value} />
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-medium text-foreground">{t("Permissions")}</h3>
        {values.permissions?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {values.permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
              >
                {perm}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">{t("No permissions selected")}</p>
        )}
      </div>
    </div>
  );
};

export default PreviewStep;