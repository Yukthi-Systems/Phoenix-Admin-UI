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

// formValues/validationSchema.js
import * as yup from 'yup';

export const maintenanceSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters'),
  
  description: yup
    .string()
    .required('Description is required')
    .min(8, 'Description must be at least 8 characters')
    .max(500, 'Description must not exceed 500 characters'),
  
  affected: yup
    .array()
    .of(yup.string().min(1, 'Service name cannot be empty'))
    .optional(),
  
  severity: yup
    .string()
    .required('Severity is required')
    .oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 'Invalid severity level'),
  
  type: yup
    .string()
    .required('Type is required')
    .min(2, 'Type must be at least 2 characters')
    .max(50, 'Type must not exceed 50 characters'),
  
  is_active: yup
    .boolean()
    .required('Active status is required'),
  
  start_time: yup
    .string()
    .required('Start time is required')
    .test('is-future', 'Start time must be in the future', function(value) {
      if (!value) return false;
      return new Date(value) > new Date();
    }),
  
  end_time: yup
    .string()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function(value) {
      const { start_time } = this.parent;
      if (!value || !start_time) return false;
      return new Date(value) > new Date(start_time);
    })
});