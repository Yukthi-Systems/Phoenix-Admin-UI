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
import EditModelBox from "@/components/common/EditModelBox";
import {
  useEnableDisableEmailAuth,
  useEnableDisablePhoneAuth,
  useEnableDisableTFA,
  useGenerateEmailOTP,
  useGeneratePhoneOTP,
  useGenerateQR,
  useGetUserTFA,
  useValidateEmailOTP,
  useValidatePhoneOTP,
  useValidateTFA,
} from "@/hooks/useTFA";
import { useAtomValue, useSetAtom } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import StepProgressBar from "./twoFactAuthSteps/StepProgressBar";
import StepConfirmation from "./twoFactAuthSteps/StepConfirmation";
import StepValidateTOTP from "./twoFactAuthSteps/StepValidateTOTP";
import ErrorFallback from "./twoFactAuthSteps/ErrorFallback";
import StepQRCode from "./twoFactAuthSteps/StepQRCode";
import StepVerifyMobile from "./twoFactAuthSteps/StepVerifyMobile";
import StepVerifyEmail from "./twoFactAuthSteps/StepVerifyEmail";
import StepCreateValue from "./twoFactAuthSteps/StepCreateValue";
import StepSelectMethod from "./twoFactAuthSteps/StepSelectMethod";
import DisableTFA from "./twoFactAuthSteps/DisableTFA";

