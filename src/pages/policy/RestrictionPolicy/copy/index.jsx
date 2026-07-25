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

import { useAddRestrictionPolicy } from "@/hooks/useRestrictionPolicy";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyInformationStep from "../add/steps/PolicyInfoStep";
import GeoIPRestrictions from "../add/steps/GeoIPRestrictions";
import { restrictionPolicyDefaultValues } from "../add/restrictionPolicyDefaultValues";
import { restrictionPolicyValidationSchema } from "../add/validationSchema";

const STEPS = [
  {
    id: "policy-information",
    label: "Policy Information",
    description: "Basic details",
    fields: ["policy_name", "is_active", "domain_name", "policy_description"],
  },
  {
    id: "restrictions",
    label: "Restrictions",
    description: "Geo & IP",
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
  2: (props) => <GeoIPRestrictions {...props} />,
};

const CopyRestrictionPolicy = () => {
  const { copy_domain_name } = useParams();
  const location = useLocation();
  const { fullData: data } = location.state;
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();
  const [geoList, setGeoList] = useState([]);
  const [ipList, setIpList] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { mutate, isPending } = useAddRestrictionPolicy();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger,
    getValues,
    reset,
  } = useForm({
    defaultValues: restrictionPolicyDefaultValues,
    resolver: yupResolver(restrictionPolicyValidationSchema),
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

  useEffect(() => {
    if (data) {
      reset({
        is_active: data?.is_active || false,
        policy_name: data?.policy_name || "",
        domain_name: copy_domain_name || "",
        policy_description: data?.policy_description || "",
      });
      setGeoList(data?.geo_restriction || []);
      setIpList(data?.ip_restriction || []);
    }
  }, [data, reset, copy_domain_name]);

  const onSubmit = (formData) => {
    const data = {
      ...formData,
      geo_restrictions: geoList,
      ip_restrictions: ipList,
    };
    mutate(
      { org_id: organization_id, data },
      {
        onSuccess: () => {
          toast("success", "Restriction Policy copied successfully");
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

  if (!permissions.includes("policy:restriction:edit")) {
    return (
      <AccessDenied content="Don't have permission to copy restriction policy." />
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
    geoList,
    setGeoList,
    ipList,
    setIpList,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Restrictions Policies", link: "/policies/restrictions" },
        { name: "Copy Restrictions Policy" },
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
      submitLabel="Copy Restrictions Policy"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default CopyRestrictionPolicy;
