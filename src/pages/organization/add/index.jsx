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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import { useCreateOrganization, useGetOrganizationDetail } from "@/hooks/useOrganization";
import { organizationDefaultValues } from "./organizationDefaultValues";
import { organizationFormSchema } from "./validationSchema";
import AccessDenied from "@/components/common/AccessDenied";
import MessageDisplay from "@/components/common/MessageDisplay";
import StepperFormLayout from "@/components/layouts/FormLayout";
import OrganizationDetailsStep from "./steps/OrgDetailsStep";
import BranchesStep from "./steps/BranchesStep";
import ContactsStep from "./steps/ContactsStep";
import PreviewStep from "./steps/PreviewStep";
import { parentOrgAtom, selectedOrganizationAtom } from "@/store/userInfo";

const STEPS = [
  {
    id: "organization-details",
    label: "Organization Details",
    description: "Basic info",
    fields: [
      "name",
      "allocated_quota",
      "allocated_email_identities",
      "activate",
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
    fields: [], // Custom validation for branches
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Contact info",
    fields: [], // Custom validation for contacts
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review details",
    fields: [],
  },
];

// Helper: Get required fields for step
const getRequiredFieldsForStep = (stepIndex) => {
  const step = STEPS[stepIndex - 1];
  if (!step) return [];
  return step.fields;
};

// Step renderer map
const STEP_RENDERER = {
  1: (props) => <OrganizationDetailsStep {...props} />,
  2: (props) => <BranchesStep {...props} />,
  3: (props) => <ContactsStep {...props} />,
  4: (props) => <PreviewStep {...props} />,
};

const AddOrganization = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateOrganization();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Parent org state - only the selection (id/name) is kept as local state;
  // the numeric quota/identity figures are always read live below so they
  // stay in sync with the query cache instead of going stale after the
  // parent's data changes elsewhere (e.g. a sibling org was just created).
  const [parentOrg, setParentOrg] = useState({
    id: null,
    name: "None",
    size: 0,
    identitiesAllocated: null,
    identitiesUtilized: null,
  });

  const { data: parentOrgDetails } = useGetOrganizationDetail(parentOrg.id);

  const resolvedParentOrg = parentOrgDetails
    ? {
        ...parentOrg,
        size: Math.max(
          0,
          Number(parentOrgDetails.quota_allocated) -
            Number(parentOrgDetails.quota_utilized),
        ),
        identitiesAllocated: parentOrgDetails.allocated_email_identities,
        identitiesUtilized: parentOrgDetails.utilized_email_identities,
        email_service_enabled: parentOrgDetails.email_service_enabled ?? false,
        chat_service_enabled: parentOrgDetails.chat_service_enabled ?? false,
      }
    : parentOrg;

  // Branches state
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
  const {
    quota_allocated = 0,
    quota_utilized = 0,
    allocated_email_identities: ownAllocatedIdentities,
    utilized_email_identities: ownUtilizedIdentities = 0,
  } = useAtomValue(selectedOrganizationAtom) || {};
  const availableQuota = quota_allocated - quota_utilized;
  const isOwnIdentitiesUnlimited = ownAllocatedIdentities === -1;
  const availableIdentities = isOwnIdentitiesUnlimited
    ? Infinity
    : (ownAllocatedIdentities ?? 0) - ownUtilizedIdentities;
  const hasInsufficientQuota = availableQuota < 1;
  const hasInsufficientIdentities =
    !isOwnIdentitiesUnlimited && availableIdentities < 1;

  // Contacts state
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
    getValues,
    watch,
    trigger,
  } = useForm({
    defaultValues: organizationDefaultValues,
    resolver: yupResolver(organizationFormSchema),
    mode: "onChange",
    context: { parentOrg: resolvedParentOrg },
  });

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = getRequiredFieldsForStep(stepNumber);

    // Custom validation for branches step
    if (stepNumber === 2 && branchKeys.length === 0) {
      toast("error", "At least one branch is required");
      return false;
    }

    // Custom validation for contacts step
    if (
      stepNumber === 3 &&
      permissions.includes("crm:service:view") &&
      contactKeys.length === 0
    ) {
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

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    // Validate current step before moving forward
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
    if (stepNumber > currentStep && !completedSteps.includes(stepNumber)) {
      toast("warning", "Please complete the current step first");
      return;
    }
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
      identitiesAllocated: organization?.allocated_email_identities ?? null,
      identitiesUtilized: organization?.utilized_email_identities ?? null,
      email_service_enabled: organization?.email_service_enabled ?? false,
      chat_service_enabled: organization?.chat_service_enabled ?? false,
    });

    setValue("parent_organization_id", organization.organization_id, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
  };

  const onSubmit = (formData) => {
    // Final validation
    if (branchKeys.length === 0) {
      toast("error", "At least one branch is required");
      return;
    }

    if (permissions.includes("crm:service:view") && contactKeys.length === 0) {
      toast("error", "At least one contact is required");
      return;
    }

    const cleanedBranches = Object.fromEntries(
      Object.entries(formData.details.branches || {}).filter(
        ([_, branch]) => branch.name?.trim() || branch.address_one?.trim(),
      ),
    );

    const filteredData = {
      ...formData,
      parent_organization_id: parentOrg.id,
      details: {
        ...formData.details,
        branches: cleanedBranches,
      },
    };

    mutate({ data: filteredData }, {
      onSuccess: (data) => {
        toast(
          "success",
          `Successfully added organization: ${data?.name || formData?.name}`,
        );
        navigate("/organization");
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
    });
  };

  if (!permissions.includes("organization:create")) {
    return <AccessDenied content="Don't have access to create organization." />;
  }

  // Filter steps based on permissions
  const filteredSteps = permissions.includes("crm:service:view")
    ? STEPS
    : STEPS.filter((step) => step.id !== "contacts");

  const StepComponent = STEP_RENDERER[currentStep];
  const stepProps = {
    register,
    errors,
    control,
    watch,
    setValue,
    getValues,
    formData: getValues(),
    // Parent org
    parentOrg: resolvedParentOrg,
    handleParentOrgSelect,
    // Branches
    branchKeys,
    setBranchKeys,
    editingBranch,
    setEditingBranch,
    newBranch,
    setNewBranch,
    // Contacts
    contactKeys,
    setContactKeys,
    editingContact,
    setEditingContact,
    newContact,
    setNewContact,
    // Permissions
    permissions,
  };

  if (hasInsufficientQuota || hasInsufficientIdentities) {
    const reasons = [];
    if (hasInsufficientQuota) {
      reasons.push(
        `Storage: need at least 1 GB but only ${availableQuota.toFixed(2)} GB available`,
      );
    }
    if (hasInsufficientIdentities) {
      reasons.push(
        `Email Identities: need at least 1 but only ${availableIdentities} available`,
      );
    }

    return (
      <MessageDisplay
        type="blocked"
        title="Insufficient Quota"
        message={`${reasons.join(" • ")}. If quota was recently updated, refresh the page.`}
        showBadges
        badges={["Contact Administrator", "Check Quota Settings"]}
      >
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </MessageDisplay>
    );
  }

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Organization", link: "/organization" },
        { name: "Add Organization" },
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
      submitLabel="Create Organization"
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={false}
    >
      {StepComponent ? <StepComponent {...stepProps} /> : null}
    </StepperFormLayout>
  );
};

export default AddOrganization;
