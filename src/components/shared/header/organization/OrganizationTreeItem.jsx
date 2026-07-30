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
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  Building2,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useGetOrganizations } from "@/hooks/useOrganization";
import OrganizationLogo from "../../OrgLogo";
import IdentityProgress from "@/components/common/IdentityProgress";
import { BASE_ORG } from "@/constants/constants";

const OrganizationTreeItem = ({
  organization,
  level = 0,
  selectedOrgId,
  onSelect,
  expandedOrgs,
  setExpandedOrgs,
}) => {
  const [children, setChildren] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const isExpanded = expandedOrgs.has(organization.organization_id);
  const baseOrgName = BASE_ORG;
  const indentWidth = level * 20;

  const { data, isLoading, isError } = useGetOrganizations(
    pagination.pageIndex + 1,
    pagination.pageSize,
    isExpanded ? organization.organization_id : null,
  );

  const totalPages = data?.total_pages ?? 1;
  const currentPage = pagination.pageIndex + 1;

  useEffect(() => {
    if (data && isExpanded) {
      setChildren(data.organizations || []);
    }
  }, [data, isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setChildren([]);
      setPagination({ pageIndex: 0, pageSize: 10 }); // Reset pagination when collapsed
    }
  }, [isExpanded]);

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

  // Child level pagination component
  const renderChildPagination = () => {
    if (!isExpanded || totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 1; // Show 1 page on each side of current
      const left = Math.max(1, currentPage - delta);
      const right = Math.min(totalPages, currentPage + delta);
      const pages = [];

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="border-b border-border bg-muted/5">
        <div
          className="flex items-center justify-between py-2 px-4"
          style={{ paddingLeft: `${16 + indentWidth + 32}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} • {data?.total_count || 0}{" "}
              child organizations
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
              disabled={currentPage === 1 || isLoading}
              className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-3 h-3" />
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.max(0, prev.pageIndex - 1),
                }))
              }
              disabled={currentPage === 1 || isLoading}
              className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Page numbers */}
            {getVisiblePages().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: pageNum - 1 }))
                }
                disabled={isLoading}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  pageNum === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground border border-border"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
                }))
              }
              disabled={currentPage === totalPages || isLoading}
              className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: totalPages - 1,
                }))
              }
              disabled={currentPage === totalPages || isLoading}
              className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
          {/* Render pagination controls */}
          {renderChildPagination()}

          {isError ? (
            <div
              className="text-destructive text-xs py-2 px-4 italic"
              style={{ paddingLeft: `${16 + indentWidth + 32}px` }}
            >
              Failed to load child organizations
            </div>
          ) : children.length > 0 ? (
            children.map((childOrg) => (
              <OrganizationTreeItem
                key={childOrg.organization_id}
                organization={childOrg}
                level={level + 1}
                selectedOrgId={selectedOrgId}
                onSelect={onSelect}
                expandedOrgs={expandedOrgs}
                setExpandedOrgs={setExpandedOrgs}
              />
            ))
          ) : (
            !isLoading && (
              <div
                className="text-muted-foreground text-center text-xs py-2 px-4 italic"
                style={{ paddingLeft: `${16 + indentWidth + 32}px` }}
              >
                No further organizations
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationTreeItem;
