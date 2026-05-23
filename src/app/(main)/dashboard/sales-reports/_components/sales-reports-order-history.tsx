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
  Package,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductsModal } from "../../orders/_components/products-modal";
import { Badge } from "@/components/ui/badge";
import { allOrders } from "../../orders/page";

type OrderRow = typeof allOrders[0];

function ProductsCell({ row }: { row: any }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  return (
    <>
      <div 
        className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity w-fit" 
        onClick={() => setModalOpen(true)}
        title="View all products"
      >
        {row.original.productImages.slice(0, 3).map((img: string, i: number) => (
          <div key={i} className="size-8 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted">
            <img src={img} alt="" className="size-full object-cover" />
          </div>
        ))}
        {row.original.productImages.length > 3 && (
          <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
            +{row.original.productImages.length - 3}
          </div>
        )}
      </div>
      <ProductsModal
        order={row.original}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

const columns: ColumnDef<OrderRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.id} ${row.customer}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "ORDER ID",
    cell: ({ row }) => <span className="font-medium text-sm">{row.original.id}</span>,
  },
  {
    accessorKey: "products",
    header: "PRODUCTS",
    cell: ({ row }) => <ProductsCell row={row} />,
  },
  {
    accessorKey: "orderStatus",
    header: "STATUS",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const status = row.original.orderStatus;
      return (
        <Badge variant={status === "Delivered" ? "default" : status === "Cancelled" ? "destructive" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "DATE & TIME",
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

export function SalesReportsOrderHistory({ data }: { data: OrderRow[] }) {
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
        <CardTitle className="leading-none">Total Orders</CardTitle>
        <CardDescription>Recent fulfilled orders</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4 pt-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search orders..."
              value={(table.getColumn("search")?.getFilterValue() as string) ?? ""}
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
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={
                    table.getState().sorting[0]?.id === "date" ? 
                      (table.getState().sorting[0]?.desc ? "newest" : "oldest") : 
                      "default"
                  }
                  onValueChange={(val) => {
                    if (val === "newest") table.setSorting([{ id: "date", desc: true }]);
                    else if (val === "oldest") table.setSorting([{ id: "date", desc: false }]);
                    else table.setSorting([]);
                  }}
                >
                  <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
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
                  <TableCell colSpan={6} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-10">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Package className="size-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No orders</p>
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
            Total {data.length} order(s).
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <Button size="icon-sm" variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="size-4" /></Button>
              <Button size="icon-sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-4" /></Button>
              <Button size="icon-sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-4" /></Button>
              <Button size="icon-sm" variant="outline" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="size-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
