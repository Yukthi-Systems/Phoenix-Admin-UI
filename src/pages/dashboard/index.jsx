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
import { useMemo, useState } from "react";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useGetAllDashboardMetrics } from "@/hooks/useDashboard";
import AccessDenied from "@/components/common/AccessDenied";

import { themeAtom } from "@/store/theme";
import MetricsGrid from "./MetricGrid";
import OrganizationSpaceUsage from "./OrganizationSpaceUsage";
import MailboxSpaceUsage from "./MailBoxSpaceUsage";
import TopUserLogins from "./TopUserLogins";
import TopIPLogins from "./TopIPlogin";
import LoginsPerDomain from "./LoginsPerDomain";
import SystemHealth from "./SystemHealth";
import MailboxSpaceDetails from "./MailBoxSpaceDetails";

const bytesToGB = (bytes) => {
  if (!bytes || bytes === 0) return 0;
  return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
};

const Dashboard = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom) || {};
  const theme = useAtomValue(themeAtom);

  const {
    organizationSpace,
    domains,
    mailboxesSpace,
    totalUsers,
    topLogins,
    topIPLogins,
    loginsPerDomain,
    status: systemStatus,
    refetchAll,
    isLoading,
    isError,
  } = useGetAllDashboardMetrics(organization_id);

  // const handleRefresh = async () => {
  //     setIsRefreshing(true);
  //     try {
  //         await refetchAll();
  //     } catch (error) {
  //         console.error('Error refreshing dashboard data:', error);
  //     } finally {
  //         setIsRefreshing(false);
  //     }
  // };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--accent))",
  ];

  const safeGet = (apiResponse, path, fallback = null) => {
    try {
      if (!apiResponse || apiResponse.isError) return fallback;
      const keys = path.split(".");
      let result = apiResponse;
      for (const key of keys) {
        result = result?.[key];
        if (result === undefined || result === null) return fallback;
      }
      return result;
    } catch (error) {
      console.warn(`Error accessing path ${path}:`, error);
      return fallback;
    }
  };

  const processedData = useMemo(() => {
    // Organization Space Data
    const orgQuotaAllocated = safeGet(
      organizationSpace,
      "data.data.quota_allocated",
      0,
    );
    const orgQuotaUtilized = safeGet(
      organizationSpace,
      "data.data.quota_utilized",
      0,
    );
    const orgSpaceBreakdown = [
      {
        name: "Used",
        value: orgQuotaUtilized,
        color: COLORS[0],
      },
      {
        name: "Available",
        value:
          Math.round(Math.max(0, orgQuotaAllocated - orgQuotaUtilized) * 100) /
          100,
        color: COLORS[1],
      },
    ].filter((item) => item.value > 0);

    const totalDomains = safeGet(domains, "data.data.total_domains", 0);
    const totalActiveDomains = safeGet(
      domains,
      "data.data.active_domains",
      0,
    );
    const totalInactiveDomains = safeGet(
      domains,
      "data.data.inactive_domains",
      0,
    );

    const mailboxesData = safeGet(
      mailboxesSpace,
      "data.data.mailboxes_space",
      {},
    );
    const totalMailboxes = safeGet(
      mailboxesSpace,
      "data.data.total_mailboxes",
      0,
    );
    const totalActiveMailboxes = safeGet(
      mailboxesSpace,
      "data.data.total_active_mailboxes",
      0,
    );
    const totalInactiveMailboxes = safeGet(
      mailboxesSpace,
      "data.data.total_inactive_mailboxes",
      0,
    );
    const totalMailboxQuotaUsedBytes = safeGet(
      mailboxesSpace,
      "data.data.total_quota_utilized_bytes",
      0,
    );
    const totalMailboxQuotaUsedGB = bytesToGB(totalMailboxQuotaUsedBytes);
    const totalMailboxQuota = safeGet(
      mailboxesSpace,
      "data.data.total_quota_allocated",
      0,
    );
    const totalMailboxQuotaUsed = safeGet(
      mailboxesSpace,
      "data.data.total_quota_utilized",
      0,
    );
    const totalDomainsWithMailboxes = safeGet(
      mailboxesSpace,
      "data.data.total_domains_with_mailboxes",
      0,
    );

    // Mailbox Space Pie Chart Data
    const mailboxSpaceBreakdown = [
      {
        name: "Used",
        value: totalMailboxQuotaUsedGB,
        color: COLORS[0],
      },
      {
        name: "Available",
        value:
          Math.round(
            Math.max(0, totalMailboxQuota - totalMailboxQuotaUsed) * 100,
          ) / 100,
        color: COLORS[1],
      },
    ].filter((item) => item.value > 0);

    const mailboxProgressData = Object.entries(mailboxesData)
      .map(([domain, data]) => {
        const utilizedGB = bytesToGB(data?.total_quota_utilized_bytes || 0);
        const allocatedGB = data?.total_quota_allocated || 0;

        return {
          domain: domain,
          allocated: allocatedGB,
          utilizedBytes: data?.total_quota_utilized_bytes || 0,
          utilizedGB: utilizedGB,
          percentage: allocatedGB > 0 ? (utilizedGB / allocatedGB) * 100 : 0,
          totalMailboxes: data?.total_mailboxes || 0,
          activeMailboxes: data?.total_active_mailboxes || 0,
          inactiveMailboxes: data?.total_inactive_mailboxes || 0,
          emailsCount: data?.total_emails_count || 0,
        };
      })
      .filter((item) => item.allocated > 0)
      .sort((a, b) => b.percentage - a.percentage);

    // Users Data
    const totalUsersCount = safeGet(totalUsers, "data.data", 0);

    // System Status Data
    const systemStatusData = safeGet(systemStatus, "data.data", {});
    const systemStatusOverall = safeGet(
      systemStatus,
      "data.message",
      "UNKNOWN",
    );

    // Top Logins Data with info
    const topLoginsData = safeGet(topLogins, "data.data", {});
    const topLoginsInfo = safeGet(topLogins, "data.info", "");
    const topLoginsChartData = [];
    Object.entries(topLoginsData).forEach(([domain, users]) => {
      if (Array.isArray(users)) {
        users.slice(0, 10).forEach((user) => {
          topLoginsChartData.push({
            domain,
            email: user.email_id,
            login_count: parseInt(user.total_logins) || 0,
            label: `${user.email_id}`,
          });
        });
      }
    });

    // Top IP Logins Data
    const topIPLoginsData = safeGet(topIPLogins, "data.data", {});
    const topIPLoginsChartData = [];
    Object.entries(topIPLoginsData).forEach(([domain, ips]) => {
      if (Array.isArray(ips)) {
        ips.slice(0, 10).forEach((ip) => {
          topIPLoginsChartData.push({
            domain,
            ip_address: ip.origin_ip,
            login_count: parseInt(ip.total_logins) || 0,
            label: `${ip.origin_ip}`,
          });
        });
      }
    });

    // Logins Per Domain Data
    const loginsPerDomainData = safeGet(loginsPerDomain, "data.data", {});
    const loginsPerDomainChartData = Object.entries(loginsPerDomainData).map(
      ([domain, count]) => ({
        domain,
        login_count: parseInt(count) || 0,
      }),
    );

    return {
      orgQuotaAllocated,
      orgQuotaUtilized,
      orgSpaceBreakdown,
      totalDomains,
      totalActiveDomains,
      totalInactiveDomains,
      totalMailboxes,
      totalActiveMailboxes,
      totalInactiveMailboxes,
      totalMailboxQuota,
      totalDomainsWithMailboxes,
      totalUsersCount,
      systemStatusData,
      systemStatusOverall,
      topLoginsChartData,
      topLoginsInfo,
      topIPLoginsChartData,
      loginsPerDomainChartData,
      mailboxSpaceBreakdown,
      mailboxProgressData,
      totalMailboxQuotaUsedGB,
    };
  }, [
    organizationSpace,
    domains,
    mailboxesSpace,
    totalUsers,
    topLogins,
    topIPLogins,
    loginsPerDomain,
    systemStatus,
  ]);

  if (!permissions?.includes("dashboard:view")) {
    return <AccessDenied content="Don't have access to view dashboard." />;
  }

  return (
    <div className="space-y-6 p-6">
      <MetricsGrid
        processedData={processedData}
        organizationSpace={organizationSpace}
        domains={domains}
        mailboxesSpace={mailboxesSpace}
        totalUsers={totalUsers}
      />
      <SystemHealth processedData={processedData} systemStatus={systemStatus} />

      <div className="grid gap-6 md:grid-cols-2">
        <OrganizationSpaceUsage
          processedData={processedData}
          organizationSpace={organizationSpace}
          theme={theme}
        />

        <MailboxSpaceDetails
          processedData={processedData}
          mailboxesSpace={mailboxesSpace}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MailboxSpaceUsage
          processedData={processedData}
          mailboxesSpace={mailboxesSpace}
          theme={theme}
        />

        <LoginsPerDomain
          processedData={processedData}
          loginsPerDomain={loginsPerDomain}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TopUserLogins processedData={processedData} topLogins={topLogins} />

        <TopIPLogins processedData={processedData} topIPLogins={topIPLogins} />
      </div>
    </div>
  );
};

export default Dashboard;
