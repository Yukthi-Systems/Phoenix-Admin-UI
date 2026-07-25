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
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useToastify } from "@/hooks/useToastify";
import {
  useEditFiltersPolicy,
  useFiltersPolicyEntry,
} from "@/hooks/useFiltersPolicy";
import { filtersPolicyDefaultValues } from "../add/filtersPolicyDefaultValues";
import { filtersPolicyValidationSchema } from "../add/validationSchema";

import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyConfigurationStep from "../add/step/PolicyConfigurationStep";

const STEPS = [
  {
    id: "configuration",
    label: "Configuration",
    description: "Policy settings & lists",
    fields: [
      "policy_name",
      "is_active",
      // "delete_mails", 
      "white_entries",
      "black_entries"],
  },
];

const STEP_RENDERER = {
  1: (props) => <PolicyConfigurationStep {...props} />,
};

const EditFiltersPolicy = () => {
  const { filters_policy_id } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useFiltersPolicyEntry({
    org_id: organization_id,
    policy_id: filters_policy_id,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [whiteEntries, setWhiteEntries] = useState([]);
  const [blackEntries, setBlackEntries] = useState([]);

  const { mutate, isPending } = useEditFiltersPolicy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    trigger,
    getValues,
    setValue,
  } = useForm({
    defaultValues: filtersPolicyDefaultValues,
    resolver: yupResolver(filtersPolicyValidationSchema),
    mode: "onChange",
  });

  // Sync state to form
  useEffect(() => {
    setValue("white_entries", whiteEntries, { shouldValidate: true });
  }, [whiteEntries, setValue]);

  useEffect(() => {
    setValue("black_entries", blackEntries, { shouldValidate: true });
  }, [blackEntries, setValue]);

  // Populate data on load
  useEffect(() => {
    if (data) {
      reset({
        domain: data?.domain_name || "",
        policy_name: data?.policy_name || "",
        is_active: data?.is_active ?? true,
        // delete_mails: data?.delete_mails ?? false,
      });
      setWhiteEntries(data?.white_entries || []);
      setBlackEntries(data?.black_entries || []);
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    const payload = {
      policy_name: formData.policy_name,
      is_active: formData.is_active,
      // delete_mails: formData.delete_mails,
      white_entries: whiteEntries,
      black_entries: blackEntries,
      domain: data?.domain_name,
    };

    mutate(
      { org_id: organization_id, policy_id: filters_policy_id, data: payload },
      {
        onSuccess: () => {
          toast("success", "Filters Policy updated successfully");
          queryClient.invalidateQueries({
            queryKey: ["filters_policy", organization_id],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ["filters_policy_entry", organization_id, filters_policy_id],
          });
          navigate(-1);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          toast("error", `Message: ${message}`);
          console.error(error);
        },
      },
    );
  };

  const isServerError = !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("policy:filters:edit")) {
    return <AccessDenied content="Don't have the access to edit filters policy." />;
  }

  if (isError && isServerError) return <DataFechError content="Error fetching policy details." />;
  if (isLoading) return <DataLoading content="Loading policy details..." />;
  if (isError && !isServerError) return <DataErrorWithReload content={error?.response?.data?.message} />;

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    domain_name: data?.domain_name,
    formData: getValues(),
    whiteEntries,
    setWhiteEntries,
    blackEntries,
    setBlackEntries,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Filters Policies", link: "/policies/filters" },
        { name: "Edit Filters policy" },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Update Filters Policy"
      showRequiredNote={true}
      allowStepNavigation={false}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditFiltersPolicy;