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
  HandCoins,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import useDueCollection from "@/hooks/useDueCollection";
import { UpdatePaymentModal } from "../../../orders/_components/update-payment-modal";

/* ---- Types ---- */

export type DueItem = {
  order_id: string;
  date: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  paid_amount: string | number;
  due_amount: string | number;
  status?: string;
};

type DueFilter = "All" | "Unpaid" | "Partially Paid";
const filters: DueFilter[] = ["All", "Unpaid", "Partially Paid"];

/* ---- Columns ---- */

const columns: ColumnDef<DueItem>[] = [
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
    accessorFn: (row) => `${row.order_id} ${row.customer_name} ${row.customer_phone}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "status",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "order_id",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.order_id}</span>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.date}</span>,
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.customer_name}</span>
        <span className="text-xs text-muted-foreground">{row.original.customer_phone}</span>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => <span className="tabular-nums">৳{Number(row.original.total_amount || 0).toLocaleString()}</span>,
  },
  {
    accessorKey: "paid_amount",
    header: "Paid Amount",
    cell: ({ row }) => (
      <span className="tabular-nums text-emerald-600 dark:text-emerald-500">
        ৳{Number(row.original.paid_amount || 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "due_amount",
    header: "Due Amount",
    cell: ({ row }) => (
      <span className="tabular-nums font-bold text-amber-600 dark:text-amber-500">
        ৳{Number(row.original.due_amount || 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return <Badge variant={s === "Unpaid" ? "destructive" : "secondary"}>{s}</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const orderData = {
        id: row.original.order_id,
        total: Number(row.original.total_amount) || 0,
        paid: Number(row.original.paid_amount) || 0,
        due: Number(row.original.due_amount) || 0,
        paymentStatus: row.original.status || "Unpaid",
      };

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <UpdatePaymentModal order={orderData}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <HandCoins className="mr-2 size-4" />
                  Add Payment
                </DropdownMenuItem>
              </UpdatePaymentModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

/* ---- CSV Export ---- */

function exportToExcel(data: DueItem[]) {
  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Customer Phone",
    "Total Amount",
    "Paid Amount",
    "Due Amount",
    "Status",
  ];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.order_id,
        row.date,
        `"${row.customer_name}"`,
        row.customer_phone,
        row.total_amount,
        row.paid_amount,
        row.due_amount,
        row.status,
      ].join(","),
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "due_report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function DueTable({ source }: { source?: string }) {
  const { dues, isLoading } = useDueCollection({ source });

  const formattedData = React.useMemo(() => {
    return dues.map((item: any) => ({
      ...item,
      status: Number(item.paid_amount) > 0 ? "Partially Paid" : "Unpaid",
    }));
  }, [dues]);

  const [activeFilter, setActiveFilter] = React.useState<DueFilter>("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: formattedData || [],
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false, status: false },
      pagination,
    },
    getRowId: (row) => row.order_id,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    },
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const totalCount = table.getFilteredRowModel().rows.length;

  const filterLabel = activeFilter === "All" ? "All Due Orders" : `${activeFilter} Orders`;
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
                className="h-8 w-64 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search order ID or customer..."
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
                const filter = value as DueFilter;
                setActiveFilter(filter);
                table.getColumn("status")?.setFilterValue(filter === "All" ? undefined : filter);
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
                      <p className="text-sm font-medium text-muted-foreground">No due records found</p>
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
