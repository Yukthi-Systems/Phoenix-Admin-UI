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

import { useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Camera, Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProfilePictureUrl,
  useUploadProfilePicture,
} from "@/hooks/useUser";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import ImageUploadModal from "@/components/common/ImageUploadModal";

const ProfilePicture = ({
  size = "large",
  showUpload = true,
  organizationId = null,
  userId = null,
  displayName = null,
  isActive = null,
  showStatus = true,
  showBorder = false,
  className = "",
  onUploadSuccess = null,
  onUploadError = null,
  viewFullScreen = false,
  // Modal customization props
  enableImageEditing = true,
  showRotation = true,
  showFlip = true,
  showZoom = true,
  showBrightness = true,
  showContrast = true,
  showSaturation = false,
  showFilters = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const fileInputRef = useRef(null);
  const userInfo = useAtomValue(userInfoAtom);
  const [userDetails, setUserDetails] = useAtom(userProfileAtom);

  const targetOrgId = organizationId || userDetails?.organization_id;
  const targetUserId = userId || userDetails?.user_id;
  const targetDisplayName = displayName || userDetails?.display_name || "Guest";
  const targetIsActive = isActive !== null ? isActive : userDetails?.is_active;
  const isCurrentUser = !organizationId && !userId;

  const { mutate: uploadProfilePic, isPending: isUploading } =
    useUploadProfilePicture();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data: profilePictureData, isLoading: isPictureLoading } =
    useGetProfilePictureUrl(targetOrgId, targetUserId);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/png"];

  const sizeConfig = {
    xs: {
      container: "w-10 h-10",
      image: "w-10 h-10",
      camera: "w-3 h-3",
      cameraButton: "w-6 h-6",
      status: "w-3 h-3 -bottom-0 -right-0",
      overlay: "w-10 h-10",
    },
    small: {
      container: "w-16 h-16",
      image: "w-16 h-16",
      camera: "w-4 h-4",
      cameraButton: "w-7 h-7",
      status: "w-4 h-4 -bottom-0.5 -right-0.5",
      overlay: "w-16 h-16",
    },
    medium: {
      container: "w-20 h-20",
      image: "w-20 h-20",
      camera: "w-5 h-5",
      cameraButton: "w-8 h-8",
      status: "w-5 h-5 -bottom-1 -right-1",
      overlay: "w-20 h-20",
    },
    large: {
      container: "w-28 h-28",
      image: "w-28 h-28",
      camera: "w-6 h-6",
      cameraButton: "w-10 h-10",
      status: "w-8 h-8 -bottom-1 -right-1",
      overlay: "w-28 h-28",
    },
    xl: {
      container: "w-32 h-32",
      image: "w-32 h-32",
      camera: "w-7 h-7",
      cameraButton: "w-12 h-12",
      status: "w-8 h-8 -bottom-2 -right-2",
      overlay: "w-32 h-32",
    },
  };

  const config = sizeConfig[size] || sizeConfig.large;

  const handleCameraClick = (e) => {
    e.stopPropagation();
    if (isUploading || !targetOrgId || !targetUserId) return;

    if (enableImageEditing) {
      setIsModalOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageClick = (e) => {
    if (viewFullScreen && !isUploading && !isPictureLoading) {
      setIsFullScreenOpen(true);
    }
  };

  const handleModalUpload = (file) => {
    if (!file) return;

    uploadProfilePic(
      { organization_id: targetOrgId, user_id: targetUserId, file },
      {
        onSuccess: async (response) => {
          toast("success", "Profile picture updated successfully");
          setIsModalOpen(false);

          queryClient.invalidateQueries({
            queryKey: ["profile_picture_url", targetOrgId, targetUserId],
          });

          if (isCurrentUser) {
            queryClient.invalidateQueries({
              queryKey: ["profile", targetUserId, targetOrgId],
            });
          }

          onUploadSuccess?.(response);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to upload profile picture";
          const tracebackId = error.response?.data?.traceback_id;
          const errorMessage = `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`;

          toast("error", errorMessage);
          onUploadError?.(errorMessage);
        },
      },
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);

    if (!validation.valid) {
      toast("error", validation.error);
      onUploadError?.(validation.error);
      return;
    }

    uploadProfilePic(
      { organization_id: targetOrgId, user_id: targetUserId, file },
      {
        onSuccess: async (response) => {
          toast("success", "Profile picture updated successfully");

          queryClient.invalidateQueries({
            queryKey: ["profile_picture_url", targetOrgId, targetUserId],
          });

          if (isCurrentUser) {
            queryClient.invalidateQueries({
              queryKey: ["profile", targetUserId, targetOrgId],
            });
          }

          onUploadSuccess?.(response);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to upload profile picture";
          const tracebackId = error.response?.data?.traceback_id;
          const errorMessage = `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`;

          toast("error", errorMessage);
          onUploadError?.(errorMessage);
        },
      },
    );

    e.target.value = "";
  };

  const validateFile = (file) => {
    if (!file) return { valid: false, error: "No file selected" };

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Please select a valid image file (PNG, JPG, JPEG)",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File size must be less than 5MB" };
    }

    return { valid: true };
  };

  const getProfilePictureUrl = () => {
    if (isPictureLoading) return null;

    if (profilePictureData?.hasImage && profilePictureData?.url) {
      return profilePictureData.url;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(targetDisplayName)}&background=random&size=120`;
  };

  const getBorderClass = () => {
    if (!showBorder) return "";

    // We use a combination of padding and border to create the gap effect
    const baseClasses = "rounded-full p-0.5 transition-all duration-300";
    if (targetIsActive === null || targetIsActive === undefined) {
      return `${baseClasses} border-2 border-muted`;
    }

    return targetIsActive
      ? `${baseClasses} border-2 border-success`
      : `${baseClasses} border-2 border-destructive`;
  };

  const canUpload = showUpload && targetOrgId && targetUserId;
  const bothEnabled = canUpload && viewFullScreen;

  return (
    <>
      <div className={`relative ${config.container} group ${className}`}>
        {canUpload && !enableImageEditing && (
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        )}

        {isPictureLoading ? (
          <div
            className={`${config.image} rounded-full bg-muted animate-pulse ${getBorderClass()}`}
          ></div>
        ) : (
          <img
            src={getProfilePictureUrl()}
            alt="Profile"
            className={`${config.image} rounded-full object-cover ${getBorderClass()} shadow-lg bg-background ${
              viewFullScreen
                ? "cursor-pointer hover:opacity-90 transition-opacity"
                : ""
            }`}
            onClick={handleImageClick}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetDisplayName)}&background=random&size=120`;
            }}
          />
        )}

        {canUpload &&
          (bothEnabled ? (
            // When both upload and fullscreen are enabled: show camera button in corner
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isUploading}
              className={`absolute bottom-0 right-0 ${config.cameraButton} bg-accent hover:bg-accent/80 text-foreground rounded-full shadow-lg border-2 border-card flex items-center justify-center transition-all duration-200 ${
                isUploading
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:scale-110"
              }`}
              title={isUploading ? "Uploading..." : "Change profile picture"}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          ) : (
            // When only upload is enabled: show hover overlay
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isUploading}
              className={`absolute inset-0 ${config.overlay} rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[1px] ${
                isUploading
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:bg-black/60"
              }`}
              title={isUploading ? "Uploading..." : "Change profile picture"}
            >
              {isUploading ? (
                <Loader2 className={`${config.camera} animate-spin`} />
              ) : (
                <Camera className={config.camera} />
              )}
            </button>
          ))}
      </div>

      {/* Full Screen Image Modal */}
      {viewFullScreen && isFullScreenOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm"
          onClick={() => setIsFullScreenOpen(false)}
        >
          <div className="relative">
            <button
              onClick={() => setIsFullScreenOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <img
              src={getProfilePictureUrl()}
              alt="Profile - Full Screen"
              className="max-w-[80vh] max-h-[80vh] w-auto h-auto rounded-full object-cover shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetDisplayName)}&background=random&size=400`;
              }}
            />
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {enableImageEditing && (
        <ImageUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpload={handleModalUpload}
          title="Upload Profile Picture"
          aspectRatio={1}
          cropShape="round"
          outputFormat="png"
          outputQuality={0.9}
          maxFileSize={MAX_FILE_SIZE}
          allowedTypes={ALLOWED_TYPES}
          minWidth={100}
          minHeight={100}
          isUploading={isUploading}
          showRotation={showRotation}
          showFlip={showFlip}
          showZoom={showZoom}
          showBrightness={showBrightness}
          showContrast={showContrast}
          showSaturation={showSaturation}
          showFilters={showFilters}
          enableFreeformCrop={false}
          maxOutputWidth={400}
          maxOutputHeight={400}
        />
      )}
    </>
  );
};

export default ProfilePicture;
