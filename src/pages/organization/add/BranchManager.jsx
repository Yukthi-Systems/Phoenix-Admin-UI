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

import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { Controller } from "react-hook-form";
import { Input, InputOnly } from "@/components/common/Inputs";
import Select from "react-select";
import { COUNTRIES_NAME } from "@/constants/countries";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { useToastify } from "@/hooks/useToastify";
import { nanoid } from "nanoid";

const BranchManager = ({
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
  const toast = useToastify();

  const handleBranchChange = (e) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
  };

  const addBranch = () => {
    if (!newBranch.name.trim()) {
      toast("error", "Branch name is required");
      return;
    } else if (!newBranch.address_one.trim()) {
      toast("error", "Address is required");
      return;
    } else if (!newBranch.city.trim()) {
      toast("error", "City is required");
      return;
    } else if (!newBranch.state.trim()) {
      toast("error", "State is required");
      return;
    } else if (!newBranch.country.trim()) {
      toast("error", "Country is required");
      return;
    } else if (!newBranch.pincode.trim()) {
      toast("error", "Zip Code / Pincode is required");
      return;
    }

    const newId = nanoid();
    setValue(`details.branches.${newId}`, newBranch);
    setBranchKeys((prev) => [...prev, newId]);
    setNewBranch({
      name: "",
      address_one: "",
      address_two: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    });
    toast("success", "Branch added successfully");
  };

  const saveBranch = (id) => {
    setEditingBranch(null);
    toast("success", "Branch updated successfully");
  };

  const removeBranch = (id) => {
    setBranchKeys((prev) => prev.filter((key) => key !== id));
    setValue(`details.branches.${id}`, undefined);
    if (editingBranch === id) setEditingBranch(null);
    toast("success", "Branch removed successfully");
  };

  return (
    <div className="space-y-6">
      {/* Branch Form */}
      <div className="bg-muted/10 grid grid-cols-1 gap-4 rounded-md p-4  md:grid-cols-2 xl:grid-cols-3">
        <InputOnly
          label="Branch Name"
          name="name"
          value={newBranch.name}
          onChange={handleBranchChange}
          placeholder="Enter branch name"
          isRequired={true}
        />
        <InputOnly
          label="Address Line 1"
          name="address_one"
          value={newBranch.address_one}
          onChange={handleBranchChange}
          placeholder="Address line 1"
          isRequired={true}
        />
        <InputOnly
          label="Address Line 2"
          name="address_two"
          value={newBranch.address_two}
          onChange={handleBranchChange}
          placeholder="Address line 2"
        />
        <InputOnly
          label="City"
          name="city"
          value={newBranch.city}
          onChange={handleBranchChange}
          placeholder="City"
          isRequired={true}
        />
        <InputOnly
          label="State / Province"
          name="state"
          value={newBranch.state}
          onChange={handleBranchChange}
          placeholder="State / Province"
          isRequired={true}
        />

        <div>
          <label className="text-foreground mb-2 block text-left text-sm font-medium">
            Country
            <span className="text-red-500"> *</span>
          </label>
          <Select
            options={COUNTRIES_NAME}
            value={
              COUNTRIES_NAME.find(
                (option) => option.value === newBranch.country,
              ) || null
            }
            onChange={(selectedOption) => {
              setNewBranch((prev) => ({
                ...prev,
                country: selectedOption?.value || "",
              }));
            }}
            placeholder="Select country"
            styles={getReactSelectStyles()}
            className="text-left"
            isClearable
            isSearchable
          />
        </div>

        <InputOnly
          label="Zip code / Pincode"
          name="pincode"
          type="number"
          value={newBranch.pincode}
          onChange={handleBranchChange}
          placeholder="Pincode"
          isRequired={true}
        />
        <div className="col-span-1 flex items-end justify-end md:col-span-2">
          <button
            type="button"
            onClick={addBranch}
            className="text-primary-foreground bg-primary hover:bg-primary/90 flex h-10 items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Branch
          </button>
        </div>
      </div>

      {/* Branch Table */}
      <div className="overflow-x-auto">
        <table className="border-border min-w-full rounded-lg border">
          <thead>
            <tr className="bg-muted/20">
              <th className="text-card-foreground border-border border-r border-b p-2 text-left text-sm font-medium">
                Branch Name
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-left text-sm font-medium">
                Address
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-left text-sm font-medium">
                City
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-left text-sm font-medium">
                State
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-left text-sm font-medium">
                Country
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-left text-sm font-medium">
                Pincode
              </th>
              <th className="text-card-foreground border-border w-24 border-b p-2 text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {branchKeys.map((id) => (
              <tr key={id} className="border-border hover:bg-muted/10 border-b">
                <td className="border-border border-r p-2">
                  {editingBranch === id ? (
                    <Input
                      name={`details.branches.${id}.name`}
                      register={register}
                      placeholder="Branch name"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2 text-left">
                      {getValues(`details.branches.${id}.name`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingBranch === id ? (
                    <div className="space-y-2">
                      <Input
                        name={`details.branches.${id}.address_one`}
                        register={register}
                        placeholder="Address line 1"
                        hideLabel
                      />
                      <Input
                        name={`details.branches.${id}.address_two`}
                        register={register}
                        placeholder="Address line 2"
                        hideLabel
                      />
                    </div>
                  ) : (
                    <div className="p-2 text-left">
                      <div className="text-sm font-medium">
                        {getValues(`details.branches.${id}.address_one`) || "-"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {getValues(`details.branches.${id}.address_two`) || ""}
                      </div>
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingBranch === id ? (
                    <Input
                      name={`details.branches.${id}.city`}
                      register={register}
                      placeholder="City"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2 text-left">
                      {getValues(`details.branches.${id}.city`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingBranch === id ? (
                    <Input
                      name={`details.branches.${id}.state`}
                      register={register}
                      placeholder="State"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2 text-left">
                      {getValues(`details.branches.${id}.state`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingBranch === id ? (
                    <Controller
                      name={`details.branches.${id}.country`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={COUNTRIES_NAME}
                          value={
                            COUNTRIES_NAME.find(
                              (option) => option.value === field.value,
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption?.value || "")
                          }
                          placeholder="Select country"
                          styles={getReactSelectStyles()}
                          isClearable
                          isSearchable
                        />
                      )}
                    />
                  ) : (
                    <div className="p-2 text-left">
                      {getValues(`details.branches.${id}.country`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingBranch === id ? (
                    <Input
                      name={`details.branches.${id}.pincode`}
                      register={register}
                      placeholder="Pincode"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2 text-left">
                      {getValues(`details.branches.${id}.pincode`) || "-"}
                    </div>
                  )}
                </td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-1">
                    {editingBranch === id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveBranch(id)}
                          className="text-success hover:bg-success/10 rounded-full p-1.5"
                          title="Save branch"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBranch(null)}
                          className="text-destructive hover:bg-destructive/10 rounded-full p-1.5"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingBranch(id)}
                          className="text-primary hover:bg-primary/10 rounded-full p-1.5"
                          title="Edit branch"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBranch(id)}
                          className="text-destructive hover:bg-destructive/10 rounded-full p-1.5"
                          title="Delete branch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {branchKeys.length === 0 && (
          <div className="text-muted-foreground py-4 text-center">
            No branches added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchManager;
