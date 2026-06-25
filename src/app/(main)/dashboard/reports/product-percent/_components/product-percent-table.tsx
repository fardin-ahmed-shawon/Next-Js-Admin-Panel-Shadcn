"use client";

import * as React from "react";
import { Archive, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductPercentItem, ProductStatusMetric } from "@/hooks/useProductPercentReports";

interface ProductPercentTableProps {
  data: ProductPercentItem[];
  isLoading: boolean;
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;

  // Filters & Sorting
  searchVal: string;
  setSearchVal: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortDir: string;
  setSortDir: (val: string) => void;

  onFilterSubmit: () => void;
  onReset: () => void;
}

const statusCols = [
  { key: "pending", label: "Pending", colorClass: "text-amber-600 dark:text-amber-500", barColor: "bg-amber-500" },
  { key: "confirmed", label: "Confirmed", colorClass: "text-blue-600 dark:text-blue-500", barColor: "bg-blue-500" },
  {
    key: "ready_to_ship",
    label: "Ready to Ship",
    colorClass: "text-sky-600 dark:text-sky-500",
    barColor: "bg-sky-400",
  },
  {
    key: "in_courier",
    label: "In Courier",
    colorClass: "text-indigo-600 dark:text-indigo-500",
    barColor: "bg-indigo-500",
  },
  { key: "ship_later", label: "Ship Later", colorClass: "text-teal-600 dark:text-teal-500", barColor: "bg-teal-500" },
  { key: "hold", label: "Hold", colorClass: "text-orange-600 dark:text-orange-500", barColor: "bg-orange-500" },
  { key: "returned", label: "Returned", colorClass: "text-purple-600 dark:text-purple-500", barColor: "bg-purple-500" },
  {
    key: "pre_order",
    label: "Pre Order",
    colorClass: "text-violet-600 dark:text-violet-500",
    barColor: "bg-violet-400",
  },
  {
    key: "delivered",
    label: "Delivered",
    colorClass: "text-emerald-600 dark:text-emerald-500",
    barColor: "bg-emerald-500",
  },
  { key: "cancelled", label: "Cancelled", colorClass: "text-red-600 dark:text-red-500", barColor: "bg-red-500" },
  { key: "missing", label: "Missing", colorClass: "text-pink-600 dark:text-pink-500", barColor: "bg-pink-500" },
  { key: "lost", label: "Lost", colorClass: "text-rose-600 dark:text-rose-500", barColor: "bg-rose-500" },
  { key: "fake", label: "Fake", colorClass: "text-stone-600 dark:text-stone-500", barColor: "bg-stone-500" },
  { key: "trash", label: "Trash", colorClass: "text-zinc-600 dark:text-zinc-500", barColor: "bg-zinc-600" },
] as const;

function StackedStatusBar({ row }: { row: ProductPercentItem }) {
  const validSegments = statusCols
    .map((col) => {
      const val = (row as any)[col.key] as ProductStatusMetric | undefined;
      return {
        label: col.label,
        count: val?.count || 0,
        percentage: val?.percentage || 0,
        color: col.barColor,
      };
    })
    .filter((s) => s.count > 0);

  return (
    <div className="flex flex-col gap-1.5 w-64">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {validSegments.map((seg, i) => (
          <div
            key={i}
            className={`${seg.color} h-full`}
            style={{ width: `${seg.percentage}%` }}
            title={`${seg.label}: ${seg.count} (${seg.percentage}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
        {validSegments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`size-1.5 rounded-full ${seg.color}`} />
            <span>
              {seg.label} ({seg.percentage}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProductPercentTable({
  data = [],
  isLoading,
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  searchVal,
  setSearchVal,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onFilterSubmit,
  onReset,
}: ProductPercentTableProps) {
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${baseUrl}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  const totalColsCount = 4 + statusCols.length; // Index, Product, Total Orders, Status Distribution + 14 status columns

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Product Status Distribution</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Table Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onFilterSubmit();
            }}
            className="flex flex-wrap items-center gap-3 w-full"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-60 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Product Name / SKU..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </div>

            <Button size="sm" type="submit" className="h-8">
              Filter
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={onReset} className="h-8">
              Reset
            </Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("orders")}>
                    Total Orders
                    <ArrowUpDown className="ml-2 size-4" />
                  </Button>
                </TableHead>
                <TableHead>Status Distribution</TableHead>
                {statusCols.map((col) => (
                  <TableHead key={col.key} className="text-center whitespace-nowrap">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: totalColsCount }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalColsCount} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Archive className="size-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">No records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => {
                  return (
                    <TableRow key={row.product_id}>
                      <TableCell className="font-medium text-muted-foreground">{from + index}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-10 overflow-hidden rounded-lg border bg-muted">
                            <img src={getImageUrl(row.img)} alt={row.product_name} className="size-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{row.product_name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{row.sku}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium tabular-nums text-center">{row.orders}</TableCell>
                      <TableCell>
                        <StackedStatusBar row={row} />
                      </TableCell>
                      {statusCols.map((col) => {
                        const val = (row as any)[col.key] as ProductStatusMetric | undefined;
                        return (
                          <TableCell
                            key={col.key}
                            className={`text-center tabular-nums ${col.colorClass} whitespace-nowrap`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{val?.count || 0}</span>
                              <span className="text-xs text-muted-foreground">{val?.percentage || 0}%</span>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 pb-1">
            <p className="text-muted-foreground text-sm">
              Viewing {from}–{to} of {total} records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(1)}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {lastPage}
              </span>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(lastPage)}
                disabled={currentPage >= lastPage}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
