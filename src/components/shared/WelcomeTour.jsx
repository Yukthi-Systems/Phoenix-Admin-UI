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

import React, { useState, useEffect, useMemo } from "react";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Rocket,
  LayoutDashboard,
  Globe2,
  ShieldCheck,
  FileSearch,
  Users,
  Server,
  Receipt,
  Settings,
  MessageSquare,
  Mail,
  Database,
  ArrowRight,
  CheckCircle2,
  Activity,
  TrendingUp,
  X,
  FileText,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";

const ALL_TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Email Management Platform",
    subtitle: "Your unified control center for enterprise email infrastructure",
    icon: Rocket,
    requiredPermissions: [],
    visual: "welcome",
  },
  {
    id: "dashboard",
    title: "Real-Time Dashboard",
    subtitle: "Monitor system health and usage metrics at a glance",
    icon: LayoutDashboard,
    requiredPermissions: ["dashboard:view"],
    visual: "dashboard",
  },
  {
    id: "domains_mailboxes",
    title: "Domains & Mailboxes",
    subtitle: "Manage domains and provision mailboxes with granular control",
    icon: Globe2,
    requiredPermissions: ["domain:view", "mailbox:view"],
    anyPermission: true,
    visual: "domains",
  },
  {
    id: "users_organizations",
    title: "Users & Organizations",
    subtitle: "Administer accounts and organizational hierarchy",
    icon: Users,
    requiredPermissions: ["user:view", "organization:view", "department:view"],
    anyPermission: true,
    visual: "users",
  },
  {
    id: "servers_infrastructure",
    title: "Server Infrastructure",
    subtitle: "Monitor servers, migrations, and mail queue operations",
    icon: Server,
    requiredPermissions: ["server:view", "mailq:view", "maintenance:view"],
    anyPermission: true,
    visual: "servers",
  },
  {
    id: "security_policies",
    title: "Security & Policy Management",
    subtitle: "Enforce email security through comprehensive policy controls",
    icon: ShieldCheck,
    requiredPermissions: [
      "policy:general:view",
      "policy:filters:view",
      "policy:attachment:view",
      "policy:restriction:view",
      "policy:distribution:view",
      "policy:forwarding:view",
      "disclaimer:view",
      "caution:view",
    ],
    anyPermission: true,
    visual: "policies",
  },
  {
    id: "logs_monitoring",
    title: "Audit Logs & Monitoring",
    subtitle: "Complete audit trails for compliance and troubleshooting",
    icon: FileSearch,
    requiredPermissions: [
      "logs:audit:view",
      "logs:login_attempts:view",
      "logs:mail_flow:view",
      "session:view",
    ],
    anyPermission: true,
    visual: "logs",
  },
  {
    id: "crm_billing",
    title: "CRM & Billing",
    subtitle: "Manage customer relationships and billing operations",
    icon: Receipt,
    requiredPermissions: [
      "crm:invoice:view",
      "crm:purchase_order:view",
      "crm:service:view",
    ],
    anyPermission: true,
    visual: "crm",
  },
  {
    id: "support",
    title: "Support Ticketing",
    subtitle: "Track and resolve customer support requests",
    icon: MessageSquare,
    requiredPermissions: ["support_ticket:view", "support_admin:view"],
    anyPermission: true,
    visual: "support",
  },
];

