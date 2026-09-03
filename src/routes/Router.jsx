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

import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense } from "react";
import PageNotFound from "@/components/common/PageNotFound";
import ErrorPage from "@/components/common/ErrorPage";
import FullLayout from "@/components/layouts/FullLayout";
import BlankLayout from "@/components/layouts/BlankLayout";
import DataLoading from "@/components/common/DataLoading";
import PrivateRoutes from "./PrivateRoutes";
import EmailClientSessions from "@/pages/clientSession/list";
import StatusPage from "@/pages/status";
import { lazyRetry } from "@/utils/lazyRetry";
import AppSession from "@/pages/appSession/list";
import SsoSession from "@/pages/ssoSession/list";
import PublicRoutes from "./PublicRoute";
import ResetPassword from "@/pages/auth/resetPassword";
import ListAdminTickets from "@/pages/tickets/admin/list";
import ServerProcsCopy from "@/pages/server/procs/ProcsCopy";

// Create a wrapper component for lazyRetry loading with consistent loading UI
const LazyWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        {" "}
        <DataLoading content="Loading..." />{" "}
      </div>
    }
  >
    {children}
  </Suspense>
);

// Auth Pages
const Login = lazyRetry(() => import("@/pages/auth/login"));
const Totp = lazyRetry(() => import("@/pages/auth/TOTP"));
const ChooseAuthMethod = lazyRetry(
  () => import("@/pages/auth/TOTP/chooseAuthMethod"),
);
const BackupLogin = lazyRetry(
  () => import("@/pages/auth/backupCode/BackupCode"),
);

const FollowUpUser = lazyRetry(() => import("@/pages/tickets/user/followUp"));

const FollowUpAdmin = lazyRetry(() => import("@/pages/tickets/admin/followUp"));
// Main Pages
const Dashboard = lazyRetry(() => import("@/pages/dashboard"));
const MyProfile = lazyRetry(() => import("@/pages/profile"));
const DocsPage = lazyRetry(() => import("@/pages/docs"));
const Test = lazyRetry(() => import("@/pages/test"));

// Domain Management
const ListDomains = lazyRetry(() => import("@/pages/domain/list"));
const DomainDetails = lazyRetry(() => import("@/pages/domain/details"));
const AddDomain = lazyRetry(() => import("@/pages/domain/add"));
const EditDomain = lazyRetry(() => import("@/pages/domain/edit"));
const CopyDomain = lazyRetry(() => import("@/pages/domain/copy"));

// Mailbox Management
const ListMailboxes = lazyRetry(() => import("@/pages/mailbox/list"));
const MailboxDetails = lazyRetry(() => import("@/pages/mailbox/details"));
const AddMailbox = lazyRetry(() => import("@/pages/mailbox/add"));
const EditMailbox = lazyRetry(() => import("@/pages/mailbox/edit"));
const CopyMailbox = lazyRetry(() => import("@/pages/mailbox/copy"));
// Server Management
const ListServers = lazyRetry(() => import("@/pages/server/list"));
const ServerDetails = lazyRetry(() => import("@/pages/server/details"));
const AddServer = lazyRetry(() => import("@/pages/server/add"));
const EditServer = lazyRetry(() => import("@/pages/server/edit"));
const ServerMigrations = lazyRetry(() => import("@/pages/server/migrations"));
const ServerMetricsPage = lazyRetry(() => import("@/pages/server/metrics"));
const DomainMigration = lazyRetry(
  () => import("@/pages/server/domainMigration"),
);
const ServerProcs = lazyRetry(() => import("@/pages/server/procs"));
const PflogsumReport = lazyRetry(() => import("@/pages/server/PFLogSum"));
//mailbox sync
const MailBoxSyncList = lazyRetry(() => import("@/pages/mailboxSync/list"));
const MailBoxSyncCreate = lazyRetry(() => import("@/pages/mailboxSync/create"));
// User Management
const ListUsers = lazyRetry(() => import("@/pages/userManagement/list"));
const UserDetails = lazyRetry(() => import("@/pages/userManagement/details"));
const AddUser = lazyRetry(() => import("@/pages/userManagement/add"));
const EditUser = lazyRetry(() => import("@/pages/userManagement/edit"));

