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
  useDeleteFiltersPolicy,
  useFiltersPolicyEntry,
} from "@/hooks/useFiltersPolicy";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToastify } from "@/hooks/useToastify";
import { useState } from "react";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, Button } from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import {
  Shield,
  Globe,
  Calendar,
  Check,
  X,
  List,
  CheckCircle,
  Ban,
  Settings,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import CopyButton from "@/components/common/CopyId";

function ViewFiltersPolicy() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { filters_policy_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);
  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useFiltersPolicyEntry({
    org_id: organization_id,
    policy_id: filters_policy_id,
  });
  const { mutate, isPending } = useDeleteFiltersPolicy();

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { org_id: organization_id, policy_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Policy deleted successfully");
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

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("policy:filters:view"))
    return (
      <AccessDenied content="Don't have the access to Filters Policy details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Filters Policy details getting error...!" />;

  // Helper for rendering list items
  const EntryList = ({ entries, type }) => {
    if (!entries || entries.length === 0) {
      return (
        <div className="bg-muted/30 border border-border rounded-md p-6 text-center transition-colors">
          <p className="text-sm text-muted-foreground font-medium italic">
            No {type} entries configured
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {entries.map((entry, index) => (
          <div
            key={`${entry}-${index}`}
            className={`
              group flex items-center gap-3 p-2.5 rounded-md border text-sm font-mono break-all transition-all
              ${
                type === "allowed"
                  ? "bg-card border-success/20 hover:border-success/50"
                  : "bg-card border-destructive/20 hover:border-destructive/50"
              }
            `}
          >
            <div className="flex-shrink-0">
              {type === "allowed" ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Ban className="w-4 h-4 text-destructive" />
              )}
            </div>
            <span className="text-foreground leading-tight">{entry}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Filters Policies", link: `/policies/filters` },
                { name: "View Policy" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:filters:edit") && !isLoading && (
              <Link to={`/policies/filters/edit/${filters_policy_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Policy
                </Button>
              </Link>
            )}

            {permissions?.includes("policy:filters:delete") && !isLoading && (
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
        <div className="h-[calc(100vh-150px)] w-full no-scrollbar overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading policy details..." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {data?.policy_name || "Unknown Policy"}
                      </h1>
                      <CopyButton text={filters_policy_id} />
                    </div>
                  </div>
                  <StatusBadge active={data?.is_active} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Allowed List */}
                <InfoCard
                  icon={CheckCircle}
                  title="Allowed List (White Entries)"
                  className="w-full border-success/20"
                  iconClassName="text-success"
                >
                  <EntryList entries={data?.white_entries} type="allowed" />
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-end">
                    <span className="text-xs text-muted-foreground">
                      Total: {data?.white_entries?.length || 0}
                    </span>
                  </div>
                </InfoCard>

                {/* Blocked List */}
                <InfoCard
                  icon={Ban}
                  title="Blocked List (Black Entries)"
                  className="w-full border-destructive/20"
                  iconClassName="text-destructive"
                >
                  <EntryList entries={data?.black_entries} type="blocked" />
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-end">
                    <span className="text-xs text-muted-foreground">
                      Total: {data?.black_entries?.length || 0}
                    </span>
                  </div>
                </InfoCard>
              </div>

              {!data?.white_entries?.length && !data?.black_entries?.length && (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <List className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">
                    No Entries Configured
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This filters policy doesn't have any allowed or blocked
                    entries configured yet.
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
        handleDelete={() => OnDelete(filters_policy_id)}
        value={data?.policy_name || ""}
        isLoading={isPending}
      />
    </>
  );
}

export default ViewFiltersPolicy;