const VisualContent = ({ type }) => {
  switch (type) {
    case "welcome":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            This permission-based admin panel adapts to your specific role and
            access rights. You'll only see the modules and features you're
            authorized to use, ensuring a streamlined and secure experience
            tailored to your responsibilities.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              What You Can Do:
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground ml-6">
              <li>• Manage email domains and mailbox provisioning</li>
              <li>• Configure security policies and compliance rules</li>
              <li>• Monitor server health and system performance</li>
              <li>• Track all activities through comprehensive audit logs</li>
            </ul>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { icon: Mail, label: "Email" },
              { icon: ShieldCheck, label: "Security" },
              { icon: Users, label: "Users" },
              { icon: Server, label: "Servers" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-2 rounded border border-border bg-card"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "dashboard":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Your personalized dashboard provides real-time visibility into
            system health, usage metrics, and critical alerts. Get instant
            insights into domain performance, mailbox quotas, server statistics,
            and email traffic patterns.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Key Metrics:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Globe2 className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Domain Overview</div>
                  <div className="text-xs text-muted-foreground">
                    Track active domains and DNS health
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">System Status</div>
                  <div className="text-xs text-muted-foreground">
                    Monitor all service availability
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium">Traffic Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    Email volume and trends
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium">Storage Usage</div>
                  <div className="text-xs text-muted-foreground">
                    Mailbox quotas and capacity
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/20 text-sm">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Live monitoring with automatic refresh and alert notifications
            </span>
          </div>
        </div>
      );

    case "domains":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Centrally manage all your email domains with comprehensive control
            over DNS configuration, mailbox provisioning, and storage quotas.
            Handle domain migrations, monitor health status, and configure
            domain-specific policies.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Core Capabilities:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">DNS Management:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Configure MX, SPF, DKIM, and DMARC records for optimal email
                    delivery
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Mailbox Provisioning:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Bulk create and manage mailboxes with customizable quotas
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Migration Tools:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Seamlessly migrate domains between servers with minimal
                    downtime
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">
                Example: company.com
              </span>
              <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• 2,450 active mailboxes</div>
              <div>• DNS records verified and healthy</div>
              <div>• 78% storage utilization</div>
            </div>
          </div>
        </div>
      );

    case "users":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Administer user accounts and organizational structure with granular
            permission controls. Create departments, assign roles, manage
            authentication settings, and configure security policies like
            two-factor authentication and API access.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">User Management Features:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium mb-1">Account Administration</div>
                <div className="text-xs text-muted-foreground">
                  Create, edit, and deactivate user accounts with role-based
                  permissions
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Security Settings</div>
                <div className="text-xs text-muted-foreground">
                  Configure 2FA, backup codes, and password policies
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Department Structure</div>
                <div className="text-xs text-muted-foreground">
                  Organize users into hierarchical departments
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Permission Templates</div>
                <div className="text-xs text-muted-foreground">
                  Apply standardized role templates across teams
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Organization: 2,456 users across 12 departments
              </span>
            </div>
            <div className="ml-6 space-y-1 text-xs text-muted-foreground">
              <div>→ Engineering (156 users)</div>
              <div>→ Sales (89 users)</div>
              <div>→ Support (67 users)</div>
            </div>
          </div>
        </div>
      );

    case "servers":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Monitor and manage your email server infrastructure with detailed
            health metrics, resource utilization tracking, and maintenance
            scheduling. Handle server migrations, configure mail queue settings,
            and access performance analytics.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">
              Infrastructure Management:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Server className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Server Monitoring:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Real-time CPU, memory, and disk usage metrics with alert
                    thresholds
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Mail Queue Management:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    View, search, and manage queued messages with retry controls
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Performance Metrics:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Historical analytics and capacity planning insights
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "mail-01", status: "Healthy", cpu: "45%" },
              { name: "mail-02", status: "Healthy", cpu: "32%" },
            ].map((server, i) => (
              <div
                key={i}
                className="p-2 rounded border border-border bg-card text-xs"
              >
                <div className="font-medium">{server.name}</div>
                <div className="text-muted-foreground">CPU: {server.cpu}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "policies":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Enforce email security and compliance through comprehensive policy
            management. Configure spam filters, attachment restrictions, content
            disclaimers, forwarding rules, and distribution lists to protect
            your organization.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Available Policy Types:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    General & Filter Policies:
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    Spam detection, sender/recipient filtering, and content
                    scanning rules
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    Attachment & Restrictions:
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    Block file types, size limits, and sender/recipient
                    restrictions
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    Distribution & Forwarding:
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    Mailing lists, auto-forwarding rules, and email routing
                    configurations
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Disclaimers & Cautions:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Add legal disclaimers and warning messages to outgoing
                    emails
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 rounded bg-primary/5 border border-primary/20 text-sm">
            <span className="text-muted-foreground">
              Policies can be applied globally or targeted to specific domains
              and users
            </span>
          </div>
        </div>
      );

    case "logs":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Maintain complete transparency and compliance with comprehensive
            audit logging. Track all system changes, user activities, login
            attempts, and email flow for security monitoring, troubleshooting,
            and regulatory compliance.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Logging Capabilities:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium mb-1 flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-primary" />
                  Audit Logs
                </div>
                <div className="text-xs text-muted-foreground">
                  Complete trail of configuration changes, policy updates, and
                  administrative actions
                </div>
              </div>
              <div>
                <div className="font-medium mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  Login Attempts
                </div>
                <div className="text-xs text-muted-foreground">
                  Track successful and failed authentication with IP addresses
                  and timestamps
                </div>
              </div>
              <div>
                <div className="font-medium mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Flow
                </div>
                <div className="text-xs text-muted-foreground">
                  Trace message routing, delivery status, and spam filter
                  decisions
                </div>
              </div>
              <div>
                <div className="font-medium mb-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  Session History
                </div>
                <div className="text-xs text-muted-foreground">
                  Monitor active sessions and connection history across clients
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-orange-500/10 border border-orange-500/20 text-sm">
            <Activity className="w-4 h-4 text-orange-600" />
            <span className="text-muted-foreground">
              Advanced filtering and export capabilities for compliance
              reporting
            </span>
          </div>
        </div>
      );

    case "crm":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Manage customer relationships and billing operations with integrated
            CRM tools. Create and track invoices, manage purchase orders,
            configure service plans, and handle all financial aspects of your
            email infrastructure.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">CRM & Billing Features:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Receipt className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Invoice Management:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Generate invoices, track payments, create revisions, and
                    manage billing cycles
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Purchase Orders:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Create and track POs with approval workflows and linked
                    services
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Service Configuration:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Define service plans, pricing tiers, and resource
                    allocations
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold">INV-2024-001</div>
                <div className="text-xs text-muted-foreground">
                  Acme Corp • Jan 15, 2024
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$2,450</div>
                <div className="text-xs text-green-600">Paid</div>
              </div>
            </div>
          </div>
        </div>
      );

    case "support":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Handle customer inquiries efficiently with an integrated support
            ticketing system. Create, assign, track, and resolve support
            requests with complete history tracking, status management, and
            priority handling.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">
              Ticketing System Features:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Ticket Management:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Create tickets with categories, priorities, and detailed
                    descriptions
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Assignment & Tracking:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Assign tickets to team members and track resolution progress
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Status Workflow:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Track tickets through Open → In Progress → Resolved → Closed
                    states
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileSearch className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">History & Comments:</span>
                  <span className="text-muted-foreground">
                    {" "}
                    Complete audit trail of ticket updates and team
                    communications
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20 text-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-muted-foreground">
              Search and filter capabilities for quick ticket retrieval
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const WelcomeTour = () => {
  const { uiInfo, updateUiInfo, isLoading, isSynced } = useSyncedUiInfo();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  const tourSteps = useMemo(() => {
    return ALL_TOUR_STEPS.filter((step) => {
      if (step.requiredPermissions.length === 0) return true;
      if (step.anyPermission) {
        return step.requiredPermissions.some((perm) =>
          permissions.includes(perm),
        );
      }
      return step.requiredPermissions.every((perm) =>
        permissions.includes(perm),
      );
    });
  }, [permissions]);

  useEffect(() => {
    if (isSynced && !isLoading) {
      if (!uiInfo?.hasCompletedWelcomeTour && tourSteps.length > 1) {
        setIsOpen(true);
      }
    }
  }, [isSynced, isLoading, uiInfo, tourSteps]);

  const handleComplete = () => {
    updateUiInfo({ hasCompletedWelcomeTour: true });
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen || tourSteps.length <= 1) return null;

  const stepData = tourSteps[currentStep];
  const IconComponent = stepData.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl text-left">
        <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
              }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{stepData.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {stepData.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Visual content */}
          <div className="px-6 pb-6">
            <div
              key={currentStep}
              className="min-h-[200px] animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <VisualContent type={stepData.visual} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex gap-1.5">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    Get Started <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTour;
