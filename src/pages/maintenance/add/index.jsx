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
import { yupResolver } from "@hookform/resolvers/yup";
import { maintenanceSchema } from "../formValues/validationSchema";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { Input, TextArea, SelectField } from "@/components/common/Inputs";
import { useCreateMaintenanceStatus } from "@/hooks/useMaintenanceStatus";
import RequiredNote from "@/components/common/RequiredNote";
import { Switch } from "@/components/common/Switch";
import AccessDenied from "@/components/common/AccessDenied";
import { useState } from "react";
import { toDateTimeLocalStringDefault } from "@/utils/dateFormat";
import DateTimeRangePicker from "@/components/common/DateRangePicker";

function AddMaintenanceStatus() {
  const { permissions, display_name = "" } = useAtomValue(userProfileAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateMaintenanceStatus();
  const toast = useToastify();

  // Local state for affected services array
  const [affectedServices, setAffectedServices] = useState([]);
  const [currentService, setCurrentService] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      affected: [],
      severity: "CRITICAL",
      type: "",
      is_active: true,
      start_time: null,
      end_time: null,
    },
    resolver: yupResolver(maintenanceSchema),
    mode: "onChange",
  });

  // Watch both start and end times for validation
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  // Handle date range change from DateTimeRangePicker
  const handleDateRangeChange = (range) => {
    if (range) {
      setValue("start_time", range.startDate);
      setValue("end_time", range.endDate);

      // Clear errors when valid range is selected
      clearErrors("start_time");
      clearErrors("end_time");

      // Trigger validation for both fields
      trigger(["start_time", "end_time"]);
    } else {
      // Handle clear/empty selection
      setValue("start_time", null);
      setValue("end_time", null);
    }
  };

  // Get current value for DateTimeRangePicker
  const getDateTimeRangeValue = () => {
    if (startTime && endTime) {
      return {
        startDate: new Date(startTime),
        endDate: new Date(endTime),
      };
    }
    return { startDate: null, endDate: null };
  };

  // Format validation error message
  const getDateRangeError = () => {
    if (errors.start_time?.message) return errors.start_time.message;
    if (errors.end_time?.message) return errors.end_time.message;
    return null;
  };

  // Add affected service to the array
  const addAffectedService = () => {
    if (
      currentService.trim() &&
      !affectedServices.includes(currentService.trim())
    ) {
      const newServices = [...affectedServices, currentService.trim()];
      setAffectedServices(newServices);
      setValue("affected", newServices);
      setCurrentService("");
    }
  };

  // Remove affected service from the array
  const removeAffectedService = (serviceToRemove) => {
    const newServices = affectedServices.filter(
      (service) => service !== serviceToRemove,
    );
    setAffectedServices(newServices);
    setValue("affected", newServices);
  };

  // Handle Enter key in affected services input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAffectedService();
    }
  };

  const onSubmit = (formData) => {
    const data = {
      ...formData,
      affected: affectedServices,
      start_time: formData.start_time
        ? new Date(formData.start_time).toISOString()
        : null,
      end_time: formData.end_time
        ? new Date(formData.end_time).toISOString()
        : null,
    };

    mutate(data, {
      onSuccess: () => {
        toast("success", "Maintenance status created successfully");
        navigate(-1);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || "Unknown error";
        const tracebackId = error.response?.data?.traceback_id;
        toast(
          "error",
          `Message: ${message}${
            tracebackId ? `\nTraceback ID: ${tracebackId}` : ""
          }`,
        );
        console.error(error);
      },
    });
  };

  const severityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ];

  // Get current date for minDate (prevent selecting past dates)
  const getCurrentDate = () => {
    return new Date();
  };

  if (!permissions.includes("maintenance:create"))
    return (
      <AccessDenied content="You don't have permission to create maintenance status" />
    );

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex gap-2 items-center mb-2.5 ">
          <BackButton />
          <Breadcrumbs
            items={[
              {
                name: "Maintenance",
              },
              {
                name: "Status",
                link: `/maintenance`,
              },
              {
                name: "Add Maintenance",
              },
            ]}
          />
        </div>
        <div className="h-[calc(100vh-150px)] flex-1 overflow-y-auto bg-card shadow-lg rounded-md no-scrollbar border border-border ">
          <div className="border-border bg-card border-b px-6 py-6 text-left">
            <FormHeader text="Add Maintenance Status" />
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto py-2 text-left h-[calc(100%-75px)]"
          >
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6 h-[calc(100%-55px)] ">
              <div className="mx-auto">
                <div className="grid grid-cols-2 gap-5">
                  {/* Title */}
                  <Input
                    placeholder="Enter maintenance title"
                    label="Title"
                    name="title"
                    isRequired={true}
                    register={register}
                    errors={errors}
                  />

                  {/* Type */}
                  <Input
                    placeholder="Enter maintenance type"
                    label="Type"
                    name="type"
                    isRequired={true}
                    register={register}
                    errors={errors}
                  />

                  {/* Description - Full width */}
                  <div className="grid gap-5 col-span-2">
                    <TextArea
                      label="Description"
                      name="description"
                      register={register}
                      errors={errors}
                      placeholder="Describe the maintenance work, impact, and details"
                      rows={4}
                      isRequired={true}
                    />
                  </div>

                  {/* Affected Services - Array Input */}
                  <div className="grid gap-5 col-span-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Affected Services (Optional)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={currentService}
                          onChange={(e) => setCurrentService(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter a service and press Add or Enter"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addAffectedService}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Add
                        </button>
                      </div>

                      {/* Display added services as tags */}
                      {affectedServices.length > 0 && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Added Services:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {affectedServices.map((service, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                              >
                                <span>{service}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAffectedService(service)}
                                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Hidden input to store the array for form submission */}
                    <input type="hidden" {...register("affected")} />
                    {errors.affected && (
                      <p className="text-sm text-red-600">
                        {errors.affected.message}
                      </p>
                    )}
                  </div>

                  {/* Severity */}
                  <SelectField
                    label="Severity"
                    name="severity"
                    register={register}
                    errors={errors}
                    options={severityOptions}
                    isRequired={true}
                  />

                  {/* Maintenance Period - Using DateTimeRangePicker */}
                  <div className="">
                    <DateTimeRangePicker
                      label="Maintenance Period"
                      value={getDateTimeRangeValue()}
                      onChange={handleDateRangeChange}
                      placeholder="Select maintenance start and end dates"
                      includeTime={true}
                      isRequired={true}
                      error={getDateRangeError()}
                      info="Select the start and end date/time for maintenance"
                      minDate={getCurrentDate()}
                      disabledFutureDates={false}
                      autoApply={true}
                      isClearable={true}
                      customStyle="w-full"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="col-span-2">
                    <Switch
                      control={control}
                      name="is_active"
                      register={register}
                      watch={watch}
                      errors={errors}
                      falseLabel="Inactive"
                      falseSublabel="Maintenance is not active"
                      trueLabel="Active"
                      trueSublabel="Maintenance is currently active"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border bg-card border-t px-6 py-3.5 flex justify-end items-center gap-6">
              <RequiredNote />
              <SubmitButton
                label="Create Maintenance Status"
                isPending={isPending}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddMaintenanceStatus;
