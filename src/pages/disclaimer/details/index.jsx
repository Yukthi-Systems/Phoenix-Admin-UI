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

import { Link, useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import {
  useDeleteDisclaimer,
  useGetDisclaimerDetails,
} from "@/hooks/useDisclaimers";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  BackButton,
  EditButton,
  DeleteButton,
  Button,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import HTMLPreview from "@/components/common/HtmlPreview";
import {
  FileText,
  Code,
  Calendar,
  Info,
  MapPin,
  Check,
  X,
  Shield,
  CheckIcon,
  ClipboardIcon,
  Trash2,
  SquarePen,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useToastify } from "@/hooks/useToastify";
import { useState } from "react";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import CopyButton from "@/components/common/CopyId";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";

const DisclaimerDetails = () => {
  const toast = useToastify();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { disclaimer_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { mutate, isPending } = useDeleteDisclaimer();
  const { formatUserDateNice } = useUserTimezone();
  const { data, isLoading, isError, error } = useGetDisclaimerDetails(
    organization_id,
    disclaimer_id,
  );
  const disclaimer = data?.data;

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id, disclaimer_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Disclaimer deleted successfully");
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
            console.error(error);
          },
        },
      );
      setShowDeleteModal(false);
    } else {
      toast("error", `Message:'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

  const StatusBadge = ({ active }) => (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${
        active
          ? "bg-success/10 text-success border border-success/20"
          : "bg-destructive/10 text-destructive border border-destructive/20"
      }`}
    >
      {active ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      {active ? "Active" : "Inactive"}
    </div>
  );

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("disclaimer:view"))
    return (
      <AccessDenied content="Don't have access to view disclaimer details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while loading disclaimer details." />;

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Disclaimer Management", link: `/disclaimer` },
                { name: "View Disclaimer" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("disclaimer:edit") &&
              !isLoading &&
              disclaimer && (
                <Link to={`/disclaimer/edit/${disclaimer.disclaimer_id}`}>
                  <Button variant="primary" icon={SquarePen}>
                    Edit Disclaimer
                  </Button>
                </Link>
              )}

            {permissions?.includes("disclaimer:delete") &&
              !isLoading &&
              disclaimer && (
                <Button
                  variant="destructive"
                  icon={Trash2}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              )}
          </div>
        </div>

        <div className="h-[calc(100vh-150px)] w-full overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading disclaimer details." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-card-foreground text-left">
                        {disclaimer?.disclaimer_name || "Unknown Disclaimer"}
                      </h1>
                      <CopyButton text={disclaimer?.disclaimer_id} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                {disclaimer?.info?.description && (
                  <InfoCard
                    icon={FileText}
                    title="Description"
                    className={
                      disclaimer?.info?.address
                        ? ""
                        : "md:col-span-2 xl:col-span-1"
                    }
                  >
                    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                        {disclaimer.info.description}
                      </p>
                    </div>
                  </InfoCard>
                )}

                <InfoCard icon={Info} title="Status & Timeline">
                  {disclaimer?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(disclaimer.created_at)}
                    />
                  )}
                  {disclaimer?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(disclaimer.updated_at)}
                    />
                  )}
                </InfoCard>
              </div>

              {disclaimer?.text_content && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-card-foreground text-left">
                      Text Content
                    </h3>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-md border border-border/50 text-left">
                    {disclaimer.text_content}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {disclaimer?.html_content && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-primary/10 rounded-md">
                        <Code className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-card-foreground text-left">
                        HTML Content Preview
                      </h3>
                    </div>
                    <div className="bg-muted/30 rounded-md border border-border/50">
                      <HTMLPreview
                        height="400px"
                        showPreviewText={false}
                        resizable={false}
                        htmlContent={disclaimer.html_content}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(disclaimer_id)}
        value={disclaimer?.disclaimer_name || ""}
        isLoading={isPending}
      />
    </>
  );
};

export default DisclaimerDetails;
