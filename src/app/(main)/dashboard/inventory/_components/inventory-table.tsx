"use client";

import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Archive,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Layers,
  Minus,
  MoreHorizontal,
  Pen,
  Plus,
  Search,
  Settings2,
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
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchClient } from "@/lib/fetch-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ProductStockAdjustmentModal } from "./product-stock-adjustment-modal";

import type { InventoryItem, InventoryRecords, InventoryVariant } from "@/hooks/useInventory";

/* ---- Helper to get image URL ---- */
const getImageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

type InventoryFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";
const inventoryFilters: InventoryFilter[] = ["All", "In Stock", "Low Stock", "Out of Stock"];

/* ---- Columns ---- */

// We use 'any' for the column generic to accommodate both InventoryItem and InventoryVariant easily
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "status",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    id: "categoryFilter",
    accessorFn: (row) => row.category?.main || "",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    id: "subCategoryFilter",
    accessorFn: (row) => row.category?.sub || "",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="outline"
          className="size-7 rounded-md bg-transparent"
          size="icon"
          onClick={row.getToggleExpandedHandler()}
        >
          <ChevronRight
            className={`size-4 text-muted-foreground transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`}
          />
        </Button>
      ) : (
        <div className="w-7" />
      );
    },
  },
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => {
      if (row.depth > 0) return null;
      return <span className="font-medium text-muted-foreground">{row.original.id}</span>;
    },
  },
  {
    id: "name",
    accessorFn: (row) => row.title || row.name,
    header: "Product",
    cell: ({ row }) => {
      const isVariant = row.depth > 0;
      if (isVariant) {
        return (
          <div className="flex items-center pl-6">
            <span className="flex items-center text-sm text-muted-foreground">
              <Pen className="size-3 mr-1.5" />
              {row.original.name}
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-3 w-[200px]">
          <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {row.original.product_thumbnail_img && (
              <img
                src={getImageUrl(row.original.product_thumbnail_img)}
                alt={row.original.title}
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="font-medium leading-none truncate" title={row.original.title || row.original.name}>{row.original.title || row.original.name}</span>
            {row.original.variants_count > 0 && (
              <Badge variant="outline" className="w-fit text-muted-foreground text-[10px] h-4 px-1.5 mt-1">
                <Layers className="size-3 mr-1" /> {row.original.variants_count} variants
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      return row.original.sku ? (
        <span className="text-sm">{row.original.sku}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "category",
    accessorFn: (row) => row.category?.main,
    header: "Category",
    cell: ({ row }) => {
      if (row.depth > 0) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{row.original.category?.main || "-"}</span>
          <span className="text-xs text-muted-foreground">{row.original.category?.sub || ""}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className={`tabular-nums ${row.original.stock === 0 ? "text-destructive" : ""}`}>{row.original.stock}</span>
    ),
  },
  {
    id: "sellingPrice",
    accessorFn: (row) => row.price?.selling,
    header: "Price",
    cell: ({ row }) => {
      if (!row.original.price?.selling) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="tabular-nums font-medium">৳{Number(row.original.price.selling).toFixed(2)}</span>
          <span className="tabular-nums text-xs text-muted-foreground line-through">
            ৳{Number(row.original.price.purchase || 0).toFixed(2)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      if (!row.original.profit) return null;
      return <span className="tabular-nums">৳{row.original.profit.toLocaleString()}</span>;
    },
  },
  {
    id: "statusBadge",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <Badge variant={s === "In Stock" ? "default" : s === "Low Stock" ? "secondary" : "destructive"}>{s}</Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">Actions</div>,
    cell: ({ row, table }) => <RowActions row={row} mutate={(table.options.meta as any)?.mutate} />,
    enableHiding: false,
    enableSorting: false,
  },
];

/* ---- Row Actions ---- */

function RowActions({ row, mutate }: { row: any; mutate?: () => void }) {
  const [adjustmentOpen, setAdjustmentOpen] = React.useState(false);

  const isVariant = row.depth > 0;
  const item = row.original;
  const productId = isVariant ? row.getParentRow()?.original.id : item.id;
  const variantId = isVariant ? item.id : undefined;

  // If this item has variants itself, don't show actions, let them edit per variant or main product elsewhere
  if (!isVariant && item.variants && item.variants.length > 0) {
    return <div className="flex w-full justify-end text-muted-foreground text-sm italic pr-4">per variant</div>;
  }

  return (
    <>
      <div className="flex w-full justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdjustmentOpen(true)}
          className="h-8 text-xs font-medium"
        >
          <Settings2 className="mr-2 size-3.5" />
          Stock Adjustment
        </Button>
      </div>

      <ProductStockAdjustmentModal
        open={adjustmentOpen}
        onOpenChange={setAdjustmentOpen}
        item={item}
        variantId={variantId}
        productId={productId}
        mutate={mutate}
      />
    </>
  );
}

/* ---- CSV Export ---- */

function exportToExcel(data: any[]) {
  const headers = ["ID", "Name", "SKU", "Main Category", "Sub Category", "Stock", "Status"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.id,
        `"${row.title || row.name || ""}"`,
        row.sku || "",
        `"${row.category?.main || ""}"`,
        `"${row.category?.sub || ""}"`,
        row.stock,
        row.status,
      ].join(","),
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "inventory.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

interface InventoryTableProps {
  records?: InventoryRecords;
  loading?: boolean;
  page: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sorting: SortingState;
  setSorting: (sorting: any) => void;
  mutate?: () => void;
}

export function InventoryTable({
  records,
  loading,
  page,
  setPage,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sorting,
  setSorting,
  mutate,
}: InventoryTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const tableData = React.useMemo(() => {
    if (!records?.data) return [];
    return records.data.map((item) => ({
      ...item,
      subRows: item.variants || [], // For expander to work properly
    }));
  }, [records]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnFilters,
      sorting,
      expanded,
      columnVisibility: { status: false, categoryFilter: false, subCategoryFilter: false },
    },
    getRowId: (row) => String(row.id),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      mutate,
    },
  });

  const totalCount = records?.total || 0;
  const filterLabel = statusFilter === "All" ? "All Inventory" : `${statusFilter} Items`;
  const countDescription = `${totalCount} records`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">{filterLabel}</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {loading ? <Skeleton className="h-6 w-20" /> : countDescription}
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search inventory..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                setStatusFilter(value);
                setPage(1);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={statusFilter}
            >
              {inventoryFilters.map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.getColumn("id")?.toggleSorting(table.getColumn("id")?.getIsSorted() === "asc")}
            >
              <ArrowUpDown />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {loading && !tableData.length ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((c, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={row.depth > 0 ? "bg-muted/30" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Archive className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No inventory found</p>
                        <p className="text-xs text-muted-foreground">
                          {search
                            ? "Try adjusting your search to find what you're looking for."
                            : statusFilter !== "All"
                              ? `There are no ${statusFilter.toLowerCase()} items.`
                              : "Start by adding your first product."}
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
        <div className="flex items-center justify-between px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Viewing {table.getRowModel().rows.length} of {totalCount} rows
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium mx-2">
              {page} / {records?.last_page || 1}
            </span>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={!records?.last_page || page >= records.last_page}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => setPage(records?.last_page || 1)}
              disabled={!records?.last_page || page >= records.last_page}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
