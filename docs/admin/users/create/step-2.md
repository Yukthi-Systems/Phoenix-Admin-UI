### Step 2 of 4 — Permissions

This is the biggest step — it's where you decide exactly what this admin user can see and do. Permissions are grouped into categories (Admin Management, User Management, and so on), and each item within a category has up to four possible actions:

| Field | What it means |
| --- | --- |
| View | Can see this item. |
| Create | Can add a new one. |
| Edit | Can change an existing one. |
| Delete | Can remove one. |

Tick the boxes you want to grant. A dash (—) means that action doesn't apply to that item — for example, a log can be viewed but not edited or deleted. Each category shows a running count (e.g. "0/18") of how many boxes are ticked out of the total available, and has its own Select all button to grant every action in that category at once.

![The Permissions step — Admin Management and the start of User Management.](../../images/admin-user-step2-permissions-a.png)

*The Permissions step — Admin Management and the start of User Management.*

| Field | What it means |
| --- | --- |
| Admin Management | Organisations, the Organisation Dashboard, Support Tickets, Support Admin, Admin API Keys and the IMAP Sync Tool. |
| User Management | Domains, Departments, User Identity, E-Mail Service (Mailboxes), Chat Service, File Service and Admin Panel Users. |
| Customer Relationship Management (CRM) | Services, Purchase Orders and Invoices — view only. |
| Server Management | Servers, Mailbox Migration, Domain Migration, E-Mail Identity Admin Lookup and Admin Maintenance / System Alerts. |
| Logs | Admin Audits, E-Mail Service Mail Flow and E-Mail Service Login Attempts — view only. |
| All Policies & Restrictions | Geo/IP Restriction Policy and every policy type from Chapter 8 — General, Filters, Attachment, Forwarding, Distribution, Disclaimer and Caution. |
| Session Management | The three Sessions screens from Chapter 10 — Mailbox, Mail 25 App and Single Sign-On (SSO). |
| Admin User Security Management | 2FA (Email, SMS, TOTP), Backup Security Codes, Admin Password Management, Permissions Configuration and Permission Templates. |

![The end of the Permissions step — Session Management and the sensitive Security Permissions section.](../../images/admin-user-step2-permissions-d.png)

*The end of the Permissions step — Session Management and the sensitive Security Permissions section.*

> **Note:** Admin User Security Management is marked (Sensitive) and highlighted in amber, since these permissions control other admin users' logins and security — grant them carefully. You can also use Load Permission Template at the top of this step to start from a predefined set of permissions for a common role instead of ticking everything by hand.
