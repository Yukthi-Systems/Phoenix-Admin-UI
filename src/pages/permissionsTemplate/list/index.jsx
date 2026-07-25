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

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { AddButton, TableDeleteButton } from "@/components/common/Buttons";
import TableWithoutPagination from "@/components/shared/TableWithoutPagination";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useEditPermissionsTemplate } from "@/hooks/usePermissionTemplate";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { categorizePermissions } from "./utils";
import { Shield, Plus, AlertTriangle, Eye } from "lucide-react";
import PermissionTemplateViewModal from "./PermissionTemplateViewModal";

function ListPermissionTemplate() {
  const { permissions, permissions_template, user_id } =
    useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const { mutate, isPending } = useEditPermissionsTemplate();
  const navigate = useNavigate();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const setProfile = useSetAtom(userProfileAtom);

  // State
  const [deleteValue, setDeleteValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Transform permissions_template object into enhanced array
  const templateList = useMemo(() => {
    if (!permissions_template) return [];

    return Object.entries(permissions_template).map(
      ([template_name, template_permissions]) => ({
        template_name,
        permissions: template_permissions,
        permissionsCount: template_permissions.length,
        categories: categorizePermissions(template_permissions),
      }),
    );
  }, [permissions_template]);

  // Event handlers
  const handleAddTemplate = () => {
    navigate("/permissions-template/add");
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedTemplate(null);
  };

  const onDelete = (template_name) => {
    const updatedTemplates = { ...permissions_template };
    delete updatedTemplates[template_name];

    mutate(
      {
        org_id: organization_id,
        user_id,
        data: updatedTemplates,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["profile", user_id, organization_id],
          });

          const updatedProfile = await queryClient.fetchQuery({
            queryKey: ["profile", user_id, organization_id],
          });

          if (updatedProfile) {
            setProfile(updatedProfile.user_details);
          }

          setDeleteValue("");
          setShowDeleteModal(false);
          toast("success", "Successfully deleted Permission Template");
        },
        onError: (error) => {
          toast("error", "Failed to delete template");
          console.error(error);
        },
      },
    );
  };

  const handleDeleteClick = (template_name) => {
    setDeleteValue(template_name);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setDeleteValue("");
    setShowDeleteModal(false);
  };

  // Table columns configuration
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "template_name",
        header: () => (
          <div className="flex items-center gap-2 text-left">
            <Shield className="text-primary h-4 w-4" />
            <span>Template Name</span>
          </div>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => handleViewTemplate(row.original)}
            className="text-foreground hover:text-primary group flex w-full items-center gap-3 text-left font-medium transition-colors"
          >
            <div className="bg-primary/10 group-hover:bg-primary/20 flex-shrink-0 rounded-lg p-2 transition-colors">
              <Shield className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-foreground group-hover:text-primary font-semibold transition-colors">
                {row.original.template_name}
              </div>
              <div className="text-muted-foreground text-sm">
                {row.original.permissionsCount} permission
                {row.original.permissionsCount !== 1 ? "s" : ""}
              </div>
            </div>
          </button>
        ),
      },
    ];

    // Add actions column if user has edit permissions
    if (permissions.includes("user:security:permissions:template:edit")) {
      baseColumns.push({
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleViewTemplate(row.original)}
              className="text-primary hover:bg-primary/10 rounded-lg p-2 transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <TableDeleteButton
              handleClick={() => handleDeleteClick(row.original.template_name)}
              className="hover:bg-destructive/10 transition-colors"
            />
          </div>
        ),
      });
    }

    return baseColumns;
  }, [permissions]);

  // Table instance
  const table = useReactTable({
    data: templateList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Permission check
  if (!permissions.includes("user:security:permissions:template:view")) {
    return (
      <AccessDenied content="You don't have permission to view permission templates" />
    );
  }

  return (
    <div className="h-full w-full px-2">
      {/* Header Section */}
      <div className="mt-1.5 mb-6 flex w-full items-center justify-between">
        <div className="space-y-2">
          <Breadcrumbs items={[{ name: "Permission Templates" }]} />
        </div>

        {permissions.includes("user:security:permissions:template:edit") && (
          <AddButton
            label="Add Permission Template"
            handleClick={handleAddTemplate}
            icon={Plus}
            className="shadow-sm transition-all duration-200 hover:shadow-md"
          />
        )}
      </div>

      {/* Main Content */}
      {templateList.length > 0 ? (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <TableWithoutPagination table={table} />
        </div>
      ) : (
        <div className="bg-card border-border rounded-xl border p-12 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-muted rounded-full p-6">
              <Shield className="text-muted-foreground h-12 w-12" />
            </div>

            <div className="max-w-md space-y-3">
              <h3 className="text-card-foreground text-xl font-semibold">
                No Permission Templates Found
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Create permission templates to easily assign common sets of
                permissions to users. Templates help maintain consistency and
                simplify user management.
              </p>
            </div>

            {permissions.includes(
              "user:security:permissions:template:edit",
            ) && (
              <AddButton
                label="Create First Template"
                handleClick={handleAddTemplate}
                icon={Plus}
                className="mt-2 shadow-sm transition-all duration-200 hover:shadow-md"
              />
            )}
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <PermissionTemplateViewModal
          isOpen={showViewModal}
          onClose={handleCloseViewModal}
          template={selectedTemplate}
        />
      )}

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={handleDeleteCancel}
        handleDelete={() => onDelete(deleteValue)}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the template name exactly to confirm deletion:"
        title="Delete Permission Template"
        description={
          <div className="space-y-3 text-left">
            <div className="bg-warning/5 border-warning/20 mt-6 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warning mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="text-warning text-sm font-medium">
                    Security Warning
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Users currently assigned to this template will lose their
                    permissions unless they have been granted individually.
                    Consider reassigning users to another template before
                    deletion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

export default ListPermissionTemplate;
