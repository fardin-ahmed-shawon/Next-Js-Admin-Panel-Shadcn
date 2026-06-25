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
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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

import { EditDiscountDialog } from "./edit-discount-dialog";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const DISCOUNT_API_URL = process.env.NEXT_PUBLIC_API_DISCOUNT_URL || "discounts";

// Helper functions
const getFullUrl = (endpoint: string) => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}${cleanEndpoint}`.replace(/([^:]\/)\/+/g, "$1");
};

const getDiscountUrl = (path: string = "") => {
  const discountPath = DISCOUNT_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${discountPath}/${cleanPath}` : discountPath;
  return getFullUrl(fullPath);
};

type DiscountRow = {
  id: string;
  purchaseAmount: number;
  discountAmount: number;
  type: "Fixed" | "Percentage";
  freeShipping: boolean;
  status: "Active" | "Inactive";
};

interface DiscountsTableProps {
  refreshTrigger?: number;
  onDiscountDeleted?: () => void;
}

/* ---- Row Actions Component ---- */
// Update the RowActions component to pass onDiscountUpdated
function RowActions({ row, onDiscountDeleted }: { row: DiscountRow; onDiscountDeleted: () => void }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const url = getDiscountUrl(`${row.id}`);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete discount");
      }

      toast.success(`Discount rule ${row.id} deleted successfully.`);
      onDiscountDeleted();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete discount");
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
            Edit Discount
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

      {/* Updated EditDiscountDialog with onDiscountUpdated prop */}
      <EditDiscountDialog
        discount={row}
        open={editOpen}
        onOpenChange={setEditOpen}
        onDiscountUpdated={onDiscountDeleted}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the discount rule <strong>{row.id}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---- Columns Definition ---- */
const getColumns = (onDiscountDeleted: () => void): ColumnDef<DiscountRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.id} ${row.purchaseAmount}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    id: "slNo",
    header: "SL No",
    cell: ({ row }) => (
      <span className="font-medium text-muted-foreground">{(row.index + 1).toString().padStart(2, "0")}</span>
    ),
  },
  {
    accessorKey: "purchaseAmount",
    header: "Min. Purchase",
    cell: ({ row }) => (
      <span className="font-semibold text-primary">৳{row.original.purchaseAmount.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "discountAmount",
    header: "Discount Value",
    cell: ({ row }) => {
      const { discountAmount, type } = row.original;
      return (
        <span className="font-medium">
          {discountAmount > 0
            ? type === "Percentage"
              ? `${discountAmount}% off`
              : `৳${discountAmount} off`
            : "No monetary discount"}
        </span>
      );
    },
  },
  {
    accessorKey: "freeShipping",
    header: "Perks",
    cell: ({ row }) =>
      row.original.freeShipping ? (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Free Shipping
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={status === "Active" ? "default" : "secondary"}>{status}</Badge>;
    },
    filterFn: "equals",
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">Actions</div>,
    cell: ({ row }) => <RowActions row={row.original} onDiscountDeleted={onDiscountDeleted} />,
    enableHiding: false,
    enableSorting: false,
  },
];

/* ---- Main Table Component ---- */
export function DiscountsTable({ refreshTrigger, onDiscountDeleted }: DiscountsTableProps) {
  const [discounts, setDiscounts] = React.useState<DiscountRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = getDiscountUrl();
      const response = await fetch(url, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      let discountsData = [];
      if (data.data) discountsData = data.data;
      else if (Array.isArray(data)) discountsData = data;
      else if (data.discounts) discountsData = data.discounts;

      const transformedData = discountsData.map((item: any) => ({
        id: item.id?.toString() || "",
        purchaseAmount: item.minimum_subtotal_amount || 0,
        discountAmount: item.discount_amount || 0,
        type: item.type === "percentage" ? "Percentage" : "Fixed",
        freeShipping: item.has_free_shipping === 1 || item.has_free_shipping === true,
        status: item.status === "active" ? "Active" : "Inactive",
      }));

      setDiscounts(transformedData);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch discounts");
      toast.error("Failed to fetch discounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    try {
      const url = getDiscountUrl("bulk-delete");
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) throw new Error("Failed to delete discounts");

      toast.success(`${selectedIds.length} discount(s) deleted successfully.`);
      setRowSelection({});
      fetchDiscounts();
      if (onDiscountDeleted) onDiscountDeleted();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete discounts");
    }
  };

  React.useEffect(() => {
    fetchDiscounts();
  }, [refreshTrigger]);

  const handleDiscountDeleted = () => {
    fetchDiscounts();
    if (onDiscountDeleted) onDiscountDeleted();
  };

  const columns = getColumns(handleDiscountDeleted);

  const table = useReactTable({
    data: discounts,
    columns,
    state: { columnFilters, sorting, rowSelection, columnVisibility: { search: false }, pagination },
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
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-2 text-muted-foreground">Loading discounts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-2 text-destructive">Failed to load discounts</div>
            <Button variant="outline" size="sm" onClick={fetchDiscounts}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Discounts List</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount > 0 ? `${totalCount} rules` : "No discounts configured"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 pl-8 sm:w-64"
                placeholder="Search discounts..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>
            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => {
                table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 size-4" />
                  Delete Selected ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedCount} selected{" "}
                    {selectedCount === 1 ? "discount" : "discounts"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkDelete(selectedIds)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

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
                        <BadgePercent className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No discounts found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
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
