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
import { useDeleteCaution, useGetCautionDetails } from "@/hooks/useCautions";
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
  AlertTriangle,
  FileText,
  Code,
  Calendar,
  Info,
  StickyNote,
  CheckIcon,
  ClipboardIcon,
  Trash2,
  SquarePen,
} from "lucide-react";
import { useToastify } from "@/hooks/useToastify";
import { useState } from "react";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import CopyButton from "@/components/common/CopyId";
import { useUserTimezone } from "@/hooks/useTimezone";

const CautionDetails = () => {
  const toast = useToastify();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { caution_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { mutate, isPending } = useDeleteCaution();
  const { formatUserDateNice } = useUserTimezone();
  const {
    data: caution,
    isLoading,
    isError,
    error,
  } = useGetCautionDetails(organization_id, caution_id);

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id, caution_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Caution deleted successfully");
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

  const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div
      className={`bg-card border-border hover:border-primary/30 rounded-lg border p-4 transition-colors duration-200 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-primary/10 rounded-md p-1.5">
          <Icon className="text-primary h-4 w-4" />
        </div>
        <h3 className="text-card-foreground text-left text-base font-semibold">
          {title}
        </h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );

  const InfoItem = ({ label, value, sublabel }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground min-w-0 flex-1 text-left text-sm">
        {label}:
      </span>
      <div className="min-w-0 flex-1 text-right">
        <span className="text-card-foreground block text-right text-sm font-medium">
          {value}
        </span>
        {sublabel && (
          <span className="text-muted-foreground mt-0.5 block text-right text-xs">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("caution:view"))
    return (
      <AccessDenied content="Don't have access to view caution details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while loading caution details." />;

  return (
    <>
      <div className="h-full w-full overflow-hidden px-2">
        <div className="mb-3 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Caution Management", link: `/caution` },
                { name: "View Caution" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("caution:edit") && !isLoading && caution && (
              <Link to={`/caution/edit/${caution.caution_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Caution
                </Button>
              </Link>
            )}

            {permissions?.includes("caution:delete") &&
              !isLoading &&
              caution && (
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

        {/* Main content area */}
        <div className="no-scrollbar h-[calc(100vh-150px)] w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <DataLoading content="Loading caution details." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Header card with caution name and severity */}
              <div className="from-primary/8 to-primary/3 border-border rounded-lg border bg-gradient-to-r p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/15 rounded-lg p-2">
                      <AlertTriangle className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-card-foreground text-left text-xl font-bold">
                        {caution?.caution_name || "Unknown Caution"}
                      </h1>
                      <CopyButton text={caution?.caution_id} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Information cards grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {/* Basic Information Card */}
                <InfoCard
                  icon={Info}
                  title="Basic Information"
                  className="md:col-span-2 xl:col-span-1"
                >
                  {caution?.info?.description && (
                    <InfoItem
                      label="Description"
                      value={caution.info.description}
                    />
                  )}
                  {caution?.info?.severity && (
                    <InfoItem
                      label="Severity Level"
                      value={caution.info.severity}
                    />
                  )}
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="text-primary flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="text-left">
                        Security caution configured
                      </span>
                    </div>
                  </div>
                </InfoCard>

                {/* Notes Card - Only show if notes exist */}
                {caution?.info?.notes && (
                  <InfoCard icon={StickyNote} title="Additional Notes">
                    <div className="bg-muted/30 border-border/50 rounded-md border p-3">
                      <p className="text-card-foreground text-left text-sm break-words whitespace-pre-wrap">
                        {caution.info.notes}
                      </p>
                    </div>
                  </InfoCard>
                )}

                {/* Timestamps Card */}
                <InfoCard icon={Calendar} title="Timeline Information">
                  {caution?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(caution.created_at)}
                    />
                  )}
                  {caution?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(caution.updated_at)}
                    />
                  )}
                </InfoCard>
              </div>

              {/* Content sections - Full width */}
              <div className="space-y-4">
                {/* HTML Content Section */}
                {caution?.html_content && (
                  <div className="bg-card border-border rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="bg-primary/10 rounded-md p-1.5">
                        <Code className="text-primary h-4 w-4" />
                      </div>
                      <h3 className="text-card-foreground text-left text-base font-semibold">
                        HTML Content Preview
                      </h3>
                    </div>
                    <div className="bg-muted/30 border-border/50 rounded-md border">
                      <HTMLPreview
                        height="300px"
                        htmlContent={caution.html_content}
                      />
                    </div>
                  </div>
                )}

                {/* Text Content Section */}
                {caution?.text_content && (
                  <div className="bg-card border-border rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="bg-primary/10 rounded-md p-1.5">
                        <FileText className="text-primary h-4 w-4" />
                      </div>
                      <h3 className="text-card-foreground text-left text-base font-semibold">
                        Text Content
                      </h3>
                    </div>
                    <div className="bg-muted/30 border-border/50 rounded-md border p-4">
                      <pre className="text-card-foreground text-left font-mono text-sm break-words whitespace-pre-wrap">
                        {caution.text_content}
                      </pre>
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
        handleDelete={() => OnDelete(caution_id)}
        value={caution?.caution_name || ""}
        isLoading={isPending}
      />
    </>
  );
};

export default CautionDetails;
