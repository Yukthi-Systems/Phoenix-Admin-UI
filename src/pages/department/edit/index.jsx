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
import { useForm, useFieldArray } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useGetDepartment, useUpdateDepartment } from "@/hooks/useDepartment";
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import StepperFormLayout from "@/components/layouts/FormLayout";
import { departmentFormSchema } from "../add/validationSchema";
import DepartmentInformationStep from "./steps/DepartmentInfoStep";
import DepartmentDetailsStep from "./steps/DepartmentDetailsStep";

// --- Define steps (no preview step for edit)
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
    fields: [], // optional validation handled manually if needed
  },
];

// Helper: Get fields to validate for a given step
const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

// Step mapping
const STEP_RENDERER = {
  1: (props) => <DepartmentInformationStep {...props} />,
  2: (props) => <DepartmentDetailsStep {...props} />,
};

const EditDepartment = () => {
  const { department_id } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();

  const { mutate, isPending } = useUpdateDepartment();
  const { data, isLoading, isError, error } = useGetDepartment(
    organization_id,
    department_id,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
    setValue,
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

  const department = data?.data || {};

  useEffect(() => {
    if (department && Object.keys(department).length > 0) {
      const formData = {
        department_name: department.department_name || "",
        associated_organization_id: organization_id,
        department_details: {
          address: department.details?.address || "",
          description: department.details?.description || "",
          notes: department.details?.notes || "",
          authorized_persons: department.details?.authorized_persons || [
            { name: "", email: "", phone: "" },
          ],
        },
      };
      reset(formData);
    }
  }, [department, organization_id, reset]);

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

    // If moving backward, allow directly
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    // Validate before moving forward
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

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      associated_organization_id: organization_id,
    };

    mutate(
      { department_id, data: formattedData },
      {
        onSuccess: () => {
          toast("success", "Department updated successfully");
          navigate(`/department/${department_id}`);
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

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  // --- PERMISSIONS & ERROR HANDLING ---
  if (!permissions.includes("department:edit")) {
    return <AccessDenied content="Don't have access to edit department." />;
  }

  if (isLoading) {
    return <DataLoading content="Loading department details..." />;
  }

  if (isError && isServerError) {
    return <DataFechError content="Error while fetching department details" />;
  }

  if (isError && !isServerError) {
    return <DataErrorWithReload content={error?.response?.data?.message} />;
  }

  // --- Step props ---
  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    fields,
    append,
    remove,
    formData: getValues(),
    watch,
    setValue,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Department Management", link: "/department" },
        { name: department.department_name || "Department" },
        { name: "Edit Department" },
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
      submitLabel="Update Department"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditDepartment;
