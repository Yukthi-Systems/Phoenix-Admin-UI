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
import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import EditModelBox from "@/components/common/EditModelBox";
import { userInfoAtom } from "@/store/userInfo";
import { useChangePermission, useGetUser } from "@/hooks/useUser";
import { SubmitButton } from "@/components/common/Buttons";
import { useEffect, useState } from "react";
import PermissionTables from "../add/PermissionTable";
import DataLoading from "@/components/common/DataLoading";
import { userProfileAtom } from "@/store/userProfile";

function ChangePermission({
  user_id,
  changePermission = false,
  closePermission = () => {},
  user_name
}) {
  const { permissions_template: UserTemplate = [] } =
    useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const { mutate, isPending } = useChangePermission();
  const [template, setTemplate] = useState("");
  const { data, isLoading, isError } = useGetUser(organization_id, user_id);
  const user_details = data?.user_details ?? null;
  const optionsPermission = Object.entries(UserTemplate || {}).map(
    ([key, value]) => ({
      value: key,
      label: key,
    }),
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      permissions: [],
    },
    mode: "onChange",
  });

  function getObjectByKey(object, key) {
    if (object.hasOwnProperty(key)) {
      return { [key]: object[key] };
    }
    return null;
  }

  const handleAdd = (selectedOption) => {
    setTemplate(selectedOption?.value);
    let value = getObjectByKey(UserTemplate, selectedOption?.value);
    let newPer = Object.values(value || {}).flat() || [];
    const newPermissions = [...newPer];
    setValue("permissions", newPermissions);
  };

  const onSubmit = (formData) => {
    mutate(
      { orgId: organization_id, user_id: user_id, data: formData?.permissions , userName: user_name},
      {
        onSuccess: () => {
          toast("success", "Successfully user Permission is updated");
          closePermission();
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
    if (user_details?.permissions) {
      reset({
        permissions: user_details?.permissions || [],
      });
    }
  }, [user_details]);

  return (
    <EditModelBox
      handleCancel={closePermission}
      isOpen={changePermission}
      label="Manage Permissions"
      outsideClick={false}
    >
      <div className=" w-[70vw] max-h-[75vh] overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center w-[70vw] h-[75vh]">
            <DataLoading content="Loading user details..." />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto  rounded-xl px-5 py-2 space-y-5 text-left"
          >
            <PermissionTables
              setValue={setValue}
              watch={watch}
              showDropdown={true}
              optionsPermission={optionsPermission}
              handleAdd={handleAdd}
              template={template}
            />
            <div className="text-center">
              <SubmitButton label="Update Permissions" isPending={isPending} />
            </div>
          </form>
        )}
      </div>
    </EditModelBox>
  );
}

export default ChangePermission;
