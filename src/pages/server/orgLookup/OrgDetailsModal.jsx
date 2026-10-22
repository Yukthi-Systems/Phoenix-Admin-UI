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

import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Gauge,
  Layers,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";
import EditModelBox from "@/components/common/EditModelBox";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import StatusBadge from "@/components/common/StatusBadge";
import ProgressBar from "@/components/common/Progress";
import IdentityProgress from "@/components/common/IdentityProgress";
import { Button } from "@/components/common/Buttons";
import { getOrganizationDetail } from "@/api/organizations";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useToastify } from "@/hooks/useToastify";

const SERVICES = [
  { key: "email_service_enabled", label: "Email", icon: Mail },
  { key: "chat_service_enabled", label: "Chat", icon: MessageSquare },
  { key: "file_service_enabled", label: "Files", icon: FolderOpen },
  {
    key: "tasks_service_enabled",
    label: "Tasks & Calendar",
    icon: CalendarDays,
  },
];

const EmptyNote = ({ children }) => (
  <div className="bg-muted/20 rounded p-3 text-center">
    <span className="text-muted-foreground text-xs">{children}</span>
  </div>
);

// Full details of one organization from Tools > Organization Lookup. The row
// (global-list) already has usage/services; the details call adds the
// profile (type, GST, website, contacts, branches), and the hierarchy path
// (IDs only) is resolved to names with one details call per ancestor -
// sharing the "organization_detail" cache with the rest of the app.
const OrgDetailsModal = ({ organization, onClose }) => {
  const navigate = useNavigate();
  const toast = useToastify();
  const orgId = organization?.organization_id;
  const { data: detail, isLoading } = useGetOrganizationDetail(orgId);
  const profile = detail?.details || {};

  // root -> ... -> parent (self excluded, it's the modal's subject)
  const ancestorIds = (organization?.hierarchy_path || [])
    .map(String)
    .filter((id) => id !== orgId);
  const ancestorQueries = useQueries({
    queries: ancestorIds.map((id) => ({
      queryKey: ["organization_detail", id],
      queryFn: () => getOrganizationDetail(id),
      staleTime: 1000 * 60,
    })),
  });

  if (!organization) return null;

  const contacts = profile.contact_info || {};
  const branches = profile.branches || {};

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(orgId);
      toast("success", "Organization ID copied");
    } catch {
      toast("error", "Couldn't copy the ID");
    }
  };

  const openOrganization = () => {
    onClose();
    navigate(`/organization/${encodeURIComponent(orgId)}`);
  };

  return (
    <EditModelBox
      isOpen={!!organization}
      handleCancel={onClose}
      label="Organization Details"
      size="large"
    >
      <div className="space-y-4 text-left">
        {/* Header */}
        <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-foreground truncate text-lg font-semibold">
                  {organization.organization_name}
                </h3>
                <StatusBadge status={organization.is_active} />
              </div>
              <button
                type="button"
                onClick={copyId}
                className="text-muted-foreground hover:text-foreground mt-0.5 flex items-center gap-1 font-mono text-xs"
                title="Copy organization ID"
              >
                {orgId}
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <Button className="m-2" icon={ExternalLink} onClick={openOrganization}>
            Open Organization
          </Button>
        </div>

        {/* Hierarchy */}
        <div className="bg-muted/30 border-border rounded-lg border p-3">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
            <Layers className="h-3.5 w-3.5" />
            Hierarchy
          </div>
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {ancestorIds.map((id, index) => {
              const name = ancestorQueries[index]?.data?.organization_name;
              return (
                <span key={id} className="flex items-center gap-1">
                  <span className="text-muted-foreground" title={id}>
                    {name ||
                      (ancestorQueries[index]?.isLoading
                        ? "…"
                        : `${id.slice(0, 8)}…`)}
                  </span>
                  <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
                </span>
              );
            })}
            <span className="text-primary font-medium">
              {organization.organization_name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoCard icon={Building2} title="Overview">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading details...
              </div>
            ) : (
              <>
                <InfoItem
                  label="Type"
                  value={profile.type || "Not specified"}
                />
                <InfoItem
                  label="GST Number"
                  value={profile.gst_number || "Not provided"}
                />
                <InfoItem
                  label="Website"
                  value={
                    profile.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    ) : (
                      "Not provided"
                    )
                  }
                />
                <InfoItem
                  label="Level"
                  value={Math.max(
                    (organization.hierarchy_path?.length || 1) - 1,
                    0,
                  )}
                />
                {profile.description && (
                  <div className="pt-1">
                    <p className="text-muted-foreground mb-1 text-sm">
                      Description:
                    </p>
                    <p className="text-card-foreground text-sm">
                      {profile.description}
                    </p>
                  </div>
                )}
              </>
            )}
          </InfoCard>

          <InfoCard icon={Gauge} title="Usage & Services">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Storage</p>
              <ProgressBar
                utilized={organization.quota_utilized}
                allocated={organization.quota_allocated}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Email Identities</p>
              <IdentityProgress
                utilized={organization.utilized_email_identities}
                allocated={organization.allocated_email_identities}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {SERVICES.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium ${
                    organization[key]
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}: {organization[key] ? "On" : "Off"}
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard icon={Users} title="Contacts">
            {Object.keys(contacts).length === 0 ? (
              <EmptyNote>No contact information</EmptyNote>
            ) : (
              Object.entries(contacts).map(([key, contact]) => (
                <div
                  key={key}
                  className="bg-muted/30 border-border rounded border p-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-card-foreground text-sm font-medium">
                      {contact.name}
                    </span>
                    {contact.type && (
                      <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs capitalize">
                        {contact.type}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.notes && (
                      <div className="flex items-start gap-1">
                        <FileText className="mt-0.5 h-3 w-3" />
                        {contact.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </InfoCard>

          <InfoCard icon={MapPin} title="Branches">
            {Object.keys(branches).length === 0 ? (
              <EmptyNote>No branches configured</EmptyNote>
            ) : (
              Object.entries(branches).map(([key, branch]) => (
                <div
                  key={key}
                  className="bg-muted/30 border-border rounded border p-3"
                >
                  <div className="text-card-foreground mb-1 text-sm font-medium">
                    {branch.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {branch.address_one && <div>{branch.address_one}</div>}
                    {branch.address_two && <div>{branch.address_two}</div>}
                    <div>
                      {[
                        branch.city,
                        branch.state,
                        branch.pincode,
                        branch.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </InfoCard>
        </div>
      </div>
    </EditModelBox>
  );
};

export default OrgDetailsModal;
