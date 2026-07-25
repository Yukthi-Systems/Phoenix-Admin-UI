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

import { useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { parentOrgAtom, selectedOrganizationAtom } from "@/store/userInfo";
import {
  getRequiredServiceForPath,
  isServiceEnabledForOrg,
  SERVICE_LABELS,
} from "@/constants/serviceAccess";
import AccessDenied from "./AccessDenied";

const ServiceRouteGuard = ({ children }) => {
  const location = useLocation();
  const parentOrg = useAtomValue(parentOrgAtom);
  const selectedOrg = useAtomValue(selectedOrganizationAtom);

  const requiredService = getRequiredServiceForPath(location.pathname);

  if (
    requiredService &&
    !isServiceEnabledForOrg(requiredService, parentOrg, selectedOrg)
  ) {
    return (
      <AccessDenied
        content={`${SERVICE_LABELS[requiredService]} is disabled for the selected organization.`}
      />
    );
  }

  return children;
};

export default ServiceRouteGuard;
