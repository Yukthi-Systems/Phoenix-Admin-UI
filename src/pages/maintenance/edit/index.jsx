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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { maintenanceSchema } from "../formValues/validationSchema";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { Input, TextArea, SelectField } from "@/components/common/Inputs";
import { useUpdateMaintenanceStatus } from "@/hooks/useMaintenanceStatus";
import RequiredNote from "@/components/common/RequiredNote";
import { Switch } from "@/components/common/Switch";
import AccessDenied from "@/components/common/AccessDenied";
import { useEffect, useState } from "react";
import DateTimeRangePicker from "@/components/common/DateRangePicker";
import { Plus, X, Server } from "lucide-react"; // Added Icons for better UI
import { maintenanceEditSchema } from "../formValues/editValidationSchema";

function EditMaintenanceStatus() {
  const { permissions } = useAtomValue(userProfileAtom);
  const navigate = useNavigate();
  const location = useLocation();
  const { maintenance_id } = useParams();
  const maintenanceData = location?.state?.maintenanceData;
  const isActive = location?.state?.isActive;
  const { mutate, isPending } = useUpdateMaintenanceStatus();
  const toast = useToastify();

  // Local state for affected services array
  const [affectedServices, setAffectedServices] = useState([]);
  const [currentService, setCurrentService] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      affected: [],
      severity: "low",
      type: "",
      is_active: false,
      start_time: null,
      end_time: null,
    },
    resolver: yupResolver(maintenanceEditSchema),
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

  // Reset form when data is loaded
  useEffect(() => {
    if (maintenanceData) {
      const maintenance = maintenanceData;

      // Handle affected services array
      const affectedArray = Array.isArray(maintenance.affected)
        ? maintenance.affected
        : maintenance.affected
          ? [maintenance.affected]
          : [];

      setAffectedServices(affectedArray);

      reset({
        title: maintenance.title || "",
        description: maintenance.description || "",
        affected: affectedArray,
        severity: maintenance.severity || "low",
        type: maintenance.type || "",
        is_active: isActive ?? true,
        start_time: maintenance.start_time
          ? new Date(maintenance.start_time)
          : null,
        end_time: maintenance.end_time ? new Date(maintenance.end_time) : null,
      });
    }
  }, [maintenanceData, reset, isActive]);

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

  // Format validation error message
  const getDateRangeError = () => {
    if (errors.start_time?.message) return errors.start_time.message;
    if (errors.end_time?.message) return errors.end_time.message;
    return null;
  };

  const onSubmit = (formData) => {
    // Format dates to ISO string
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

    mutate(
      { maintenance_id, data },
      {
        onSuccess: () => {
          toast("success", "Maintenance status updated successfully");
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
      },
    );
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

  if (!permissions.includes("maintenance:edit"))
    return (
      <AccessDenied content="You don't have permission to edit maintenance status" />
    );

  return (
    <div className="w-full h-full px-4 py-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center  gap-2 mb-4">
        <BackButton />
        <Breadcrumbs
          items={[
            { name: "Maintenance" },
            { name: "Status", link: `/maintenance` },
            { name: "Edit Details" },
          ]}
        />
      </div>

      {/* Main Content Card */}
      <div className="flex-1 overflow-hidden bg-card shadow-sm border border-border rounded-xl flex flex-col">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className=" mx-auto space-y-8">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" /> Basic
                    Information
                  </h3>
                </div>

                <Input
                  placeholder="e.g. Database Migration"
                  label="Title"
                  name="title"
                  isRequired={true}
                  register={register}
                  errors={errors}
                />

                <Input
                  placeholder="e.g. Scheduled Maintenance"
                  label="Type"
                  name="type"
                  isRequired={true}
                  register={register}
                  errors={errors}
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Description"
                    name="description"
                    register={register}
                    errors={errors}
                    placeholder="Describe the maintenance work, expected impact, and technical details..."
                    rows={4}
                    isRequired={true}
                  />
                </div>
              </div>

              {/* Impact & Timing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 pt-2 ">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" /> Impact
                    & Timing
                  </h3>
                </div>

                <SelectField
                  label="Severity Level"
                  name="severity"
                  register={register}
                  errors={errors}
                  options={severityOptions}
                  isRequired={true}
                />

                <DateTimeRangePicker
                  label="Maintenance Period"
                  value={getDateTimeRangeValue()}
                  onChange={handleDateRangeChange}
                  placeholder="Select duration"
                  includeTime={true}
                  isRequired={true}
                  error={getDateRangeError()}
                  info="Define the start and end window for this maintenance."
                  // minDate={getCurrentDate()}
                  autoApply={true}
                  isClearable={true}
                  customStyle="w-full"
                />

                {/* Affected Services - Custom Styled Input */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Affected Services{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (Optional)
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Server className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        value={currentService}
                        onChange={(e) => setCurrentService(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type service name and press Enter..."
                        className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addAffectedService}
                      disabled={!currentService.trim()}
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </button>
                  </div>

                  {/* Hidden Input for Form Logic */}
                  <input type="hidden" {...register("affected")} />
                  {errors.affected && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.affected.message}
                    </p>
                  )}

                  {/* Tags Display */}
                  {affectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                      {affectedServices.map((service, index) => (
                        <div
                          key={index}
                          title={service}
                          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-background border border-border shadow-sm text-foreground transition-all hover:border-primary/50"
                        >
                          <span className="max-w-[150px] truncate">
                            {service}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAffectedService(service)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 pt-2">
                  <Switch
                    control={control}
                    name="is_active"
                    register={register}
                    watch={watch}
                    errors={errors}
                    falseLabel="Inactive"
                    falseSublabel="Maintenance will be hidden from users"
                    trueLabel="Active"
                    trueSublabel="Maintenance is currently active and visible"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border bg-muted/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <RequiredNote />
            <div className="flex gap-3 w-full sm:w-auto">
              <SubmitButton
                label="Update Maintenance Status"
                isPending={isPending}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMaintenanceStatus;
