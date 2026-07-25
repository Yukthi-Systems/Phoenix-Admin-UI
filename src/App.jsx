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

import { RouterProvider } from "react-router-dom";
import router from "./routes/Router";

import { useApplyTheme } from "./hooks/useApplyTheme";

import { openobserveRum } from "@openobserve/browser-rum";
import { openobserveLogs } from "@openobserve/browser-logs";
import { adminStore } from "./store/store";
import { userProfileAtom } from "./store/userProfile";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useDisableDevTools from "./hooks/useDisableDevTools";
import { RUM_CLIENT_TOKEN, RUM_SITE } from "./constants/constants";

// user data
const { user_id, display_name, user_email, user_details } =
  adminStore.get(userProfileAtom) || {};

// config openObserve
const options = {
  clientToken: RUM_CLIENT_TOKEN,
  applicationId: "v3-admin-web-ui-id",
  site: RUM_SITE,
  service: "v3-admin-web-ui",
  env: "dev",
  version: "0.0.1",
  organizationIdentifier: "default",
  insecureHTTP: false,
  apiVersion: "v1",
};

// check the user detail
if (user_id && options.clientToken && options.site) {
  openobserveRum.init({
    applicationId: options.applicationId, // required, any string identifying your application
    clientToken: options.clientToken,
    site: options.site,
    organizationIdentifier: options.organizationIdentifier,
    service: options.service,
    env: options.env,
    version: options.version,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: options.apiVersion,
    insecureHTTP: options.insecureHTTP,
    defaultPrivacyLevel: "allow", // 'allow' or 'mask-user-input' or 'mask'. Use one of the 3 values.
  });

  openobserveLogs.init({
    clientToken: options.clientToken,
    site: options.site,
    organizationIdentifier: options.organizationIdentifier,
    service: options.service,
    env: options.env,
    version: options.version,
    forwardErrorsToLogs: true,
    insecureHTTP: options.insecureHTTP,
    apiVersion: options.apiVersion,
  });

  // You can set a user context
  openobserveRum.setUser({
    id: user_id,
    name: display_name,
    email: user_email,
  });

  // connect to the sever
  openobserveRum.startSessionReplayRecording();
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (user_details?.locale) {
      i18n.changeLanguage(user_details?.locale || "en");
      localStorage.setItem("lang", user_details.locale || "en");
    }
  }, [user_details?.locale]);

  useApplyTheme();
  // useDisableDevTools();
  return <RouterProvider router={router} />;
}

export default App;
