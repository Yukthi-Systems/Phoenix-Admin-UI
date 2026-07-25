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

import { Outlet, Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const clearAllCookies = () => {
  Object.keys(Cookies.get()).forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
  });
};

const PrivateRoutes = () => {
  const isSessionValid = Cookies.get("IS_SESSION_VALID");
  const location = useLocation();

  if (!isSessionValid) {
    clearAllCookies();
    localStorage.clear();
    sessionStorage.clear();

    // Store the intended destination in sessionStorage
    if (location.pathname !== "/login") {
      sessionStorage.setItem(
        "redirectAfterLogin",
        location.pathname + location.search,
      );
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
