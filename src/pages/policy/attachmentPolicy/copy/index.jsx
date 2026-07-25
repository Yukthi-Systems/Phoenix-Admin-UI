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

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useCreateAttachmentPolicy } from "@/hooks/useAttachmentPolicy";
import { attachmentPolicyDefaultValues } from "../create/attachmentPolicyDefaultValues";
import { attachmentPolicyValidationSchema } from "../create/validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyDetailsStep from "../create/steps/PolicyDetailsStep";
import FileTypesStep from "../create/steps/FileTypesStep";

const STEPS = [
  {
    id: "policy-details",
    label: "Policy Details",
    description: "Name & settings",
    fields: [
      "policy_name",
      "policy_description",
      "is_active",
      "max_attachment_size_mb",
      "domain_name",
    ],
  },
  {
    id: "file-types",
    label: "File Types",
    description: "Configure types",
    fields: [], // Custom validation for arrays
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
  1: (props) => <PolicyDetailsStep {...props} />,
  2: (props) => <FileTypesStep {...props} />,
};

const EditAttachmentPolicy = () => {
  const { copy_domain_name } = useParams();
  const location = useLocation();
  const { fullData: data } = location.state;
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // File type lists state
  const [allowedFileTypes, setAllowedFileTypes] = useState([]);
  const [blockedFileTypes, setBlockedFileTypes] = useState([]);

  const policy = data;

  const { mutate, isPending } = useCreateAttachmentPolicy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    trigger,
    getValues,
    reset,
  } = useForm({
    defaultValues: attachmentPolicyDefaultValues,
    resolver: yupResolver(attachmentPolicyValidationSchema),
    mode: "onChange",
  });

  // Populate form with existing policy data
  useEffect(() => {
    if (policy) {
      reset({
        policy_name: policy.policy_name || "",
        policy_description: policy.policy_description || "",
        is_active: policy.is_active || false,
        has_size_limit: policy.max_attachment_size_mb > 0 ? true : false,
        max_attachment_size_mb: policy.max_attachment_size_mb || 0,
        domain_name: copy_domain_name,
      });

      // Set file type arrays
      setAllowedFileTypes(policy.allowed_file_types || []);
      setBlockedFileTypes(policy.blocked_file_types || []);
    }
  }, [policy, copy_domain_name, reset]);

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

    // Validate current step before navigating
    const isValid = await validateStep(currentStep);
    if (!isValid) {
      setCompletedSteps(completedSteps.filter((s) => s !== currentStep));
      return false;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  };

  const handleStepClick = async (stepNumber) => {
    // In edit mode, allow navigation to any step after validating current step
    await handleStepNavigation(stepNumber);
  };

  const onSubmit = (formData) => {
    const data = {
      policy_name: formData.policy_name,
      policy_description: formData.policy_description,
      domain_name: copy_domain_name,
      is_active: formData.is_active,
      max_attachment_size_mb: formData.has_size_limit
        ? formData.max_attachment_size_mb
        : 0,
      allowed_file_types: allowedFileTypes,
      blocked_file_types: blockedFileTypes,
    };

    mutate(
      { organization_id, data },
      {
        onSuccess: () => {
          toast("success", "Attachment Policy updated successfully");
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

  if (!permissions.includes("policy:attachment:edit")) {
    return (
      <AccessDenied content="Don't have the access to edit attachment policy." />
    );
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    domain_name: copy_domain_name,
    formData: getValues(),
    allowedFileTypes,
    setAllowedFileTypes,
    blockedFileTypes,
    setBlockedFileTypes,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Attachment Policies", link: "/policies/attachment" },
        { name: "Copy Attachment Policy" },
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
      submitLabel="Copy Attachment Policy"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditAttachmentPolicy;
