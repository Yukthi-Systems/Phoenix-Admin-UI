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

import { useToastify } from "@/hooks/useToastify";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { crmServices } from "../formValues/defaultValues";
import { yupResolver } from "@hookform/resolvers/yup";
import { crmServiceFormSchema } from "../formValues/validationSchema";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { Checkbox, Input, TextArea } from "@/components/common/Inputs";
import { useEditCRMService, useGetCRMServiceItem } from "@/hooks/useCRMService";
import { useEffect } from "react";
import { toLocalISOString } from "@/utils/dateFormat";
import DataFechError from "@/components/common/DataFechError";
import DataLoading from "@/components/common/DataLoading";
import RequiredNote from "@/components/common/RequiredNote";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { Switch } from "@/components/common/Switch";

function EditCRMService() {
  const { service_id } = useParams();
  const { permissions, display_name = "" } = useAtomValue(userProfileAtom);
  const navigate = useNavigate();
  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useGetCRMServiceItem({
    service_code: service_id,
  });
  const { mutate, isPending } = useEditCRMService();
  const EditData = data?.data || {};

  const toast = useToastify();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm({
    defaultValues: crmServices,
    resolver: yupResolver(crmServiceFormSchema),
    mode: "onChange",
  });

  const onSubmit = (formData) => {
    const data = {
      ...formData,
    };

    (data.info.updated_by = display_name || ""),
      (data.info.updated_at = toLocalISOString(new Date()) || ""),
      mutate(
        { service_code: service_id, data },
        {
          onSuccess: () => {
            toast("success", "Successfully added CRM service");
            navigate(-1);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""
              }`,
            );
            console.error(error);
          },
        },
      );
  };

  useEffect(() => {
    if (data) {
      reset({
        code: EditData?.service_code || "",
        description: EditData?.service_description || "",
        name: EditData?.service_name || "",
        activate: EditData?.is_active || false,
        info: {
          created_at: EditData?.service_info?.created_at || "",
          created_by: EditData?.service_info?.created_by || "",
          node_required: EditData?.service_info?.node_required || false,
          domain_required: EditData?.service_info?.domain_required || false,
        },
      });
    }
  }, [data, reset]);
  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("crm:service:edit"))
    return <AccessDenied content="Don't have the access to edit CRM ." />;

  if (isError && isServerError)
    return <DataFechError content="CRM Service details getting error...!" />;

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-2.5 ">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "CRM",
                },
                {
                  name: "Services",
                  link: `/crm/services`,
                },
                {
                  name: "Edit Service",
                },
              ]}
            />
          </div>
        </div>
        <div className="h-[calc(100vh-150px)] flex-1 overflow-y-auto bg-card shadow-lg rounded-md no-scrollbar border border-border">
          {isLoading ? (
            <DataLoading content="CRM Service details loading...!" />
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <>
              <div className="border-border bg-card border-b px-6 py-6 text-left">
                <FormHeader text="Edit CRM service" />
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mx-auto  py-2  text-left h-[calc(100%-75px)]  "
              >
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6 h-[calc(100%-55px)] ">
                  <div className="mx-auto ">
                    <div className="grid grid-cols-3 gap-5">
                      <Input
                        placeholder="Enter code"
                        label="CRM Code"
                        name="code"
                        isRequired={true}
                        register={register}
                        errors={errors}
                      />
                      <Input
                        placeholder="Enter name"
                        label="Name"
                        name="name"
                        isRequired={true}
                        register={register}
                        errors={errors}
                      />
                      <div className="grid gap-5 col-span-3">
                        <TextArea
                          label="Description"
                          name="description"
                          register={register}
                          errors={errors}
                          placeholder="Enter description for this disclaimer"
                          rows={3}
                        />
                      </div>

                      <Switch
                        control={control}
                        name="activate"
                        register={register}
                        watch={watch}
                        errors={errors}
                        falseLabel="Deactivated"
                        falseSublabel="Service is disabled"
                        trueLabel="Activated"
                        trueSublabel="Service is enabled"
                      />

                      <Switch
                        control={control}
                        name="node_required"
                        register={register}
                        watch={watch}
                        errors={errors}
                        falseLabel="Node Not Required"
                        falseSublabel="Service works without node assignment"
                        trueLabel="Node Required"
                        trueSublabel="Service needs node assignment"
                      />

                      <Switch
                        control={control}
                        name="domain_required"
                        register={register}
                        watch={watch}
                        errors={errors}
                        falseLabel="Domain Not Required"
                        falseSublabel="Service works without domain"
                        trueLabel="Domain Required"
                        trueSublabel="Service needs domain assignment"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-border bg-card border-t px-6 py-3.5 flex justify-end items-center gap-6">
                  <RequiredNote />
                  <SubmitButton
                    label="Update CRM Service"
                    isPending={isPending}
                  />
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default EditCRMService;
