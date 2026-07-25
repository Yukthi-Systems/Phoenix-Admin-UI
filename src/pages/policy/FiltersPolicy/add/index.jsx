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
import { useParams, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useAddFiltersPolicy } from "@/hooks/useFiltersPolicy";
import { filtersPolicyDefaultValues } from "./filtersPolicyDefaultValues";
import { filtersPolicyValidationSchema } from "./validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyConfigurationStep from "./step/PolicyConfigurationStep";

const STEPS = [
  {
    id: "configuration",
    label: "Configuration",
    description: "Policy settings & lists",
    fields: ["policy_name",
      "is_active",
      // "delete_mails", 
      "white_entries",
      "black_entries"],
  },
];

const STEP_RENDERER = {
  1: (props) => <PolicyConfigurationStep {...props} />,
};

const AddFiltersPolicy = () => {
  const { domain_name } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Local state for lists
  const [whiteEntries, setWhiteEntries] = useState([]);
  const [blackEntries, setBlackEntries] = useState([]);

  const { mutate, isPending } = useAddFiltersPolicy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    trigger,
    setValue,
    getValues,
  } = useForm({
    defaultValues: filtersPolicyDefaultValues,
    resolver: yupResolver(filtersPolicyValidationSchema),
    mode: "onChange",
  });

  // Sync local state to form for validation
  useEffect(() => {
    setValue("white_entries", whiteEntries, { shouldValidate: true });
  }, [whiteEntries, setValue]);

  useEffect(() => {
    setValue("black_entries", blackEntries, { shouldValidate: true });
  }, [blackEntries, setValue]);

  const validateStep = async () => {
    // Validate Form Fields (which now include the lists due to useEffect)
    const result = await trigger();

    if (!result) {
      toast("error", "Please fix the errors in the form before proceeding");
    }
    return result;
  };

  const handleStepNavigation = async (targetStep) => {
    if (targetStep === currentStep) return true;
    const isValid = await validateStep();
    if (!isValid) return false;
    setCurrentStep(targetStep);
    return true;
  };

  const onSubmit = (formData) => {
    // Final check on list length (optional: at least one entry total?)
    if (whiteEntries.length === 0 && blackEntries.length === 0) {
      toast("warning", "Note: Both Allowed and Blocked lists are empty.");
      // We allow it, but warn user.
    }

    const data = {
      policy_name: formData.policy_name,
      is_active: formData.is_active,
      delete_mails: formData.delete_mails,
      domain: domain_name,
      white_entries: whiteEntries,
      black_entries: blackEntries,
    };

    mutate(
      { org_id: organization_id, data },
      {
        onSuccess: () => {
          toast("success", "Filters Policy created successfully");
          navigate(-1);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          toast("error", `Message: ${message}`);
          console.error(error);
        },
      },
    );
  };

  if (!permissions.includes("policy:filters:create")) {
    return (
      <AccessDenied content="Don't have the access to create filters policy." />
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
    whiteEntries,
    setWhiteEntries,
    blackEntries,
    setBlackEntries,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Filters Policies", link: "/policies/filters" },
        { name: "Add Filters policy" },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() => handleStepNavigation(1)} // Single step
      onPrevious={() => { }}
      onStepClick={() => { }}
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Create Filters Policy"
      showRequiredNote={true}
      allowStepNavigation={false}
      isEditMode={false}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default AddFiltersPolicy;
