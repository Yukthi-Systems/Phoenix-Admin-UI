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
import EmailIdentitiesField from "./EmailIdentitiesField";
import { parentOrgAtom } from "@/store/userInfo";
import { useAtomValue } from "jotai";

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
  setValue,
  parentOrg,
  handleParentOrgSelect,
}) => {
  const loggedInParentOrg = useAtomValue(parentOrgAtom) || {};
  const activeEmailService = parentOrg.id ? (parentOrg.email_service_enabled ?? false) : (loggedInParentOrg.email_service_enabled ?? false);
  const activeChatService = parentOrg.id ? (parentOrg.chat_service_enabled ?? false) : (loggedInParentOrg.chat_service_enabled ?? false);
  const activeFileService = parentOrg.id ? (parentOrg.file_service_enabled ?? false) : (loggedInParentOrg.file_service_enabled ?? false);

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Organization Details
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure basic organization information and settings
        </p>
      </div>

      {/* Basic Information */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground px-2 text-left text-base font-medium">
          Basic Information
        </legend>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
          <Input
            label="Organization Name"
            name="name"
            register={register}
            placeholder="Enter Organization Name"
            info="The name can not be changed later, once created!"
            errors={errors}
            isRequired={true}
          />
          <Input
            min={0}
            type="number"
            label="Allocated Quota (GB)"
            name="allocated_quota"
            register={register}
            placeholder="0.00"
            errors={errors}
            step={0.01}
            isRequired={true}
            max={parentOrg?.size || 10000000}
            info={`Maximum ${parentOrg?.size || 0} GB space is allocated for this organization`}
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

        <div className="mt-6">
          <Switch
            control={control}
            name="activate"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Organization Inactive"
            falseSublabel="Organization will be created but remain disabled"
            trueLabel="Organization Active"
            trueSublabel="Organization will be enabled immediately after creation"
          />
        </div>

        <div className="mt-8">
          <div className="mb-2">
            <label className="text-card-foreground mb-2 block text-left text-sm font-medium">
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
            />
          </div>
          <p className="text-muted-foreground text-left text-sm">
            Select a parent organization. This organization must be linked to a
            parent.
          </p>
          {errors["parent_organization_id"] && (
            <p className="text-sm text-red-500">
              {errors["parent_organization_id"].message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Email Identities Allocation */}
      <EmailIdentitiesField
        watch={watch}
        setValue={setValue}
        errors={errors}
        parentOrg={parentOrg}
      />

      {/* Services Configuration */}
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

      {/* Contact Details */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground px-2 text-left text-base font-medium">
          Additional Information
        </legend>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
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
    </div>
  );
};

export default OrganizationDetailsStep;
