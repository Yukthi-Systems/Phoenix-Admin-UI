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

import { useState, useMemo } from "react";
import { useRestrictionPolicy, useDeleteRestrictionPolicy } from "@/hooks/useRestrictionPolicy";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import DataLoading from "@/components/common/DataLoading";
import StatusBadge from "@/components/common/StatusBadge";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { Trash2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

const RestrictionsTab = ({ orgId }) => {
  const { pagination, onPaginationChange: setPagination } = useTablePagination(5, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const { formatUserDateNice } = useUserTimezone();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePolicyId, setDeletePolicyId] = useState("");
  const [deletePolicyName, setDeletePolicyName] = useState("");

  const { data, isLoading, isError } = useRestrictionPolicy({
    organization_id: orgId,
    domain_name: "", // Pass empty to satisfy hook
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: searchQuery,
  });

  const { mutate: deleteMutate, isPending: isDeletePending } = useDeleteRestrictionPolicy();

  const policies = data?.entries ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  const handleDeleteOpen = (row) => {
    setDeletePolicyId(row.policy_id);
    setDeletePolicyName(row.policy_name);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletePolicyId) {
      deleteMutate(
        {
          org_id: orgId,
          policy_id: deletePolicyId,
          domain_name: "",
          policy_name: deletePolicyName,
        },
        {
          onSuccess: () => {
            toast("success", "Restriction policy deleted successfully");
            queryClient.invalidateQueries(["restriction_policy", orgId]);
            setShowDeleteModal(false);
            setDeletePolicyId("");
            setDeletePolicyName("");
          },
          onError: (error) => {
            const message = error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Failed to delete: ${message}`);
          },
        }
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "policy_name",
        header: "Policy Name",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleDeleteOpen(row.original)}
            className="text-destructive hover:text-destructive/80 p-1 rounded transition-colors"
            title="Delete Policy"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [formatUserDateNice]
  );

  const table = useReactTable({
    data: policies,
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

  if (isLoading) return <DataLoading content="Loading restriction policies..." />;
  if (isError) return <DataFechError content="Failed to load restriction policies." />;
  if (policies.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg border-border bg-card/30">
        <span className="text-muted-foreground text-sm">No restriction policies found</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table table={table} totalCount={totalCount} pagination={pagination} />
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={() => setShowDeleteModal(false)}
        handleDelete={handleConfirmDelete}
        value={deletePolicyName}
        isLoading={isDeletePending}
        requireConfirmation={true}
        confirmationText={deletePolicyName}
        confirmationPlaceholder={`Type "${deletePolicyName}" to confirm`}
        confirmationLabel="Please type the policy name exactly to confirm deletion:"
        title="Delete Restriction Policy"
        description="This action cannot be undone and will permanently delete this restriction policy."
      />
    </div>
  );
};

export default RestrictionsTab;
