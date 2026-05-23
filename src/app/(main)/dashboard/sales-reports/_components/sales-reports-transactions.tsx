"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Receipt,
  Download,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allOrders } from "../../orders/page";
import Link from "next/link";

type OrderRow = typeof allOrders[0];

const columns: ColumnDef<OrderRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.id}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "ORDER ID",
    cell: ({ row }) => <span className="font-medium text-sm">{row.original.id}</span>,
  },
  {
    accessorKey: "total",
    header: "TOTAL",
    cell: ({ row }) => <span className="font-medium">৳{row.original.total.toLocaleString()}</span>,
  },
  {
    accessorKey: "paid",
    header: "PAID",
    cell: ({ row }) => <span className="text-green-600 font-medium">৳{row.original.paid.toLocaleString()}</span>,
  },
  {
    accessorKey: "due",
    header: "DUE",
    cell: ({ row }) => (
      <span className={row.original.due > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
        ৳{row.original.due.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "STATUS",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      return (
        <Badge variant={status === "Full Paid" ? "default" : status === "Unpaid" ? "destructive" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "LAST PAYMENT",
    cell: ({ row }) => {
      const dateStr = format(parseISO(row.original.date), "dd MMM yyyy");
      return (
        <div className="grid gap-0.5">
          <span className="text-sm">{dateStr}</span>
          <span className="text-muted-foreground text-xs">{row.original.time}</span>
        </div>
      );
    },
  },
];

export function SalesReportsTransactions({ data }: { data: OrderRow[] }) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="leading-none">Sales Transactions</CardTitle>
        <CardDescription>Recent payment records</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4 pt-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={(table.getColumn("search")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("search")?.setFilterValue(event.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <ArrowUpDown className="mr-2 size-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={
                  table.getState().sorting[0]?.id === "total" ? 
                    (table.getState().sorting[0]?.desc ? "total-desc" : "total-asc") : 
                    "default"
                }
                onValueChange={(val) => {
                  if (val === "total-desc") table.setSorting([{ id: "total", desc: true }]);
                  else if (val === "total-asc") table.setSorting([{ id: "total", desc: false }]);
                  else table.setSorting([]);
                }}
              >
                <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="total-desc">Highest Amount</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="total-asc">Lowest Amount</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-muted/15">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan} className="h-11 font-medium text-xs">
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
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-10">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Receipt className="size-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No transactions</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
