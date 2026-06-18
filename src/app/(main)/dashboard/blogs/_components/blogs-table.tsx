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
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { EditBlogDialog } from "./edit-blog-dialog";

/* ---- Types ---- */

export interface BlogRow {
  id: number;
  title: string;
  description: string;
  img: string;
  created_at: string;
  updated_at: string;
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_URL || "blogs";
const API_URL = `${BASE}${BLOG_PATH}`;
const getImageUrl = (path: string | null) => {
  if (!path) return "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Blog";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}${cleanPath}`;
};

/* ---- Columns ---- */

function getColumns(
  onEdit: (row: BlogRow) => void,
  onDelete: (row: BlogRow) => void
): ColumnDef<BlogRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="w-10">
          <Checkbox
            aria-label="Select all blogs"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
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
      cell: ({ row }) => (
        <span className="font-medium text-muted-foreground">BLG-{row.original.id}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Blog Details",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-muted p-0.5">
            <img
              src={getImageUrl(row.original.img)}
              alt={row.original.title}
              className="size-full object-cover rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Blog";
              }}
            />
          </div>
          <div className="flex flex-col gap-1 max-w-[300px]">
            <div className="font-medium leading-none text-base truncate">
              {row.original.title}
            </div>
            <div className="text-muted-foreground text-xs truncate">
              {row.original.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="flex w-full justify-end">Actions</div>,
      cell: ({ row }) => (
        <RowActions row={row.original} onEdit={onEdit} onDelete={onDelete} />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];
}

/* ---- Row Actions ---- */

function RowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: BlogRow;
  onEdit: (row: BlogRow) => void;
  onDelete: (row: BlogRow) => void;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${row.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`"${row.title}" deleted successfully.`);
      onDelete(row);
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete blog post.");
    } finally {
      setIsDeleting(false);
    }
  };

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
              onEdit(row);
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{row.title}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---- Skeleton Rows ---- */

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-20 rounded-md" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* ---- Main Table Component ---- */

export function BlogsTable({ onDeleted }: { onDeleted?: () => void }) {
  const [data, setData] = React.useState<BlogRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [editTarget, setEditTarget] = React.useState<BlogRow | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchBlogs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: { success: boolean; data: BlogRow[] } = await res.json();
      setData(json.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(`Failed to load blogs: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleEdit = (row: BlogRow) => {
    setEditTarget(row);
    setEditOpen(true);
  };

  const handleDelete = (deleted: BlogRow) => {
    setData((prev) => prev.filter((b) => b.id !== deleted.id));
    onDeleted?.();
  };

  const handleUpdated = (updated: BlogRow) => {
    setData((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = React.useMemo(() => getColumns(handleEdit, handleDelete), []);

  const table = useReactTable({
    data,
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">
            Blog Posts List
          </CardTitle>
          <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : totalCount > 0 ? (
              `${totalCount} posts`
            ) : (
              "No posts"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
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
            <Button variant="outline" size="sm" onClick={fetchBlogs} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="overflow-x-auto border-y">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-sm font-medium text-destructive">Failed to load blogs</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                        <Button size="sm" variant="outline" onClick={fetchBlogs}>
                          Try again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
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
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search query.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(v) =>
                  setPagination((p) => ({ ...p, pageSize: Number(v), pageIndex: 0 }))
                }
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

      {editTarget && (
        <EditBlogDialog
          blog={editTarget}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}