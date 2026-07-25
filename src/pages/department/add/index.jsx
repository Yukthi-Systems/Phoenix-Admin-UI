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
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useFieldArray } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useCreateDepartment } from "@/hooks/useDepartment";
import { departmentDefaultValues } from "./departmentDefaultValues";
import { departmentFormSchema } from "./validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import DepartmentInformationStep from "./steps/DepartmentInfoStep";
import DepartmentDetailsStep from "./steps/DepartmentDetailsStep";
import PreviewStep from "./steps/PreviewStep";

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
  1: (props) => <DepartmentInformationStep {...props} />,
  2: (props) => <DepartmentDetailsStep {...props} />,
  3: (props) => <PreviewStep {...props} />,
};

const AddDepartment = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
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
    trigger,
    getValues,
  } = useForm({
    defaultValues: departmentDefaultValues,
    resolver: yupResolver(departmentFormSchema),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "department_details.authorized_persons",
  });

  useEffect(() => {
    if (organization_id) {
      setValue("associated_organization_id", organization_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [organization_id, setValue]);

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

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      associated_organization_id: organization_id,
      department_details: {
        address: data.department_details?.address || "",
        description: data.department_details?.description || "",
        notes: data.department_details?.notes || "",
        authorized_persons: data.department_details?.authorized_persons || [
          { name: "", email: "", phone: "" },
        ],
      },
    };

    mutate({data :formattedData, addLog: true}, {
      onSuccess: (responseData) => {
        toast("success", "Successfully created department");
        navigate(`/department/${responseData?.department_id || ""}`);
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
    });
  };

  if (!permissions.includes("department:create")) {
    return <AccessDenied content="Don't have access to create department." />;
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    formData: getValues(),
    fields,
    append,
    remove,
    setValue,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Department Management", link: "/department" },
        { name: "Add Department" },
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
      submitLabel="Create Department"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default AddDepartment;
