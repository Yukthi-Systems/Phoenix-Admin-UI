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
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useGetUser, useUpdateUser } from "@/hooks/useUser";
import { useToastify } from "@/hooks/useToastify";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import DataLoading from "@/components/common/DataLoading";
import StepperFormLayout from "@/components/layouts/FormLayout";
import * as yup from "yup";
import UserDetailsStep from "./steps/UserDetailsStep";
import PersonalDetailsStep from "./steps/PersonalDetailsStep";
import { userEditFormSchema } from "./validationSchema";

// Default values for the form
const userEditDefaultValue = {
  user_id: "",
  user_name: "",
  user_email: "",
  primary_phone: "",
  display_name: "",
  user_details: {
    first_name: "",
    last_name: "",
    other_email: "",
    timezone: "",
    locale: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
    activate: false,
  },
};

const STEPS = [
  {
    id: "user-details",
    label: "User Details",
    description: "Account info",
    fields: ["user_name", "display_name", "user_email", "primary_phone", "activate"],
  },
  {
    id: "personal-details",
    label: "Personal Details",
    description: "Personal info",
    fields: [
      "user_details.first_name",
      "user_details.last_name",
      "user_details.other_email",
      "user_details.timezone",
      "user_details.locale",
      "user_details.address",
      "user_details.city",
      "user_details.state",
      "user_details.country",
      "user_details.zip_code",
    ],
  },
];

// Helper: Get required fields for step
const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

// Step renderer map
const STEP_RENDERER = {
  1: (props) => <UserDetailsStep {...props} />,
  2: (props) => <PersonalDetailsStep {...props} />,
};

function EditUser() {
  const { user_id: rawUserId } = useParams();
  const toast = useToastify();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const user_id = decodeURIComponent(rawUserId);
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateUser();
  const { data, isLoading, isError } = useGetUser(organization_id, user_id);
  const user_details = data?.user_details ?? null;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger,
    getValues,
    setValue,
    control,
  } = useForm({
    defaultValues: userEditDefaultValue,
    resolver: yupResolver(userEditFormSchema),
    mode: "onChange",
  });

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
    const is_mail_updated = formData.user_email !== user_details?.user_email;
    const is_phone_updated =
      formData.primary_phone !== user_details?.primary_phone;

    const queryParams = {
      user_id: formData.user_id,
      user_name: formData.user_name,
      user_email: formData.user_email,
      primary_phone: formData.primary_phone,
      display_name: formData.display_name,
      is_mail_updated,
      is_phone_updated,
      is_active: formData.activate || false,
    };

    const requestBody = {
      first_name: formData.user_details.first_name || "",
      last_name: formData.user_details.last_name || "",
      other_email: formData.user_details.other_email || "",
      timezone: formData.user_details.timezone || "",
      locale: formData.user_details.locale || "",
      address: formData.user_details.address || "",
      city: formData.user_details.city || "",
      state: formData.user_details.state || "",
      country: formData.user_details.country || "",
      zip_code: formData.user_details.zip_code || "",
    };

    mutate(
      { orgId: organization_id, body: requestBody, queryParams },
      {
        onSuccess: () => {
          toast("success", "Successfully updated user");
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
  };

  useEffect(() => {
    if (user_details) {
      reset({
        user_id: user_details?.user_id || "",
        user_name: user_details?.user_name || "",
        user_email: user_details?.user_email || "",
        primary_phone: user_details?.primary_phone || "",
        display_name: user_details?.display_name || "",
        activate: user_details?.is_active || false,
        user_details: {
          first_name: user_details?.user_details?.first_name || "",
          last_name: user_details?.user_details?.last_name || "",
          other_email: user_details?.user_details?.other_email || "",
          timezone: user_details?.user_details?.timezone || "",
          locale: user_details?.user_details?.locale || "",
          address: user_details?.user_details?.address || "",
          city: user_details?.user_details?.city || "",
          state: user_details?.user_details?.state || "",
          country: user_details?.user_details?.country || "",
          zip_code: user_details?.user_details?.zip_code || "",
        },
      });
    }
  }, [user_details, reset]);

  if (!permissions.includes("user:edit")) {
    return (
      <AccessDenied content="Don't have the access to edit user details." />
    );
  }

  if (isError) {
    return <DataFechError content="User details getting error...!" />;
  }

  if (isLoading) {
    return <DataLoading content="User details loading...!" />;
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    getValues,
    formData: getValues(),
    user_details,
    user_id,
    organization_id,
    setValue,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "User Management", link: "/user" },
        { name: "Edit User" },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepClick}
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Update User"
      showRequiredNote={false}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
}

export default EditUser;
