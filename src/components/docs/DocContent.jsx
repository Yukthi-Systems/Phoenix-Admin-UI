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

import { MDXProvider } from "@mdx-js/react";
import mdxComponents from "./mdxComponents";

/**
 * Renders a compiled MDX component (`Content`) inside the shared provider and
 * `prose` typography wrapper. All in-app documentation is authored as
 * first-party `.mdx` files under `src/docs`; never pass user-supplied MDX
 * here - it compiles to executable code.
 */
const DocContent = ({ Content, className = "" }) => {
  if (!Content) return null;

  return (
    <MDXProvider components={mdxComponents}>
      <div
        className={`prose prose-sm dark:prose-invert prose-headings:scroll-mt-20 prose-a:font-normal prose-img:rounded-md max-w-none ${className}`}
      >
        <Content />
      </div>
    </MDXProvider>
  );
};

export default DocContent;
