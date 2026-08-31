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
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
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
import useAccountStatements from "@/hooks/useAccountStatements";
import { StatementContext } from "../page";

/* ---- Types ---- */

export type StatementItem = {
  date: string;
  trx_id: string | null;
  type: "Revenue" | "Expense" | "Supplier Payment" | "Cash In" | "Cash Out" | string;
  details: string;
  credit: number;
  debit: number;
  balance: number;
};

type StatementFilter = "All" | "Revenue" | "Cash In" | "Cash Out" | "Expense" | "Supplier Payment";
const filters: StatementFilter[] = ["All", "Revenue", "Cash In", "Cash Out", "Expense", "Supplier Payment"];

/* ---- Columns ---- */

const columns: ColumnDef<StatementItem>[] = [
  {
    id: "sl_no",
    header: "SL No",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const pageIndex = meta?.pageIndex || 0;
      const pageSize = meta?.pageSize || 10;
      return <span className="text-muted-foreground">{pageIndex * pageSize + row.index + 1}</span>;
    },
    enableHiding: false,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.trx_id || ""} ${row.details}`,
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
    cell: ({ row }) => {
      const dt = row.original.date;
      const [datePart, timePart] = dt ? dt.split(" ") : ["", ""];
      return (
        <div className="flex flex-col">
          <span className="font-medium">{datePart}</span>
          <span className="text-xs text-muted-foreground">{timePart}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "trx_id",
    header: "Transaction ID",
    cell: ({ row }) => <span className="text-muted-foreground font-mono text-xs">{row.original.trx_id || "-"}</span>,
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="font-medium max-w-[220px] truncate block" title={row.original.details}>
        {row.original.details}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      if (type === "Revenue") {
        return (
          <Badge
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-600 text-white font-medium"
          >
            Revenue
          </Badge>
        );
      }
      if (type === "Cash In") {
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold"
          >
            Cash In
          </Badge>
        );
      }
      if (type === "Cash Out") {
        return (
          <Badge
            variant="outline"
            className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold"
          >
            Cash Out
          </Badge>
        );
      }
      if (type === "Supplier Payment") {
        return (
          <Badge
            variant="outline"
            className="border-blue-500/40 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-semibold"
          >
            Supplier Payment
          </Badge>
        );
      }
      if (type === "Expense") {
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-semibold"
          >
            Expense
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="font-medium">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "credit",
    header: () => (
      <div className="text-right flex items-center justify-end">
        <ArrowDownRight className="mr-1 size-3 text-emerald-500" /> In (Credit)
      </div>
    ),
    cell: ({ row }) => {
      const val = Number(row.original.credit || 0);
      return (
        <div className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-500">
          {val > 0 ? `৳${val.toLocaleString()}` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "debit",
    header: () => (
      <div className="text-right flex items-center justify-end">
        <ArrowUpRight className="mr-1 size-3 text-destructive" /> Out (Debit)
      </div>
    ),
    cell: ({ row }) => {
      const val = Number(row.original.debit || 0);
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
    cell: ({ row }) => (
      <div className="text-right tabular-nums font-bold">৳{Number(row.original.balance || 0).toLocaleString()}</div>
    ),
  },
];

/* ---- CSV Export ---- */

function exportToExcel(data: StatementItem[]) {
  const headers = ["Date", "Transaction ID", "Type", "Details", "Amount In (Credit)", "Amount Out (Debit)", "Balance"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [row.date, row.trx_id || "", row.type, `"${row.details}"`, row.credit, row.debit, row.balance].join(","),
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
  const { params, searchQuery, setSearchQuery, activeFilter, setActiveFilter, page, setPage, perPage, setPerPage } = React.useContext(StatementContext);
  const { statements, pagination, isLoading } = useAccountStatements(params);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: statements || [],
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false, type: false },
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
    },
    pageCount: (pagination as any)?.last_page || -1,
    manualPagination: true,
    getRowId: (row, i) => `${row.trx_id}-${i}`,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex: page - 1, pageSize: perPage });
        setPage(next.pageIndex + 1);
        setPerPage(next.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPerPage(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      pageIndex: page - 1,
      pageSize: perPage,
    },
  });

  const totalCount = (pagination as any)?.total || 0;

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
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                setActiveFilter(value);
                setPage(1);
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
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
              value={`${perPage}`}
              onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}
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
