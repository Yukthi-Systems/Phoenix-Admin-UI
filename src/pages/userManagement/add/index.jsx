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
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useAddUser } from "@/hooks/useUser";
import { userDefaultValue } from "./userDefaultValues";
import { userFormSchema } from "./validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import UserDetailsStep from "./steps/UserDetailsStep";
import PermissionsStep from "./steps/PermissionStep";
import AdditionalDetailsStep from "./steps/AdditionalDetail";
import PreviewStep from "./steps/PreviewStep";

const STEPS = [
  {
    id: "user-details",
    label: "User Details",
    description: "Basic info",
    fields: [
      "user_name",
      "display_name",
      "user_email",
      "primary_phone_number_with_country_code",
      "password",
      "confirm_password",
      "activate",
    ],
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Access control",
    fields: ["permissions"], // Custom validation
  },
  {
    id: "additional-details",
    label: "Additional Details",
    description: "Personal info",
    fields: [
      "user_details.first_name",
      "user_details.last_name",
      "user_details.other_email",
      "user_details.timezone",
      "user_details.locale",
      "user_details.address",
      "user_details.city",
      "user_details.state",
      "user_details.country",
      "user_details.zip_code",
    ],
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
  1: (props) => <UserDetailsStep {...props} />,
  2: (props) => <PermissionsStep {...props} />,
  3: (props) => <AdditionalDetailsStep {...props} />,
  4: (props) => <PreviewStep {...props} />,
};

const AddUser = () => {
  const { permissions = [], permissions_template: UserTemplate = [] } =
    useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useAddUser();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Permission template state
  const [templateList, setTemplateList] = useState({});
  const [template, setTemplate] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    trigger,
    getValues,
  } = useForm({
    defaultValues: userDefaultValue,
    resolver: yupResolver(userFormSchema),
    mode: "onChange",
  });


  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(timezone == 'Asia/Calcutta') {
      setValue("user_details.timezone", 'Asia/Kolkata');
    }else{
      setValue("user_details.timezone", timezone);
    }
  }, []);


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

  function getObjectByKey(object, key) {
    if (object.hasOwnProperty(key)) {
      return { [key]: object[key] };
    }
    return null;
  }

  const handleAdd = (selectedOption) => {
    setTemplate(selectedOption?.value);
    let value = getObjectByKey(UserTemplate, selectedOption?.value);
    let newPer = Object.values(value || {}).flat() || [];
    setTemplateList(value);
    const newPermissions = [...newPer];
    setValue("permissions", newPermissions);
  };

  const deleteTemplate = (name) => {
    let value = getObjectByKey(UserTemplate, name);
    let newPer = Object.values(value || {}).flat() || [];
    const currentPermissions = watch("permissions") || [];
    let result = currentPermissions.filter((val) => !newPer.includes(val));

    setTemplateList((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setValue("permissions", result);
  };

  const onSubmit = (formData) => {
    let perValue = { ...templateList };
    const data = {
      ...formData,
      base64_password: btoa(formData.password),
      organization_id: organization_id,
      permissions_template: perValue,
      ui_info: {},
    };
    delete data.password;
    delete data.confirm_password;

    mutate(data, {
      onSuccess: () => {
        toast("success", "Successfully added user");
        navigate(`/user`);
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

  if (!permissions.includes("user:create")) {
    return <AccessDenied content="Don't have access to create users." />;
  }

  const optionsPermission = Object.entries(UserTemplate || {}).map(
    ([key, value]) => ({
      value: key,
      label: key,
    }),
  );

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    setValue,
    getValues,
    formData: getValues(),
    // Permissions
    templateList,
    template,
    optionsPermission,
    handleAdd,
    deleteTemplate,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "User Management", link: "/user" },
        { name: "Add User" },
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
      submitLabel="Create User"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default AddUser;
