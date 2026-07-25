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

import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  AddButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import NoDataFound from "@/components/common/NoDataFound";
import { ActiveStatus, InactiveStatus } from "@/components/common/Status";
import StatusBadge from "@/components/common/StatusBadge";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import SearchBar from "@/components/shared/SearchBar";
import TableWithoutPagination from "@/components/shared/TableWithoutPagination";
import { useDeleteCRMService, useGetCRMService } from "@/hooks/useCRMService";
import { useToastify } from "@/hooks/useToastify";
import { userProfileAtom } from "@/store/userProfile";
import { useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { Edit, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CRMService() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { data, isLoading, isError, refetch } = useGetCRMService();
  const services = data?.services ?? [];
  const { mutate, isPending } = useDeleteCRMService();
  const toast = useToastify();
  const queryClient = useQueryClient();

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }

    const query = searchQuery.toLowerCase().trim();
    return services.filter((service) => {
      const serviceName = (service.service_name || "").toLowerCase();
      const serviceCode = (service.service_code || "").toLowerCase();
      
      return serviceName.includes(query) || serviceCode.includes(query);
    });
  }, [services, searchQuery]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "service_code",
        header: "Service code",
        cell: ({ row }) => (
          <Link
            className="main-col "
            to={`/crm/services/${row.original.service_code}`}
          >
            {row.original.service_code}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "service_name",
        header: "Service Name",
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
    ];
    if (
      permissions.includes("crm:service:edit") ||
      permissions.includes("crm:service:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("crm:service:edit")) {
            actions.push({
              label: "Edit Service",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/crm/services/edit/${row?.original?.service_code}`),
              tooltip: "Edit service",
            });
          }

          if (permissions.includes("crm:service:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Service",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.service_name,
                  id: row?.original?.service_code,
                }),
              tooltip: "Delete service",
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { service_code: deleteId },
        {
          onSuccess: () => {
            toast("success", "Successfully CRM service deleted");
            queryClient.invalidateQueries({
              queryKey: ["crm_service"],
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
    data: filteredServices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddCRMService = () => {
    navigate(`/crm/services/add`);
  };

  if (!permissions.includes("crm:service:view"))
    return (
      <AccessDenied content="Don't have the access to list the CRM Service." />
    );

  if (isError) return <DataFechError content="Error loading CRM Service...!" />;

  return (
    <>
      <div className="px-2 w-full h-full">
        <div className=" w-full flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-4 w-full ">
            <Breadcrumbs items={[{ name: "CRM" }, { name: "Services" }]} />
            <div className="flex flex-1 gap-2">
              <SearchBar
                placeholder="Search by name or code..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                value={searchQuery}
                onRefresh={refetch}
              />
            </div>
          </div>

          {permissions.includes("crm:service:create") && (
            <AddButton
              label="Add CRM Service"
              handleClick={handleAddCRMService}
            />
          )}
        </div>

        {/* Show results based on filtered data */}
        {filteredServices.length !== 0 || isLoading ? (
          <TableWithoutPagination table={table} isLoading={isLoading} />
        ) : searchQuery ? (
          <NoDataFound content={`No services found matching "${searchQuery}"`} />
        ) : (
          <NoDataFound content="No CRM Service" />
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
        confirmationLabel="Please type the CRM service exactly to confirm deletion:"
        title="Delete CRM Service"
        description="This action cannot be undone and will remove all CRM service data."
      />
    </>
  );
}

export default CRMService;