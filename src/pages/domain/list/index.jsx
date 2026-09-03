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

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetDomains,
  useAddDomain,
  useDeleteDomain,
  useUpdateDomain,
  useUpdateDomainSpace,
  useUpdateDomainStatus,
  useMoveDomain,
} from "@/hooks/useDomain";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import Table from "@/components/shared/Table";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import {
  Button,
  DeleteButton,
  IconButton,
  SubmitButton,
  TableCancelButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { ActiveStatus, InactiveStatus } from "@/components/common/Status";
import NoDataFound from "@/components/common/NoDataFound";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import DeleteBlockedModal from "@/components/common/DeleteBlockedModal";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import { usePreDeleteCheck } from "@/hooks/usePreDeleteCheck";
import { getIdentities } from "@/api/identities";
import ExportModal from "@/components/common/ExportModal";
import ProgressBar from "@/components/common/Progress";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  Trash2,
  Download,
  Plus,
  Upload,
  CheckCircle,
  XCircle,
  ChartPie,
  Globe,
  Edit,
  ArrowRightLeft,
  Copy,
  ShieldCheck,
} from "lucide-react";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import BulkImportModal from "@/components/common/BulkImport";
import { PER_PAGE } from "@/constants/constants";
import EditModelBox from "@/components/common/EditModelBox";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/common/Inputs";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { getDomain, getDomains } from "@/api/domain";
import { normalizeDomainDetailsForForm } from "@/utils/domainUtils";
import { FIELD_MAPPINGS } from "@/constants/export";
import useExport from "@/hooks/useExport";
import { useUserTimezone } from "@/hooks/useTimezone";
import DNSRecordsModal from "./DNSRecord";
import DomainTxtVerificationModal from "./DomainTxtVerificationModal";
import { generateSecretCode } from "@/utils/secretCode";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import BulkImportModalDomain from "@/components/common/BulkDomainImport";
import SearchBar from "@/components/shared/SearchBar";
import MultiDelete from "@/components/shared/MultiDelete";
import MoveDomian from "@/components/common/MoveDomian";
import CopyModal from "@/components/common/CopyModal";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListDomains = () => {
  const navigate = useNavigate();
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [spaceValue, setSpaceValue] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [currentDomainData, setCurrentDomainData] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const {
    runCheck: runDeleteCheck,
    checkingId: checkingDeleteId,
    blockInfo: deleteBlockInfo,
    clearBlock: clearDeleteBlock,
  } = usePreDeleteCheck();
  const { permissions = [] } = useAtomValue(userProfileAtom) ?? {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { mutate, isPending } = useDeleteDomain();
  const { mutate: createDomain } = useAddDomain();
  const { mutate: updateDomainMutate } = useUpdateDomain();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { formatUserDateNice } = useUserTimezone();
  const [isOpenMove, setIsOpenMove] = useState(false);
  const [moveValue, setMoveValue] = useState({
    id: null,
    name: "",
  });
  const [isSingle, setIsSingle] = useState(true);

  const { data, isLoading, isError, error, refetch } = useGetDomains(
    organization_id,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  // Search handler function
  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page when searching
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateDomainStatus();
  const { mutate: spaceUpdate, isPending: spaceLoad } = useUpdateDomainSpace();
  const { mutate: moveDomain, isPending: moveLoading } = useMoveDomain();

  //domain record
  const [showDNSModal, setShowDNSModal] = useState(false);
  const [selectedDomainForDNS, setSelectedDomainForDNS] = useState(null);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoadingDNS, setIsLoadingDNS] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyDomain, setCopyDomain] = useState(null);
  const [showTxtVerifyModal, setShowTxtVerifyModal] = useState(false);
  const [selectedDomainForVerify, setSelectedDomainForVerify] = useState(null);

  const handleDNSModalClose = () => {
    setShowDNSModal(false);
    setSelectedDomainForDNS(null);
    setDnsRecords([]);
  };

  const handleViewDNS = (row) => {
    setSelectedDomainForDNS(row.domain_name);
    setShowDNSModal(true);
  };

  const handleVerifyDomain = (row) => {
    setSelectedDomainForVerify(row.domain_name);
    setShowTxtVerifyModal(true);
  };

  const handleTxtVerifyModalClose = () => {
    setShowTxtVerifyModal(false);
    setSelectedDomainForVerify(null);
  };

  const refreshDNSRecords = () => {
    if (selectedDomainForDNS) {
      // loadDNSRecords(selectedDomainForDNS);
    }
  };

  const fetchDomainsForExport = async ({ organization_id, page, pageSize }) => {
    const listResponse = await getDomains(organization_id, page, pageSize);
    const leanDomains = listResponse?.domains?.domains || [];

    // The list response only carries a handful of fields — everything the
    // import template needs (hybrid/catch-all/spam/password-age settings,
    // etc.) only lives in the per-domain details response. Enrich each row
    // so the export matches the import template field-for-field.
    const enrichedDomains = await Promise.all(
      leanDomains.map(async (domain) => {
        try {
          const detail = (await getDomain(domain.domain_name))?.domain_details;
          return { ...domain, ...normalizeDomainDetailsForForm(detail) };
        } catch (err) {
          console.error(
            `Failed to fetch details for domain "${domain.domain_name}" during export`,
            err,
          );
          return domain;
        }
      }),
    );

    return {
      ...listResponse,
      domains: {
        ...listResponse.domains,
        domains: enrichedDomains,
      },
    };
  };

  const handleCopy = (row) => {
    setCopyDomain({
      id: row.domain_name,
      name: row.domain_name,
    });
    setShowCopyModal(true);
  };

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("domains", async (domainData) => {
    return new Promise((resolve, reject) => {
      createDomain(
        {
          data: {
            ...domainData,
            associated_organization_id: organization_id,
          },
          addLog: false,
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  });

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport("domains", fetchDomainsForExport, {}, FIELD_MAPPINGS.domains);

  // Bulk edit: export domains -> edit the file -> re-upload here. Each row
  // is matched back to an existing domain by "Domain Name" and PATCHed via
  // updateDomain, the same mutation the single "Edit Domain" form uses.
  const handleBulkEditDomain = async (domainData) => {
    const { organization_id: rowOrgId, domain_name, ...rest } = domainData;
    const data = { ...rest };

    // Mirrors transformFormData in pages/domain/edit/index.jsx: the backend
    // expects password-age settings nested under max_password_age_properties,
    // not as the flat enable_max_password_age/max_password_age/notify_1-3
    // fields the import field mapping produces - keep the two in sync.
    data.max_password_age_properties = {
      enable_max_password_age: data.enable_max_password_age || false,
    };
    if (data.enable_max_password_age) {
      data.max_password_age_properties.max_password_age = data.max_password_age;
      data.max_password_age_properties.notify_at = [
        data.notify_1,
        data.notify_2,
        data.notify_3,
      ]
        .filter((v) => v !== undefined && v !== null && v !== "")
        .sort((a, b) => a - b);
    } else {
      data.max_password_age = 0;
      data.max_password_age_properties.max_password_age = 0;
      data.max_password_age_properties.notify_at = [];
    }
    delete data.enable_max_password_age;
    delete data.notify_1;
    delete data.notify_2;
    delete data.notify_3;

    return new Promise((resolve, reject) => {
      updateDomainMutate(
        { organization_id: rowOrgId, domain_name, data },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const {
    isEditModalOpen,
    editConfig,
    handleBulkEdit,
    handleEditModalClose,
    handleEditComplete,
    isEditAvailable,
  } = useBulkEdit("domains", handleBulkEditDomain, "domain_name");

  const domains = data?.domains ?? [];
  const totalPages = data?.domains?.total_pages ?? 1;
  const totalCount = data?.domains?.total_count ?? 0;

  const {
    selectedCount,
    selectedItemsWithLabels,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleItem,
    toggleAllCurrentPage,
    clearSelection,
    isItemSelected,
    removeFromSelection,
  } = useBulkSelection(domains?.domains || [], "domain_name", "domain_name");

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAllCurrentPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeCurrentPageSelected;
              }}
              onChange={toggleAllCurrentPage}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isItemSelected(row.original.domain_name)}
              onChange={() => toggleItem(row.original.domain_name)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "domain_name",
        header: "Domain",
        cell: ({ getValue }) => (
          <Link
            className="main-col"
            to={`/domain/${encodeURIComponent(getValue())}`}
          >
            {getValue()}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => {
          return <StatusBadge status={getValue()} />;
        },
      },
      {
        accessorKey: "is_dns_txt_verified",
        header: "DNS Verification",
        cell: ({ getValue }) => {
          return (
            <StatusBadge
              status={getValue() ? "verified" : "pending"}
              customText={getValue() ? "Verified" : "Pending Verification"}
            />
          );
        },
      },

      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
    ];
    if (
      permissions.includes("domain:edit") ||
      permissions.includes("domain:delete") ||
      permissions.includes("domain:view")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (
            permissions.includes("domain:edit") &&
            !row.original.is_dns_txt_verified
          ) {
            actions.push({
              label: "Verify Domain",
              icon: ShieldCheck,
              variant: "default",
              onClick: () => handleVerifyDomain(row.original),
              tooltip: "View the TXT record and verify domain ownership",
            });
          }

          if (permissions.includes("domain:edit")) {
            actions.push({
              label: "Edit Domain",
              icon: Edit,
              variant: "default",
              disabled: !row.original.is_dns_txt_verified,
              onClick: () =>
                navigate(`/domain/edit/${row.original.domain_name}`),
              tooltip: row.original.is_dns_txt_verified
                ? "Edit domain"
                : "Verify the domain's DNS TXT record before editing",
            });
          }

          if (permissions.includes("domain:view")) {
            actions.push({
              label: "View DNS Records",
              icon: Globe,
              variant: "default",
              disabled: !row.original.is_dns_txt_verified,
              onClick: () => handleViewDNS(row.original),
              tooltip: row.original.is_dns_txt_verified
                ? "View DNS Records"
                : "Verify the domain's DNS TXT record first",
            });
          }

          if (permissions.includes("domain:create")) {
            actions.push({
              label: "Move Domain",
              variant: "default",
              icon: ArrowRightLeft,
              onClick: () => handleMoveDomain(row.original),
            });
          }

          // Copy Domain option removed from V3
          // if (permissions.includes("domain:create")) {
          //   actions.push({
          //     label: "Copy Domain",
          //     icon: Copy,
          //     variant: "default",
          //     onClick: () => handleCopy(row.original),
          //     tooltip: "Copy to another organization",
          //   });
          // }

          if (permissions.includes("domain:delete") && actions.length > 0) {
            actions.push({ separator: true });
          }

          const canToggleActivation =
            row.original.is_active || row.original.is_dns_txt_verified;

          if (permissions.includes("domain:edit")) {
            actions.push({
              label: row.original.is_active ? "Deactivate" : "Activate",
              icon: row.original.is_active ? XCircle : CheckCircle,
              variant: row.original.is_active ? "danger" : "success",
              disabled: !canToggleActivation,
              onClick: () => handleStatus(row.original),
              tooltip: canToggleActivation
                ? "Toggle status"
                : "Verify the domain's DNS TXT record before activating",
            });
          }

          if (permissions.includes("domain:delete")) {
            const isCheckingThisRow =
              checkingDeleteId === row.original.domain_name;
            actions.push({
              label: isCheckingThisRow ? "Checking..." : "Delete Domain",
              icon: Trash2,
              variant: "danger",
              disabled: isCheckingThisRow,
              onClick: () => handleDelete(row.original),
              tooltip: "Delete domain",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown height={350} actions={actions} />
            </div>
          );
        },
        size: 60,
      });
    }

    return baseColumns;
  }, [
    permissions,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleAllCurrentPage,
    toggleItem,
    isItemSelected,
    checkingDeleteId,
  ]);

  const handleDelete = (row) => {
    const domainName = row.domain_name;
    runDeleteCheck({
      id: domainName,
      name: domainName,
      checks: [
        {
          label: "email identity",
          fn: async (name) =>
            (await getIdentities(name, 1, 1))?.data?.total_count ?? 0,
        },
      ],
      onClear: () => {
        setDeleteValue(domainName);
        setDeleteId(domainName);
        setShowDeleteModal(true);
      },
    });
  };

  const handleStatus = (row) => {
    setStatusId(row.domain_name);
    setStatusValue(!row.is_active);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleSpace = (row) => {
    setSpaceId(row.domain_name);
    setSpaceValue(row.quota_allocated);
    setShowSpaceModal(true);
    setCurrentDomainData(row);
  };

  const handleSpaceClose = () => {
    setSpaceId("");
    setSpaceValue("");
    setShowSpaceModal(false);
  };

  const handleMoveDomain = (row) => {
    console.error("row", row.domain_name);

    setIsSingle(true);
    setMoveValue({
      id: 1,
      name: row?.domain_name,
    });
    setIsOpenMove(true);
  };

  const handleAddDomain = () => {
    navigate("/domain/add/");
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_domains",
      message: `Imported domains via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        organization_id: organization_id,
      },
    };
    ImportActionLog({ values: ActionLog });
    queryClient.invalidateQueries(["domains", organization_id]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_domains",
      message: `Updated domains via bulk edit`,
      payload: {
        ...results,
        total_updated: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        organization_id: organization_id,
      },
    };
    ImportActionLog({ values: ActionLog });
    queryClient.invalidateQueries(["domains", organization_id]);
  };

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { organization_id, domain_name: deleteId },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted domain");
            queryClient.invalidateQueries(["domains", organization_id]);
            removeFromSelection([deleteId]);
            setShowDeleteModal(false);
            setDeleteId("");
            setDeleteValue("");
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
    } else {
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnStatusChange = () => {
    if (statusId) {
      statusUpdate(
        { organization_id, domain_name: statusId, status: statusValue },
        {
          onSuccess: () => {
            toast("success", "Successfully update domain status");
            queryClient.invalidateQueries(["domains", organization_id]);
            removeFromSelection([deleteId]);
            setShowStatusModal(false);
            setStatusId("");
            setStatusValue(false);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
    } else {
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnSpaceChange = () => {
    if (spaceId) {
      spaceUpdate(
        { organization_id, domain_name: spaceId, space: spaceValue },
        {
          onSuccess: () => {
            toast("success", "Successfully update domain status");
            queryClient.invalidateQueries(["domains", organization_id]);
            removeFromSelection([deleteId]);
            setSpaceId("");
            setSpaceValue("");
            setShowSpaceModal(false);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
    } else {
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const handleBulkDelete = async (itemId) => {
    return new Promise((resolve, reject) => {
      mutate(
        { organization_id, domain_name: itemId },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries(["domains", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    const blockedCount = results.blocked?.length || 0;
    const failedCount = results.failed.length;

    if (failedCount === 0 && blockedCount === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} domain${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast(
        "error",
        blockedCount > 0
          ? `Deleted 0 domains. ${blockedCount} still have email identities and ${failedCount} failed.`
          : "Failed to delete all selected domains",
      );
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} domain${results.successful.length !== 1 ? "s" : ""}.${blockedCount > 0 ? ` ${blockedCount} still have email identities.` : ""}${failedCount > 0 ? ` ${failedCount} failed.` : ""}`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: domains?.domains || [],
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

    if (permissions.includes("domain:create")) {
      options.push({
        label: "Add Single Domain",
        description: "Create one domain",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddDomain,
      });
    }

    if (permissions.includes("domain:create") && isImportAvailable) {
      options.push({
        label: "Bulk Import",
        description: "Import multiple domains from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("domain:edit") && isEditAvailable) {
      options.push({
        label: "Bulk Edit",
        description:
          totalCount === 0
            ? "No domains to edit"
            : "Export, edit the file, then re-upload to update multiple domains",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
        disabled: totalCount === 0,
      });
    }

    if (permissions.includes("domain:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description:
          totalCount === 0
            ? "No domains to export"
            : "Download all domains as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
        disabled: totalCount === 0,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    handleAddDomain,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    isExportAvailable,
    handleExport,
    totalCount,
  ]);

  const handlMove = async (currentOrg, domain, targetOrg) => {
    console.error("currentOrg,domain,targetOrg", currentOrg, domain, targetOrg);

    return new Promise((resolve, reject) => {
      moveDomain(
        {
          organization_id: currentOrg,
          domain_name: domain,
          target_organization_id: targetOrg,
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const handleBulkMoveComplete = (results) => {
    queryClient.invalidateQueries(["domains", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully Move ${results.successful.length} domain${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to move all selected domains");
    } else {
      toast(
        "warning",
        `Move ${results.successful.length} domain${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const copyConfig = {
    type: "domain",
    title: "Copy Domain",
    itemDisplayName: "Domain",
    fetchDetails: async (organization_id, domain_name) => {
      const response = await getDomain(domain_name);
      return response.domain_details;
    },
    transformData: (domainData) => {
      return {
        domain_name: "",
        session_timeout: domainData.session_timeout || 120,
        activate: domainData.is_active ?? true,

        details: {
          description: domainData.details?.description || "",
          address: domainData.details?.address || "",
        },
        anti_phishing_secret_code:
          domainData.anti_phishing_secret_code || generateSecretCode() || "",

        enable_catch_all: domainData.catch_all || false,
        catch_all_forwarding_address:
          domainData.catch_all_forward_to_email || null,

        enable_hybrid_mode: domainData.is_hybrid || false,
        hybrid_connector_properties: {
          description: domainData.connector_properties?.description || "",
          fqdn: domainData.connector_properties?.fqdn || "",
          ipv4: domainData.connector_properties?.ipv4 || "",
          ipv6: domainData.connector_properties?.ipv6 || "",
          port: domainData.connector_properties?.port || 25,
        },

        enable_max_password_age:
          domainData.max_password_age_properties?.enable_max_password_age ||
          false,
        max_password_age:
          domainData.max_password_age_properties?.max_password_age || 90,
        notify_1: domainData.max_password_age_properties?.notify_at?.[0] || 2,
        notify_2: domainData.max_password_age_properties?.notify_at?.[1] || 5,
        notify_3: domainData.max_password_age_properties?.notify_at?.[2] || 9,

        max_password_age_properties: {
          enable_max_password_age:
            domainData.max_password_age_properties?.enable_max_password_age ||
            false,
          max_password_age:
            domainData.max_password_age_properties?.max_password_age || 90,
          notify_at: domainData.max_password_age_properties?.notify_at || [
            2, 5, 9,
          ],
        },

        // Spam settings
        spam_destination: domainData.spam_destination || "Folder",
        spam_destination_properties: {
          description:
            domainData.spam_destination_properties?.description || "",
          folder_name:
            domainData.spam_destination_properties?.folder_name || "",
        },

        filter_policy_id: null,
        caution_id: null,
        disclaimer_id: null,
        attachment_policy_id: null,
      };
    },
    copyRoute: (domainId) => `/domain/copy`,
  };

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (isError && isServerError)
    return <DataFechError content="Failed to fetch domains." />;
  if (!permissions.includes("domain:view"))
    return (
      <AccessDenied content="Don't have the access to view domains list" />
    );

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Domain" }]} />

          <div className="flex min-w-xl flex-1 gap-2">
            <SearchBar
              placeholder="Search domain..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {selectedCount > 0 && (
              <MultiDelete
                permission="domain:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            {selectedCount > 0 && (
              <Button
                onClick={() => {
                  setIsOpenMove(true), setIsSingle(false);
                }}
              >
                Move
              </Button>
            )}

            {createOptions.length > 0 && (
              <DropdownButton
                label="Actions"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>
        {isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <>
            {domains?.domains?.length !== 0 ? (
              <Table
                totalCount={totalCount}
                table={table}
                isLoading={isLoading}
              />
            ) : (
              <NoDataFound content="There is no domain records found for the give organization." />
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the domain name exactly to confirm deletion:"
        title="Delete Domain"
        description="This action cannot be undone and will remove all domain data."
      />

      <DeleteBlockedModal
        isOpen={!!deleteBlockInfo}
        name={deleteBlockInfo?.name}
        reasons={deleteBlockInfo?.reasons}
        onClose={clearDeleteBlock}
        title="Can't Delete Domain"
        entityLabel="domain"
        actionLabel="View Domain"
        onAction={() => {
          navigate(`/domain/${encodeURIComponent(deleteBlockInfo.id)}`);
          clearDeleteBlock();
        }}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Domains"
        description="Are you sure you want to delete the selected domains?"
        itemName="domain"
        getChecks={(item) => [
          {
            label: "email identity",
            fn: async (domainName) =>
              (await getIdentities(domainName, 1, 1))?.data?.total_count ?? 0,
          },
        ]}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Domains"
        description="Export all domains to Excel format. This may take a few minutes for large datasets."
      />

      <BulkImportModalDomain
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import"
        description="Upload a CSV or Excel file to create multiple domains at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Domains"
        description="Export domains, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={handleStatusClose}
        >
          <div className="w-xl">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want{" "}
              <>
                {statusValue ? (
                  <span className="font-medium text-green-400">Active</span>
                ) : (
                  <span className="font-medium text-red-400">In-active</span>
                )}
              </>{" "}
              {statusId} .
            </p>
            <div className="mx-4 my-2 mt-12 flex items-center justify-end gap-3">
              <Button
                disabled={statusLoad}
                onClick={handleStatusClose}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>

              <Button
                disabled={statusLoad}
                onClick={OnStatusChange}
                variant="primary"
                size="md"
              >
                Confirm
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}

      <DNSRecordsModal
        isOpen={showDNSModal}
        onClose={handleDNSModalClose}
        domainName={selectedDomainForDNS}
        dnsRecords={dnsRecords}
        isLoading={isLoadingDNS}
        onRefresh={refreshDNSRecords}
      />

      <DomainTxtVerificationModal
        isOpen={showTxtVerifyModal}
        domain_name={selectedDomainForVerify}
        organization_id={organization_id}
        onVerified={handleTxtVerifyModalClose}
        onClose={handleTxtVerifyModalClose}
      />

      {isOpenMove && (
        <MoveDomian
          isOpen={isOpenMove}
          onClose={() => setIsOpenMove(false)}
          domains={
            !isSingle && selectedCount > 0 ? selectedItemsWithLabels : moveValue
          }
          onMove={handlMove}
          onComplete={handleBulkMoveComplete}
          isSingle={selectedCount == 0 ? true : false}
        />
      )}

      <CopyModal
        isOpen={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyDomain(null);
        }}
        itemId={copyDomain?.id}
        itemName={copyDomain?.name}
        config={copyConfig}
      />
    </>
  );
};

export default ListDomains;
