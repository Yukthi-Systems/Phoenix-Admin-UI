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

import { useAddForwardingPolicy } from "@/hooks/useForwardingPolicy";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { forwardingPolicyDefaultValues } from "./forwardingPolicyDefaultValues";
import { yupResolver } from "@hookform/resolvers/yup";
import { forwardingPolicyValidationSchema } from "./validationSchema";
import StepperFormLayout from "@/components/layouts/FormLayout";
import PolicyInformationStep from "./stepper/PolicyInfoStep";
import MailInfoStep from "./stepper/MailInfoStep";
import PreviewStep from "./stepper/PreviewStep";
import AccessDenied from "@/components/common/AccessDenied";


const STEPS = [
    {
        id: "policy-information",
        label: "Policy Information",
        description: "Basic details",
        fields: ["policy_name", "is_active", "domain_name", "policy_description"],
    },
    {
        id: "additional",
        label: "Additional",
        description: "Additional",
        fields: [],
    },
    {
        id: "preview",
        label: "Preview",
        description: "Review details",
        fields: [],
    },
]
// Helper: Get required fields for step
const getRequiredFieldsForStep = (stepIndex) => {
    const step = STEPS[stepIndex - 1];
    if (!step) return [];
    return step.fields;
};

// Step renderer map
const STEP_RENDERER = {
    1: (props) => <PolicyInformationStep {...props} />,
    2: (props) => <MailInfoStep {...props} />,
    3: (props) => <PreviewStep {...props} />,
}


function AddForwardingPolicy() {
    const { domain_name } = useParams();
    const { organization_id } = useAtomValue(userInfoAtom);
    const { permissions = [] } = useAtomValue(userProfileAtom) || {};
    const navigate = useNavigate();
    const toast = useToastify();
    const [forwardToEmails, setForwardToEmails] = useState([]);
    const [fromEmails, setFromEmails] = useState([]);
    const [subjectContains, setSubjectContains] = useState([]);

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    const { mutate, isPending } = useAddForwardingPolicy();

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        trigger,
        getValues,
    } = useForm({
        defaultValues: forwardingPolicyDefaultValues,
        resolver: yupResolver(forwardingPolicyValidationSchema),
        mode: "onChange",
    });

    const validateStep = async (stepNumber) => {
        const fieldsToValidate = getRequiredFieldsForStep(stepNumber);
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

    const onSubmit = (formData) => {
        const data = {
            ...formData,
            domain_name: domain_name,
            forward_to_emails: forwardToEmails,
            from_emails: fromEmails,
            subject_contains: subjectContains
        }
        mutate(
            { org_id: organization_id, data },
            {
                onSuccess: () => {
                    toast("success", "Forwarding Policy created successfully");
                    navigate(-1);
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
    }

    if (!permissions.includes("policy:forwarding:create")) {
        return (
            <AccessDenied content="Don't have permission to create forwarding policy." />
        );
    }

    const StepComponent = STEP_RENDERER[currentStep];
    const stepProps = {
        register,
        errors,
        control,
        watch,
        domain_name,
        formData: getValues(),
        forwardToEmails,
        setForwardToEmails,
        fromEmails,
        setFromEmails,
        subjectContains,
        setSubjectContains
    }

    return (
        <StepperFormLayout
            breadcrumbItems={[
                { name: "Forwarding Policies", link: "/policies/forwarding" },
                { name: "Add Forwarding Policy" },
            ]}
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onNext={() =>
                handleStepNavigation(Math.min(currentStep + 1, STEPS.length))
            }
            onPrevious={() => handleStepNavigation(Math.max(currentStep - 1, 1))}
            onStepClick={handleStepClick}
            onSubmit={handleSubmit(onSubmit)}
            isPending={isPending}
            submitLabel="Create Forwarding Policy"
            showRequiredNote={true}
            allowStepNavigation={true}
            isEditMode={false}
        >
            {StepComponent ? <StepComponent {...stepProps} /> : null}
        </StepperFormLayout>
    )

}


export default AddForwardingPolicy;