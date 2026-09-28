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

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Sits at the end of one level of an org tree and loads that level's next
// page when scrolled into view. Each expanded level has its own trigger;
// a nested level's trigger only becomes visible once its rows are scrolled
// past, so levels never compete.
const LoadMoreTrigger = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  paddingLeft = 16,
}) => {
  const ref = useRef(null);

  // Re-created whenever a fetch settles: a fresh observer reports the
  // current intersection immediately, so a page that didn't fill the scroll
  // area keeps loading until it does (a long-lived observer would only fire
  // on a change).
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage && !isFetchingNextPage) return null;

  return (
    <div
      ref={ref}
      className="text-muted-foreground flex items-center gap-2 py-2 pr-4 text-xs"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      {isFetchingNextPage ? (
        <>
          <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
          Loading more...
        </>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fetchNextPage();
          }}
          className="hover:text-foreground hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
};

export default LoadMoreTrigger;
