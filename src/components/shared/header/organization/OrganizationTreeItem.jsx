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

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { useInfiniteOrganizations } from "@/hooks/useOrganization";
import OrganizationLogo from "../../OrgLogo";
import IdentityProgress from "@/components/common/IdentityProgress";
import { BASE_ORG } from "@/constants/constants";
import OrgChildSearch from "./OrgChildSearch";
import LoadMoreTrigger from "./LoadMoreTrigger";

const OrganizationTreeItem = ({
  organization,
  level = 0,
  selectedOrgId,
  onSelect,
  expandedOrgs,
  setExpandedOrgs,
}) => {
  const [childQuery, setChildQuery] = useState("");
  // Sticky once this level has been seen to have any children, so the
  // search box doesn't vanish when a search matches nothing.
  const [isSearchable, setIsSearchable] = useState(false);

  const isExpanded = expandedOrgs.has(organization.organization_id);
  const baseOrgName = BASE_ORG;
  const indentWidth = level * 20;

  const {
    organizations,
    totalCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteOrganizations(
    isExpanded ? organization.organization_id : null,
    childQuery,
  );
  const children = isExpanded ? organizations : [];

  useEffect(() => {
    if (!isExpanded) {
      setChildQuery("");
      setIsSearchable(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!childQuery && totalCount > 0) setIsSearchable(true);
  }, [totalCount, childQuery]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpandedOrgs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(organization.organization_id)) {
        newSet.delete(organization.organization_id);
      } else {
        newSet.add(organization.organization_id);
      }
      return newSet;
    });
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(organization);
  };

  const isSelected = selectedOrgId === organization.organization_id;

  if (baseOrgName && organization.organization_name === baseOrgName) {
    return null;
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-3 px-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 group ${
          isSelected
            ? "bg-primary/10 text-primary border-r-2 border-primary"
            : "text-card-foreground hover:text-foreground"
        }`}
        style={{ paddingLeft: `${16 + indentWidth}px` }}
        onClick={handleSelect}
      >
        {/* Toggle button */}
        <div className="flex items-center justify-center w-5 h-5 mr-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center justify-center w-5 h-5 hover:bg-accent rounded transition-colors"
          >
            {isLoading && isExpanded ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            )}
          </button>
        </div>

        {/* Organization icon */}
        <div className="mr-3 flex-shrink-0">
          <OrganizationLogo
            organizationId={organization.organization_id}
            organizationName={organization.organization_name}
            size="xs"
            showUpload={false}
            className={`transition-opacity ${isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
          />
        </div>

        {/* Organization details */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium mb-1 text-left ${
              isSelected ? "font-semibold" : ""
            }`}
          >
            {organization.organization_name}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                organization.is_active
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {organization.is_active ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-muted-foreground">
              {organization.quota_utilized}GB / {organization.quota_allocated}GB
            </span>
            <IdentityProgress
              utilized={organization.utilized_email_identities}
              allocated={organization.allocated_email_identities}
              className="!text-xs"
            />
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0" />
        )}
      </div>

      {/* Child organizations */}
      {isExpanded && (
        <div className="bg-muted/20">
          {(isSearchable || childQuery) && (
            <OrgChildSearch
              parentName={organization.organization_name}
              onSearch={setChildQuery}
              paddingLeft={16 + indentWidth + 32}
            />
          )}

          {isError ? (
            <div
              className="text-destructive text-xs py-2 px-4 italic"
              style={{ paddingLeft: `${16 + indentWidth + 32}px` }}
            >
              Failed to load child organizations
            </div>
          ) : children.length > 0 ? (
            <>
              {children.map((childOrg) => (
                <OrganizationTreeItem
                  key={childOrg.organization_id}
                  organization={childOrg}
                  level={level + 1}
                  selectedOrgId={selectedOrgId}
                  onSelect={onSelect}
                  expandedOrgs={expandedOrgs}
                  setExpandedOrgs={setExpandedOrgs}
                />
              ))}
              <LoadMoreTrigger
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                paddingLeft={16 + indentWidth + 32}
              />
            </>
          ) : (
            !isLoading && (
              <div
                className="text-muted-foreground text-center text-xs py-2 px-4 italic"
                style={{ paddingLeft: `${16 + indentWidth + 32}px` }}
              >
                {childQuery
                  ? `No sub-organizations match "${childQuery}"`
                  : "No further organizations"}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationTreeItem;
