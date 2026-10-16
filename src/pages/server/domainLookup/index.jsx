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
import { Link } from "react-router-dom";
import {
  Globe,
  Search,
  AlertCircle,
  RefreshCw,
  Building2,
  Network,
  Loader2,
} from "lucide-react";
import { userProfileAtom } from "@/store/userProfile";
import { useDomainLookup, useGetDomain } from "@/hooks/useDomain";
import { useUserTimezone } from "@/hooks/useTimezone";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import StatusBadge from "@/components/common/StatusBadge";

const BooleanIndicator = ({ value }) => (
  <div
    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
      value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
    }`}
  >
    {value ? "Yes" : "No"}
  </div>
);

// Root -> ... -> the org that manages the domain. `full_hierarchy` starts at
// the platform root, so it can include orgs above the viewer's own org -
// those are shown as plain text since their details pages would 403.
const HierarchyChain = ({ hierarchy, ownOrgId }) => {
  const ownIndex = hierarchy.findIndex(
    (org) => org.organization_id === ownOrgId,
  );

  return (
    <ol className="relative mt-1">
      {hierarchy.map((org, index) => {
        const isManaging = index === hierarchy.length - 1;
        const isOwn = index === ownIndex;
        const isLinkable = ownIndex !== -1 && index >= ownIndex;

        return (
          <li
            key={org.organization_id}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {/* Connector line between steps */}
            {!isManaging && (
              <span className="bg-border absolute top-7 left-[13px] h-[calc(100%-1.25rem)] w-px" />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                isManaging
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                {isLinkable ? (
                  <Link
                    to={`/organization/${org.organization_id}`}
                    className="text-primary truncate text-sm font-medium hover:underline"
                  >
                    {org.organization_name}
                  </Link>
                ) : (
                  <span className="text-card-foreground truncate text-sm font-medium">
                    {org.organization_name}
                  </span>
                )}
                <StatusBadge status={org.is_active} />
                {isOwn && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                    Your organization
                  </span>
                )}
                {isManaging && (
                  <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs">
                    Manages this domain
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                {org.organization_id}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

// Regular domain details via the normal /domain/details endpoint - only
// fetched when the viewer also has "domain:view".
const DomainDetails = ({ domain_name }) => {
  const { data, isLoading, isError } = useGetDomain(domain_name);
  const { formatUserDateNice } = useUserTimezone();
  const domain = data?.domain_details ?? null;

  if (isLoading)
    return (
      <p className="text-muted-foreground text-sm">Loading domain details...</p>
    );
  if (isError || !domain)
    return (
      <p className="text-destructive text-sm">Failed to load domain details</p>
    );

  return (
    <>
      <InfoItem
        label="Domain"
        value={domain_name}
        link={`/domain/${domain_name}`}
      />
      <InfoItem
        label="Status"
        value={<StatusBadge status={domain.is_active} />}
      />
      <InfoItem
        label="DNS TXT Verified"
        value={<BooleanIndicator value={domain.is_dns_txt_verified} />}
      />
      <InfoItem
        label="Catch All"
        value={<BooleanIndicator value={domain.catch_all} />}
      />
      <InfoItem
        label="Hybrid"
        value={<BooleanIndicator value={domain.is_hybrid} />}
      />
      <InfoItem
        label="Session Timeout"
        value={
          domain.session_timeout ? `${domain.session_timeout} minutes` : "--"
        }
      />
      <InfoItem
        label="Created"
        value={domain.created_at ? formatUserDateNice(domain.created_at) : "--"}
      />
    </>
  );
};

const lookupErrorMessage = (error, domain) => {
  if (error?.status === 404) return `No domain named "${domain}" was found.`;
  if (error?.status === 403)
    return `You don't have access to the organization that manages "${domain}".`;
  return error?.message || "Failed to look up domain.";
};

const DomainLookup = () => {
  const { permissions = [], organization_id: ownOrgId } =
    useAtomValue(userProfileAtom) || {};
  const [domainInput, setDomainInput] = useState("");
  const [searchedDomain, setSearchedDomain] = useState("");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDomainLookup(searchedDomain);
  const info = data?.organization_details ?? null;
  const hierarchy = info?.full_hierarchy ?? [];
  // The root org is stored as its own parent - treat that as "no parent".
  const isRootOrg =
    !info?.parent_organization_id ||
    info.parent_organization_id === info.organization_id;
  const parentOrgName = isRootOrg
    ? "None (root organization)"
    : hierarchy[hierarchy.length - 2]?.organization_name ||
      info.parent_organization_id;
  const canViewDomain = permissions.includes("domain:view");

  const handleSearch = () => {
    const trimmed = domainInput.trim().toLowerCase();
    if (trimmed) setSearchedDomain(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  if (!permissions.includes("domain:admin:view")) {
    return <AccessDenied content="Don't have access to look up domains." />;
  }

  return (
    <div className="h-full w-full px-2">
      <div className="mb-3 flex w-full items-center justify-between">
        <Breadcrumbs items={[{ name: "Tools" }, { name: "Domain Lookup" }]} />
      </div>

      <div className="mt-8 mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="max-w-lg flex-1">
          <label className="text-card-foreground mb-1 block text-left text-sm font-medium">
            Domain Name
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="example.com"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pr-4 pl-10 transition-all duration-200 focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!domainInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={16} />
              Look Up
            </button>
          </div>
        </div>
      </div>

      {!searchedDomain ? (
        <div className="bg-card border-border rounded-2xl border-2 border-dashed py-32 text-center shadow-sm">
          <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Network className="text-muted-foreground/60 h-10 w-10" />
          </div>
          <h3 className="text-foreground text-xl font-semibold">
            Look up a Domain
          </h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
            Enter a domain name above to see which organization manages it and
            where that organization sits in the hierarchy.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="text-primary mr-3 h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">
            Looking up {searchedDomain}...
          </span>
        </div>
      ) : isError ? (
        <div className="bg-card border-border rounded-2xl border py-16 text-center shadow-sm">
          <AlertCircle className="text-destructive mx-auto mb-4 h-10 w-10" />
          <p className="text-foreground font-medium">
            {lookupErrorMessage(error, searchedDomain)}
          </p>
          {error?.status !== 404 && error?.status !== 403 && (
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-primary mt-4 inline-flex items-center gap-2 text-sm hover:underline disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
              Try again
            </button>
          )}
        </div>
      ) : info ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoCard icon={Building2} title="Managing Organization">
            <InfoItem
              label="Organization"
              value={info.organization_name}
              link={`/organization/${info.organization_id}`}
            />
            <InfoItem
              label="Status"
              value={<StatusBadge status={info.is_active} />}
            />
            <InfoItem label="Organization ID" value={info.organization_id} />
            <InfoItem label="Parent Organization" value={parentOrgName} />
            <InfoItem label="Hierarchy Depth" value={hierarchy.length} />
          </InfoCard>

          {canViewDomain && (
            <InfoCard icon={Globe} title="Domain">
              <DomainDetails domain_name={info.domain_name} />
            </InfoCard>
          )}

          <InfoCard
            icon={Network}
            title="Organization Hierarchy"
            className="lg:col-span-2"
          >
            {hierarchy.length > 0 ? (
              <HierarchyChain hierarchy={hierarchy} ownOrgId={ownOrgId} />
            ) : (
              <p className="text-muted-foreground text-sm">
                No hierarchy information returned.
              </p>
            )}
          </InfoCard>
        </div>
      ) : null}
    </div>
  );
};

export default DomainLookup;