// User Management
const ListApiKeys = lazyRetry(() => import("@/pages/apiKeys/list"));
const CreateApiKeys = lazyRetry(() => import("@/pages/apiKeys/create"));
const EditApiKeys = lazyRetry(() => import("@/pages/apiKeys/edit"));

// Organization Management
const OrganizationTreeView = lazyRetry(
  () => import("@/pages/organization/list"),
);
const OrganizationDetails = lazyRetry(
  () => import("@/pages/organization/details"),
);
const AddOrganization = lazyRetry(() => import("@/pages/organization/add"));
const EditOrganization = lazyRetry(() => import("@/pages/organization/edit"));




// Identity Management
const ListIdentities = lazyRetry(() => import("@/pages/identity/list"));
const AddIdentity = lazyRetry(() => import("@/pages/identity/add"));
const EditIdentity = lazyRetry(() => import("@/pages/identity/edit"));
const IdentityDetails = lazyRetry(() => import("@/pages/identity/details"));


// Department Management
const ListDepartments = lazyRetry(() => import("@/pages/department/list"));
const DepartmentDetails = lazyRetry(() => import("@/pages/department/details"));
const AddDepartment = lazyRetry(() => import("@/pages/department/add"));
const EditDepartment = lazyRetry(() => import("@/pages/department/edit"));
const CopyEditDepartment = lazyRetry(() => import("@/pages/department/copy"));

// Caution Management
const ListCautions = lazyRetry(() => import("@/pages/cautions/list"));
const CautionDetails = lazyRetry(() => import("@/pages/cautions/details"));
const AddCaution = lazyRetry(() => import("@/pages/cautions/add"));
const EditCaution = lazyRetry(() => import("@/pages/cautions/edit"));
const CopyEditCaution = lazyRetry(() => import("@/pages/cautions/copy"));

// support ticket
const ListUserTickets = lazyRetry(() => import("@/pages/tickets/user/list"));

// Logs
const AuditLog = lazyRetry(() => import("@/pages/logsFlow/audit/list"));
const EmailFlowLog = lazyRetry(() => import("@/pages/logsFlow/emailFlow/list"));
const LoginAttemptsLogs = lazyRetry(
  () => import("@/pages/logsFlow/login/list"),
);

// Policy Management - General
const ListGeneralPolicy = lazyRetry(
  () => import("@/pages/policy/GeneralPolicy/list"),
);
const AddIncommingPolicy = lazyRetry(
  () => import("@/pages/policy/GeneralPolicy/add"),
);
const EditIncomingPolicy = lazyRetry(
  () => import("@/pages/policy/GeneralPolicy/edit"),
);
const ViewIncomingPolicy = lazyRetry(
  () => import("@/pages/policy/GeneralPolicy/details"),
);
const CopyGeneralPolicy = lazyRetry(
  () => import("@/pages/policy/GeneralPolicy/copy"),
);

// Policy Management - Filters
const ListFiltersPolicy = lazyRetry(
  () => import("@/pages/policy/FiltersPolicy/list"),
);
const AddFiltersPolicy = lazyRetry(
  () => import("@/pages/policy/FiltersPolicy/add"),
);
const EditFiltersPolicy = lazyRetry(
  () => import("@/pages/policy/FiltersPolicy/edit"),
);
const ViewFiltersPolicy = lazyRetry(
  () => import("@/pages/policy/FiltersPolicy/details"),
);
const CopyFiltersPolicy = lazyRetry(
  () => import("@/pages/policy/FiltersPolicy/copy"),
);

//Attachment Policy
const AddAttachmentPolicy = lazyRetry(
  () => import("@/pages/policy/attachmentPolicy/create"),
);
const ListAttachmentPolicy = lazyRetry(
  () => import("@/pages/policy/attachmentPolicy/list"),
);
const EditAttachmentPolicy = lazyRetry(
  () => import("@/pages/policy/attachmentPolicy/edit"),
);
const ViewAttachmentPolicy = lazyRetry(
  () => import("@/pages/policy/attachmentPolicy/details"),
);
const CopyAttachmentPolicy = lazyRetry(
  () => import("@/pages/policy/attachmentPolicy/copy"),
);