function TwoFactAuth({
  twoFactAuth = false,
  setTwoFactAuth = () => {},
  activeStatus = false,
  isSMSAuth = false,
  isEmailAuth = false,
  isTOTPAuth = false,
}) {
  const setProfile = useSetAtom(userProfileAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  // organization_id here is deliberately read off the user's own profile,
  // not userInfoAtom.organization_id - that one tracks whatever org the
  // admin is currently browsing via the top org switcher, and this modal
  // manages the logged-in user's own 2FA, not that of the browsed org.
  const { user_id, user_email, display_name, primary_phone, organization_id } =
    useAtomValue(userProfileAtom);
  const { data: orgDetail } = useGetOrganizationDetail(organization_id);

  const [step, setStep] = useState(0);
  const [qrData, setQrData] = useState({ uri: "", secret: "" });
  const [selectedType, setSelectedType] = useState("authenticator");
  const [selectedTypeValue, setSelectedTypeValue] = useState(
    activeStatus ? "" : "iPhone - 16 (Personal)",
  );
  const [qrCodeType, setQrCodeType] = useState("qr");
  const [otp, setOtp] = useState("");
  const [emailValue, setEmailValue] = useState(user_email || "");
  const [mobileValue, setMobileValue] = useState(primary_phone || "");
  const [orgName, setOrgName] = useState("");
  const [hasActive, setHasActive] = useState(activeStatus);

  // Existing TOTP devices (registered while 2FA was on) don't disappear when
  // 2FA is toggled off, and the 10-device limit still applies to them — so the
  // management/delete view must stay reachable even if activeStatus is false.
  const { data: totpData } = useGetUserTFA({
    organization_id,
    user_id,
    userName: display_name,
  });
  const hasExistingTotpDevices = (totpData?.data?.length || 0) > 0;

  useEffect(() => {
    if (hasExistingTotpDevices) {
      setHasActive(true);
    }
  }, [hasExistingTotpDevices]);

  const { mutate: generateQR, isPending } = useGenerateQR();
  const { mutate: enableTFA } = useEnableDisableTFA();
  const { mutate: validateTFA, isPending: isLoading } = useValidateTFA();
  const { mutate: generateEmailOTP, isPending: isEmailOTPLoading } =
    useGenerateEmailOTP();
  const { mutate: validateEmailOTP } = useValidateEmailOTP();
  const { mutate: enableEmailAuth } = useEnableDisableEmailAuth();
  const { mutate: generatePhoneOTP, isPending: isPhoneOTPLoading } =
    useGeneratePhoneOTP();
  const { mutate: validatePhoneOTP } = useValidatePhoneOTP();
  const { mutate: enablePhoneAuth } = useEnableDisablePhoneAuth();

  const handleError = (error) => {
    const message =
      error?.response?.data?.message || error.message || "Unknown error";
    const tracebackId = error?.response?.data?.traceback_id;
    toast(
      "error",
      `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
    );
  };

  const getUserData = async () => {
    // Awaiting invalidateQueries lets the active "profile" query (kept
    // mounted by FullLayout) refetch before we read it back out - reading
    // getQueryData first would just hand back the pre-mutation snapshot.
    await queryClient.invalidateQueries({
      queryKey: ["profile", user_id, organization_id],
    });
    const userData = queryClient.getQueryData([
      "profile",
      user_id,
      organization_id,
    ]);
    if (userData?.user_details) setProfile(userData.user_details);
  };

  const handleVerifyClick = () => {
    let UpperCase = otp.toUpperCase();
    if (otp.length !== 6) return toast("error", "Please enter a valid OTP");

    const queryParams =
      selectedType === "authenticator"
        ? { totp_code: UpperCase }
        : { otp_code: UpperCase };

    const onSuccess = () => {
      toast("success", "Verification Successful.");
      setOtp("");
      setStep(selectedType === "authenticator" ? 4 : 3);
    };

    const handlerMap = {
      authenticator: () =>
        validateTFA({ queryParams }, { onSuccess, onError: handleError }),
      email: () =>
        validateEmailOTP(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          { onSuccess, onError: handleError },
        ),
      sms: () =>
        validatePhoneOTP(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          { onSuccess, onError: handleError },
        ),
    };

    handlerMap[selectedType]?.();
  };

  const handleGenQR = () => {
    if (selectedType !== "authenticator") return setStep(1);

    generateQR(
      {
        orgId: organization_id,
        user_id,
        queryParams: { totp_name: selectedTypeValue },
        userName: display_name,
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

  const enableAuthFun = () => {
    const queryParams = { enable: true };

    const successHandler = () => {
      toast("success", `${selectedType.toUpperCase()} authentication enabled.`);
      getUserData();
      setTwoFactAuth(false);
    };

    const handlerMap = {
      authenticator: () =>
        enableTFA(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          { onSuccess: () => setStep(3), onError: handleError },
        ),
      email: () =>
        enableEmailAuth(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          { onSuccess: successHandler, onError: handleError },
        ),
      sms: () =>
        enablePhoneAuth(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          { onSuccess: successHandler, onError: handleError },
        ),
    };

    handlerMap[selectedType]?.();
  };

  const handleVerifyAuth = () => {
    const queryParams = { user_display_name: display_name, org_name: orgName };

    const handlerMap = {
      email: () =>
        generateEmailOTP(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          {
            onSuccess: () => {
              toast("success", "Email verification sent");
              setStep(2);
            },
            onError: handleError,
          },
        ),
      sms: () =>
        generatePhoneOTP(
          { orgId: organization_id, user_id, queryParams, userName: display_name },
          {
            onSuccess: () => {
              toast("success", "SMS verification sent");
              setStep(2);
            },
            onError: handleError,
          },
        ),
    };

    handlerMap[selectedType]?.();
  };

  const handleDisableTFA = () => {
    enableTFA(
      {
        orgId: organization_id,
        user_id,
        queryParams: { enable: false },
        userName: display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
          setTwoFactAuth(false);
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
        userName: display_name,
      },
      {
        onSuccess: (res) => {
          getUserData();
          toast("success", res?.message || "2FA enabled");
          setTwoFactAuth(false);
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
        userName: display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
          setTwoFactAuth(false);
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
        userName: display_name,
      },
      {
        onSuccess: (res) => {
          toast("success", res?.message || "2FA disabled");
          getUserData();
          setTwoFactAuth(false);
        },
        onError: handleError,
      },
    );
  };

  const handleComplete = () => {
    getUserData();
    setOtp("");
    setTwoFactAuth(false);
  };

  useEffect(() => {
    setOrgName(orgDetail?.organization_name || "");
  }, [orgDetail]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepSelectMethod
            selectedType={selectedType}
            setSelectedType={(val) => {
              setSelectedType(val);
              setSelectedTypeValue(val);
            }}
            onCancel={() => setTwoFactAuth(false)}
            onNext={() => setStep(1)}
            isPending={isPending}
            isSMSAuth={isSMSAuth}
            isEmailAuth={isEmailAuth}
          />
        );
      case 1:
        if (selectedType === "authenticator") {
          return (
            <StepCreateValue
              onNext={handleGenQR}
              isPending={isPending}
              selectedTypeValue={selectedTypeValue}
              setSelectedTypeValue={setSelectedTypeValue}
              onPrev={() => setStep(0)}
            />
          );
        } else if (selectedType === "email") {
          return (
            <StepVerifyEmail
              emailValue={emailValue}
              setEmailValue={setEmailValue}
              onNext={handleVerifyAuth}
              isPending={isEmailOTPLoading}
              onPrev={() => setStep(0)}
            />
          );
        } else if (selectedType === "sms") {
          return (
            <StepVerifyMobile
              mobileValue={mobileValue}
              setMobileValue={setMobileValue}
              onNext={handleVerifyAuth}
              isPending={isPhoneOTPLoading}
              onPrev={() => setStep(0)}
            />
          );
        }
        break;
      case 2:
        if (selectedType === "authenticator") {
          return (
            <StepQRCode
              qrData={qrData}
              qrCodeType={qrCodeType}
              setQrCodeType={setQrCodeType}
              onNext={enableAuthFun}
            />
          );
        }
        return (
          <StepValidateTOTP
            onNext={handleVerifyClick}
            otp={otp}
            setOtp={setOtp}
            isPending={isLoading}
          />
        );
      case 3:
        return selectedType === "authenticator" ? (
          <StepValidateTOTP
            onNext={handleVerifyClick}
            otp={otp}
            setOtp={setOtp}
            isPending={isLoading}
            type="authenticator"
          />
        ) : (
          <StepConfirmation
            activeStatus={activeStatus}
            onNext={enableAuthFun}
          />
        );
      case 4:
        return (
          <StepConfirmation
            activeStatus={activeStatus}
            onNext={handleComplete}
          />
        );
      default:
        return <ErrorFallback onCancel={() => setTwoFactAuth(false)} />;
    }
  };

  return (
    <EditModelBox
      isOpen={twoFactAuth}
      label={hasActive ? "" : ""}
      // "large" goes full screen on small viewports so the wizard content
      // doesn't need its own inner scroll on top of the page scroll. That
      // removes the backdrop-click escape hatch on mobile, so keep an
      // explicit close button visible.
      size="large"
      showCancel={true}
      handleCancel={() => setTwoFactAuth(false)}
    >
      <div className="w-full max-w-2xl mx-auto mt-4">
        {hasActive ? (
          <DisableTFA
            setHasActive={() => setHasActive(false)}
            onCancel={() => setTwoFactAuth(false)}
            isPending={isPending}
            isSMSAuth={isSMSAuth}
            isEmailAuth={isEmailAuth}
            isTOTPAuth={isTOTPAuth}
            onEnTOTP={handleEnableTFA}
            onDisTOTP={handleDisableTFA}
            onDisSMS={handleDisablePhone}
            onDisEmail={handleDisableEmail}
          />
        ) : (
          <>
            <StepProgressBar step={step} type={selectedType} />
            {renderStep()}
          </>
        )}
      </div>
    </EditModelBox>
  );
}

export default TwoFactAuth;
