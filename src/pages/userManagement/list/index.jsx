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

import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteUser, useGetUsers } from "@/hooks/useUser";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  IconButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import NoDataFound from "@/components/common/NoDataFound";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import { ActiveStatus, InactiveStatus } from "@/components/common/Status";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import Table from "@/components/shared/Table";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  Trash2,
  Download,
  Plus,
  Upload,
  RectangleEllipsis,
  ShieldUser,
  Edit,
} from "lucide-react";
import { PER_PAGE } from "@/constants/constants";
import ProfilePicture from "@/pages/profile/ProfilePic";
import { useTranslation } from "react-i18next";
import ChangePassword from "./ChangePassword";
import ChangePermission from "./ChangePermission";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import StatusBadge from "@/components/common/StatusBadge";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListUsers = () => {
  const { t } = useTranslation();
  const { permissions, user_id: userID } = useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [changePasswordId, setChangePasswordId] = useState("");
  const [changePasswordName, setChangePasswordName] = useState("");
  const [changePermission, setChangePermission] = useState(false);
  const [changePermissionId, setChangePermissionId] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const { formatUserDateNice } = useUserTimezone();
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const { mutate, isPending } = useDeleteUser();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetUsers(
    organization_id,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );
  const filterValue =
    data?.users_list.filter((i) => i.user_id !== userID) ?? [];

  const users = filterValue || [];

  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_records_count ?? 0;

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
  } = useBulkSelection(users, "user_id", "user_name");

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
              checked={isItemSelected(row.original.user_id)}
              onChange={() => toggleItem(row.original.user_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "user_name",
        header: t("User"),
        cell: ({ row }) => (
          <Link
            to={`/user/${encodeURIComponent(row.original.user_id)}`}
            className="flex items-center justify-center"
            title={`${row.original.user_name} is ${row.original.is_active ? "active" : "inactive"}`}
          >
            <ProfilePicture
              size="xs"
              showBorder
              showUpload={false}
              organizationId={organization_id}
              userId={row.original.user_id}
              displayName={row.original.display_name || row.original.user_name}
              isActive={row.original.is_active}
              showStatus={false}
              className="flex-shrink-0"
            />
          </Link>
        ),
      },
      {
        accessorKey: "display_name",
        header: t("Display Name"),
        cell: ({ getValue }) => (
          <span className="text-card-foreground">{getValue() || "-"}</span>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "user_name",
        header: t("Username"),
        cell: ({ getValue }) => (
          <span className="text-card-foreground">{getValue() || "-"}</span>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "is_active",
        header: t("Status"),
        cell: ({ getValue }) => {
          return <StatusBadge status={getValue()} />;
        },
      },
      {
        accessorKey: "is_totp_2fa_active",
        header: "2FA Enabled",
        cell: ({ getValue }) => {
          return (
            <span
              className={`${getValue() === true ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"} rounded-2xl border px-2 py-0.5 text-sm font-medium`}
            >
              {getValue() === true ? "Yes" : "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: t("Created"),
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
    ];

    if (
      permissions.includes("user:edit") ||
      permissions.includes("user:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: t(""),
        cell: ({ row }) => {
          const actions = [];

          if (
            permissions.includes("user:edit") &&
            row?.original?.user_id !== userID
          ) {
            actions.push({
              label: "Edit User",
              icon: Edit,
              variant: "default",
              onClick: () => navigate(`/user/edit/${row?.original?.user_id}`),
              tooltip: "Edit User",
            });
          }

          if (
            permissions.includes("user:security:password:edit") &&
            row?.original?.user_id !== userID
          ) {
            actions.push({
              label: "Change Password",
              icon: RectangleEllipsis,
              variant: "default",
              onClick: () => handleOpen(row?.original),
              tooltip: "Change User Password",
            });
          }

          if (
            permissions.includes("user:security:password:edit") &&
            row?.original?.user_id !== userID
          ) {
            actions.push({
              label: "Change Permissions",
              icon: ShieldUser,
              variant: "default",
              onClick: () => handleOpenPermission(row?.original),
              tooltip: "Change User Permission",
            });
          }

          if (
            permissions.includes("user:delete") &&
            row?.original?.user_id !== userID
          ) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete User",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.user_name,
                  id: row?.original?.user_id,
                }),
              tooltip: "Delete User",
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
    organization_id,
  ]);

  function handleDelete({ name, id }) {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  }

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddUser = () => {
    navigate("/user/add/");
  };

  const OnDelete = () => {
    const queryParams = {
      user_id: deleteId,
    };
    if (deleteId) {
      mutate(
        { orgId: organization_id, queryParams },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted user");
            queryClient.invalidateQueries({
              queryKey: [
                "users",
                organization_id,
                pagination.pageIndex + 1,
                pagination.pageSize,
              ],
            });
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
      toast("error", `Message:'Unknown error'`);
    }
  };

  const handleBulkDelete = async (itemId) => {
    return new Promise((resolve, reject) => {
      const queryParams = {
        user_id: itemId,
      };
      mutate(
        { orgId: organization_id, queryParams },
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
    queryClient.invalidateQueries(["users", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} user${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected users");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} user${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const handleOpen = (user) => {
    setChangePasswordId(user?.user_id);
    setChangePasswordName(user?.display_name || user?.user_name);
    setChangePassword(true);
  };

  const closePassword = () => {
    setChangePassword(false);
    setChangePasswordId("");
    setChangePasswordName("");
  };

  const handleOpenPermission = (user) => {
    setChangePermissionId(user?.user_id);
    setChangePasswordName(user?.display_name || user?.user_name);
    setChangePermission(true);
  };

  const closePermission = () => {
    setChangePermission(false);
    setChangePermission("");
    setChangePasswordName("");
  };

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

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("user:create")) {
      options.push({
        label: "Add Single User",
        description: "Create one user",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddUser,
      });
    }

    return options;
  }, [permissions, handleAddUser]);

  if (!permissions.includes("user:view"))
    return <AccessDenied content="Don't have access to list user details." />;

  if (isError) return <DataFechError content="Error while listing the users" />;

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mt-1.5 mb-2.5 flex w-full items-center justify-between">
          <Breadcrumbs items={[{ name: "User Management" }]} />
          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && (
              <div className="bg-muted/30 border-border/50 flex items-center gap-3 rounded-lg border px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
                  <span className="text-foreground text-sm font-medium">
                    {selectedCount} item{selectedCount !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>

                <div className="bg-border h-4 w-px"></div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearSelection}
                    className="text-muted-foreground hover:text-foreground hover:bg-background rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200"
                  >
                    Clear
                  </button>
                  {permissions.includes("user:delete") && (
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Create dropdown button */}
            {createOptions.length > 0 && (
              <DropdownButton
                label="Create"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>
        {users.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : (
          <NoDataFound content="There is no user found on this organization" />
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
        confirmationLabel="Please type the username exactly to confirm deletion:"
        title="Delete User"
        description="This action cannot be undone and will remove all user data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Users"
        description="Are you sure you want to delete the selected users?"
        itemName="user"
      />

      {changePasswordId && changePassword && (
        <ChangePassword
          changePassword={changePassword}
          closePassword={closePassword}
          user_id={changePasswordId}
          user_name={changePasswordName}
        />
      )}

      {changePermissionId && changePermission && (
        <ChangePermission
          user_id={changePermissionId}
          closePermission={closePermission}
          changePermission={changePermission}
          user_name={changePasswordName}
        />
      )}
    </>
  );
};

export default ListUsers;
