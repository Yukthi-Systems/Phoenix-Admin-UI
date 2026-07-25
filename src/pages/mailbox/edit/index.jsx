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
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import { useEditMailbox, useGetMailbox } from "@/hooks/useMailbox";
import * as Yup from "yup";
import { mailboxDefaultValues } from "./mailboxDefaultValues";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import DataLoading from "@/components/common/DataLoading";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import StepperFormLayout from "@/components/layouts/FormLayout";
import MailPolicies from "../stepper/MailPolicies";

const editMailboxFormSchema = Yup.object().shape({
  general_policy_id: Yup.string().nullable(),
  forwarding_policy_id: Yup.string().nullable(),
  distribution_policy_id: Yup.string().nullable(),
});

const STEPS = [
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
];

const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

const EditMailbox = () => {
  const { email: rawEmail } = useParams();
  const email = decodeURIComponent(rawEmail);
  const [email_prefix, domain_name] = email.split("@");
  const { organization_id } = useAtomValue(userInfoAtom);
  const { data, isLoading, isError, error } = useGetMailbox(
    domain_name,
    email_prefix,
  );
  const mailbox_details = data?.mailbox_details ?? null;
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const { mutate, isPending } = useEditMailbox();
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
    setValue,
    trigger,
  } = useForm({
    defaultValues: mailboxDefaultValues,
    resolver: yupResolver(editMailboxFormSchema),
    mode: "onChange",
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

  const onSubmit = (formData) => {
    console.log("onSubmit triggering mutation with:", formData);
    const data = {
      general_policy_id: formData.general_policy_id || null,
      forwarding_policy_id: formData.forwarding_policy_id || null,
      distribution_policy_id: formData.distribution_policy_id || null,
    };

    mutate(
      { domain_name, email_prefix, data },
      {
        onSuccess: (resData) => {
          console.log("Mutation succeeded:", resData);
          toast("success", "Successfully updated mailbox");
          navigate(`/mailbox/${encodeURIComponent(resData?.email || email)}`);
        },
        onError: (error) => {
          console.error("Mutation failed:", error);
          const message =
            error?.response?.data?.message || error?.message || "Unknown error";
          const tracebackId = error?.response?.data?.traceback_id;

          toast(
            "error",
            `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
        },
      },
    );
  };

  useEffect(() => {
    if (mailbox_details) {
      reset({
        general_policy_id: mailbox_details?.general_policy_id || null,
        distribution_policy_id: mailbox_details?.distribution_policy_id || null,
        forwarding_policy_id: mailbox_details?.forwarding_policy_id || null,
      });
    }
  }, [mailbox_details, reset]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("mailbox:create")) {
    return <AccessDenied content="Don't have the access to edit mailbox." />;
  }

  if (isError && isServerError) {
    return <DataFechError content="Mailbox details getting error...!" />;
  }

  if (isLoading) {
    return <DataLoading content="Mailbox details loading...!" />;
  }

  if (isError && !isServerError) {
    return <DataErrorWithReload content={error?.response?.data?.message} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
      default:
        return null;
    }
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Mailbox", link: "/mailbox" },
        { name: "Edit Mailbox" },
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
      submitLabel="Update Mailbox"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {renderStep()}
    </StepperFormLayout>
  );
};

export default EditMailbox;
