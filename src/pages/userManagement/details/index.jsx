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
import { userInfoAtom } from "@/store/userInfo";
import { useDeleteUser, useGetUser } from "@/hooks/useUser";
import UserPermissionDisplay from "./UserPermissionDisplay";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import {
  BackButton,
  Button,
  DeleteButton,
  EditButton,
} from "@/components/common/Buttons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataLoading from "@/components/common/DataLoading";
import { useEffect, useMemo, useState } from "react";
import { useToastify } from "@/hooks/useToastify";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import {
  User,
  Mail,
  Phone,
  Shield,
  Globe,
  Calendar,
  Info,
  Check,
  X,
  Settings,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  UserCheck,
  BadgeCheck,
  BadgeAlert,
  ShieldEllipsis,
  MoveRight,
  SquarePen,
  Trash2,
  RectangleEllipsis,
} from "lucide-react";
import EditModelBox from "@/components/common/EditModelBox";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import {
  useEnableDisableEmailAuth,
  useEnableDisablePhoneAuth,
  useEnableDisableTFA,
  useGenerateEmailOTP,
  useGeneratePhoneOTP,
  useGenerateQR,
  useValidateEmailOTP,
  useValidatePhoneOTP,
  useValidateTFA,
} from "@/hooks/useTFA";
import ResendButtonWithTimer from "@/components/common/ResendButtonWithTimer";
import OTPInput from "react-otp-input";
import { useQueryClient } from "@tanstack/react-query";
import ViewTFA from "./steps/ViewTFA";
import StepCreateValue from "@/pages/profile/twoFactAuthSteps/StepCreateValue";
import StepQRCode from "@/pages/profile/twoFactAuthSteps/StepQRCode";
import StepConfirmation from "@/pages/profile/twoFactAuthSteps/StepConfirmation";
import BackupCode from "./BackupCode";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import ProfilePicture from "@/pages/profile/ProfilePic";
import UserPermissionModal from "./UserPermissionDisplay";
import ChangePassword from "../list/ChangePassword";
import ChangePermission from "../list/ChangePermission";
import DropdownButton from "@/components/common/DropdownButton";

