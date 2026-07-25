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

import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";

const PublicRoutes = () => {
  const isSessionValid = Cookies.get("IS_SESSION_VALID");
  const userProfile = useAtomValue(userProfileAtom);

  // Both cookie AND profile user_id must exist
  if (isSessionValid && userProfile?.user_id) {
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");

    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      return <Navigate to={redirectPath} replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;