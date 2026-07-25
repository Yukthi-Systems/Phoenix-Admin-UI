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

// ====== FILE: EditServer.jsx ======
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import { useGetServer, useUpdateServer, useUpdateServerStatus } from "@/hooks/useServer";
import { serverDefaultValues } from "../add/serverDefaultValues";
import { serverFormSchema } from "../add/validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import StepperFormLayout from "@/components/layouts/FormLayout";
import HostConfigurationStep from "./steps/HostConfig";
import ServerInformationStep from "./steps/ServerInfoStep";
import { useQueryClient } from "@tanstack/react-query";

const STEPS = [
  {
    id: "host-configuration",
    label: "Host Configuration",
    description: "Host settings",
    fields: [
      "host_name",
      "quota_allocated",
      "smtp_port",
      "storage_path",
      "is_active",
      "is_monitoring",
      "is_mailbox_server",
      "is_accepting_new_mailboxes",
    ],
  },
  {
    id: "server-information",
    label: "Server Information",
    description: "Server details",
    fields: [
      "server_info.description",
      "server_info.location",
      "server_info.ipv4",
      "server_info.ipv6",
      "server_info.os",
    ],
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
  1: (props) => <HostConfigurationStep {...props} />,
  2: (props) => <ServerInformationStep {...props} />,
};

const EditServer = () => {
  const { server_id: rawServerId } = useParams();
  const server_id = decodeURIComponent(rawServerId);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { data: server, isLoading, isError } = useGetServer(server_id);
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateServer();
  const queryClient = useQueryClient();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    trigger,
    getValues,
    setValue,
  } = useForm({
    defaultValues: serverDefaultValues,
    resolver: yupResolver(serverFormSchema),
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

  const { mutate: statusUpdate, isPending: statusLoad } = useUpdateServerStatus();


  const onSubmit = (data) => {
    data.host_name = data.host_name?.toLowerCase();
    if (data?.is_active === true && server?.is_active === false) {
      statusUpdate({ server_id: server_id, status: data?.is_active, server_name: data?.host_name }, {
        onSuccess: () => {
          mutate(
            { server_id: server_id, data: data },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["server", server_id] });
                queryClient.invalidateQueries({ queryKey: ["servers"] });
                toast("success", "Successfully updated server");
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
    } else {
      mutate(
        { server_id: server_id, data: data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["server", server_id] });
            queryClient.invalidateQueries({ queryKey: ["servers"] });
            toast("success", "Successfully updated server");
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
    }
  };

  useEffect(() => {
    if (server) {
      reset({
        host_name: server?.host_name || "",
        is_active: server?.is_active || false,
        is_monitoring: server?.is_monitoring || false,
        is_mailbox_server: server.is_mailbox_server || false,
        is_accepting_new_mailboxes: server?.is_accepting_new_mailboxes || false,
        quota_allocated: server?.quota_allocated || 0,
        server_info: {
          description: server?.server_info?.description || "",
          ipv4: server?.server_info?.ipv4 || "",
          ipv6: server?.server_info?.ipv6 || "",
          location: server?.server_info?.location || "",
          os: server?.server_info?.os || "",
        },
        smtp_port: server?.smtp_port || 25,
        storage_path: server?.storage_path || "",
      });
    }
  }, [server, reset]);

  if (!permissions.includes("server:edit")) {
    return <AccessDenied content="Don't have access to edit mailbox server." />;
  }

  if (isLoading) {
    return <DataLoading content="Mailbox server details loading...!" />;
  }

  if (isError) {
    return <DataFechError content="Mailbox server details getting error...!" />;
  }

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    setValue,
    formData: getValues(),
    isEditMode: true,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Mailbox Server", link: "/server/list" },
        { name: "Edit Mailbox Server" },
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
      submitLabel="Update Server"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditServer;
