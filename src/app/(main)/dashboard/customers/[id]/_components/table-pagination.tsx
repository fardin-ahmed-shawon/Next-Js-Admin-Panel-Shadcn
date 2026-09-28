"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safePage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safePage < totalPages - 2) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-card text-xs text-muted-foreground",
        className
      )}
    >
      {/* Left: Summary Count */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto font-medium">
        <span>Showing</span>
        <span className="font-bold text-foreground">{startItem}</span>
        <span>to</span>
        <span className="font-bold text-foreground">{endItem}</span>
        <span>of</span>
        <span className="font-bold text-foreground">{totalItems}</span>
        <span>entries</span>
      </div>

      {/* Right: Controls & Page Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-7 w-[68px] text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onPageChange(1)}
            disabled={safePage <= 1}
            title="First Page"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            title="Previous Page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-muted-foreground select-none"
                  >
                    …
                  </span>
                );
              }
              const isCurrent = p === safePage;
              return (
                <Button
                  key={`page-${p}`}
                  variant={isCurrent ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "size-7 text-xs font-semibold",
                    isCurrent
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 pointer-events-none"
                      : "hover:bg-muted text-foreground"
                  )}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            title="Next Page"
          >
            <ChevronRight className="size-3.5" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onPageChange(totalPages)}
            disabled={safePage >= totalPages}
            title="Last Page"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
