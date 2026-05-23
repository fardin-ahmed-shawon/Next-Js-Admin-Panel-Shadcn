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
  FileText,
  MoreHorizontal,
  Search,
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

import { EditBlogDialog } from "./edit-blog-dialog";

/* ---- Demo Data ---- */

const blogs = [
  {
    id: "BLG-1001",
    title: "10 Tips for Modern Web Design",
    description: "Learn how to build stunning UI/UX with ShadCN and Next.js.",
    createdDate: "2024-03-12",
    image: "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Web+Design",
  },
  {
    id: "BLG-1002",
    title: "Why React Server Components?",
    description: "An in-depth look at how RSCs change the game for performance.",
    createdDate: "2024-03-08",
    image: "https://placehold.co/600x400/1a1a2e/e0e0e0?text=React+Server",
  },
  {
    id: "BLG-1003",
    title: "Mastering Tailwind CSS",
    description: "A comprehensive guide to building complex layouts easily.",
    createdDate: "2024-02-25",
    image: "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Tailwind+CSS",
  },
  {
    id: "BLG-1004",
    title: "E-Commerce Best Practices",
    description: "Increase conversion rates with these proven checkout strategies.",
    createdDate: "2024-02-14",
    image: "https://placehold.co/600x400/1a1a2e/e0e0e0?text=E-Commerce",
  },
  {
    id: "BLG-1005",
    title: "The Future of AI in SaaS",
    description: "How artificial intelligence is reshaping software as a service.",
    createdDate: "2024-01-30",
    image: "https://placehold.co/600x400/1a1a2e/e0e0e0?text=AI+in+SaaS",
  },
];

type BlogRow = (typeof blogs)[0];

/* ---- Columns ---- */

const columns: ColumnDef<BlogRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all blogs"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select blog ${row.original.id}`}
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
    accessorFn: (row) => `${row.title} ${row.id}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: "Blog Details",
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-muted p-0.5">
          <img src={row.original.image} alt={row.original.title} className="size-full object-cover rounded-sm" />
        </div>
        <div className="flex flex-col gap-1 max-w-[300px]">
          <div className="font-medium leading-none text-base truncate">{row.original.title}</div>
          <div className="text-muted-foreground text-xs truncate">{row.original.description}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.createdDate}</span>,
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

function RowActions({ row }: { row: BlogRow }) {
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
            Edit Blog
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

      <EditBlogDialog blog={row} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the blog post <strong>{row.title}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast.success(`Blog post deleted successfully.`);
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

export function BlogsTable() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: blogs,
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
        <CardTitle className="font-normal text-muted-foreground text-sm">Blog Posts List</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount > 0 ? `${totalCount} posts` : "No posts"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8 sm:w-64"
                placeholder="Search blogs..."
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
                        <FileText className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No blogs found</p>
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
