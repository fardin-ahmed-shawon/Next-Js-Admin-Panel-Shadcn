"use client";

import Link from "next/link";

import * as React from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  PackageOpen,
  Search,
  Trash,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";

/* ---- Demo Data ---- */

const products = [
  { id: "PRD-1001", name: "Classic Cotton T-Shirt", mainCategory: "Clothing", subCategory: "Men's Wear", regularPrice: 39.99, sellingPrice: 29.99, stock: 150, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=T" },
  { id: "PRD-1002", name: "Wireless Bluetooth Earbuds", mainCategory: "Electronics", subCategory: "Smartphones", regularPrice: 99.99, sellingPrice: 79.99, stock: 45, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=E" },
  { id: "PRD-1003", name: "Leather Crossbody Bag", mainCategory: "Clothing", subCategory: "Women's Wear", regularPrice: 179.00, sellingPrice: 149.00, stock: 0, status: "Inactive", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=B" },
  { id: "PRD-1004", name: "Vitamin C Serum 30ml", mainCategory: "Beauty & Health", subCategory: "Skincare", regularPrice: 32.00, sellingPrice: 24.50, stock: 200, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=S" },
  { id: "PRD-1005", name: "Running Shoes Pro", mainCategory: "Sports & Outdoors", subCategory: "Fitness", regularPrice: 150.00, sellingPrice: 120.00, stock: 35, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=R" },
  { id: "PRD-1006", name: "Smart Watch Series 5", mainCategory: "Electronics", subCategory: "Laptops", regularPrice: 349.99, sellingPrice: 299.99, stock: 12, status: "Inactive", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=W" },
  { id: "PRD-1007", name: "Organic Green Tea 100g", mainCategory: "Home & Garden", subCategory: "Decor", regularPrice: 15.99, sellingPrice: 12.99, stock: 500, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=G" },
  { id: "PRD-1008", name: "Denim Jacket - Slim Fit", mainCategory: "Clothing", subCategory: "Men's Wear", regularPrice: 110.00, sellingPrice: 89.00, stock: 28, status: "Draft", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=D" },
  { id: "PRD-1009", name: "Yoga Mat Premium 6mm", mainCategory: "Sports & Outdoors", subCategory: "Fitness", regularPrice: 55.00, sellingPrice: 45.00, stock: 75, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=Y" },
  { id: "PRD-1010", name: "Face Moisturizer SPF 30", mainCategory: "Beauty & Health", subCategory: "Skincare", regularPrice: 42.99, sellingPrice: 34.99, stock: 110, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=M" },
  { id: "PRD-1011", name: "Portable Bluetooth Speaker", mainCategory: "Electronics", subCategory: "Smartphones", regularPrice: 74.99, sellingPrice: 59.99, stock: 60, status: "Draft", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=P" },
  { id: "PRD-1012", name: "Stainless Steel Water Bottle", mainCategory: "Home & Garden", subCategory: "Furniture", regularPrice: 24.99, sellingPrice: 19.99, stock: 85, status: "Active", image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=B" },
];

type ProductRow = (typeof products)[0];
type ProductFilter = "All" | "Active" | "Inactive" | "Draft";
const productFilters: ProductFilter[] = ["All", "Active", "Inactive", "Draft"];
const allCategories = [...new Set(products.map((p) => p.mainCategory))];
const allSubCategories = [...new Set(products.map((p) => p.subCategory))];

/* ---- Columns ---- */

const columns: ColumnDef<ProductRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all products"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select product ${row.original.id}`}
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
    accessorFn: (row) => `${row.name} ${row.id} ${row.mainCategory} ${row.subCategory}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "status",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    id: "categoryFilter",
    accessorKey: "mainCategory",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    id: "subCategoryFilter",
    accessorKey: "subCategory",
    filterFn: "equals",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
          <img src={row.original.image} alt={row.original.name} className="size-full object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="font-medium leading-none">{row.original.name}</div>
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{row.original.mainCategory}</span>
        <span className="text-xs text-muted-foreground">{row.original.subCategory}</span>
      </div>
    ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="tabular-nums font-medium">৳{row.original.sellingPrice.toFixed(2)}</span>
        <span className="tabular-nums text-xs text-muted-foreground line-through">৳{row.original.regularPrice.toFixed(2)}</span>
      </div>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className={`tabular-nums ${row.original.stock === 0 ? "text-destructive" : ""}`}>
        {row.original.stock}
      </span>
    ),
  },
  {
    id: "statusBadge",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <Badge variant={s === "Active" ? "default" : s === "Draft" ? "secondary" : "outline"}>
          {s}
        </Badge>
      );
    },
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

function RowActions({ row }: { row: ProductRow }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-end">
            <Button aria-label="Open product actions" size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/${row.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/${row.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete {row.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                toast.success(`"${row.name}" has been deleted successfully.`);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ---- CSV Export ---- */

function exportToExcel(data: ProductRow[]) {
  const headers = ["ID", "Name", "Main Category", "Sub Category", "Regular Price", "Selling Price", "Stock", "Status"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [row.id, `"${row.name}"`, `"${row.mainCategory}"`, `"${row.subCategory}"`, row.regularPrice, row.sellingPrice, row.stock, row.status].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function ProductsTable() {
  const [activeFilter, setActiveFilter] = React.useState<ProductFilter>("All");
  const [rowSelection, setRowSelection] = React.useState({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: products,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      columnVisibility: { search: false, status: false, categoryFilter: false, subCategoryFilter: false },
      pagination,
    },
    getRowId: (row) => row.id,
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
  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  const filterLabel = activeFilter === "All" ? "All Products" : `${activeFilter} Products`;
  const countDescription = selectedCount > 0
    ? `${selectedCount} of ${totalCount} selected`
    : `${totalCount} products`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">{filterLabel}</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {countDescription}
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <Select
              onValueChange={(value) => {
                table.getColumn("categoryFilter")?.setFilterValue(value === "all" ? undefined : value);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Main Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                table.getColumn("subCategoryFilter")?.setFilterValue(value === "all" ? undefined : value);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Sub Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub Categories</SelectItem>
                {allSubCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                const filter = value as ProductFilter;
                setActiveFilter(filter);
                table.getColumn("status")?.setFilterValue(filter === "All" ? undefined : filter);
                table.setPageIndex(0);
                setRowSelection({});
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeFilter}
            >
              {productFilters.map((filter) => (
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="outline">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuLabel className="text-xs">Bulk Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-xs text-destructive focus:text-destructive"
                  disabled={selectedCount === 0}
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash className="mr-2 h-3.5 w-3.5" />
                  Delete Selected ({selectedCount})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Trash />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete {selectedCount} products?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the selected products and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      toast.success(`${selectedCount} products have been deleted successfully.`);
                      setRowSelection({});
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              {table.getRowModel().rows.length ? (
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
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <PackageOpen className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No products found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : activeFilter !== "All"
                              ? `There are no ${activeFilter.toLowerCase()} products yet.`
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
            Viewing {table.getRowModel().rows.length} of {totalCount} products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
