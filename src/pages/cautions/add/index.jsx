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
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useCreateCaution } from "@/hooks/useCautions";
import { useAIStyleGenerate } from "@/hooks/useAiHelp"; // Import the AI hook here
import { cautionDefaultValue } from "./cautionsDefaultValues";
import AccessDenied from "@/components/common/AccessDenied";
import { cautionFormSchema } from "./validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import BasicInformationStep from "./steps/BasicInfo";
import ContentStep from "./steps/ContentStep";
import PreviewStep from "./steps/PreviewStep";

const STEPS = [
  {
    id: "basic-information",
    label: "Basic Information",
    description: "Details & metadata",
    fields: [
      "caution_message_name",
      "info.severity",
      "info.description",
      "info.notes",
    ],
  },
  {
    id: "content",
    label: "Content",
    description: "Text & HTML",
    fields: ["text_content", "html_content"],
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
  1: (props) => <BasicInformationStep {...props} />,
  2: (props) => <ContentStep {...props} />,
  3: (props) => <PreviewStep {...props} />,
};

const AddCaution = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateCaution();

  // Use mutateAsync to await the response
  const { mutateAsync: generateStyle, isPending: isGeneratingAi } =
    useAIStyleGenerate();

  const toast = useToastify();

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
    defaultValues: cautionDefaultValue,
    resolver: yupResolver(cautionFormSchema),
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

  // Logic to auto-generate HTML if missing
  const handleAutoGeneration = async () => {
    const textContent = getValues("text_content");
    const htmlContent = getValues("html_content");

    // Only generate if we have text but NO html
    if (textContent && !htmlContent) {
      const isTextValid = await trigger("text_content");
      if (!isTextValid) {
        return false;
      }

      toast("info", "Auto-generating HTML content from your text...");

      const prompt = `Generate an HTML email caution banner fragment using only inline CSS styles. Do NOT include html, head, body, script, or style tags — output only the inner HTML content that can be injected directly into an email body. Text: "${textContent.trim()}"`;

      try {
        const response = await generateStyle(prompt);
        if (response?.data?.answer) {
          const sanitized = response.data.answer
            .replace(/```html\s*/gi, "")
            .replace(/```\s*/g, "")
            .replace(/<\/?(?:html|head|body|title|meta|script|style|link)\b[^>]*>/gi, "")
            .trim();
          setValue("html_content", sanitized, {
            shouldValidate: true,
            shouldDirty: true,
          });
          toast("success", "HTML Generated automatically.");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Auto-generation failed", error);
        toast("error", "Failed to auto-generate HTML. Please try manually.");
        return false;
      }
    }
    return true; // proceed if HTML already exists or no Text
  };

  const handleStepNavigation = async (targetStep) => {
    if (targetStep === currentStep) return true;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    // Special Check: Leaving Content Step (Step 2)
    if (currentStep === 2) {
      const isAutoGenerated = await handleAutoGeneration();
      if (!isAutoGenerated) return false; // Stop if generation failed
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

  const onSubmit = (formData) => {
    const data = {
      ...formData,
      associated_organization_id: organization_id,
    };

    mutate(
      { data, addLog: true },
      {
        onSuccess: (responseData) => {
          toast("success", "Successfully created caution message");
          navigate(`/caution/${responseData?.caution_id || ""}`);
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
    if (organization_id) {
      setValue("associated_organization_id", organization_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      reset();
      setCurrentStep(1);
      setCompletedSteps([]);
    }
  }, [organization_id, setValue, reset]);

  if (!permissions.includes("caution:create")) {
    return <AccessDenied content="Don't have access to create caution." />;
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
        { name: "Caution Management", link: "/caution" },
        { name: "Add Caution" },
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
      isPending={isPending || isGeneratingAi} // Block submission while auto-generating
      submitLabel="Create Caution"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default AddCaution;
