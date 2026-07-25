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

export const TICKET_PRIORITIES = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Critical', value: 'Critical' },
  ];
  
  export const TICKET_CATEGORIES = [
    { label: 'Technical Issue', value: 'Technical Issue' },
    { label: 'Billing & Payments', value: 'Billing & Payments' },
    { label: 'Account Management', value: 'Account Management' },
    { label: 'Feature Request', value: 'Feature Request' },
    { label: 'Other', value: 'Other' },
  ];
  
  export const TICKET_SUBCATEGORIES = {
    'Technical Issue': [
      { label: 'Email Delivery', value: 'Email Delivery' },
      { label: 'Server Connection', value: 'Server Connection' },
      { label: 'Login Problems', value: 'Login Problems' },
      { label: 'Bug Report', value: 'Bug Report' },
    ],
    'Billing & Payments': [
      { label: 'Invoice Dispute', value: 'Invoice Dispute' },
      { label: 'Payment Failure', value: 'Payment Failure' },
      { label: 'Upgrade/Downgrade', value: 'Upgrade/Downgrade' },
    ],
    'Account Management': [
      { label: 'Profile Update', value: 'Profile Update' },
      { label: 'Security Settings', value: 'Security Settings' },
    ],
    'Feature Request': [
      { label: 'New Functionality', value: 'New Functionality' },
      { label: 'Improvement', value: 'Improvement' },
    ],
    'Other': [
      { label: 'General Inquiry', value: 'General Inquiry' },
    ]
  };