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
import { useForm, useFieldArray } from "react-hook-form";
import { copyDataAtom, resetCopyDataAtom } from "@/store/copy";
import { useToastify } from "@/hooks/useToastify";
import { useCreateDepartment } from "@/hooks/useDepartment";
import { departmentFormSchema } from "../add/validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import DepartmentInformationStep from "../add/steps/DepartmentInfoStep";
import DepartmentDetailsStep from "../add/steps/DepartmentDetailsStep";
import { findFirstErrorStep } from "@/utils/formUtils";

const STEPS = [
  {
    id: "department-information",
    label: "Department Information",
    description: "Basic info",
    fields: ["department_name"],
  },
  {
    id: "department-details",
    label: "Department Details",
    description: "Additional info",
    fields: [],
  },
];

const getRequiredFieldsForStep = (stepIndex) => {
  return STEPS[stepIndex - 1]?.fields || [];
};

const STEP_RENDERER = {
  1: (props) => <DepartmentInformationStep {...props} />,
  2: (props) => <DepartmentDetailsStep {...props} />,
};

const CopyEditDepartment = () => {
  const navigate = useNavigate();
  const [copyData] = useAtom(copyDataAtom);
  const [, resetCopyData] = useAtom(resetCopyDataAtom);
  const { mutate, isPending } = useCreateDepartment();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
    trigger,
    getValues,
    watch,
  } = useForm({
    resolver: yupResolver(departmentFormSchema),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "department_details.authorized_persons",
  });

  useEffect(() => {
    if (!copyData?.data || copyData.type !== "department") {
      navigate("/department");
    }
  }, [copyData, navigate, toast]);

  useEffect(() => {
    if (copyData?.data) {
      reset({
        ...copyData.data,
        associated_organization_id: copyData.targetOrgId,
      });
    }
  }, [copyData, reset]);

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = getRequiredFieldsForStep(stepNumber);
    if (fieldsToValidate.length === 0) return true;

    const result = await trigger(fieldsToValidate);
    if (!result) toast("error", "Please fix errors before proceeding");
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

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      associated_organization_id: copyData.targetOrgId,
    };

    mutate(
      { data: formattedData },
      {
        onSuccess: () => {
          toast(
            "success",
            `Successfully copied department to ${copyData.targetOrgName}`,
          );
          resetCopyData();
          navigate("/department");
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

  const handleCancel = () => {
    resetCopyData();
    navigate("/department");
  };

  if (!copyData?.data) return null;

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    fields,
    append,
    remove,
    formData: getValues(),
    setValue,
    watch,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Department Management", link: "/department" },
        { name: `Copy: ${copyData.sourceName}` },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepNavigation}
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

export default CopyEditDepartment;
