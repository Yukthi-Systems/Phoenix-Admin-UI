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

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

// Global State & Hooks
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useApiKeyDetails, useEditApiKey } from "@/hooks/useApiKeys";

// Components
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import FormLayout from "@/components/layouts/FormLayout";

// Steps
import BasicInfoStep from "../create/steps/BasicInfoStep";
import PermissionsStep from "../create/steps/PermissionStep";
import PreviewStep from "../create/steps/PreviewStep";
import { apiKeyValidationSchema } from "../create/validationSchema";
import { apiKeyDefaultValues } from "../create/defaultValues";

const EditApiKeys = () => {
  const { t } = useTranslation();
  const { api_key_id: apiKeyId } = useParams();
  const navigate = useNavigate();

  // State
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  
  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // API Hooks
  const { mutate, isPending } = useEditApiKey();
  const {
    data: apiKeyData,
    isLoading,
    isError,
    error,
  } = useApiKeyDetails(organization_id, apiKeyId);

  // 1. Form Setup
  const methods = useForm({
    resolver: yupResolver(apiKeyValidationSchema),
    defaultValues: apiKeyDefaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = methods;

  // 2. Pre-fill Data & Mark Steps Completed
  useEffect(() => {
    if (apiKeyData) {
      // Transform details object {key: value} back to array [{key, value}] for the form
      const customDetailsArray = apiKeyData.details
        ? Object.entries(apiKeyData.details)
            .filter(([key]) => key !== "created_by" && key !== "description")
            .map(([key, value]) => ({ key, value }))
        : [];

      reset({
        key_name: apiKeyData.key_name || "",
        description: apiKeyData.details?.description || "",
        created_by: apiKeyData.details?.created_by || "",
        permissions: apiKeyData.permissions || [],
        custom_details: customDetailsArray,
      });

      // Mark first two steps as completed since we are in edit mode with existing data
      setCompletedSteps([1, 2]);
    }
  }, [apiKeyData, reset]);

  // 3. Define Steps
  const steps = [
    { label: t("Basic Info"), component: <BasicInfoStep /> },
    { label: t("Permissions"), component: <PermissionsStep /> },
    { label: t("Preview"), component: <PreviewStep /> },
  ];

  // 4. Validation Logic
  const validateStep = async (stepNumber) => {
    let isValid = false;

    switch (stepNumber) {
      case 1:
        isValid = await trigger([
          "key_name",
          "created_by",
          "description",
          "custom_details",
        ]);
        break;
      case 2:
        isValid = await trigger("permissions");
        break;
      case 3:
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

  // 5. Navigation Handlers
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

    // Allow flexible navigation in Edit mode if steps are completed
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

  // 6. Handle Submission
  const onSubmit = (data) => {
    const detailsObject = {
      // Preserve the original creator or use form data
      created_by: apiKeyData?.details?.created_by || data.created_by,
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

    mutate(
      {
        organizationId: organization_id,
        apiKeyId,
        activate: true,
        data: payload,
      },
      {
        onSuccess: () => {
          navigate("/keys");
          toast.success(t("API Key updated successfully"));
        },
        onError: (err) => {
          console.error("Failed to update API Key", err);
          toast.error(t("Failed to update API Key"));
        },
      },
    );
  };

  // 7. Error & Loading States
  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("api_keys:edit")) {
    return (
      <AccessDenied
        content={t("You do not have permission to edit API Keys.")}
      />
    );
  }

  if (isError && isServerError) {
    return (
      <DataFechError content={t("Error while loading API Key details.")} />
    );
  }

  if (isLoading) {
    return <DataLoading content={t("Loading API Key details...")} />;
  }

  if (isError && !isServerError) {
    return (
      <DataErrorWithReload
        content={error?.response?.data?.message || t("Failed to load data")}
      />
    );
  }

  return (
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
          { name: apiKeyData?.key_name || t("Edit"), link: null },
        ]}
        submitLabel={t("Update API Key")}
        allowStepNavigation={true}
        isEditMode={true}
      >
        <div className="min-h-[400px]">
          {steps[currentStep - 1].component}
        </div>
      </FormLayout>
    </FormProvider>
  );
};

export default EditApiKeys;