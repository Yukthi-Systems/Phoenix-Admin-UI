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

import { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { NavLink, useLocation } from "react-router-dom";
import { userProfileAtom } from "../../store/userProfile";
import {
  LayoutDashboard,
  Mail,
  Server,
  ServerCog,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Building,
  AlertTriangle,
  FileBarChart,
  FileText,
  ScrollText,
  Mails,
  ShoppingCart,
  Wrench,
  Shield,
  FileSearch,
  UploadCloud,
  BarChart2,
  ServerCrash,
  ShieldUser,
  Info,
  MailsIcon,
  MonitorSmartphone,
  Filter,
  Smartphone,
  Paperclip,
  MailSearch,
  UserSearch,
  ListChecks,
  Activity,
  Key,
  Ban,
  Forward,
  Network,
  RefreshCw,
  MessageCircle,
  User,
  FolderOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import VersionModal from "./VersionModal";
import { BUILD_INFO } from "@/constants/constants";
import {
  sidebarAutoCollapsedAtom,
  sidebarCollapsedAtom,
} from "@/store/sidebar";
import { parentOrgAtom, selectedOrganizationAtom } from "@/store/userInfo";
import { SERVICE_KEYS, isServiceEnabledForOrg } from "@/constants/serviceAccess";

export const navItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    link: "/",
    hasPermission: true,
    permissionValue: "dashboard:view",
  },
  {
    name: "Organizations",
    icon: <Building2 size={18} />,
    link: "/organization",
    hasPermission: true,
    permissionValue: "organization:view",
  },
  {
    name: "Departments",
    icon: <Building size={18} />,
    link: "/department",
    hasPermission: true,
    permissionValue: "department:view",
  },
  {
    name: "Identity Management",
    icon: <User size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Domains",
        icon: <Server size={16} />,
        link: "/domain",
        hasPermission: true,
        permissionValue: "domain:view",
      },
      {
        name: "Identities",
        icon: <User size={16} />,
        link: "/identities",
        hasPermission: true,
        permissionValue: "department:view",
      },
    ],
  },
  {
    name: "CRM",
    icon: <FileBarChart size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Services",
        icon: <Wrench size={16} />,
        link: "/crm/services",
        hasPermission: true,
        permissionValue: "crm:service:view",
      },
      {
        name: "Purchase Order",
        icon: <ShoppingCart size={16} />,
        link: "/crm/purchase-order",
        hasPermission: true,
        permissionValue: "crm:purchase_order:view",
      },
      {
        name: "Invoice",
        icon: <FileText size={16} />,
        link: "/crm/invoice",
        hasPermission: true,
        permissionValue: "crm:invoice:view",
      },
    ],
  },
  {
    name: "Mailboxes",
    icon: <Mail size={18} />,
    link: "/mailbox",
    hasPermission: true,
    serviceName: SERVICE_KEYS.EMAIL,
    permissionValue: "mailbox:view",
  },
  {
    name: "Chat",
    icon: <MessageCircle size={18} />,
    hasChildren: true,
    hasPermission: true,
    serviceName: SERVICE_KEYS.CHAT,
    children: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={16} />,
        link: "/chat/dashboard",
        hasPermission: false,
        serviceName: SERVICE_KEYS.CHAT,
        permissionValue: "chat:view",
      },
      {
        name: "Users",
        icon: <Users size={16} />,
        link: "/chat/user",
        hasPermission: false,
        serviceName: SERVICE_KEYS.CHAT,
        permissionValue: "chat:view",
      },
      {
        name: "Preference",
        icon: <Settings size={16} />,
        link: "/chat/preference",
        hasPermission: false,
        serviceName: SERVICE_KEYS.CHAT,
        permissionValue: "chat:view",
      }
    ],
  },
  {
    name: "Files",
    icon: <FolderOpen size={18} />,
    hasChildren: true,
    hasPermission: true,
    serviceName: SERVICE_KEYS.FILE,
    children: [
      {
        name: "Users",
        icon: <Users size={16} />,
        link: "/files/users",
        hasPermission: false,
        serviceName: SERVICE_KEYS.FILE,
        permissionValue: "file:view",
      },
      {
        name: "Preference",
        icon: <Settings size={16} />,
        link: "/files/preferences",
        hasPermission: false,
        serviceName: SERVICE_KEYS.FILE,
        permissionValue: "file:view",
      }
    ],
  },
  {
    name: "Policies",
    icon: <Shield size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "General",
        icon: <Settings size={16} />,
        link: "/policies/general",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "policy:general:view",
      },
      {
        name: "Filters",
        icon: <Filter size={16} />,
        link: "/policies/filters",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "policy:filters:view",
      },
      {
        name: "Attachment",
        icon: <Paperclip size={16} />,
        link: "/policies/attachment",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "policy:attachment:view",
      },
      {
        name: "Forwarding",
        icon: <Forward size={16} />,
        link: "/policies/forwarding",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "policy:forwarding:view",
      },
      {
        name: "Distribution",
        icon: <Network size={16} />,
        link: "/policies/distribution",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "policy:distribution:view",
      },
      {
        name: "Restrictions",
        icon: <Ban size={16} />,
        link: "/policies/restrictions",
        hasPermission: true,
        permissionValue: "policy:general:view",
      },
      {
        name: "Caution",
        icon: <AlertTriangle size={16} />,
        link: "/caution",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "caution:view",
      },
      {
        name: "Disclaimer",
        icon: <FileText size={16} />,
        link: "/disclaimer",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "disclaimer:view",
      },
    ],
  },
  {
    name: "Logs",
    icon: <FileSearch size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Audit",
        icon: <ScrollText size={16} />,
        link: "/logs/audit-logs",
        hasPermission: true,
        permissionValue: "logs:audit:view",
      },
      {
        name: "Mail Flow",
        icon: <Mails size={16} />,
        link: "/logs/email-flow-logs",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "logs:mail_flow:view",
      },
      {
        name: "Email Login Attempts",
        icon: <FileText size={16} />,
        link: "/logs/email-login-attempts",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "logs:login_attempts:view",
      },
    ],
  },
  {
    name: "Server",
    icon: <ServerCog size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Server List",
        icon: <ServerCog size={16} />,
        link: "/server/list",
        hasPermission: true,
        permissionValue: "server:view",
      },
      {
        name: "Stats",
        icon: <BarChart2 size={16} />,
        link: "/server/stats",
        hasPermission: true,
        permissionValue: "server:view",
      },
      {
        name: "Process List", // New Item for the added API
        icon: <ListChecks size={16} />,
        link: "/server/procs",
        hasPermission: true,
        permissionValue: "server:view",
      },
      {
        name: "Mail Queue",
        icon: <MailsIcon size={16} />,
        link: "/server/mail-queue/search",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "mailq:view",
      },
      {
        name: "Pflogsum Report", // New Item
        icon: <FileText size={16} />,
        link: "/server/pflogsum-report",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "mailq:view",
      },
    ],
  },

  {
    name: "Tools",
    icon: <Wrench size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Mail Migration",
        icon: <UploadCloud size={16} />,
        link: "/server/migrations",
        hasPermission: true,
        permissionValue: "server:view",
      },
      {
        name: "Domain Status",
        icon: <ServerCrash size={16} />,
        link: "/server/domain-migration",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "domain:migration:view",
      },
      {
        name: "Server Mapping",
        icon: <MailSearch size={16} />,
        link: "/server/mail-mapping",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "server:view",
      },
      {
        name: "IMAP Sync",
        icon: <RefreshCw size={16} />,
        link: "/server/mailbox-sync",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "imap_sync:view",
      },
      {
        name: "Identity Lookup",
        icon: <UserSearch size={16} />,
        link: "/server/identity-lookup",
        hasPermission: true,
        permissionValue: "identity:admin:view",
      },
      {
        name: "Maintenance",
        icon: <Wrench size={16} />,
        link: "/maintenance",
        hasPermission: true,
        permissionValue: "maintenance:create",
      },
    ],
  },

  {
    name: "Sessions",
    icon: <MonitorSmartphone size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Mailbox",
        icon: <MonitorSmartphone size={16} />,
        link: "/email-client-sessions",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "session:view",
      },
      {
        name: "Mail 25 App",
        icon: <Smartphone size={16} />,
        link: "/app-sessions",
        hasPermission: true,
        serviceName: SERVICE_KEYS.EMAIL,
        permissionValue: "session:view",
      },
      {
        name: "SSO",
        icon: <ShieldUser size={16} />,
        link: "/sso-sessions",
        hasPermission: true,
        permissionValue: "session:view",
      },
    ],
  },
  {
    name: "Admin",
    icon: <Settings size={18} />,
    hasChildren: true,
    hasPermission: true,
    children: [
      {
        name: "Users",
        icon: <Users size={16} />,
        link: "/user",
        hasPermission: true,
        permissionValue: "user:view",
      },
      {
        name: "Permissions Template",
        icon: <ShieldUser size={16} />,
        link: "/permissions-template",
        hasPermission: true,
        permissionValue: "user:security:permissions:template:view",
      },
      {
        name: "My Profile",
        icon: <User size={16} />,
        link: "/profile",
        hasPermission: false,
      },
      // Disabled for v2
      // {
      //   name: "API Keys",
      //   icon: <Key size={16} />,
      //   link: "/keys",
      //   hasPermission: true,
      //   permissionValue: "api_keys:view",
      // },
    ],
  },
  {
    name: "System Status",
    icon: <Activity size={18} />,
    link: "/status",
    hasPermission: false,
  },
];

