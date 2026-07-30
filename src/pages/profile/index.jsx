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

import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton } from "@/components/common/Buttons";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Shield,
  Settings,
  AlertCircle,
  ShieldEllipsis,
} from "lucide-react";
import TwoFactAuth from "./TwoFactAuth";
import BackupCode from "./BackupCode";
import ProfilePicture from "./ProfilePic";
import { useToastify } from "@/hooks/useToastify";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGenerateEmailOTP,
  useGeneratePhoneOTP,
  useValidateEmailOTP,
  useValidatePhoneOTP,
} from "@/hooks/useTFA";
import EditModelBox from "@/components/common/EditModelBox";
import OTPInput from "react-otp-input";
import ResendButtonWithTimer from "@/components/common/ResendButtonWithTimer";

const MyProfile = () => {
  const setProfile = useSetAtom(userProfileAtom);
  const userDetails = useAtomValue(userProfileAtom);
  // organization_id comes off the user's own profile, matching the key
  // FullLayout.jsx fetches the "profile" query under - not
  // userInfoAtom.organization_id, which tracks whatever org is currently
  // browsed via the top org switcher. Using that here would both send the
  // wrong org to email/SMS verification and desync the profile cache key
  // used below from the one FullLayout actually populated.
  const organization_id = userDetails?.organization_id;
  const { data: orgDetail } = useGetOrganizationDetail(organization_id);
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { mutate: validateEmailOTP } = useValidateEmailOTP();
  const { mutate: validatePhoneOTP } = useValidatePhoneOTP();
  const { mutate: generateEmailOTP, isPending: isEmailOTPLoading } =
    useGenerateEmailOTP();
  const { mutate: generatePhoneOTP, isPending: isPhoneOTPLoading } =
    useGeneratePhoneOTP();
  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [twoFactAuth, setTwoFactAuth] = useState(false);
  const [backupCodeView, setBackupCodeView] = useState(false);
  const [viewVerification, setViewVerification] = useState(false);
  const [verifyType, setVerifyType] = useState("");
  const [otp, setOtp] = useState("");
  const [orgName, setOrgName] = useState("");
  const handleOpenBackupCode = () => {
    setBackupCodeView(true);
  };

  const allowed2faPermissions = [
    "user:security:2fa:email:edit",
    "user:security:2fa:sms_phone:edit",
    "user:security:2fa:totp:view",
    "user:security:2fa:totp:edit",
  ];

  const has2FAPermission = userDetails?.permissions?.some((p) =>
    allowed2faPermissions.includes(p),
  );

  const getFullAddress = () => {
    const details = userDetails?.user_details;
    if (!details) return "-";

    const parts = [
      details.address,
      details.city,
      details.state,
      details.country,
      details.zip_code,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "-";
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

  const handleVerifyAuth = async (Type) => {
    let user_id = userDetails?.user_id || "";
    let user_display_name = userDetails?.display_name || "";
    let orgId = organization_id || "";
    let org_name = orgName || "";

    let queryParams = { user_display_name, org_name };

    const handlerMap = {
      email: async () =>
        await generateEmailOTP(
          { orgId, user_id, queryParams, userName: user_display_name },
          {
            onSuccess: () => {
              toast("success", "Email verification sent");
            },
            onError: handleError,
          },
        ),
      sms: async () =>
        await generatePhoneOTP(
          { orgId, user_id, queryParams, userName: user_display_name },
          {
            onSuccess: () => {
              toast("success", "SMS verification sent");
            },
            onError: handleError,
          },
        ),
    };

    await handlerMap[Type.toLocaleLowerCase()]?.();
  };

  const handleVerifyClick = () => {
    let user_id = userDetails?.user_id;
    let UpperCase = otp.toUpperCase();
    if (otp.length !== 6) return toast("error", "Please enter a valid OTP");

    const queryParams = { otp_code: UpperCase };

    const onSuccess = async () => {
      // Invalidate (and wait for the refetch) before reading the cache
      // back out - reading it first would just hand back the
      // pre-verification snapshot.
      await queryClient.invalidateQueries({
        queryKey: ["profile", user_id, organization_id],
      });
      const newUserData = queryClient.getQueryData([
        "profile",
        user_id,
        organization_id,
      ]);
      if (newUserData?.user_details) {
        setProfile(newUserData.user_details);
      }
      toast("success", "Verification Successful.");
      setOtp("");
      setVerifyType("");
      setViewVerification(false);
    };

    const userName = userDetails?.display_name;
    const handlerMap = {
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

  const handleOpenFun = (type) => {
    setVerifyType(type);
    handleVerifyAuth(type);
    setViewVerification(true);
  };

  useEffect(() => {
    setOrgName(orgDetail?.organization_name || "");
  }, [orgDetail]);

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-6 mt-1.5">
          <Breadcrumbs items={[{ name: "User Profile" }]} />
          <BackButton />
        </div>

        <div className="h-[calc(100vh-140px)] w-full overflow-y-auto bg-card shadow-lg rounded-lg border border-border no-scrollbar">
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-8 py-8 border-b border-border">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="relative">
                {/* <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.display_name || "Guest")}&background=random&size=120`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg bg-background"
                /> */}
                <ProfilePicture
                  size="medium"
                  viewFullScreen={true}
                  showUpload
                />
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-card-foreground mb-2">
                  {userDetails?.display_name || "Unknown User"}
                </h1>
                <p className="text-lg text-muted-foreground mb-3">
                  @{userDetails?.user_name || "username"}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {/* <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-card-foreground">{userDetails?.user_email || "No email"}</span>
                  </div>  */}
                  {userDetails?.is_active ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard
                  icon={<User className="w-4 h-4" />}
                  label="First Name"
                  value={userDetails?.user_details?.first_name || "-"}
                />
                <InfoCard
                  icon={<User className="w-4 h-4" />}
                  label="Last Name"
                  value={userDetails?.user_details?.last_name || "-"}
                />
                <InfoCard
                  icon={<Mail className="w-4 h-4" />}
                  label="Email "
                  value={userDetails?.user_email || "No email"}
                  hasVerified={true}
                  verifiedValue={userDetails?.is_email_verified}
                  handleFunction={() => handleOpenFun("email")}
                />
                <InfoCard
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone Number"
                  value={userDetails?.primary_phone || "-"}
                  hasVerified={true}
                  verifiedValue={userDetails?.is_phone_verified}
                  handleFunction={() => handleOpenFun("sms")}
                />
                <InfoCard
                  icon={<Mail className="w-4 h-4" />}
                  label="Other Email"
                  value={userDetails?.user_details?.other_email || "-"}
                />
                <InfoCard
                  icon={<Globe className="w-4 h-4" />}
                  label="Locale"
                  value={userDetails?.user_details?.locale || "-"}
                />
                <InfoCard
                  icon={<Clock className="w-4 h-4" />}
                  label="Timezone"
                  value={userDetails?.user_details?.timezone || "-"}
                />
                <InfoCard
                  icon={<Shield className="w-4 h-4" />}
                  label="Two-Factor Authentication"
                  value={
                    userDetails?.is_totp_2fa_active ||
                    userDetails?.is_email_2fa_active ||
                    userDetails?.is_sms_2fa_active
                      ? "Enabled"
                      : "Disabled"
                  }
                  valueColor={
                    userDetails?.is_totp_2fa_active ||
                    userDetails?.is_email_2fa_active ||
                    userDetails?.is_sms_2fa_active
                      ? "text-success"
                      : "text-destructive"
                  }
                />
                <InfoCard
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={getFullAddress()}
                  className="md:col-span-2 lg:col-span-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Shield className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  Security & Settings
                </h2>
              </div>

              <div className="p-6 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Settings className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-3">
                  <ActionButton
                    label="Edit Profile"
                    description="Update your personal information"
                    onClick={() => setEditProfile(true)}
                  />
                  <ActionButton
                    label="Change Password"
                    description="Update your account password"
                    onClick={() => setChangePassword(true)}
                  />
                  {has2FAPermission && (
                    <ActionButton
                      label="Manage 2FA"
                      description="Configure two-factor authentication"
                      onClick={() => setTwoFactAuth(true)}
                    />
                  )}
                  {userDetails?.permissions?.includes(
                    "user:security:backup_codes:view",
                  ) && (
                    <ActionButton
                      label="Backup Codes"
                      description="Generate new backup codes"
                      onClick={handleOpenBackupCode}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editProfile && (
        <EditProfile
          editProfile={editProfile}
          setEditProfile={setEditProfile}
        />
      )}
      {changePassword && (
        <ChangePassword
          changePassword={changePassword}
          setChangePassword={setChangePassword}
        />
      )}
      {twoFactAuth && (
        <TwoFactAuth
          isSMSAuth={userDetails?.is_sms_2fa_active || false}
          isEmailAuth={userDetails?.is_email_2fa_active || false}
          isTOTPAuth={userDetails?.is_totp_2fa_active || false}
          activeStatus={
            userDetails?.is_totp_2fa_active ||
            userDetails?.is_email_2fa_active ||
            userDetails?.is_sms_2fa_active
          }
          twoFactAuth={twoFactAuth}
          setTwoFactAuth={setTwoFactAuth}
        />
      )}
      {backupCodeView && (
        <BackupCode isOpen={backupCodeView} setIsOpen={setBackupCodeView} />
      )}

      {viewVerification && (
        <EditModelBox
          isOpen={viewVerification}
          label=""
          handleCancel={() => setViewVerification(false)}
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

            <div className=" flex justify-end items-center w-full">
              <ResendButtonWithTimer
                onResend={() =>
                  handleVerifyAuth(verifyType.toLocaleLowerCase())
                }
                initialTimer={120}
              />
            </div>

            <div className="w-full h-10 flex justify-center items-center">
              <button
                className={` ${isEmailOTPLoading || isPhoneOTPLoading ? "bg-primary/30" : "bg-primary"}   font-medium cursor-pointer text-white px-4 py-2 rounded  `}
                onClick={handleVerifyClick}
              >
                Verify
              </button>
            </div>
          </div>
        </EditModelBox>
      )}
    </>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  className = "",
  valueColor = "text-card-foreground",
  hasVerified = false,
  verifiedValue = false,
  handleFunction = () => {},
}) => (
  <div
    className={`p-4 bg-background border border-border text-sm rounded-lg hover:shadow-sm transition-shadow ${className}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>

    {hasVerified ? (
      <div className="flex items-center justify-between gap-2 mt-1">
        <p
          className={`text-left font-medium truncate ${valueColor}`}
          title={value}
        >
          {value}
        </p>

        <div className="inline-block">
          {verifiedValue ? (
            // SUCCESS STATE: Uses --success and --success-foreground variables
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 cursor-default select-none">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            // WARNING STATE: Uses --warning and --warning-foreground variables
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFunction();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-all duration-300 cursor-pointer animate-shimmer"
              title="Click to verify this information"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Verify Now
            </button>
          )}
        </div>
      </div>
    ) : (
      <p
        className={`text-left font-medium truncate mt-1 ${valueColor}`}
        title={value}
      >
        {value}
      </p>
    )}
  </div>
);

const ActionButton = ({ label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 hover:border-accent transition-all group"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-card-foreground group-hover:text-accent-foreground transition-colors">
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-muted-foreground group-hover:text-accent-foreground transition-colors">
        <Settings className="w-4 h-4" />
      </div>
    </div>
  </button>
);

export default MyProfile;
