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

import BranchManager from "../BranchManager";

const BranchesStep = ({
  branchKeys,
  setBranchKeys,
  editingBranch,
  setEditingBranch,
  newBranch,
  setNewBranch,
  register,
  control,
  getValues,
  setValue,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">Branches</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Add organization branch locations
        </p>
      </div>

      <fieldset className="border-border rounded-md border p-6">
        <div className="mb-4 flex items-center justify-between">
          <legend className="text-foreground text-left text-base font-medium">
            Branch Locations
          </legend>
          {branchKeys.length === 0 && (
            <span className="text-destructive text-sm">
              At least one branch is required
            </span>
          )}
        </div>

        <BranchManager
          branchKeys={branchKeys}
          setBranchKeys={setBranchKeys}
          editingBranch={editingBranch}
          setEditingBranch={setEditingBranch}
          newBranch={newBranch}
          setNewBranch={setNewBranch}
          register={register}
          control={control}
          getValues={getValues}
          setValue={setValue}
        />
      </fieldset>

      <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <svg
            className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-left">
            <p className="text-foreground text-sm font-medium">
              Branch Requirements
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              At least one branch location is required. You can add multiple
              branches and edit them inline in the table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchesStep;
