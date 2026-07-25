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

export const userHelp = {
    "/user/add/": {
      title: "Add New User",
      description: "Create a new user account with permissions.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Basic Information",
          fields: [
            {
              key: "user_name",
              title: "Username",
              description: "Unique identifier for login.",
              tips: [
                "Must be unique across organization",
                "Only letters, numbers, underscores, dots, hyphens",
                "Choose something memorable",
              ],
              images: [
                {
                  url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=150&fit=crop",
                  alt: "Username format",
                  caption: "Proper username format example",
                },
              ],
            },
            {
              key: "user_email",
              title: "Email Address",
              description: "Primary email for notifications and recovery.",
              tips: [
                "Must be valid email format",
                "Used for password recovery",
                "Must be unique in system",
              ],
            },
            {
              key: "display_name",
              title: "Display Name",
              description: "Name shown in interface.",
              tips: [
                "Typically user's full name",
                "Can contain spaces and special characters",
                "Should be professional",
              ],
            },
          ],
        },
        {
          stepNumber: 2,
          stepTitle: "Security",
          fields: [
            {
              key: "password",
              title: "Password",
              description: "Secure password for authentication.",
              tips: [
                "Minimum 8 characters",
                "Must contain letters, numbers, and symbols",
                "Avoid common passwords",
              ],
              videos: [
                {
                  type: "youtube",
                  embedId: "password-security",
                  title: "Creating Strong Passwords",
                },
              ],
            },
          ],
        },
        {
          stepNumber: 3,
          stepTitle: "Permissions",
          fields: [
            {
              key: "permissions",
              title: "User Permissions",
              description: "Define user's access and capabilities.",
              tips: [
                "Grant minimum necessary permissions",
                "Review regularly",
                "View, Create, Edit, Delete are main types",
              ],
              images: [
                {
                  url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=350&h=200&fit=crop",
                  alt: "Permission matrix",
                  caption: "Permission levels for modules",
                },
              ],
            },
          ],
        },
      ],
    },
  
    "/user/edit/:user_id": {
      title: "Edit User",
      description: "Update user information and settings.",
      fields: [
        {
          key: "edit_basics",
          title: "Basic Information",
          description: "Update name, email, and phone.",
          tips: [
            "Email changes may require verification",
            "Username changes affect login",
          ],
        },
        {
          key: "edit_permissions",
          title: "Permissions",
          description: "Modify user access levels.",
          tips: ["Changes take effect immediately", "Document permission changes"],
        },
      ],
    },
  
    "/user/": {
      title: "User Management",
      description: "View and manage all users.",
      fields: [
        {
          key: "user_list",
          title: "User List",
          description: "Browse and search users.",
          tips: [
            "Use filters to find users quickly",
            "Status indicators show active/inactive",
          ],
        },
      ],
    },
  };