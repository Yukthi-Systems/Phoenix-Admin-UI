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

import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  UserSearch,
  Search,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Globe,
  Inbox,
  MessageSquare,
  Shield,
  Building2,
  Server,
} from "lucide-react";
import { userProfileAtom } from "@/store/userProfile";
import { useGetFullIdentityInfoByAdmin } from "@/hooks/useMailbox";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useGetServer } from "@/hooks/useServer";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import StatusBadge from "@/components/common/StatusBadge";
import GetDepartmentName from "@/components/common/GetDepartmentName";
import GetRestrictionPolicyName from "@/components/common/GetRestrictionPolicyName";
import GetGeneralPolicyName from "@/components/common/GetGeneralPolicyName";
import GetForwardingPolicyName from "@/components/common/GetForwardingPolicyName";
import GetDistributionPolicyName from "@/components/common/GetDistributionPolicyName";
import GetFiltersPolicyName from "@/components/common/GetFiltersPolicyName";
import GetAttachmentPolicyName from "@/components/common/GetAttachmentPolicyName";
import GetDisclaimerName from "@/components/common/GetDisclaimerName";
import GetCautionName from "@/components/common/GetCautionName";

const REQUIRED_PERMISSIONS = [
  "identity:admin:view",
  "mailbox:view",
  "domain:view",
  "organization:view",
];

const bytesToGB = (bytes = 0) => (bytes || 0) / (1024 * 1024 * 1024);

