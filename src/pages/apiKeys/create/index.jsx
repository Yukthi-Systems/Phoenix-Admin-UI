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

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useCreateApiKey } from "@/hooks/useApiKeys";
import { apiKeyDefaultValues } from "./defaultValues";
import { apiKeyValidationSchema } from "./validationSchema";
import BasicInfoStep from "./steps/BasicInfoStep";
import PermissionsStep from "./steps/PermissionStep";
import PreviewStep from "./steps/PreviewStep";
import FormLayout from "@/components/layouts/FormLayout";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import AccessDenied from "@/components/common/AccessDenied";
import ApiKeySuccessModal from "./ApiKeySuccessModal";

const CreateApiKeys = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for Stepper
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // State for Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState(null);

  // Global State
  const { organization_id } = useAtomValue(userInfoAtom);
  const profile = useAtomValue(userProfileAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  // API Hook
  const { mutate: createApiKey, isPending } = useCreateApiKey();

  // Form Setup
  const methods = useForm({
    resolver: yupResolver(apiKeyValidationSchema),
    defaultValues: apiKeyDefaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;

  // Define Steps
  const steps = [
    { label: t("Basic Info"), component: <BasicInfoStep /> },
    { label: t("Permissions"), component: <PermissionsStep /> },
    { label: t("Preview"), component: <PreviewStep /> },
  ];

  // Validation Logic per step
  const validateStep = async (stepNumber) => {
    let isValid = false;

    switch (stepNumber) {
      case 1:
        // Validate Basic Info fields
        isValid = await trigger([
          "key_name",
          "created_by",
          "description",
          "custom_details",
        ]);
        break;
      case 2:
        // Validate Permissions
        isValid = await trigger("permissions");
        break;
      case 3:
        // Preview step is always valid if we got here
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      const hasKeyError = errors.key_name;
      const hasDetailError = errors.custom_details;
      const hasPermError = errors.permissions;

      if (hasKeyError) {
        toast.error(t("Key Name is required"));
      } else if (hasDetailError) {
        toast.error(t("Please fill in all metadata fields"));
      } else if (hasPermError) {
        toast.error(t("Please select at least one permission"));
      } else {
        toast.error(t("Please fix the errors before proceeding"));
      }
    }

    return isValid;
  };

  // Stepper Navigation Handlers
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);

    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = async (stepIndex) => {
    if (stepIndex === currentStep) return;

    // Logic to allow jumping back or to immediate next step
    if (
      stepIndex < currentStep ||
      completedSteps.includes(stepIndex) ||
      stepIndex === currentStep + 1
    ) {
      if (stepIndex > currentStep) {
        const isValid = await validateStep(currentStep);
        if (!isValid) return;

        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
      }
      setCurrentStep(stepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Submission Handler
  const onSubmit = (data) => {
    const detailsObject = {
      created_by: `${profile?.user_email || "User"} (${profile?.user_name || "Admin"})`,
      description: data.description,
    };

    if (data.custom_details && data.custom_details.length > 0) {
      data.custom_details.forEach((item) => {
        if (item.key && item.value) {
          detailsObject[item.key] = item.value;
        }
      });
    }

    const payload = {
      key_name: data.key_name,
      details: detailsObject,
      permissions: data.permissions || [],
    };

    createApiKey(
      { organizationId: organization_id, data: payload },
      {
        onSuccess: (responseData) => {
          // Prepare data for the success modal
          setCreatedKeyData({
            ...responseData,
            created_by: detailsObject.created_by,
            description: detailsObject.description,
            details: detailsObject,
            key_name: data.key_name,
            permissions: data.permissions,
          });
          setShowSuccessModal(true);
        },
      },
    );
  };
  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/keys");
  };

  if (!permissions.includes("api_keys:create")) {
    return (
      <AccessDenied content="You do not have permission to create API Keys." />
    );
  }

  return (
    <>
      <FormProvider {...methods}>
        <FormLayout
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStepClick={handleStepClick}
          onSubmit={handleSubmit(onSubmit)}
          isPending={isPending}
          breadcrumbItems={[
            { name: t("Settings"), link: "/settings" },
            { name: t("API Keys"), link: "/keys" },
            { name: t("Create"), link: null },
          ]}
          submitLabel={t("Create API Key")}
          allowStepNavigation={true}
        >
          <div className="min-h-[400px]">{steps[currentStep - 1].component}</div>
        </FormLayout>
      </FormProvider>

      {/* Success Modal */}
      <ApiKeySuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        data={createdKeyData}
      />
    </>
  );
};

export default CreateApiKeys;