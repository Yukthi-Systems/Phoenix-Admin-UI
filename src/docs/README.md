<!--
Copyright (C) 2026 Yukthi Systems Private Limited
Licensed under the GNU General Public License version 3.
-->

# In-app documentation (`src/docs`)

User-facing help authored as **MDX**. It surfaces in two places:

- A **Guide** slide-over inside multi-step create forms, showing help for the
  current step (`<FormLayout docId="<feature>/<flow>" />`).
- The standalone **`/docs`** section (linked from the sidebar).

## File layout

```
src/docs/
  <feature>/
    <flow>/
      _meta.mdx            # flow overview (optional) — shown first in /docs
      01-<slug>.mdx        # step 1
      02-<slug>.mdx        # step 2
      ...
    assets/               # screenshots for this feature
```

`<feature>/<flow>` is the `docId` you pass to `FormLayout`, e.g. `domain/create`.

## Frontmatter (required)

```mdx
---
title: Domain details
feature: domain
flow: create
step: 1            # 1-based wizard step; omit for _meta
summary: One line shown in nav and on the /docs landing cards.
updated: 2026-09-03
---
```

The `step` number links the file to the wizard step. If omitted, the numeric
filename prefix (`01-`) is used as a fallback.

## Components available in every `.mdx` (no import needed)

| Component | Use |
| --- | --- |
| `<Callout type="info\|tip\|warning\|danger" title="...">` | Coloured note box |
| `<Figure src alt caption />` | Image — local path **or** remote URL; lazy + click-to-zoom |
| `<YouTube id="..." start={30} />` or `<YouTube url="https://youtu.be/..." />` | Click-to-load YouTube embed |
| `<Video src poster caption />` | Self/externally hosted mp4/webm |

Plain markdown works too: `![alt](url)` gets the same lazy/zoom treatment as
`<Figure>`, and external links open in a new tab automatically.

### Images

- **Local:** drop the file in `src/docs/<feature>/assets/` and reference it
  relatively: `<Figure src="../assets/foo.png" alt="..." />`. Vite hashes and
  optimises it at build time.
- **Remote / image links:** pass the full `https://…` URL as `src`.

## Wiring a new flow into a create form

```jsx
<FormLayout docId="mailbox/create" steps={STEPS} currentStep={currentStep} ... />
```

The **Guide** button appears automatically once at least one `.mdx` exists for
that `docId`. No route changes needed — `/docs/<feature>/<flow>` and the
sidebar entry are generated from the registry.

## Security

MDX compiles to executable code. Only commit **first-party** content here.
Never render user- or API-supplied strings through this pipeline.
