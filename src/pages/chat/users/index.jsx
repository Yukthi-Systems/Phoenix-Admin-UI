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
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2, Plus, MessageCircle } from "lucide-react";
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
import { SubmitButton } from "@/components/common/Buttons";
import {
  useGetChatUsers,
  useCreateChatUser,
  useToggleChatUserStatus,
  useDeleteChatUser,
} from "@/hooks/useChat";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useToastify } from "@/hooks/useToastify";
import { useTablePagination } from "@/hooks/useTablePagination";

const ChatUsers = () => {
  const [domainName, setDomainName] = useState(null);
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [showAddModal, setShowAddModal] = useState(false);
  const { control: addUserControl, watch: watchAddUser, reset: resetAddUser } = useForm({
    defaultValues: { email_identity: "" },
  });
  const selectedIdentity = watchAddUser("email_identity");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useGetChatUsers(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  const { mutate: createChatUser, isPending: isCreating } = useCreateChatUser();
  const { mutate: toggleStatus } = useToggleChatUserStatus();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteChatUser();

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

  const handleToggleStatus = (user) => {
    if (domainName) {
      toggleStatus(
        { domain: domainName, email: user.email },
        {
          onSuccess: () => {
            toast("success", `Successfully toggled status for ${user.email}`);
            queryClient.invalidateQueries({ queryKey: ["chat_users"] });
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
      createChatUser(
        { domain: domainName, email: selectedIdentity },
        {
          onSuccess: () => {
            toast("success", `Successfully enabled chat for ${selectedIdentity}`);
            queryClient.invalidateQueries({ queryKey: ["chat_users"] });
            setShowAddModal(false);
            resetAddUser({ email_identity: "" });
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Failed to enable chat: ${message}`);
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
            toast("success", "Successfully disabled chat user");
            queryClient.invalidateQueries({ queryKey: ["chat_users"] });
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
    queryClient.invalidateQueries({ queryKey: ["chat_users"] });
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} chat user${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected chat users");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} chat user${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteEmail("");
    setDeleteValue("");
  };

  const columns = useMemo(() => {
    const baseColumns = [];

    // Add checkbox column if delete permission exists
    if (permissions.includes("chat:delete")) {
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
        cell: ({ row }) => {
          const isEnabled = row.original.is_enabled;
          const hasEditPermission = permissions.includes("chat:edit");
          return (
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  disabled={!hasEditPermission}
                  checked={isEnabled}
                  onChange={() => handleToggleStatus(row.original)}
                />
                <div
                  className={`relative w-11 h-6 bg-muted border border-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] 
                    after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:bg-primary transition-colors duration-200
                    ${!hasEditPermission ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                ></div>
              </label>
              <span className="ml-2 text-xs text-muted-foreground">
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
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

    // Add delete action column if permission exists
    if (permissions.includes("chat:delete")) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDelete(row.original)}
              className="text-destructive hover:text-destructive/80 p-2 transition-colors"
              title="Disable/Delete Chat User"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
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

  if (!permissions.includes("chat:view")) {
    return (
      <AccessDenied content="You don't have access to view Chat Users." />
    );
  }

  if (isError) {
    const statusCode = error?.response?.status;
    if (!statusCode || statusCode >= 500) {
      return <DataFechError content="Error loading Chat Users...!" />;
    }
  }

  return (
    <div className="h-full w-full px-2">
      <div className="mb-2.5 w-full">
        <div className="mb-2.5 flex w-full justify-between gap-4 flex-nowrap items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Breadcrumbs
              items={[{ name: "Chat" }, { name: "Chat Users" }]}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk delete */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="chat:delete"
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

            {domainName && permissions.includes("chat:create") && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all"
              >
                <Plus size={16} />
                Add Chat User
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
                error?.response?.data?.message || "No chat users found for this domain"
              }
            />
          )}
        </>
      ) : (
        <NoDataFound content="Please select a domain first" />
      )}

      {/* Add Chat User Modal */}
      <EditModelBox
        isOpen={showAddModal}
        handleCancel={() => {
          setShowAddModal(false);
          resetAddUser({ email_identity: "" });
        }}
        label="Add Chat User"
        outsideClick={false}
      >
        <div className="w-[40vw] max-h-[65vh] text-left">
          <form onSubmit={handleAddUser} className="mx-auto rounded-xl px-6 py-4 space-y-6">
            <div className="space-y-4">
              <EmailIdentityInfiniteSelectionField
                control={addUserControl}
                name="email_identity"
                label="Select Identity to Enable Chat"
                domain_name={domainName}
                placeholder="Search and select email identity..."
              />
            </div>

            <div className="flex justify-center pt-4">
              <SubmitButton
                label="Enable Chat"
                isPending={isCreating}
                disabled={!selectedIdentity}
              />
            </div>
          </form>
        </div>
      </EditModelBox>

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
        title="Bulk Disable/Delete Chat Users"
        description="Are you sure you want to disable chat for the selected users?"
        itemName="user"
      />
    </div>
  );
};

export default ChatUsers;
