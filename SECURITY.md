# Security Policy

Phoenix Admin UI handles authentication, permissions, and administrative access across organizations, domains, and mailboxes, so we take security reports seriously and appreciate responsible disclosure.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.** Public issues are visible to everyone immediately, including anyone who might exploit the report before a fix ships.

Instead, report privately using **[GitHub's private vulnerability reporting](https://github.com/Yukthi-Systems/Phoenix-Admin-UI/security/advisories/new)** (Security tab → "Report a vulnerability" on this repo). This opens a confidential thread with maintainers only.

If the issue affects the backend API rather than this UI repo, report it there instead:

- [Phoenix-Admin-API](https://github.com/Yukthi-Systems/Phoenix-Admin-API/security/advisories/new)

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept code or a minimal repro is ideal)
- The affected version/commit

## What to expect

- We'll acknowledge your report as soon as we can.
- We'll investigate and keep you updated as we work on a fix.
- Once a fix is released, we'll coordinate disclosure with you and credit you (unless you'd prefer to stay anonymous).

## Scope

In scope: authentication/session handling, permission and role-based access control bypasses, access control issues between organizations/domains, data exposure between accounts, and anything else that compromises admin or end-user data.

Out of scope: issues requiring physical access to a user's device, social engineering, and vulnerabilities in third-party dependencies that should be reported upstream (though letting us know is still appreciated so we can track and update).

Questions about this policy that aren't a vulnerability report can go through [Discord](https://discord.gg/29zTxvque) or a regular issue instead.
