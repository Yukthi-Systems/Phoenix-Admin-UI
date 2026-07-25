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

export const userDefaultValue = {
  activate: true,
  password: "",
  confirm_password: "",
  display_name: "",
  organization_id: "",
  permissions: [],
  permissions_template: {},
  primary_phone_number_with_country_code: "",
  user_details: {
    other_email: "",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
    timezone: "",
    locale: "en-US",
  },
  user_email: "",
  user_name: "",
};

export const userEditDefaultValue = {
  user_id: "",
  user_name: "",
  user_email: "",
  primary_phone: "",
  display_name: "",
};
