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
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToastify } from "@/hooks/useToastify";
import { useState } from "react";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  BackButton,
  Button,
  DeleteButton,
  EditButton,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import {
  useDeleteCRMService,
  useGetCRMServiceItem,
} from "@/hooks/useCRMService";
import {
  Settings,
  Code,
  Calendar,
  Info,
  Check,
  X,
  Package,
  FileText,
  User,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";

function ViewCRMService() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { service_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);
  const {
    data: serviceData,
    isPending: isLoading,
    isError,
    error,
  } = useGetCRMServiceItem({
    organization_id,
    service_code: service_id,
  });
  const data = serviceData?.data;
  const { mutate, isPending } = useDeleteCRMService();

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { service_code: deleteId },
        {
          onSuccess: () => {
            toast("success", "CRM service deleted successfully");
            navigate(-1);
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
    } else {
      toast("error", `Message:'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

  const StatusBadge = ({ active }) => (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${
        active
          ? "bg-success/10 text-success border border-success/20"
          : "bg-destructive/10 text-destructive border border-destructive/20"
      }`}
    >
      {active ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      {active ? "Active" : "Inactive"}
    </div>
  );

  // Check for server errors only
  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("crm:service:view"))
    return (
      <AccessDenied content="Don't have the access to CRM Service details." />
    );

  if (isError && isServerError)
    return <DataFechError content="CRM Service details getting error...!" />;

  return (
    <>
      <div className="w-full h-full px-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "CRM" },
                { name: "Services", link: `/crm/services` },
                { name: "View Service" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            {permissions?.includes("crm:service:edit") && !isLoading && (
              <Button
                onClick={() => navigate(`/crm/services/edit/${service_id}`)}
                icon={Edit}
                size="md"
              >
                Edit
              </Button>
            )}
            {permissions?.includes("crm:service:delete") && !isLoading && (
              <Button
                variant="destructive"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                size="md"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-150px)] w-full no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading service details..." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Show client error message but keep UI functional */}
              {isError && !isServerError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                      {error?.response?.data?.message ||
                        "Failed to load service details"}
                    </p>
                  </div>
                </div>
              )}

              {/* Header Section */}
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {data?.service_name || "Unknown Service"}
                      </h1>
                      <p className="text-muted-foreground text-sm text-left">
                        {data?.service_code || "Service Details"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge active={data?.is_active} />
                </div>
              </div>

              {/* 3 Main Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Service Information */}
                <InfoCard icon={Info} title="Service Information">
                  <InfoItem
                    label="Service Code"
                    value={data?.service_code || "Not specified"}
                  />
                  <InfoItem
                    label="Service Name"
                    value={data?.service_name || "Not specified"}
                  />
                  <InfoItem
                    label="Status"
                    value={data?.is_active ? "Active" : "Inactive"}
                  />
                  <InfoItem
                    label="Version"
                    value={data?.service_info?.version || "Not specified"}
                  />
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Package className="w-3.5 h-3.5" />
                      <span className="text-left">CRM service configured</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Timeline & Management */}
                <InfoCard icon={Calendar} title="Timeline & Management">
                  {data?.service_info?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(data.service_info.created_at)}
                    />
                  )}
                  {data?.service_info?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(data.service_info.updated_at)}
                    />
                  )}
                  <InfoItem
                    label="Created By"
                    value={data?.service_info?.created_by || "Unknown"}
                  />
                  <InfoItem
                    label="Updated By"
                    value={data?.service_info?.updated_by || "N/A"}
                  />
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-left">Service timeline</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Description Information */}
                <InfoCard icon={FileText} title="Description & Details">
                  {data?.service_description && (
                    <div className="p-3 bg-muted/30 rounded-md border border-border/50 mb-3">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                        {data.service_description}
                      </p>
                    </div>
                  )}

                  {data?.service_info?.description && (
                    <div className="p-3 bg-muted/20 rounded-md border border-border/30">
                      <p className="text-xs text-left text-muted-foreground font-medium mb-1">
                        Additional Notes:
                      </p>
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                        {data.service_info.description}
                      </p>
                    </div>
                  )}

                  {!data?.service_description &&
                    !data?.service_info?.description && (
                      <div className="p-3 bg-muted/20 rounded text-center">
                        <span className="text-xs text-muted-foreground">
                          No description provided
                        </span>
                      </div>
                    )}
                </InfoCard>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(service_id)}
        value={data?.service_name || ""}
        isLoading={isPending}
      />
    </>
  );
}

export default ViewCRMService;
