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

import { ExternalLink } from "lucide-react";
import Callout from "./Callout";
import Figure from "./Figure";
import Video from "./Video";
import YouTube from "./YouTube";

const isExternal = (href = "") => /^https?:\/\//.test(href);

/**
 * Component map handed to <MDXProvider>. Custom components are available by
 * name in every `.mdx` file without an import; the lowercase keys override
 * the HTML elements that plain markdown produces.
 */
export const mdxComponents = {
  Callout,
  Figure,
  Video,
  YouTube,

  // Plain markdown `![alt](src)` -> same lazy/zoom behaviour as <Figure>.
  img: (props) => <Figure {...props} caption={props.title} />,

  a: ({ href = "", children, ...rest }) =>
    isExternal(href) ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-1 hover:underline"
        {...rest}
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </a>
    ) : (
      <a href={href} className="text-primary hover:underline" {...rest}>
        {children}
      </a>
    ),
};

export default mdxComponents;
