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

import { Check, X, Info, AlertCircle } from "lucide-react";
import HTMLPreview from "@/components/common/HtmlPreview";

const PreviewStep = ({ formData }) => {
  const { disclaimer_name, details, activate, text_content, html_content } =
    formData;

  // Helper components
  const PreviewSection = ({ title, children, icon: Icon }) => (
    <div className="border-border rounded-lg border bg-card/50 p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const PreviewItem = ({ label, value, highlight = false }) => (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-medium text-muted-foreground">
        {label}:
      </span>
      <span
        className={`text-right text-sm ${
          highlight
            ? "font-semibold text-primary"
            : "font-medium text-foreground"
        }`}
      >
        {value || "-"}
      </span>
    </div>
  );

  const InfoBox = ({ children }) => (
    <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-primary">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="text-xs">{children}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-lg font-semibold text-foreground">
          Review Configuration
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review all settings before creating the disclaimer
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      {/* Basic Information */}
      <PreviewSection title="Basic Information" icon={AlertCircle}>
        <PreviewItem
          label="Disclaimer Name"
          value={disclaimer_name}
          highlight={true}
        />
        <PreviewItem label="Description" value={details?.description} />
      </PreviewSection>

      {/* Content Preview */}
      <PreviewSection title="Content Preview" icon={Info}>
        <div className="space-y-4">
          {text_content && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground text-left">
                Text Content
              </p>
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {text_content}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground text-left">
              HTML Preview
            </p>
            <HTMLPreview
              showPreviewText={false}
              height="300px"
              htmlContent={html_content}
            />
          </div>
        </div>
      </PreviewSection>

      {/* Summary Box */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-foreground">Ready to Create</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Disclaimer{" "}
              <span className="font-semibold text-foreground">
                {disclaimer_name}
              </span>{" "}
              is configured and ready to be created. Click "Create Disclaimer"
              to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
