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
import { useParams, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import {
  useUpdateDisclaimer,
  useGetDisclaimerDetails,
} from "@/hooks/useDisclaimers";
import { useAIStyleGenerate } from "@/hooks/useAiHelp"; // Import AI Hook
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import { disclaimerFormSchema } from "../add/validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import BasicInformationStep from "./steps/BasicInfoStep";
import ContentStep from "./steps/ContentStep";

const STEPS = [
  {
    id: "basic-information",
    label: "Basic Information",
    description: "Details & settings",
    fields: ["disclaimer_name", "details.description"],
  },
  {
    id: "content",
    label: "Content",
    description: "Text & HTML",
    fields: ["text_content", "html_content"],
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
  1: (props) => <BasicInformationStep {...props} />,
  2: (props) => <ContentStep {...props} />,
};

const EditDisclaimer = () => {
  const { disclaimer_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateDisclaimer();
  
  // Use AI Hook
  const { mutateAsync: generateStyle, isPending: isGeneratingAi } = useAIStyleGenerate();
  
  const toast = useToastify();

  const { data, isLoading, isError, error } = useGetDisclaimerDetails(
    organization_id,
    disclaimer_id,
  );
  const disclaimer = data?.data;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    control,
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(disclaimerFormSchema),
    mode: "onChange",
  });

  const watchedValues = {
    htmlContent: watch("html_content"),
    textContent: watch("text_content"),
  };

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

  const handleTextContentChange = (value) => {
    setValue("text_content", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleHtmlGenerated = (generatedHtml) => {
    setValue("html_content", generatedHtml, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (formData) => {
    let finalHtmlContent = formData.html_content;

    // Auto-generate HTML if missing but Text exists
    if (formData.text_content && !formData.html_content) {
      toast("info", "Auto-generating HTML content from your text...");
      const prompt = `Generate a very good stylish email footer in HTML format with inline CSS styles with the text: "${formData.text_content.trim()}"`;

      try {
        const response = await generateStyle(prompt);
        if (response?.data?.answer) {
          finalHtmlContent = response.data.answer;
          // Update form state for consistency
          setValue("html_content", finalHtmlContent, { shouldValidate: true });
          toast("success", "HTML Generated automatically.");
        } else {
          toast("error", "Failed to auto-generate HTML. Please try manually.");
          return; // Stop submission
        }
      } catch (error) {
        console.error("Auto-generation failed", error);
        toast("error", "Failed to auto-generate HTML. Please try manually.");
        return; // Stop submission
      }
    }

    const data = {
      ...formData,
      html_content: finalHtmlContent, // Use generated content if applicable
      associated_organization_id: organization_id,
    };

    mutate(
      {
        disclaimer_id,
        data,
      },
      {
        onSuccess: () => {
          toast("success", "Successfully updated disclaimer");
          navigate(`/disclaimer`);
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
    if (disclaimer) {
      reset({
        disclaimer_name: disclaimer.disclaimer_name || "",
        html_content: disclaimer.html_content || "",
        text_content: disclaimer.text_content || "",
        details: {
          description: disclaimer.info?.description || "",
        },
        associated_organization_id: organization_id,
      });
    }
  }, [disclaimer, organization_id, reset]);

  useEffect(() => {
    if (organization_id) {
      setValue("associated_organization_id", organization_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [organization_id, setValue]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("disclaimer:edit")) {
    return <AccessDenied content="Don't have access to edit disclaimer." />;
  }

  if (isError && isServerError) {
    return <DataFechError content="Error while loading disclaimer details." />;
  }

  if (isLoading) {
    return <DataLoading content="Loading disclaimer details for editing." />;
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    setValue,
    htmlContent: watchedValues.htmlContent,
    textContent: watchedValues.textContent,
    handleTextContentChange,
    handleHtmlGenerated,
    formData: getValues(),
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Disclaimer Management", link: "/disclaimer" },
        {
          name: disclaimer?.disclaimer_name || "Edit Disclaimer",
          link: `/disclaimer/${disclaimer_id}`,
        },
        { name: "Edit" },
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
      isPending={isPending || isGeneratingAi} // Block submission while generating
      submitLabel="Update Disclaimer"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditDisclaimer;