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

import { useAtom, useAtomValue } from "jotai";
import OrganizationSelector from "./OrganizationTree";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import { uiInfoAtom } from "@/store/uiInfo";

const Organization = () => {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [_, setSelectedOrg] = useAtom(selectedOrganizationAtom);

  const uiInfoStorage = useAtomValue(uiInfoAtom);

  const handleSelect = (organization) => {
    setUserInfo((prev) => ({
      ...prev,
      organization_id: organization.organization_id,
      organization_name: organization.organization_name,
      chat_service_enabled: organization.chat_service_enabled ?? false,
      email_service_enabled: organization.email_service_enabled ?? false,
    }));

    setSelectedOrg(organization);
  };

  const hasStoredOrgSelection = () => {
    if (uiInfoStorage?.organizationSelector?.lastSelectedOrganization) {
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
        placeholder="Select Organization"
        label=""
        showLabel={false}
        saveToUiInfo={true}
        uiInfoKey="lastSelectedOrganization"
        skipApiLoad={true}
      />
    </div>
  );
};

export default Organization;
