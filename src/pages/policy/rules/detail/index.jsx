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
import { useDeleteOutgoingPolicy } from "@/hooks/useFiltersPolicy";
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
  DeleteButton,
  EditButton,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useDeletePolicyRule, useGetPolicyRule } from "@/hooks/usePolicyRules";
import {
  Shield,
  Globe,
  Mail,
  Calendar,
  Info,
  Check,
  X,
  Users,
  FileText,
  Tag,
  Settings,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";

function ViewPolicyRules() {
  const toast = useToastify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { policy_rule_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);
  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useGetPolicyRule({
    organization_id: organization_id,
    rule_id: policy_rule_id,
  });
  const { mutate, isPending } = useDeletePolicyRule();

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id: organization_id, rule_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Policy rule deleted successfully");
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

  const ListCard = ({
    title,
    items,
    icon: Icon,
    emptyMessage = "No entries configured",
  }) => (
    <InfoCard icon={Icon} title={title}>
      {items && items.length > 0 ? (
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
          <span className="text-xs text-muted-foreground">{emptyMessage}</span>
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

  if (!permissions?.includes("policy:rule:view"))
    return (
      <AccessDenied content="Don't have the access to Policy Rules details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Policy Rules details getting error...!" />;

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <Breadcrumbs
            items={[
              { name: "Rules", link: `/policies/rules` },
              { name: "View Rule" },
            ]}
          />
          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("policy:rule:edit") && !isLoading && (
              <Link to={`/policies/rules/edit/${policy_rule_id}`}>
                <EditButton />
              </Link>
            )}
            {permissions?.includes("policy:rule:delete") && !isLoading && (
              <DeleteButton handleClick={() => setShowDeleteModal(true)} />
            )}
            <BackButton />
          </div>
        </div>

        <div className="h-[calc(100vh-150px)] w-full no-scrollbar overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading policy rule details..." />
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
                        {data?.rule_name || "Unknown Rule"}
                      </h1>
                      <p className="text-muted-foreground text-sm text-left">
                        Policy Rule Configuration
                      </p>
                    </div>
                  </div>
                  <StatusBadge active={data?.is_active} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <InfoCard icon={Info} title="Rule Information">
                  <InfoItem
                    label="Rule Type"
                    value={data?.rule_type || "Not specified"}
                  />
                  <InfoItem
                    label="Domain"
                    value={data?.domain_name || "Not specified"}
                  />
                  <InfoItem
                    label="Status"
                    value={data?.is_active ? "Active" : "Inactive"}
                  />
                </InfoCard>

                {data?.rule_description && (
                  <InfoCard icon={FileText} title="Description">
                    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                        {data.rule_description}
                      </p>
                    </div>
                  </InfoCard>
                )}

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
                <ListCard
                  title="Mailboxes"
                  items={data?.mailboxes}
                  icon={Users}
                  emptyMessage="No mailboxes configured"
                />
                <ListCard
                  title="Specific Emails"
                  items={data?.specific_emails}
                  icon={Mail}
                  emptyMessage="No specific emails configured"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(policy_rule_id)}
        value={data?.rule_name || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={data?.rule_name}
        confirmationPlaceholder={`Type "${data?.rule_name}" to confirm`}
        confirmationLabel="Please type the policy rule name exactly to confirm deletion:"
        title="Delete Policy Rule"
        description="This action cannot be undone and will remove all policy rule data."
      />
    </>
  );
}

export default ViewPolicyRules;
