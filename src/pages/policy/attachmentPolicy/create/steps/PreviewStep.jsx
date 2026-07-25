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

import { CheckCircle2, XCircle, FileText, Shield } from "lucide-react";

const PreviewStep = ({
  formData,
  domain_name,
  allowedFileTypes,
  blockedFileTypes,
}) => {
  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="text-left">
        <h3 className="text-lg font-semibold text-foreground">
          Review Policy Details
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Review all settings before creating the attachment policy
        </p>
      </div>

      {/* Policy Information Card */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4" />
            Policy Information
          </h4>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Policy Name</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formData.policy_name || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Domain</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {domain_name || "-"}
              </p>
            </div>
          </div>

          {formData.policy_description && (
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 text-sm text-foreground">
                {formData.policy_description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1 flex items-center gap-2">
                {formData.is_active ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      Active
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Inactive
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Max Attachment Size
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formData.max_attachment_size_mb || 25} MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* File Types Configuration Card */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Shield className="h-4 w-4" />
            File Types Configuration
          </h4>
        </div>
        <div className="space-y-6 p-6">
          {/* Allowed File Types */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground">
              Allowed File Types ({allowedFileTypes.length})
            </p>
            {allowedFileTypes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allowedFileTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success"
                  >
                    {type}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No allowed file types specified
              </p>
            )}
          </div>

          {/* Blocked File Types */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground">
              Blocked File Types ({blockedFileTypes.length})
            </p>
            {blockedFileTypes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {blockedFileTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                  >
                    {type}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No blocked file types specified
              </p>
            )}
          </div>

          {/* Configuration Summary */}
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-foreground">
              Configuration Summary
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {allowedFileTypes.length === 0 &&
                blockedFileTypes.length === 0 && (
                  <li>• All file types will be allowed by default</li>
                )}
              {allowedFileTypes.length > 0 && (
                <li>• Only specified allowed file types will be permitted</li>
              )}
              {blockedFileTypes.length > 0 && (
                <li>• Specified blocked file types will be rejected</li>
              )}
              <li>
                • Attachments exceeding {formData.max_attachment_size_mb || 25}{" "}
                MB will be rejected
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Info */}
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-primary">Ready to Create</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Click "Create Attachment Policy" to save this configuration. You can
          edit these settings later if needed.
        </p>
      </div>
    </div>
  );
};

export default PreviewStep;
