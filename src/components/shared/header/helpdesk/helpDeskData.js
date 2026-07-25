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

export const helpDeskData = {
  "/user/add/": {
    title: "Add New User",
    description:
      "Create a new user account in your organization with all necessary details and permissions.",
    fields: [
      {
        key: "user_name",
        title: "Username",
        description:
          "A unique identifier for the user. This will be used for login purposes.",
        tips: [
          "Username must be unique across the organization",
          "Only letters, numbers, underscores, dots, and hyphens are allowed",
          "Choose a meaningful username that's easy to remember",
        ],
        videoLinks: [
          {
            title: "Username Best Practices",
            url: "https://www.youtube.com/watch?v=example1",
          },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=150&fit=crop",
            alt: "Username format example",
            caption: "Example of proper username format",
          },
        ],
      },
      {
        key: "activate",
        title: "User Status",
        description:
          "Determines whether the user account is active or inactive.",
        tips: [
          "Active users can log in and access the system",
          "Inactive users cannot log in but their data is preserved",
          "You can change this status later if needed",
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=250&h=100&fit=crop",
            alt: "Active status example",
            caption: "Active user status",
          },
          {
            url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=250&h=100&fit=crop",
            alt: "Inactive status example",
            caption: "Inactive user status",
          },
        ],
      },
      {
        key: "display_name",
        title: "Display Name",
        description:
          "The name that will be shown in the interface and to other users.",
        tips: [
          "This is typically the user's full name",
          "Can contain spaces and special characters",
          "Should be professional and easily recognizable",
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=120&fit=crop",
            alt: "Display name example",
            caption: "Example of a professional display name",
          },
        ],
      },
      {
        key: "user_email",
        title: "Email Address",
        description: "Primary email address for the user account.",
        tips: [
          "Must be a valid email format",
          "Used for notifications and password recovery",
          "Should be a business or professional email",
          "Must be unique in the system",
        ],
        videoLinks: [
          {
            title: "Email Security Best Practices",
            url: "https://www.youtube.com/watch?v=example2",
          },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=320&h=80&fit=crop",
            alt: "Email format example",
            caption: "Professional email format example",
          },
        ],
      },
      {
        key: "primary_phone_number_with_country_code",
        title: "Phone Number",
        description: "Primary contact phone number with country code.",
        tips: [
          "Include country code (e.g., +1 for US, +91 for India)",
          "Format: +[country code][phone number]",
          "Used for SMS notifications and account verification",
          "Should be 12-15 digits total including country code",
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=280&h=60&fit=crop",
            alt: "Phone number format example",
            caption: "Correct phone number format with country code",
          },
          {
            url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=280&h=60&fit=crop",
            alt: "Incorrect phone format",
            caption: "❌ Incorrect - missing country code",
          },
        ],
      },
      {
        key: "password",
        title: "Password",
        description: "Secure password for user authentication.",
        tips: [
          "Minimum 8 characters required",
          "Must contain letters, numbers, and at least one symbol",
          "Use strong, unique passwords",
          "Avoid common passwords or personal information",
        ],
        videoLinks: [
          {
            title: "Creating Strong Passwords",
            url: "https://www.youtube.com/watch?v=example3",
          },
          {
            title: "Password Security Tips",
            url: "https://www.youtube.com/watch?v=example4",
          },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=150&fit=crop",
            alt: "Strong password example",
            caption: "✅ Strong password example with complexity",
          },
          {
            url: "https://images.unsplash.com/photo-1471958680802-1345a694ba6d?w=300&h=150&fit=crop",
            alt: "Weak password example",
            caption: "❌ Weak password - avoid simple patterns",
          },
        ],
      },
      {
        key: "confirm_password",
        title: "Confirm Password",
        description: "Re-enter the password to ensure it was typed correctly.",
        tips: [
          "Must match the password field exactly",
          "Double-check for typos before submitting",
        ],
      },
      {
        key: "permissions",
        title: "User Permissions",
        description: "Define what actions and resources the user can access.",
        tips: [
          "Grant minimum necessary permissions (principle of least privilege)",
          "Review permissions regularly",
          "Different modules have different permission levels",
          "View, Create, Edit, Delete are the four main permission types",
        ],
        videoLinks: [
          {
            title: "Understanding User Permissions",
            url: "https://www.youtube.com/watch?v=example5",
          },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=350&h=200&fit=crop",
            alt: "Permission matrix example",
            caption: "Example of permission levels for different modules",
          },
          {
            url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=350&h=150&fit=crop",
            alt: "Security permissions example",
            caption: "Special security-related permissions",
          },
        ],
      },
      {
        key: "first_name",
        title: "First Name",
        description: "User's first name for personal identification.",
        tips: [
          "Used in formal communications",
          "Should match official documents",
          "Required for user profile completion",
        ],
      },
      {
        key: "last_name",
        title: "Last Name",
        description: "User's last name or surname.",
        tips: [
          "Used in formal communications",
          "Should match official documents",
          "Required for user profile completion",
        ],
      },
      {
        key: "user_details",
        title: "Additional Details",
        description: "Optional personal and contact information for the user.",
        tips: [
          "Timezone affects how dates and times are displayed",
          "Locale affects language and regional settings",
          "Address information is used for official correspondence",
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=320&h=180&fit=crop",
            alt: "Timezone settings example",
            caption: "Timezone selection affects date/time display",
          },
          {
            url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=320&h=180&fit=crop",
            alt: "Locale settings example",
            caption: "Locale affects language and number formats",
          },
        ],
      },
    ],
  },

  "/user/edit/:user_id": {
    title: "Edit User",
    description: "Update existing user information and settings.",
    fields: [
      {
        key: "edit_basics",
        title: "Basic Information",
        description:
          "Update user's basic information like name, email, and phone number.",
        tips: [
          "Changes to email may require verification",
          "Username changes may affect user login",
          "Phone number updates affect SMS notifications",
        ],
      },
    ],
  },

  "/domain/add/": {
    title: "Add New Domain",
    description: "Configure a new email domain for your organization.",
    fields: [
      {
        key: "domain_name",
        title: "Domain Name",
        description: "The domain name for email services (e.g., company.com).",
        tips: [
          "Must be a valid domain format",
          "Should be owned by your organization",
          "DNS configuration may be required",
        ],
      },
    ],
  },
};
