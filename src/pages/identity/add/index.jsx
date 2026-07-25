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

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useAddIdentity } from "@/hooks/useIdentities";
import { useRestrictionPolicy } from "@/hooks/useRestrictionPolicy";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import IdentityDetailsStep from "../stepper/IdentityDetailsStep";
import PasswordSetupStep from "../stepper/PasswordSetupStep";
import IdentityPoliciesStep from "../stepper/IdentityPoliciesStep";
import IdentityPreviewStep from "../stepper/IdentityPreviewStep";
import { useAddMailbox } from "@/hooks/useMailbox";
import { useCreateChatUser } from "@/hooks/useChat";
import { useCreateFileUser } from "@/hooks/useFiles";
import { jumpToErroredStep } from "@/utils/formUtils";

const identityFormSchema = yup.object().shape({
  email_prefix: yup
    .string()
    .required("Email prefix is required")
    .matches(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dot, underscore, and hyphen are allowed")
    .matches(
      /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/,
      "Symbols (. _ -) can't be at the start/end or appear consecutively"
    ),
  email_domain: yup.string().required("Email domain is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().nullable(),
  primary_phone_number: yup.string().required("Primary phone number is required"),
  secondary_email: yup
    .string()
    .nullable()
    .transform((curr, orig) => orig === "" ? null : curr)
    .email("Invalid email address")
    .when("is_email_2fa_enabled", {
      is: true,
      then: (schema) => schema.required("Secondary email is required to enable Email 2FA"),
    }),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  conform_password: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  restriction_policy_id: yup
    .string()
    .nullable()
    .transform((curr, orig) => orig === "" ? null : curr),
  department_id: yup
    .string()
    .nullable()
    .transform((curr, orig) => orig === "" ? null : curr),
  is_enabled: yup.boolean().default(true),
  is_app_2fa_enabled: yup.boolean().default(false),
  is_sms_2fa_enabled: yup.boolean().default(false),
  is_email_2fa_enabled: yup.boolean().default(false),
  is_mailbox_enabled: yup.boolean().default(false),
  is_chat_enabled: yup.boolean().default(false),
  is_files_enabled: yup.boolean().default(false),
  files_quota_allocated: yup.number().default(0.1),
});

const STEPS = [
  {
    id: "identity-details",
    label: "Identity Info",
    description: "Email & profile info",
    fields: [
      "email_prefix",
      "email_domain",
      "first_name",
      "primary_phone_number",
      "secondary_email",
    ],
  },
  {
    id: "password",
    label: "Password",
    description: "Security credentials and 2FA",
    fields: ["password", "conform_password", "is_app_2fa_enabled", "is_sms_2fa_enabled", "is_email_2fa_enabled"],
  },
  {
    id: "policies",
    label: "Policies",
    description: "Access control",
    fields: ["restriction_policy_id", "department_id", "is_enabled"],
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review details",
    fields: [],
  },
];

const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

const AddIdentity = () => {
  const { domain_name } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useAddIdentity();
  const { mutate: createMailbox, isPending: isMailboxPending } = useAddMailbox();
  const { mutate: createChat, isPending: isChatPending } = useCreateChatUser();
  const { mutate: createFileUser, isPending: isFileUserPending } = useCreateFileUser();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Fetch restriction policies for dropdown
  const { data: policiesData } = useRestrictionPolicy({
    organization_id,
    page: 1,
    pageSize: 100,
  });
  const policiesList = policiesData?.data?.policies || [];
  const policyOptions = useMemo(() => [
    { label: "None", value: "" },
    ...policiesList.map((p) => ({
      label: p.policy_name,
      value: p.policy_id,
    })),
  ], [policiesList]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    trigger,
    getValues,
  } = useForm({
    defaultValues: {
      email_prefix: "",
      email_domain: domain_name || "",
      first_name: "",
      last_name: "",
      primary_phone_number: "",
      secondary_email: "",
      password: "",
      conform_password: "",
      restriction_policy_id: "",
      department_id: "",
      is_enabled: true,
      is_app_2fa_enabled: false,
      is_sms_2fa_enabled: false,
      is_email_2fa_enabled: false,
      is_mailbox_enabled: false,
      is_chat_enabled: false,
      is_files_enabled: false,
      allocate_quota: 0.1,
      files_quota_allocated: 0.1,
    },
    resolver: yupResolver(identityFormSchema),
    mode: "onChange",
  });

  // Ensure domain is synced from route parameter
  useEffect(() => {
    if (domain_name) {
      setValue("email_domain", domain_name);
    }
  }, [domain_name, setValue]);

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = getRequiredFieldsForStep(stepNumber);
    if (fieldsToValidate.length === 0) return true;

    const result = await trigger(fieldsToValidate);
    if (!result)
      toast("error", "Please fix the errors in the form before proceeding");
    return result;
  };

  const handleStepNavigation = async (targetStep) => {
    if (targetStep === currentStep) return true;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    const isValid = await validateStep(currentStep);
    if (!isValid) {
      setCompletedSteps(completedSteps.filter((s) => s !== currentStep));
      return false;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  };

  const handleStepClick = async (stepNumber) => {
    if (stepNumber > currentStep && !completedSteps.includes(stepNumber)) {
      toast("warning", "Please complete the current step first");
      return;
    }
    await handleStepNavigation(stepNumber);
  };

  const creatingChatUser = ({ domain, email }) => {
    const payload = {
      domain: domain,
      email: email
    }

    createChat(payload, {
      onSuccess: () => { },
      onError: (err) => {
        toast("error", err?.response?.data?.message || "Failed to create chat user");
      }
    })
  }

  const creatingFileUser = ({ domain, email, quota_allocated }) => {
    createFileUser(
      {
        domain_name: domain,
        email_identity: email,
        quota_allocated,
        enable_user: true,
      },
      {
        onError: (err) => {
          toast("error", err?.response?.data?.message || "Failed to create file user");
        },
      },
    );
  };

  const creatingMailbox = ({ domain, email_prefix, allocate_quota }) => {
    const payload = {
      allocate_quota: allocate_quota,
      distribution_policy_id: null,
      email_identity: `${email_prefix}@${domain}`,
      enabled: true,
      forwarding_policy_id: null,
      general_policy_id: null
    }

    createMailbox({ data: payload }, {
      onError: (err) => {
        toast("error", err?.response?.data?.message || "Failed to create mailbox");
      }
    })
  }

  const onSubmit = (formData) => {
    const payload = {
      email_prefix: formData.email_prefix.toLowerCase(),
      email_domain: formData.email_domain,
      first_name: formData.first_name,
      last_name: formData.last_name || "",
      primary_phone_number: formData.primary_phone_number,
      secondary_email: formData.secondary_email || "",
      base64_password: btoa(formData.password),
      is_enabled: formData.is_enabled,
      is_app_2fa_enabled: formData.is_app_2fa_enabled,
      is_sms_2fa_enabled: formData.is_sms_2fa_enabled,
      is_email_2fa_enabled: formData.is_email_2fa_enabled,
      restriction_policy_id: formData.restriction_policy_id || null,
      department_id: formData.department_id || null,
    };

    mutate(
      { data: payload, addLog: true },
      {
        onSuccess: () => {
          // Mailbox, Chat and Files only depend on the Identity just created
          // above, not on each other (chat_users/mailboxes/file_users all
          // reference email_identities independently on the backend) - fire
          // them independently so one failing doesn't silently block another.
          if (formData.is_mailbox_enabled) {
            creatingMailbox({
              domain: payload.email_domain,
              email_prefix: payload.email_prefix,
              allocate_quota: formData.allocate_quota,
            });
          }
          if (formData.is_chat_enabled) {
            creatingChatUser({
              domain: payload.email_domain,
              email: `${payload.email_prefix}@${payload.email_domain}`,
            });
          }
          if (formData.is_files_enabled) {
            creatingFileUser({
              domain: payload.email_domain,
              email: `${payload.email_prefix}@${payload.email_domain}`,
              quota_allocated: formData.files_quota_allocated,
            });
          }
          toast("success", "Successfully created E-Mail Identity");
          navigate(`/identities/${payload.email_prefix}@${payload.email_domain}`);
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
      }
    );
  };

  const onInvalid = (formErrors) =>
    jumpToErroredStep(formErrors, STEPS, setCurrentStep, toast, "before creating the identity");

  if (!permissions.includes("identity:create")) {
    return <AccessDenied content="Don't have access to create identities." />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IdentityDetailsStep
            register={register}
            errors={errors}
            control={control}
            watch={watch}
            setValue={setValue}
            domain_name={domain_name}
            isEdit={false}
          />
        );
      case 2:
        return (
          <PasswordSetupStep
            register={register}
            errors={errors}
            control={control}
            watch={watch}
            isEdit={false}
          />
        );
      case 3:
        return (
          <IdentityPoliciesStep
            register={register}
            errors={errors}
            control={control}
            watch={watch}
            setValue={setValue}
            organization_id={organization_id}
            domain_name={domain_name}
          />
        );
      case 4:
        return (
          <IdentityPreviewStep
            formData={{ watch }}
            organization_id={organization_id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Identity Management", link: "/identities" },
        { name: "Add E-Mail Identity" },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepClick}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      isPending={isPending}
      submitLabel="Create Identity"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {renderStep()}
    </StepperFormLayout>
  );
};

export default AddIdentity;
