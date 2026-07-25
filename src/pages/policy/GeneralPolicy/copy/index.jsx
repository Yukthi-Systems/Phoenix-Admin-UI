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
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useAddGeneralPolicy } from "@/hooks/useGeneralPolicy";
import { generalPolicyDefaultValues } from "../add/generalPolicyDefaultValues";
import { generalPolicyValidationSchema } from "../add/validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import PolicyInformationStep from "../edit/steps/PolicyInfoStep";
import BlockingSettingsStep from "../edit/steps/BlockingSettingStep";
import ExceptionListsStep from "../edit/steps/ExceptionLists";
import StepperFormLayout from "@/components/layouts/FormLayout";

const STEPS = [
  {
    id: "policy-information",
    label: "Policy Information",
    description: "Basic details",
    fields: ["policy_name", "is_active", "domain"],
  },
  {
    id: "blocking-settings",
    label: "Blocking Settings",
    description: "Email controls",
    fields: [
      "block_all_incoming_emails",
      "block_all_outgoing_emails",
      "outgoing_size_limit_mb",
    ],
  },
  {
    id: "exception-lists",
    label: "Exception Lists",
    description: "Domains & emails",
    fields: [], // Custom validation for lists
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
  3: (props) => <ExceptionListsStep {...props} />,
};

const CopyGeneralPolicy = () => {
  const { copy_domain_name } = useParams();
  const location = useLocation();
  const { fullData: data } = location.state;
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
    formState: { errors },
    watch,
    control,
    reset,
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
      ...formData,
      incoming_exception_domains: incomingDomains,
      incoming_exception_emails: incomingEmails,
      outgoing_exception_domains: outgoingDomains,
      outgoing_exception_emails: outgoingEmails,
    };

    mutate(
      { org_id: organization_id, data },
      {
        onSuccess: () => {
          toast("success", "General Policy copied successfully");
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

  useEffect(() => {
    if (data) {
      reset({
        outgoing_size_limit_mb: data?.outgoing_size_limit_mb || 0,
        policy_description: data?.policy_description || "",
        block_all_incoming_emails: data?.block_all_incoming_emails || false,
        block_all_outgoing_emails: data?.block_all_outgoing_emails || false,
        is_active: data?.is_active || false,
        policy_name: data?.policy_name || "",
        domain: copy_domain_name || "",
      });

      setIncomingDomains(data?.incoming_exception_domains || []);
      setIncomingEmails(data?.incoming_exception_emails || []);
      setOutgoingDomains(data?.outgoing_exception_domains || []);
      setOutgoingEmails(data?.outgoing_exception_emails || []);
    }
  }, [data, reset, copy_domain_name]);

  if (!permissions.includes("policy:general:edit")) {
    return (
      <AccessDenied content="Don't have permission to copy general policy." />
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
        { name: "Copy General Policy" },
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
      submitLabel="Copy General Policy"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default CopyGeneralPolicy;
