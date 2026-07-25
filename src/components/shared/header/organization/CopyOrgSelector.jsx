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

import { ChevronDown, X, Building2, Loader2, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import {
  useGetOrganizationDetail,
  useGetOrganizations,
} from "@/hooks/useOrganization";
import OrganizationLogo from "../../OrgLogo";
import OrganizationTreeItem from "./OrganizationTreeItem";

const CopyOrganizationSelector = ({
  selectedOrgId,
  selectedOrgName,
  onSelect,
  placeholder = "Select Organization",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState(new Set());
  const profile = useAtomValue(userProfileAtom);

  const { data, isLoading } = useGetOrganizations(
    1,
    50,
    profile?.organization_id || null,
  );
  const { data: profileOrgDetails } = useGetOrganizationDetail(
    profile?.organization_id,
  );

  const handleLocalSelect = (org) => {
    onSelect({
      organization_id: org.organization_id,
      organization_name: org.organization_name,
    });
    setIsOpen(false);
  };

  const organizationsToDisplay = useMemo(() => {
    const orgs = [];
    if (profileOrgDetails) {
      orgs.push({ ...profileOrgDetails, isParentOrg: true });
    }
    if (data?.organizations) {
      orgs.push(...data.organizations);
    }
    return orgs;
  }, [profileOrgDetails, data?.organizations]);

  const ParentOrgItem = ({ organization, isSelected }) => (
    <div
      onClick={() => handleLocalSelect(organization)}
      className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary border-primary border-l-2"
          : "hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <OrganizationLogo
        organizationId={organization.organization_id}
        organizationName={organization.organization_name}
        size="xs"
        showUpload={false}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-left text-sm font-medium">
            {organization.organization_name}
          </span>
          <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
            Parent
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-background w-fit hover:bg-accent border-border inline-flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2">
          {selectedOrgId ? (
            <OrganizationLogo
              organizationId={selectedOrgId}
              organizationName={selectedOrgName}
              size="xs"
              showUpload={false}
            />
          ) : (
            <Building2 className="h-4 w-4 opacity-60" />
          )}
          <span className="truncate">{selectedOrgName || placeholder}</span>
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-60" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="bg-card border-border max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border shadow-lg">
            <div className="border-border flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Building2 className="text-primary h-5 w-5" />
                <h2 className="text-lg font-semibold">Select Organization</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="py-2">
                  {organizationsToDisplay.map((org) =>
                    org.isParentOrg ? (
                      <ParentOrgItem
                        key={`parent-${org.organization_id}`}
                        organization={org}
                        isSelected={selectedOrgId === org.organization_id}
                      />
                    ) : (
                      <OrganizationTreeItem
                        key={org.organization_id}
                        organization={org}
                        level={0}
                        selectedOrgId={selectedOrgId}
                        onSelect={handleLocalSelect}
                        expandedOrgs={expandedOrgs}
                        setExpandedOrgs={setExpandedOrgs}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CopyOrganizationSelector;