// Restriction Policy
const ListRestrictionPolicy = lazyRetry(
  () => import("@/pages/policy/RestrictionPolicy/list"),
);
const AddRestrictionPolicy = lazyRetry(
  () => import("@/pages/policy/RestrictionPolicy/add"),
);
const EditRestrictionPolicy = lazyRetry(
  () => import("@/pages/policy/RestrictionPolicy/edit"),
);
const CopyRestrictionPolicy = lazyRetry(
  () => import("@/pages/policy/RestrictionPolicy/copy"),
);
const ViewRestrictionPolicy = lazyRetry(
  () => import("@/pages/policy/RestrictionPolicy/details"),
);

//Distribution Policy
const DistributionPolicy = lazyRetry(
  () => import("@/pages/policy/DistributionPolicy/list"),
);
const AddDistributionPolicy = lazyRetry(
  () => import("@/pages/policy/DistributionPolicy/add"),
);
const EditDistributionPolicy = lazyRetry(
  () => import("@/pages/policy/DistributionPolicy/edit"),
);
const ViewDistributionPolicy = lazyRetry(
  () => import("@/pages/policy/DistributionPolicy/details"),
);
const CopyDistributionPolicy = lazyRetry(
  () => import("@/pages/policy/DistributionPolicy/copy"),
);

//Forwarding Policy
const ForwardingPolicy = lazyRetry(
  () => import("@/pages/policy/ForwardingPolicy/list"),
);
const AddForwardingPolicy = lazyRetry(
  () => import("@/pages/policy/ForwardingPolicy/add"),
);
const EditForwardingPolicy = lazyRetry(
  () => import("@/pages/policy/ForwardingPolicy/edit"),
);
const CopyForwardingPolicy = lazyRetry(
  () => import("@/pages/policy/ForwardingPolicy/copy"),
);
const ViewForwardingPolicy = lazyRetry(
  () => import("@/pages/policy/ForwardingPolicy/details"),
);

// Disclaimer Management
const ListDisclaimers = lazyRetry(() => import("@/pages/disclaimer/list"));
const DisclaimerDetails = lazyRetry(() => import("@/pages/disclaimer/details"));
const AddDisclaimer = lazyRetry(() => import("@/pages/disclaimer/add"));
const EditDisclaimer = lazyRetry(() => import("@/pages/disclaimer/edit"));
const CopyEditDisclaimer = lazyRetry(() => import("@/pages/disclaimer/copy"));

// CRM - Services
const CRMService = lazyRetry(() => import("@/pages/crm/service/list"));
const AddCRMService = lazyRetry(() => import("@/pages/crm/service/add"));
const EditCRMService = lazyRetry(() => import("@/pages/crm/service/edit"));
const ViewCRMService = lazyRetry(() => import("@/pages/crm/service/details"));

// CRM - Purchase Orders
const CRMPO = lazyRetry(() => import("@/pages/crm/purchaseOrder/list"));
const AddCRMPO = lazyRetry(() => import("@/pages/crm/purchaseOrder/add"));
const EditCRMPO = lazyRetry(() => import("@/pages/crm/purchaseOrder/edit"));
const ViewCRMPO = lazyRetry(() => import("@/pages/crm/purchaseOrder/details"));
const CRMLinkCreate = lazyRetry(
  () => import("@/pages/crm/purchaseOrder/linkAdd"),
);
const CRMLinkEdit = lazyRetry(
  () => import("@/pages/crm/purchaseOrder/linkEdit"),
);

// CRM - Invoices
const CreateInvoice = lazyRetry(() => import("@/pages/crm/invoices/create"));
const ListInvoice = lazyRetry(() => import("@/pages/crm/invoices/list"));
const InvoiceDetails = lazyRetry(() => import("@/pages/crm/invoices/details"));
const CreateRevision = lazyRetry(
  () => import("@/pages/crm/invoices/createRevision"),
);
const EditInvoice = lazyRetry(() => import("@/pages/crm/invoices/edit"));
const CreateCopy = lazyRetry(() => import("@/pages/crm/invoices/createCopy"));

