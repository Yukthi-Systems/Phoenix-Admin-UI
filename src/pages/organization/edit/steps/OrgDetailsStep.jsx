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

import { Input } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import ReactSelect from "@/components/common/Dropdown";
import OrganizationSelector from "@/components/shared/header/organization/OrganizationTree";
import { useAtomValue } from "jotai";
import { parentOrgAtom } from "@/store/userInfo";

const orgType = [
  { value: "Customer", label: "Customer" },
  { value: "Partner", label: "Partner" },
  { value: "Re-Seller", label: "Re-Seller" },
];

const OrganizationDetailsStep = ({
  register,
  errors,
  control,
  watch,
  parentOrg,
  handleParentOrgSelect,
  isEditMode = false,
  organizationName = "",
}) => {
  const loggedInParentOrg = useAtomValue(parentOrgAtom) || {};
  const activeEmailService = parentOrg.id ? (parentOrg.email_service_enabled ?? false) : (loggedInParentOrg.email_service_enabled ?? false);
  const activeChatService = parentOrg.id ? (parentOrg.chat_service_enabled ?? false) : (loggedInParentOrg.chat_service_enabled ?? false);
  const activeFileService = parentOrg.id ? (parentOrg.file_service_enabled ?? false) : (loggedInParentOrg.file_service_enabled ?? false);

  return (
    <div className="space-y-6">
      {/* Organization Basic Info */}
      <fieldset className="border border-border rounded-md p-6">
        <legend className="text-lg font-semibold text-card-foreground text-left">
          Organization Information
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
          <Input
            label="Organization Name"
            name="name"
            register={register}
            placeholder="Enter Organization Name"
            // info={isEditMode ? "The name cannot be changed after creation" : undefined}
            // disabled={isEditMode}
            errors={errors}
            isRequired={true}
          />
          <ReactSelect
            label="Organization Type"
            name="details.type"
            register={register}
            errors={errors}
            options={orgType}
            control={control}
            isRequired={true}
          />
        </div>


        <div className="mt-8">
          <div className="mb-2">
            <label className="block text-left text-sm font-medium mb-2 text-card-foreground">
              Select Parent Organization
              <span className="text-red-500"> *</span>
            </label>
            <OrganizationSelector
              selectedOrgId={parentOrg.id}
              selectedOrgName={parentOrg.name}
              onSelect={handleParentOrgSelect}
              placeholder="None (Top Level Organization)"
              label=""
              showLabel={false}
              excludeOrgId="current"
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Select a parent organization if this organization should be a
            child/subsidiary of another organization.
          </p>
          {errors["parent_organization_id"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["parent_organization_id"].message}
            </p>
          )}
        </div>
      </fieldset>



      {/* Contact Details */}
      <fieldset className="border border-border rounded-md p-6">
        <legend className="text-lg font-semibold text-card-foreground text-left">
          Additional Details
        </legend>
        <div className=" grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-5">
          <Input
            label="Description"
            name="details.description"
            placeholder="Enter organization description"
            register={register}
            errors={errors}
          />
          <Input
            label="Website"
            name="details.website"
            placeholder="www.organization.com"
            register={register}
            errors={errors}
          />
          <Input
            label="GST Number"
            name="details.gst_number"
            placeholder="Enter GST number"
            register={register}
            errors={errors}
          />
        </div>
      </fieldset>

      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground px-2 text-left text-base font-medium">
          Services Configuration
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={activeEmailService ? "" : "opacity-50 cursor-not-allowed"}>
            <Switch
              control={control}
              name="email_service_enabled"
              register={register}
              disabled={!activeEmailService}
              watch={watch}
              errors={errors}
              falseLabel="Email Service Disabled"
              falseSublabel="Organization will not have access to email services"
              trueLabel="Email Service Enabled"
              trueSublabel="Organization will have access to email services"
            />
          </div>
          <div className={activeChatService ? "" : "opacity-50 cursor-not-allowed"}>
            <Switch
              control={control}
              name="chat_service_enabled"
              register={register}
              disabled={!activeChatService}
              watch={watch}
              errors={errors}
              falseLabel="Chat Service Disabled"
              falseSublabel="Organization will not have access to chat services"
              trueLabel="Chat Service Enabled"
              trueSublabel="Organization will have access to chat services"
            />
          </div>
          <div className={activeFileService ? "" : "opacity-50 cursor-not-allowed"}>
            <Switch
              control={control}
              name="file_service_enabled"
              register={register}
              disabled={!activeFileService}
              watch={watch}
              errors={errors}
              falseLabel="File Service Disabled"
              falseSublabel="Organization will not have access to file services"
              trueLabel="File Service Enabled"
              trueSublabel="Organization will have access to file services"
            />
          </div>
        </div>
      </fieldset>

      {/* Info Box */}
      <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <svg
            className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-left">
            <p className="text-foreground text-sm font-medium">
              Organization Setup
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {isEditMode
                ? "Update the organization details. The organization name cannot be changed after creation."
                : "Provide basic details about the organization. You can set up branches and contacts in the following steps."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailsStep;
