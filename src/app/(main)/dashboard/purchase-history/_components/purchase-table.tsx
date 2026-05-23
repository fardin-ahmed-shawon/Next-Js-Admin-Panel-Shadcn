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
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Search, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type CustomerPurchaseEntry = {
  id: string;
  customerName: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
  status: "Active" | "Inactive" | "Blocked";
  customerType: "Guest" | "Registered";
};

export function PurchaseTable({ data }: { data: CustomerPurchaseEntry[] }) {
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All Status");
  const [activeTypeFilter, setActiveTypeFilter] = React.useState<string>("All Types");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<CustomerPurchaseEntry>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const name = row.getValue("customerName") as string;
        const phone = row.original.phone;
        const avatar = row.original.avatar;
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "customerType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("customerType") as string;
        return (
          <Badge
            variant={type === "Registered" ? "secondary" : "outline"}
            className={type === "Registered" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" : ""}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalOrders",
      header: "Total Orders",
      cell: ({ row }) => <span className="font-medium">{row.getValue("totalOrders")}</span>,
    },
    {
      accessorKey: "totalSpent",
      header: "Lifetime Value",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalSpent"));
        return <span className="font-semibold text-primary">৳{amount.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "lastPurchaseDate",
      header: "Last Purchase",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.getValue("lastPurchaseDate")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "Active" ? "default" : status === "Inactive" ? "secondary" : "destructive"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/dashboard/customers/${row.original.id}`}>
                <Eye className="size-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Customer Purchase Records</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount > 0 ? `${totalCount} customers` : "No customers"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Top Filters Block */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-full sm:w-64 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search customer name..."
                value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => {
                  table.getColumn("customerName")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground hidden lg:flex **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm"
              onValueChange={(value) => {
                if (!value) return;
                setActiveStatusFilter(value);
                table.getColumn("status")?.setFilterValue(value === "All Status" ? undefined : value);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeStatusFilter}
            >
              {["All Status", "Active", "Inactive", "Blocked"].map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground hidden md:flex **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm"
              onValueChange={(value) => {
                if (!value) return;
                setActiveTypeFilter(value);
                table.getColumn("customerType")?.setFilterValue(value === "All Types" ? undefined : value);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeTypeFilter}
            >
              {["All Types", "Registered", "Guest"].map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() =>
                table.getColumn("totalSpent")?.toggleSorting(table.getColumn("totalSpent")?.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown className="size-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border-y">
          <Table>
            <TableHeader>
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Users className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No customers found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters or search.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 pb-1">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {table.getFilteredRowModel().rows.length} record(s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="hidden text-sm font-medium sm:block">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
