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

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, RefreshCw, Upload, Download } from "lucide-react";

import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { PER_PAGE } from "@/constants/constants";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useListImapSyncJobs, useCreateImapSyncJob } from "@/hooks/useImapSync";
import { listImapSyncJobs } from "@/api/imapSync"; // Assumed API export
import { useToastify } from "@/hooks/useToastify";
import useBulkImport from "@/hooks/useImport";
import useExport from "@/hooks/useExport"; // Added Export Hook
import { ImportActionLog } from "@/utils/importActionLog";

import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import AccessDenied from "@/components/common/AccessDenied";
import DomainSelector from "@/components/shared/DomainSelector";
import DropdownButton from "@/components/common/DropdownButton";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import BulkImportModal from "@/components/common/BulkImport";
import ExportModal from "@/components/common/ExportModal"; // Added Export Modal
import MailBoxSyncDetailsModal from "./MailBoxSyncDetailsModal";
import CreateImapSyncModal from "./CreateImapSyncModal";
import { FIELD_MAPPINGS } from "@/constants/export";
import { useTablePagination } from "@/hooks/useTablePagination";

// Define Export Columns Mapping

const MailBoxSyncList = () => {
  const [domainName, setDomainName] = useState(null);
   const { pagination, onPaginationChange: setPagination } =
      useTablePagination();

  const navigate = useNavigate();
  const { formatUserDateNice } = useUserTimezone();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const queryClient = useQueryClient();
  const toast = useToastify();
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch Jobs
  const { data, isLoading, isError, error, refetch } = useListImapSyncJobs(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { mutate: createSyncJob } = useCreateImapSyncJob();

  const jobs = data?.data?.imap_sync_jobs ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? 0;

  useEffect(() => {
    if (domainName) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [domainName]);

  // --- Export Configuration ---
  const fetchSyncJobsForExport = useCallback(
    async ({ page, pageSize }) => {
      if (!domainName) return { data: [], total_count: 0 };
      // Assuming getImapSyncJobs accepts (domainName, page, pageSize) matches the hook signature
      return await listImapSyncJobs(domainName, page, pageSize);
    },
    [domainName],
  );

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
  } = useExport(
    "imap_sync_jobs",
    fetchSyncJobsForExport,
    { domainName }, // Filter state passed for dependency tracking
    FIELD_MAPPINGS.imap_sync,
  );
  // ---------------------------

  // Bulk Import Configuration
  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("imap_sync_jobs", async (importedData) => {
    return new Promise((resolve, reject) => {
      createSyncJob(
        {
          ...importedData,
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (err) => reject(err),
        },
      );
    });
  });

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_imap_sync_jobs",
      message: `Imported IMAP sync jobs via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        domain_name: domainName,
      },
    };
    ImportActionLog({ values: ActionLog });

    queryClient.invalidateQueries(["imap_sync_jobs", domainName]);
  };

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "from_email",
        header: "Source Account",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span
              className="font-medium main-col text-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleViewDetails(row.original)}
            >
              {row.original.from_email}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.from_imap_server}:{row.original.from_imap_port}
            </span>
          </div>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "to_email",
        header: "Destination Account",
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue() || "-"}</span>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "sync_status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          let badgeClass = "bg-gray-500/10 text-gray-600 border-gray-500/20"; // Default

          switch (status) {
            case "PENDING":
              badgeClass =
                "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
              break;
            case "IN_PROGRESS":
              badgeClass =
                "bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse";
              break;
            case "SYNCED":
            case "COMPLETED":
              badgeClass =
                "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
              break;
            case "FAILED":
              badgeClass =
                "bg-destructive/10 text-destructive border-destructive/20";
              break;
            default:
              break;
          }

          return (
            <span
              className={`rounded-2xl border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
            >
              {status ? status.replace(/_/g, " ") : "UNKNOWN"}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "updated_at",
        header: "Last Updated",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
        meta: {
          align: "left",
        },
      },
    ];
  }, [formatUserDateNice]);

  const table = useReactTable({
    data: jobs,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("imap_sync:create")) {
      options.push({
        label: "New Sync Job",
        description: "Create a new IMAP sync job",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsCreateModalOpen(true),
      });
    }

    if (
      permissions.includes("imap_sync:create") &&
      isImportAvailable &&
      domainName
    ) {
      options.push({
        label: "Import",
        description: "Import multiple sync jobs",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    // Export Option
    if (permissions.includes("imap_sync:view") && domainName) {
      options.push({
        label: "Export",
        description: "Export sync jobs list",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    navigate,
    domainName,
    isImportAvailable,
    handleImport,
    handleExport,
  ]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (
    !permissions.includes("imap_sync:view") ||
    !permissions.includes("mailbox:view") ||
    !permissions.includes("domain:view")
  ) {
    return (
      <AccessDenied content="Don't have access to list Mailbox Sync jobs." />
    );
  }

  if (isError && isServerError) {
    return <DataFechError content="Error loading sync jobs...!" />;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Mailbox Sync" }]} />

          <div className="flex items-center justify-end gap-3 flex-1">
            {/* Refresh Button */}
            {domainName && (
              <button
                onClick={() => refetch()}
                className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center rounded-lg border border-transparent p-2 transition-all duration-200"
                title="Refresh List"
              >
                <RefreshCw
                  size={18}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            )}

            {/* Domain Selector */}
            <div className="w-full xl:w-auto xl:min-w-72">
              <DomainSelector
                domainName={domainName}
                setDomainName={setDomainName}
              />
            </div>

            {/* Actions Dropdown */}
            {domainName && createOptions.length > 0 && (
              <DropdownButton
                label="Actions"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>

        {/* Content */}
        {!domainName ? (
          <NoDataFound content="Please select a domain to view sync jobs" />
        ) : (
          <>
            {jobs.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : isError && !isServerError ? (
              <DataErrorWithReload content={error?.response?.data?.message} />
            ) : (
              <NoDataFound content="No sync jobs found for this domain" />
            )}
          </>
        )}
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Sync Jobs"
        description="Upload a CSV or Excel file to create multiple IMAP sync jobs at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Sync Jobs"
        description="Export the list of IMAP sync jobs for the selected domain."
      />

      <MailBoxSyncDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        job={selectedJob}
      />
      <CreateImapSyncModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        domainName={domainName}
      />
    </>
  );
};

export default MailBoxSyncList;
