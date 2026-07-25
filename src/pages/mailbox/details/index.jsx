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
import { Link, useNavigate, useParams } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import {
  useDeleteMailbox,
  useGetMailbox,
  useUpdateMailboxPassword,
  useUpdateMailboxSpace,
  useUpdateMailboxStatus,
} from "@/hooks/useMailbox";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import {
  BackButton,
  Button,
  DeleteButton,
  EditButton,
  SubmitButton,
} from "@/components/common/Buttons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataLoading from "@/components/common/DataLoading";
import {
  Mail,
  HardDrive,
  User,
  Globe,
  Check,
  X,
  Database,
  Calendar,
  Contact,
  MailIcon,
  Ruler,
  Scale,
  XCircle,
  CheckCircle,
  ChartPie,
  RectangleEllipsis,
  Trash2,
  ArrowLeft,
  SquarePen,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useToastify } from "@/hooks/useToastify";
import { useMemo, useState } from "react";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import { userInfoAtom } from "@/store/userInfo";
import GetGeneralPolicyName from "@/components/common/GetGeneralPolicyName";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { passwordFormSchema } from "../list/validationSchema";
import { useQueryClient } from "@tanstack/react-query";
import EditModelBox from "@/components/common/EditModelBox";
import { Input, PasswordInput } from "@/components/common/Inputs";
import MailboxQuotaAllocationModal from "../list/QuotaAllocation";
import { domainAtom } from "@/store/domain";
import GetDistributionPolicyName from "@/components/common/GetDistributionPolicyName";
import GetForwardingPolicyName from "@/components/common/GetForwardingPolicyName";
import DropdownButton from "@/components/common/DropdownButton";

const EmailType = [
  { value: "NORMAL", label: "Mailbox" },
  { value: "GROUP", label: "Mail Distribution" },
  { value: "ALIAS", label: "Mail Forwarding" },
];

