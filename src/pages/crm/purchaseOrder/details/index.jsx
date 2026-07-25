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
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import {
  useDeleteCRMPO,
  useDeleteCRMPOLink,
  useGetCRMPOItem,
} from "@/hooks/useCRMPO";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Info,
  Edit3,
  Eye,
  Plus,
  PackageCheck,
  MousePointer,
  Trash2,
  Edit,
} from "lucide-react";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useUserTimezone } from "@/hooks/useTimezone";
import CopyButton from "@/components/common/CopyId";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";

function ViewCRMPO() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);
  const [deleteLinkId, setShowDeleteLinkId] = useState(null);
  const { formatUserDateOnly, formatUserDateNice } = useUserTimezone();
  const [deleteLinkValue, setShowDeleteLinkValue] = useState(null);
  const { po_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);
  const {
    data: details,
    isPending: isLoading,
    isError,
    error,
  } = useGetCRMPOItem({ organization_id, po_id });
  const { mutate, isPending } = useDeleteCRMPO();
  const { mutate: linkDelete, isPending: linkLoad } = useDeleteCRMPOLink();
  const queryClient = useQueryClient();
  const data = details?.data;
  const { data: Org_Detail } = useGetOrganizationDetail(organization_id);
  const orgBranch = Org_Detail?.details?.branches || {};
  const orgContact = Org_Detail?.details?.contact_info || {};

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id, po_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Purchase Order deleted successfully");
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

  const handleOpenDeleteLink = (row) => {
    setShowDeleteLinkValue(row?.service_name);
    setShowDeleteLinkId(row?.assignment_id);
    setShowDeleteLinkModal(true);
  };

  const OnCancelLink = () => {
    setShowDeleteLinkValue(null);
    setShowDeleteLinkId(null);
    setShowDeleteLinkModal(false);
  };

  const OnDeleteLink = () => {
    if (deleteLinkId) {
      linkDelete(
        { organization_id, po_id, assignment_id: deleteLinkId },
        {
          onSuccess: () => {
            toast("success", "Service link deleted successfully");
            queryClient.invalidateQueries({
              queryKey: ["get_crm_purchase_order_item"],
            });
            OnCancelLink();
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

  const DomainInfoItem = ({ label }) => (
    <div className="flex items-center justify-between ">
      <span className="text-sm text-muted-foreground min-w-0 py-1 text-left">
        {label}
      </span>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "approved":
        case "completed":
          return "bg-success/10 text-success border border-success/20";
        case "pending":
          return "bg-warning/10 text-warning border border-warning/20";
        case "rejected":
        case "cancelled":
          return "bg-destructive/10 text-destructive border border-destructive/20";
        default:
          return "bg-muted text-muted-foreground border border-border";
      }
    };

    const getStatusIcon = (status) => {
      switch (status?.toLowerCase()) {
        case "approved":
        case "completed":
          return <CheckCircle className="w-3.5 h-3.5" />;
        case "pending":
          return <Clock className="w-3.5 h-3.5" />;
        case "rejected":
        case "cancelled":
          return <AlertCircle className="w-3.5 h-3.5" />;
        default:
          return <Info className="w-3.5 h-3.5" />;
      }
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${getStatusColor(status)}`}
      >
        {getStatusIcon(status)}
        {status}
      </div>
    );
  };

  const ServiceCard = ({ service, index }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-card-foreground text-left">
              {service.service_name}
            </h4>
            <p className="text-xs text-muted-foreground text-left">
              {service.service_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
            #{index + 1}
          </span>
          <div className="flex gap-1">
            {permissions?.includes("crm:purchase_order:edit") && (
              <Link
                to={`/crm/purchase-order/edit-link-service/${po_id}/${service?.assignment_id}`}
                state={{ data: service }}
              >
                <TableEditButton />
              </Link>
            )}
            {permissions?.includes("crm:purchase_order:delete") && (
              <TableDeleteButton
                handleClick={() => handleOpenDeleteLink(service)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <InfoItem
          label="Service Type"
          value={service.service_details?.service_type || "-"}
        />
        <InfoItem
          label="Start Date"
          value={formatUserDateOnly(service.service_details?.start_date) || "-"}
        />
        <InfoItem
          label="Expiry Date"
          value={
            formatUserDateOnly(service.service_details?.expiry_date) || "-"
          }
        />
        <InfoItem
          label="Renewal Status"
          value={service?.service_details?.renewal_status || "-"}
        />
        <InfoItem
          label="Branch"
          value={orgBranch[service?.service_details?.branch]?.name || "-"}
        />
        <InfoItem
          label="Contact Person"
          value={
            orgContact[service?.service_details?.contact_person]?.name || "-"
          }
        />
        <InfoItem label="Description" value={service.notes || "-"} />

        {service.service_details?.domain_dropdown.length !== 0 && (
          <div className="pt-2 border-t border-border">
            <span className="text-muted-foreground block text-left">
              Domains:
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {service.service_details?.domain_dropdown &&
                service.service_details?.domain_dropdown.map((item, idx) => (
                  <div className="flex gap-1 py-2" key={idx}>
                    <Link to={`/domain/${item}`}>
                      <span className="font-medium text-card-foreground text-left">
                        {item || "-"}
                      </span>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex gap-1">
              <span className="text-muted-foreground block text-left">
                Created By:
              </span>
              <span className="font-medium text-card-foreground text-left">
                {service.service_info?.created_by || "-"}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground block text-right">
                Updated By:
              </span>
              <span className="font-medium text-card-foreground text-right">
                {service.service_info?.updated_by || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Check for server errors only
  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("crm:purchase_order:view"))
    return (
      <AccessDenied content="Don't have the access to Purchase Order details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Purchase Order details getting error...!" />;

  return (
    <>
      <div className="w-full h-full px-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "CRM" },
                { name: "Purchase Orders", link: "/crm/purchase-order" },
                { name: "View Purchase Order" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            {permissions?.includes("crm:purchase_order:edit") && !isLoading && (
              <Button
                onClick={() => navigate(`/crm/purchase-order/edit/${po_id}`)}
                icon={Edit}
                size="md"
              >
                Edit
              </Button>
            )}
            {permissions?.includes("crm:purchase_order:delete") &&
              !isLoading && (
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

        <div className="h-[calc(100vh-150px)] w-full overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading purchase order details..." />
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
                        "Failed to load purchase order details"}
                    </p>
                  </div>
                </div>
              )}

              {/* Header Section */}
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {data?.po_name || "Purchase Order"}
                      </h1>
                      <CopyButton text={data.po_id} />
                    </div>
                  </div>
                  <StatusBadge status={data?.po_status} />
                </div>
              </div>

              {/* Consolidated 3 Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Purchase Order Information - Combines Basic Info + Financial */}
                <InfoCard icon={Info} title="Purchase Order Information">
                  <InfoItem
                    label="Total Amount"
                    value={`${data?.total_amount?.toLocaleString() || 0}`}
                  />
                  <InfoItem label="Status" value={data?.po_status || "-"} />
                  <InfoItem
                    label="PO Date"
                    value={formatUserDateNice(data?.po_date)}
                  />

                  {data?.po_description && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                        <p className="text-xs text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                          {data.po_description}
                        </p>
                      </div>
                    </div>
                  )}
                </InfoCard>

                {/* Timeline & Management - Combines Timeline + User Info */}
                <InfoCard icon={Calendar} title="Timeline & Management">
                  <InfoItem
                    label="Created At"
                    value={formatUserDateNice(data?.details?.created_at)}
                  />
                  <InfoItem
                    label="Updated At"
                    value={formatUserDateNice(data?.details?.updated_at)}
                  />
                  <InfoItem
                    label="Created By"
                    value={data?.details?.created_by || "-"}
                  />
                  <InfoItem
                    label="Updated By"
                    value={data?.details?.updated_by || "N/A"}
                  />

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-left">
                        {data?.details?.created_at &&
                        data?.details?.updated_at &&
                        data.details.created_at !== data.details.updated_at
                          ? "Modified"
                          : "Original"}
                      </span>
                    </div>
                  </div>
                </InfoCard>

                {/* <InfoCard icon={PackageCheck} title="Renewal">
                                    <InfoItem label="Renewal Status" value={data?.details?.renewal_status} />
                                    <InfoItem label="Service Type" value={data?.details?.service_type} />
                                    <InfoItem label="Start Date" value={formatDateOnly(data?.details?.start_date)} />
                                    <InfoItem label="Expiry Date" value={formatDateOnly(data?.details?.expiry_date)} />
                                </InfoCard> */}

                {/* {
                                    data?.details?.domain_dropdown && <InfoCard icon={MousePointer} title="Domains">
                                        <div className=" w-full h-44 overflow-y-auto">
                                            {
                                                data?.details?.domain_dropdown && data?.details?.domain_dropdown.map((item, idx) => {
                                                    return (
                                                        <DomainInfoItem label={item} key={idx} />
                                                    )
                                                })
                                            }
                                        </div>
                                    </InfoCard>
                                } */}

                {/* Services Overview */}
                <InfoCard icon={Package} title="Services Overview">
                  <InfoItem
                    label="Total Services"
                    value={data?.services?.length || 0}
                  />
                  <InfoItem
                    label="Service Types"
                    value="CRM Services"
                    sublabel="Linked services below"
                  />

                  <div className="mt-3 pt-3 border-t border-border">
                    <Link
                      to={`/crm/purchase-order/create-link-service/${po_id}`}
                    >
                      <button className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium px-3 py-2 rounded-md transition-colors duration-200 text-sm">
                        <Plus className="w-4 h-4" />
                        Add Service Link
                      </button>
                    </Link>
                  </div>
                </InfoCard>
              </div>

              {/* Services Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-card-foreground text-left">
                      Linked Services
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({data?.services?.length || 0} services)
                    </span>
                  </div>
                </div>

                {data?.services && data.services.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.services.map((service, index) => (
                      <ServiceCard
                        key={service.assignment_id}
                        service={service}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No services linked</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your first service link to get started
                    </p>
                    <Link
                      to={`/crm/purchase-order/create-link-service/${po_id}`}
                    >
                      <button className="mt-3 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-colors duration-200 mx-auto">
                        <Plus className="w-4 h-4" />
                        Add Service Link
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(po_id)}
        value={data?.po_name || ""}
        isLoading={isPending}
      />

      {showDeleteLinkModal && (
        <DeleteModelBox
          isOpen={showDeleteLinkModal}
          handleCancel={OnCancelLink}
          handleDelete={OnDeleteLink}
          value={deleteLinkValue || ""}
          isLoading={linkLoad}
        />
      )}
    </>
  );
}

export default ViewCRMPO;
