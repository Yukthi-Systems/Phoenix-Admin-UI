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

import axios from "axios";
import Cookies from "js-cookie";

let isRedirecting = false;

const clearSessionAndRedirect = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  console.warn("Session invalidated by server - logging out");

  Object.keys(Cookies.get()).forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
    Cookies.remove(cookieName, { path: "/", domain: ".yukthi.net" });
    Cookies.remove(cookieName, { path: "/", domain: "yukthi.net" });
  });

  localStorage.clear();
  sessionStorage.clear();

  window.location.href = "/login";
};

axios.interceptors.response.use(
  (response) => {
    isRedirecting = false;
    return response;
  },
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("API returned 401 - session expired on server");
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (status === 403) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        console.warn("API returned 403 - access forbidden");
        clearSessionAndRedirect();
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

axios.interceptors.request.use(
  (config) => {
    const isSessionValid = Cookies.get("IS_SESSION_VALID");
    const currentPath = window.location.pathname;

    if (currentPath === "/login" || config.url?.includes("/login")) {
      return config;
    }

    if (!isSessionValid) {
      console.warn(
        "IS_SESSION_VALID missing before API call - blocking request",
      );
      clearSessionAndRedirect();
      return Promise.reject(new Error("Session invalid"));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axios;
