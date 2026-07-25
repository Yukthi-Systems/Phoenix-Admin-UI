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
import { useGetIdentity, useUpdateIdentity, useUpdateIdentityPassword } from "@/hooks/useIdentities";
import { useRestrictionPolicy } from "@/hooks/useRestrictionPolicy";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import IdentityDetailsStep from "../stepper/IdentityDetailsStep";
import PasswordSetupStep from "../stepper/PasswordSetupStep";
import IdentityPoliciesStep from "../stepper/IdentityPoliciesStep";
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
    .nullable()
    .transform((curr, orig) => orig === "" ? null : curr)
    .min(8, "Password must be at least 8 characters"),
  conform_password: yup
    .string()
    .nullable()
    .transform((curr, orig) => orig === "" ? null : curr)
    .oneOf([yup.ref("password"), null], "Passwords must match"),
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
    label: "Password Setup",
    description: "Update credentials and 2FA",
    fields: ["password", "conform_password", "is_app_2fa_enabled", "is_sms_2fa_enabled", "is_email_2fa_enabled"],
  },
  {
    id: "policies",
    label: "Policies",
    description: "Access control",
    fields: ["restriction_policy_id", "department_id", "is_enabled"],
  },
];

const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

const EditIdentity = () => {
  const { email } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const toast = useToastify();

  const [email_prefix, domain_name] = email ? email.split("@") : ["", ""];

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { data: identityData, isLoading: detailsLoading, isError } = useGetIdentity(
    domain_name,
    email_prefix
  );

  const { mutate: updateDetails, isPending: detailsPending } = useUpdateIdentity();
  const { mutate: updatePassword, isPending: passwordPending } = useUpdateIdentityPassword();

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
    reset,
    watch,
    control,
    trigger,
  } = useForm({
    resolver: yupResolver(identityFormSchema),
    mode: "onChange",
  });

  const identityDetails = identityData?.data || {};

  // Populate form with fetched details
  useEffect(() => {
    if (identityData && identityDetails) {
      reset({
        email_prefix: email_prefix || "",
        email_domain: domain_name || "",
        first_name: identityDetails.first_name || "",
        last_name: identityDetails.last_name || "",
        primary_phone_number: identityDetails.primary_phone || "",
        secondary_email: identityDetails.secondary_email || "",
        password: "",
        conform_password: "",
        restriction_policy_id: identityDetails.restriction_policy_id || "",
        department_id: identityDetails.department_id || "",
        is_enabled: identityDetails.is_enabled ?? true,
        is_app_2fa_enabled: identityDetails.is_app_2fa_enabled ?? false,
        is_sms_2fa_enabled: identityDetails.is_sms_2fa_enabled ?? false,
        is_email_2fa_enabled: identityDetails.is_email_2fa_enabled ?? false,
      });
    }
  }, [identityData, reset]);

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
    await handleStepNavigation(stepNumber);
  };

  const onSubmit = (formData) => {
    const payload = {
      email_prefix,
      email_domain: domain_name,
      first_name: formData.first_name,
      last_name: formData.last_name || "",
      primary_phone_number: formData.primary_phone_number,
      secondary_email: formData.secondary_email || "",
      base64_password: "",
      is_enabled: formData.is_enabled,
      is_app_2fa_enabled: formData.is_app_2fa_enabled,
      is_sms_2fa_enabled: formData.is_sms_2fa_enabled,
      is_email_2fa_enabled: formData.is_email_2fa_enabled,
      restriction_policy_id: formData.restriction_policy_id || null,
      department_id: formData.department_id || null,
    };

    updateDetails(
      { data: payload },
      {
        onSuccess: () => {
          if (formData.password) {
            updatePassword(
              {
                domain_name,
                email_prefix,
                password: btoa(formData.password),
              },
              {
                onSuccess: () => {
                  toast("success", "Successfully updated identity details and password");
                  navigate("/identities");
                },
                onError: (error) => {
                  const message = error.response?.data?.message || error.message || "Unknown error";
                  toast("error", `Details updated, but password failed: ${message}`);
                  navigate("/identities");
                }
              }
            );
          } else {
            toast("success", "Successfully updated identity details");
            navigate("/identities");
          }
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
    jumpToErroredStep(formErrors, STEPS, setCurrentStep, toast, "before updating the identity");

  if (!permissions.includes("identity:edit")) {
    return <AccessDenied content="Don't have access to edit identities." />;
  }

  if (detailsLoading) return <DataLoading content="Loading identity details..." />;
  if (isError) return <DataFechError content="Error loading identity details." />;

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
            isEdit={true}
          />
        );
      case 2:
        return (
          <PasswordSetupStep
            register={register}
            errors={errors}
            control={control}
            watch={watch}
            isEdit={true}
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
            isEdit={true}
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
        { name: "Edit E-Mail Identity" },
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
      isPending={detailsPending || passwordPending}
      submitLabel="Update Identity"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {renderStep()}
    </StepperFormLayout>
  );
};

export default EditIdentity;
