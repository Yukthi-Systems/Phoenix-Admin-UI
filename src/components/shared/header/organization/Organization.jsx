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
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import OrganizationSelector from "./OrganizationTree";
import OrgSwitchWarningModal from "./OrgSwitchWarningModal";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo";

const Organization = () => {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [_, setSelectedOrg] = useAtom(selectedOrganizationAtom);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { uiInfo, updateUiInfo } = useSyncedUiInfo();
  const [pendingOrg, setPendingOrg] = useState(null);

  const updateSelection = (organization) => {
    setUserInfo((prev) => ({
      ...prev,
      organization_id: organization.organization_id,
      organization_name: organization.organization_name,
      chat_service_enabled: organization.chat_service_enabled ?? false,
      email_service_enabled: organization.email_service_enabled ?? false,
    }));

    setSelectedOrg(organization);
  };

  const resetAppState = () => {
    // Switching org invalidates whatever the user was mid-way through
    // (a form scoped to the old org's domain, a table's row selection
    // keyed to the old org's data, cached queries for the old org, etc).
    // Rather than track down every page that needs to reset its own
    // local state, drop all cached data and land back on the dashboard -
    // it self-gates on "dashboard:view" via AccessDenied, so users
    // without that permission just see the normal access-denied state.
    queryClient.clear();
    navigate("/");
  };

  // Called by the picker (OrganizationTree.jsx) right before it would
  // auto-apply a click. Returning `false` vetoes that auto-apply for a
  // real, unconfirmed org change - nothing is written to any atom or
  // storage until the user actually confirms via the modal below.
  const handleBeforeSelect = (organization) => {
    const isOrgChange = organization.organization_id !== userInfo?.organization_id;
    if (!isOrgChange || uiInfo?.dontShowOrgSwitchWarning) return true;

    setPendingOrg(organization);
    return false;
  };

  // Only fires when handleBeforeSelect allowed the auto-apply (same org
  // re-picked, or the warning was previously dismissed) - the picker has
  // already written userInfoAtom and persisted the selection itself at
  // that point, so this just syncs selectedOrganizationAtom and resets
  // app state for an actual switch.
  const handleSelect = (organization) => {
    const isOrgChange = organization.organization_id !== userInfo?.organization_id;
    updateSelection(organization);
    if (isOrgChange) resetAppState();
  };

  const handleConfirmSwitch = (dontShowAgain) => {
    if (pendingOrg) {
      const currentSelectorState = uiInfo?.organizationSelector || {};
      // Mirrors what the picker's own auto-apply persists on a normal
      // (non-vetoed) selection - needed here because a confirmed switch
      // bypasses that internal path entirely (see handleBeforeSelect).
      updateUiInfo({
        organizationSelector: {
          ...currentSelectorState,
          lastSelectedOrganization: {
            organization_id: pendingOrg.organization_id,
            organization_name: pendingOrg.organization_name,
            selectedAt: new Date().toISOString(),
            ...(pendingOrg.parent_organization_id && {
              parent_organization_id: pendingOrg.parent_organization_id,
            }),
            ...(pendingOrg.organization_type && {
              organization_type: pendingOrg.organization_type,
            }),
          },
        },
        ...(dontShowAgain && { dontShowOrgSwitchWarning: true }),
      });

      updateSelection(pendingOrg);
      resetAppState();
    }
    setPendingOrg(null);
  };

  const handleCancelSwitch = () => setPendingOrg(null);

  const hasStoredOrgSelection = () => {
    if (uiInfo?.organizationSelector?.lastSelectedOrganization) {
      return true;
    }
    return false;
  };

  const getOrgSelectorProps = () => {
    if (hasStoredOrgSelection()) {
      return {
        selectedOrgId: null,
        selectedOrgName: null,
      };
    } else {
      return {
        selectedOrgId: userInfo?.organization_id || null,
        selectedOrgName: userInfo?.organization_name || null,
        chat_service_enabled: userInfo?.chat_service_enabled ?? false,
        email_service_enabled: userInfo?.email_service_enabled ?? false,
      };
    }
  };

  const orgSelectorProps = getOrgSelectorProps();

  return (
    <div className="flex items-center gap-3">
      <OrganizationSelector
        selectedOrgId={orgSelectorProps.selectedOrgId}
        selectedOrgName={orgSelectorProps.selectedOrgName}
        onSelect={handleSelect}
        onBeforeSelect={handleBeforeSelect}
        placeholder="Select Organization"
        label=""
        showLabel={false}
        saveToUiInfo={true}
        uiInfoKey="lastSelectedOrganization"
        skipApiLoad={true}
      />

      <OrgSwitchWarningModal
        isOpen={!!pendingOrg}
        organizationName={pendingOrg?.organization_name}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />
    </div>
  );
};

export default Organization;
