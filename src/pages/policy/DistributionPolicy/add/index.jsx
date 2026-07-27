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

import React, { useState } from 'react'
import PolicyInformationStep from './stepper/PolicyInfoStep';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userInfoAtom } from '@/store/userInfo';
import { userProfileAtom } from '@/store/userProfile';
import { useToastify } from '@/hooks/useToastify';
import { distributionPolicyValidationSchema } from './validationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { distributionPolicyDefaultValues } from './distributionPolicyDefaultValues';
import { useForm } from 'react-hook-form';
import { useAddDistributionPolicy } from '@/hooks/useDistributionPolicy';
import MailInfoStep from './stepper/MailInfoStep';
import StepperFormLayout from '@/components/layouts/FormLayout';
import PreviewStep from './stepper/PreviewStep';
import AccessDenied from '@/components/common/AccessDenied';

const STEPS = [
  {
    id: "policy-information",
    label: "Policy Information",
    description: "Basic details",
    fields: ["policy_name", "is_active", "domain_name", "policy_description"],
  },
  {
    id: "additional",
    label: "Additional",
    description: "Additional",
    fields: [],
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review details",
    fields: [],
  },
]
// Helper: Get required fields for step
const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

// Step renderer map
const STEP_RENDERER = {
  1: (props) => <PolicyInformationStep {...props} />,
  2: (props) => <MailInfoStep {...props} />,
  3: (props) => <PreviewStep {...props} />,
}


function AddDistributionPolicy() {
  const { domain_name } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();
  const [externalList, setExternalList] = useState([]);
  const [internalList, setInternalList] = useState([]);
  const [specificEmails, setSpecificEmails] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { mutate, isPending } = useAddDistributionPolicy();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    defaultValues: distributionPolicyDefaultValues,
    resolver: yupResolver(distributionPolicyValidationSchema),
    mode: "onChange",
  });

  const validateMembers = () => {
    if (internalList.length === 0 && externalList.length === 0) {
      toast("error", "Add at least one Internal or External member");
      return false;
    }
    return true;
  };

  const validateStep = async (stepNumber) => {
    if (stepNumber === 2 && !validateMembers()) return false;

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
        if (!validateMembers()) return;
        const data = {
            ...formData,
            domain_name: domain_name,
            internal_members: internalList,
            external_members: externalList,
            specific_emails: specificEmails,
        }
        mutate(
            { org_id: organization_id, data },
            {
                onSuccess: () => {
                    toast("success", "Distribution Policy created successfully");
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
    }

    if (!permissions.includes("policy:distribution:create")) {
        return (
            <AccessDenied content="Don't have permission to create distribution policy." />
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
        externalList, 
        setExternalList,
        internalList, 
        setInternalList,
        specificEmails, 
        setSpecificEmails
    }

  return (
           <StepperFormLayout
            breadcrumbItems={[
                { name: "Distribution Policies", link: "/policies/distribution" },
                { name: "Add Distribution Policy" },
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
            submitLabel="Create Distribution Policy"
            showRequiredNote={true}
            allowStepNavigation={true}
            isEditMode={false}
        >
            {StepComponent ? <StepComponent {...stepProps} /> : null}
        </StepperFormLayout>
  )
}

export default AddDistributionPolicy