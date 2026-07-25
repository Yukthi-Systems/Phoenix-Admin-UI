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
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Table from "@/components/shared/Table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteApiKey, useApiKeys } from "@/hooks/useApiKeys";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import NoDataFound from "@/components/common/NoDataFound";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { Trash2, Plus, Edit, Eye, Key } from "lucide-react";
import DropdownButton from "@/components/common/DropdownButton";
import { PER_PAGE } from "@/constants/constants";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";
import SearchBar from "@/components/shared/SearchBar";
import { useUrlParam } from "@/hooks/useUrlParam";
import ViewApiKeyModal from "./ViewApiKeYModal";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListApiKeys = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination(PER_PAGE, 50);

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [viewId, setViewId] = useState(null);

  // Global State
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(selectedOrganizationAtom);

  // Hooks
  const toast = useToastify();
  const { formatUserDateNice } = useUserTimezone();
  const queryClient = useQueryClient();

  // API Hooks
  const { mutate, isPending } = useDeleteApiKey();

  // Note: Assuming useApiKeys accepts query as 4th arg based on your architecture
  const { data, isLoading, isError, error } = useApiKeys(
    organization_id,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  // Data Extraction
  // Adjust 'api_keys' based on your actual API response key (e.g., data.data.api_keys or data.data.list)
  const apiKeys = data?.api_keys || [];
  const totalPages = data?.total_pages;
  const totalCount = data?.total_count || 0;

  // Bulk Selection
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
  } = useBulkSelection(apiKeys, "id", "key_name");

  // Handlers
  const handleEdit = (apiKey) => {
    navigate(`/keys/edit/${apiKey.key_id}`);
  };

  const handleDelete = (apiKey) => {
    setDeleteValue(apiKey.key_name);
    setDeleteId(apiKey.key_id);
    setShowDeleteModal(true);
  };

  const handleView = (apiKey) => {
    setViewId(apiKey.key_id);
  };

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddApiKey = () => {
    navigate("/keys/create");
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        {
          organizationId: organization_id,
          apiKeyId: deleteId,
          keyName: deleteValue,
        },
        {
          onSuccess: () => {
            // Toast is handled in the hook, but we can add extra logic here
            queryClient.invalidateQueries(["api-keys", organization_id]);
            removeFromSelection([deleteId]);
            setShowDeleteModal(false);
            setDeleteId("");
            setDeleteValue("");
          },
          onError: (error) => {
            // Error toast handled in hook
            console.error(error);
          },
        },
      );
    }
  };

  const handleBulkDelete = async (itemId, name) => {
    return new Promise((resolve, reject) => {
      mutate(
        { organizationId: organization_id, apiKeyId: itemId, keyName: name },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries(["api-keys", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} API key(s)`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected API keys");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} keys. ${results.failed.length} failed.`,
      );
    }
  };

  // Table Columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "key_name",
        header: "Key Name",
        cell: ({ row }) => (
          <span
            className="main-col cursor-pointer hover:underline text-primary font-medium"
            onClick={() => handleView(row.original)}
          >
            {row.original.key_name}
          </span>
        ),
        meta: {
          align: "left",
        },
      },

      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
      },
      {
        accessorKey: "updated_at",
        header: "Updated Date",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
      },
    ];

    // Actions Column
    if (
      permissions.includes("api_keys:edit") ||
      permissions.includes("api_keys:delete") ||
      permissions.includes("api_keys:view")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("api_keys:view")) {
            actions.push({
              label: "View Details",
              icon: Eye,
              variant: "default",
              onClick: () => handleView(row.original),
              tooltip: "View API Key details",
            });
          }

          if (permissions.includes("api_keys:edit")) {
            actions.push({
              label: "Edit Key",
              icon: Edit,
              variant: "default",
              onClick: () => handleEdit(row.original),
              tooltip: "Edit API Key",
            });
          }

          if (permissions.includes("api_keys:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Key",
              icon: Trash2,
              variant: "danger",
              onClick: () => handleDelete(row.original),
              tooltip: "Delete API Key",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown actions={actions} />
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
    formatUserDateNice,
  ]);

  const table = useReactTable({
    data: apiKeys,
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

  // Action Buttons Config
  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("api_keys:create")) {
      options.push({
        label: "Create API Key",
        description: "Generate a new API key",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddApiKey,
      });
    }

    return options;
  }, [permissions]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  // Render Logic
  if (!permissions.includes("api_keys:view"))
    return (
      <AccessDenied content="You do not have permission to view API Keys." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while listing API Keys." />;

  return (
    <>
      <div className="h-full w-full px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Settings" }, { name: "API Keys" }]} />

          <div className="flex items-center justify-end gap-3">
            {/* Bulk Actions */}

            {/* Create Action */}
            {createOptions.length > 0 && (
              <DropdownButton
                label="Create"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>

        {apiKeys.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <NoDataFound content="No API keys found for this organization." />
        )}
      </div>

      {/* Modals */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue || ""}
        isLoading={isPending}
      />

      {viewId && (
        <ViewApiKeyModal
          isOpen={!!viewId}
          onClose={() => setViewId(null)}
          key_id={viewId}
          organizationId={organization_id}
        />
      )}
    </>
  );
};

export default ListApiKeys;
