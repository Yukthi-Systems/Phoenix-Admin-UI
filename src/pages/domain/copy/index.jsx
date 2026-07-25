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
import { useAddDomain } from "@/hooks/useDomain";
import { domainFormSchema } from "../add/validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import DomainDetailsStep from "../add/steps/DomainDetailsStep";
import DomainPropertiesStep from "../add/steps/DomainPropertiesStep";
import PasswordPropertiesStep from "../add/steps/PasswordPropertiesStep";
import SpamDestinationStep from "../add/steps/SpamDestination";
import DomainPreviewStep from "../add/steps/DomainPreview";
import { findFirstErrorStep } from "@/utils/formUtils";

const STEPS = [
  {
    id: "domain-details",
    label: "Domain Details",
    description: "Basic information",
    fields: [
      "domain_name",
      "anti_phishing_secret_code",
      "details.description",
      "details.address",
    ],
  },
  {
    id: "domain-properties",
    label: "Domain Properties",
    description: "Advanced settings",
    fields: [
      "enable_catch_all",
      "catch_all_forwarding_address",
      "enable_hybrid_mode",
      "hybrid_connector_properties.description",
      "hybrid_connector_properties.fqdn",
      "hybrid_connector_properties.ipv4",
    ],
  },
  {
    id: "password-properties",
    label: "Password Properties",
    description: "Security settings",
    fields: [
      "session_timeout",
      "enable_max_password_age",
      "max_password_age",
      "notify_1",
      "notify_2",
      "notify_3",
    ],
  },
  {
    id: "spam-destination",
    label: "Spam & Templates",
    description: "Configuration",
    fields: [
      "spam_destination",
      "spam_destination_properties.description",
      "spam_destination_properties.folder_name",
    ],
  },
  {
    id: "preview",
    label: "Review",
    description: "Confirm details",
    fields: [],
  },
];

const getRequiredFieldsForStep = (stepIndex, watchValues) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];

  let requiredFields = [...step.fields];
  const {
    enable_catch_all,
    enable_hybrid_mode,
    enable_max_password_age,
    spam_destination,
  } = watchValues;

  if (stepIndex === 2) {
    if (!enable_catch_all)
      requiredFields = requiredFields.filter(
        (f) => f !== "catch_all_forwarding_address",
      );
    if (!enable_hybrid_mode)
      requiredFields = requiredFields.filter(
        (f) => !f.startsWith("hybrid_connector_properties"),
      );
  }

  if (stepIndex === 3) {
    if (!enable_max_password_age)
      requiredFields = requiredFields.filter(
        (f) =>
          !["max_password_age", "notify_1", "notify_2", "notify_3"].includes(f),
      );
  }

  if (stepIndex === 4 && spam_destination !== "Folder") {
    requiredFields = requiredFields.filter(
      (f) => f !== "spam_destination_properties.folder_name",
    );
  }

  return requiredFields;
};

const transformFormData = (formData, organizationId, enableMaxPasswordAge) => {
  const data = {
    ...formData,
    organization_id: organizationId,
    domain_name: formData.domain_name.toLowerCase(),
    filter_policy_id: null,
    max_password_age_properties: {
      enable_max_password_age: enableMaxPasswordAge,
    },
  };

  if (enableMaxPasswordAge) {
    data.max_password_age_properties.max_password_age =
      formData.max_password_age;
    data.max_password_age_properties.notify_at = [
      formData.notify_1,
      formData.notify_2,
      formData.notify_3,
    ]
      .filter((v) => v !== undefined && v !== null)
      .sort((a, b) => a - b);
  } else {
    data.max_password_age = 0;
    data.max_password_age_properties.max_password_age = 0;
    data.max_password_age_properties.notify_at = [];
  }

  delete data.enable_max_password_age;
  delete data.notify_1;
  delete data.notify_2;
  delete data.notify_3;

  return data;
};

const STEP_RENDERER = {
  1: (props) => <DomainDetailsStep {...props} />,
  2: (props) => <DomainPropertiesStep {...props} />,
  3: (props) => <PasswordPropertiesStep {...props} />,
  4: (props) => <SpamDestinationStep {...props} />,
  5: (props) => <DomainPreviewStep {...props} />,
};

const CopyEditDomain = () => {
  const navigate = useNavigate();
  const [copyData] = useAtom(copyDataAtom);
  const [, resetCopyData] = useAtom(resetCopyDataAtom);
  const { mutate, isPending } = useAddDomain();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(domainFormSchema),
    mode: "onChange",
  });

  const watchedValues = {
    spam_destination: watch("spam_destination"),
    enable_catch_all: watch("enable_catch_all"),
    enable_hybrid_mode: watch("enable_hybrid_mode"),
    enable_max_password_age: watch("enable_max_password_age"),
  };

  useEffect(() => {
    if (!copyData?.data || copyData.type !== "domain") {
      navigate("/domain");
    }
  }, [copyData, navigate]);

  useEffect(() => {
    if (copyData?.data) {
      reset({
        ...copyData.data,
        organization_id: copyData.targetOrgId,
      });
    }
  }, [copyData, reset]);

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = getRequiredFieldsForStep(
      stepNumber,
      watchedValues,
    );
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

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

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

  const onSubmit = (formData) => {
    const data = transformFormData(
      formData,
      copyData.targetOrgId,
      watchedValues.enable_max_password_age,
    );

    mutate({ data, addLog: false }, {
      onSuccess: (res) => {
        toast(
          "success",
          `Successfully copied domain to ${copyData.targetOrgName}`,
        );
        resetCopyData();
        navigate("/domain");
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
    });
  };

  const handleCancel = () => {
    resetCopyData();
    navigate("/domain");
  };

  if (!copyData?.data) return null;

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    organization_id: copyData.targetOrgId,
    quota_allocated: 0, // You might want to fetch this from the target org
    quota_utilized: 0,
    formData: getValues(),
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Domain", link: "/domain" },
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

export default CopyEditDomain;
