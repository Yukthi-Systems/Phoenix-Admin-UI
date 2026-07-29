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

import { useAtom, useAtomValue } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import { organizationDefaultValues } from "./organizationDefaultValues";
import { organizationFormSchema } from "./validationSchema";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  useEditOrganization,
  useGetOrganizationDetail,
  useRenameOrganizationStatus,
} from "@/hooks/useOrganization";
import { getOrganizationDetail } from "@/api/organizations";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import StepperFormLayout from "@/components/layouts/FormLayout";
import OrganizationDetailsStep from "./steps/OrgDetailsStep";
import BranchesStep from "./steps/BranchesStep";
import ContactsStep from "./steps/ContactsStep";
import { selectedOrganizationAtom, userInfoAtom } from "@/store/userInfo";

const STEPS = [
  {
    id: "organization-details",
    label: "Organization Details",
    description: "Basic info",
    fields: [
      "name",
      "details.type",
      "parent_organization_id",
      "details.description",
      "details.website",
      "details.gst_number",
      "email_service_enabled",
      "chat_service_enabled",
      "file_service_enabled",
    ],
  },
  {
    id: "branches",
    label: "Branches",
    description: "Locations",
    fields: [],
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Contact info",
    fields: [],
  },
];

// Takes the (possibly permission-filtered) steps array so the lookup always
// matches what's actually shown in the stepper, instead of assuming a fixed
// position from the full STEPS.
const getRequiredFieldsForStep = (steps, stepIndex) => {
  const step = steps[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

// Step renderer map — keyed by step id, not position. Positions shift when
// steps are filtered by permission (e.g. "contacts" removed), so a fixed
// numeric map would render the wrong component for the current step.
const STEP_RENDERER = {
  "organization-details": (props) => <OrganizationDetailsStep {...props} />,
  branches: (props) => <BranchesStep {...props} />,
  contacts: (props) => <ContactsStep {...props} />,
};

const EditOrganization = () => {
  const { org_id } = useParams();
  const { data, isLoading, isError } = useGetOrganizationDetail(org_id);
  const organization_details = data ?? null;

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();

  // Contacts is not gated by any permission — always shown as a step.
  const filteredSteps = STEPS;
  const { mutate, isPending } = useEditOrganization();
  const toast = useToastify();
  const { mutate: renameOrg } = useRenameOrganizationStatus();

  // Header org-switcher and sidebar service-gating both read cached org
  // snapshots from localStorage (selected_organization / user_info) rather
  // than re-fetching, so editing the currently-selected org (e.g. toggling
  // a service off) needs to push the new values into those atoms too -
  // otherwise the sidebar keeps showing the stale service flags until the
  // user re-selects the org from the header.
  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const [parentOrg, setParentOrg] = useState({
    id: null,
    name: "None",
  });

  const [branchKeys, setBranchKeys] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [newBranch, setNewBranch] = useState({
    name: "",
    address_one: "",
    address_two: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [orgName, setOrgName] = useState("");

  const [contactKeys, setContactKeys] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    type: "",
    notes: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
    getValues,
    watch,
    trigger,
  } = useForm({
    defaultValues: organizationDefaultValues,
    resolver: yupResolver(organizationFormSchema),
    mode: "onChange",
  });

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = getRequiredFieldsForStep(filteredSteps, stepNumber);
    const stepId = filteredSteps[stepNumber - 1]?.id;

    if (stepId === "branches" && branchKeys.length === 0) {
      toast("error", "At least one branch is required");
      return false;
    }

    if (stepId === "contacts" && contactKeys.length === 0) {
      toast("error", "At least one contact is required");
      return false;
    }

    if (fieldsToValidate.length === 0) return true;

    const result = await trigger(fieldsToValidate);
    if (!result)
      toast("error", "Please fix the errors in the form before proceeding");
    return result;
  };

  const handleStepNavigation = async (targetStep) => {
    if (targetStep === currentStep) return true;

    const isValid = await validateStep(currentStep);
    if (!isValid) {
      setCompletedSteps(completedSteps.filter((s) => s !== currentStep));
      return false;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  };

  const handleStepClick = async (stepNumber) => {
    await handleStepNavigation(stepNumber);
  };

  const handleParentOrgSelect = (organization) => {
    let size =
      Number(organization?.quota_allocated) -
      Number(organization?.quota_utilized) || 10000000;
    setParentOrg({
      id: organization.organization_id,
      name: organization.organization_name,
      size: size,
      email_service_enabled: organization.email_service_enabled ?? false,
      chat_service_enabled: organization.chat_service_enabled ?? false,
      file_service_enabled: organization.file_service_enabled ?? false,
    });
    setValue("parent_organization_id", organization.organization_id, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
  };

  const onSubmit = (formData) => {
    if (branchKeys.length === 0) {
      toast("error", "At least one branch is required");
      return;
    }

    if (contactKeys.length === 0) {
      toast("error", "At least one contact is required");
      return;
    }

    const cleanedBranches = Object.fromEntries(
      Object.entries(formData.details.branches || {}).filter(
        ([_, branch]) => branch.name?.trim() || branch.address_one?.trim(),
      ),
    );

    const filteredData = {
      ...formData.details,
      parent_organization_id: parentOrg.id,
      branches: cleanedBranches,
      email_service_enabled: formData.email_service_enabled,
      chat_service_enabled: formData.chat_service_enabled,
      file_service_enabled: formData.file_service_enabled,
    };

    mutate(
      { organization_id: org_id, data: filteredData },
      {
        onSuccess: (data) => {
          const updatedFields = {
            organization_name: formData?.name || orgName,
            email_service_enabled: filteredData.email_service_enabled,
            chat_service_enabled: filteredData.chat_service_enabled,
            file_service_enabled: filteredData.file_service_enabled,
          };

          if (selectedOrg?.organization_id === org_id) {
            setSelectedOrg((prev) => ({ ...prev, ...updatedFields }));
          }
          if (userInfo?.organization_id === org_id) {
            setUserInfo((prev) => ({
              ...prev,
              organization_name: updatedFields.organization_name,
              email_service_enabled: updatedFields.email_service_enabled,
              chat_service_enabled: updatedFields.chat_service_enabled,
            }));
          }

          if (formData?.name != orgName) {
            renameOrg(
              { organization_id: org_id, name: formData?.name },
              {
                onSuccess: () => {
                  toast(
                    "success",
                    `Successfully updated organization: ${data?.name || formData?.name}`,
                  );
                  navigate("/organization");
                },
              },
            );
          } else {
            toast(
              "success",
              `Successfully updated organization: ${data?.name || formData?.name}`,
            );
            navigate("/organization");
          }
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          const tracebackId = error.response?.data?.traceback_id;
          toast(
            "error",
            `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
          console.error(error);
        },
      },
    );
  };

  useEffect(() => {
    if (organization_details) {
      reset({
        details: {
          type: organization_details?.details?.type || "",
          description: organization_details?.details?.description || "",
          gst_number: organization_details?.details?.gst_number || "",
          website: organization_details?.details?.website || "",
          branches: organization_details?.details?.branches || {},
          contact_info: organization_details?.details?.contact_info || {},
        },
        name: organization_details?.organization_name || "",
        parent_organization_id:
          organization_details?.parent_organization_id || "",
        email_service_enabled: organization_details?.email_service_enabled ?? false,
        chat_service_enabled: organization_details?.chat_service_enabled ?? false,
        file_service_enabled: organization_details?.file_service_enabled ?? false,
      });
      setOrgName(organization_details?.organization_name || "");
      if (organization_details?.details?.branches) {
        const branches = organization_details.details.branches;
        const keys = Object.keys(branches);
        setBranchKeys(keys);
        keys.forEach((key) => {
          setValue(`details.branches.${key}`, branches[key]);
        });
      }

      if (organization_details?.details?.contact_info) {
        const contactInfo = organization_details.details.contact_info;
        const keys = Object.keys(contactInfo);
        setContactKeys(keys);
        keys.forEach((key) => {
          setValue(`details.contact_info.${key}`, contactInfo[key]);
        });
      }

      if (organization_details?.parent_organization_id) {
        fetchParentName(organization_details.parent_organization_id);
      }
    }
  }, [organization_details, reset, setValue]);

  const fetchParentName = async (orgId) => {
    try {
      const data = await getOrganizationDetail(orgId);
      setParentOrg({
        id: orgId,
        name: data?.organization_name || "Unknown",
        size: data?.quota_allocated || 0,
        email_service_enabled: data?.email_service_enabled ?? false,
        chat_service_enabled: data?.chat_service_enabled ?? false,
        file_service_enabled: data?.file_service_enabled ?? false,
      });
    } catch (err) {
      console.error("Failed to fetch parent org name", err);
      setParentOrg({
        id: orgId,
        name: "Unknown",
        size: 0,
        email_service_enabled: false,
        chat_service_enabled: false,
        file_service_enabled: false,
      });
    }
  };

  if (!permissions.includes("organization:create")) {
    return <AccessDenied content="Don't have access to edit organization." />;
  }

  if (isLoading) {
    return <DataLoading content="Organization details loading...!" />;
  }

  if (isError) {
    return (
      <DataFechError
        hasReload={true}
        content="Organization details getting error...!"
      />
    );
  }

  const StepComponent = STEP_RENDERER[filteredSteps[currentStep - 1]?.id];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    setValue,
    getValues,
    formData: getValues(),
    parentOrg,
    handleParentOrgSelect,
    branchKeys,
    setBranchKeys,
    editingBranch,
    setEditingBranch,
    newBranch,
    setNewBranch,
    contactKeys,
    setContactKeys,
    editingContact,
    setEditingContact,
    newContact,
    setNewContact,
    permissions,
    isEditMode: true,
    organizationName: organization_details?.organization_name,
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Organization", link: "/organization" },
        { name: "Edit Organization" },
      ]}
      steps={filteredSteps}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, filteredSteps.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepClick}
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Update Organization"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default EditOrganization;
