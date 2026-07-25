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
import ReactSelect from "@/components/common/Dropdown";
import { Switch } from "@/components/common/Switch";
import { CautionInfiniteSelectField } from "@/components/common/infiniteSelectors/CautionInfiniteSelectionField";
import { DisclaimerInfiniteSelectField } from "@/components/common/infiniteSelectors/DisclaimerInfiniteSelectionField";
import { AlertCircle } from "lucide-react";

const SpamDestinationStep = ({
  register,
  errors,
  control,
  watch,
  organization_id,
}) => {
  const spamDestination = watch("spam_destination");

  const spamDestinationOptions = [
    { value: "INBOX", label: "Inbox" },
    { value: "SPAM", label: "Spam" },
    { value: "TRASH", label: "Trash" },
    { value: "DELETE", label: "Permanently Delete" },
    { value: "SEND_DIGEST", label: "Send Digest" },
    { value: "FOLDER", label: "Custom Folder" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Spam Destination Properties
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure spam handling, caution and disclaimer templates
        </p>
      </div>
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground px-2 text-left text-base font-medium">
          Spam Handling
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* <div className="col-span-1">
            <Switch
              control={control}
              name="delete_spam"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="Delete Spam Disabled"
              falseSublabel="Spam emails will be kept according to policy"
              trueLabel="Delete Spam Enabled"
              trueSublabel="Spam emails will be permanently deleted"
            />
          </div> */}
          <ReactSelect
            control={control}
            name="spam_destination"
            label="Spam Destination"
            options={spamDestinationOptions}
            errors={errors}
            placeholder="Select spam destination..."
            required={true}
          />

          <Input
            label="Description"
            name="spam_destination_properties.description"
            placeholder="Spam handling description"
            register={register}
            errors={errors}
            isRequired={false}
          />

          {spamDestination === "FOLDER" && (
            <Input
              label="Folder Name"
              name="spam_destination_properties.folder_name"
              placeholder="Spam"
              register={register}
              errors={errors}
              isRequired={true}
            />
          )}

          {
            spamDestination === "DELETE" && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 mt-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Enabling this option will permanently delete emails matching the blocked list. This action cannot be undone.
                </span>
              </div>
            )
          }

        </div>
      </fieldset>

      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground px-2 text-left text-base font-medium">
          Email Templates
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CautionInfiniteSelectField
            name="caution_id"
            label="Caution"
            control={control}
            errors={errors}
            url={`/caution/list/${organization_id}`}
            organizationId={organization_id}
            placeholder="Select caution template..."
          />

          <DisclaimerInfiniteSelectField
            name="disclaimer_id"
            label="Disclaimer"
            control={control}
            errors={errors}
            url={`/disclaimer/list/${organization_id}`}
            organizationId={organization_id}
            placeholder="Select disclaimer template..."
          />
        </div>
      </fieldset>
    </div>
  );
};

export default SpamDestinationStep;
