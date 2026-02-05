"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

interface PaginationProps {
  hasMore: boolean;
  endCursor?: string | null;
  currentCursor?: string;
  totalShown: number;
}

/**
 * Pagination - URL-based pagination that preserves filters
 */
export function Pagination({
  hasMore,
  endCursor,
  currentCursor,
  totalShown,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build URL preserving current filters
  const buildUrl = (cursor?: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (cursor) {
      params.set("after", cursor);
    } else {
      params.delete("after");
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  return (
    <div className="mt-12 flex justify-center gap-2">
      <Link
        href={buildUrl()}
        className={`btn btn-outline ${
          !currentCursor ? "pointer-events-none opacity-50" : ""
        }`}
      >
        First Page
      </Link>
      <span className="flex items-center px-4 text-gray-600">
        Showing {totalShown} products
      </span>
      <Link
        href={hasMore && endCursor ? buildUrl(endCursor) : "#"}
        className={`btn btn-outline ${
          !hasMore ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Next
      </Link>
    </div>
  );
}
