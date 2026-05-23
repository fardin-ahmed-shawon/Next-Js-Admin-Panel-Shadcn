"use client";

import * as React from "react";

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
import { Archive, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/* ---- Demo Data ---- */

type RevenueItem = {
  id: string;
  invoice: string;
  customer: string;
  method: string;
  amount: number;
  date: string;
  status: "Collected" | "Pending" | "Failed";
};

const mockData: RevenueItem[] = [
  {
    id: "TRX-001",
    invoice: "INV-2026-100",
    customer: "Nusrat Jahan",
    method: "bKash",
    amount: 15500,
    date: "10/24/2026",
    status: "Collected",
  },
  {
    id: "TRX-002",
    invoice: "INV-2026-101",
    customer: "Arham Khan",
    method: "Nagad",
    amount: 500,
    date: "10/23/2026",
    status: "Pending",
  },
  {
    id: "TRX-003",
    invoice: "INV-2026-102",
    customer: "Maliha Sultana",
    method: "Bank Transfer",
    amount: 100000,
    date: "10/22/2026",
    status: "Collected",
  },
  {
    id: "TRX-004",
    invoice: "INV-2026-103",
    customer: "Imran Haque",
    method: "Cash",
    amount: 2500,
    date: "10/21/2026",
    status: "Failed",
  },
];

/* ---- Columns ---- */

const columns: ColumnDef<RevenueItem>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.invoice} ${row.customer} ${row.id}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "status",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "method",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.id}</span>,
  },
  {
    accessorKey: "invoice",
    header: "Invoice",
    cell: ({ row }) => <span className="font-medium">{row.original.invoice}</span>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-500">৳{row.original.amount.toLocaleString()}</span>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.date}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <Badge variant={s === "Collected" ? "default" : s === "Pending" ? "secondary" : "destructive"}>
          {s}
        </Badge>
      );
    },
  },
];

/* ---- Main Table Component ---- */

export function RevenueTable() {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const table = useReactTable({
    data: mockData,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false, status: false, method: false },
      pagination,
    },
    getRowId: (row) => row.id,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalCount = table.getFilteredRowModel().rows.length;

  const handleFilter = () => {
    table.getColumn("search")?.setFilterValue(searchQuery || undefined);
    table.getColumn("status")?.setFilterValue(statusFilter === "all" ? undefined : statusFilter);
    table.getColumn("method")?.setFilterValue(methodFilter === "all" ? undefined : methodFilter);
    table.setPageIndex(0);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setMethodFilter("all");
    setDateFrom("");
    setDateTo("");
    table.resetColumnFilters();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">All Revenue</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center gap-3 px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 w-60 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Invoice / Customer / TRX ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Collected">Collected</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="bKash">bKash</SelectItem>
              <SelectItem value="Nagad">Nagad</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="h-8 w-[140px]"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Date From"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <Input
              type="date"
              className="h-8 w-[140px]"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Date To"
            />
          </div>

          <Button size="sm" onClick={handleFilter}>
            Filter
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <div className="overflow-hidden">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Archive className="size-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">No revenue records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Viewing {table.getRowModel().rows.length} of {totalCount} records
          </p>
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
      </CardContent>
    </Card>
  );
}
