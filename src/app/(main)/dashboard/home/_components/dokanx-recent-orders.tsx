"use client";

import * as React from "react";
import { Download, UserRound, LoaderIcon, CircleCheckIcon, Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const recentOrders = [
  { phone: "017000000001", invoice: "INV-1714614784", total: "৳0", date: "May 13, 2024", status: "Pending" },
  { phone: "017000000002", invoice: "INV-1714614785", total: "৳1,000", date: "May 14, 2024", status: "Active" },
  { phone: "017000000003", invoice: "INV-1714614786", total: "৳1,000", date: "May 15, 2024", status: "Pending" },
  { phone: "017000000004", invoice: "INV-1714614787", total: "৳0", date: "May 16, 2024", status: "Active" },
  { phone: "017000000005", invoice: "INV-1714614788", total: "৳500", date: "May 17, 2024", status: "Pending" },
  { phone: "017000000006", invoice: "INV-1714614789", total: "৳2,500", date: "May 18, 2024", status: "Active" },
  { phone: "017000000007", invoice: "INV-1714614790", total: "৳3,000", date: "May 19, 2024", status: "Pending" },
  { phone: "017000000008", invoice: "INV-1714614791", total: "৳1,200", date: "May 20, 2024", status: "Active" },
  { phone: "017000000009", invoice: "INV-1714614792", total: "৳800", date: "May 21, 2024", status: "Pending" },
  { phone: "017000000010", invoice: "INV-1714614793", total: "৳4,500", date: "May 22, 2024", status: "Active" },
  { phone: "017000000011", invoice: "INV-1714614794", total: "৳600", date: "May 23, 2024", status: "Pending" },
  { phone: "017000000012", invoice: "INV-1714614795", total: "৳9,000", date: "May 24, 2024", status: "Active" },
];

type OrderRow = typeof recentOrders[0];

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
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Pending" ? (
          <LoaderIcon className="mr-1 size-3 inline-block" />
        ) : (
          <CircleCheckIcon className="mr-1 size-3 inline-block fill-green-500 stroke-primary-foreground dark:fill-green-600" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">TOTAL</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {row.original.total}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">DATE</div>,
    cell: ({ row }) => (
      <div className="grid gap-0.5 text-right">
        <span className="text-sm">{row.original.date}</span>
        <span className="text-muted-foreground text-xs">at 10:24 AM</span>
      </div>
    ),
  },
];

export function DokanxRecentOrders({ title, description, filterStatus }: { title: string, description: string, filterStatus: string }) {
  const filteredData = React.useMemo(() => recentOrders.filter(o => o.status === filterStatus), [filterStatus]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: filteredData,
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
        <CardTitle className="leading-none">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
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
              {table.getRowModel().rows.length ? (
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
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results.
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
