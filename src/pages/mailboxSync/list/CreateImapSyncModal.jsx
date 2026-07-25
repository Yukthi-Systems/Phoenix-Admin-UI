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

// src/pages/server/mailboxSync/add/CreateImapSyncModal.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue } from "jotai";
import moment from "moment";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Settings,
  ArrowRight,
  Loader2,
  TriangleAlert,
} from "lucide-react";

import EditModelBox from "@/components/common/EditModelBox";
import { Input, PasswordInput } from "@/components/common/Inputs";
import InfoBox from "@/components/common/InfoBox";
import DateTimeRangePicker from "@/components/common/DateRangePicker";
import { MailboxInfiniteSelectField } from "@/components/common/infiniteSelectors/MailboxInfinteSelectField";

import { useToastify } from "@/hooks/useToastify";
import { useCreateImapSyncJob } from "@/hooks/useImapSync";
import { userInfoAtom } from "@/store/userInfo";

import { imapSyncValidationSchema } from "./validationSchema";
import {
  imapSyncDefaultValues,
  getDefaultDateRange,
} from "./imapSyncDefaultValues";

const CreateImapSyncModal = ({
  isOpen,
  onClose,
  domainName,
  defaultLocalMailbox = null,
}) => {
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { mutate, isPending } = useCreateImapSyncJob();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      ...imapSyncDefaultValues,
      to_email_domain: domainName,
      date_range: getDefaultDateRange(),
    },
    resolver: yupResolver(imapSyncValidationSchema),
    mode: "onChange",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && domainName) {
      const resetValues = {
        ...imapSyncDefaultValues,
        to_email_domain: domainName,
        date_range: getDefaultDateRange(),
      };

      // Pre-fill local mailbox if provided
      if (defaultLocalMailbox) {
        resetValues.to_email_full = defaultLocalMailbox; // For the Select component
        resetValues.to_email_prefix = defaultLocalMailbox.split("@")[0]; // For the API
      }

      reset(resetValues);
      setShowAdvanced(false);
    }
  }, [isOpen, domainName, defaultLocalMailbox, reset]);

  const handleMailboxSelect = (option) => {
    if (option && option.value) {
      const prefix = option.value.split("@")[0];
      setValue("to_email_prefix", prefix, { shouldValidate: true });
    } else {
      setValue("to_email_prefix", "");
    }
  };

  const convertDateRangeForAPI = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      return { date_range_from: null, date_range_to: null };
    }
    const startDateStr = moment(dateRange.startDate).format("YYYY-MM-DD");
    const endDateStr = moment(dateRange.endDate).format("YYYY-MM-DD");
    return {
      date_range_from: `${startDateStr}T00:00:00Z`,
      date_range_to: `${endDateStr}T23:59:59Z`,
    };
  };

  const onSubmit = (formData) => {
    const { date_range, to_email_full, ...rest } = formData;
    const datePayload = convertDateRangeForAPI(date_range);

    const payload = {
      ...rest,
      ...datePayload,
      organization_id,
      domain_name: domainName,
      imap_port: formData.imap_port ? Number(formData.imap_port) : null,
      sync_specific_folder: formData.sync_specific_folder || null,
    };

    mutate(payload, {
      onSuccess: () => {
        toast("success", "IMAP Sync Job created successfully");
        onClose();
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || "Unknown error";
        toast("error", message);
      },
    });
  };

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Create IMAP Sync Job"
      handleCancel={onClose}
      outsideClick={false}
    >
      <div className="w-full max-w-5xl min-w-[800px] text-left p-1">
        <form className="space-y-6 mt-2" onSubmit={handleSubmit(onSubmit)}>
          <InfoBox
            title="Migration Assistant"
            description="Configure the source IMAP server to migrate emails to this mailbox."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2 mb-2">
                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </span>
                <h3 className="text-foreground text-sm font-semibold">
                  Source (From)
                </h3>
              </div>
              <Input
                label="IMAP Server"
                name="imap_server"
                placeholder="imap.example.com"
                register={register}
                error={errors?.imap_server}
                isRequired
              />
              <Input
                label="Username / Email"
                name="imap_username"
                placeholder="user@external.com"
                register={register}
                error={errors?.imap_username}
                isRequired
              />
              <PasswordInput
                label="Password"
                name="imap_password"
                placeholder="Password"
                register={register}
                error={errors?.imap_password}
                isRequired
              />
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2 mb-2">
                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <h3 className="text-foreground text-sm font-semibold">
                  Destination (To)
                </h3>
              </div>

              <MailboxInfiniteSelectField
                control={control}
                name="to_email_full"
                label="Destination Mailbox"
                domainName={domainName}
                placeholder="Select local mailbox..."
                onMailboxSelect={handleMailboxSelect}
                errors={errors}
              />
              <input type="hidden" {...register("to_email_prefix")} />
              <input type="hidden" {...register("to_email_domain")} />
              {errors?.to_email_prefix && (
                <p className="text-sm text-destructive -mt-3">
                  Please select a valid destination mailbox.
                </p>
              )}

              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  The sync process will copy emails into the local mailbox. This
                  will not affect existing emails on the destination.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 mt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-primary text-sm font-medium hover:underline focus:outline-none mb-4"
            >
              <Settings size={16} />
              {showAdvanced
                ? "Hide Advanced Settings"
                : "Show Advanced Settings"}
              {showAdvanced ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {showAdvanced && (
              <div className="bg-muted/20 border border-border rounded-lg p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-2 text-orange-600 dark:text-orange-500 text-xs mb-2 font-medium">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                  <p>
                    These are advanced settings. Only modify these values if you
                    know what you are doing.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Port"
                      name="imap_port"
                      type="number"
                      placeholder="993"
                      register={register}
                      error={errors?.imap_port}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Input
                      label="Source Folder"
                      name="sync_specific_folder"
                      placeholder="INBOX"
                      register={register}
                      error={errors?.sync_specific_folder}
                    />
                  </div>
                  <div className="md:col-span-6">
                    <Controller
                      name="date_range"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <DateTimeRangePicker
                          value={value}
                          onChange={onChange}
                          label="Sync Date Range"
                          placeholder="Select period"
                          includeTime={false}
                          maxDays={365}
                          error={errors?.date_range?.message}
                          isClearable={true}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Starting..." : "Start Sync"}
            </button>
          </div>
        </form>
      </div>
    </EditModelBox>
  );
};

export default CreateImapSyncModal;
