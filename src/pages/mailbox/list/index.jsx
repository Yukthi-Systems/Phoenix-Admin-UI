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

import { useEffect, useMemo, useState } from "react";
import DomainSelector from "../../../components/shared/DomainSelector";
import { Link, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useGetMailboxes,
  useAddMailbox,
  useDeleteMailbox,
  useUpdateMailboxStatus,
  useUpdateMailboxSpace,
  useUpdateMailboxPassword,
} from "@/hooks/useMailbox";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { userInfoAtom } from "@/store/userInfo";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { SubmitButton } from "@/components/common/Buttons";
import ProgressBar from "@/components/common/Progress";
import NoDataFound from "@/components/common/NoDataFound";
import ExportModal from "@/components/common/ExportModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  Trash2,
  Download,
  Plus,
  Upload,
  XCircle,
  CheckCircle,
  ChartPie,
  RectangleEllipsis,
  Edit,
  Copy,
  RefreshCw,
} from "lucide-react";
import useBulkImport from "@/hooks/useImport";
import { PER_PAGE } from "@/constants/constants";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import EditModelBox from "@/components/common/EditModelBox";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { passwordFormSchema } from "./validationSchema";
import { Input, PasswordInput } from "@/components/common/Inputs";
import StatusBadge from "@/components/common/StatusBadge";
import MailboxQuotaAllocationModal from "./QuotaAllocation";
import { domainAtom } from "@/store/domain";
import { exportMailBox, getMailbox } from "@/api/mailbox";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";
import SearchBar from "@/components/shared/SearchBar";
import CopyDomainModal from "@/components/common/CopyMailboxModal";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import CreateImapSyncModal from "@/pages/mailboxSync/list/CreateImapSyncModal";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListMailboxes = () => {
  const [domainName, setDomainName] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const domainData = useAtomValue(domainAtom);
  const [spaceValue, setSpaceValue] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [currentMail, setCurrentMailData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordId, setPasswordId] = useState("");
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { data: orgDetails } = useGetOrganizationDetail(organization_id);
  const { mutate, isPending } = useDeleteMailbox();
  const { formatUserDateNice } = useUserTimezone();
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMailbox, setCopyMailbox] = useState(null);
  const { mutate: createMailbox } = useAddMailbox();
  const toast = useToastify();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncTargetMailbox, setSyncTargetMailbox] = useState(null);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(passwordFormSchema),
    mode: "onChange",
  });

  const { data, isLoading, isError, error, refetch } = useGetMailboxes(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  const fetchMailboxesForExport = async ({ domain_name, page, pageSize }) => {
    return await exportMailBox(domain_name, page, pageSize);
  };
  const handleImapSync = (row) => {
    setSyncTargetMailbox(row.email);
    setShowSyncModal(true);
  };
  const handleCopy = (row) => {
    setCopyMailbox({
      id: row.email,
      name: row.email,
      domain: domainName,
    });
    setShowCopyModal(true);
  };

  // Search handler function
  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Reset search when domain changes
  useEffect(() => {
    if (domainName) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [domainName]);

  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateMailboxStatus();
  const { mutate: spaceUpdate, isPending: spaceLoad } = useUpdateMailboxSpace();
  const { mutate: passwordUpdate, isPending: passwordLoad } =
    useUpdateMailboxPassword();

  useEffect(() => {
    if (pagination.pageIndex > 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      setPagination((prev) => ({ pageIndex: 0, pageSize: prev.pageSize }));
    }
  }, [domainName]);

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("mailboxes", async (mailboxData) => {
    const emailIdentity = String(mailboxData.email_identity || "").toLowerCase();
    if (domainName && !emailIdentity.endsWith(`@${domainName.toLowerCase()}`)) {
      throw new Error(
        `E-Mail Identity must belong to the selected domain (${domainName})`,
      );
    }

    // Matches the exact payload built by the single Add Mailbox flow
    // (mailbox/add/index.jsx onSubmit) - mailbox creation only attaches
    // mailbox capability to an already-existing identity, it doesn't carry
    // any identity profile fields or organization_id.
    const payload = {
      email_identity: emailIdentity,
      enabled: mailboxData.enabled ?? true,
      allocate_quota: Number(mailboxData.allocate_quota) || 0.1,
      general_policy_id: mailboxData.general_policy_id || null,
      forwarding_policy_id: mailboxData.forwarding_policy_id || null,
      distribution_policy_id: mailboxData.distribution_policy_id || null,
    };

    return new Promise((resolve, reject) => {
      createMailbox(
        { data: payload, addLog: false },
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
  } = useExport(
    "mailboxes",
    fetchMailboxesForExport,
    { domain_name: domainName },
    FIELD_MAPPINGS.mailboxes,
  );

  const mailboxes = data?.mailboxes ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_rows ?? 1;

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
  } = useBulkSelection(mailboxes, "email", "email");

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
              checked={isItemSelected(row.original.email)}
              onChange={() => toggleItem(row.original.email)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <Link
            className="main-col"
            to={`/mailbox/${encodeURIComponent(getValue())}`}
          >
            {getValue()}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },

      {
        id: "storage",
        header: "Storage",
        cell: ({ row }) => {
          const { quota_utilized_bytes, quota_allocated } = row.original;
          return (
            <ProgressBar
              utilized={bytesToGB(quota_utilized_bytes)}
              allocated={quota_allocated}
            />
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "is_enabled",
        header: "Status",
        cell: ({ getValue }) => {
          return <StatusBadge status={getValue()} />;
        },
      },
      // {
      //   id: "is_password_expired",
      //   accessorKey: "is_password_expired",
      //   header: "Password Expired",
      //   cell: ({ row, getValue }) => {
      //     const passwordUpdatedAt = row.original.password_updated_at;

      //     const tooltipText = passwordUpdatedAt
      //       ? `Last Updated: ${formatUserDateNice(passwordUpdatedAt)}`
      //       : "Password has not been updated";

      //     const isExpired = getValue();

      //     return (
      //       <span
      //         title={tooltipText}
      //         className={`${
      //           isExpired === true
      //             ? "bg-destructive/10 text-destructive border-destructive/20"
      //             : "bg-success/10 text-success border-success/20"
      //         } rounded-2xl border px-2 py-0.5 text-sm font-medium cursor-help`}
      //       >
      //         {isExpired === true ? "Yes" : "No"}
      //       </span>
      //     );
      //   },
      // },

      // {
      //   accessorKey: "created_at",
      //   header: "Created",
      //   cell: ({ getValue }) => {
      //     return formatUserDateNice(getValue());
      //   },
      //   meta: {
      //     align: "left",
      //   },
      // },
      // {
      //   accessorKey: "updated_at",
      //   header: "Updated",
      //   cell: ({ getValue }) => {
      //     return formatUserDateNice(getValue());
      //   },
      //   meta: {
      //     align: "left",
      //   },
      // },
    ];
    if (
      permissions.includes("mailbox:edit") ||
      permissions.includes("mailbox:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("mailbox:edit")) {
            actions.push({
              label: "Edit Mailbox",
              icon: Edit,
              variant: "default",
              onClick: () => handleEdit(row.original),
              tooltip: "Edit mailbox",
            });

            actions.push({
              label: "Manage Quota",
              icon: ChartPie,
              variant: "default",
              onClick: () => handleSpace(row.original),
              tooltip: "Space allocation",
            });

            // actions.push({
            //   label: "Change Password",
            //   icon: RectangleEllipsis,
            //   variant: "default",
            //   onClick: () => handlePassword(row.original),
            //   tooltip: "Change password",
            // });
          }
          if (permissions.includes("mailbox:create")) {
            actions.push({
              label: "Copy Mailbox",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row.original),
              tooltip: "Copy to another domain",
            });
          }
          if (permissions.includes("imap_sync:create")) {
            actions.push({
              label: "Sync via IMAP",
              icon: RefreshCw,
              variant: "default",
              onClick: () => handleImapSync(row.original),
              tooltip: "Import emails from another server",
            });
          }

          if (permissions.includes("mailbox:delete") && actions.length > 0) {
            actions.push({ separator: true });
          }

          actions.push({
            label: row.original.is_enabled ? "Deactivate" : "Activate",
            icon: row.original.is_enabled ? XCircle : CheckCircle,
            variant: row.original.is_enabled ? "danger" : "success",
            onClick: () => handleStatus(row.original),
            tooltip: "Toggle status",
          });

          if (permissions.includes("mailbox:delete")) {
            actions.push({
              label: "Delete Mailbox",
              icon: Trash2,
              variant: "danger",
              onClick: () => handleDelete(row.original),
              tooltip: "Delete mailbox",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown height={300} actions={actions} />
            </div>
          );
        },
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
  ]);

  function bytesToGB(bytes = 0) {
    return (bytes / 1024 ** 3).toFixed(2);
  }

  const handleEdit = (row) => {
    navigate(`/mailbox/edit/${row.email}`);
  };

  const handleDelete = (row) => {
    setDeleteValue(row.email);
    setDeleteId(row.email);
    setShowDeleteModal(true);
  };

  const handleStatus = (row) => {
    setStatusId(row.email);
    setStatusValue(!row.is_enabled);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleSpace = (row) => {
    setSpaceId(row.email);
    setSpaceValue(row.quota_allocated);
    setShowSpaceModal(true);
    setCurrentMailData(row);
  };

  const handleSpaceClose = () => {
    setSpaceId("");
    setSpaceValue("");
    setShowSpaceModal(false);
  };

  const handlePassword = (row) => {
    setPasswordId(row.email);
    setShowPasswordModal(true);
  };

  const handlePasswordClose = () => {
    setPasswordId("");
    setShowPasswordModal(false);
    reset({
      oldPassword: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleAddMailbox = () => {
    navigate(`/mailbox/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_mailboxes",
      message: `Imported mailboxes via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        domain_Name: domainName,
      },
    };
    ImportActionLog({ values: ActionLog });
    queryClient.invalidateQueries(["mailboxes", domainName]);
  };

  const OnDelete = () => {
    if (deleteId) {
      const [email_prefix, domain_name] = deleteId.split("@");
      mutate(
        { domain_name, email_prefix },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted mailbox");
            queryClient.invalidateQueries([
              "mailboxes",
              domainName,
            ]);
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
      const [email_prefix, domain_name] = statusId.split("@");
      statusUpdate(
        {
          domain_name: domain_name,
          email_prefix: email_prefix,
          status: statusValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully update mailbox status");
            queryClient.invalidateQueries([
              "mailboxes",
              domainName,
            ]);
            removeFromSelection([statusId]);
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
      const [email_prefix, domain_name] = spaceId.split("@");
      spaceUpdate(
        {
          domain_name: domain_name,
          email_prefix: email_prefix,
          space: spaceValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully updated mailbox quota");
            queryClient.invalidateQueries([
              "mailboxes",
              domainName,
            ]);
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

  const onSubmit = (formData) => {
    const [email_prefix, domain_name] = passwordId.split("@");
    let newPassword = btoa(formData.password);
    passwordUpdate(
      { domain_name, email_prefix, password: newPassword },
      {
        onSuccess: () => {
          toast("success", "Successfully password is updated");
          queryClient.invalidateQueries([
            "mailboxes",
            domainName,
          ]);
          setPasswordId("");
          setShowPasswordModal(false);
          reset({
            oldPassword: "",
            password: "",
            confirmPassword: "",
          });
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
  };

  const handleBulkDelete = async (itemId) => {
    return new Promise((resolve, reject) => {
      const [email_prefix, domain_name] = itemId.split("@");

      mutate(
        { domain_name, email_prefix },
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

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries(["mailboxes", domainName]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} mailbox${results.successful.length !== 1 ? "es" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected mailboxes");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} mailbox${results.successful.length !== 1 ? "es" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: mailboxes,
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
    if (!domainName) return [];

    const options = [];

    const isOrgFull = orgDetails
      ? Number(orgDetails.quota_utilized || 0) >=
        Number(orgDetails.quota_allocated - 0.01 || 0)
      : false;

    const fullMessage = "Organization has no space left";

    if (permissions.includes("mailbox:create")) {
      options.push({
        label: "Add Single Mailbox",
        description: isOrgFull ? fullMessage : "Create one mailbox",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddMailbox,
        disabled: isOrgFull,
      });
    }

    if (permissions.includes("mailbox:create") && isImportAvailable) {
      options.push({
        label: "Import",
        description: isOrgFull
          ? fullMessage
          : "Import multiple mailboxes from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
        disabled: isOrgFull,
      });
    }

    if (permissions.includes("mailbox:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all mailboxes as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    handleAddMailbox,
    handleImport,
    domainName,
    isExportAvailable,
    handleExport,
    domainData, // Added dependency to re-calculate when domain usage updates
  ]);

  if (!permissions.includes("mailbox:view"))
    return (
      <AccessDenied content="Don't have the access to list the mailboxes." />
    );

  if (isError) {
    const statusCode = error?.response?.status;

    if (!statusCode || statusCode >= 500) {
      return <DataFechError content="Error loading mailbox...!" />;
    }
  }

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 w-full">
          <div className="mb-2.5 flex w-full flex-wrap items-start justify-between gap-4 lg:flex-nowrap lg:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <Breadcrumbs items={[{ name: "Mailbox" }]} />
            </div>

            <div className="flex flex-1 gap-2">
              <SearchBar
                placeholder="Search mailboxes..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                onRefresh={refetch}
              />
            </div>

            <div className="order-2 flex items-center gap-2 xl:order-3 xl:gap-3">
              <div className="w-full xl:w-auto xl:min-w-72">
                <DomainSelector
                  domainName={domainName}
                  setDomainName={setDomainName}
                />
              </div>
              {domainName && (
                <>
                  {selectedCount > 0 && (
                    <MultiDelete
                      permission="mailbox:delete"
                      selectedCount={selectedCount}
                      handleClear={clearSelection}
                      handleClick={() => setShowBulkDeleteModal(true)}
                    />
                  )}

                  <div className="flex items-center gap-2">
                    {createOptions.length > 0 && (
                      <DropdownButton
                        label="Actions"
                        options={createOptions}
                        variant="primary"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {domainName ? (
          <>
            {mailboxes.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : (
              <NoDataFound
                content={error?.response?.data?.message || "No mailboxes"}
              />
            )}
          </>
        ) : (
          <NoDataFound content="Please Select or add a domain first" />
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
        confirmationLabel="Please type the email address exactly to confirm deletion:"
        title="Delete Mailbox"
        description="This action cannot be undone and will remove all mailbox data."
      />

      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Mailboxes"
        description="Are you sure you want to delete the selected mailboxes?"
        itemName="mailbox"
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Mailboxes"
        description="Upload a CSV or Excel file to create multiple mailboxes at once."
        onComplete={handleImportCompleteWithRefresh}
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
            <div className="flex items-center justify-end gap-3">
              <button
                className="rounded-lg border p-2 text-sm font-medium"
                disabled={statusLoad}
                onClick={handleStatusClose}
              >
                Cancel
              </button>
              <button
                className={`rounded-lg border p-2 text-sm font-medium ${statusValue ? "border-green-300 text-green-400" : "border-red-300 text-red-400"}`}
                disabled={statusLoad}
                onClick={OnStatusChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </EditModelBox>
      )}

      {showSpaceModal && (
        <EditModelBox
          isOpen={showSpaceModal}
          label="Quota Allocation"
          handleCancel={handleSpaceClose}
        >
          <div className="w-xl text-left">
            <label className="mt-2 text-sm font-medium">Space (GB)</label>
            <input
              value={spaceValue}
              onChange={(e) => setSpaceValue(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
              type="number"
            />
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                className="border p-2"
                disabled={spaceLoad}
                onClick={handleSpaceClose}
              >
                Cancel
              </button>
              <button
                className="border p-2"
                disabled={spaceLoad}
                onClick={OnSpaceChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </EditModelBox>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Mailboxes"
        description="Export all mailboxes to Excel format. This may take a few minutes for large datasets."
      />

      {showSpaceModal && (
        <MailboxQuotaAllocationModal
          showSpaceModal={showSpaceModal}
          handleSpaceClose={handleSpaceClose}
          spaceValue={spaceValue}
          setSpaceValue={setSpaceValue}
          spaceLoad={spaceLoad}
          OnSpaceChange={OnSpaceChange}
          domainData={orgDetails}
          mailData={currentMail}
        />
      )}

      {showPasswordModal && (
        <EditModelBox
          isOpen={showPasswordModal}
          label="Change Password"
          handleCancel={handlePasswordClose}
        >
          <div
            className="w-xl text-left"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mx-auto space-y-5 rounded-xl px-5 py-2 text-left"
            >
              <div className="mt-2 grid grid-cols-1 gap-8">
                <PasswordInput
                  placeholder="Enter new password"
                  label="New Password"
                  register={register}
                  errors={errors}
                  name="password"
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  name="confirmPassword"
                  register={register}
                  errors={errors}
                  placeholder="Enter confirm password"
                />
              </div>

              <div className="text-center">
                <SubmitButton label="Change Password" isPending={isPending} />
              </div>
            </form>
          </div>
        </EditModelBox>
      )}

      <CopyDomainModal
        isOpen={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyMailbox(null);
        }}
        itemId={copyMailbox?.id}
        sourceDomain={copyMailbox?.domain}
        itemName={copyMailbox?.name}
        config={{
          type: "mailbox",
          title: "Copy Mailbox",
          itemDisplayName: "Mailbox",
          fetchDetails: async (domain_name, email_prefix) => {
            const response = await getMailbox(domain_name, email_prefix);
            return response.mailbox_details;
          },
          transformData: (mailboxData) => {
            return {
              email_identity: "",
              enabled: mailboxData.is_enabled ?? true,
              allocate_quota: mailboxData.quota_allocated || 0.1,
              general_policy_id: mailboxData.general_policy_id || null,
              forwarding_policy_id: mailboxData.forwarding_policy_id || null,
              distribution_policy_id: mailboxData.distribution_policy_id || null,
            };
          },
          copyRoute: (targetDomain) => `/mailbox/copy/${targetDomain}`,
        }}
      />

      <CreateImapSyncModal
        isOpen={showSyncModal}
        onClose={() => {
          setShowSyncModal(false);
          setSyncTargetMailbox(null);
        }}
        domainName={domainName}
        defaultLocalMailbox={syncTargetMailbox}
      />
    </>
  );
};

export default ListMailboxes;