const Aside = () => {
  const { t } = useTranslation();
  const userProfile = useAtomValue(userProfileAtom) || {};
  const parentOrg = useAtomValue(parentOrgAtom);
  const selectedOrg = useAtomValue(selectedOrganizationAtom)
  const permissions = userProfile?.permissions || [];
  const location = useLocation();

  const [expandedItem, setExpandedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  // Store the vertical position for the fixed flyout
  const [hoveredItemTop, setHoveredItemTop] = useState(0);

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useAtom(
    sidebarAutoCollapsedAtom,
  );

  useEffect(() => {
    if (!isCollapsed) {
      setExpandedItem(getActiveParent());
    }
  }, [location.pathname, isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && !hasAutoCollapsed) {
        setIsCollapsed(true);
        setHasAutoCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasAutoCollapsed, setIsCollapsed, setHasAutoCollapsed]);

  const hasPermission = (item) => {
    if (!item.hasPermission) return true;
    return permissions.includes(item.permissionValue);
  };

  const hasServiceEnabled = (item) =>
    isServiceEnabledForOrg(item?.serviceName, parentOrg, selectedOrg);

  const hasVisibleChildren = (children) =>
    children?.some((child) => hasPermission(child) && hasServiceEnabled(child));

  const isPathActive = (link) => {
    if (location.pathname === link) return true;
    return location.pathname.startsWith(link + "/");
  };

  const isChildActive = (children) =>
    children?.some((child) => hasPermission(child) && isPathActive(child.link));

  const isItemOrChildActive = (item) =>
    (item.link && isPathActive(item.link)) ||
    (item.hasChildren && isChildActive(item.children));

  const getActiveParent = () => {
    for (const item of navItems) {
      if (item.hasChildren && isChildActive(item.children)) {
        return item.name;
      }
    }
    return null;
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      if (!prev) setExpandedItem(null);
      return !prev;
    });
    setHoveredItem(null);
  };

  const toggleExpanded = (itemName) => {
    setExpandedItem((prev) => (prev === itemName ? null : itemName));
  };

  // Handler for calculating fixed position
  const handleMouseEnter = (e, itemName) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItemTop(rect.top);
      setHoveredItem(itemName);
    }
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-foreground hover:bg-accent"
    } ${isCollapsed ? "justify-center px-2" : ""}`;

  const parentItemClass = (isExpanded, isActive) =>
    `group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
      ? "bg-primary/10 text-primary"
      : "text-foreground hover:bg-accent"
    } ${isCollapsed ? "justify-center px-2" : "justify-between"} ${isExpanded ? "bg-accent/60" : ""
    }`;

  const childLinkClass = ({ isActive }) =>
    `group flex items-center gap-x-3 rounded-lg px-3 py-2 ml-6 text-sm font-medium transition-all duration-200 relative ${isActive
      ? "text-primary font-semibold border-l-2 border-primary/60 bg-primary/5"
      : "text-muted-foreground hover:text-foreground border-l-2 border-transparent hover:border-muted-foreground/30 hover:bg-accent/30"
    }`;

  // Fixed Position Flyout Menu
  const FlyoutMenu = ({ item, top }) => (
    <div
      className="fixed left-8 z-[9999] ml-2 w-56 rounded-lg border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100"
      style={{ top: `${top}px` }}
      onMouseEnter={() => setHoveredItem(item.name)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="mb-2 flex items-center gap-2 border-b border-border px-2 pb-2 text-sm font-semibold text-card-foreground">
        {item.icon}
        {t(item.name)}
      </div>
      <div className="space-y-0.5">
        {item.children.map((child) =>
          hasPermission(child) && hasServiceEnabled(child) ? (
            <NavLink
              key={child.link}
              to={child.link}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 text-left text-sm transition-colors ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`
              }
            >
              {child.icon}
              {t(child.name)}
            </NavLink>
          ) : null,
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`relative text-left flex h-full flex-col border-r bg-card transition-all duration-300 z-20 ${isCollapsed ? "w-16" : "w-64"
          }`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-5 z-30 rounded-full border bg-background p-1.5 shadow-md hover:bg-accent transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation Area */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item, index) => {
            if (item.hasChildren) {
              if (!hasVisibleChildren(item.children)) return null;
              if (!hasServiceEnabled(item)) return null

              const isExpanded = expandedItem === item.name;
              const isActive = isItemOrChildActive(item);

              return (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                  onMouseLeave={() => isCollapsed && setHoveredItem(null)}
                >
                  {/* Parent */}
                  <div
                    className={parentItemClass(isExpanded, isActive)}
                    onClick={() => !isCollapsed && toggleExpanded(item.name)}
                    title={isCollapsed ? item.name : ""}
                  >
                    <div className="flex items-center gap-x-3">{item.icon}</div>
                    {!isCollapsed && (
                      <span className="flex-1 text-left">{t(item.name)}</span>
                    )}
                    {!isCollapsed && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded Children (Non-collapsed) */}
                  {!isCollapsed && (
                    <div
                      className={`space-y-1 transition-all duration-200 ${isExpanded
                        ? "max-h-96 mt-1 opacity-100"
                        : "max-h-0 opacity-0"
                        }`}
                      style={{ overflow: isExpanded ? "visible" : "hidden" }}
                    >
                      {item.children?.map((child, childIndex) =>
                        hasPermission(child) && hasServiceEnabled(child) ? (
                          <NavLink
                            key={childIndex}
                            to={child.link}
                            className={childLinkClass}
                          >
                            {child.icon}
                            <span className="flex-1">{t(child.name)}</span>
                          </NavLink>
                        ) : null,
                      )}
                    </div>
                  )}

                  {/* Fixed Flyout (Collapsed) */}
                  {isCollapsed && hoveredItem === item.name && (
                    <FlyoutMenu item={item} top={hoveredItemTop} />
                  )}
                </div>
              );
            } else {
              // Single Link
              if (!hasPermission(item) || !hasServiceEnabled(item)) return null;

              return (
                <NavLink
                  key={index}
                  to={item.link}
                  className={linkClass}
                  title={isCollapsed ? item.name : ""}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="flex-1">{t(item.name)}</span>
                  )}
                </NavLink>
              );
            }
          })}
        </nav>

        {/* Version Info Footer */}
        <div className="border-t p-3 shrink-0 bg-card z-20">
          <button
            onClick={() => setShowVersionModal(true)}
            className={`hover:bg-accent group flex w-full items-center gap-2 rounded-lg p-2 transition-all duration-200 ${isCollapsed ? "justify-center" : "justify-start"
              }`}
            title={isCollapsed ? "Build Information" : "View build information"}
          >
            <Info className="h-4 w-4 text-muted-foreground" />
            {!isCollapsed && (
              <div className="flex flex-col items-start text-xs">
                <span className="font-medium text-foreground">
                  v{BUILD_INFO.version}
                </span>
                <span className="text-muted-foreground">
                  Build {BUILD_INFO.buildDate}
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>
      <VersionModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        isCollapsed={isCollapsed}
      />
    </>
  );
};

export default Aside;
