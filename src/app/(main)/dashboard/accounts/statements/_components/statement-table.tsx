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
  ArrowDownRight,
  ArrowUpRight,
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

type StatementItem = {
  id: string;
  date: string;
  time: string;
  transactionId: string;
  type: "Revenue" | "Expense" | "COGS";
  details: string;
  amountIn: number;
  amountOut: number;
  balance: number;
};

// Start Balance: 2,450,000
const mockData: StatementItem[] = [
  { id: "ST-01", date: "05/18/2026", time: "09:00 AM", transactionId: "TRX-101", type: "Revenue", details: "Order Payment - Nusrat Jahan", amountIn: 4100, amountOut: 0, balance: 2454100 },
  { id: "ST-02", date: "05/18/2026", time: "10:15 AM", transactionId: "TRX-102", type: "Revenue", details: "Order Payment - Maliha Sultana", amountIn: 1450, amountOut: 0, balance: 2455550 },
  { id: "ST-03", date: "05/18/2026", time: "11:30 AM", transactionId: "EXP-501", type: "Expense", details: "Office Supplies - Stationery", amountIn: 0, amountOut: 1200, balance: 2454350 },
  { id: "ST-04", date: "05/18/2026", time: "01:00 PM", transactionId: "CGS-901", type: "COGS", details: "Supplier Payment - Electronics", amountIn: 0, amountOut: 15000, balance: 2439350 },
  { id: "ST-05", date: "05/19/2026", time: "10:25 AM", transactionId: "TRX-103", type: "Revenue", details: "Order Payment - Arham Khan", amountIn: 2300, amountOut: 0, balance: 2441650 },
  { id: "ST-06", date: "05/19/2026", time: "02:20 PM", transactionId: "EXP-502", type: "Expense", details: "Utility Bill - Internet", amountIn: 0, amountOut: 3500, balance: 2438150 },
  { id: "ST-07", date: "05/20/2026", time: "09:15 AM", transactionId: "TRX-104", type: "Revenue", details: "Order Payment - Karim Uddin", amountIn: 3200, amountOut: 0, balance: 2441350 },
  { id: "ST-08", date: "05/20/2026", time: "11:00 AM", transactionId: "TRX-105", type: "Revenue", details: "Order Payment - Samira Ahmed", amountIn: 8500, amountOut: 0, balance: 2449850 },
  { id: "ST-09", date: "05/21/2026", time: "10:00 AM", transactionId: "CGS-902", type: "COGS", details: "Supplier Payment - Clothing", amountIn: 0, amountOut: 25000, balance: 2424850 },
  { id: "ST-10", date: "05/21/2026", time: "03:45 PM", transactionId: "EXP-503", type: "Expense", details: "Marketing - Facebook Ads", amountIn: 0, amountOut: 10000, balance: 2414850 },
  { id: "ST-11", date: "05/22/2026", time: "11:10 AM", transactionId: "TRX-106", type: "Revenue", details: "Order Payment - Arham Khan", amountIn: 450, amountOut: 0, balance: 2415300 },
  { id: "ST-12", date: "05/23/2026", time: "10:05 AM", transactionId: "TRX-107", type: "Revenue", details: "Order Payment - Rafiq Islam", amountIn: 5400, amountOut: 0, balance: 2420700 },
].reverse(); // Reverse so newest is at the top like a typical ledger

type StatementFilter = "All" | "Revenue" | "Expense" | "COGS";
const filters: StatementFilter[] = ["All", "Revenue", "Expense", "COGS"];

/* ---- Columns ---- */

const columns: ColumnDef<StatementItem>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.transactionId} ${row.details}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "type",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.date}</span>
        <span className="text-xs text-muted-foreground">{row.original.time}</span>
      </div>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.transactionId}</span>,
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => <span className="font-medium max-w-[200px] truncate block" title={row.original.details}>{row.original.details}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={type === "Revenue" ? "default" : type === "COGS" ? "outline" : "secondary"} className={type === "COGS" ? "border-amber-500/50 text-amber-600 dark:text-amber-500" : ""}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amountIn",
    header: () => <div className="text-right flex items-center justify-end"><ArrowDownRight className="mr-1 size-3 text-emerald-500"/> In (Credit)</div>,
    cell: ({ row }) => {
      const val = row.original.amountIn;
      return (
        <div className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-500">
          {val > 0 ? `৳${val.toLocaleString()}` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "amountOut",
    header: () => <div className="text-right flex items-center justify-end"><ArrowUpRight className="mr-1 size-3 text-destructive"/> Out (Debit)</div>,
    cell: ({ row }) => {
      const val = row.original.amountOut;
      return (
        <div className="text-right tabular-nums font-medium text-destructive">
          {val > 0 ? `৳${val.toLocaleString()}` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right font-bold">Balance</div>,
    cell: ({ row }) => <div className="text-right tabular-nums font-bold">৳{row.original.balance.toLocaleString()}</div>,
  },
];

/* ---- CSV Export ---- */

function exportToExcel(data: StatementItem[]) {
  const headers = ["Date", "Time", "Transaction ID", "Type", "Details", "Amount In", "Amount Out", "Balance"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.date,
        row.time,
        row.transactionId,
        row.type,
        `"${row.details}"`,
        row.amountIn,
        row.amountOut,
        row.balance,
      ].join(","),
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "account_statement.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function StatementTable() {
  const [activeFilter, setActiveFilter] = React.useState<StatementFilter>("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: mockData,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false, type: false },
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

  const filterLabel = activeFilter === "All" ? "All Transactions" : `${activeFilter} Transactions`;
  const countDescription = `${totalCount} records`;

  return (
    <Card className="col-span-1">
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
            Export CSV
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-64 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search description or TRX ID..."
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
                const filter = value as StatementFilter;
                setActiveFilter(filter);
                table.getColumn("type")?.setFilterValue(filter === "All" ? undefined : filter);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeFilter}
            >
              {filters.map((filter) => (
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
