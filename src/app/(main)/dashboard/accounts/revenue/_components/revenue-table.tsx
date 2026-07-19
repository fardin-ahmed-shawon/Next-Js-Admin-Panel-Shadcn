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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/* ---- Demo Data ---- */

type RevenueItem = {
  id: string;
  transactionId: string;
  orderId: string;
  accountNo: string;
  customer: string;
  method: string;
  amount: number;
  date: string;
  paymentStatus: "Full Paid" | "Partially Paid" | "Refund";
};

type RevenueFilter = "All" | "Full Paid" | "Partially Paid" | "Refund";
const revenueFilters: RevenueFilter[] = ["All", "Full Paid", "Partially Paid", "Refund"];

/* ---- Columns ---- */

const columns: ColumnDef<RevenueItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all revenue"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select revenue ${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.orderId} ${row.transactionId} ${row.customer} ${row.accountNo}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "paymentStatus",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "method",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.transactionId}</span>,
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">{row.original.orderId}</span>,
  },
  {
    accessorKey: "accountNo",
    header: "Acc No",
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
    cell: ({ row }) => (
      <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-500">
        ৳{row.original.amount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.date ? new Date(row.original.date.replace("Z", "")).toLocaleDateString() : "N/A"}</span>,
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.paymentStatus;
      return (
        <Badge variant={s === "Full Paid" ? "default" : s === "Partially Paid" ? "secondary" : "destructive"}>
          {s}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">Actions</div>,
    cell: ({ row }) => <RowActions row={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];

/* ---- Row Actions ---- */

function RowActions({ row }: { row: RevenueItem }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => toast.info(`Viewing details for ${row.transactionId}`)}>
            <Eye className="mr-2 size-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => toast.success(`Revenue record ${row.transactionId} deleted.`)}
          >
            <Trash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ---- CSV Export ---- */

function exportToExcel(data: RevenueItem[]) {
  const headers = [
    "Transaction ID",
    "Order ID",
    "Account No",
    "Customer",
    "Method",
    "Amount",
    "Date",
    "Payment Status",
  ];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.transactionId,
        row.orderId,
        row.accountNo,
        `"${row.customer}"`,
        row.method,
        row.amount,
        row.date ? new Date(row.date.replace("Z", "")).toLocaleDateString() : "",
        row.paymentStatus,
      ].join(","),
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "revenue.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function RevenueTable({
  data,
  totalCount,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  filter,
  setFilter,
  loading,
}: {
  data: RevenueItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  filter: string;
  setFilter: (f: string) => void;
  loading: boolean;
}) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const pageCount = Math.ceil(totalCount / pageSize);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      columnVisibility: { search: false, paymentStatus: false, method: false },
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({ pageIndex, pageSize });
        setPageIndex(newPagination.pageIndex);
        setPageSize(newPagination.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const selectedCount = table.getSelectedRowModel().rows.length;

  const filterLabel = filter === "All" ? "All Revenue" : `${filter} Revenue`;
  const countDescription = selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} records`;

  return (
    <Card>
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
                placeholder="Search..."
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
                setFilter(value);
                setPageIndex(0);
                setRowSelection({});
              }}
              size="sm"
              spacing={1}
              type="single"
              value={filter}
            >
              {revenueFilters.map((f) => (
                <ToggleGroupItem key={f} value={f}>
                  {f}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() =>
                table
                  .getColumn("transactionId")
                  ?.toggleSorting(table.getColumn("transactionId")?.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown className="size-4" />
            </Button>
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

        {/* Bulk delete bar */}
        {selectedCount > 0 && (
          <div className="mx-4 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
            <span className="text-sm font-medium">{selectedCount} record(s) selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
                Clear
              </Button>
              <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash className="mr-2 size-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Delete {selectedCount} record(s)?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The selected revenue records will be permanently removed.
                  </DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        toast.success(`${selectedCount} record(s) deleted.`);
                        setRowSelection({});
                        setBulkDeleteOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      {loading ? (
                        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
                      ) : (
                        <>
                          <Archive className="size-6 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">No revenue records found</p>
                        </>
                      )}
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
              value={`${pageSize}`}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
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
