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
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { copyDataAtom, resetCopyDataAtom } from "@/store/copy";
import { useToastify } from "@/hooks/useToastify";
import { useCreateCaution } from "@/hooks/useCautions";
import { cautionFormSchema } from "../add/validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import BasicInformationStep from "../add/steps/BasicInfo";
import ContentStep from "../add/steps/ContentStep";
import { findFirstErrorStep } from "@/utils/formUtils";

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
];

const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

const STEP_RENDERER = {
  1: (props) => <BasicInformationStep {...props} />,
  2: (props) => <ContentStep {...props} />,
};

const CopyEditCaution = () => {
  const navigate = useNavigate();
  const [copyData, setCopyData] = useAtom(copyDataAtom);
  const [, resetCopyData] = useAtom(resetCopyDataAtom);
  const { mutate, isPending } = useCreateCaution();
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
    resolver: yupResolver(cautionFormSchema),
    mode: "onChange",
  });

  // Redirect if no copy data
  useEffect(() => {
    if (!copyData?.data || copyData.type !== "caution") {
      navigate("/caution");
    }
  }, [copyData, navigate, toast]);

  // Initialize form with copy data
  useEffect(() => {
    if (copyData?.data) {
      reset({
        ...copyData.data,
        associated_organization_id: copyData.targetOrgId,
      });
    }
  }, [copyData, reset]);

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

  const handleFormError = (formErrors) => {
    const errorStep = findFirstErrorStep(formErrors, STEPS);
    if (errorStep) {
      setCurrentStep(errorStep);

      const stepLabel = STEPS[errorStep - 1].label;

      toast("error", `Please fix errors in step: ${stepLabel}`);
    } else {
      toast("error", "Please review the form for errors.");
    }
  };

  const handleStepNavigation = async (targetStep) => {
    if (targetStep === currentStep) return true;

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
      associated_organization_id: copyData.targetOrgId,
    };

    mutate(
      { data },
      {
        onSuccess: () => {
          toast(
            "success",
            `Successfully copied caution to ${copyData.targetOrgName}`,
          );
          resetCopyData();
          navigate("/caution");
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

  const handleCancel = () => {
    resetCopyData();
    navigate("/caution");
  };

  if (!copyData?.data) {
    return null;
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
        { name: `Copy: ${copyData.sourceName}` },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepClick}
      onSubmit={handleSubmit(onSubmit, handleFormError)}
      onCancel={handleCancel}
      isPending={isPending}
      submitLabel={`Copy to ${copyData.targetOrgName}`}
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default CopyEditCaution;
