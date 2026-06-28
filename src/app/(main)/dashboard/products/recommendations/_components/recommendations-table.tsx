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
  Edit,
  MoreHorizontal,
  Search,
  Sparkles,
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
import { type Recommendation, useProductRecommendations } from "@/hooks/useProductRecommendations";

import { EditRecommendationDialog } from "./edit-recommendation-dialog";

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

/* ── Columns ──────────────────────────────────────────────────── */

function buildColumns(
  onEdit: (rec: Recommendation) => void,
  onDelete: (rec: Recommendation) => void,
): ColumnDef<Recommendation>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => `${row.product?.title ?? ""} ${row.recommended_product?.title ?? ""} ${row.id}`,
      filterFn: "includesString",
      enableHiding: true,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium text-muted-foreground tabular-nums">#{row.original.id}</span>,
    },
    {
      accessorKey: "product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Base Product
          <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground" />
        </Button>
      ),
      sortingFn: (a, b) => (a.original.product?.title ?? "").localeCompare(b.original.product?.title ?? ""),
      cell: ({ row }) => {
        const p = row.original.product;
        return (
          <div className="flex items-center gap-3">
            {p?.product_thumbnail_img ? (
              <img
                src={getImageUrl(p.product_thumbnail_img)}
                alt={p.title}
                className="size-9 shrink-0 rounded-md border object-cover"
              />
            ) : (
              <div className="size-9 shrink-0 rounded-md border bg-muted flex items-center justify-center">
                <Sparkles className="size-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium leading-none truncate">
                {p?.title ?? `Product #${row.original.product_id}`}
              </span>
              <span className="text-xs text-muted-foreground">ID: {row.original.product_id}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "arrow",
      header: "",
      cell: () => (
        <div className="flex justify-center text-muted-foreground/60">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <path
              d="M4 10h12M12 6l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "recommended_product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Recommended Product
          <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground" />
        </Button>
      ),
      sortingFn: (a, b) =>
        (a.original.recommended_product?.title ?? "").localeCompare(b.original.recommended_product?.title ?? ""),
      cell: ({ row }) => {
        const p = row.original.recommended_product;
        return (
          <div className="flex items-center gap-3">
            {p?.product_thumbnail_img ? (
              <img
                src={getImageUrl(p.product_thumbnail_img)}
                alt={p.title}
                className="size-9 shrink-0 rounded-md border object-cover"
              />
            ) : (
              <div className="size-9 shrink-0 rounded-md border bg-muted flex items-center justify-center">
                <Sparkles className="size-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium leading-none truncate">
                {p?.title ?? `Product #${row.original.recommended_product_id}`}
              </span>
              <span className="text-xs text-muted-foreground">ID: {row.original.recommended_product_id}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Added",
      cell: ({ row }) => {
        const d = row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—";
        return <span className="text-sm text-muted-foreground">{d}</span>;
      },
    },
    {
      id: "actions",
      header: () => <div className="flex w-full justify-end">Actions</div>,
      cell: ({ row }) => <RowActions row={row.original} onEdit={onEdit} onDelete={onDelete} />,
      enableHiding: false,
      enableSorting: false,
    },
  ];
}

/* ── Row Actions ───────────────────────────────────────────────── */

function RowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: Recommendation;
  onEdit: (rec: Recommendation) => void;
  onDelete: (rec: Recommendation) => void;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" id={`rec-actions-${row.id}`}>
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
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              onDelete(row);
            }}
          >
            <Trash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ── Loading Skeleton ──────────────────────────────────────────── */

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="size-9 rounded-md shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="size-9 rounded-md shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/* ── Main Table Component ──────────────────────────────────────── */

export function RecommendationsTable() {
  const { data, isLoading, deleteRecommendation } = useProductRecommendations();

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit state
  const [editTarget, setEditTarget] = React.useState<Recommendation | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = React.useState<Recommendation | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEdit = React.useCallback((rec: Recommendation) => {
    setEditTarget(rec);
    setEditOpen(true);
  }, []);

  const handleDeleteRequest = React.useCallback((rec: Recommendation) => {
    setDeleteTarget(rec);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRecommendation(deleteTarget.id);
      toast.success("Recommendation deleted successfully.");
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete recommendation.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = React.useMemo(() => buildColumns(handleEdit, handleDeleteRequest), [handleEdit, handleDeleteRequest]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      pagination,
      columnVisibility: { search: false },
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
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">Recommendations List</CardTitle>
          <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            {isLoading
              ? "Loading…"
              : totalCount > 0
                ? `${totalCount} recommendation${totalCount !== 1 ? "s" : ""}`
                : "No recommendations"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="rec-search-input"
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8 sm:w-64"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => {
                  table.getColumn("search")?.setFilterValue(e.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-y">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-0">
                      <TableSkeleton />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                          <Sparkles className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No recommendations found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or add a new recommendation.
                        </p>
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
                onValueChange={(v) =>
                  setPagination((p) => ({
                    ...p,
                    pageSize: Number(v),
                    pageIndex: 0,
                  }))
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

      {/* Edit dialog */}
      {editTarget && (
        <EditRecommendationDialog
          recommendation={editTarget}
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditTarget(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the recommendation linking{" "}
              <strong>{deleteTarget?.product?.title ?? `Product #${deleteTarget?.product_id}`}</strong> →{" "}
              <strong>
                {deleteTarget?.recommended_product?.title ?? `Product #${deleteTarget?.recommended_product_id}`}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-rec-btn"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
