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
import { useNavigate } from "react-router-dom";
import { crmServices } from "../formValues/defaultValues";
import { yupResolver } from "@hookform/resolvers/yup";
import { crmServiceFormSchema } from "../formValues/validationSchema";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { Checkbox, Input, TextArea } from "@/components/common/Inputs";
import { useAddCRMService } from "@/hooks/useCRMService";
import { toLocalISOString } from "@/utils/dateFormat";
import RequiredNote from "@/components/common/RequiredNote";
import { Switch } from "@/components/common/Switch";

function AddCRMService() {
  const { permissions, display_name = "" } = useAtomValue(userProfileAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useAddCRMService();
  const toast = useToastify();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: crmServices,
    resolver: yupResolver(crmServiceFormSchema),
    mode: "onChange",
  });

  const onSubmit = (formData) => {
    const data = {
      ...formData,
    };

    data.info.created_by = display_name;
    data.info.created_at = toLocalISOString(new Date());

    mutate(
      { data },
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

  if (!permissions.includes("crm:service:create"))
    return (
      <AccessDenied content="Don't have the access to create CRM service" />
    );

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
                  name: "Add Service",
                },
              ]}
            />
          </div>
        </div>
        <div className="h-[calc(100vh-150px)] flex-1 overflow-y-auto bg-card shadow-lg rounded-md no-scrollbar border border-border ">
          <div className="border-border bg-card border-b px-6 py-6 text-left">
            <FormHeader text="Add CRM service" />
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto  py-2  text-left h-[calc(100%-75px)]"
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
              <SubmitButton label="Create CRM Service" isPending={isPending} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddCRMService;
