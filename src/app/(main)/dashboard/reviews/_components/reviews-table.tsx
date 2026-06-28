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
  AlertDialogTrigger,
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:8000";
const REVIEW_API_URL = process.env.NEXT_PUBLIC_API_REVIEW_URL || "reviews";

const getReviewUrl = (path = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const reviewPath = REVIEW_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${reviewPath}/${cleanPath}` : reviewPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, "");
  let appUrl = APP_URL;
  if (!appUrl.endsWith("/")) appUrl += "/";
  return `${appUrl}${cleanPath}`;
};

type ReviewRow = {
  id: number;
  productId: string;
  productName: string;
  productImage: string;
  productSku?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  rating: number;
  text: string;
  date: string;
};

interface ReviewsTableProps {
  refreshTrigger?: number;
}

/* ---- Row Actions ---- */
function RowActions({ row, onRefresh }: { row: ReviewRow; onRefresh: () => void }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const url = getReviewUrl(row.id.toString());
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete review");

      toast.success(`Review deleted successfully.`);
      onRefresh();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
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

      <EditReviewDialog review={row} open={editOpen} onOpenChange={setEditOpen} onRefresh={onRefresh} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review written by <strong>{row.customerName}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

/* ---- Main Table Component ---- */
export function ReviewsTable({ refreshTrigger }: ReviewsTableProps) {
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const url = getReviewUrl();
      console.log("Fetching reviews from:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`);

      const result = await response.json();
      let reviewsData = [];

      if (result.data && Array.isArray(result.data)) {
        reviewsData = result.data;
      } else if (Array.isArray(result)) {
        reviewsData = result;
      } else if (result.reviews && Array.isArray(result.reviews)) {
        reviewsData = result.reviews;
      }

      console.log(`Found ${reviewsData.length} reviews`);

      const transformedData: ReviewRow[] = reviewsData.map((review: any) => ({
        id: review.id,
        productId: `PRD-${review.product_id}`,
        productName:
          review.product?.title || review.product?.product_short_description || `Product #${review.product_id}`,
        productImage: review.product?.product_thumbnail_img || "",
        productSku: review.product?.sku || "",
        customerId: `CUS-${review.customer_id}`,
        customerName: review.customer?.full_name || `Customer #${review.customer_id}`,
        customerEmail: review.customer?.email || "",
        customerAvatar: "",
        rating: review.ratings,
        text: review.review_text,
        date: review.created_at ? new Date(review.created_at).toISOString().split("T")[0] : "",
      }));

      setReviews(transformedData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, [refreshTrigger]);

  const handleBulkDelete = async (selectedIds: number[]) => {
    try {
      const url = getReviewUrl("bulk-delete");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) throw new Error("Failed to delete reviews");

      toast.success(`${selectedIds.length} review(s) deleted successfully.`);
      setRowSelection({});
      await fetchReviews();
    } catch (error) {
      console.error("Error bulk deleting reviews:", error);
      toast.error("Failed to delete reviews");
    }
  };

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
      accessorFn: (row) => `${row.productName} ${row.customerName} ${row.customerEmail} ${row.text}`,
      filterFn: "includesString",
      enableHiding: true,
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-[200px] max-w-[250px]">
          <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {row.original.productImage ? (
              <img
                src={getFullImageUrl(row.original.productImage)}
                alt={row.original.productName}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <MessageSquare className="size-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="font-semibold leading-none text-sm truncate" title={row.original.productName}>
              {row.original.productName}
            </div>
            <div className="text-muted-foreground text-xs">{row.original.productId}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-[150px] max-w-[200px]">
          <Avatar className="size-10 border shadow-sm">
            <AvatarImage src={row.original.customerAvatar} />
            <AvatarFallback>{row.original.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="font-semibold leading-none truncate" title={row.original.customerName}>
              {row.original.customerName}
            </div>
            <div className="text-muted-foreground text-xs mt-0.5 truncate" title={row.original.customerEmail}>
              {row.original.customerEmail}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-0.5 text-amber-500 min-w-[80px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`size-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted/40"}`} />
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "text",
      header: "Review Preview",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm line-clamp-2 max-w-[280px] min-w-[180px]">
          "{row.original.text}"
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-sm text-muted-foreground min-w-[80px] block">{row.original.date}</span>,
    },
    {
      id: "actions",
      header: () => <div className="flex w-full justify-end">Actions</div>,
      cell: ({ row }) => <RowActions row={row.original} onRefresh={fetchReviews} />,
      enableHiding: false,
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: reviews,
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
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">Product Reviews</CardTitle>
          <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            Loading...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Product Reviews</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount > 0 ? `${totalCount} reviews` : "No reviews"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 w-full rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </div>
          {selectedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  <Trash className="mr-2 size-4" />
                  Delete Selected ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedCount} selected {selectedCount === 1 ? "review" : "reviews"}.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleBulkDelete(selectedIds)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
        <div className="flex flex-col gap-4 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start gap-2">
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
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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
