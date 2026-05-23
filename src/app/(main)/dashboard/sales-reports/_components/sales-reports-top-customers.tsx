"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Eye, Package } from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { allOrders } from "../../orders/page";

type OrderRow = typeof allOrders[0];

type CustomerRow = {
  name: string;
  phone: string;
  avatar: string;
  totalSpent: number;
  ordersCount: number;
  type: "Registered" | "Guest";
};

const columns: ColumnDef<CustomerRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.name} ${row.phone}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "name",
    header: "CUSTOMER",
    cell: ({ row }) => {
      const initials = row.original.name.split(" ").map(n => n[0]).join("").substring(0, 2);
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-8 rounded-full border shrink-0">
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium border-0">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 max-w-[120px] sm:max-w-[180px]">
            <div className="grid min-w-0 gap-0.5">
              <span className="truncate font-medium text-sm leading-none block" title={row.original.name}>{row.original.name}</span>
              <span className="truncate text-muted-foreground text-xs leading-none block">{row.original.phone}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "ordersCount",
    header: "ORDERS",
    cell: ({ row }) => (
      <div className="grid gap-0.5">
        <span className="text-sm">{row.original.ordersCount}</span>
      </div>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: "TOTAL SPENT",
    cell: ({ row }) => (
      <div className="font-medium tabular-nums text-green-600">
        ৳{row.original.totalSpent.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "Registered" ? "default" : "outline"} className="text-[10px]">
        {row.original.type}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">ACTIONS</div>,
    cell: () => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon-sm">
          <Eye className="size-4 text-muted-foreground" />
        </Button>
      </div>
    ),
  },
];

export function SalesReportsTopCustomers({ data }: { data: OrderRow[] }) {
  // Aggregate sales by customer
  const customerSales = React.useMemo(() => {
    const acc: Record<string, CustomerRow> = {};
    data.forEach(order => {
      if (order.paymentStatus === "Full Paid" || order.paymentStatus === "Partially Paid") {
        const id = order.phone;
        if (!acc[id]) {
          // Mock Type based on last digit of phone
          const lastDigit = parseInt(order.phone.slice(-1));
          const type = (isNaN(lastDigit) || lastDigit % 2 === 0) ? "Registered" : "Guest";

          acc[id] = { name: order.customer, phone: order.phone, avatar: order.avatar, totalSpent: 0, ordersCount: 0, type };
        }
        acc[id].totalSpent += order.paid;
        acc[id].ordersCount += 1;
      }
    });
    return Object.values(acc).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [data]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: customerSales,
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
    if (!currentSort) return "highest";
    if (currentSort.id === "totalSpent" && currentSort.desc) return "highest";
    if (currentSort.id === "totalSpent" && !currentSort.desc) return "lowest";
    return "highest";
  }, [sorting]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Top Customers</CardTitle>
        <CardDescription>Most valuable customers by revenue</CardDescription>
        <CardAction className="flex items-center gap-2">
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
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
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
                      value === "lowest"
                        ? [{ id: "totalSpent", desc: false }]
                        : value === "highest"
                          ? [{ id: "totalSpent", desc: true }]
                          : [];
                    table.setSorting(nextSorting);
                    table.setPageIndex(0);
                  }}
                >
                  <DropdownMenuRadioItem value="highest">Highest Spent</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lowest">Lowest Spent</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table className="whitespace-nowrap">
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
                  <TableCell colSpan={6} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No customers found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : "There are no customers matching this period."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Total {customerSales.length} customer(s).
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="size-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="size-4" /></Button>
              <Button size="icon" variant="outline" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-4" /></Button>
              <Button size="icon" variant="outline" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-4" /></Button>
              <Button size="icon" variant="outline" className="size-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="size-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