const MailboxDetails = () => {
  const toast = useToastify();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [spaceValue, setSpaceValue] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [currentMail, setCurrentMailData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordId, setPasswordId] = useState("");
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { email: rawEmail } = useParams();
  const email = decodeURIComponent(rawEmail);
  const domainData = useAtomValue(domainAtom);
  const [email_prefix, domain_name] = email.split("@");
  const { mutate, isPending } = useDeleteMailbox();
  const { formatUserDateNice } = useUserTimezone();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { data: orgDetails } = useGetOrganizationDetail(organization_id);
  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateMailboxStatus();
  const { mutate: spaceUpdate, isPending: spaceLoad } = useUpdateMailboxSpace();
  const { mutate: passwordUpdate, isPending: passwordLoad } =
    useUpdateMailboxPassword();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(passwordFormSchema),
    mode: "onChange",
  });

  const { data, isLoading, isError, error } = useGetMailbox(
    domain_name,
    email_prefix,
  );
  const mailbox_details = data?.mailbox_details ?? null;

  const handleStatus = (row) => {
    setStatusId(row.email);
    setStatusValue(!row.is_enabled);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleSpace = (row) => {
    setSpaceId(row.email);
    setSpaceValue(row.quota_allocated);
    setShowSpaceModal(true);
    setCurrentMailData(row);
  };

  const handleSpaceClose = () => {
    setSpaceId("");
    setSpaceValue("");
    setShowSpaceModal(false);
  };

  const handlePassword = (row) => {
    setPasswordId(row.email);
    setShowPasswordModal(true);
  };

  const handlePasswordClose = () => {
    setPasswordId("");
    setShowPasswordModal(false);
  };

  const OnStatusChange = () => {
    if (statusId) {
      const [email_prefix, domain_name] = statusId.split("@");
      statusUpdate(
        {
          domain_name: domain_name,
          email_prefix: email_prefix,
          status: statusValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully updated mailbox status");
            queryClient.invalidateQueries([
              "mailbox",
              domain_name,
              email_prefix,
            ]);
            setShowStatusModal(false);
            setStatusId("");
            setStatusValue(false);
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
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnSpaceChange = () => {
    if (spaceId) {
      const [email_prefix, domain_name] = spaceId.split("@");
      spaceUpdate(
        {
          domain_name: domain_name,
          email_prefix: email_prefix,
          space: spaceValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully updated mailbox quota");
            queryClient.invalidateQueries([
              "mailbox",
              domain_name,
              email_prefix,
            ]);
            setSpaceId("");
            setSpaceValue("");
            setShowSpaceModal(false);
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
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const onSubmit = (formData) => {
    const [email_prefix, domain_name] = passwordId.split("@");
    let newPassword = btoa(formData.password);
    passwordUpdate(
      { domain_name, email_prefix, password: newPassword },
      {
        onSuccess: () => {
          toast("success", "Successfully password is updated");
          queryClient.invalidateQueries(["mailbox", domain_name, email_prefix]);
          setPasswordId("");
          setShowPasswordModal(false);
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
  };

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { domain_name, email_prefix: deleteId },
        {
          onSuccess: () => {
            toast("success", "Mailbox deleted successfully");
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

  const actionOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("mailbox:edit") && !isLoading && !isError) {
      options.push({
        label: mailbox_details?.is_enabled
          ? "Deactivate Mailbox"
          : "Activate Mailbox",
        description: mailbox_details?.is_enabled
          ? "Deactivate this mailbox"
          : "Activate this mailbox",
        icon: mailbox_details?.is_enabled ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle className="h-4 w-4 text-success" />
        ),
        onClick: () => handleStatus(mailbox_details),
      });

      options.push({
        label: "Manage Quota",
        description: "Adjust storage allocation",
        icon: <ChartPie className="h-4 w-4" />,
        onClick: () => handleSpace(mailbox_details),
      });

      options.push({
        label: "Change Password",
        description: "Update mailbox password",
        icon: <RectangleEllipsis className="h-4 w-4" />,
        onClick: () => handlePassword(mailbox_details),
      });
    }

    if (permissions.includes("mailbox:delete") && !isLoading && !isError) {
      options.push({
        label: "Delete Mailbox",
        description: "Permanently remove this mailbox",
        icon: <Trash2 className="h-4 w-4 text-destructive" />,
        onClick: () => setShowDeleteModal(true),
      });
    }

    return options;
  }, [permissions, isLoading, isError, mailbox_details]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (isError && isServerError)
    return <DataFechError content="Failed to fetch mailbox details." />;
  if (!permissions.includes("mailbox:view"))
    return (
      <AccessDenied content="Don't have the access to view mailbox details." />
    );

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
        value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      }`}
    >
      {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {value ? "Yes" : "No"}
    </div>
  );

  function bytesToGB(bytes = 0) {
    return (bytes / 1024 ** 3).toFixed(2);
  }

  const ListDisplay = ({ items, emptyMessage = "None configured" }) => (
    <div className="space-y-1">
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <div
            key={index}
            className="px-2 py-1 bg-muted/30 rounded text-xs text-left"
          >
            {item}
          </div>
        ))
      ) : (
        <div className="text-xs text-muted-foreground italic text-left">
          {emptyMessage}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full h-full px-2">
        <div className="w-full flex justify-between items-center mb-3 mt-1.5">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Mailbox", link: `/mailbox` },
                { name: "View Mailbox" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions.includes("mailbox:edit") && !isLoading && !isError && (
              <Link to={`/mailbox/edit/${rawEmail}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Mailbox
                </Button>
              </Link>
            )}

            {actionOptions.length > 0 && (
              <DropdownButton
                label="More Actions"
                variant="outline"
                options={actionOptions}
              />
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-140px)] w-full overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading mailbox details." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left font-sans">
                        {mailbox_details?.email}
                      </h1>
                      <p className="text-muted-foreground text-[13px] text-left font-medium">
                        Total Emails :{" "}
                        <span>
                          {mailbox_details?.total_messages_count || 0}
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs text-left">
                        Mailbox Linked to E-Mail Identity
                      </p>
                    </div>
                  </div>
                  <StatusBadge active={mailbox_details?.is_enabled} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <InfoCard icon={HardDrive} title="Storage Quota">
                  <InfoItem
                    label="Allocated"
                    value={`${mailbox_details?.quota_allocated || 0} GB`}
                  />
                  <InfoItem
                    label="Utilized"
                    value={`${bytesToGB(mailbox_details?.quota_utilized_bytes) || 0} GB`}
                  />
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="text-left">Usage</span>
                      <span className="text-right">
                        {mailbox_details?.quota_allocated > 0
                          ? Math.round(
                              (bytesToGB(
                                mailbox_details?.quota_utilized_bytes,
                              ) /
                                mailbox_details.quota_allocated) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            mailbox_details?.quota_allocated > 0
                              ? Math.min(
                                  (bytesToGB(
                                    mailbox_details?.quota_utilized_bytes,
                                  ) /
                                    mailbox_details.quota_allocated) *
                                    100,
                                  100,
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Globe} title="Domain">
                  <InfoItem
                    label="Domain"
                    value={mailbox_details?.domain_name || ""}
                  />

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Database className="w-3.5 h-3.5" />
                      <span className="text-left font-medium">Domain Mailbox</span>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Globe} title="Policy Information">
                  <InfoItem
                    label="General Policy"
                    value={
                      (mailbox_details?.general_policy_id && (
                        <Link
                          to={`/policies/general/${mailbox_details?.general_policy_id}`}
                        >
                          <GetGeneralPolicyName
                            organization_id={organization_id}
                            id={mailbox_details?.general_policy_id}
                          />
                        </Link>
                      )) ||
                      "Not assigned"
                    }
                  />


                  <InfoItem
                    label="Distribution Policy"
                    value={
                      (mailbox_details?.distribution_policy_id && (
                        <Link
                          to={`/policies/distribution/${mailbox_details?.distribution_policy_id}`}
                        >
                          <GetDistributionPolicyName
                            organization_id={organization_id}
                            id={mailbox_details?.distribution_policy_id}
                          />
                        </Link>
                      )) ||
                      "Not assigned"
                    }
                  />

                  <InfoItem
                    label="Forwarding Policy"
                    value={
                      (mailbox_details?.forwarding_policy_id && (
                        <Link
                          to={`/policies/forwarding/${mailbox_details?.forwarding_policy_id}`}
                        >
                          <GetForwardingPolicyName
                            organization_id={organization_id}
                            id={mailbox_details?.forwarding_policy_id}
                          />
                        </Link>
                      )) ||
                      "Not assigned"
                    }
                  />
                </InfoCard>
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(email_prefix)}
        value={mailbox_details?.email || " email address"}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={mailbox_details?.email || "email address"}
        confirmationPlaceholder={`Type "${mailbox_details?.email || "email address"}" to confirm`}
        confirmationLabel="Please type the email address exactly to confirm deletion:"
        title="Delete Mailbox"
        description="This action cannot be undone and will remove all mailbox data."
      />

      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={handleStatusClose}
        >
          <div className="w-xl">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want{" "}
              <>
                {statusValue ? (
                  <span className="font-medium text-green-400">Active</span>
                ) : (
                  <span className="font-medium text-red-400">In-active</span>
                )}
              </>{" "}
              {statusId} .
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                className="rounded-lg border p-2 text-sm font-medium"
                disabled={statusLoad}
                onClick={handleStatusClose}
              >
                Cancel
              </button>
              <button
                className={`rounded-lg border p-2 text-sm font-medium ${statusValue ? "border-green-300 text-green-400" : "border-red-300 text-red-400"}`}
                disabled={statusLoad}
                onClick={OnStatusChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </EditModelBox>
      )}

      {showSpaceModal && (
        <MailboxQuotaAllocationModal
          showSpaceModal={showSpaceModal}
          handleSpaceClose={handleSpaceClose}
          spaceValue={spaceValue}
          setSpaceValue={setSpaceValue}
          spaceLoad={spaceLoad}
          OnSpaceChange={OnSpaceChange}
          domainData={orgDetails}
          mailData={currentMail}
        />
      )}


    </>
  );
};

export default MailboxDetails;
