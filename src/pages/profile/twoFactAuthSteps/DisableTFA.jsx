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

import {
  CircleX,
  Edit,
  Save,
  ShieldAlert,
  Trash,
  Plus,
  Smartphone,
  Mail,
  Key,
  AlertTriangle,
} from "lucide-react";
import {
  useDeleteUserTFA,
  useGetUserTFA,
  useUpdateUserTFA,
} from "@/hooks/useTFA";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { useState } from "react";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { Button, IconButton } from "@/components/common/Buttons";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

const DisableTFA = ({
  onCancel = () => {},
  onEnTOTP = () => {},
  onDisTOTP = () => {},
  onDisSMS = () => {},
  onDisEmail = () => {},
  isPending = false,
  setHasActive = () => {},
  isSMSAuth = false,
  isEmailAuth = false,
  isTOTPAuth = false,
}) => {
  // organization_id comes off the user's own profile, not
  // userInfoAtom.organization_id - that tracks whatever org is currently
  // browsed via the top org switcher and has no bearing on the logged-in
  // user's own 2FA devices.
  const { user_id, display_name, organization_id } =
    useAtomValue(userProfileAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetUserTFA({
    organization_id,
    user_id,
    userName: display_name,
  });
  const { mutate: editMutate, isPending: editIsPending } = useUpdateUserTFA();
  const { mutate: deleteMutate, isPending: deleteIsPending } =
    useDeleteUserTFA();

  const [editState, setEditState] = useState({ id: null, value: "" });
  const [deleteState, setDeleteState] = useState({
    id: null,
    value: "",
    showModal: false,
  });

  const refreshData = () =>
    queryClient.invalidateQueries(["get_user_tfa", organization_id, user_id]);

  const handleEdit = (item) =>
    setEditState({ id: item.totp_id, value: item.totp_name });
  const handleDelete = (item) =>
    setDeleteState({
      id: item.totp_id,
      value: item.totp_name,
      showModal: true,
    });
  const handleClose = () => {
    setEditState({ id: null, value: "" });
    setDeleteState({ id: null, value: "", showModal: false });
  };

  const handleSave = () => {
    const { id, value } = editState;
    if (!value?.trim()) return toast("error", "TFA name cannot be empty");

    editMutate(
      {
        org_id: organization_id,
        user_id,
        totp_id: id,
        queryParams: { totp_name: value, is_active: true },
        userName: display_name,
      },
      {
        onSuccess: () => {
          handleClose();
          refreshData();
          toast("success", "Successfully updated user TFA");
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

  const handleConfirmDelete = () => {
    const { id } = deleteState;
    deleteMutate(
      { org_id: organization_id, user_id, totp_id: id, userName: display_name },
      {
        onSuccess: () => {
          handleClose();
          refreshData();
          toast("success", "Successfully deleted user TFA");
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

  const renderMethodCard = (
    icon,
    label,
    isEnabled,
    onAction,
    variant = "destructive",
  ) => (
    <div className="p-4 bg-background border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <div className="text-left">
            <p className="font-medium text-card-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">
              {isEnabled ? "Currently enabled" : "Currently disabled"}
            </p>
          </div>
        </div>
        <Button
          variant={variant}
          size="sm"
          disabled={isPending}
          onClick={onAction}
        >
          {isEnabled ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full h-[68vh] flex flex-col bg-card">
        {/* Header */}
        <StepHeader
          icon={ShieldAlert}
          title="Manage Two-Factor Authentication"
          subtitle="Configure your 2FA settings and manage authenticator devices"
        />

        {/* Content Area */}
        <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Warning Card */}
            <InstructionCard
              icon={AlertTriangle}
              title="Security Warning"
              message="Disabling two-factor authentication will reduce your account security. We recommend keeping at least one 2FA method enabled."
              variant="warning"
            />

            {/* 2FA Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground text-left">
                Authentication Methods
              </h3>

              <div className="space-y-3">
                {/* SMS Authentication */}
                {isSMSAuth &&
                  renderMethodCard(
                    <Smartphone className="w-4 h-4 text-muted-foreground" />,
                    "SMS Authentication",
                    true,
                    onDisSMS,
                  )}

                {/* Email Authentication */}
                {isEmailAuth &&
                  renderMethodCard(
                    <Mail className="w-4 h-4 text-muted-foreground" />,
                    "Email Authentication",
                    true,
                    onDisEmail,
                  )}

                {/* TOTP Authentication */}
                {data?.data?.length > 0 &&
                  renderMethodCard(
                    <Key className="w-4 h-4 text-muted-foreground" />,
                    "Authenticator App (TOTP)",
                    isTOTPAuth,
                    isTOTPAuth ? onDisTOTP : onEnTOTP,
                    isTOTPAuth ? "destructive" : "success",
                  )}
              </div>
            </div>

            {/* TOTP Devices List */}
            {data?.data?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground text-left">
                  Authenticator Devices
                </h3>

                <div className="border border-border rounded-lg p-4 max-h-[50vh] overflow-y-auto">
                  {data.data.length ? (
                    <div className="space-y-2">
                      {data.data.map((item) => (
                        <div
                          key={item.totp_id}
                          className="p-3 bg-primary/5 border border-primary/20 rounded-lg"
                        >
                          {editState.id === item.totp_id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editState.value}
                                onChange={(e) =>
                                  setEditState({
                                    ...editState,
                                    value: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Enter device name"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                disabled={editIsPending}
                                icon={CircleX}
                              />
                              <Button
                                variant="success"
                                size="sm"
                                onClick={handleSave}
                                disabled={editIsPending}
                                icon={Save}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary/10 rounded">
                                  <Key className="w-3 h-3 text-primary" />
                                </div>
                                <span className="font-medium text-card-foreground">
                                  {item.totp_name || "Unnamed Device"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IconButton
                                  tooltip="Edit"
                                  handleClick={() => handleEdit(item)}
                                  disabled={deleteIsPending}
                                  icon={Edit}
                                />
                                <IconButton
                                  variant="danger"
                                  tooltip="Delete"
                                  handleClick={() => handleDelete(item)}
                                  disabled={deleteIsPending}
                                  icon={Trash}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No authenticator devices found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-border mx-2">
          <Button
            variant="secondary"
            size="lg"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            disabled={isPending}
            onClick={setHasActive}
            icon={Plus}
            iconPosition="right"
          >
            Add Another 2FA
          </Button>
        </div>
      </div>

      <DeleteModelBox
        isOpen={deleteState.showModal}
        handleCancel={handleClose}
        handleDelete={handleConfirmDelete}
        value={deleteState.value || ""}
        isLoading={isLoading}
      />
    </>
  );
};

export default DisableTFA;
