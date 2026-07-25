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

import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail } from "lucide-react";
import EditModelBox from "@/components/common/EditModelBox";
import { Input } from "@/components/common/Inputs";
import { Button } from "@/components/common/Buttons";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const RequestLogsModal = ({ isOpen, onClose, onSubmit, isPending }) => {
  const userProfile = useAtomValue(userProfileAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: userProfile?.user_email },
  });

  const handleFormSubmit = (data) => {
    onSubmit(data.email);
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <EditModelBox
      isOpen={isOpen}
      handleCancel={onClose}
      label="Request Audit Logs"
      customStyle="max-w-md w-full"
    >
      <div className="p-1">
        <p className="text-muted-foreground text-sm mb-6">
          Please enter the email address where you would like to receive the
          requested audit logs report.
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Input
            label="Recipient Email"
            name="email"
            type="email"
            placeholder="e.g. admin@example.com"
            register={register}
            errors={errors}
            // FIX: Pass as an element (<Mail />), not the object (Mail)
            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
            isRequired
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isPending={isPending}>
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </EditModelBox>
  );
};

export default RequestLogsModal;
