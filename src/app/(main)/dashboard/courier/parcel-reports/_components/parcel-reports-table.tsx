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
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  MoreHorizontal,
  Package,
  PackagePlus,
  RefreshCcw,
  Search,
  Truck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type OrderRow = {
  id: string;
  customer: { name: string; email: string; phone: string };
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  date: string;
  time: string;
  orderStatus: string;
  parcelStatus: string;
  courier: string;
};

const columns: ColumnDef<OrderRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.id} ${row.customer.name} ${row.customer.email} ${row.customer.phone}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      const initials = customer.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-full bg-slate-900 border-0">
            <AvatarFallback className="bg-slate-900 text-white text-xs font-medium border-0">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm leading-none">{customer.name}</span>
            <span className="text-muted-foreground text-xs">{customer.phone}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Total Amount",
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      return <Badge variant={status === "Paid" ? "default" : "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => {
      // Format from ISO (e.g. 2024-03-15) to localized date like "15 Mar 2024"
      const dateStr = format(new Date(row.original.date), "dd MMM yyyy");
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{dateStr}</span>
          <span className="text-muted-foreground text-xs">{row.original.time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.original.orderStatus;
      return (
        <Badge
          variant="outline"
          className={
            status === "Delivered"
              ? "border-green-500 text-green-600"
              : status === "Cancelled"
                ? "border-red-500 text-red-600"
                : status === "Returned"
                  ? "border-orange-500 text-orange-600"
                  : status === "Shipped"
                    ? "border-blue-500 text-blue-600"
                    : "border-yellow-500 text-yellow-600"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "courier",
    header: "Courier",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const courier = row.original.courier;
      return (
        <div className="flex items-center gap-1.5">
          <Truck className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-sm">{courier}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "parcelStatus",
    header: "Parcel Status",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const status = row.original.parcelStatus;
      return (
        <Badge variant={status === "Added" ? "default" : status === "Returned" ? "destructive" : "secondary"}>
          {status}
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

function RowActions({ row }: { row: OrderRow }) {
  return (
    <div className="flex w-full justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ParcelReportsTable({ data }: { data: OrderRow[] }) {
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false },
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

  const filterLabel = activeFilter === "All" ? "All Orders" : `${activeFilter} Orders`;
  const countDescription = `${totalCount} orders`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">{filterLabel}</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {countDescription}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
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
                placeholder="Search invoice or customer..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <Select
              value={(table.getColumn("courier")?.getFilterValue() as string) ?? "All"}
              onValueChange={(value) => {
                table.getColumn("courier")?.setFilterValue(value === "All" ? undefined : value);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[140px] rounded-md">
                <SelectValue placeholder="All Couriers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Couriers</SelectItem>
                <SelectItem value="Steadfast">Steadfast</SelectItem>
                <SelectItem value="Pathao">Pathao</SelectItem>
              </SelectContent>
            </Select>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                setActiveFilter(value);
                table.getColumn("parcelStatus")?.setFilterValue(value === "All" ? undefined : value);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeFilter}
            >
              {["All", "Not Added", "Added", "Returned"].map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter === "All" ? "All Orders" : `${filter} Orders`}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.getColumn("id")?.toggleSorting(table.getColumn("id")?.getIsSorted() === "asc")}
            >
              <ArrowUpDown className="size-4" />
            </Button>
          </div>
        </div>

        {/* Data Table */}
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : "There are no orders matching this filter."}
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
        <div className="flex items-center justify-between px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Viewing {table.getRowModel().rows.length} of {totalCount} orders
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