const UserDetails = () => {
  const { user_id: rawUserId } = useParams();
  const {
    permissions,
    display_name,
    user_id: userID,
  } = useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const { data: orgDetail } = useGetOrganizationDetail(organization_id);
  const user_id = decodeURIComponent(rawUserId);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate, isPending } = useDeleteUser();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetUser(organization_id, user_id);
  const { mutate: generateEmailOTP, isPending: isEmailOTPLoading } =
    useGenerateEmailOTP();
  const { mutate: generatePhoneOTP, isPending: isPhoneOTPLoading } =
    useGeneratePhoneOTP();
  const { mutate: validateTFA, isPending: isTFALoading } = useValidateTFA();
  const { mutate: validateEmailOTP } = useValidateEmailOTP();
  const { mutate: validatePhoneOTP } = useValidatePhoneOTP();
  const { mutate: enableTFA } = useEnableDisableTFA();
  const { mutate: enableEmailAuth } = useEnableDisableEmailAuth();
  const { mutate: enablePhoneAuth } = useEnableDisablePhoneAuth();
  const user_details = data?.user_details ?? null;
  const [openEmail, setOpenEmail] = useState(false);
  const [verifyType, setVerifyType] = useState("authenticator");
  const [otp, setOtp] = useState("");
  const [orgName, setOrgName] = useState("");
  const [openAuth, setOpenAuth] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTypeValue, setSelectedTypeValue] = useState("");
  const { mutate: generateQR, isPending: qpPending } = useGenerateQR();
  const [qrData, setQrData] = useState({ uri: "", secret: "" });
  const [qrCodeType, setQrCodeType] = useState("qr");
  const [showBackup, setShowBackup] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [changePasswordId, setChangePasswordId] = useState("");
  const [changePasswordName, setChangePasswordName] = useState("");
  const [changePermission, setChangePermission] = useState(false);
  const [changePermissionId, setChangePermissionId] = useState("");

  const handleBackupClick = () => {
    setShowBackup(true);
  };

  const handleGenQR = () => {
    generateQR(
      {
        orgId: organization_id,
        user_id,
        queryParams: { totp_name: selectedTypeValue },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "QR generated");
          setQrData({
            uri: res?.totp_uri || "",
            secret: res?.totp_secret_key || "",
          });
          setStep(2);
        },
        onError: handleError,
      },
    );
  };

  const handleError = (error) => {
    const message =
      error?.response?.data?.message || error.message || "Unknown error";
    const tracebackId = error?.response?.data?.traceback_id;
    toast(
      "error",
      `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
    );
  };

  const handleVerifyAuth = (verifyType) => {
    const queryParams = {
      user_display_name: user_details?.display_name,
      org_name: orgName,
    };

    const handlerMap = {
      email: () =>
        generateEmailOTP(
          {
            orgId: organization_id,
            user_id: user_details?.user_id,
            queryParams,
            userName: user_details?.display_name,
          },
          {
            onSuccess: () => {
              toast("success", "Email verification sent");
            },
            onError: handleError,
          },
        ),
      sms: () =>
        generatePhoneOTP(
          {
            orgId: organization_id,
            user_id: user_details?.user_id,
            queryParams,
            userName: user_details?.display_name,
          },
          {
            onSuccess: () => {
              toast("success", "SMS verification sent");
            },
            onError: handleError,
          },
        ),
    };

    handlerMap[verifyType.toLocaleLowerCase()]?.();
  };

  const handleVerifyClick = () => {
    let UpperCase = otp.toUpperCase();
    if (otp.length !== 6) return toast("error", "Please enter a valid OTP");

    const queryParams =
      verifyType.toLocaleLowerCase() === "authenticator"
        ? { totp_code: UpperCase }
        : { otp_code: UpperCase };

    const onSuccess = () => {
      toast("success", "Verification Successful.");
      setOtp("");
      queryClient.invalidateQueries({
        queryKey: ["user", organization_id, user_id],
      });
      setStep(4);
      setOpenEmail(false);
    };

    const userName = user_details?.display_name;
    const handlerMap = {
      authenticator: () =>
        validateTFA({ queryParams }, { onSuccess, onError: handleError }),
      email: () =>
        validateEmailOTP(
          { orgId: organization_id, user_id, queryParams, userName },
          { onSuccess, onError: handleError },
        ),
      sms: () =>
        validatePhoneOTP(
          { orgId: organization_id, user_id, queryParams, userName },
          { onSuccess, onError: handleError },
        ),
    };

    handlerMap[verifyType.toLocaleLowerCase()]?.();
  };

  const handleOpenVerifyItem = (type) => {
    if (permissions.includes("user:edit")) {
      setVerifyType(type);
      handleVerifyAuth(type);
      setOpenEmail(true);
    }
  };

  const OnDelete = (deleteId) => {
    const queryParams = {
      user_id: deleteId,
    };
    if (deleteId) {
      mutate(
        { orgId: organization_id, queryParams },
        {
          onSuccess: () => {
            toast("success", "User deleted successfully");
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

  const handleOpenAuth = () => {
    setOpenAuth(true);
  };

  const handleDisableTFA = () => {
    enableTFA(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: false },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          getUserData();
          toast("success", res?.message || "2FA disabled");
        },
        onError: handleError,
      },
    );
  };

  const handleEnableTFA = () => {
    enableTFA(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: true },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          getUserData();
          toast("success", res?.message || "2FA enabled");
        },
        onError: handleError,
      },
    );
  };

  const handleDisableEmail = () => {
    enableEmailAuth(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: false },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
        },
        onError: handleError,
      },
    );
  };

  const handleEnableEmail = () => {
    enableEmailAuth(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: true },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
        },
        onError: handleError,
      },
    );
  };

  const handleDisablePhone = () => {
    enablePhoneAuth(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: false },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
        },
        onError: handleError,
      },
    );
  };

  const handleEnablePhone = () => {
    enablePhoneAuth(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: true },
        userName: user_details?.display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
        },
        onError: handleError,
      },
    );
  };

  const handleComplete = () => {
    handleEnableTFA();
    getUserData();
    setOtp("");
    setOpenAuth(false);
    setOpenAuth(false);
  };

  function getUserData() {
    queryClient.invalidateQueries({
      queryKey: ["user", organization_id, user_id],
    });
    setOpenAuth(false);
    setOpenEmail(false);
  }

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

  const InfoEmailItem = ({ label, value, sublabel, type = "" }) => (
    <div className="flex items-center justify-between py-1 ">
      <span className="text-sm text-muted-foreground min-w-0 flex-1 text-left">
        {label}:
      </span>
      <div className="text-right min-w-0 flex flex-end items-center gap-2">
        <span className="text-sm font-medium text-card-foreground block text-right">
          {value}
        </span>
        {sublabel == true ? (
          <span>
            <BadgeCheck className=" w-4 h-4 text-green-400" />
          </span>
        ) : (
          <span
            onClick={() => handleOpenVerifyItem(type)}
            className=" cursor-pointer"
            title="Email not verified"
          >
            <BadgeAlert className=" w-4 h-4 text-red-400" />
          </span>
        )}
      </div>
    </div>
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

  const VerificationBadge = ({ verified, label }) => (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        verified
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {verified ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {label}
    </div>
  );

  const TwoFAIndicator = ({ enabled, type }) => (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        enabled
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {enabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      {type} {enabled ? "Enabled" : "Disabled"}
    </div>
  );

  useEffect(() => {
    setOrgName(orgDetail?.organization_name || "");
  }, [orgDetail]);

  const handleOpen = (user) => {
    setChangePasswordId(user?.user_id);
    setChangePasswordName(user?.display_name || user?.user_name);
    setChangePassword(true);
  };

  const closePassword = () => {
    setChangePassword(false);
    setChangePasswordId("");
    setChangePasswordName("");
  };

  const handleOpenPermission = (user) => {
    setChangePermissionId(user?.user_id);
    setChangePasswordName(user?.display_name || user?.user_name);
    setChangePermission(true);
  };

  const closePermission = () => {
    setChangePermission(false);
    setChangePermission("");
    setChangePasswordName("");
  };

  const actionOptions = useMemo(() => {
    const options = [];

    if (
      permissions?.includes("user:edit") &&
      user_details?.user_id !== userID &&
      !isLoading
    ) {
      options.push({
        label: "Change Password",
        description: "Update user password",
        icon: <RectangleEllipsis className="h-4 w-4" />,
        onClick: () => handleOpen(user_details),
      });

      options.push({
        label: "Change Permission",
        description: "Modify user permissions",
        icon: <Shield className="h-4 w-4" />,
        onClick: () => handleOpenPermission(user_details),
      });
    }

    if (
      permissions?.includes("user:delete") &&
      user_details?.user_id !== userID &&
      !isLoading
    ) {
      options.push({
        label: "Delete User",
        description: "Permanently remove this user",
        icon: <Trash2 className="h-4 w-4 text-destructive" />,
        onClick: () => setShowDeleteModal(true),
      });
    }

    return options;
  }, [permissions, user_details, userID, isLoading]);

  if (!permissions?.includes("user:view"))
    return <AccessDenied content="Don't have the access to user details." />;

  if (isError)
    return <DataFechError content="User details getting error...!" />;

  const stepThree = () => {
    setStep(3);
  };

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "User Management",
                  link: `/user`,
                },
                {
                  name: "View User",
                },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("user:edit") &&
              user_details?.user_id !== userID &&
              !isLoading && (
                <Link to={`/user/edit/${user_details?.user_id}`}>
                  <Button variant="primary" icon={SquarePen}>
                    Edit User
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

        <div className="h-[calc(100vh-150px)] w-full overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading user details..." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProfilePicture
                      size="small"
                      showBorder
                      showUpload={false}
                      organizationId={organization_id}
                      userId={user_details?.user_id}
                      displayName={user_details?.display_name}
                      isActive={user_details?.is_active}
                      showStatus={false}
                      className="flex-shrink-0"
                      viewFullScreen
                    />

                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {user_details?.display_name || "Unknown User"}
                      </h1>
                      <p className="text-muted-foreground text-sm text-left">
                        @{user_details?.user_name || "username"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge active={user_details?.is_active} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <InfoCard icon={User} title="Basic Information">
                  <InfoItem
                    label="Username"
                    value={user_details?.user_name || "Not specified"}
                  />
                  <InfoItem
                    label="Display Name"
                    value={user_details?.display_name || "Not specified"}
                  />
                  <InfoItem
                    label="Status"
                    value={user_details?.is_active ? "Active" : "Inactive"}
                  />
                </InfoCard>

                <InfoCard icon={Mail} title="Contact Information">
                  <InfoEmailItem
                    label="Email"
                    value={user_details?.user_email || "Not specified"}
                    sublabel={
                      user_details?.is_email_verified || "Not specified"
                    }
                    type="Email"
                  />
                  <InfoEmailItem
                    label="Phone"
                    value={user_details?.primary_phone || "Not specified"}
                    sublabel={
                      user_details?.is_phone_verified || "Not specified"
                    }
                    type="SMS"
                  />
                  {user_details?.user_details?.other_email && (
                    <InfoItem
                      label="Other Email"
                      value={user_details.user_details.other_email}
                    />
                  )}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-1">
                      <VerificationBadge
                        verified={user_details?.is_email_verified}
                        label="Email"
                      />
                      <VerificationBadge
                        verified={user_details?.is_phone_verified}
                        label="Phone"
                      />
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Shield} title="Security Settings">
                  <div className="space-y-2">
                    {/* TOTP */}
                    <div className="w-full flex justify-between items-center">
                      <TwoFAIndicator
                        enabled={user_details?.is_totp_2fa_active}
                        type="TOTP"
                      />
                      {permissions?.includes("user:security:2fa:totp:edit") && (
                        <div>
                          <span
                            onClick={handleOpenAuth}
                            className="text-sm font-medium px-3 py-1 bg-accent text-accent-foreground rounded-md cursor-pointer"
                          >
                            Manage TOTP
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SMS */}
                    <div className="w-full flex justify-between items-center">
                      <TwoFAIndicator
                        enabled={user_details?.is_sms_2fa_active}
                        type="SMS"
                      />
                      {permissions?.includes(
                        "user:security:2fa:sms_phone:edit",
                      ) && (
                        <div>
                          {user_details?.is_sms_2fa_active === true &&
                          user_details?.is_phone_verified === true ? (
                            <span
                              onClick={handleDisablePhone}
                              className="text-sm font-medium px-3 py-1 bg-destructive/15 text-destructive rounded-md cursor-pointer"
                            >
                              Disable SMS 2FA
                            </span>
                          ) : user_details?.is_sms_2fa_active === false &&
                            user_details?.is_phone_verified === true ? (
                            <span
                              onClick={handleEnablePhone}
                              className="text-sm font-medium px-3 py-1 bg-success/15 text-success rounded-md cursor-pointer"
                            >
                              Enable SMS 2FA
                            </span>
                          ) : (
                            <span
                              onClick={() => handleOpenVerifyItem("SMS")}
                              className="text-sm font-medium px-3 py-1 bg-accent text-accent-foreground rounded-md cursor-pointer"
                            >
                              Verify Phone
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="w-full flex justify-between items-center">
                      <TwoFAIndicator
                        enabled={user_details?.is_email_2fa_active}
                        type="Email"
                      />
                      {permissions?.includes(
                        "user:security:2fa:email:edit",
                      ) && (
                        <div>
                          {user_details?.is_email_2fa_active === true &&
                          user_details?.is_email_verified === true ? (
                            <span
                              onClick={handleDisableEmail}
                              className="text-sm font-medium px-3 py-1 bg-destructive/15 text-destructive rounded-md cursor-pointer"
                            >
                              Disable Email 2FA
                            </span>
                          ) : user_details?.is_email_2fa_active === false &&
                            user_details?.is_email_verified === true ? (
                            <span
                              onClick={handleEnableEmail}
                              className="text-sm font-medium px-3 py-1 bg-success/15 text-success rounded-md cursor-pointer"
                            >
                              Enable Email 2FA
                            </span>
                          ) : (
                            <span
                              onClick={() => handleOpenVerifyItem("Email")}
                              className="text-sm font-medium px-3 py-1 bg-accent text-accent-foreground rounded-md cursor-pointer"
                            >
                              Verify Email
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {permissions?.includes("user:security:2fa:totp:edit") && (
                    <div className="mt-1 pt-1 ">
                      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                        <span className="text-left">Backup code</span>
                        <span
                          onClick={handleBackupClick}
                          className="text-sm font-medium px-3 py-1 bg-accent text-accent-foreground rounded-md cursor-pointer"
                        >
                          Generate
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-1 pt-1 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-left">
                        Two-factor authentication status
                      </span>
                    </div>
                  </div>
                </InfoCard>

                {(user_details?.user_details?.locale ||
                  user_details?.user_details?.timezone) && (
                  <InfoCard icon={Globe} title="Preferences">
                    {user_details?.user_details?.locale && (
                      <InfoItem
                        label="Locale"
                        value={user_details.user_details.locale}
                      />
                    )}
                    {user_details?.user_details?.timezone && (
                      <InfoItem
                        label="Timezone"
                        value={user_details.user_details.timezone}
                      />
                    )}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="text-left">Regional preferences</span>
                      </div>
                    </div>
                  </InfoCard>
                )}
              </div>

              {user_details?.permissions &&
                user_details.permissions.length > 0 && (
                  <div className="space-y-4">
                    <InfoCard
                      icon={Settings}
                      title="User Permissions"
                      className="w-full"
                    >
                      {/* <UserPermissionDisplay permissions={user_details.permissions} /> */}

                      <button
                        className="text-primary hover:bg-transparent hover:text-primary hover:underline transition duration-150"
                        onClick={() => setShowPermissionModal(true)}
                      >
                        <b>View Permissions</b>
                      </button>
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {user_details.permissions.length} permissions assigned
                        </span>
                      </div>
                    </InfoCard>
                  </div>
                )}

              {(!user_details?.permissions ||
                user_details.permissions.length === 0) && (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">
                    No Permissions Assigned
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This user doesn't have any permissions assigned yet.
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
        handleDelete={() => OnDelete(user_details?.user_id)}
        value={user_details?.user_name || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={user_details?.user_name}
        confirmationPlaceholder={`Type "${user_details?.user_name}" to confirm`}
        confirmationLabel="Please type the username exactly to confirm deletion:"
        title="Delete User"
        description="This action cannot be undone and will remove all user data."
      />

      {openEmail && (
        <EditModelBox
          isOpen={openEmail}
          label=""
          handleCancel={() => setOpenEmail(false)}
        >
          <div className="flex-1  overflow-y-auto no-scrollbar flex flex-col items-center gap-2 py-2">
            <div className=" mx-auto  w-20 h-20 bg-primary/20 rounded-full flex justify-center items-center text-primary">
              <ShieldEllipsis size={45} />
            </div>
            <h2 className="mx-auto w-8/12 text-center  text-lg">
              Please enter the 6-digit{" "}
              {verifyType.toLocaleLowerCase() == "authenticator"
                ? " code generated by your Authenticator app"
                : verifyType.toLocaleLowerCase() == "email"
                  ? "send to your Email"
                  : "send to your Mobile Number"}
              .
            </h2>
            <div className="flex justify-center mt-3">
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                isInputNum
                shouldAutoFocus
                renderInput={(props) => <input {...props} />}
                inputStyle={{
                  width: "3rem",
                  height: "3rem",
                  margin: "0 0.5rem",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outlineColor: "#8169c9",
                  textTransform: "uppercase",
                }}
              />
            </div>

            {verifyType !== "authenticator" && (
              <div className=" flex justify-end items-center w-full">
                <ResendButtonWithTimer
                  onResend={() =>
                    handleVerifyAuth(verifyType.toLocaleLowerCase())
                  }
                  initialTimer={120}
                />
              </div>
            )}
            <div className="w-full h-10 flex justify-center items-center">
              <button
                className={` ${isPending ? "bg-primary/30" : "bg-primary"} w-10/12   font-medium cursor-pointer text-white px-4 py-2 rounded  `}
                onClick={handleVerifyClick}
              >
                Verify
              </button>
            </div>
          </div>
        </EditModelBox>
      )}
      {openAuth && (
        <EditModelBox
          isOpen={openAuth}
          label=""
          handleCancel={() => setOpenAuth(false)}
        >
          {permissions?.includes("user:security:2fa:totp:edit") && (
            <div className="w-[75vw] h-[61vh] overflow-y-auto">
              {step == 0 ? (
                <ViewTFA
                  isTOTPAuth={user_details?.is_totp_2fa_active}
                  onCancel={() => setOpenAuth(false)}
                  onEnTOTP={handleEnableTFA}
                  onDisTOTP={handleDisableTFA}
                  setHasActive={() => setStep(1)}
                  userName={user_details?.display_name}
                />
              ) : step == 1 ? (
                <StepCreateValue
                  onNext={handleGenQR}
                  isPending={isPending}
                  selectedTypeValue={selectedTypeValue}
                  setSelectedTypeValue={setSelectedTypeValue}
                  onPrev={() => setStep(0)}
                />
              ) : step == 2 ? (
                <StepQRCode
                  qrData={qrData}
                  qrCodeType={qrCodeType}
                  setQrCodeType={setQrCodeType}
                  onNext={stepThree}
                />
              ) : step == 3 ? (
                <StepConfirmation activeStatus={true} onNext={handleComplete} />
              ) : null}
            </div>
          )}
        </EditModelBox>
      )}
      {showBackup && (
        <BackupCode
          isOpen={showBackup}
          setIsOpen={setShowBackup}
          name={user_details?.user_name}
          user_id={user_details?.user_id}
        />
      )}

      <UserPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        permissions={user_details?.permissions}
      />

      {changePasswordId && changePassword && (
        <ChangePassword
          changePassword={changePassword}
          closePassword={closePassword}
          user_id={changePasswordId}
          user_name={changePasswordName}
        />
      )}

      {changePermissionId && changePermission && (
        <ChangePermission
          user_id={changePermissionId}
          closePermission={closePermission}
          changePermission={changePermission}
          user_name={changePasswordName}
        />
      )}
    </>
  );
};

export default UserDetails;
