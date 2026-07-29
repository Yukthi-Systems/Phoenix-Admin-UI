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
  Building2,
  MapPin,
  Users,
} from "lucide-react";

const PreviewStep = ({
  formData,
  branchKeys,
  contactKeys,
  getValues,
  parentOrg,
}) => {
  const PreviewSection = ({ title, children, icon: Icon }) => (
    <div className="border-border bg-card/50 rounded-lg border p-5 text-left">
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
        className={`text-right text-sm ${highlight ? "text-primary font-semibold" : "text-foreground font-medium"}`}
      >
        {value || "-"}
      </span>
    </div>
  );

  const StatusBadge = ({ enabled }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
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

  const ServiceBadge = ({ label, enabled }) => (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${enabled ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
    >
      {enabled ? (
        <Check className="h-2.5 w-2.5" />
      ) : (
        <X className="h-2.5 w-2.5" />
      )}
      {label}: {enabled ? "Enabled" : "Disabled"}
    </span>
  );

  const InfoBox = ({ children }) => (
    <div className="border-primary/20 bg-primary/5 text-primary flex items-start gap-2 rounded-lg border p-3">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="text-xs">{children}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Review Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please review all settings before creating the organization
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      <PreviewSection title="Organization Details" icon={Building2}>
        <PreviewItem
          label="Organization Name"
          value={formData.name}
          highlight={true}
        />
        <PreviewItem
          label="Allocated Quota"
          value={`${formData.allocated_quota} GB`}
        />
        <PreviewItem
          label="Email Identities"
          value={
            Number(formData.allocated_email_identities) === -1
              ? "Unlimited"
              : formData.allocated_email_identities
          }
        />
        <PreviewItem label="Type" value={formData.details?.type} />
        <PreviewItem label="Parent Organization" value={parentOrg.name} />
        <PreviewItem
          label="Status"
          value={<StatusBadge enabled={formData.activate} />}
        />
        {formData.details?.description && (
          <PreviewItem
            label="Description"
            value={formData.details.description}
          />
        )}
        {formData.details?.website && (
          <PreviewItem label="Website" value={formData.details.website} />
        )}
        {formData.details?.gst_number && (
          <PreviewItem label="GST Number" value={formData.details.gst_number} />
        )}
        <PreviewItem
          label="Services"
          value={
            <div className="flex flex-wrap justify-end gap-2">
              <ServiceBadge
                label="Email"
                enabled={formData.email_service_enabled}
              />
              <ServiceBadge
                label="Chat"
                enabled={formData.chat_service_enabled}
              />
              <ServiceBadge
                label="File"
                enabled={formData.file_service_enabled}
              />
            </div>
          }
        />
      </PreviewSection>

      <PreviewSection title="Branches" icon={MapPin}>
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          Total Branches: {branchKeys.length}
        </p>
        <div className="space-y-3 text-left">
          {branchKeys.map((id, index) => {
            const branch = getValues(`details.branches.${id}`);
            return (
              <div key={id} className="bg-accent/30 rounded-md p-3">
                <p className="text-foreground mb-1 text-sm font-medium">
                  {index + 1}. {branch?.name || "Unnamed Branch"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {branch?.address_one}
                  {branch?.address_two ? `, ${branch.address_two}` : ""}
                </p>
                <p className="text-muted-foreground text-xs">
                  {branch?.city}, {branch?.state} {branch?.pincode}
                </p>
                <p className="text-muted-foreground text-xs">
                  {branch?.country}
                </p>
              </div>
            );
          })}
        </div>
      </PreviewSection>

      <PreviewSection title="Contacts" icon={Users}>
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          Total Contacts: {contactKeys.length}
        </p>
        <div className="space-y-3">
          {contactKeys.map((id, index) => {
            const contact = getValues(`details.contact_info.${id}`);
            return (
              <div key={id} className="bg-accent/30 rounded-md p-3">
                <p className="text-foreground mb-1 text-sm font-medium">
                  {index + 1}. {contact?.name || "Unnamed Contact"}
                </p>
                {contact?.phone && (
                  <p className="text-muted-foreground text-xs">
                    Phone: {contact.phone}
                  </p>
                )}
                {contact?.email && (
                  <p className="text-muted-foreground text-xs">
                    Email: {contact.email}
                  </p>
                )}
                {contact?.type && (
                  <p className="text-muted-foreground text-xs">
                    Type: {contact.type}
                  </p>
                )}
                {contact?.notes && (
                  <p className="text-muted-foreground text-xs">
                    Notes: {contact.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </PreviewSection>

      <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <Check className="text-primary h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="text-foreground font-semibold">Ready to Create</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              Organization{" "}
              <span className="text-foreground font-semibold">
                {formData.name}
              </span>{" "}
              is configured with {branchKeys.length} branch
              {branchKeys.length !== 1 ? "es" : ""} and {contactKeys.length}{" "}
              contact
              {contactKeys.length !== 1 ? "s" : ""} and ready to be created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
