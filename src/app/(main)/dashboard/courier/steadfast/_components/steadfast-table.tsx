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
import { Checkbox } from "@/components/ui/checkbox";
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

const ordersData = [
  {
    id: "ORD-5001",
    customer: { name: "John Doe", email: "john@example.com", phone: "+8801700000001" },
    amount: "৳150.00",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    date: "15 Mar 2024",
    time: "10:30 AM",
    orderStatus: "Processing",
    parcelStatus: "Not Added",
  },
  {
    id: "ORD-5002",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "+8801700000002" },
    amount: "৳85.50",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    date: "15 Mar 2024",
    time: "02:15 PM",
    orderStatus: "Shipped",
    parcelStatus: "Added",
  },
  {
    id: "ORD-5003",
    customer: { name: "Alice Johnson", email: "alice@example.com", phone: "+8801700000003" },
    amount: "৳210.00",
    paymentMethod: "Bkash",
    paymentStatus: "Paid",
    date: "14 Mar 2024",
    time: "11:45 AM",
    orderStatus: "Delivered",
    parcelStatus: "Returned",
  },
  {
    id: "ORD-5004",
    customer: { name: "Bob Brown", email: "bob@example.com", phone: "+8801700000004" },
    amount: "৳45.00",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    date: "14 Mar 2024",
    time: "04:20 PM",
    orderStatus: "Processing",
    parcelStatus: "Not Added",
  },
  {
    id: "ORD-5005",
    customer: { name: "Charlie Davis", email: "charlie@example.com", phone: "+8801700000005" },
    amount: "৳320.00",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Paid",
    date: "13 Mar 2024",
    time: "09:00 AM",
    orderStatus: "Shipped",
    parcelStatus: "Added",
  },
  {
    id: "ORD-5006",
    customer: { name: "Diana Evans", email: "diana@example.com", phone: "+8801700000006" },
    amount: "৳90.00",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    date: "12 Mar 2024",
    time: "01:30 PM",
    orderStatus: "Returned",
    parcelStatus: "Returned",
  },
];

type OrderRow = (typeof ordersData)[0];

const columns: ColumnDef<OrderRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all orders"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select order ${row.original.id}`}
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
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{row.original.date}</span>
        <span className="text-muted-foreground text-xs">{row.original.time}</span>
      </div>
    ),
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
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={row.parcelStatus !== "Not Added"}>
            <Truck className="mr-2 h-4 w-4" />
            Sent to Steadfast
          </DropdownMenuItem>
          <DropdownMenuItem disabled={row.orderStatus !== "Returned"}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Add to Return Parcel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SteadfastTable() {
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: ordersData,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      columnVisibility: { search: false },
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  const filterLabel = activeFilter === "All" ? "All Orders" : `${activeFilter} Orders`;
  const countDescription = selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} orders`;

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

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                setActiveFilter(value);
                table.getColumn("parcelStatus")?.setFilterValue(value === "All" ? undefined : value);
                table.setPageIndex(0);
                setRowSelection({});
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="outline">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuLabel className="text-xs">Bulk Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={
                    selectedCount === 0 ||
                    !table.getSelectedRowModel().rows.every((r) => r.original.parcelStatus === "Not Added")
                  }
                >
                  <Truck className="mr-2 h-3.5 w-3.5" />
                  Bulk Send to Steadfast
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={
                    selectedCount === 0 ||
                    !table.getSelectedRowModel().rows.every((r) => r.original.orderStatus === "Returned")
                  }
                >
                  <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                  Bulk Add to Return Parcel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
