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
  useDeleteRestrictionPolicy,
  useRestrictionPolicyEntry,
} from "@/hooks/useRestrictionPolicy";
import {
  Shield,
  Globe,
  MapPin,
  Calendar,
  Info,
  Check,
  X,
  Lock,
  Unlock,
  Users,
  Settings,
  Network,
  Flag,
  Clock,
  FileText,
  SquarePen,
  Trash2,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import CopyButton from "@/components/common/CopyId";

function ViewRestrictionPolicy() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { restriction_policy_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useRestrictionPolicyEntry({
    org_id: organization_id,
    policy_id: restriction_policy_id,
  });

  const { mutate, isPending } = useDeleteRestrictionPolicy();

  const OnDelete = () => {
    if (restriction_policy_id) {
      mutate(
        {
          org_id: organization_id,
          policy_id: restriction_policy_id,
          domain_name: data?.domain_name,
          policy_name: data?.policy_name || "Unknown Policy",
        },
        {
          onSuccess: () => {
            toast("success", "Restriction policy deleted successfully");
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

  const RestrictionCard = ({ title, items, icon: Icon, type = "ip" }) => {
    const getItemDisplay = (item) => {
      if (type === "ip") {
        return `${item.ip_address || item}${item.description ? ` - ${item.description}` : ""}`;
      } else if (type === "geo") {
        return `${item.country_code || item.country || item}${item.country_name ? ` (${item.country_name})` : ""}`;
      }
      return item;
    };

    const getItemKey = (item, index) => {
      if (type === "ip" && item.ip_address) {
        return item.ip_address;
      } else if (type === "geo" && item.country_code) {
        return item.country_code;
      }
      return index;
    };

    const isArray = Array.isArray(items);
    const displayItems = isArray ? items : [];

    return (
      <InfoCard icon={Icon} title={title}>
        {displayItems.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayItems.map((item, index) => (
              <div
                key={getItemKey(item, index)}
                className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
              >
                <div className="font-mono break-all text-left flex-1">
                  {getItemDisplay(item)}
                </div>
                {item.is_allowed !== undefined && (
                  <div
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      item.is_allowed
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {item.is_allowed ? "Allowed" : "Blocked"}
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
            {displayItems.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </InfoCard>
    );
  };

  // Memoized computed values for the policy
  const policyStats = useMemo(() => {
    const ipRestrictions = Array.isArray(data?.ip_restriction)
      ? data.ip_restriction
      : [];
    const geoRestrictions = Array.isArray(data?.geo_restriction)
      ? data.geo_restriction
      : [];

    const blockedIPs = ipRestrictions.filter((ip) => !ip.is_allowed).length;
    const allowedIPs = ipRestrictions.filter((ip) => ip.is_allowed).length;
    const blockedGeo = geoRestrictions.filter((geo) => !geo.is_allowed).length;
    const allowedGeo = geoRestrictions.filter((geo) => geo.is_allowed).length;

    return {
      totalIPs: ipRestrictions.length,
      blockedIPs,
      allowedIPs,
      totalGeo: geoRestrictions.length,
      blockedGeo,
      allowedGeo,
      hasIPs: ipRestrictions.length > 0,
      hasGeo: geoRestrictions.length > 0,
    };
  }, [data]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("policy:restriction:view"))
    return (
      <AccessDenied content="You don't have permission to view restriction policy details." />
    );

  if (isError && isServerError)
    return (
      <DataFechError content="Error fetching restriction policy details!" />
    );

  return (
    <>
      <div className="w-full h-full px-2 text-left overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "Restriction Policies",
                  link: "/policies/restrictions",
                },
                { name: "View Restriction Policy" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:restriction:edit") && !isLoading && (
              <Link to={`/policies/restrictions/edit/${restriction_policy_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Policy
                </Button>
              </Link>
            )}

            {permissions?.includes("policy:restriction:delete") &&
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
              <DataLoading content="Loading restriction policy details..." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              {/* Policy Header Card */}
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {data?.policy_name || "Unknown Restriction Policy"}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <CopyButton text={restriction_policy_id} />
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
              <div className={`grid grid-cols-1 md:grid-cols-2 ${data?.policy_description ? "xl:grid-cols-3" : "xl:grid-cols-2"} gap-4`}>
                <InfoCard icon={Globe} title="Domain & Status">
                  <InfoItem
                    label="Domain"
                    value={data?.domain_name || "Not specified"}
                  />
                  <InfoItem
                    label="Status"
                    value={<StatusBadge active={data?.is_active} />}
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

              {/* Detailed Restrictions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RestrictionCard
                  title="IP Restrictions"
                  items={data?.ip_restriction}
                  icon={Network}
                  type="ip"
                />

                <RestrictionCard
                  title="Geographic Restrictions"
                  items={data?.geo_restriction}
                  icon={MapPin}
                  type="geo"
                />
              </div>

              {/* Additional Information Card */}
             

              {/* Empty State Guidance */}
              {!policyStats.hasIPs && !policyStats.hasGeo && (
                <div className="bg-warning/10 border text-left border-warning/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-warning" />
                    <h3 className="text-sm font-medium text-foreground">
                      No Restrictions Configured
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This policy is currently inactive because no IP or
                    geographic restrictions have been configured.
                    {data?.is_active && (
                      <span className="font-semibold text-foreground">
                        {" "}
                        The policy is active but won't enforce any restrictions
                        until rules are added.
                      </span>
                    )}
                  </p>
                  {permissions?.includes("policy:restriction:edit") && (
                    <div className="mt-3">
                      <Link
                        to={`/policies/restrictions/edit/${restriction_policy_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-warning/20 hover:bg-warning/30 text-foreground text-sm font-medium rounded-md transition-colors border border-warning/30"
                      >
                        <Settings className="w-4 h-4" />
                        Configure Restrictions
                      </Link>
                    </div>
                  )}
                </div>
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
        title="Delete Restriction Policy"
        description="This action cannot be undone and will remove all restriction policy data, including all IP and geographic restrictions."
      />
    </>
  );
}

export default ViewRestrictionPolicy;
