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

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useAddGeneralPolicy } from "@/hooks/useGeneralPolicy";
import { generalPolicyDefaultValues } from "./generalPolicyDefaultValues";
import { generalPolicyValidationSchema } from "./validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyInformationStep from "./steps/PolicyInfoStep";
import BlockingSettingsStep from "./steps/BlockingStep";
import PreviewStep from "./steps/PreviewStep";

const STEPS = [
  {
    id: "policy-information",
    label: "Policy Information",
    description: "Basic details",
    fields: ["policy_name", "is_active", "domain"],
  },
  {
    id: "blocking-settings",
    label: "Blocking & Exceptions",
    description: "Rules & Exceptions",
    fields: [
      "block_all_incoming_emails",
      "block_all_outgoing_emails",
      "block_all_incoming_domains",
      "block_all_outgoing_domains",
      "outgoing_size_limit_mb",
    ],
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review details",
    fields: [],
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
  1: (props) => <PolicyInformationStep {...props} />,
  2: (props) => <BlockingSettingsStep {...props} />,
  3: (props) => <PreviewStep {...props} />,
};

const AddGeneralPolicy = () => {
  const { domain_name } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Exception lists state
  const [incomingDomains, setIncomingDomains] = useState([]);
  const [incomingEmails, setIncomingEmails] = useState([]);
  const [outgoingDomains, setOutgoingDomains] = useState([]);
  const [outgoingEmails, setOutgoingEmails] = useState([]);

  const { mutate, isPending } = useAddGeneralPolicy();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    defaultValues: generalPolicyDefaultValues,
    resolver: yupResolver(generalPolicyValidationSchema),
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

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    // Validate current step before moving forward
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

  const onSubmit = (formData) => {
    const data = {
      ...formData,
      domain: domain_name,
      incoming_exception_domains: incomingDomains,
      incoming_exception_emails: incomingEmails,
      outgoing_exception_domains: outgoingDomains,
      outgoing_exception_emails: outgoingEmails,
    };

    mutate(
      { org_id: organization_id, data },
      {
        onSuccess: () => {
          toast("success", "General Policy created successfully");
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
        },
      },
    );
  };

  if (!permissions.includes("policy:general:create")) {
    return (
      <AccessDenied content="Don't have permission to create general policy." />
    );
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    domain_name,
    formData: getValues(),
    // Exception lists
    incomingDomains,
    setIncomingDomains,
    incomingEmails,
    setIncomingEmails,
    outgoingDomains,
    setOutgoingDomains,
    outgoingEmails,
    setOutgoingEmails,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "General Policies", link: "/policies/general" },
        { name: "Add General Policy" },
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
      submitLabel="Create General Policy"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default AddGeneralPolicy;
