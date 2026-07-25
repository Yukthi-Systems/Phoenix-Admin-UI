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

import { Check, Building2, Users, Info } from "lucide-react";

const PreviewStep = ({ formData }) => {
  // Helper components
  const PreviewSection = ({ title, children, icon: Icon }) => (
    <div className="border-border bg-card/50 rounded-lg border p-5">
      <div className="border-border mb-4 flex items-center gap-2 border-b pb-3">
        {Icon && <Icon className="text-primary h-5 w-5" />}
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const PreviewItem = ({ label, value, highlight = false }) => (
    <div className="flex items-start justify-between gap-4">
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

  const InfoBox = ({ children }) => (
    <div className="border-primary/20 bg-primary/5 text-primary flex items-start gap-2 rounded-lg border p-3">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="text-xs">{children}</p>
    </div>
  );

  const authorizedPersons =
    formData.department_details?.authorized_persons || [];
  const hasAuthorizedPersons = authorizedPersons.some(
    (person) => person.name || person.email || person.phone,
  );

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Review Department
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please review all details before creating the department
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      {/* Department Information */}
      <PreviewSection title="Department Information" icon={Building2}>
        <PreviewItem
          label="Department Name"
          value={formData.department_name}
          highlight={true}
        />
      </PreviewSection>

      {/* Department Details */}
      <PreviewSection title="Additional Details" icon={Info}>
        <PreviewItem
          label="Address"
          value={formData.department_details?.address}
        />
        <PreviewItem
          label="Description"
          value={formData.department_details?.description}
        />
        <PreviewItem label="Notes" value={formData.department_details?.notes} />
      </PreviewSection>

      {/* Authorized Persons */}
      <PreviewSection title="Authorized Persons" icon={Users}>
        {hasAuthorizedPersons ? (
          <div className="space-y-4">
            {authorizedPersons.map((person, index) => {
              if (!person.name && !person.email && !person.phone) return null;

              return (
                <div
                  key={index}
                  className="bg-muted/30 border-border rounded-md border p-3"
                >
                  <div className="space-y-2">
                    <PreviewItem label="Name" value={person.name} />
                    <PreviewItem label="Email" value={person.email} />
                    <PreviewItem label="Phone" value={person.phone} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-4">
            <p className="text-xs italic">No authorized persons added</p>
          </div>
        )}
      </PreviewSection>

      {/* Summary Box */}
      <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <Check className="text-primary h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="text-foreground font-semibold">Ready to Create</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              Department{" "}
              <span className="text-foreground font-semibold">
                {formData.department_name}
              </span>{" "}
              is ready to be created
              {hasAuthorizedPersons && (
                <>
                  {" "}
                  with{" "}
                  {
                    authorizedPersons.filter(
                      (p) => p.name || p.email || p.phone,
                    ).length
                  }{" "}
                  authorized{" "}
                  {authorizedPersons.filter((p) => p.name || p.email || p.phone)
                    .length === 1
                    ? "person"
                    : "persons"}
                </>
              )}
              . Click "Create Department" to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
