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
import { useForm } from "react-hook-form";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { parentOrgAtom } from "@/store/userInfo";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2, Plus, ChartPie, CheckCircle, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import DomainSelector from "@/components/shared/DomainSelector";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import MultiDelete from "@/components/shared/MultiDelete";
import EditModelBox from "@/components/common/EditModelBox";
import { EmailIdentityInfiniteSelectionField } from "@/components/common/infiniteSelectors/EmailIdentityInfiniteSelectionField";
import { Button, SubmitButton } from "@/components/common/Buttons";
import { Input } from "@/components/common/Inputs";
import StatusBadge from "@/components/common/StatusBadge";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import ProgressBar from "@/components/common/Progress";
import FileUserQuotaModal from "./FileUserQuotaModal";
import {
  useGetFileUsers,
  useCreateFileUser,
  useToggleFileUserStatus,
  useDeleteFileUser,
  useUpdateFileUserQuota,
} from "@/hooks/useFiles";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useToastify } from "@/hooks/useToastify";
import { useTablePagination } from "@/hooks/useTablePagination";

const FileUsers = () => {
  const [domainName, setDomainName] = useState(null);
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    control: addUserControl,
    register: registerAddUser,
    watch: watchAddUser,
    reset: resetAddUser,
    formState: { errors: addUserErrors },
  } = useForm({
    defaultValues: { email_identity: "", quota_allocated: 1, enable_user: true },
  });
  const selectedIdentity = watchAddUser("email_identity");
  const selectedQuota = watchAddUser("quota_allocated");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [quotaModalUser, setQuotaModalUser] = useState(null);
  const [quotaValue, setQuotaValue] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUser, setStatusUser] = useState(null);

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const parentOrg = useAtomValue(parentOrgAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useGetFileUsers(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  const { mutate: createFileUser, isPending: isCreating } = useCreateFileUser();
  const { mutate: toggleStatus } = useToggleFileUserStatus();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteFileUser();
  const { mutate: updateQuota, isPending: isUpdatingQuota } = useUpdateFileUserQuota();

  useEffect(() => {
    if (pagination.pageIndex > 0) {
      setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    }
  }, [domainName]);

  const users = data?.data?.data ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? 0;

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
  } = useBulkSelection(users, "email", "email");

  const handleStatus = (user) => {
    setStatusUser(user);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusUser(null);
    setShowStatusModal(false);
  };

  const OnStatusChange = () => {
    if (statusUser && domainName) {
      toggleStatus(
        { domain: domainName, email: statusUser.email },
        {
          onSuccess: () => {
            toast("success", `Successfully toggled status for ${statusUser.email}`);
            handleStatusClose();
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Failed to toggle status: ${message}`);
          },
        },
      );
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (domainName && selectedIdentity) {
      createFileUser(
        {
          domain_name: domainName,
          email_identity: selectedIdentity,
          quota_allocated: Number(selectedQuota),
          enable_user: watchAddUser("enable_user"),
        },
        {
          onSuccess: () => {
            toast("success", `Successfully created file user ${selectedIdentity}`);
            setShowAddModal(false);
            resetAddUser({ email_identity: "", quota_allocated: 1, enable_user: true });
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Failed to create file user: ${message}`);
          },
        },
      );
    }
  };

  const handleDelete = (user) => {
    setDeleteValue(user.email);
    setDeleteEmail(user.email);
    setShowDeleteModal(true);
  };

  const OnDelete = () => {
    if (deleteEmail && domainName) {
      deleteUser(
        { domain: domainName, email: deleteEmail },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted file user");
            removeFromSelection([deleteEmail]);
            setShowDeleteModal(false);
            setDeleteEmail("");
            setDeleteValue("");
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Failed to delete user: ${message}`);
          },
        },
      );
    }
  };

  const handleBulkDelete = async (email, _) => {
    return new Promise((resolve, reject) => {
      deleteUser(
        { domain: domainName, email },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} file user${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected file users");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} file user${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteEmail("");
    setDeleteValue("");
  };

  const handleEditQuota = (user) => {
    setQuotaModalUser(user);
    setQuotaValue(parseFloat(user.quota_allocated) || 0);
  };

  const OnQuotaClose = () => {
    setQuotaModalUser(null);
    setQuotaValue(0);
  };

  const OnQuotaUpdate = () => {
    if (quotaModalUser && domainName) {
      updateQuota(
        { domain: domainName, email: quotaModalUser.email, new_quota: Number(quotaValue) },
        {
          onSuccess: () => {
            toast("success", `Successfully updated quota for ${quotaModalUser.email}`);
            OnQuotaClose();
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Failed to update quota: ${message}`);
          },
        },
      );
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [];

    // Add checkbox column if delete permission exists
    if (permissions.includes("file:delete")) {
      baseColumns.push({
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
      });
    }

    baseColumns.push(
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="text-foreground text-sm font-medium">
            {getValue()}
          </span>
        ),
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
      {
        id: "quota",
        header: "Storage",
        cell: ({ row }) => {
          const { quota_utilized, quota_allocated } = row.original;
          return (
            <ProgressBar
              utilized={quota_utilized}
              allocated={quota_allocated}
            />
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        id: "last_active_at",
        header: "Last Active At",
        cell: ({ row }) => {
          const lastActive = row.original.last_active_at;
          if (!lastActive)
            return <span className="text-muted-foreground text-sm font-medium">N/A</span>;

          return (
            <div className="flex items-center justify-start">
              <span className="text-foreground text-sm font-medium">
                {new Date(lastActive).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
        meta: {
          align: "left",
        },
      },
    );

    // Add actions dropdown column if edit/delete permission exists
    if (
      permissions.includes("file:edit") ||
      permissions.includes("file:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("file:edit")) {
            actions.push({
              label: "Manage Quota",
              icon: ChartPie,
              variant: "default",
              onClick: () => handleEditQuota(row.original),
              tooltip: "Storage quota allocation",
            });

            actions.push({
              label: row.original.is_enabled ? "Deactivate" : "Activate",
              icon: row.original.is_enabled ? XCircle : CheckCircle,
              variant: row.original.is_enabled ? "danger" : "success",
              onClick: () => handleStatus(row.original),
              tooltip: "Toggle status",
            });
          }

          if (permissions.includes("file:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete File User",
              icon: Trash2,
              variant: "danger",
              onClick: () => handleDelete(row.original),
              tooltip: "Delete file user",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown height={220} actions={actions} />
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
  ]);

  const table = useReactTable({
    data: users,
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

  if (!permissions.includes("file:view")) {
    return (
      <AccessDenied content="You don't have access to view File Users." />
    );
  }

  if (isError) {
    const statusCode = error?.response?.status;
    if (!statusCode || statusCode >= 500) {
      return <DataFechError content="Error loading File Users...!" />;
    }
  }

  const maxQuota = parentOrg?.available_size || 0;

  return (
    <div className="h-full w-full px-2">
      <div className="mb-2.5 w-full">
        <div className="mb-2.5 flex w-full justify-between gap-4 flex-nowrap items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Breadcrumbs
              items={[{ name: "Files" }, { name: "File Users" }]}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk delete */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="file:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            <div className="w-auto min-w-72">
              <DomainSelector
                domainName={domainName}
                setDomainName={setDomainName}
              />
            </div>

            {domainName && permissions.includes("file:create") && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all"
              >
                <Plus size={16} />
                Add File User
              </button>
            )}
          </div>
        </div>
      </div>

      {domainName ? (
        <>
          {users.length !== 0 || isLoading ? (
            <Table
              table={table}
              isLoading={isLoading}
              totalCount={totalCount}
            />
          ) : (
            <NoDataFound
              content={
                error?.response?.data?.message || "No file users found for this domain"
              }
            />
          )}
        </>
      ) : (
        <NoDataFound content="Please select a domain first" />
      )}

      {/* Add File User Modal */}
      <EditModelBox
        isOpen={showAddModal}
        handleCancel={() => {
          setShowAddModal(false);
          resetAddUser({ email_identity: "", quota_allocated: 1, enable_user: true });
        }}
        label="Add File User"
        outsideClick={false}
      >
        <div className="w-[40vw] max-h-[65vh] text-left">
          <form onSubmit={handleAddUser} className="mx-auto rounded-xl px-6 py-4 space-y-6">
            <div className="space-y-4">
              <EmailIdentityInfiniteSelectionField
                control={addUserControl}
                name="email_identity"
                label="Select Identity for File Access"
                domain_name={domainName}
                placeholder="Search and select email identity..."
              />

              <Input
                label="Quota Allocated (GB)"
                type="number"
                min={0}
                max={maxQuota}
                step="0.01"
                register={registerAddUser}
                name="quota_allocated"
                isRequired
                info={`Up to ${maxQuota.toFixed(2)} GB available in this organization`}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable_user"
                  className="border-border text-primary focus:ring-primary bg-background h-5 w-5 rounded-sm border transition-colors duration-200 focus:ring-2 focus:ring-offset-0"
                  {...registerAddUser("enable_user")}
                />
                <label htmlFor="enable_user" className="text-foreground text-sm font-medium">
                  Enable user immediately
                </label>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <SubmitButton
                label="Add File User"
                isPending={isCreating}
                disabled={
                  !selectedIdentity ||
                  !selectedQuota ||
                  Number(selectedQuota) <= 0 ||
                  Number(selectedQuota) > maxQuota
                }
              />
            </div>
          </form>
        </div>
      </EditModelBox>

      {/* Status Change Modal */}
      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={handleStatusClose}
        >
          <div className="w-xl">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want to{" "}
              {statusUser?.is_enabled ? (
                <span className="font-medium text-red-400">Deactivate</span>
              ) : (
                <span className="font-medium text-green-400">Activate</span>
              )}{" "}
              {statusUser?.email}.
            </p>
            <div className="mx-4 my-2 mt-12 flex items-center justify-end gap-3">
              <Button
                onClick={handleStatusClose}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>

              <Button
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

      {/* Edit Quota Modal */}
      <FileUserQuotaModal
        isOpen={!!quotaModalUser}
        handleCancel={OnQuotaClose}
        spaceValue={quotaValue}
        setSpaceValue={setQuotaValue}
        isUpdating={isUpdatingQuota}
        onUpdate={OnQuotaUpdate}
        fileUserData={quotaModalUser}
      />

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue || ""}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={() => setShowBulkDeleteModal(false)}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete File Users"
        description="Are you sure you want to delete the selected file users?"
        itemName="user"
      />
    </div>
  );
};

export default FileUsers;
