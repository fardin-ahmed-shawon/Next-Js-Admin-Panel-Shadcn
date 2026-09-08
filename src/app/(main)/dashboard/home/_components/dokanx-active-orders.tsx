"use client";

import * as React from "react";

import Link from "next/link";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Package,
  Search,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

import { formatDashboardOrderDateTime } from "./order-date-time";

export type OrderRow = {
  phone: string;
  invoice: string;
  total: string;
  date: string;
  time: string;
  timestamp: number;
  status: string;
};

const columns: ColumnDef<OrderRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.phone} ${row.invoice}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "phone",
    header: "CUSTOMER",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
          <UserRound className="size-4 text-muted-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="grid min-w-0 gap-0.5">
            <span className="truncate font-medium text-sm leading-none">{row.original.phone}</span>
            <span className="truncate text-muted-foreground text-xs leading-none">{row.original.invoice}</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "date",
    accessorFn: (row) => row.timestamp,
    header: "DATE / TIME (BD)",
    cell: ({ row }) => (
      <div className="grid gap-0.5">
        <span className="text-sm">{row.original.date}</span>
        <span className="text-muted-foreground text-xs">{row.original.time ? "at " + row.original.time : "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "TOTAL",
    cell: ({ row }) => <div className="font-medium tabular-nums">{row.original.total}</div>,
  },
];

function exportToExcel(data: OrderRow[]) {
  const headers = ["Phone", "Invoice", "Total", "Date (BD)", "Time (BD)", "Status"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) => [row.phone, row.invoice, `"${row.total}"`, `"${row.date}"`, row.time, row.status].join(",")),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "active_orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function DokanxActiveOrders() {
  const { data, isLoading } = useAdminDashboard();

  const activeOrders = React.useMemo(() => {
    if (!data?.lists?.active) return [];
    return data.lists.active.map((order) => ({
      phone: order.customer_phone || "N/A",
      invoice: order.order_no,
      total: `৳${order.grand_total_amount?.toLocaleString() ?? 0}`,
      ...formatDashboardOrderDateTime(order.created_at),
      status: order.order_status,
    }));
  }, [data?.lists?.active]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: activeOrders,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false },
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const sortValue = React.useMemo(() => {
    const currentSort = sorting[0];
    if (!currentSort) return "newest";
    if (currentSort.id === "date" && currentSort.desc) return "newest";
    if (currentSort.id === "date" && !currentSort.desc) return "oldest";
    return "newest";
  }, [sorting]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Active Orders</CardTitle>
        <CardDescription>Currently active orders</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders/active">See All</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all-time">
              <SelectTrigger size="sm" className="min-w-28">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 size-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={sortValue}
                  onValueChange={(value) => {
                    const nextSorting: SortingState =
                      value === "oldest"
                        ? [{ id: "date", desc: false }]
                        : value === "newest"
                          ? [{ id: "date", desc: true }]
                          : [];
                    table.setSorting(nextSorting);
                    table.setPageIndex(0);
                  }}
                >
                  <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="bg-muted/15">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan} className="h-11 p-3 font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : "There are no active orders at the moment."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-1">
          <div className="hidden flex-1 text-muted-foreground text-sm sm:flex">
            Total {table.getFilteredRowModel().rows.length} order(s).
          </div>
          <div className="flex w-full items-center justify-between sm:w-fit sm:gap-8">
            <div className="flex w-fit items-center justify-center font-medium text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
