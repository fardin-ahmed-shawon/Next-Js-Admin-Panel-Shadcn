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
import {
  ArrowUpDown,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/* ---- Demo Data ---- */

type ProfitLossItem = {
  id: string;
  month: string;
  year: string;
  revenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
  margin: number;
  status: "Profit" | "Loss";
};

const mockData: ProfitLossItem[] = [
  { id: "PL-01", month: "January", year: "2026", revenue: 1800000, cogs: 450000, expenses: 650000, netProfit: 700000, margin: 38.8, status: "Profit" },
  { id: "PL-02", month: "February", year: "2026", revenue: 1900000, cogs: 475000, expenses: 725000, netProfit: 700000, margin: 36.8, status: "Profit" },
  { id: "PL-03", month: "March", year: "2026", revenue: 2100000, cogs: 525000, expenses: 775000, netProfit: 800000, margin: 38.0, status: "Profit" },
  { id: "PL-04", month: "April", year: "2026", revenue: 1950000, cogs: 487500, expenses: 762500, netProfit: 700000, margin: 35.8, status: "Profit" },
  { id: "PL-05", month: "May", year: "2026", revenue: 2200000, cogs: 550000, expenses: 850000, netProfit: 800000, margin: 36.3, status: "Profit" },
  { id: "PL-06", month: "June", year: "2026", revenue: 2050000, cogs: 512500, expenses: 1837500, netProfit: -300000, margin: -14.6, status: "Loss" },
  { id: "PL-07", month: "July", year: "2026", revenue: 2400000, cogs: 600000, expenses: 900000, netProfit: 900000, margin: 37.5, status: "Profit" },
  { id: "PL-08", month: "August", year: "2026", revenue: 2500000, cogs: 625000, expenses: 825000, netProfit: 1050000, margin: 42.0, status: "Profit" },
  { id: "PL-09", month: "September", year: "2026", revenue: 2300000, cogs: 575000, expenses: 725000, netProfit: 1000000, margin: 43.4, status: "Profit" },
  { id: "PL-10", month: "October", year: "2026", revenue: 2600000, cogs: 650000, expenses: 900000, netProfit: 1050000, margin: 40.3, status: "Profit" },
  { id: "PL-11", month: "November", year: "2026", revenue: 2750000, cogs: 687500, expenses: 912500, netProfit: 1150000, margin: 41.8, status: "Profit" },
  { id: "PL-12", month: "December", year: "2026", revenue: 2900000, cogs: 725000, expenses: 975000, netProfit: 1200000, margin: 41.3, status: "Profit" },
];

type PLFilter = "All" | "Profit" | "Loss";
const plFilters: PLFilter[] = ["All", "Profit", "Loss"];

/* ---- Columns ---- */

const columns: ColumnDef<ProfitLossItem>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.month} ${row.year}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "status",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => <span className="font-medium">{row.original.month} {row.original.year}</span>,
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-500">৳{row.original.revenue.toLocaleString()}</span>,
  },
  {
    accessorKey: "cogs",
    header: "COGS",
    cell: ({ row }) => <span className="tabular-nums font-medium text-amber-600 dark:text-amber-500">৳{row.original.cogs.toLocaleString()}</span>,
  },
  {
    accessorKey: "expenses",
    header: "Expenses",
    cell: ({ row }) => <span className="tabular-nums font-medium text-destructive">৳{row.original.expenses.toLocaleString()}</span>,
  },
  {
    accessorKey: "netProfit",
    header: "Net Profit / Loss",
    cell: ({ row }) => {
      const val = row.original.netProfit;
      const isLoss = val < 0;
      return (
        <span className={`tabular-nums font-bold ${isLoss ? "text-destructive" : "text-emerald-600 dark:text-emerald-500"}`}>
          {isLoss ? "-" : ""}৳{Math.abs(val).toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "margin",
    header: "Margin (%)",
    cell: ({ row }) => {
      const val = row.original.margin;
      return (
        <span className={`tabular-nums font-medium ${val < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-500"}`}>
          {val}%
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <Badge variant={s === "Profit" ? "default" : "destructive"}>
          {s}
        </Badge>
      );
    },
  },
];

/* ---- CSV Export ---- */

function exportToExcel(data: ProfitLossItem[]) {
  const headers = ["Month", "Year", "Revenue", "COGS", "Expenses", "Net Profit", "Margin", "Status"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.month,
        row.year,
        row.revenue,
        row.cogs,
        row.expenses,
        row.netProfit,
        `"${row.margin}%"`,
        row.status,
      ].join(","),
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "profit_loss.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function ProfitLossTable() {
  const [activeFilter, setActiveFilter] = React.useState<PLFilter>("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: mockData,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false, status: false },
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

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const totalCount = table.getFilteredRowModel().rows.length;

  const filterLabel = activeFilter === "All" ? "All Months" : `${activeFilter} Months`;
  const countDescription = `${totalCount} records`;

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">{filterLabel}</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {countDescription}
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search month..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                const filter = value as PLFilter;
                setActiveFilter(filter);
                table.getColumn("status")?.setFilterValue(filter === "All" ? undefined : filter);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeFilter}
            >
              {plFilters.map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      className="capitalize"
                      onClick={() => col.toggleVisibility(!col.getIsVisible())}
                    >
                      <Checkbox checked={col.getIsVisible()} className="mr-2" />
                      {col.id}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="bg-muted/50 border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3">
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
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Archive className="size-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">No records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(v) => setPagination((p) => ({ ...p, pageSize: Number(v), pageIndex: 0 }))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground mr-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </p>
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