const BooleanIndicator = ({ value }) => (
  <div
    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
      value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
    }`}
  >
    {value ? "Yes" : "No"}
  </div>
);

// Several policy-entry hooks (general/restriction/filters) have no `enabled`
// guard of their own, so they fire even with a null id/organization_id -
// only mount the resolver when both are actually present, same as every
// other page in this app already does for these components.
const renderResolvedName = (Component, organization_id, id, extraProps = {}) => {
  if (!id || !organization_id) {
    return <span className="text-muted-foreground italic text-sm">Not assigned</span>;
  }
  return <Component organization_id={organization_id} id={id} {...extraProps} />;
};

const OrganizationInfo = ({ organization_id }) => {
  const { data, isLoading, isError } = useGetOrganizationDetail(organization_id);

  if (!organization_id) {
    return (
      <div className="bg-muted/20 mt-2 rounded p-2 text-center">
        <span className="text-muted-foreground text-xs">
          No organization assigned
        </span>
      </div>
    );
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading organization info...</p>;
  if (isError) return <p className="text-sm text-destructive">Failed to load organization info</p>;

  return (
    <>
      <InfoItem
        label="Organization"
        value={data?.organization_name || "Unknown Organization"}
        link={`/organization/${organization_id}`}
      />
      <InfoItem label="Status" value={<StatusBadge status={data?.is_active} />} />
      <InfoItem label="Storage Allocated" value={`${data?.quota_allocated ?? 0} GB`} />
      <InfoItem label="Storage Utilized" value={`${data?.quota_utilized ?? 0} GB`} />
      <InfoItem
        label="Identities Allocated"
        value={
          data?.allocated_email_identities === -1
            ? "Unlimited"
            : (data?.allocated_email_identities ?? 0).toLocaleString()
        }
      />
      <InfoItem
        label="Identities Utilized"
        value={(data?.utilized_email_identities ?? 0).toLocaleString()}
      />
      <InfoItem label="File Service" value={<BooleanIndicator value={data?.file_service_enabled} />} />
    </>
  );
};

const ServerInfo = ({ server_id }) => {
  const { data: server, isLoading, isError } = useGetServer(server_id);

  if (!server_id) {
    return (
      <div className="bg-muted/20 mt-2 rounded p-2 text-center">
        <span className="text-muted-foreground text-xs">
          No server assigned
        </span>
      </div>
    );
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading server info...</p>;
  if (isError) return <p className="text-sm text-destructive">Failed to load server info</p>;

  return (
    <>
      <InfoItem label="Host Name" value={server?.host_name || "--"} link={`/server/${server_id}`} />
      <InfoItem label="Status" value={<StatusBadge status={server?.is_active} />} />
      <InfoItem label="IPv4" value={server?.server_info?.ipv4 || "--"} />
      <InfoItem label="Location" value={server?.server_info?.location || "--"} />
    </>
  );
};

const IdentityLookup = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");

  const { data, isLoading, isError, error, refetch } =
    useGetFullIdentityInfoByAdmin(searchedEmail);
  const info = data?.data ?? null;

  const hasAccess = REQUIRED_PERMISSIONS.every((perm) =>
    permissions.includes(perm),
  );

  const handleSearch = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed) setSearchedEmail(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  if (!hasAccess) {
    return (
      <AccessDenied content="Don't have access to look up full identity info." />
    );
  }

  return (
    <div className="h-full w-full px-2">
      <div className="mb-3 flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Breadcrumbs
            items={[{ name: "Tools" }, { name: "Identity Lookup" }]}
          />
        </div>
      </div>

      <div className="mb-6 mt-8 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 max-w-lg">
          <label className="text-card-foreground mb-1 block text-left text-sm font-medium">
            E-Mail Identity
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="user@domain.com"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pl-10 pr-4 transition-all duration-200 focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!emailInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
            >
              <Search size={16} />
              Look Up
            </button>
          </div>
        </div>
      </div>

      {!searchedEmail ? (
        <div className="bg-card border-border border-dashed rounded-2xl border-2 py-32 text-center shadow-sm">
          <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <UserSearch className="text-muted-foreground/60 h-10 w-10" />
          </div>
          <h3 className="text-foreground text-xl font-semibold">
            Look up an E-Mail Identity
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Enter an email address above to see its full domain, mailbox,
            chat, policy, organization, and server details in one place.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
          <AlertCircle className="text-destructive mx-auto mb-4 h-16 w-16" />
          <h3 className="text-foreground text-lg font-medium">
            {error?.response?.status === 404
              ? "No identity found for this email"
              : "Failed to fetch identity information"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {error?.response?.data?.message || error?.message || ""}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-primary text-primary-foreground rounded-lg px-8 py-2.5 font-medium transition-all hover:opacity-90 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      ) : (
        info && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard icon={User} title="Identity">
              <InfoItem label="Email" value={info.email} link={`/identities/${info.email}`} />
              <InfoItem label="Name" value={`${info.first_name || ""} ${info.last_name || ""}`.trim() || "--"} />
              <InfoItem label="Primary Phone" value={info.primary_phone || "--"} />
              <InfoItem label="Secondary Email" value={info.secondary_email || "--"} />
              <InfoItem label="Status" value={<StatusBadge status={info.is_identity_enabled} />} />
              <InfoItem label="Password Expired" value={<BooleanIndicator value={info.is_password_expired} />} />
              <InfoItem label="App 2FA" value={<BooleanIndicator value={info.is_app_2fa_enabled} />} />
              <InfoItem label="SMS 2FA" value={<BooleanIndicator value={info.is_sms_2fa_enabled} />} />
              <InfoItem label="Email 2FA" value={<BooleanIndicator value={info.is_email_2fa_enabled} />} />
              <InfoItem
                label="Department"
                value={renderResolvedName(GetDepartmentName, info.organization_id, info.department_id)}
              />
            </InfoCard>

            <InfoCard icon={Globe} title="Domain">
              <InfoItem label="Domain" value={info.domain_name} link={`/domain/${info.domain_name}`} />
              <InfoItem label="Status" value={<StatusBadge status={info.is_domain_active} />} />
              <InfoItem label="DNS TXT Verified" value={<BooleanIndicator value={info.is_dns_txt_verified} />} />
              <InfoItem label="Catch All" value={<BooleanIndicator value={info.is_catch_all_enabled} />} />
              <InfoItem label="Hybrid" value={<BooleanIndicator value={info.is_hybrid} />} />
              <InfoItem label="Locked" value={<BooleanIndicator value={info.is_domain_locked} />} />
              <InfoItem label="Session Timeout" value={`${info.session_timeout} minutes`} />
            </InfoCard>

            <InfoCard icon={Inbox} title="Mailbox">
              <InfoItem label="Status" value={<StatusBadge status={info.is_mailbox_enabled} />} />
              <InfoItem label="Locked" value={<BooleanIndicator value={info.is_mailbox_locked} />} />
              <InfoItem label="Quota Allocated" value={`${info.mailbox_quota_allocated ?? 0} GB`} />
              <InfoItem label="Quota Utilized" value={`${bytesToGB(info.mailbox_quota_utilized_bytes).toFixed(2)} GB`} />
              <InfoItem label="Total Messages" value={info.mailbox_total_messages_count ?? 0} />
            </InfoCard>

            {info.is_chat_user_enabled !== undefined && (
              <InfoCard icon={MessageSquare} title="Chat">
                <InfoItem
                  label="Status"
                  value={<StatusBadge status={info.is_chat_user_enabled} />}
                />
              </InfoCard>
            )}

            <InfoCard icon={Shield} title="Policies">
              <InfoItem
                label="Restriction Policy"
                value={renderResolvedName(GetRestrictionPolicyName, info.organization_id, info.restriction_policy_id)}
              />
              <InfoItem
                label="General Policy"
                value={renderResolvedName(GetGeneralPolicyName, info.organization_id, info.general_policy_id)}
              />
              <InfoItem
                label="Forwarding Policy"
                value={renderResolvedName(GetForwardingPolicyName, info.organization_id, info.forwarding_policy_id)}
              />
              <InfoItem
                label="Distribution Policy"
                value={renderResolvedName(GetDistributionPolicyName, info.organization_id, info.distribution_policy_id)}
              />
              <InfoItem
                label="Filter Policy"
                value={renderResolvedName(GetFiltersPolicyName, info.organization_id, info.filter_policy_id)}
              />
              <InfoItem
                label="Attachment Policy"
                value={renderResolvedName(GetAttachmentPolicyName, info.organization_id, info.attachment_policy_id, {
                  domain_name: info.domain_name,
                })}
              />
              <InfoItem
                label="Disclaimer"
                value={renderResolvedName(GetDisclaimerName, info.organization_id, info.disclaimer_id)}
              />
              <InfoItem
                label="Caution"
                value={renderResolvedName(GetCautionName, info.organization_id, info.caution_id)}
              />
            </InfoCard>

            <InfoCard icon={Building2} title="Organization">
              <OrganizationInfo organization_id={info.organization_id} />
            </InfoCard>

            <InfoCard icon={Server} title="Server">
              <ServerInfo server_id={info.server_id} />
            </InfoCard>
          </div>
        )
      )}
    </div>
  );
};

export default IdentityLookup;
