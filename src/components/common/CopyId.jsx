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

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "lucide-react";

export default function CopyButton({ text, title = "Copy", size = 14 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground text-sm">{text}</span>
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-accent transition-colors"
        title={title}
      >
        {copied ? (
          <CheckIcon size={size} className="text-green-500" />
        ) : (
          <ClipboardIcon size={size} />
        )}
      </button>
    </div>
  );
}
