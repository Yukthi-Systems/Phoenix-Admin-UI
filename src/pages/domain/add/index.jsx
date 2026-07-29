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
import { useAddDomain } from "@/hooks/useDomain";
import { useToastify } from "@/hooks/useToastify";
import { getDomainDefaultValues } from "./domainDefaultValues";
import { useNavigate } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import AccessDenied from "@/components/common/AccessDenied";
import DomainDetailsStep from "./steps/DomainDetailsStep";
import DomainPropertiesStep from "./steps/DomainPropertiesStep";
import PasswordPropertiesStep from "./steps/PasswordPropertiesStep";
import SpamDestinationStep from "./steps/SpamDestination";
import DomainPreviewStep from "./steps/DomainPreview";
import StepperFormLayout from "@/components/layouts/FormLayout";
import MessageDisplay from "@/components/common/MessageDisplay";
import DomainTxtVerificationModal from "../list/DomainTxtVerificationModal";

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
  {
    id: "preview",
    label: "Review",
    description: "Confirm details",
    fields: [],
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
const transformFormData = (formData, organizationId, enableMaxPasswordAge) => {
  const data = {
    ...formData,
    organization_id: organizationId,
    domain_name: formData.domain_name.toLowerCase(),
    filter_policy_id: null,
    // Domains always start inactive until DNS TXT ownership is verified;
    // activation only happens after a successful validation call.
    activate: false,
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
  5: (props) => <DomainPreviewStep {...props} />,
};

const AddDomain = () => {
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { mutate, isPending } = useAddDomain();
  const toast = useToastify();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [createdDomainResult, setCreatedDomainResult] = useState(null);
  // Generated once per mount, not per render - useForm only reads this on
  // its first render anyway.
  const [initialDefaultValues] = useState(getDomainDefaultValues);

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
    defaultValues: initialDefaultValues,
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

  const handleStepNavigation = async (targetStep, allowBackward = true) => {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep && allowBackward) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    // Validate current step before moving forward
    if (targetStep > currentStep || targetStep === STEPS.length) {
      const isValid = await validateStep(currentStep);
      if (!isValid) {
        setCompletedSteps(completedSteps.filter((s) => s !== currentStep));
        return false;
      }

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
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

  const onSubmit = (formData) => {
    const data = transformFormData(
      formData,
      organization_id,
      watchedValues.enable_max_password_age,
    );
    mutate(
      {
        data,
        addLog: true,
      },
      {
        onSuccess: (res) => {
          toast("success", `Successfully added domain: ${res?.domain_name}`);
          if (res?.dns_txt_verification_key) {
            setCreatedDomainResult(res);
          } else {
            navigate(-1);
          }
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
      // Regenerate the anti-phishing code on reset too, so switching
      // organizations doesn't leave a stale code sitting in the form.
      reset(getDomainDefaultValues());
      setCurrentStep(1);
      setCompletedSteps([]);
    }
  }, [organization_id, reset]);

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

  if (!permissions.includes("domain:create")) {
    return <AccessDenied content="Don't have access to create domain." />;
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    organization_id,
    formData: getValues(),
  };

  return (
    <>
      <StepperFormLayout
        breadcrumbItems={[
          { name: "Domain", link: "/domain" },
          { name: "Add Domain" },
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
        submitLabel="Create Domain"
        showRequiredNote={true}
        allowStepNavigation={true}
        isEditMode={false}
      >
        {StepComponent ? <StepComponent {...stepProps} /> : null}
      </StepperFormLayout>

      <DomainTxtVerificationModal
        isOpen={!!createdDomainResult}
        domain_name={createdDomainResult?.domain_name}
        organization_id={organization_id}
        initialTxtKey={createdDomainResult?.dns_txt_verification_key}
        onVerified={() => {
          const domainName = createdDomainResult?.domain_name;
          setCreatedDomainResult(null);
          navigate(`/domain/${encodeURIComponent(domainName)}`);
        }}
        onClose={() => {
          const domainName = createdDomainResult?.domain_name;
          setCreatedDomainResult(null);
          navigate(`/domain/${encodeURIComponent(domainName)}`);
        }}
      />
    </>
  );
};

export default AddDomain;
