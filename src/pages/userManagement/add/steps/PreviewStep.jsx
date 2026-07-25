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

import {
  Check,
  X,
  Info,
  AlertCircle,
  User,
  Shield,
  MapPin,
} from "lucide-react";

const PreviewStep = ({ formData, watch }) => {
  const permissions = watch("permissions") || [];

  const PreviewSection = ({ title, children, icon: Icon }) => (
    <div className="border-border bg-card/50 rounded-lg border p-5 !text-left">
      <div className="border-border mb-4 flex items-center gap-2 border-b pb-3">
        {Icon && <Icon className="text-primary h-5 w-5" />}
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const PreviewItem = ({ label, value, highlight = false }) => (
    <div className="flex items-start justify-between gap-4 text-left">
      <span className="text-muted-foreground text-sm font-medium">
        {label}:
      </span>
      <span
        className={`text-right text-sm ${
          highlight
            ? "text-primary font-semibold"
            : "text-foreground font-medium"
        }`}
      >
        {value || "-"}
      </span>
    </div>
  );

  const StatusBadge = ({ enabled }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        enabled
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {enabled ? (
        <>
          <Check className="h-3 w-3" />
          Active
        </>
      ) : (
        <>
          <X className="h-3 w-3" />
          Inactive
        </>
      )}
    </span>
  );

  const InfoBox = ({ children }) => (
    <div className="border-primary/20 bg-primary/5 text-primary flex items-start gap-2 rounded-lg border p-3">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="text-xs">{children}</p>
    </div>
  );

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.split(":")[0] || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Review Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please review all settings before creating the user account
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      {/* User Account Details */}
      <PreviewSection title="Account Details" icon={User}>
        <PreviewItem
          label="Username"
          value={formData.user_name}
          highlight={true}
        />
        <PreviewItem label="Display Name" value={formData.display_name} />
        <PreviewItem label="Email" value={formData.user_email} />
        <PreviewItem
          label="Phone"
          value={formData.primary_phone_number_with_country_code}
        />
        <PreviewItem
          label="Status"
          value={<StatusBadge enabled={formData.activate} />}
        />
      </PreviewSection>

      {/* Permissions */}
      <PreviewSection title="Permissions" icon={Shield}>
        <div>
          <p className="text-muted-foreground mb-2 text-sm font-medium">
            Total Permissions: {permissions.length}
          </p>
          {permissions.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center italic">
              <p className="text-xs">No permissions assigned</p>
            </div>
          ) : (
            <div className="bg-muted/30 border-border max-h-60 overflow-y-auto rounded-md border p-3">
              <div className="space-y-3">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <p className="text-foreground mb-1 text-xs font-semibold uppercase">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {perms.map((perm, idx) => (
                        <span
                          key={idx}
                          className="border-border bg-card text-foreground rounded-full border px-2 py-0.5 text-xs"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PreviewSection>

      {/* Personal Information */}
      <PreviewSection title="Personal Information" icon={User}>
        <PreviewItem
          label="Full Name"
          value={`${formData.user_details?.first_name || ""} ${formData.user_details?.last_name || ""}`.trim()}
        />
        {formData.user_details?.other_email && (
          <PreviewItem
            label="Alternate Email"
            value={formData.user_details.other_email}
          />
        )}
        {formData.user_details?.timezone && (
          <PreviewItem
            label="Timezone"
            value={formData.user_details.timezone}
          />
        )}
        {formData.user_details?.locale && (
          <PreviewItem label="Locale" value={formData.user_details.locale} />
        )}
      </PreviewSection>

      {/* Address Information */}
      {(formData.user_details?.address ||
        formData.user_details?.city ||
        formData.user_details?.state ||
        formData.user_details?.country ||
        formData.user_details?.zip_code) && (
        <PreviewSection title="Address Information" icon={MapPin}>
          {formData.user_details?.address && (
            <PreviewItem
              label="Address"
              value={formData.user_details.address}
            />
          )}
          {formData.user_details?.city && (
            <PreviewItem label="City" value={formData.user_details.city} />
          )}
          {formData.user_details?.state && (
            <PreviewItem label="State" value={formData.user_details.state} />
          )}
          {formData.user_details?.country && (
            <PreviewItem
              label="Country"
              value={formData.user_details.country}
            />
          )}
          {formData.user_details?.zip_code && (
            <PreviewItem
              label="Zip Code"
              value={formData.user_details.zip_code}
            />
          )}
        </PreviewSection>
      )}

      {/* Ready to Create */}
      <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <Check className="text-primary h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="text-foreground font-semibold">Ready to Create</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              User account{" "}
              <span className="text-foreground font-semibold">
                {formData.user_name}
              </span>{" "}
              is configured with {permissions.length} permission
              {permissions.length !== 1 ? "s" : ""} and ready to be created.
              Click "Create User" to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
