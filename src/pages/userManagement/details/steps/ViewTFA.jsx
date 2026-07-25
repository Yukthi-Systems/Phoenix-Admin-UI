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

import DeleteModelBox from "@/components/common/DeleteModelBox";
import {
  useDeleteUserTFA,
  useGetUserTFA,
  useUpdateUserTFA,
} from "@/hooks/useTFA";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import {
  CircleX,
  Edit,
  Save,
  ShieldAlert,
  Trash,
  Plus,
  Key,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, IconButton } from "@/components/common/Buttons";
import StepHeader from "@/pages/profile/twoFactAuthSteps/Stepheader";
import InstructionCard from "@/pages/profile/twoFactAuthSteps/InstructionCard";

function ViewTFA({
  onCancel = () => {},
  onEnTOTP = () => {},
  onDisTOTP = () => {},
  isTOTPAuth = false,
  setHasActive = () => {},
  userName = "",
}) {
  const { user_id } = useParams();
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetUserTFA({
    organization_id,
    user_id,
    userName,
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
        userName,
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
      { org_id: organization_id, user_id, totp_id: id, userName },
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

  const renderTOTPMethodCard = () => (
    <div className="p-4 bg-background border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Key className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-left">
            <p className="font-medium text-card-foreground">
              Authenticator App (TOTP)
            </p>
            <p className="text-sm text-muted-foreground">
              {isTOTPAuth ? "Currently enabled" : "Currently disabled"}
            </p>
          </div>
        </div>
        <Button
          variant={isTOTPAuth ? "destructive" : "success"}
          size="sm"
          disabled={editIsPending || deleteIsPending}
          onClick={isTOTPAuth ? onDisTOTP : onEnTOTP}
        >
          {isTOTPAuth ? "Disable" : "Enable"}
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
          title="TOTP Authentication Management"
          subtitle="Manage your authenticator app settings and devices"
        />

        {/* Content Area */}
        <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            {data?.data?.length > 0 ? (
              <>
                {/* Status Card */}
                <InstructionCard
                  icon={CheckCircle}
                  title="Two-Factor Authentication Active"
                  message="Your account is secured with TOTP authentication. You can manage your devices below."
                  variant="success"
                />

                {/* TOTP Method Control */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-foreground text-left">
                    Authentication Method
                  </h3>
                  {renderTOTPMethodCard()}
                </div>

                {/* TOTP Devices List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-foreground text-left">
                    Authenticator Devices ({data.data.length})
                  </h3>

                  <div className="border border-border rounded-lg p-4 max-h-[50vh] overflow-y-auto">
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
                                autoFocus
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
                                  tooltip="Edit device name"
                                  handleClick={() => handleEdit(item)}
                                  disabled={deleteIsPending}
                                  icon={Edit}
                                />
                                <IconButton
                                  variant="danger"
                                  tooltip="Delete device"
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
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* No devices found */}
                <InstructionCard
                  icon={AlertTriangle}
                  title="No Authenticator Devices Found"
                  message="You don't have any TOTP devices set up yet. Click 'Add another 2FA' to set up your first authenticator device."
                  variant="warning"
                />

                {/* Empty state illustration */}
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex justify-center items-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Set up an authenticator app to secure your account
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-border mx-2">
          <Button
            variant="secondary"
            size="lg"
            disabled={editIsPending || deleteIsPending}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            disabled={editIsPending || deleteIsPending}
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
}

export default ViewTFA;
