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
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { allOrders } from "../../orders/page";

type OrderRow = (typeof allOrders)[0];

type ProductRow = {
  id: string;
  name: string;
  sold: number;
  ordersCount: number;
};

const columns: ColumnDef<ProductRow>[] = [
  {
    id: "search",
    accessorFn: (row) => row.name,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium text-xs text-muted-foreground">{row.original.id}</span>,
  },
  {
    accessorKey: "name",
    header: "PRODUCT",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 max-w-[150px] sm:max-w-[200px]">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
          <Package className="size-4 text-muted-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="truncate font-medium text-sm leading-none block" title={row.original.name}>
            {row.original.name}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "sold",
    header: "TOTAL SOLD",
    cell: ({ row }) => <div className="font-medium tabular-nums">{row.original.sold}</div>,
  },
  {
    accessorKey: "ordersCount",
    header: "TOTAL ORDER",
    cell: ({ row }) => <div className="font-medium tabular-nums text-muted-foreground">{row.original.ordersCount}</div>,
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

export function SalesReportsTopProducts({ data }: { data: OrderRow[] }) {
  // Aggregate sales by subCategory (treating subCategory as Product)
  const productSales = React.useMemo(() => {
    const acc: Record<string, ProductRow> = {};
    data.forEach((order) => {
      if (order.orderStatus === "Delivered" || order.orderStatus === "Shipped" || order.orderStatus === "Confirmed") {
        if (!acc[order.subCategory]) {
          const newId = String(Object.keys(acc).length + 1);
          acc[order.subCategory] = {
            id: newId,
            name: order.subCategory,
            sold: 0,
            ordersCount: 0,
          };
        }
        acc[order.subCategory].sold += order.items;
        acc[order.subCategory].ordersCount += 1;
      }
    });
    return Object.values(acc).sort((a, b) => b.sold - a.sold);
  }, [data]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: productSales,
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
    if (currentSort.id === "sold" && currentSort.desc) return "highest";
    if (currentSort.id === "sold" && !currentSort.desc) return "lowest";
    return "highest";
  }, [sorting]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Top Products</CardTitle>
        <CardDescription>Best performing items in this period</CardDescription>
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
              placeholder="Search products..."
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
                        ? [{ id: "sold", desc: false }]
                        : value === "highest"
                          ? [{ id: "sold", desc: true }]
                          : [];
                    table.setSorting(nextSorting);
                    table.setPageIndex(0);
                  }}
                >
                  <DropdownMenuRadioItem value="highest">Highest Sales</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lowest">Lowest Sales</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-md border bg-card">
          <Table>
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
                  <TableCell colSpan={4} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No products found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : "There are no products matching this period."}
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
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">Total {productSales.length} product(s).</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