// Permission Templates
const ListPermissionTemplete = lazyRetry(
  () => import("@/pages/permissionsTemplate/list"),
);
const CreatePermissionTemplate = lazyRetry(
  () => import("@/pages/permissionsTemplate/add"),
);

const MailQSearch = lazyRetry(
  () => import("@/pages/server/mailQ/searchMailQ/index"),
);

const MailMapping = lazyRetry(() => import("@/pages/server/mapmapping"));

const IdentityLookup = lazyRetry(
  () => import("@/pages/server/identityLookup"),
);

// Chat
const ChatDashboard = lazyRetry(() => import("@/pages/chat/dashboard"));
const ChatPreference = lazyRetry(() => import("@/pages/chat/preference"));
const ChatUserList = lazyRetry(() => import("@/pages/chat/users"));
const AddChatUser = lazyRetry(() => import("@/pages/chat/preference"));
const EditChatUser = lazyRetry(() => import("@/pages/chat/preference"));

// Files
const FilePreference = lazyRetry(() => import("@/pages/files/preference"));
const FileUserList = lazyRetry(() => import("@/pages/files/users"));
const FilesDashboard = lazyRetry(() => import("@/pages/files/dashboard"));
const MaintenanceStatusListing = lazyRetry(
  () => import("@/pages/maintenance/list"),
);
const AddMaintenanceStatus = lazyRetry(() => import("@/pages/maintenance/add"));
const EditMaintenanceStatus = lazyRetry(
  () => import("@/pages/maintenance/edit"),
);
const ViewMaintenanceStatus = lazyRetry(
  () => import("@/pages/maintenance/view"),
);

