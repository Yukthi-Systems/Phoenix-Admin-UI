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

export const domainHelp = {
  "/domain/add/": {
    title: "Add New Domain",
    description: "Configure a new email domain for your organization.",
    steps: [
      {
        stepNumber: 1,
        stepTitle: "Domain Details",
        fields: [
          {
            key: "domain_name",
            title: "Domain Name",
            description:
              "The domain name for email services (e.g., company.com).",
            tips: [
              "Must be a valid domain format",
              "Should be owned by your organization",
              "DNS configuration may be required",
            ],
            videos: [
              {
                type: "youtube",
                embedId: "dQw4w9WgXcQ",
                title: "Domain Setup Guide",
              },
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=320&h=180&fit=crop",
                alt: "Domain configuration example",
                caption: "Example domain configuration interface",
              },
            ],
          },
        ],
      },
      {
        stepNumber: 2,
        stepTitle: "Domain Properties",
        fields: [
          {
            key: "enable_catch_all",
            title: "Catch-All Email",
            description:
              "Forward emails to undefined addresses to a catch-all mailbox.",
            tips: [
              "Useful for preventing lost emails",
              "Requires specifying a forwarding address",
              "Can increase spam if not filtered",
            ],
            videos: [
              {
                type: "external",
                url: "https://example.com/catchall-tutorial",
                title: "Understanding Catch-All Emails",
              },
            ],
          },
          {
            key: "enable_hybrid_mode",
            title: "Hybrid Mode",
            description:
              "Enable hybrid deployment with on-premises infrastructure.",
            tips: [
              "Requires valid FQDN and IP configuration",
              "Used for gradual cloud migration",
              "Contact support for setup assistance",
            ],
          },
        ],
      },
      {
        stepNumber: 3,
        stepTitle: "Password Properties",
        fields: [
          {
            key: "session_timeout",
            title: "Session Timeout",
            description: "Duration before users are logged out automatically.",
            tips: [
              "Balance security and user convenience",
              "Measured in minutes",
              "Default is 30 minutes",
            ],
          },
          {
            key: "enable_max_password_age",
            title: "Password Expiry",
            description: "Require users to change passwords periodically.",
            tips: [
              "Enhances security",
              "Set notification days to warn users",
              "Common period is 90 days",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=150&fit=crop",
                alt: "Password policy settings",
                caption: "Recommended password policy configuration",
              },
            ],
          },
        ],
      },
      {
        stepNumber: 4,
        stepTitle: "Spam & Templates",
        fields: [
          {
            key: "spam_destination",
            title: "Spam Destination",
            description: "Choose how spam emails are handled.",
            tips: [
              "Options: Delete, Quarantine, or Folder",
              "Folder option creates a spam folder in mailboxes",
              "Quarantine allows recovery of false positives",
            ],
          },
        ],
      },
    ],
  },

  "/domain/edit/:domain_id": {
    title: "Edit Domain",
    description: "Update existing domain configuration and settings.",
    fields: [
      {
        key: "basic_settings",
        title: "Basic Settings",
        description: "Update domain name and mailbox limits.",
        tips: [
          "Domain name changes require DNS updates",
          "Mailbox limit affects user creation",
        ],
      },
      {
        key: "advanced_settings",
        title: "Advanced Settings",
        description: "Modify catch-all, hybrid mode, and spam settings.",
        tips: [
          "Changes take effect immediately",
          "Review impact before saving",
        ],
      },
    ],
  },
};
