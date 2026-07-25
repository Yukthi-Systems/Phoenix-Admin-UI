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

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import moment from "moment"; // We only need standard moment for formatting

import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import { useCreateImapSyncJob } from "@/hooks/useImapSync";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";

import { imapSyncDefaultValues, getDefaultDateRange } from "../list/imapSyncDefaultValues";
import { imapSyncValidationSchema } from "../list/validationSchema";
import JobConfigurationStep from "./steps/ConfigurationStep";
import PreviewStep from "./steps/PreviewStep";

const STEPS = [
  {
    id: "job-config",
    label: "Configuration",
    description: "IMAP & Sync Details",
    fields: [
      "imap_server",
      "imap_port",
      "imap_username",
      "imap_password",
      "sync_specific_folder",
      "to_email_prefix",
      "to_email_domain",
      "date_range",
    ],
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review & Start",
    fields: [],
  },
];

const STEP_RENDERER = {
  1: (props) => <JobConfigurationStep {...props} />,
  2: (props) => <PreviewStep {...props} />,
};

const CreateMailBoxSync = () => {
  const { domain_name } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { mutate, isPending } = useCreateImapSyncJob();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    trigger,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      ...imapSyncDefaultValues,
      to_email_domain: domain_name,
      date_range: imapSyncDefaultValues.date_range || getDefaultDateRange()
    },
    resolver: yupResolver(imapSyncValidationSchema),
    mode: "onChange",
  });

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = STEPS[stepNumber - 1]?.fields || [];
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
      setCompletedSteps((prev) => prev.filter((s) => s !== currentStep));
      return false;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
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

  // CRITICAL: Strict Date Formatting Logic
  const convertDateRangeForAPI = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    // 1. Extract the "YYYY-MM-DD" part specifically.
    // We use moment(date).format("YYYY-MM-DD") to get the calendar date selected by the user.
    const startDateStr = moment(dateRange.startDate).format("YYYY-MM-DD");
    const endDateStr = moment(dateRange.endDate).format("YYYY-MM-DD");

    // 2. Manually append the specific time strings requested.
    // This guarantees "T00:00:00Z" and "T23:59:59Z" regardless of browser timezone.
    return {
      date_range_from: `${startDateStr}T00:00:00Z`,
      date_range_to: `${endDateStr}T23:59:59Z`,
    };
  };

  const onSubmit = (formData) => {
    const { date_range, ...rest } = formData;

    // Convert dates strictly
    const datePayload = convertDateRangeForAPI(date_range);

    const payload = {
      ...rest,
      ...datePayload,
      imap_port: Number(formData.imap_port),
    };

    // Debug: You can check the console to see the exact string being sent

    mutate(payload, {
      onSuccess: () => {
        toast("success", "IMAP Sync Job started successfully");
        navigate(`/server/mailbox-sync`);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || "Unknown error";
        const tracebackId = error.response?.data?.traceback_id;
        toast(
          "error",
          `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`
        );
        console.error(error);
      },
    });
  };

  if (!permissions.includes("server:view")) {
    return (
      <AccessDenied content="You do not have permission to create IMAP sync jobs." />
    );
  }

  const StepComponent = STEP_RENDERER[currentStep];

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Mailbox Sync", link: "/server/mailbox-sync" },
        { name: "Create Sync Job" },
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
      submitLabel="Start Sync"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {StepComponent ? (
        <StepComponent
          register={register}
          errors={errors}
          control={control}
          watch={watch}
          setValue={setValue}
          domain_name={domain_name}
          formData={getValues()}
        />
      ) : null}
    </StepperFormLayout>
  );
};

export default CreateMailBoxSync;