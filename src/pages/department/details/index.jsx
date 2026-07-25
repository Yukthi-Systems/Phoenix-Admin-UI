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

import { useAtomValue } from "jotai";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useGetDepartment, useDeleteDepartment } from "@/hooks/useDepartment";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  BackButton,
  Button,
  DeleteButton,
  EditButton,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useToastify } from "@/hooks/useToastify";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building,
  MapPin,
  FileText,
  StickyNote,
  Users,
  Calendar,
  Info,
  User,
  Mail,
  Phone,
  ClipboardIcon,
  CheckIcon,
  SquarePen,
  Trash2,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import CopyButton from "@/components/common/CopyId";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";

const DepartmentDetails = () => {
  const { department_id } = useParams();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const toast = useToastify();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, isError, error } = useGetDepartment(
    organization_id,
    department_id,
  );
  const department = data?.data || {};
  const { mutate, isPending } = useDeleteDepartment();

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id, department_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted department");
            navigate("/department");
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
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

  const PersonCard = ({ person, index }) => (
    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <User className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-card-foreground">
          Person {index + 1}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        {person.name && (
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-card-foreground">{person.name}</span>
          </div>
        )}
        {person.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="text-card-foreground font-mono">
              {person.email}
            </span>
          </div>
        )}
        {person.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-card-foreground font-mono">
              {person.phone}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions?.includes("department:view"))
    return (
      <AccessDenied content="Don't have access to view department details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Department details getting error...!" />;

  return (
    <>
      <div className="w-full h-full px-2 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "Department Management",
                  link: `/department`,
                },
                {
                  name: "View Department",
                },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("department:edit") && !isLoading && (
              <Link to={`/department/edit/${department?.department_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Department
                </Button>
              </Link>
            )}

            {permissions?.includes("department:delete") && !isLoading && (
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

        <div className="h-[calc(100vh-150px)] overflow-y-auto w-full no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <DataLoading content="Loading department details." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-border rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/15 rounded-lg">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-card-foreground text-left">
                      {department?.department_name || "Unknown Department"}
                    </h1>
                    <CopyButton text={department?.department_id} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {department?.details?.address && (
                  <InfoCard icon={MapPin} title="Address">
                    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left">
                        {department.details.address}
                      </p>
                    </div>
                  </InfoCard>
                )}

                {department?.details?.description && (
                  <InfoCard
                    icon={FileText}
                    title="Description"
                    className={
                      !department?.details?.address
                        ? "md:col-span-2 xl:col-span-1"
                        : ""
                    }
                  >
                    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                        {department.details.description}
                      </p>
                    </div>
                  </InfoCard>
                )}

                {department?.details?.notes && (
                  <InfoCard icon={StickyNote} title="Notes">
                    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left leading-relaxed">
                        {department.details.notes}
                      </p>
                    </div>
                  </InfoCard>
                )}

                <InfoCard icon={Calendar} title="Timeline Information">
                  {department?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(department.created_at)}
                    />
                  )}
                  {department?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(department.updated_at)}
                    />
                  )}
                </InfoCard>

                <div className="col-span-2">
                  {department?.details?.authorized_persons &&
                    department.details.authorized_persons.length > 0 &&
                    department.details.authorized_persons.some(
                      (person) => person.name || person.email || person.phone,
                    ) && (
                      <div className="space-y-4">
                        <InfoCard
                          icon={Users}
                          title="Authorized Persons"
                          className="w-full"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {department.details.authorized_persons
                              .filter(
                                (person) =>
                                  person.name || person.email || person.phone,
                              )
                              .map((person, index) => (
                                <PersonCard
                                  key={index}
                                  person={person}
                                  index={index}
                                />
                              ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                              {
                                department.details.authorized_persons.filter(
                                  (person) =>
                                    person.name || person.email || person.phone,
                                ).length
                              }{" "}
                              authorized{" "}
                              {department.details.authorized_persons.filter(
                                (person) =>
                                  person.name || person.email || person.phone,
                              ).length === 1
                                ? "person"
                                : "persons"}
                            </span>
                          </div>
                        </InfoCard>
                      </div>
                    )}

                  {(!department?.details?.authorized_persons ||
                    department.details.authorized_persons.length === 0 ||
                    !department.details.authorized_persons.some(
                      (person) => person.name || person.email || person.phone,
                    )) && (
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-card-foreground mb-2">
                        No Authorized Persons
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This department doesn't have any authorized persons
                        configured yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(department?.department_id)}
        value={department?.department_name || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={department?.department_name || ""}
        confirmationPlaceholder={`Type "${department?.department_name || ""}" to confirm`}
        confirmationLabel="Please type the department name exactly to confirm deletion:"
        title="Delete Department"
        description="This action cannot be undone and will remove all department data."
      />
    </>
  );
};

export default DepartmentDetails;
