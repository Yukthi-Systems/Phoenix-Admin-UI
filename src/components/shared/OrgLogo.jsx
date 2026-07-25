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
import { useAtomValue } from "jotai";
import { Camera, Loader2, Building2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetOrganizationLogoUrl,
  useUploadOrganizationLogo,
} from "@/hooks/useOrganization";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import ImageUploadModal from "../common/ImageUploadModal";

const OrganizationLogo = ({
  size = "large",
  showUpload = true,
  organizationId = null,
  organizationName = null,
  rounded = true,
  maxHeight = "max-h-[36px]", // For navbar: maxHeight="h-8" or "h-10"
  maxWidth = null, // For navbar: maxWidth="w-32" or "w-40"
  className = "",
  onUploadSuccess = null,
  onUploadError = null,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userInfo = useAtomValue(userInfoAtom);
  const userProfile = useAtomValue(userProfileAtom);

  // Use provided organizationId or fall back to user's organization
  const targetOrgId = organizationId || userProfile?.organization_id;
  const targetOrgName =
    organizationName || userProfile?.organization_name || "Organization";
  const isCurrentUserOrg = !organizationId;

  const { mutate: uploadOrgLogo, isPending: isUploading } =
    useUploadOrganizationLogo();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data: logoData, isLoading: isLogoLoading } =
    useGetOrganizationLogoUrl(targetOrgId);

  const sizeConfig = {
    xxs: {
      container: "w-8 h-8",
      image: "w-7 h-7",
      camera: "w-3 h-3",
      overlay: "w-8 h-8",
    },
    xs: {
      container: "w-10 h-10",
      image: "w-7 h-7",
      camera: "w-3 h-3",
      overlay: "w-10 h-10",
    },
    small: {
      container: "w-16 h-16",
      image: "w-14 h-14",
      camera: "w-4 h-4",
      overlay: "w-16 h-16",
    },
    medium: {
      container: "w-20 h-20",
      image: "w-16 h-16",
      camera: "w-5 h-5",
      overlay: "w-20 h-20",
    },
    large: {
      container: "w-28 h-28",
      image: "w-24 h-24",
      camera: "w-6 h-6",
      overlay: "w-28 h-28",
    },
    xl: {
      container: "w-32 h-32",
      image: "w-32 h-32",
      camera: "w-7 h-7",
      overlay: "w-32 h-32",
    },
  };

  const config = sizeConfig[size] || sizeConfig.large;

  const getContainerClasses = () => {
    if (!rounded) {
      // For navbar/non-rounded: minimal container, let image determine size
      const maxHeightClass = maxHeight || "";
      const maxWidthClass = maxWidth || "";
      return `relative inline-block group ${maxHeightClass} ${maxWidthClass}`;
    }
    // For rounded: use fixed container size
    return `relative ${config.container} flex items-center justify-center group`;
  };

  const getImageClasses = () => {
    if (!rounded) {
      // For navbar/non-rounded: natural size with max constraints
      const maxHeightClass = maxHeight || "max-h-[40px]";
      const maxWidthClass = maxWidth || "";
      return `object-contain bg-background ${maxHeightClass} ${maxWidthClass}`;
    }
    // For rounded: fixed size with rounded styling
    const baseClasses = `${config.image} object-cover  bg-background`;
    const roundedClasses = "rounded-full border-1 border-primary/20";
    return `${baseClasses} ${roundedClasses}`;
  };

  const getLoadingClasses = () => {
    if (!rounded) {
      const maxHeightClass = maxHeight || "h-8";
      const maxWidthClass = maxWidth || "w-24";
      return `bg-muted animate-pulse ${maxHeightClass} ${maxWidthClass}`;
    }
    const baseClasses = `${config.image} bg-muted animate-pulse`;
    const roundedClasses = "rounded-full border-1 border-primary/20";
    return `${baseClasses} ${roundedClasses}`;
  };

  const getOverlayClasses = () => {
    if (!rounded) {
      // For navbar: overlay covers the actual image area
      const baseClasses = `absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[1px]`;
      const interactionClasses = isUploading
        ? "cursor-not-allowed"
        : "cursor-pointer hover:bg-black/60";
      return `${baseClasses} ${interactionClasses}`;
    }
    // For rounded: use fixed overlay size
    const baseClasses = `absolute inset-0 ${config.overlay} bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[1px]`;
    const roundedClasses = "rounded-full";
    const interactionClasses = isUploading
      ? "cursor-not-allowed"
      : "cursor-pointer hover:bg-black/60";
    return `${baseClasses} ${roundedClasses} ${interactionClasses}`;
  };

  const getCameraSize = () => {
    if (!rounded) {
      // Smaller camera icon for navbar
      return "w-4 h-4";
    }
    return config.camera;
  };

  const handleCameraClick = () => {
    if (isUploading || !targetOrgId) return;
    setIsModalOpen(true);
  };

  const handleUpload = (file) => {
    if (!file || !targetOrgId) return;

    // Direct file upload with the cropped image
    uploadOrgLogo(
      { organization_id: targetOrgId, file },
      {
        onSuccess: async (response) => {
          toast("success", "Organization logo updated successfully");
          setIsModalOpen(false);

          // Invalidate queries to refresh the logo
          queryClient.invalidateQueries({
            queryKey: ["organization_logo_url", targetOrgId],
          });

          // Also invalidate organization details if this is the current user's org
          if (isCurrentUserOrg) {
            queryClient.invalidateQueries({
              queryKey: ["organization_detail", targetOrgId],
            });
          }

          onUploadSuccess?.(response);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to upload organization logo";
          const tracebackId = error.response?.data?.traceback_id;
          const errorMessage = `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`;

          toast("error", errorMessage);
          onUploadError?.(errorMessage);
        },
      },
    );
  };

  const getOrganizationLogoUrl = () => {
    if (isLogoLoading) return null;

    // Always use fresh API data
    if (logoData?.hasImage && logoData?.url) {
      return logoData.url;
    }

    // Fallback to generic organization logo
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(targetOrgName)}&background=random&size=120&format=png`;
  };

  const hasLogo = () => {
    return logoData?.hasImage;
  };

  const canUpload = showUpload && targetOrgId;

  return (
    <>
      <div className={`${getContainerClasses()} ${className}`}>
        {isLogoLoading ? (
          <div className={getLoadingClasses()}></div>
        ) : (
          <img
            src={getOrganizationLogoUrl()}
            alt={`${targetOrgName} Logo`}
            className={getImageClasses()}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetOrgName)}&background=random&size=120&format=png`;
            }}
          />
        )}

        {canUpload && (
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={isUploading}
            className={getOverlayClasses()}
            title={isUploading ? "Uploading..." : "Change organization logo"}
          >
            {isUploading ? (
              <Loader2 className={`${getCameraSize()} animate-spin`} />
            ) : (
              <Camera className={getCameraSize()} />
            )}
          </button>
        )}

        {/* Only show Building2 icon for rounded logos when no logo exists */}
        {!hasLogo() && !isLogoLoading && rounded && (
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1">
            <Building2 className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        title="Upload Organization Logo"
        aspectRatio={rounded ? 1 : null} // Square for rounded logos, any ratio for non-rounded
        cropShape={rounded ? "round" : "rect"}
        outputFormat="png"
        outputQuality={0.95}
        maxFileSize={5 * 1024 * 1024} // 5MB
        allowedTypes={["image/png"]}
        minWidth={100}
        minHeight={100}
        isUploading={isUploading}
      />
    </>
  );
};

export default OrganizationLogo;
