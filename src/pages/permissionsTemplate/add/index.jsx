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

import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { templateFormSchema } from "./validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue, useSetAtom } from "jotai";
import { Input, SelectFieldOnly } from "@/components/common/Inputs";
import PermissionTables from "@/pages/userManagement/add/PermissionTable";
import { userInfoAtom } from "@/store/userInfo";
import { useEditPermissionsTemplate } from "@/hooks/usePermissionTemplate";
import { useToastify } from "@/hooks/useToastify";
import { TrashIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function CreatePermissionTemplate() {
  const { permissions, user_id, permissions_template, organization_id } =
    useAtomValue(userProfileAtom);

  const [templateList, setTemplateList] = useState(permissions_template || {});
  const [sourceTemplate, setSourceTemplate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { mutate, isPending } = useEditPermissionsTemplate();
  const setProfile = useSetAtom(userProfileAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    setError,
  } = useForm({
    defaultValues: {
      template_name: "",
      permissions: [],
    },
    resolver: yupResolver(templateFormSchema),
    mode: "onChange",
  });

  const onSubmit = async (formData) => {
    if (templateList[formData.template_name]) {
      setError("template_name", {
        type: "manual",
        message: "Template name already exists",
      });
      return;
    }
    let name = formData.template_name;

    setIsSubmitting(true);

    let finalValue = {
      ...templateList,
      [name]: formData.permissions,
    };

    mutate(
      { org_id: organization_id, user_id, data: finalValue },
      {
        onSuccess: async () => {
          // Invalidate and refetch the profile data
          await queryClient.invalidateQueries({
            queryKey: ["profile", user_id, organization_id],
          });
          const updatedProfile = await queryClient.fetchQuery({
            queryKey: ["profile", user_id, organization_id],
            // Add your fetch function here, e.g.:
            // queryFn: () => fetchProfile(user_id, organization_id),
          });

          if (updatedProfile) {
            setProfile(updatedProfile.user_details);
          }

          setTemplateList(finalValue);
          reset();
          setIsSubmitting(false);
          toast("success", "Successfully added Permission Template");
          setDisabled(false);
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
          setDisabled(false);
        },
      },
    );
  };

  const handleClick = () => {
    // setDisabled(true)
    // mutate({ org_id: organization_id, user_id, data: templateList }, {
    //     onSuccess: () => {
    //         reset();
    //         setTemplateList({})
    //         toast('success', 'Successfully added Permission Template');
    //         setDisabled(false)
    //     },
    //     onError: (error) => {
    //         const message =
    //             error.response?.data?.message || error.message || 'Unknown error';
    //         const tracebackId = error.response?.data?.traceback_id;
    //         toast(
    //             'error',
    //             `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ''
    //             }`
    //         );
    //         console.error(error);
    //         setDisabled(false)
    //     },
    // });
  };

  // Existing templates offered as a starting point for the new one.
  const templateOptions = Object.keys(templateList || {}).map((key) => ({
    value: key,
    label: key,
  }));

  // Populate the permission grid from an existing template. The template name
  // field is intentionally left untouched so the user must give the copy a new
  // name (the duplicate-name guard in onSubmit still enforces this).
  const populateFromTemplate = (selectedOption) => {
    setSourceTemplate(selectedOption?.value || "");

    const sourcePermissions = selectedOption
      ? [...new Set(templateList[selectedOption.value] || [])]
      : [];

    // Only carry permissions the current admin actually holds, so what gets
    // saved matches what the grid shows.
    const assignable = sourcePermissions.filter((perm) =>
      permissions.includes(perm),
    );

    setValue("permissions", assignable, { shouldValidate: true });
  };

  const deleteTemplate = (name) => {
    setTemplateList((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  if (!permissions.includes("user:security:permissions:template:edit")) {
    return (
      <AccessDenied content="You don't have permission to create permission templates" />
    );
  }

  return (
    <div className="h-full w-full overflow-hidden px-2 text-left">
      <div className="mb-4 flex w-full items-center justify-between">
        <Breadcrumbs
          items={[
            { name: "Permission Template", link: "/permissions-template" },
            { name: "Add Permission Template" },
          ]}
        />
        <BackButton />
      </div>

      <>
        {!permissions.includes("user:security:permissions:template:edit") ? (
          <AccessDenied content="You don't have permission to create permission templates" />
        ) : (
          <>
            {/* Template Creation Section */}

            <div className="border-border bg-card mb-8 rounded-lg border p-6 h-[calc(100vh-120px)] overflow-y-auto">
              <h2 className="text-foreground mb-4 text-xl font-semibold">
                Create New Template
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Input
                      label="Template Name"
                      name="template_name"
                      placeholder="e.g. Admin Permissions"
                      register={register}
                      errors={errors}
                      isRequired={true}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <PermissionTables
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    showDropdown={templateOptions.length > 0}
                    optionsPermission={templateOptions}
                    handleAdd={populateFromTemplate}
                    template={sourceTemplate}
                    dropdownLabel="Populate from existing template"
                    dropdownHint="(Optional — copies its permissions, then give this template a new name)"
                    dropdownPlaceholder="Select a template to copy from..."
                  />
                </div>

                <div className="flex justify-center py-4">
                  <SubmitButton
                    label={isSubmitting ? "Adding..." : "Add Template"}
                    isPending={isSubmitting}
                    disabled={!isValid || isSubmitting}
                    className="w-full md:w-auto"
                  />
                </div>
              </form>
            </div>
          </>
        )}
      </>
    </div>
  );
}

export default CreatePermissionTemplate;
