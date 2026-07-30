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
  ChevronDown,
  X,
  Building2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import OrganizationTreeItem from "./OrganizationTreeItem";
import {
  useGetOrganizationDetail,
  useGetOrganizations,
} from "@/hooks/useOrganization";
import { userProfileAtom } from "@/store/userProfile";
import OrganizationLogo from "../../OrgLogo";
import IdentityProgress from "@/components/common/IdentityProgress";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo"; // ✅ New Hook

const OrganizationSelector = ({
  selectedOrgId,
  selectedOrgName,
  onSelect,
  // Optional gate called with the clicked organization right before it
  // would be auto-applied (written to the atoms/uiInfo). Return `false` to
  // veto the auto-apply for this click - onSelect still fires so the
  // caller can apply it itself later (e.g. after a confirmation modal).
  onBeforeSelect,
  placeholder = "Select Organization",
  label = "Organization:",
  disabled = false,
  excludeOrgId = null,
  showLabel = true,
  className = "",
  saveToUiInfo = true,
  uiInfoKey = "lastSelectedOrganization",
  skipApiLoad = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const profile = useAtomValue(userProfileAtom);
  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);
  const [, setUserInfo] = useAtom(userInfoAtom);

  // ✅ Replaced manual Atom/Query logic with useSyncedUiInfo
  const { 
    uiInfo, 
    updateUiInfo, 
    isLoading: isLoadingUiInfo, 
    isSaving: isSavingUiInfo 
  } = useSyncedUiInfo();

  const { data, isLoading, isError } = useGetOrganizations(
    pagination.pageIndex + 1,
    pagination.pageSize,
    profile?.organization_id || null,
  );

  const { data: profileOrgDetails } = useGetOrganizationDetail(
    profile?.organization_id,
  );

  // `data` above only ever holds the currently-loaded page of child orgs
  // (default: first 10). A validly-selected org further down the list can
  // legitimately be missing from it, which would otherwise make
  // isOrganizationAccessible() wrongly conclude "not accessible" and reset
  // the selection back to the parent org on reload. Look the stored
  // selection up directly by ID instead of trusting pagination for it.
  const storedSelectionOrgId =
    uiInfo?.organizationSelector?.[uiInfoKey]?.organization_id || null;
  const needsStoredOrgLookup =
    !!storedSelectionOrgId &&
    storedSelectionOrgId !== profile?.organization_id &&
    !data?.organizations?.some(
      (org) => org.organization_id === storedSelectionOrgId,
    );

  const { data: storedOrgDetails, isLoading: isLoadingStoredOrg } =
    useGetOrganizationDetail(needsStoredOrgLookup ? storedSelectionOrgId : null);

  // Helper to safely get stored data from the hook
  const getStoredOrgSelection = () => {
    // If skipping API load, we rely on whatever is currently in uiInfo (likely local state)
    // The hook manages the hydration, so uiInfo is safe to access
    return uiInfo?.organizationSelector?.[uiInfoKey] || null;
  };

  // ✅ Store Function with Deep Merge Logic
  // We must preserve other keys in organizationSelector
  const storeOrgSelection = (orgData, skipApiCall = false) => {
    if (!saveToUiInfo) return;

    // Get current state of all selectors to prevent overwriting others
    const currentSelectorState = uiInfo?.organizationSelector || {};

    // Only persist the identity of the selection, never the org's live
    // service flags/quota - those must always be re-fetched on init so an
    // edit made from another account/session can't leave a stale snapshot
    // behind (see init logic below, which re-derives them every time).
    const newSelectionData = {
      organization_id: orgData.organization_id,
      organization_name: orgData.organization_name,
      selectedAt: new Date().toISOString(),
      ...(orgData.parent_organization_id && {
        parent_organization_id: orgData.parent_organization_id,
      }),
      ...(orgData.organization_type && {
        organization_type: orgData.organization_type,
      }),
    };

    updateUiInfo(
      {
        organizationSelector: {
          ...currentSelectorState, // Preserve other uiInfoKeys (e.g. sidebar selection)
          [uiInfoKey]: newSelectionData,
        },
      },
      {
        localOnly: skipApiCall,
        onError: (error) => {
          console.error(`Failed to save organization selection for key: ${uiInfoKey}`, error);
        },
      }
    );
  };

  // ✅ Clear Function with Deep Merge Logic
  const clearInvalidStoredSelection = () => {
    const currentSelectorState = uiInfo?.organizationSelector || {};
    
    updateUiInfo({
      organizationSelector: {
        ...currentSelectorState,
        [uiInfoKey]: null,
      },
    }, { localOnly: true }); // Usually local clean up is sufficient
  };

  const isOrganizationAccessible = (orgId) => {
    if (profileOrgDetails && orgId === profileOrgDetails.organization_id) {
      return true;
    }
    const foundInChildren = data?.organizations?.some(
      (org) => org.organization_id === orgId,
    );
    if (foundInChildren) return true;

    // Not on the loaded page - fall back to the direct by-ID lookup rather
    // than assuming inaccessible.
    return !!(storedOrgDetails && storedOrgDetails.organization_id === orgId);
  };

  const getFallbackOrganization = () => {
    if (profileOrgDetails) {
      return {
        organization_id: profileOrgDetails.organization_id,
        organization_name: profileOrgDetails.organization_name,
        parent_organization_id: profileOrgDetails.parent_organization_id,
        organization_type: profileOrgDetails.organization_type,
        created_at: profileOrgDetails.created_at,
        is_active: profileOrgDetails.is_active,
        quota_allocated: profileOrgDetails.quota_allocated || 0,
        quota_utilized: profileOrgDetails.quota_utilized || 0,
        allocated_email_identities: profileOrgDetails.allocated_email_identities ?? 0,
        utilized_email_identities: profileOrgDetails.utilized_email_identities ?? 0,
        chat_service_enabled: profileOrgDetails.chat_service_enabled ?? false,
        email_service_enabled: profileOrgDetails.email_service_enabled ?? false,
      };
    }
    return null;
  };

  const updateUserInfoAtom = (organization) => {
    setUserInfo((prev) => ({
      ...prev,
      organization_id: organization.organization_id,
      organization_name: organization.organization_name,
      chat_service_enabled: organization.chat_service_enabled ?? false,
      email_service_enabled: organization.email_service_enabled ?? false,
    }));
  };

  // Initialization Logic
  useEffect(() => {
    // 1. BLOCKING: Don't run if we are already initialized
    if (isInitialized) return;

    // 2. BLOCKING: Wait for UI Info to sync (unless explicitly skipping logic)
    if (!skipApiLoad && isLoadingUiInfo) return;

    // 3. BLOCKING: Wait for Profile Org Details and Data
    if (!profile?.organization_id || (isLoading && !data)) return;

    // 4. BLOCKING: Wait for the direct by-ID lookup of the stored
    // selection if it wasn't on the loaded page of child orgs - otherwise
    // isOrganizationAccessible() below would run before it resolves and
    // wrongly reset the selection to the parent org.
    if (needsStoredOrgLookup && isLoadingStoredOrg) return;

    // --- LOGIC START ---

    // Case A: No Organization currently selected in App State
    if (!selectedOrgId) {
      if (saveToUiInfo) {
        const storedOrgSelection = getStoredOrgSelection();

        if (storedOrgSelection) {
          const isAccessible = isOrganizationAccessible(storedOrgSelection.organization_id);

          if (isAccessible) {
            // The stored selection only carries the org's identity (see
            // storeOrgSelection) - always re-derive the live fields
            // (chat/email service flags, quota, is_active) from a fresh
            // source rather than trusting anything persisted, so a change
            // made from another account/session is always picked up.
            let completeOrgData = null;

            if (
              profileOrgDetails &&
              profileOrgDetails.organization_id === storedOrgSelection.organization_id
            ) {
              completeOrgData = { ...storedOrgSelection, ...profileOrgDetails };
            } else {
              const foundInChildren = data?.organizations?.find(
                (org) => org.organization_id === storedOrgSelection.organization_id,
              );
              if (foundInChildren) {
                completeOrgData = { ...storedOrgSelection, ...foundInChildren };
              } else if (
                storedOrgDetails &&
                storedOrgDetails.organization_id === storedOrgSelection.organization_id
              ) {
                completeOrgData = { ...storedOrgSelection, ...storedOrgDetails };
              }
            }

            if (completeOrgData) {
              completeOrgData.quota_allocated = completeOrgData.quota_allocated || 0;
              completeOrgData.quota_utilized = completeOrgData.quota_utilized || 0;
              completeOrgData.allocated_email_identities = completeOrgData.allocated_email_identities ?? 0;
              completeOrgData.utilized_email_identities = completeOrgData.utilized_email_identities ?? 0;
              completeOrgData.chat_service_enabled = completeOrgData.chat_service_enabled ?? false;
              completeOrgData.email_service_enabled = completeOrgData.email_service_enabled ?? false;

              updateUserInfoAtom(completeOrgData);
              if (onSelect) onSelect(completeOrgData);

              setIsInitialized(true);
              return;
            }
            // Unreachable in practice: isOrganizationAccessible() only
            // returns true via one of the same three sources checked above,
            // so completeOrgData is always resolved here. Falls through to
            // the parent-org fallback below as a safety net if it isn't.
          } else {
            // Stored ID is not accessible anymore
            clearInvalidStoredSelection();
            
            // Proceed to fallback
            const fallbackOrg = getFallbackOrganization();
            if (fallbackOrg) {
              updateUserInfoAtom(fallbackOrg);
              storeOrgSelection(fallbackOrg, false);
              if (onSelect) onSelect(fallbackOrg);
            }
          }
        } else {
          // No stored selection, use fallback
          const fallbackOrg = getFallbackOrganization();
          if (fallbackOrg) {
            updateUserInfoAtom(fallbackOrg);
            storeOrgSelection(fallbackOrg, false);
            if (onSelect) onSelect(fallbackOrg);
          }
        }
      } else {
        // Not saving to UI info, just set fallback
        const fallbackOrg = getFallbackOrganization();
        if (fallbackOrg) {
          updateUserInfoAtom(fallbackOrg);
          if (onSelect) onSelect(fallbackOrg);
        }
      }
    }

    // Case B: Organization IS selected (e.g. from Redux/Atom persistence)
    else if (selectedOrgId) {
      if (saveToUiInfo) {
        const stored = getStoredOrgSelection();

        // If nothing stored, or stored ID doesn't match current selection, sync storage
        if (!stored || stored.organization_id !== selectedOrgId) {
          if (
            profileOrgDetails &&
            profileOrgDetails.organization_id === selectedOrgId
          ) {
            storeOrgSelection(profileOrgDetails, false);
          } else {
            const fullOrg = data?.organizations?.find(
              (o) => o.organization_id === selectedOrgId,
            );
            if (fullOrg) {
              storeOrgSelection(fullOrg, false);
            }
          }
        }
      }
    }
    
    setIsInitialized(true);
  }, [
    isLoadingUiInfo,
    isInitialized,
    selectedOrgId,
    saveToUiInfo,
    uiInfoKey,
    skipApiLoad,
    profile?.organization_id,
    data,
    isLoading,
    profileOrgDetails,
    uiInfo, // Dependent on uiInfo changes from hook
    needsStoredOrgLookup,
    isLoadingStoredOrg,
    storedOrgDetails,
  ]);

  useEffect(() => {
    if (profileOrgDetails && profile?.organization_id && !selectedOrg) {
      setSelectedOrg(profileOrgDetails);
    }
  }, [profileOrgDetails, profile?.organization_id, selectedOrg, setSelectedOrg]);

  const totalPages = data?.total_pages ?? 1;
  const currentPage = pagination.pageIndex + 1;

  const handleSelect = (organization) => {
    let completeOrgData = organization;

    if (
      organization.quota_allocated === undefined ||
      organization.quota_utilized === undefined
    ) {
      if (
        profileOrgDetails &&
        organization.organization_id === profileOrgDetails.organization_id
      ) {
        completeOrgData = {
          ...organization,
          quota_allocated: profileOrgDetails.quota_allocated || 0,
          quota_utilized: profileOrgDetails.quota_utilized || 0,
          allocated_email_identities: profileOrgDetails.allocated_email_identities ?? 0,
          utilized_email_identities: profileOrgDetails.utilized_email_identities ?? 0,
          created_at: profileOrgDetails.created_at,
          is_active: profileOrgDetails.is_active,
          chat_service_enabled: profileOrgDetails.chat_service_enabled ?? false,
          email_service_enabled: profileOrgDetails.email_service_enabled ?? false,
        };
      } else {
        completeOrgData = {
          ...organization,
          quota_allocated: organization.quota_allocated || 0,
          quota_utilized: organization.quota_utilized || 0,
          allocated_email_identities: organization.allocated_email_identities ?? 0,
          utilized_email_identities: organization.utilized_email_identities ?? 0,
          created_at: organization.created_at,
          is_active: organization.is_active !== undefined ? organization.is_active : true,
          chat_service_enabled: organization.chat_service_enabled ?? false,
          email_service_enabled: organization.email_service_enabled ?? false,
        };
      }
    }

    // Lets a caller (e.g. the header switcher, which confirms before
    // applying) veto the automatic apply below. onBeforeSelect receives
    // the full organization data and is fully responsible for whatever
    // happens next (e.g. stashing it and applying later once the user
    // confirms) - onSelect is intentionally not called here, since this
    // click hasn't actually been applied.
    if (onBeforeSelect && onBeforeSelect(completeOrgData) === false) {
      setIsOpen(false);
      return;
    }

    updateUserInfoAtom(completeOrgData);

    if (saveToUiInfo) {
      storeOrgSelection(completeOrgData, false);
    }

    onSelect(completeOrgData);
    setIsOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPagination({ pageIndex: 0, pageSize: 10 });
    setExpandedOrgs(new Set());
  };

  const ParentOrganizationItem = ({ organization, selectedOrgId, onSelect }) => {
    const isSelected = selectedOrgId === organization.organization_id;

    return (
      <div
        onClick={() => onSelect(organization)}
        className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
          isSelected
            ? "bg-primary/10 text-primary border-primary border-l-2"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <div className="flex-shrink-0">
          <OrganizationLogo
            organizationId={organization.organization_id}
            organizationName={organization.organization_name}
            size="xs"
            showUpload={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-left text-sm font-medium">
                {organization.organization_name}
              </span>
              <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                Parent
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                  organization.is_active
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {organization.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-muted-foreground text-xs">
                {organization.quota_utilized || 0}GB /{" "}
                {organization.quota_allocated || 0}GB
              </span>
              <IdentityProgress
                utilized={organization.utilized_email_identities}
                allocated={organization.allocated_email_identities}
                className="!text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredOrganizations = useMemo(() => {
    if (!data?.organizations) return [];
    let filtered = data.organizations;
    if (excludeOrgId) {
      filtered = filtered.filter((org) => org.organization_id !== excludeOrgId);
    }
    return filtered;
  }, [data?.organizations, excludeOrgId]);

  const organizationsToDisplay = useMemo(() => {
    const orgs = [];
    if (profileOrgDetails && profileOrgDetails.organization_id !== excludeOrgId) {
      orgs.push({
        ...profileOrgDetails,
        isParentOrg: true,
      });
    }
    orgs.push(...filteredOrganizations);
    return orgs;
  }, [profileOrgDetails, filteredOrganizations, excludeOrgId]);

  const displayName = useMemo(() => {
    if (isLoading && !data && !profileOrgDetails) return "Loading...";
    if (isError && !data && !profileOrgDetails) return "Error loading";
    
    // Check saveToUiInfo logic if no explicit selectedOrgName provided
    if (saveToUiInfo && !selectedOrgName) {
        const stored = getStoredOrgSelection();
        if (stored?.organization_name) return stored.organization_name;
    }

    if (selectedOrgName) return selectedOrgName;
    
    if (profileOrgDetails && profileOrgDetails.organization_id === selectedOrgId) {
        return profileOrgDetails.organization_name;
    }

    const foundOrg = data?.organizations?.find(o => o.organization_id === selectedOrgId);
    if (foundOrg) return foundOrg.organization_name;

    return placeholder;
  }, [
    data?.organizations,
    selectedOrgId,
    selectedOrgName,
    isLoading,
    isError,
    placeholder,
    profileOrgDetails,
    uiInfo // Added dependency on hook state
  ]);

  const effectiveSelectedOrgId = useMemo(() => {
    if (selectedOrgId) return selectedOrgId;
    if (saveToUiInfo) {
      const stored = getStoredOrgSelection();
      return stored?.organization_id || null;
    }
    return null;
  }, [selectedOrgId, saveToUiInfo, uiInfoKey, uiInfo]);

  const renderRootPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 1;
      const left = Math.max(1, currentPage - delta);
      const right = Math.min(totalPages, currentPage + delta);
      const pages = [];
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="border-border bg-muted/10 flex items-center justify-between border-t p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-muted-foreground text-xs font-medium">
            Per page:
          </label>
          <select
            id="pageSize"
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
                pageIndex: 0,
              }));
              setExpandedOrgs(new Set());
            }}
            className="border-border bg-background rounded border px-2 py-1 text-xs"
          >
            {[10, 25, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize} className="bg-background">
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={currentPage === 1 || isLoading}
            className="hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors disabled:opacity-50"
            title="First page"
          >
            <ChevronsLeft className="h-3 w-3" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(0, prev.pageIndex - 1),
              }))
            }
            disabled={currentPage === 1 || isLoading}
            className="hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors disabled:opacity-50"
            title="Previous page"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>

          {getVisiblePages().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: pageNum - 1 }))
              }
              disabled={isLoading}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                pageNum === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground border-border border"
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
            className="hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors disabled:opacity-50"
            title="Next page"
          >
            <ChevronRight className="h-3 w-3" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }))
            }
            disabled={currentPage === totalPages || isLoading}
            className="hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors disabled:opacity-50"
            title="Last page"
          >
            <ChevronsRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  // Only show loading if we are blocked from initializing and API load is not skipped
  if (!skipApiLoad && isLoadingUiInfo && !isInitialized && saveToUiInfo) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-muted-foreground text-sm font-medium">
            {label}
          </span>
        )}
        <div className="bg-accent/50 border-border inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium opacity-50">
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
          <span className="max-w-40 truncate">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-muted-foreground text-sm font-medium">
            {label}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={disabled || (isLoading && !data && !profileOrgDetails)}
          className="bg-accent/50 hover:bg-accent text-foreground border-border focus:ring-primary/20 relative inline-flex items-center gap-2 rounded-lg border px-3 py-0.5 text-sm font-medium transition-all duration-200 hover:shadow-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {effectiveSelectedOrgId ? (
            <OrganizationLogo
              organizationId={effectiveSelectedOrgId}
              organizationName={displayName}
              size="xs"
              showUpload={false}
              className="flex-shrink-0"
            />
          ) : (
            <Building2 className="h-4 w-4 flex-shrink-0 opacity-60" />
          )}
          <span className="max-w-40 truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-60" />

          {isSavingUiInfo && saveToUiInfo && (
            <div className="bg-success absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          <div className="bg-card border-border max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border shadow-lg">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Building2 className="text-primary h-5 w-5" />
                <h2 className="text-card-foreground text-lg font-semibold">
                  {excludeOrgId ? "Select Parent Organization" : "Select Organization"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:text-destructive hover:bg-muted rounded-md p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="no-scrollbar max-h-96 overflow-y-auto">
              {isLoading && !data && !profileOrgDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-primary mr-3 h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">
                    Loading organizations...
                  </span>
                </div>
              ) : isError && !data && !profileOrgDetails ? (
                <div className="text-destructive flex items-center justify-center py-8">
                  <span>Failed to load organizations</span>
                </div>
              ) : !organizationsToDisplay || organizationsToDisplay.length === 0 ? (
                <div className="text-muted-foreground flex items-center justify-center py-8">
                  <span>No organizations available</span>
                </div>
              ) : (
                <div className="py-2">
                  {organizationsToDisplay.map((org) =>
                    org.isParentOrg ? (
                      <ParentOrganizationItem
                        key={`parent-${org.organization_id}`}
                        organization={org}
                        selectedOrgId={effectiveSelectedOrgId}
                        onSelect={handleSelect}
                      />
                    ) : (
                      <OrganizationTreeItem
                        key={org.organization_id}
                        organization={org}
                        level={0}
                        selectedOrgId={effectiveSelectedOrgId}
                        onSelect={handleSelect}
                        expandedOrgs={expandedOrgs}
                        setExpandedOrgs={setExpandedOrgs}
                      />
                    ),
                  )}
                </div>
              )}
            </div>

            {renderRootPagination()}

            <div className="border-border bg-muted/30 flex items-center justify-between border-t p-4">
              <div className="text-muted-foreground text-xs">
                <span>
                  Showing {organizationsToDisplay?.length || 0} organizations
                  {profileOrgDetails &&
                    profileOrgDetails.organization_id !== excludeOrgId && (
                      <span className="ml-1">(including parent)</span>
                    )}
                </span>
              </div>

              {saveToUiInfo && (
                <div className="text-muted-foreground text-xs">
                  {(() => {
                    const storedOrgSelection = getStoredOrgSelection();
                    return storedOrgSelection ? (
                      <span>
                        Last selected:{" "}
                        {new Date(storedOrgSelection.selectedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>No previous selection</span>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizationSelector;