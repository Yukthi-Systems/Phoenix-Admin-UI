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

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { copyDataAtom, resetCopyDataAtom } from "@/store/copy";
import { useToastify } from "@/hooks/useToastify";
import { useAddMailbox } from "@/hooks/useMailbox";
import { mailboxFormSchema } from "../add/validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import UserDetails from "../stepper/UserDetails";
import PasswordSetup from "../stepper/PasswordSetup";
import GeoIPRestrictions from "../stepper/GeoIPRestrictions";
import { ListEditor, ListEditorEmail } from "../add/ListEditors";
import MailboxPreview from "../stepper/MailboxPreview";
import { userInfoAtom } from "@/store/userInfo";
import MailPolicies from "../stepper/MailPolicies";
import { findFirstErrorStep } from "@/utils/formUtils";

const STEPS = [
  {
    id: "user-details",
    label: "User Details",
    description: "Basic info",
    fields: [
      "details.first_name",
      "email_prefix",
      "primary_phone",
      "allocate_quota",
    ],
  },
  {
    id: "password",
    label: "Password",
    description: "Security",
    fields: ["password", "conform_password"],
  },
  // {
  //   id: "restrictions",
  //   label: "Restrictions",
  //   description: "Geo & IP",
  //   fields: [],
  // },
  // {
  //   id: "additional",
  //   label: "Additional",
  //   description: "Settings",
  //   fields: [],
  // },
  {
    id: "mail-policies",
    label: "Mail Policies",
    description: "Policies",
    fields: [],
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review",
    fields: [],
  },
];

const getRequiredFieldsForStep = (stepIndex) => {
  return STEPS[stepIndex - 1]?.fields || [];
};

const CopyEditMailbox = () => {
  const { domain_name } = useParams();
  const navigate = useNavigate();
  const [copyData] = useAtom(copyDataAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const [, resetCopyData] = useAtom(resetCopyDataAtom);
  const { mutate, isPending } = useAddMailbox();
  const toast = useToastify();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [geoList, setGeoList] = useState([]);
  const [ipList, setIpList] = useState([]);
  const [externalList, setExternalList] = useState([]);
  const [internalList, setInternalList] = useState([]);
  const [mailboxes, setMailboxes] = useState([]);
  const [specificEmails, setSpecificEmails] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    trigger,
    getValues,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(mailboxFormSchema),
    mode: "onChange",
  });

  const isGroup = watch("email_type");
  const ruleTypeValue = watch("rule_type");
  const emailPrefix = watch("email_prefix");

  useEffect(() => {
    if (!copyData?.data || copyData.type !== "mailbox") {
      navigate("/mailbox");
    }
  }, [copyData, navigate]);

  useEffect(() => {
    if (copyData?.data) {
      reset({
        ...copyData.data,
        domain_name: domain_name,
        password: "",
        conform_password: "",
      });
    }
  }, [copyData, domain_name, reset]);

  const validateStep = async (stepNumber) => {
    const fieldsToValidate = getRequiredFieldsForStep(stepNumber);
    if (fieldsToValidate.length === 0) return true;

    const result = await trigger(fieldsToValidate);
    if (!result) toast("error", "Please fix errors before proceeding");
    return result;
  };

  const handleStepNavigation = async (targetStep) => {
    if (targetStep === currentStep) return true;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

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

  const handleFormError = (formErrors) => {
    const errorStep = findFirstErrorStep(formErrors, STEPS);

    if (errorStep) {
      setCurrentStep(errorStep);

      const stepLabel = STEPS[errorStep - 1].label;

      toast("error", `Please fix errors in step: ${stepLabel}`);
    } else {
      toast("error", "Please review the form for errors.");
    }
  };

  const onSubmit = (formData) => {
    const data = {
      ...formData,
      password_hash: btoa(formData.password),
      domain_name: domain_name,
      // geo_restriction: geoList,
      // ip_restriction: ipList,
      // mailboxes: mailboxes,
      // specific_emails: specificEmails,
    };

    data.email_prefix = data?.email_prefix?.toLowerCase();
    // data.group_members = {
    //   internal: internalList.map((email) => email.toLowerCase()),
    //   external: externalList.map((email) => email.toLowerCase()),
    // };

    delete data.password;
    delete data.conform_password;

    mutate(
      { data },
      {
        onSuccess: (responseData) => {
          toast("success", `Successfully copied mailbox to ${domain_name}`);
          resetCopyData();
          navigate(`/mailbox/${encodeURIComponent(responseData?.email)}`);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          const tracebackId = error.response?.data?.traceback_id;
          toast(
            "error",
            `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
        },
      },
    );
  };

  const handleCancel = () => {
    resetCopyData();
    navigate("/mailbox");
  };

  if (!copyData?.data) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserDetails
            register={register}
            errors={errors}
            domain_name={domain_name}
            emailPrefix={emailPrefix}
            control={control}
            setValue={setValue}
            watch={watch}
          />
        );
      case 2:
        return (
          <PasswordSetup
            register={register}
            errors={errors}
            watch={watch}
            control={control}
          />
        );
      case 3:
        return (
          <MailPolicies
            register={register}
            errors={errors}
            watch={watch}
            control={control}
            setValue={setValue}
            organization_id={organization_id}
            domain_name={domain_name}
          />
        );
      // case 5:
      //   return (
      //     <div className="space-y-6">
      //       <div className="space-y-8">
      //         <ListEditor
      //           placeholder="Enter mailbox name"
      //           label="Authorized Mailboxes"
      //           required={true}
      //           list={mailboxes}
      //           setList={setMailboxes}
      //         />
      //       </div>

      //       {ruleTypeValue === "SPECIFIC_EMAILS" && (
      //         <div className="space-y-8">
      //           <ListEditorEmail
      //             placeholder="Enter email address"
      //             label="Email Addresses"
      //             list={specificEmails}
      //             setList={setSpecificEmails}
      //             type="email"
      //           />
      //         </div>
      //       )}

      //       {isGroup === "GROUP" && (
      //         <div className="space-y-8">
      //           <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      //             <ListEditorEmail
      //               placeholder="user@yourdomain.com"
      //               label="Internal Members"
      //               list={internalList}
      //               setList={setInternalList}
      //               type="email"
      //             />
      //             <ListEditorEmail
      //               placeholder="user@externaldomain.com"
      //               label="External Members"
      //               list={externalList}
      //               setList={setExternalList}
      //               type="email"
      //             />
      //           </div>
      //         </div>
      //       )}
      //     </div>
      //   );
      case 4:
        return (
          <MailboxPreview
            formData={{ watch, domain_name }}
            geoList={geoList}
            ipList={ipList}
            mailboxes={mailboxes}
            specificEmails={specificEmails}
            internalList={internalList}
            externalList={externalList}
            isGroup={isGroup}
            ruleTypeValue={ruleTypeValue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StepperFormLayout
      breadcrumbItems={[
        { name: "Mailbox", link: "/mailbox" },
        { name: `Copy: ${copyData.sourceName}` },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={() =>
        handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
      }
      onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
      onStepClick={handleStepNavigation}
      onSubmit={handleSubmit(onSubmit, handleFormError)}
      onCancel={handleCancel}
      isPending={isPending}
      submitLabel={`Copy to ${domain_name}`}
      showRequiredNote={true}
      allowStepNavigation={true}
      isEditMode={true}
    >
      {renderStep()}
    </StepperFormLayout>
  );
};

export default CopyEditMailbox;
