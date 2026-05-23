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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

import { EditReviewDialog } from "./edit-review-dialog";

/* ---- Demo Data ---- */
const initialReviews = [
  {
    id: "REV-1001",
    productId: "PRD-1001",
    productName: "Classic Cotton T-Shirt",
    productImage: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=T",
    customerId: "CUS-1001",
    customerName: "Arham Khan",
    customerEmail: "arham@example.com",
    customerAvatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=AK",
    rating: 5,
    text: "The cotton quality is superb! It is super breathable and fits perfectly.",
    date: "2026-05-20",
  },
  {
    id: "REV-1002",
    productId: "PRD-1002",
    productName: "Wireless Bluetooth Earbuds",
    productImage: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=E",
    customerId: "CUS-1002",
    customerName: "Fatima Akter",
    customerEmail: "fatima@example.com",
    customerAvatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=FA",
    rating: 4,
    text: "Sound quality is very clean and crisp. Bass could be slightly punchier, but battery life is incredible.",
    date: "2026-05-22",
  },
  {
    id: "REV-1003",
    productId: "PRD-1003",
    productName: "Leather Crossbody Bag",
    productImage: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=B",
    customerId: "CUS-1003",
    customerName: "Rahim Uddin",
    customerEmail: "rahim@example.com",
    customerAvatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=RU",
    rating: 3,
    text: "Decent bag, but the strap feels a bit stiff. Plenty of pockets though.",
    date: "2026-05-21",
  },
];

type ReviewRow = (typeof initialReviews)[0];

/* ---- Columns ---- */
const columns: ColumnDef<ReviewRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all reviews"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select review ${row.original.id}`}
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
    accessorFn: (row) => `${row.productName} ${row.customerName} ${row.text}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
          <img src={row.original.productImage} alt={row.original.productName} className="size-full object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="font-semibold leading-none text-sm">{row.original.productName}</div>
          <div className="text-muted-foreground text-xs">{row.original.productId}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-10 border shadow-sm">
          <AvatarImage src={row.original.customerAvatar} />
          <AvatarFallback>{row.original.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="font-semibold leading-none">{row.original.customerName}</div>
          <div className="text-muted-foreground text-xs mt-1">{row.original.customerEmail}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center text-amber-500">
        {Array.from({ length: row.original.rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" />
        ))}
      </div>
    ),
  },
  {
    accessorKey: "text",
    header: "Review Preview",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm line-clamp-2 max-w-[300px]">"{row.original.text}"</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.date}</span>,
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
function RowActions({ row }: { row: ReviewRow }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditOpen(true);
            }}
          >
            <Edit className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditReviewDialog review={row} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review written by <strong>{row.customerName}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast.success(`Review deleted successfully.`);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---- Main Table Component ---- */
export function ReviewsTable() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: initialReviews,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility: { search: false },
      pagination,
    },
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
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Product Reviews</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount > 0 ? `${totalCount} reviews` : "No reviews"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8 sm:w-64"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-y">
          <Table>
            <TableHeader className="bg-muted/50">
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
                  <TableCell colSpan={columns.length} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No reviews found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(v) => setPagination((p) => ({ ...p, pageSize: Number(v), pageIndex: 0 }))}
            >
              <SelectTrigger className="h-8 w-16">
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
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
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
      </CardContent>
    </Card>
  );
}
