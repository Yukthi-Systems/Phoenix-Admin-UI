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
import { useParams, useNavigate, Link } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useGetIdentity, useDeleteIdentity, useUpdateIdentityPassword } from "@/hooks/useIdentities";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EditModelBox from "@/components/common/EditModelBox";
import { PasswordInput } from "@/components/common/Inputs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import {
  BackButton,
  Button,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useToastify } from "@/hooks/useToastify";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building,
  Calendar,
  User,
  Mail,
  Phone,
  SquarePen,
  Trash2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import CopyButton from "@/components/common/CopyId";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import StatusBadge from "@/components/common/StatusBadge";
import GetDepartmentName from "@/components/common/GetDepartmentName";

const IdentityDetails = () => {
  const { email } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { mutate: updatePassword, isPending: passwordPending } = useUpdateIdentityPassword();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    defaultValues: {
      password: "",
      confirm_password: "",
    },
    resolver: yupResolver(
      yup.object().shape({
        password: yup
          .string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters"),
        confirm_password: yup
          .string()
          .oneOf([yup.ref("password"), null], "Passwords must match")
          .required("Confirm password is required"),
      })
    ),
    mode: "onChange",
  });

  const onPasswordSubmit = (formData) => {
    updatePassword(
      {
        domain_name,
        email_prefix,
        password: btoa(formData.password),
      },
      {
        onSuccess: () => {
          toast("success", "Successfully updated identity password");
          setShowPasswordModal(false);
          resetPasswordForm();
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          toast("error", `Failed to update password: ${message}`);
        },
      }
    );
  };

  const [email_prefix, domain_name] = email ? email.split("@") : ["", ""];

  const { data, isLoading, isError, error } = useGetIdentity(
    domain_name,
    email_prefix,
  );
  
  const identity = data?.data || {};
  const { mutate, isPending } = useDeleteIdentity();

  const OnDelete = () => {
    if (email) {
      mutate(
        { domain_name, email_prefix, identity_name: email },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted identity");
            navigate("/identities");
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
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("identity:view"))
    return (
      <AccessDenied content="Don't have access to view identity details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Identity details getting error...!" />;

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "Identity Management",
                  link: `/identities`,
                },
                {
                  name: "View E-Mail Identity",
                },
              ]}
            />
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("identity:edit") && !isLoading && (
              <Button
                variant="outline"
                icon={Lock}
                onClick={() => {
                  resetPasswordForm();
                  setShowPasswordModal(true);
                }}
              >
                Change Password
              </Button>
            )}

            {permissions?.includes("identity:edit") && !isLoading && (
              <Link to={`/identities/edit/${encodeURIComponent(email)}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Identity
                </Button>
              </Link>
            )}

            {permissions?.includes("identity:delete") && !isLoading && (
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

        <div className="h-[calc(100vh-150px)] overflow-y-auto w-full no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading identity details." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/15 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-card-foreground text-left">
                      {identity?.email || email}
                    </h1>
                    <CopyButton text={identity?.email} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Personal Info */}
                <InfoCard icon={User} title="Personal Details">
                  <InfoItem label="First Name" value={identity.first_name || "--"} />
                  <InfoItem label="Last Name" value={identity.last_name || "--"} />
                  <InfoItem label="Status" value={<StatusBadge status={identity.is_enabled ?? true} />} />
                </InfoCard>

                {/* Contact Info */}
                <InfoCard icon={Mail} title="Contact Details">
                  <InfoItem label="Primary Phone" value={identity.primary_phone || "--"} />
                  <InfoItem label="Secondary Email" value={identity.secondary_email || "--"} />
                </InfoCard>

                {/* Security and 2FA */}
                <InfoCard icon={ShieldCheck} title="Two-Factor Authentication">
                  <InfoItem
                    label="App-Based 2FA"
                    value={
                      <span className={`text-sm font-semibold ${identity.is_app_2fa_enabled ? "text-success" : "text-muted-foreground"}`}>
                        {identity.is_app_2fa_enabled ? "Enabled" : "Disabled"}
                      </span>
                    }
                  />
                  <InfoItem
                    label="SMS-Based 2FA"
                    value={
                      <span className={`text-sm font-semibold ${identity.is_sms_2fa_enabled ? "text-success" : "text-muted-foreground"}`}>
                        {identity.is_sms_2fa_enabled ? "Enabled" : "Disabled"}
                      </span>
                    }
                  />
                  <InfoItem
                    label="Email-Based 2FA"
                    value={
                      <span className={`text-sm font-semibold ${identity.is_email_2fa_enabled ? "text-success" : "text-muted-foreground"}`}>
                        {identity.is_email_2fa_enabled ? "Enabled" : "Disabled"}
                      </span>
                    }
                  />
                </InfoCard>

                {/* Policy and Restrictions */}
                <InfoCard icon={Lock} title="Policy & Security">
                  <InfoItem
                    label="Restriction Policy ID"
                    value={identity.restriction_policy_id || "None"}
                    link={identity.restriction_policy_id ? `/policies/restrictions/${identity.restriction_policy_id}` : null}
                  />
                  <InfoItem
                    label="Password Expired"
                    value={identity.is_password_expired ? "Yes" : "No"}
                  />
                </InfoCard>

                {/* Department */}
                <InfoCard icon={Building} title="Department">
                  <InfoItem
                    label="Department"
                    value={
                      identity.department_id ? (
                        <GetDepartmentName
                          organization_id={organization_id}
                          id={identity.department_id}
                        />
                      ) : (
                        "Not assigned"
                      )
                    }
                  />
                </InfoCard>

                {/* Timeline */}
                <InfoCard icon={Calendar} title="Timeline Information">
                  {identity?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(identity.created_at)}
                    />
                  )}
                  {identity?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(identity.updated_at)}
                    />
                  )}
                  {identity?.password_updated_at && (
                    <InfoItem
                      label="Password Updated"
                      value={formatUserDateNice(identity.password_updated_at)}
                    />
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
        handleDelete={OnDelete}
        value={identity?.email || email || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={identity?.email || email || ""}
        confirmationPlaceholder={`Type "${identity?.email || email || ""}" to confirm`}
        confirmationLabel="Please type the email exactly to confirm deletion:"
        title="Delete E-Mail Identity"
        description="This action cannot be undone and will permanently delete this identity."
      />

      <EditModelBox
        isOpen={showPasswordModal}
        label="Change Password"
        handleCancel={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }}
      >
        <form
          onSubmit={handleSubmitPassword(onPasswordSubmit)}
          className="w-[380px] space-y-4 p-1 text-left"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Enter a new password for <span className="font-semibold text-foreground">{identity?.email || email}</span>.
          </p>
          <PasswordInput
            label="New Password"
            name="password"
            register={registerPassword}
            errors={passwordErrors}
            placeholder="Enter new password"
            isRequired={true}
          />
          <PasswordInput
            label="Confirm New Password"
            name="confirm_password"
            register={registerPassword}
            errors={passwordErrors}
            placeholder="Confirm new password"
            isRequired={true}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={passwordPending}
              onClick={() => {
                setShowPasswordModal(false);
                resetPasswordForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={passwordPending}
            >
              {passwordPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </EditModelBox>
    </>
  );
};

export default IdentityDetails;
