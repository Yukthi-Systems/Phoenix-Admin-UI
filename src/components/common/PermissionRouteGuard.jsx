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
import { userProfileAtom } from "@/store/userProfile";
import { getRequiredPermissionForPath } from "@/constants/permissionAccess";
import AccessDenied from "./AccessDenied";

// Individual add/edit/copy pages already gate themselves on their own
// create/edit permission - this guard additionally requires the resource's
// view permission for those same routes, so create/edit access alone is
// never enough to reach a page by URL. See constants/permissionAccess.js
// for the route -> required-view-permission table.
const PermissionRouteGuard = ({ children }) => {
  const location = useLocation();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  const requiredPermission = getRequiredPermissionForPath(location.pathname);

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return (
      <AccessDenied content="You need view access to this section before you can make changes here." />
    );
  }

  return children;
};

export default PermissionRouteGuard;
