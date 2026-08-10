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

import { exportCRMPO } from "@/api/crmPurchaseOrder";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import DropdownButton from "@/components/common/DropdownButton";
import ExportModal from "@/components/common/ExportModal";
import NoDataFound from "@/components/common/NoDataFound";
import StatusBadge from "@/components/common/StatusBadge";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import Table from "@/components/shared/Table";
import { FIELD_MAPPINGS } from "@/constants/export";
import { useDeleteCRMPO, useGetCRMPO } from "@/hooks/useCRMPO";
import useExport from "@/hooks/useExport";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { Download, Edit, Link2, Plus, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CRMPO() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const navigate = useNavigate();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { pagination, onPaginationChange: setPagination } =
     useTablePagination();
  const { data, isLoading, isError } = useGetCRMPO({
    organization_id,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const polist = data?.data?.purchase_orders ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const { formatUserDateNice } = useUserTimezone();
  const totalCount = data?.data?.total_count ?? 1;
  const { mutate, isPending } = useDeleteCRMPO();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const getStatus = (v) => {
    if (v == "Pending") {
      return "pending";
    } else if (v == "Completed") {
      return "completed";
    } else {
      return "info";
    }
  };

  const handleAddCRMPO = () => {
    navigate(`/crm/purchase-order/add`);
  };

  const fetchCRMPOForExport = async ({
    organization_id,
    page,
    limit = 100,
  }) => {
    return await exportCRMPO(organization_id, page, limit);
  };

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "purchaseOrder",
    fetchCRMPOForExport,
    FIELD_MAPPINGS.purchaseOrder,
  );

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("crm:purchase_order:create")) {
      options.push({
        label: "Add Single PO",
        description: "Create one Purchase Order",
        icon: <Plus className="w-4 h-4" />,
        onClick: handleAddCRMPO,
      });
    }

    if (permissions.includes("crm:purchase_order:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description:
          totalCount === 0
            ? "No purchase orders to export"
            : "Download all Purchase Order as Excel file",
        icon: <Download className="w-4 h-4" />,
        onClick: handleExport,
        disabled: totalCount === 0,
      });
    }

    return options;
  }, [permissions, handleAddCRMPO, isExportAvailable, handleExport, totalCount]);

  const formatValue = (val) => {
    const parsedValue = parseFloat(val);
    if (isNaN(parsedValue)) return "0.00"; // Fallback if parsing fails

    return parsedValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "po_name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/crm/purchase-order/${row.original.po_id}`}
          >
            {row.original.po_name}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "po_status",
        header: "Status",
        cell: ({ getValue }) => {
          return <StatusBadge status={getStatus(getValue())} />;
        },
      },
      {
        accessorKey: "total_amount",
        header: "Total Amount",
        cell: ({ getValue }) => {
          return formatValue(getValue());
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "po_date",
        header: "PO Date",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
    ];

    if (
      permissions.includes("crm:purchase_order:edit") ||
      permissions.includes("crm:purchase_order:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("crm:purchase_order:edit")) {
            actions.push({
              label: "Edit Purchase Order",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/crm/purchase-order/edit/${row?.original?.po_id}`),
              tooltip: "Edit purchase order",
            });
          }

          actions.push({
            label: "Link Services",
            icon: Link2,
            variant: "default",
            onClick: () =>
              navigate(
                `/crm/purchase-order/create-link-service/${row?.original?.po_id}`,
              ),
            tooltip: "Link Services",
          });

          if (permissions.includes("crm:purchase_order:delete")) {
            actions.push({ separator: true });
            actions.push({
              label: "Delete Purchase Order",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.po_name,
                  id: row?.original?.po_id,
                }),
              tooltip: "Delete purchase order",
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
  }, [permissions]);

  function handleDelete({ name, id }) {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  }

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { organization_id, po_id: deleteId, po_name: deleteValue },
        {
          onSuccess: () => {
            toast("success", "Successfully CRM purchase order deleted");
            queryClient.invalidateQueries({
              queryKey: [
                "crm_purchase_order",
                organization_id,
                pagination.pageIndex + 1,
                pagination.pageSize,
              ],
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
      setShowDeleteModal(false);
      setDeleteId("");
      setDeleteValue("");
    } else {
      toast("error", `Message:'Unknown error'`);
    }
  };

  const table = useReactTable({
    data: polist,
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

  if (!permissions.includes("crm:purchase_order:view"))
    return (
      <AccessDenied content="Don't have the access to list the CRM purchase order." />
    );

  if (isError)
    return <DataFechError content="Error loading CRM purchase order...!" />;
  return (
    <>
      <div className="px-2 w-full h-full">
        <div className=" w-full flex justify-between items-center mb-2.5">
          <Breadcrumbs items={[{ name: "CRM" }, { name: "Purchase Order" }]} />

          {permissions.includes("crm:purchase_order:create") && (
            <div className="flex items-center gap-2">
              {createOptions.length > 0 && (
                <DropdownButton
                  label="Actions"
                  options={createOptions}
                  variant="primary"
                />
              )}
            </div>
          )}
        </div>

        {polist.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : (
          <NoDataFound content="No CRM purchase order" />
        )}
      </div>
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the CRM purchase order exactly to confirm deletion:"
        title="Delete CRM purchase order"
        description="This action cannot be undone and will remove all CRM purchase order data."
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export PO"
        description="Export all po to Excel format. This may take a few minutes for large datasets."
      />
    </>
  );
}

export default CRMPO;
