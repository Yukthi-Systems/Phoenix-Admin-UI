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

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Link as LinkIcon,
  Calendar,
  Building2,
  Globe,
  FileText,
} from "lucide-react";

import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useAddCRMPOLink } from "@/hooks/useCRMPO";
import { useGetCRMService } from "@/hooks/useCRMService";

import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { SelectField, TextArea } from "@/components/common/Inputs";
import RequiredNote from "@/components/common/RequiredNote";
import DateTimePicker from "@/components/common/DateTimePicker";
import { DomainInfiniteAddField } from "@/components/common/DomainAddValue";

import { crmLink } from "../formValues/linkDefaultValues";
import { crmLinkFormSchema } from "../formValues/linkValidationSchema";
import { toLocalISOString } from "@/utils/dateFormat";
import { renewalList, serviceTypeList } from "@/utils/constants";

function CRMLinkCreate() {
  const { po_id } = useParams();
  const { permissions, display_name = "" } = useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);

  const { data: Org_Detail } = useGetOrganizationDetail(organization_id);
  const orgBranch = Org_Detail?.details?.branches || {};
  const orgContact = Org_Detail?.details?.contact_info || {};

  const optionsBranch = Object.entries(orgBranch || {}).map(([key, value]) => ({
    value: key,
    label: value.name,
  }));

  const optionsContact = Object.entries(orgContact || {}).map(
    ([key, value]) => ({
      value: key,
      label: value.name,
    }),
  );

  const [selectedDomains, setSelectedDomains] = useState([]);
  const navigate = useNavigate();
  const toast = useToastify();
  const { data } = useGetCRMService();
  const services = data?.services ?? [];
  const { mutate, isPending } = useAddCRMPOLink();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: crmLink,
    resolver: yupResolver(crmLinkFormSchema),
    mode: "onChange",
  });

  // Watch values for DateTimePickers
  const startDate = watch("details.start_date");
  const expiryDate = watch("details.expiry_date");

  const onSubmit = (formData) => {
    const sercode = formData.service_code || "";
    const data = {
      ...formData,
    };
    delete data.service_code;
    data.details.created_by = display_name;
    data.details.created_at = toLocalISOString(new Date());
    data.details.domain_dropdown = selectedDomains;

    mutate(
      { organization_id, po_id, service_code: sercode, data },
      {
        onSuccess: () => {
          toast("success", "Successfully link CRM purchase order");
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

  if (!permissions?.includes("crm:purchase_order:create"))
    return <AccessDenied content="Don't have the access to link po." />;

  return (
    <div className="w-full h-full px-2 overflow-hidden">
      {/* Header Section */}
      <div className="w-full  gap-2 flex items-center mb-2.5">
        <BackButton />
        <Breadcrumbs
          items={[
            { name: "CRM" },
            { name: "Purchase Order", link: `/crm/purchase-order` },
            { name: "Create Link" },
          ]}
        />
      </div>

      {/* Main Content Card */}
      <div className="h-[calc(100vh-140px)] flex flex-col bg-card shadow-lg rounded-md border border-border overflow-hidden">
        {/* Header */}
        <div className="border-border bg-card border-b px-6 py-6 text-left flex-shrink-0">
          <FormHeader text="Link CRM purchase order to service" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border">
            {/* Service & Type Selection */}
            <div className="from-accent/30 bg-gradient-to-r to-transparent p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <LinkIcon className="text-primary h-5 w-5" />
                </div>
                <h2 className="text-foreground text-xl font-semibold">
                  Service Details
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <SelectField
                  label="Service"
                  name="service_code"
                  isRequired={true}
                  register={register}
                  errors={errors}
                  placeholder="Select a service"
                  options={services.map((item) => ({
                    value: item.service_code,
                    label: item.service_name,
                  }))}
                />
                <SelectField
                  label="Service Type"
                  name="details.service_type"
                  register={register}
                  errors={errors}
                  isRequired={true}
                  placeholder="Select service type"
                  options={serviceTypeList}
                />
                <SelectField
                  label="Renewal Status"
                  name="details.renewal_status"
                  register={register}
                  errors={errors}
                  isRequired={true}
                  placeholder="Select renewal status"
                  options={renewalList}
                />
              </div>
            </div>

            {/* Timeline & Organization */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Timeline Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Calendar className="text-primary h-5 w-5" />
                    </div>
                    <h2 className="text-foreground text-lg font-semibold">
                      Service Timeline
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <DateTimePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(date) => setValue("details.start_date", date)}
                      includeTime={false}
                      placeholder="Select start date"
                      isRequired={false}
                      error={errors?.details?.start_date?.message}
                    />
                    <DateTimePicker
                      label="Expiry Date"
                      value={expiryDate}
                      onChange={(date) => setValue("details.expiry_date", date)}
                      includeTime={false}
                      placeholder="Select expiry date"
                      isRequired={false}
                      error={errors?.details?.expiry_date?.message}
                    />
                  </div>
                </div>

                {/* Organization Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Building2 className="text-primary h-5 w-5" />
                    </div>
                    <h2 className="text-foreground text-lg font-semibold">
                      Organization Info
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <SelectField
                      label="Branch"
                      name="details.branch"
                      register={register}
                      errors={errors}
                      isRequired={true}
                      placeholder="Select branch"
                      options={optionsBranch}
                    />
                    <SelectField
                      label="Contact Person"
                      name="details.contact_person"
                      register={register}
                      errors={errors}
                      isRequired={true}
                      placeholder="Select contact person"
                      options={optionsContact}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Domain & Description */}
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Globe className="text-primary h-5 w-5" />
                </div>
                <h2 className="text-foreground text-xl font-semibold">
                  Domain & Description
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <DomainInfiniteAddField
                  label="Domain"
                  url={`/domain/list/${organization_id}`}
                  value={selectedDomains}
                  onChange={setSelectedDomains}
                />

                <div className="relative">
                  <TextArea
                    label="Description"
                    name="notes"
                    register={register}
                    errors={errors}
                    isRequired={true}
                    placeholder="Enter description for this service link..."
                    rows={3}
                    icon={<FileText className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Form Actions */}
          <div className="flex-shrink-0 from-muted/30 bg-gradient-to-r to-transparent p-6 flex justify-end items-center gap-6 border-t border-border">
            <RequiredNote />
            <SubmitButton label="Link Service" isPending={isPending} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default CRMLinkCreate;
