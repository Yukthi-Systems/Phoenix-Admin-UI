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
  useDeleteGeneralPolicy,
  useGeneralPolicyEntry,
} from "@/hooks/useGeneralPolicy";
import {
  Shield,
  Globe,
  Mail,
  Calendar,
  Info,
  Check,
  X,
  Lock,
  Unlock,
  HardDrive,
  Users,
  Settings,
  Trash2,
  SquarePen,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import CopyButton from "@/components/common/CopyId";

function ViewGeneralPolicy() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { general_policy_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);
  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useGeneralPolicyEntry({
    org_id: organization_id,
    policy_id: general_policy_id,
  });
  const { mutate, isPending } = useDeleteGeneralPolicy();

  const OnDelete = () => {
    if (general_policy_id) {
      mutate(
        {
          org_id: organization_id,
          policy_id: general_policy_id,
          domain_name: data?.domain_name,
          policy_name: data?.policy_name ,
        },
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

  const BooleanIndicator = ({ value }) => (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        value
          ? "bg-destructive/10 text-destructive"
          : "bg-success/10 text-success"
      }`}
    >
      {value ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      {value ? "Blocked" : "Allowed"}
    </div>
  );

  const ExceptionCard = ({ title, items, icon: Icon }) => (
    <InfoCard icon={Icon} title={title}>
      {items?.length > 0 ? (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-muted/30 rounded text-xs font-mono break-all text-left"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-muted/20 rounded text-center">
          <span className="text-xs text-muted-foreground">
            No exceptions configured
          </span>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {items?.length || 0} {items?.length === 1 ? "entry" : "entries"}
        </span>
      </div>
    </InfoCard>
  );

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("policy:general:view"))
    return (
      <AccessDenied content="Don't have the access to General policy details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error fetching General policy details!" />;

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "General Policies", link: "/policies/general" },
                { name: "View Policy" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:general:edit") && !isLoading && (
              <Link to={`/policies/general/edit/${general_policy_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Policy
                </Button>
              </Link>
            )}

            {permissions?.includes("policy:general:delete") && !isLoading && (
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
              <DataLoading content="Loading policy details..." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
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
                      <CopyButton text={general_policy_id} />
                      {data?.policy_description && (
                        <p className="text-muted-foreground text-xs text-left mt-1">
                          {data.policy_description}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge active={data?.is_active} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

                <InfoCard icon={Settings} title="Email Restrictions">
                  <InfoItem
                    label="General Block"
                    value={
                      <BooleanIndicator
                        value={data?.block_all_general_emails}
                      />
                    }
                  />
                  <InfoItem
                    label="Outgoing Block"
                    value={
                      <BooleanIndicator
                        value={data?.block_all_outgoing_emails}
                      />
                    }
                  />
                  <InfoItem
                    label="Size Limit"
                    value={
                      data?.outgoing_size_limit_mb
                        ? `${data.outgoing_size_limit_mb} MB`
                        : "No limit"
                    }
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExceptionCard
                  title="Incoming Exception Domains"
                  items={data?.incoming_exception_domains}
                  icon={Globe}
                />
                <ExceptionCard
                  title="Incoming Exception Emails"
                  items={data?.incoming_exception_emails}
                  icon={Mail}
                />
                <ExceptionCard
                  title="Outgoing Exception Domains"
                  items={data?.outgoing_exception_domains}
                  icon={Globe}
                />
                <ExceptionCard
                  title="Outgoing Exception Emails"
                  items={data?.outgoing_exception_emails}
                  icon={Mail}
                />
              </div>
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
      />
    </>
  );
}

export default ViewGeneralPolicy;
