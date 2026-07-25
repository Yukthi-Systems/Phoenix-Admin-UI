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
  useDeleteForwardingPolicy,
  useForwardingPolicyEntry,
} from "@/hooks/useForwardingPolicy";
import {
  Mail,
  User,
  Calendar,
  Info,
  Check,
  X,
  Globe,
  FileText,
  SquarePen,
  Trash2,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import CopyButton from "@/components/common/CopyId";

function ViewForwardingPolicy() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { policy_forwarding_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useForwardingPolicyEntry({
    org_id: organization_id,
    policy_id: policy_forwarding_id,
  });

  const { mutate, isPending } = useDeleteForwardingPolicy();

  const OnDelete = () => {
    if (policy_forwarding_id) {
      mutate(
        {
          org_id: organization_id,
          policy_id: policy_forwarding_id,
          domain_name: data?.domain_name,
          policy_name: data?.policy_name || "Unknown Policy",
        },
        {
          onSuccess: () => {
            toast("success", "Forwarding policy deleted successfully");
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
    }
  };

  const OnCancel = () => setShowDeleteModal(false);

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

  const ForwardingRuleCard = ({ title, items, icon: Icon, type = "email" }) => {
    const getItemDisplay = (item) => {
      if (type === "email") {
        return item;
      } else if (type === "filter") {
        return `${item.condition || item}${item.value ? `: ${item.value}` : ""}`;
      }
      return item;
    };

    const isArray = Array.isArray(items);
    const displayItems = isArray ? items : [];

    return (
      <InfoCard icon={Icon} title={title}>
        {displayItems.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayItems.map((item, index) => (
              <div
                key={`${type}-${index}`}
                className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
              >
                <div className="break-all text-left flex-1">
                  {getItemDisplay(item)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-muted/20 rounded text-center">
            <span className="text-xs text-muted-foreground">
              No {title.toLowerCase()} configured
            </span>
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {displayItems.length}{" "}
            {displayItems.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </InfoCard>
    );
  };

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("policy:forwarding:view"))
    return (
      <AccessDenied content="You don't have permission to view forwarding policy details." />
    );

  if (isError && isServerError)
    return (
      <DataFechError content="Error fetching forwarding policy details!" />
    );

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Forwarding Policies", link: "/policies/forwarding" },
                { name: "View Forwarding Policy" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:forwarding:edit") && !isLoading && (
              <Link to={`/policies/forwarding/edit/${policy_forwarding_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Policy
                </Button>
              </Link>
            )}

            {permissions?.includes("policy:forwarding:delete") &&
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

        <div className="h-[calc(100vh-150px)] w-full overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading forwarding policy details..." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              {/* Policy Header Card */}
              <div className="bg-gradient-to-r from-purple-500/8 to-purple-500/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/15 rounded-lg">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {data?.policy_name || "Unknown Forwarding Policy"}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <CopyButton text={policy_forwarding_id} />
                        {data?.policy_description && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            <span className="max-w-md truncate">
                              {data.policy_description}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge active={data?.is_active} />
                  </div>
                </div>
              </div>

              {/* Overview Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                <InfoCard icon={Globe} title="Domain & Type">
                  <InfoItem
                    label="Domain"
                    value={data?.domain_name || "Not specified"}
                  />
                </InfoCard>

                <InfoCard icon={Calendar} title="Timeline Information">
                  {data?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(data.created_at)}
                      showIcon={false}
                    />
                  )}
                  {data?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(data.updated_at)}
                      showIcon={false}
                    />
                  )}
                </InfoCard>
              </div>

              {/* Forwarding Rules Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ForwardingRuleCard
                  title="Forward To Addresses"
                  items={data?.forward_to_emails}
                  icon={User}
                  type="email"
                />

                <ForwardingRuleCard
                  title="From Emails"
                  items={data?.from_emails}
                  icon={Mail}
                  type="email"
                />
              </div>

              {/* Additional Information Card */}
              {data?.policy_description && (
                <InfoCard icon={Info} title="Policy Description">
                  <div className="p-3 bg-muted/20 rounded">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.policy_description}
                    </p>
                  </div>
                </InfoCard>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={data?.policy_name || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={data?.policy_name || ""}
        confirmationPlaceholder={`Type "${data?.policy_name || "policy name"}" to confirm`}
        confirmationLabel="Please type the policy name exactly to confirm deletion:"
        title="Delete Forwarding Policy"
        description="This action cannot be undone and will remove all forwarding policy data, including all forwarding rules and filters."
      />
    </>
  );
}

export default ViewForwardingPolicy;
