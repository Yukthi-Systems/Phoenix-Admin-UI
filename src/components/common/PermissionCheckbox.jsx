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

const PermissionCheckbox = ({
  value,
  name = "permissions",
  setValue,
  watch,
}) => {
  const currentValues = watch(name) || [];

  const handleChange = (e) => {
    const checked = e.target.checked;
    let updatedValues = [...currentValues];

    if (checked) {
      if (!updatedValues.includes(value)) {
        updatedValues.push(value);
      }
    } else {
      updatedValues = updatedValues.filter((item) => item !== value);
    }

    setValue(name, updatedValues);
  };

  return (
    <label className="flex justify-center items-center gap-2">
      <input
        type="checkbox"
        checked={currentValues?.includes(value)}
        onChange={handleChange}
      />
    </label>
  );
};

export default PermissionCheckbox;
