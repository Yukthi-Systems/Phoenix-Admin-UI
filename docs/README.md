# Phoenix Admin Panel — Help Documentation

This folder holds the end-user help documentation for the Phoenix Admin
Panel, as separate Markdown files — one file per screen, and one file per
step of a multi-step wizard — so the app can look up and show the right
page of documentation automatically, based on where the user currently is.

## Layout

Files are organized to mirror the app's own routes (see
`src/routes/Router.jsx`):

```
docs/
  manifest.json       — maps a route (+ wizard step) to a doc file
  loadHelpDoc.js       — small helper that resolves a route to a doc file
  images/              — every screenshot referenced by the docs below
  dashboard.md          → /
  organization/
    list.md             → /organization, /organization/:org_id
    add/step-1.md ...    → /organization/add  (step 1-4)
  domain/
    list.md              → /domain, /domain/:domain_name
    add/step-1.md ...     → /domain/add/       (step 1-5)
    edit/step-1.md ...    → /domain/edit/:domain_name  (step 1-4)
  identities/
    list.md               → /identities, /identities/:email
    add/step-1.md ...      → /identities/add/:domain_name (step 1-4)
  ...and so on for department, mailbox, chat, files, policy/*, caution,
  disclaimer, logs, sessions, admin, status.
```

Every file was generated from the same content used to build the
"Phoenix Admin Panel — Dashboard" Word document, split up per screen and
per wizard step, so the wording is identical — just organized for lookup
by route instead of read front-to-back.

## How lookup works

`manifest.json` is a flat list of entries:

```json
{ "match": "/domain/edit/:domain_name", "step": 2, "file": "domain/edit/step-2.md" }
```

- `match` is a route pattern in the same shape as the app's own React
  Router paths — a segment starting with `:` matches any value in that
  position (e.g. a domain name or an ID).
- `step` is the wizard step number for multi-step forms, or `null` for a
  plain screen. This is meant to be read from wherever the app tracks the
  current step of a wizard (its component state, or a `?step=` query
  param if the app starts encoding it there, e.g. `/domain/add/?step=1`).
- `file` is the path to the Markdown file, relative to this `docs/`
  folder.

`loadHelpDoc.js` exports `findHelpDocFile(pathname, step, manifest)`,
which matches the current URL against every pattern in the manifest and
returns the right file — falling back to the screen's main doc if there's
no exact step match, and to step 1 of a wizard if no step was given at
all. See the comment at the top of that file for a usage example from a
React component (e.g. wiring it into the existing Help button in
`src/pages/help`).

## Coverage

Every route that has a matching help doc is listed in `manifest.json`.
A handful of routes in the app (the Maintenance Status CRUD screens, the
Chat/Files "dashboard" tabs) don't have a corresponding doc yet — they
weren't part of the source documentation this was generated from, so no
manifest entry points to them rather than guessing.

## Updating

When a screen's fields or flow change, edit the matching `.md` file
directly — they're plain Markdown, no build step required. If a brand
new screen or wizard step is added to the app, add its `.md` file in the
matching location and a corresponding entry (or entries, one per step)
to `manifest.json`.
