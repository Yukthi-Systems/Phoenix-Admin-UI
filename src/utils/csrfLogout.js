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

// Global axios response interceptor (imported once from main.jsx).
//
// The backend answers a request without an X-Csrf-Token with
// 406 "Oops! CSRF token not found". Once the token is gone the session
// can't make any further authenticated call, so log out completely -
// clear cookies, localStorage and sessionStorage - and go to /login,
// rather than leaving every request on the page failing.
//
// Deliberately only this one case: utils/axiosInterceptor.js also handles
// 401/403 but isn't imported anywhere, and turning it on wholesale would
// log users out on ordinary permission 403s and block the public reset
// pages (they have no session cookie).

import axios from "axios";
import Cookies from "js-cookie";

const CSRF_MISSING = /csrf token not found/i;

let loggingOut = false;

const clearEverythingAndGoToLogin = () => {
  if (loggingOut) return;
  loggingOut = true;

  // Readable cookies only - HttpOnly ones (SESSION_ID) can't be touched
  // from JS, but dropping IS_SESSION_VALID is what PrivateRoutes checks.
  Object.keys(Cookies.get()).forEach((name) => {
    Cookies.remove(name, { path: "/" });
    Cookies.remove(name, { path: "/", domain: ".yukthi.net" });
    Cookies.remove(name, { path: "/", domain: "yukthi.net" });
  });

  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // storage can be unavailable (private mode / blocked) - still log out
  }

  // Full navigation (not router) so in-memory state - Jotai atoms,
  // React Query cache - is dropped too.
  window.location.replace("/login");
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error?.response;
    if (
      res?.status === 406 &&
      CSRF_MISSING.test(res?.data?.message || "") &&
      window.location.pathname !== "/login"
    ) {
      console.warn("CSRF token missing - logging out");
      clearEverythingAndGoToLogin();
    }
    return Promise.reject(error);
  },
);
