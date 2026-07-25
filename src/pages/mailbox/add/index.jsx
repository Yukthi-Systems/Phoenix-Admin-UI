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

import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useAddMailbox, useGetMailboxes } from "@/hooks/useMailbox";
import { mailboxFormSchema } from "./validationSchema";
import { mailboxDefaultValues } from "./mailboxDefaultValues";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import UserDetails from "../stepper/UserDetails";
import MailboxPreview from "../stepper/MailboxPreview";
import MailPolicies from "../stepper/MailPolicies";

const STEPS = [
  {
    id: "mailbox-info",
    label: "Mailbox Info",
    description: "Basic info",
    fields: [
      "email_identity",
      "allocate_quota",
      "enabled",
    ],
  },
  {
    id: "mail-policies",
    label: "Mail Policies",
    description: "Policies",
    fields: [
      "general_policy_id",
      "forwarding_policy_id",
      "distribution_policy_id",
    ],
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review",
    fields: [],
  },
];

const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

const AddMailbox = () => {
  const { domain_name } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const { mutate, isPending } = useAddMailbox();
  const { data: mailboxesData } = useGetMailboxes(domain_name, 1, 1000);
  const existingMailboxEmails = useMemo(() => {
    return mailboxesData?.mailboxes?.map((mb) => mb.email) || [];
  }, [mailboxesData]);
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    trigger,
    setValue,
  } = useForm({
    defaultValues: mailboxDefaultValues,
    resolver: yupResolver(mailboxFormSchema),
    mode: "onChange",
    context: { domain_name },
  });

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

  const onSubmit = (formData) => {
    const data = {
      email_identity: formData.email_identity,
      enabled: formData.enabled,
      allocate_quota: Number(formData.allocate_quota),
      general_policy_id: formData.general_policy_id || null,
      forwarding_policy_id: formData.forwarding_policy_id || null,
      distribution_policy_id: formData.distribution_policy_id || null,
    };

    mutate({data, addLog: true}, {
      onSuccess: (resData) => {
        toast("success", "Successfully added mailbox");
        navigate(`/mailbox/${encodeURIComponent(resData?.email || formData.email_identity)}`);
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

  if (!permissions.includes("mailbox:create")) {
    return <AccessDenied content="Don't have the access to create mailbox." />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserDetails
            register={register}
            errors={errors}
            domain_name={domain_name}
            control={control}
            setValue={setValue}
            watch={watch}
            existingMailboxEmails={existingMailboxEmails}
          />
        );
      case 2:
        return (
          <MailPolicies
            register={register}
            errors={errors}
            watch={watch}
            control={control}
            setValue={setValue}
            organization_id={organization_id}
            domain_name={domain_name}
          />
        );
      case 3:
        return (
          <MailboxPreview
            formData={{ watch, domain_name }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Mailbox", link: "/mailbox" },
        { name: "Add Mailbox" },
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
      submitLabel="Create Mailbox"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {renderStep()}
    </StepperFormLayout>
  );
};

export default AddMailbox;
