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
import {
  useDeleteAttachmentPolicy,
  useGetAttachmentPolicyById,
} from "@/hooks/useAttachmentPolicy";
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
  Shield,
  Globe,
  Calendar,
  Check,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
  HardDrive,
  FileCheck,
  FileX,
  Trash2,
  SquarePen,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import CopyButton from "@/components/common/CopyId";

function ViewAttachmentPolicy() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { domain_name, policy_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useGetAttachmentPolicyById({
    organization_id,
    domain_name,
    policy_id,
  });

  const { mutate, isPending } = useDeleteAttachmentPolicy();

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id, domain_name, policy_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Attachment Policy deleted successfully");
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
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${
        active
          ? "bg-success/10 text-success border-success/20 border"
          : "bg-destructive/10 text-destructive border-destructive/20 border"
      }`}
    >
      {active ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {active ? "Active" : "Inactive"}
    </div>
  );

  const BooleanIndicator = ({
    value,
    trueLabel = "Yes",
    falseLabel = "No",
  }) => (
    <div
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
        value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      }`}
    >
      {value ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {value ? trueLabel : falseLabel}
    </div>
  );

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("policy:attachment:view"))
    return (
      <AccessDenied content="Don't have the access to view Attachment Policy details." />
    );

  if (isError && isServerError)
    return (
      <DataFechError content="Attachment Policy details getting error...!" />
    );

  return (
    <>
      <div className="h-full w-full overflow-hidden px-2 text-left">
        <div className="mb-3 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Attachment Policies", link: `/policies/attachment` },
                { name: "View Policy" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:attachment:edit") && !isLoading && (
              <Link
                to={`/policies/attachments/edit/${policy_id}/${domain_name}`}
              >
                <Button variant="primary" icon={SquarePen}>
                  Edit Policy
                </Button>
              </Link>
            )}

            {permissions?.includes("policy:attachment:delete") &&
              !isLoading && (
                <Button
                  variant="destructive"
                  icon={Trash2}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              )}
          </div>
        </div>

        <div className="no-scrollbar h-[calc(100vh-150px)] w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <DataLoading content="Loading attachment policy details..." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Header Card */}
              <div className="border-border from-primary/8 to-primary/3 rounded-lg border bg-gradient-to-r p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/15 rounded-lg p-2">
                      <Shield className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-card-foreground text-left text-xl font-bold">
                        {data?.policy_name || "Unknown Policy"}
                      </h1>
                      <CopyButton text={policy_id} />
                    </div>
                  </div>
                  <StatusBadge active={data?.is_active} />
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {/* Domain & Status */}
                <InfoCard icon={Globe} title="Domain & Status">
                  <InfoItem
                    label="Domain"
                    value={data?.domain_name || "Not specified"}
                  />
                  <InfoItem
                    label="Status"
                    value={data?.is_active ? "Active" : "Inactive"}
                  />
                </InfoCard>

                {/* Size Configuration */}
                <InfoCard icon={HardDrive} title="Size Configuration">
                  <InfoItem
                    label="Max Size"
                    value={
                      data?.max_attachment_size_mb > 0
                        ? `${data.max_attachment_size_mb} MB`
                        : "No Limit"
                    }
                  />
                  <InfoItem
                    label="Size Limit"
                    value={
                      <BooleanIndicator
                        value={data?.max_attachment_size_mb > 0}
                        trueLabel="Enabled"
                        falseLabel="Disabled"
                      />
                    }
                  />
                </InfoCard>

                {/* Timeline */}
                <InfoCard icon={Calendar} title="Timeline Information">
                  {data?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(data.created_at)}
                    />
                  )}
                  {data?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(data.updated_at)}
                    />
                  )}
                </InfoCard>
              </div>

              {/* Description Section */}
              {data?.policy_description && (
                <div className="space-y-4">
                  <InfoCard
                    icon={Settings}
                    title="Policy Description"
                    className="w-full"
                  >
                    <div className="border-border/50 bg-muted/30 rounded-md border p-3">
                      <p className="text-card-foreground text-left text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {data.policy_description}
                      </p>
                    </div>
                  </InfoCard>
                </div>
              )}

              {/* File Types Grid */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Allowed File Types */}
                {data?.allowed_file_types &&
                  data.allowed_file_types.length > 0 && (
                    <InfoCard
                      icon={FileCheck}
                      title="Allowed File Types"
                      className="w-full"
                    >
                      <div className="no-scrollbar max-h-64 space-y-1 overflow-y-auto">
                        {data.allowed_file_types.map((type, index) => (
                          <div
                            key={index}
                            className="bg-success/20 text-success mr-1 mb-1 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                          >
                            <FileCheck className="h-3 w-3" />
                            {type}
                          </div>
                        ))}
                      </div>
                      <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
                        <span className="text-muted-foreground text-xs">
                          {data.allowed_file_types.length}{" "}
                          {data.allowed_file_types.length === 1
                            ? "type"
                            : "types"}{" "}
                          allowed
                        </span>
                      </div>
                    </InfoCard>
                  )}

                {/* Blocked File Types */}
                {data?.blocked_file_types &&
                  data.blocked_file_types.length > 0 && (
                    <InfoCard
                      icon={FileX}
                      title="Blocked File Types"
                      className="w-full"
                    >
                      <div className="no-scrollbar max-h-64 space-y-1 overflow-y-auto">
                        {data.blocked_file_types.map((type, index) => (
                          <div
                            key={index}
                            className="bg-destructive/20 text-destructive mr-1 mb-1 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                          >
                            <FileX className="h-3 w-3" />
                            {type}
                          </div>
                        ))}
                      </div>
                      <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
                        <span className="text-muted-foreground text-xs">
                          {data.blocked_file_types.length}{" "}
                          {data.blocked_file_types.length === 1
                            ? "type"
                            : "types"}{" "}
                          blocked
                        </span>
                      </div>
                    </InfoCard>
                  )}
              </div>

              {/* Empty States */}
              {(!data?.allowed_file_types ||
                data.allowed_file_types.length === 0) &&
                (!data?.blocked_file_types ||
                  data.blocked_file_types.length === 0) && (
                  <div className="border-border bg-card rounded-lg border p-8 text-center">
                    <FileCheck className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
                    <h3 className="text-card-foreground mb-2 text-lg font-medium">
                      No File Types Configured
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      This attachment policy doesn't have any file type
                      restrictions configured yet.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(policy_id)}
        value={data?.policy_name || ""}
        isLoading={isPending}
      />
    </>
  );
}

export default ViewAttachmentPolicy;
