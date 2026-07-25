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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { policyRules } from "../formValues/defaultValues";
import { policyRulesFormSchema } from "../formValues/validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { Input, SelectField, TextArea } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch"; // Import the Switch component
import { Edit2, Plus, Save, X } from "lucide-react";
import { useAddPolicyRule } from "@/hooks/usePolicyRules";
import { userInfoAtom } from "@/store/userInfo";
import RequiredNote from "@/components/common/RequiredNote";
import AccessDenied from "@/components/common/AccessDenied";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ruleList = [
  {
    label: "Emails from anyone can be sent to this mailbox group",
    value: "ANYONE",
  },
  {
    label: "Any member of the group can send emails to the group's mailboxes",
    value: "GROUP_MEMBER",
  },
  {
    label: "Anyone within the domain is allowed to send emails.",
    value: "DOMAIN_MEMBER",
  },
  {
    label: "Email access is restricted to specific addresses.",
    value: "SPECIFIC_EMAILS",
  },
];

const ListEditor = ({
  label,
  list,
  setList,
  placeholder = "",
  type = "text",
  required = false,
}) => {
  const toast = useToastify();
  const [newItem, setNewItem] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addItem = () => {
    const trimmed = newItem.trim();

    if (!trimmed) {
      toast("error", `${type === "email" ? "Email" : "Entry"} cannot be empty`);
      return;
    }

    if (type === "email" && !validateEmail(trimmed)) {
      toast("error", "Please enter a valid email address");
      return;
    }

    if (list.includes(trimmed)) {
      toast(
        "error",
        `Duplicate ${type === "email" ? "email" : "entry"} not allowed`,
      );
      return;
    }

    setList([...list, trimmed]);
    setNewItem("");
  };

  const deleteItem = (index) => {
    setList(list.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditValue("");
    }
  };

  const saveEdit = (index) => {
    const trimmed = editValue.trim();

    if (!trimmed) {
      toast("error", `${type === "email" ? "Email" : "Entry"} cannot be empty`);
      return;
    }

    if (type === "email" && !validateEmail(trimmed)) {
      toast("error", "Please enter a valid email address");
      return;
    }

    if (list.includes(trimmed) && list[index] !== trimmed) {
      toast(
        "error",
        `Duplicate ${type === "email" ? "email" : "entry"} not allowed`,
      );
      return;
    }

    const updated = [...list];
    updated[index] = trimmed;
    setList(updated);
    setEditIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <fieldset className="rounded-md border border-border p-6">
      <legend className="text-lg font-semibold text-foreground">
        {label}
        {required ? <span className="text-red-500">*</span> : ""}{" "}
      </legend>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full rounded-md border border-border bg-card text-card-foreground p-2 
                     focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
                     placeholder:text-muted-foreground transition-colors duration-200"
          />
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={!newItem.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">
              Add {type === "email" ? "email addresses" : "mailboxes"} using the
              input above
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">
                {list.length} {list.length === 1 ? "entry" : "entries"} added
              </span>
              <button
                type="button"
                onClick={() => setList([])}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {list.map((item, idx) => (
                  <div key={idx} className="group relative">
                    {editIndex === idx ? (
                      <div className="flex items-center gap-1 bg-card border border-primary rounded-full px-3 py-1.5 shadow-sm">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm bg-transparent border-none outline-none focus:ring-0 min-w-0"
                          style={{
                            width: `${Math.max(editValue.length * 8 + 20, 120)}px`,
                          }}
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") saveEdit(idx);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <div className="flex gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            className="p-0.5 text-success hover:bg-success/20 rounded-full transition-colors duration-200"
                            title="Save"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-0.5 text-muted-foreground hover:bg-muted rounded-full transition-colors duration-200"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 bg-card border border-border/50 rounded-full px-3 py-1.5 
                                    hover:border-border hover:shadow-sm transition-all duration-200"
                      >
                        <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          {item}
                        </span>

                        <div className="flex gap-0.5 ml-1  transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => {
                              setEditIndex(idx);
                              setEditValue(item);
                            }}
                            className="p-0.5 text-primary hover:bg-primary/20 rounded-full transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(idx)}
                            className="p-0.5 text-destructive hover:bg-destructive/20 rounded-full transition-colors duration-200"
                            title="Delete"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </fieldset>
  );
};

function AddPolicyRules() {
  const { domain_name } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const { mutate, isPending } = useAddPolicyRule();
  const toast = useToastify();
  const [mailboxes, setMailboxes] = useState([]);
  const [specificEmails, setSpecificEmails] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    defaultValues: policyRules,
    resolver: yupResolver(policyRulesFormSchema),
    mode: "onChange",
  });

  const ruleTypeValue = watch("rule_type");

  const onSubmit = (formData) => {
    if (mailboxes.length === 0) {
      toast("error", "Please add at least one mailbox");
      return false;
    }
    if (formData.rule_type === "SPECIFIC_EMAILS") {
      if (specificEmails.length === 0) {
        toast("error", "Please add at least one email address");
        return false;
      }
    }
    const data = {
      ...formData,
      mailboxes: mailboxes,
      specific_emails: specificEmails,
      domain_name,
    };
    delete data.domain;
    mutate(
      { organization_id, data },
      {
        onSuccess: () => {
          toast("success", "Successfully added policy rules");
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

  if (!permissions.includes("policy:rule:create"))
    return (
      <AccessDenied content="Don't have the access to create policy rules." />
    );

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-2.5">
          <Breadcrumbs
            items={[
              {
                name: "Policies",
              },
              {
                name: "Rules",
                link: `/policies/rules`,
              },
              {
                name: "Add Policy Rule",
              },
            ]}
          />
          <BackButton />
        </div>
        <div className="h-[calc(100vh-150px)] flex-1 overflow-y-auto bg-card shadow-lg rounded-md no-scrollbar border border-border">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto rounded-xl px-5 py-2 space-y-5 text-left"
          >
            <FormHeader text="Add Policy Rules" />

            {/* Policy Information Section */}
            <fieldset className="rounded-md border border-border p-6">
              <legend className="text-lg font-semibold text-foreground">
                Policy Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Domain"
                  name="domain"
                  placeholder={domain_name}
                  register={register}
                  errors={errors}
                  value={domain_name}
                  disabled
                />
                <Input
                  label="Rule Name"
                  name="rule_name"
                  placeholder="Enter rule name"
                  isRequired={true}
                  register={register}
                  errors={errors}
                />
                <SelectField
                  label="Rule Type"
                  name="rule_type"
                  register={register}
                  errors={errors}
                  options={ruleList}
                  isRequired={true}
                />
                <div className="flex items-center">
                  <Switch
                    control={control}
                    name="is_active"
                    register={register}
                    watch={watch}
                    errors={errors}
                    falseLabel="Rule Inactive"
                    falseSublabel="Rule will be created but remain disabled"
                    trueLabel="Rule Active"
                    trueSublabel="Rule will be enabled immediately after creation"
                  />
                </div>
              </div>

              <div className="mt-6">
                <TextArea
                  label="Description"
                  name="rule_description"
                  isRequired={true}
                  register={register}
                  errors={errors}
                  placeholder="Enter description for this policy rule"
                  rows={3}
                />
              </div>
            </fieldset>

            {/* Mailboxes Section */}
            <ListEditor
              placeholder="Enter mailbox name (e.g., admin, sales)"
              label="Mailboxes"
              required={true}
              list={mailboxes}
              setList={setMailboxes}
            />

            {/* Specific Emails Section - Only show when rule type is SPECIFIC_EMAILS */}
            {ruleTypeValue === "SPECIFIC_EMAILS" && (
              <ListEditor
                placeholder="Enter email address (e.g., user@example.com)"
                label="Specific Emails *"
                list={specificEmails}
                setList={setSpecificEmails}
                type="email"
              />
            )}

            <RequiredNote />

            <div className="text-center pb-6">
              <SubmitButton label="Create Policy Rule" isPending={isPending} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddPolicyRules;
