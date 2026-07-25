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
import { Input, SelectField, TextArea } from "@/components/common/Inputs";
import { useEffect, useState } from "react";
import { toLocalISOString } from "@/utils/dateFormat";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import { useEditCRMPO, useGetCRMPOItem } from "@/hooks/useCRMPO";
import { userInfoAtom } from "@/store/userInfo";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import RequiredNote from "@/components/common/RequiredNote";
import { DomainInfiniteAddField } from "@/components/common/DomainAddValue";
import { statusList } from "@/utils/constants";
import { useUserTimezone } from "@/hooks/useTimezone";
import DateTimePicker from "@/components/common/DateTimePicker";
import ReactSelect from "@/components/common/Dropdown";

function EditCRMPO() {
  const { po_id } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions, display_name = " " } = useAtomValue(userProfileAtom);
  const navigate = useNavigate();
  const { convertToUTC } = useUserTimezone();
  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useGetCRMPOItem({
    po_id,
    organization_id,
  });
  const { mutate, isPending } = useEditCRMPO();
  const EditData = data?.data || {};

  const toast = useToastify();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    clearErrors,
    trigger,
  } = useForm({
    defaultValues: crmServices,
    resolver: yupResolver(crmServiceFormSchema),
    mode: "onChange",
  });

  const getLocalDateTimeString = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const selectedDate = watch("date");

  // Prepare status options for ReactSelect
  const statusOptions = statusList.map((status) => ({
    value: status.value,
    label: status.label,
  }));

  const handleDateChange = (date) => {
    setValue("date", date);
    if (date) {
      clearErrors("date");
      trigger("date");
    }
  };

  const onSubmit = (formData) => {
    const data = {
      ...formData,
    };
    data.date = convertToUTC(data.date);
    data.associated_organization_id = organization_id;
    (data.details.updated_by = display_name || ""),
      (data.details.updated_at = getLocalDateTimeString()),
      mutate(
        { po_id: po_id, data },
        {
          onSuccess: () => {
            toast("success", "Successfully added CRM purchase order");
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
        associated_organization_id: EditData?.associated_organization_id || "",
        date: EditData?.po_date
          ? new Date(EditData.po_date).toISOString().slice(0, 16)
          : "",
        description: EditData?.po_description || "",
        details: {
          created_at: EditData?.details?.created_at || "",
          created_by: EditData?.details?.created_by || "",
        },
        name: EditData?.po_name || "",
        status: EditData?.po_status || "Pending",
        total_amount: EditData?.total_amount || 0,
      });
    }
  }, [data, reset]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("crm:purchase_order:edit"))
    return <AccessDenied content="Don't have the access to edit CRM ." />;

  if (isError && isServerError)
    return (
      <DataFechError content="CRM purchase order details getting error...!" />
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
                  name: "purchase order",
                  link: `/crm/purchase-order`,
                },
                {
                  name: "Edit Purchase order",
                },
              ]}
            />
          </div>
        </div>
        <div className="h-[calc(100vh-150px)] flex-1 overflow-y-auto bg-card shadow-lg rounded-md no-scrollbar border border-border">
          {isLoading ? (
            <DataLoading content="CRM purchase order details loading...!" />
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <>
              <div className="border-border bg-card border-b px-6 py-6 text-left">
                <FormHeader text="Edit CRM purchase order" />
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mx-auto py-2  text-left h-[calc(100%-75px)]"
              >
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6 h-[calc(100%-55px)] ">
                  <div className="mx-auto ">
                    <div className="grid grid-cols-3 gap-5">
                      <Input
                        placeholder="Enter Name"
                        label="Name"
                        name="name"
                        isRequired={true}
                        register={register}
                        errors={errors}
                      />
                      {/* <Input type="datetime-local" label="Date" name="date" isRequired={true} register={register} errors={errors} /> */}
                      <div>
                        <DateTimePicker
                          label="Date & Time"
                          value={selectedDate}
                          onChange={handleDateChange}
                          includeTime={true}
                          placeholder="Select date and time..."
                          isRequired={true}
                          error={errors?.date?.message}
                        />
                      </div>
                      <Input
                        type="number"
                        label="Amount"
                        min={0}
                        name="total_amount"
                        register={register}
                        errors={errors}
                      />

                      <div className="grid gap-5 col-span-3">
                        <TextArea
                          label="Description"
                          name="description"
                          register={register}
                          errors={errors}
                          placeholder="Enter description"
                          rows={3}
                        />
                      </div>
                      <ReactSelect
                        control={control}
                        name="status"
                        label="Status"
                        options={statusOptions}
                        errors={errors}
                        placeholder="Select status..."
                        isRequired={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-border bg-card border-t px-6 py-3.5 flex justify-end items-center gap-6">
                  <RequiredNote />
                  <SubmitButton
                    label="Update Purchase Order"
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

export default EditCRMPO;
