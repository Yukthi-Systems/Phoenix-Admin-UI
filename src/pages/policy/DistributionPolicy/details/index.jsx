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
import { useState, useMemo } from "react";
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
  useDeleteDistributionPolicy,
  useDistributionPolicyEntry,
} from "@/hooks/useDistributionPolicy";
import {
  Users,
  Mail,
  User,
  Building,
  Calendar,
  Info,
  Check,
  X,
  Network,
  Globe,
  Shield,
  FileText,
  Settings,
  ArrowRightLeft,
  Lock,
  Unlock,
  Trash2,
  SquarePen,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import CopyButton from "@/components/common/CopyId";
import DistributionWarning from "./Warning";

function ViewDistributionPolicy() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { policy_distribution_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useDistributionPolicyEntry({
    org_id: organization_id,
    policy_id: policy_distribution_id,
  });

  const { mutate, isPending } = useDeleteDistributionPolicy();

  const OnDelete = () => {
    if (policy_distribution_id) {
      mutate(
        {
          org_id: organization_id,
          policy_id: policy_distribution_id,
          domain_name: data?.domain_name,
          policy_name: data?.policy_name || "Unknown Policy",
        },
        {
          onSuccess: () => {
            toast("success", "Distribution policy deleted successfully");
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

  const DistributionRuleCard = ({
    title,
    items,
    icon: Icon,
    type = "internal",
  }) => {
    const getItemDisplay = (item) => {
      if (type === "internal" || type === "external") {
        return item;
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
                {type === "internal" && (
                  <div className="ml-2 px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                    Internal
                  </div>
                )}
                {type === "external" && (
                  <div className="ml-2 px-2 py-1 rounded text-xs bg-secondary/10 text-secondary">
                    External
                  </div>
                )}
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
            {displayItems.length === 1 ? "member" : "members"}
          </span>
        </div>
      </InfoCard>
    );
  };

  const RuleTypeBadge = ({ ruleType }) => {
    const getRuleTypeInfo = (type) => {
      const types = {
        GROUP_MEMBER: {
          label: "Group Member",
          color: "bg-primary/10 text-primary border-primary/20",
          icon: Users,
        },
        SPECIFIC_EMAIL: {
          label: "Specific Email",
          color: "bg-success/10 text-success border-success/20",
          icon: Mail,
        },
        DOMAIN_WIDE: {
          label: "Domain Wide",
          color: "bg-accent/40 text-accent-foreground border-accent/60",
          icon: Globe,
        },
        EXTERNAL_ONLY: {
          label: "External Only",
          color: "bg-warning/10 text-warning border-warning/20",
          icon: ArrowRightLeft,
        },
      };

      return (
        types[type] || {
          label: type?.replace(/_/g, " ") || "Unknown",
          color: "bg-muted text-muted-foreground border-border",
          icon: Settings,
        }
      );
    };

    const { label, color, icon: Icon } = getRuleTypeInfo(ruleType);

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${color}`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  // Memoized computed values for the policy
  const policyStats = useMemo(() => {
    const internalMembers = Array.isArray(data?.internal_members)
      ? data.internal_members
      : [];
    const externalMembers = Array.isArray(data?.external_members)
      ? data.external_members
      : [];
    const specificEmails = Array.isArray(data?.specific_emails)
      ? data.specific_emails
      : [];

    return {
      totalInternal: internalMembers.length,
      totalExternal: externalMembers.length,
      totalSpecific: specificEmails.length,
      hasInternal: internalMembers.length > 0,
      hasExternal: externalMembers.length > 0,
      hasSpecific: specificEmails.length > 0,
      totalMembers:
        internalMembers.length + externalMembers.length + specificEmails.length,
    };
  }, [data]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("policy:distribution:view"))
    return (
      <AccessDenied content="You don't have permission to view distribution policy details." />
    );

  if (isError && isServerError)
    return (
      <DataFechError content="Error fetching distribution policy details!" />
    );

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden text-left">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "Distribution Policies",
                  link: "/policies/distribution",
                },
                { name: "View Distribution Policy" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:distribution:edit") &&
              !isLoading && (
                <Link
                  to={`/policies/distribution/edit/${policy_distribution_id}`}
                >
                  <Button variant="primary" icon={SquarePen}>
                    Edit Policy
                  </Button>
                </Link>
              )}

            {permissions?.includes("policy:distribution:delete") &&
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
              <DataLoading content="Loading distribution policy details..." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              {/* Policy Header Card */}
              <div className="bg-gradient-to-r from-blue-500/8 to-blue-500/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/15 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {data?.policy_name || "Unknown Distribution Policy"}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <CopyButton text={policy_distribution_id} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge active={data?.is_active} />
                  </div>
                </div>
              </div>

              {/* Overview Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InfoCard icon={Globe} title="Domain & Type">
                  <InfoItem
                    label="Domain"
                    value={data?.domain_name || "Not specified"}
                  />
                  <InfoItem
                    label="Rule Type"
                    value={<RuleTypeBadge ruleType={data?.rule_type} />}
                  />
                </InfoCard>

                <InfoCard icon={Network} title="Distribution Stats">
                  <InfoItem
                    label="Total Members"
                    value={policyStats.totalMembers}
                  />
                  <InfoItem
                    label="Internal Members"
                    value={policyStats.totalInternal}
                  />
                  <InfoItem
                    label="External Members"
                    value={policyStats.totalExternal}
                  />
                  <InfoItem
                    label="Specific Emails"
                    value={policyStats.totalSpecific}
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

              {/* Distribution Rules Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <DistributionRuleCard
                  title="Internal Members"
                  items={data?.internal_members}
                  icon={Building}
                  type="internal"
                />

                <DistributionRuleCard
                  title="External Members"
                  items={data?.external_members}
                  icon={User}
                  type="external"
                />

                <DistributionRuleCard
                  title="Specific Emails"
                  items={data?.specific_emails}
                  icon={Mail}
                  type="specific"
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

              <DistributionWarning
                data={data}
                permissions={permissions}
                policyStats={policyStats}
                policy_distribution_id={policy_distribution_id}
              />
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
        title="Delete Distribution Policy"
        description="This action cannot be undone and will remove all distribution policy data, including all member configurations."
      />
    </>
  );
}

export default ViewDistributionPolicy;