const Router = [
  {
    path: "/",
    element: <PrivateRoutes />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <FullLayout />,
        children: [
          {
            path: "/",
            exact: true,
            element: (
              <LazyWrapper>
                <Dashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "/profile",
            element: (
              <LazyWrapper>
                <MyProfile />
              </LazyWrapper>
            ),
          },
          {
            path: "/test",
            element: (
              <LazyWrapper>
                <Test />
              </LazyWrapper>
            ),
          },

          {
            path: "/email-client-sessions",
            element: (
              <LazyWrapper>
                <EmailClientSessions />
              </LazyWrapper>
            ),
          },
          {
            path: "/app-sessions",
            element: (
              <LazyWrapper>
                <AppSession />
              </LazyWrapper>
            ),
          },
          {
            path: "/sso-sessions",
            element: (
              <LazyWrapper>
                <SsoSession />
              </LazyWrapper>
            ),
          },


          // Domain routes
          {
            path: "/domain",
            element: (
              <LazyWrapper>
                <ListDomains />
              </LazyWrapper>
            ),
          },
          {
            path: "/domain/:domain_name",
            element: (
              <LazyWrapper>
                <DomainDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/domain/add/",
            element: (
              <LazyWrapper>
                <AddDomain />
              </LazyWrapper>
            ),
          },
          {
            path: "/domain/edit/:domain_name",
            element: (
              <LazyWrapper>
                <EditDomain />
              </LazyWrapper>
            ),
          },
          {
            path: "/domain/copy",
            element: (
              <LazyWrapper>
                <CopyDomain />
              </LazyWrapper>
            ),
          },

          // Mailbox routes
          {
            path: "/mailbox",
            element: (
              <LazyWrapper>
                <ListMailboxes />
              </LazyWrapper>
            ),
          },
          {
            path: "/mailbox/:email",
            element: (
              <LazyWrapper>
                <MailboxDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/mailbox/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddMailbox />
              </LazyWrapper>
            ),
          },
          {
            path: "/mailbox/edit/:email",
            element: (
              <LazyWrapper>
                <EditMailbox />
              </LazyWrapper>
            ),
          },

          {
            path: "/mailbox/copy/:domain_name",
            element: (
              <LazyWrapper>
                <CopyMailbox />
              </LazyWrapper>
            ),
          },

          // Server routes
          {
            path: "/server/list",
            element: (
              <LazyWrapper>
                <ListServers />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/:server_id",
            element: (
              <LazyWrapper>
                <ServerDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/add/",
            element: (
              <LazyWrapper>
                <AddServer />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/edit/:server_id",
            element: (
              <LazyWrapper>
                <EditServer />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/migrations",
            element: (
              <LazyWrapper>
                <ServerMigrations />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/stats",
            element: (
              <LazyWrapper>
                <ServerMetricsPage />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/domain-migration",
            element: (
              <LazyWrapper>
                <DomainMigration />
              </LazyWrapper>
            ),
          },

          {
            path: "/server/pflogsum-report",
            element: (
              <LazyWrapper>
                <PflogsumReport />
              </LazyWrapper>
            ),
          },

          {
            path: "/server/procs",
            element: (
              <LazyWrapper>
                <ServerProcs />
              </LazyWrapper>
            ),
          },

          {
            path: "/server/procs/copy45",
            element: (
              <LazyWrapper>
                <ServerProcsCopy />
              </LazyWrapper>
            ),
          },

          //api keys - disabled for v2
          // {
          //   path: "/keys",
          //   element: (
          //     <LazyWrapper>
          //       <ListApiKeys />
          //     </LazyWrapper>
          //   ),
          // },
          // {
          //   path: "/keys/create",
          //   element: (
          //     <LazyWrapper>
          //       <CreateApiKeys />
          //     </LazyWrapper>
          //   ),
          // },
          // {
          //   path: "/keys/edit/:api_key_id",
          //   element: (
          //     <LazyWrapper>
          //       <EditApiKeys />
          //     </LazyWrapper>
          //   ),
          // },

          // User routes
          {
            path: "/user/",
            element: (
              <LazyWrapper>
                <ListUsers />
              </LazyWrapper>
            ),
          },
          {
            path: "/user/:user_id",
            element: (
              <LazyWrapper>
                <UserDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/user/add/",
            element: (
              <LazyWrapper>
                <AddUser />
              </LazyWrapper>
            ),
          },
          {
            path: "/user/edit/:user_id",
            element: (
              <LazyWrapper>
                <EditUser />
              </LazyWrapper>
            ),
          },

          // Tickets - disabled for v2
          // {
          //   path: "/support/tickets",
          //   element: (
          //     <LazyWrapper>
          //       <ListUserTickets />
          //     </LazyWrapper>
          //   ),
          // },

          // {
          //   path: "/support/tickets/:id",
          //   element: (
          //     <LazyWrapper>
          //       <FollowUpUser />
          //     </LazyWrapper>
          //   ),
          // },

          // {
          //   path: "/support/admin/tickets/:id",
          //   element: (
          //     <LazyWrapper>
          //       <FollowUpAdmin />
          //     </LazyWrapper>
          //   ),
          // },

          // {
          //   path: "/support/admin/tickets",
          //   element: (
          //     <LazyWrapper>
          //       <ListAdminTickets />
          //     </LazyWrapper>
          //   ),
          // },

          // Organization routes
          {
            path: "/organization",
            element: (
              <LazyWrapper>
                <OrganizationTreeView />
              </LazyWrapper>
            ),
          },
          {
            path: "/organization/:org_id",
            element: (
              <LazyWrapper>
                <OrganizationDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/organization/add",
            element: (
              <LazyWrapper>
                <AddOrganization />
              </LazyWrapper>
            ),
          },
          {
            path: "/organization/edit/:org_id",
            element: (
              <LazyWrapper>
                <EditOrganization />
              </LazyWrapper>
            ),
          },

          // Identity routes
          {
            path: "/identities",
            element: (
              <LazyWrapper>
                <ListIdentities />
              </LazyWrapper>
            ),
          },
          {
            path: "/identities/:email",
            element: (
              <LazyWrapper>
                <IdentityDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/identities/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddIdentity />
              </LazyWrapper>
            ),
          },
          {
            path: "/identities/edit/:email",
            element: (
              <LazyWrapper>
                <EditIdentity />
              </LazyWrapper>
            ),
          },

          // Department routes
          {
            path: "/department",
            element: (
              <LazyWrapper>
                <ListDepartments />
              </LazyWrapper>
            ),
          },
          {
            path: "/department/:department_id",
            element: (
              <LazyWrapper>
                <DepartmentDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/department/add/",
            element: (
              <LazyWrapper>
                <AddDepartment />
              </LazyWrapper>
            ),
          },
          {
            path: "/department/edit/:department_id",
            element: (
              <LazyWrapper>
                <EditDepartment />
              </LazyWrapper>
            ),
          },

          {
            path: "/department/copy/:department_id",
            element: (
              <LazyWrapper>
                <CopyEditDepartment />
              </LazyWrapper>
            ),
          },

          // Caution routes
          {
            path: "/caution",
            element: (
              <LazyWrapper>
                <ListCautions />
              </LazyWrapper>
            ),
          },
          {
            path: "/caution/:caution_id",
            element: (
              <LazyWrapper>
                <CautionDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/caution/add/",
            element: (
              <LazyWrapper>
                <AddCaution />
              </LazyWrapper>
            ),
          },
          {
            path: "/caution/edit/:caution_id",
            element: (
              <LazyWrapper>
                <EditCaution />
              </LazyWrapper>
            ),
          },
          {
            path: "/caution/copy/:caution_id",
            element: (
              <LazyWrapper>
                <CopyEditCaution />
              </LazyWrapper>
            ),
          },

          // Logs routes
          {
            path: "/logs/audit-logs",
            element: (
              <LazyWrapper>
                <AuditLog />
              </LazyWrapper>
            ),
          },
          {
            path: "/logs/email-flow-logs",
            element: (
              <LazyWrapper>
                <EmailFlowLog />
              </LazyWrapper>
            ),
          },
          {
            path: "/logs/email-login-attempts",
            element: (
              <LazyWrapper>
                <LoginAttemptsLogs />
              </LazyWrapper>
            ),
          },

          // General Policy routes
          {
            path: "/policies/general",
            element: (
              <LazyWrapper>
                <ListGeneralPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/general/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddIncommingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/general/edit/:general_policy_id",
            element: (
              <LazyWrapper>
                <EditIncomingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/general/:general_policy_id",
            element: (
              <LazyWrapper>
                <ViewIncomingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/general/copy/:copy_domain_name",
            element: (
              <LazyWrapper>
                <CopyGeneralPolicy />
              </LazyWrapper>
            ),
          },

          // Filters Policy routes
          {
            path: "/policies/filters",
            element: (
              <LazyWrapper>
                <ListFiltersPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/filters/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddFiltersPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/filters/edit/:filters_policy_id",
            element: (
              <LazyWrapper>
                <EditFiltersPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/filters/:filters_policy_id",
            element: (
              <LazyWrapper>
                <ViewFiltersPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/filters/copy/:copy_domain_name",
            element: (
              <LazyWrapper>
                <CopyFiltersPolicy />
              </LazyWrapper>
            ),
          },

          //attachment filter
          {
            path: "/policies/attachments/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddAttachmentPolicy />
              </LazyWrapper>
            ),
          },

          {
            path: "/policies/attachment",
            element: (
              <LazyWrapper>
                <ListAttachmentPolicy />
              </LazyWrapper>
            ),
          },

          {
            path: "/policies/attachments/edit/:policy_id/:domain_name",
            element: (
              <LazyWrapper>
                <EditAttachmentPolicy />
              </LazyWrapper>
            ),
          },

          {
            path: "/policies/attachments/:policy_id/:domain_name",
            element: (
              <LazyWrapper>
                <ViewAttachmentPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/attachments/copy/:copy_domain_name",
            element: (
              <LazyWrapper>
                <CopyAttachmentPolicy />
              </LazyWrapper>
            ),
          },

          // Restriction Policy routes
          {
            path: "/policies/restrictions",
            element: (
              <LazyWrapper>
                <ListRestrictionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/restrictions/add",
          
            element: (
              <LazyWrapper>
                <AddRestrictionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/restrictions/edit/:policy_restrictions_id",
            element: (
              <LazyWrapper>
                <EditRestrictionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/restrictions/:restriction_policy_id",
            element: (
              <LazyWrapper>
                <ViewRestrictionPolicy />
              </LazyWrapper>
            ),
          },

          // Distribution Policy routes
          {
            path: "/policies/distribution",
            element: (
              <LazyWrapper>
                <DistributionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/distribution/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddDistributionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/distribution/edit/:policy_distribution_id",
            element: (
              <LazyWrapper>
                <EditDistributionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/distribution/:policy_distribution_id",
            element: (
              <LazyWrapper>
                <ViewDistributionPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/distribution/copy/:copy_domain_name",
            element: (
              <LazyWrapper>
                <CopyDistributionPolicy />
              </LazyWrapper>
            ),
          },

          //Forwarding Policy routes
          {
            path: "/policies/forwarding",
            element: (
              <LazyWrapper>
                <ForwardingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/forwarding/add/:domain_name",
            element: (
              <LazyWrapper>
                <AddForwardingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/forwarding/edit/:policy_forwarding_id",
            element: (
              <LazyWrapper>
                <EditForwardingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/forwarding/:policy_forwarding_id",
            element: (
              <LazyWrapper>
                <ViewForwardingPolicy />
              </LazyWrapper>
            ),
          },
          {
            path: "/policies/forwarding/copy/:copy_domain_name",
            element: (
              <LazyWrapper>
                <CopyForwardingPolicy />
              </LazyWrapper>
            ),
          },
          // Disclaimer routes
          {
            path: "/disclaimer",
            element: (
              <LazyWrapper>
                <ListDisclaimers />
              </LazyWrapper>
            ),
          },
          {
            path: "/disclaimer/:disclaimer_id",
            element: (
              <LazyWrapper>
                <DisclaimerDetails />
              </LazyWrapper>
            ),
          },
          {
            path: "/disclaimer/add/",
            element: (
              <LazyWrapper>
                <AddDisclaimer />
              </LazyWrapper>
            ),
          },
          {
            path: "/disclaimer/edit/:disclaimer_id",
            element: (
              <LazyWrapper>
                <EditDisclaimer />
              </LazyWrapper>
            ),
          },
          {
            path: "/disclaimer/copy/:disclaimer_id",
            element: (
              <LazyWrapper>
                <CopyEditDisclaimer />
              </LazyWrapper>
            ),
          },

          // CRM Service routes
          {
            path: "/crm/services",
            element: (
              <LazyWrapper>
                <CRMService />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/services/add",
            element: (
              <LazyWrapper>
                <AddCRMService />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/services/edit/:service_id",
            element: (
              <LazyWrapper>
                <EditCRMService />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/services/:service_id",
            element: (
              <LazyWrapper>
                <ViewCRMService />
              </LazyWrapper>
            ),
          },

          // CRM Purchase Order routes
          {
            path: "/crm/purchase-order",
            element: (
              <LazyWrapper>
                <CRMPO />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/purchase-order/add",
            element: (
              <LazyWrapper>
                <AddCRMPO />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/purchase-order/edit/:po_id",
            element: (
              <LazyWrapper>
                <EditCRMPO />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/purchase-order/:po_id",
            element: (
              <LazyWrapper>
                <ViewCRMPO />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/purchase-order/create-link-service/:po_id",
            element: (
              <LazyWrapper>
                <CRMLinkCreate />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/purchase-order/edit-link-service/:po_id/:assignment_id",
            element: (
              <LazyWrapper>
                <CRMLinkEdit />
              </LazyWrapper>
            ),
          },

          // CRM Invoice routes
          {
            path: "/crm/invoice/create",
            element: (
              <LazyWrapper>
                <CreateInvoice />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/invoice/create-copy",
            element: (
              <LazyWrapper>
                <CreateCopy />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/invoice/revise",
            element: (
              <LazyWrapper>
                <CreateRevision />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/invoice/edit",
            element: (
              <LazyWrapper>
                <EditInvoice />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/invoice",
            element: (
              <LazyWrapper>
                <ListInvoice />
              </LazyWrapper>
            ),
          },
          {
            path: "/crm/invoice/view",
            element: (
              <LazyWrapper>
                <InvoiceDetails />
              </LazyWrapper>
            ),
          },

          //mailboxSync

          {
            path: "/server/mailbox-sync",
            element: (
              <LazyWrapper>
                <MailBoxSyncList />
              </LazyWrapper>
            ),
          },

          {
            path: "/server/mailbox-sync/add/:domain_name",
            element: (
              <LazyWrapper>
                <MailBoxSyncCreate />
              </LazyWrapper>
            ),
          },

          //api keys

          // Permission Template routes
          {
            path: "/permissions-template/",
            element: (
              <LazyWrapper>
                <ListPermissionTemplete />
              </LazyWrapper>
            ),
          },
          {
            path: "/permissions-template/add",
            element: (
              <LazyWrapper>
                <CreatePermissionTemplate />
              </LazyWrapper>
            ),
          },

          {
            path: "/server/mail-queue/search",
            element: (
              <LazyWrapper>
                <MailQSearch />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/mail-mapping",
            element: (
              <LazyWrapper>
                <MailMapping />
              </LazyWrapper>
            ),
          },
          {
            path: "/server/identity-lookup",
            element: (
              <LazyWrapper>
                <IdentityLookup />
              </LazyWrapper>
            ),
          },
          {
            path: "/maintenance",
            element: (
              <LazyWrapper>
                <MaintenanceStatusListing />
              </LazyWrapper>
            ),
          },
          {
            path: "/maintenance/create",
            element: (
              <LazyWrapper>
                <AddMaintenanceStatus />
              </LazyWrapper>
            ),
          },
          {
            path: "/maintenance/edit/:maintenance_id",
            element: (
              <LazyWrapper>
                <EditMaintenanceStatus />
              </LazyWrapper>
            ),
          },
          {
            path: "/maintenance/view/:maintenance_id",
            element: (
              <LazyWrapper>
                <ViewMaintenanceStatus />
              </LazyWrapper>
            ),
          },
          {
            path: "/status",
            element: <StatusPage />,
          },

          // Documentation
          {
            path: "/docs",
            element: (
              <LazyWrapper>
                <DocsPage />
              </LazyWrapper>
            ),
          },
          {
            path: "/docs/:feature/:flow",
            element: (
              <LazyWrapper>
                <DocsPage />
              </LazyWrapper>
            ),
          },

          // Chat routes
          {
            path: "/chat/dashboard",
            element: (
              <LazyWrapper>
                <ChatDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "/chat/preference",
            element: (
              <LazyWrapper>
                <ChatPreference />
              </LazyWrapper>
            ),
          },
          {
            path: "/chat/user",
            element: (
              <LazyWrapper>
                <ChatUserList />
              </LazyWrapper>
            ),
          },
          {
            path: "/chat/user/add",
            element: (
              <LazyWrapper>
                <AddChatUser />
              </LazyWrapper>
            ),
          },
          {
            path: "/chat/user/edit/:id",
            element: (
              <LazyWrapper>
                <EditChatUser />
              </LazyWrapper>
            ),
          },

          // Files routes
          {
            path: "/files/dashboard",
            element: (
              <LazyWrapper>
                <FilesDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "/files/preferences",
            element: (
              <LazyWrapper>
                <FilePreference />
              </LazyWrapper>
            ),
          },
          {
            path: "/files/users",
            element: (
              <LazyWrapper>
                <FileUserList />
              </LazyWrapper>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <PublicRoutes />, // Add PublicRoutes wrapper here
    children: [
      {
        element: <BlankLayout />,
        children: [
          {
            path: "/login",
            element: (
              <LazyWrapper>
                <Login />
              </LazyWrapper>
            ),
          },
          {
            path: "/reset/admin",
            element: (
              <LazyWrapper>
                <ResetPassword />
              </LazyWrapper>
            ),
          },
          {
            // Identity (mailbox) password reset now lives inside the same
            // unified reset page — this keeps old bookmarks/links working
            // by pre-selecting the "Email Identity" tab.
            path: "/reset/email",
            element: <Navigate to="/reset/admin?mode=identity" replace />,
          },

          {
            path: "/2fa/validate/:method",
            element: (
              <LazyWrapper>
                <Totp />
              </LazyWrapper>
            ),
          },
          {
            path: "/2fa/select-method",
            element: (
              <LazyWrapper>
                <ChooseAuthMethod />
              </LazyWrapper>
            ),
          },
          {
            path: "/2fa/backup-code-login",
            element: (
              <LazyWrapper>
                <BackupLogin />
              </LazyWrapper>
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <PageNotFound /> },
];

const router = createBrowserRouter(Router, { basename: "/" });

export default router;
