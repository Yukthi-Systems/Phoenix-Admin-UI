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

import { Outlet, useLocation } from "react-router-dom";
import Header from "../shared/header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Aside from "../shared/Aside";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import { useProfile } from "@/hooks/useProfile";
import { userProfileAtom } from "@/store/userProfile";
import DataLoading from "../common/DataLoading";
import FetchLayout from "./FetchLayout";
import DataFechError from "../common/DataFechError";
import HelpDesk from "../shared/header/helpdesk/HelpDesk";
import ServiceRouteGuard from "../common/ServiceRouteGuard";
import PermissionRouteGuard from "../common/PermissionRouteGuard";
import AIChatInterface from "@/pages/help";
import { useGetUserUiInfo } from "@/hooks/useUser";
import { useEffect, useRef } from "react";
import { uiInfoAtom } from "@/store/uiInfo";
import SessionGuard from "./SessionGuard";
import RouterProgressBar from "../common/RouteProgress";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import moment from "moment";
import {
  dismissedAlertsAtom,
  showMaintenancePopupAtom,
} from "@/store/maintainence";
import MaintenanceHeaderAlert from "../shared/MaintainenceHeader";
import MaintenancePopup from "../common/MaintainenceModal";
import { useGetMaintenanceStatus } from "@/hooks/useMaintenanceStatus";
import DraggableChat from "../common/DraggableChat";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";

const FullLayout = () => {
  const { user_id, parent_org_id } = useAtomValue(userInfoAtom);

  const { data, isLoading, isError } = useProfile(user_id, parent_org_id);

  const setProfile = useSetAtom(userProfileAtom);
  const setUiInfo = useSetAtom(uiInfoAtom);
  useSessionMonitor();

  const scrollRef = useRef(null);
  const { pathname } = useLocation();

  const uiInfoInitialized = useRef(false);

  // Fetch maintenance status
  const { data: maintenanceData } = useGetMaintenanceStatus();
  const dismissedAlerts = useAtomValue(dismissedAlertsAtom);
  const [showMaintenancePopup, setShowMaintenancePopup] = useAtom(
    showMaintenancePopupAtom,
  );

  const { data: uiInfo, isLoading: uiLoading, error } = useGetUserUiInfo();

  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);

  const { data: defaultOrgDetails } = useGetOrganizationDetail(parent_org_id);

  useEffect(() => {
    if (data?.user_details) {
      setProfile(data.user_details);
    }
  }, [data, setProfile]);

  useEffect(() => {
    const isSelectionEmpty =
      !selectedOrg || Object.keys(selectedOrg).length === 0;

    if (isSelectionEmpty && defaultOrgDetails && parent_org_id) {
      const formattedOrg = {
        ...defaultOrgDetails,
        selectedAt: new Date().toISOString(),
        organization_id: defaultOrgDetails.organization_id,
        organization_name: defaultOrgDetails.organization_name,

        quota_allocated: defaultOrgDetails.quota_allocated || 0,
        quota_utilized: defaultOrgDetails.quota_utilized || 0,
        is_active: defaultOrgDetails.is_active ?? true,
        chat_service_enabled: defaultOrgDetails.chat_service_enabled ?? false,
        email_service_enabled: defaultOrgDetails.email_service_enabled ?? false,
      };

      setSelectedOrg(formattedOrg);
    }
  }, [selectedOrg, defaultOrgDetails, parent_org_id, setSelectedOrg]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [pathname]);

  useEffect(() => {
    if (uiInfo && !uiInfoInitialized.current) {
      setUiInfo(uiInfo.ui_info);
      uiInfoInitialized.current = true;
    }

    if (error && !uiInfoInitialized.current) {
      console.error("Failed to load UI info:", error);
      uiInfoInitialized.current = true;
    }
  }, [uiInfo, error, setUiInfo]);

  useEffect(() => {
    if (maintenanceData?.data?.length > 0) {
      const now = moment();
      const hasUndismissedAlerts = maintenanceData.data.some((status) => {
        const endTime = moment(status.end_time);
        const isActive = endTime.isAfter(now);
        const notDismissed = !dismissedAlerts.includes(status.title);
        return isActive && notDismissed;
      });

      // Show popup once per day for undismissed alerts
      const lastPopupDate = localStorage.getItem("lastMaintenancePopup");
      const today = moment().format("YYYY-MM-DD");

      if (hasUndismissedAlerts && lastPopupDate !== today) {
        setShowMaintenancePopup(true);
        localStorage.setItem("lastMaintenancePopup", today);
      }
    }
  }, [maintenanceData, dismissedAlerts, setShowMaintenancePopup]);

  if (isLoading || (uiLoading && !uiInfoInitialized.current))
    return (
      <FetchLayout>
        <DataLoading content="Loading..." />
      </FetchLayout>
    );

  if (isError)
    return (
      <FetchLayout>
        <DataFechError content="Error loading profile...!" />
      </FetchLayout>
    );

  return (
    <SessionGuard>
      <RouterProgressBar />
      {/* Root Container: h-screen and overflow-hidden prevent body scroll */}
      <div className="bg-background relative flex h-screen w-screen flex-col overflow-hidden">
        {/* Maintenance Alert - Floating on top */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[100] px-4 pointer-events-none">
          {/* Inner wrapper pointer-events-auto allows clicking the alert while letting clicks pass through the empty sides */}
          <div className="pointer-events-auto">
            <MaintenanceHeaderAlert statusData={maintenanceData} />
          </div>
        </div>

        {/* Header - Fixed Height, Stacks vertically */}
        <header className="bg-card border-border h-[69px] flex-shrink-0 border-b px-4 shadow-sm ">
          <Header />
        </header>

        {/* Content Body - Takes remaining height */}
        <div className="flex flex-1 overflow-hidden relative z-0">
          {/* Sidebar */}
          <div className="flex-shrink-0 z-30 h-full">
            <Aside />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
            {/* 4. Attach ref to the ACTUAL scrolling container */}
            <div
              ref={scrollRef}
              className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden p-4"
            >
              <ServiceRouteGuard>
                <PermissionRouteGuard>
                  <Outlet />
                </PermissionRouteGuard>
              </ServiceRouteGuard>
            </div>
          </main>
        </div>

        {/* Floating Utilities */}
        {/* Help Desk disabled for v2 */}
        {/* <HelpDesk /> */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          containerClassName="!max-h-[100px] overflow-y-auto w-auto"
        />
        {/* Ai bot chat disabled for v2 */}
        {/* <DraggableChat /> */}
        <MaintenancePopup statusData={maintenanceData} />
      </div>
    </SessionGuard>
  );
};

export default FullLayout;
