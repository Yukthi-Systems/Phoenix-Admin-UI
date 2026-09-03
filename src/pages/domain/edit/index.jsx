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

import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";
import { domainFormSchema } from "./validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useGetDomain, useUpdateDomain } from "@/hooks/useDomain";
import { useToastify } from "@/hooks/useToastify";
import { domainDefaultValues } from "./domainDefaultValues";
import { useNavigate, useParams } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import AccessDenied from "@/components/common/AccessDenied";
import DomainDetailsStep from "./steps/DomainDetailsStep";
import DomainPropertiesStep from "./steps/DomainPropertiesStep";
import PasswordPropertiesStep from "./steps/PasswordPropertiesStep";
import SpamDestinationStep from "./steps/SpamDestination";
import StepperFormLayout from "@/components/layouts/FormLayout";
import DataFechError from "@/components/common/DataFechError";
import DataLoading from "@/components/common/DataLoading";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { normalizeDomainDetailsForForm } from "@/utils/domainUtils";

const STEPS = [
  {
    id: "domain-details",
    label: "Domain Details",
    description: "Basic information",
    fields: [
      "domain_name",
      "anti_phishing_secret_code",
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
      "hybrid_connector_properties.port",
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
];

// Helper: Get conditional required fields
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

  // Conditionally remove fields based on toggles
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

// Helper: Transform form data for API submission
const transformFormData = (
  formData,
  organizationId,
  domainName,
  enableMaxPasswordAge,
) => {
  const data = {
    ...formData,
    domain_name: formData.domain_name.toLowerCase(),
  };

  data.max_password_age_properties = {
    enable_max_password_age: enableMaxPasswordAge,
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

  // Remove form-only fields
  delete data.enable_max_password_age;
  delete data.notify_1;
  delete data.notify_2;
  delete data.notify_3;

  return data;
};

// Step renderer map
const STEP_RENDERER = {
  1: (props) => <DomainDetailsStep {...props} />,
  2: (props) => <DomainPropertiesStep {...props} />,
  3: (props) => <PasswordPropertiesStep {...props} />,
  4: (props) => <SpamDestinationStep {...props} />,
};

const EditDomain = () => {
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { domain_name: rawDomainName } = useParams();
  const domain_name = decodeURIComponent(rawDomainName);

  const { data, isLoading, isError, error } = useGetDomain(domain_name);
  const domain = data?.domain_details ?? null;
  const { mutate, isPending } = useUpdateDomain();
  const toast = useToastify();
  const navigate = useNavigate();

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
    setValue,
  } = useForm({
    defaultValues: domainDefaultValues,
    resolver: yupResolver(domainFormSchema),
    mode: "onChange",
  });

  const watchedValues = {
    spam_destination: watch("spam_destination"),
    enable_catch_all: watch("enable_catch_all"),
    enable_hybrid_mode: watch("enable_hybrid_mode"),
    enable_max_password_age: watch("enable_max_password_age"),
  };

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

  const onSubmit = (formData) => {
    const data = transformFormData(
      formData,
      organization_id,
      domain_name,
      watchedValues.enable_max_password_age,
    );

    mutate(
      { organization_id, domain_name: rawDomainName, data },
      {
        onSuccess: (res) => {
          toast("success", `Successfully updated domain: ${rawDomainName}`);
          navigate(-1);
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
    if (domain) {
      reset(normalizeDomainDetailsForForm(domain));
    }
  }, [domain, reset]);

  useEffect(() => {
    switch (watchedValues.spam_destination) {
      case "SPAM":
        setValue("spam_destination_properties.description", "Mails will move to spam folder if its spam and folder is present");
        break;
      case "FOLDER":
        setValue("spam_destination_properties.description", "Mails will be moved to a user-created folder if it exists");
        break;
      case "TRASH":
        setValue("spam_destination_properties.description", "Mails will be moved to the Trash folder");
        break;
      case "DELETE":
        setValue("spam_destination_properties.description", "Mails will be permanently deleted and cannot be recovered");
        break;
      case "SEND_DIGEST":
        setValue("spam_destination_properties.description", "Mails will be grouped and sent as a summary (digest) at scheduled intervals");
        break;
      case "INBOX":
        setValue("spam_destination_properties.description", "Mails will be delivered to the main inbox folder");
        break;
      default:
        break;
    }
  }, [watchedValues.spam_destination]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("domain:edit")) {
    return <AccessDenied content="Don't have access to edit domain." />;
  }

  if (isError && isServerError) {
    return <DataFechError content="Domain details getting error...!" />;
  }

  if (isLoading) {
    return <DataLoading content="Domain details loading...!" />;
  }

  if (isError && !isServerError) {
    return <DataErrorWithReload content={error?.response?.data?.message} />;
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    organization_id,
    domain_name,
    formData: getValues(),
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Domain", link: "/domain" },
        { name: "Edit Domain" },
      ]}
      steps={STEPS}
      docId="domain/edit"
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepClick}
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Update Domain"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditDomain;
