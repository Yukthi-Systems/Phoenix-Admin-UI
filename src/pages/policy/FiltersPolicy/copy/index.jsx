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
import { useAddFiltersPolicy } from "@/hooks/useFiltersPolicy";
import { filtersPolicyDefaultValues } from "../add/filtersPolicyDefaultValues";
import { filtersPolicyValidationSchema } from "../add/validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyConfigurationStep from "../add/step/PolicyConfigurationStep";

const STEPS = [
  {
    id: "configuration",
    label: "Configuration",
    description: "Policy settings & lists",
    fields: ["policy_name", "is_active", "white_entries", "black_entries"],
  },
];

// Step renderer map
const STEP_RENDERER = {
  1: (props) => <PolicyConfigurationStep {...props} />,
};

const CopyFiltersPolicy = () => {
  const { copy_domain_name } = useParams();
  const location = useLocation();
  const { fullData: data } = location.state || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);

  // Local state for lists
  const [whiteEntries, setWhiteEntries] = useState([]);
  const [blackEntries, setBlackEntries] = useState([]);

  const { mutate, isPending } = useAddFiltersPolicy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    trigger,
    getValues,
    setValue,
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
    const result = await trigger();
    if (!result) {
      toast("error", "Please fix the errors in the form before proceeding");
    }
    return result;
  };

  const onSubmit = (formData) => {
    // Optional warning if both lists are empty
    if (whiteEntries.length === 0 && blackEntries.length === 0) {
      toast("warning", "Note: Both Allowed and Blocked lists are empty.");
    }

    const payload = {
      policy_name: formData.policy_name,
      is_active: formData.is_active,
      white_entries: whiteEntries,
      black_entries: blackEntries,
      domain: copy_domain_name, // Use the target domain
    };

    mutate(
      { org_id: organization_id, data: payload },
      {
        onSuccess: () => {
          toast("success", "Filters Policy copied successfully");
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

  // Populate form with copied data
  useEffect(() => {
    if (data) {
      reset({
        domain: copy_domain_name || "",
        policy_name: data?.policy_name || "", // Often user might want to rename, but we prefill original
        is_active: data?.is_active ?? true,
      });

      // Populate lists
      setWhiteEntries(data?.white_entries || []);
      setBlackEntries(data?.black_entries || []);
    }
  }, [data, reset, copy_domain_name]);

  if (!permissions.includes("policy:filters:create")) {
    return (
      <AccessDenied content="Don't have the access to copy filters policy." />
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
    whiteEntries,
    setWhiteEntries,
    blackEntries,
    setBlackEntries,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Filters Policies", link: "/policies/filters" },
        { name: "Copy Filters policy" },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      // completedSteps is not strictly needed for single step, but kept for layout compat
      completedSteps={[]}
      onNext={() => {}}
      onPrevious={() => {}}
      onStepClick={() => {}}
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Copy Filters Policy"
      showRequiredNote={true}
      allowStepNavigation={false}
      isEditMode={true} // Using edit mode layout style usually looks fine for copy
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default CopyFiltersPolicy;
