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
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Archive,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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

/* ---- Demo Data ---- */

type InventoryItem = {
  id: string;
  image?: string;
  name: string;
  variantsCount?: number;
  sku?: string;
  category?: string;
  subCategory?: string;
  stock: number;
  purchasePrice?: number;
  sellingPrice?: number;
  value?: number;
  profit?: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  subRows?: InventoryItem[];
};

const mockData: InventoryItem[] = [
  {
    id: "31",
    image: "https://placehold.co/40x40/f1f5f9/64748b?text=Img",
    name: "Mens Premium Red Panjabi",
    variantsCount: 3,
    category: "Mens Fashion",
    subCategory: "Panjabi",
    stock: 153,
    purchasePrice: 1000,
    sellingPrice: 1750,
    value: 267750,
    profit: 114750,
    status: "In Stock",
    subRows: [
      {
        id: "31-1",
        name: "M",
        sku: "GHJ354",
        stock: 49,
        status: "In Stock",
      },
      {
        id: "31-2",
        name: "30",
        sku: "KJHGTJ3",
        stock: 76,
        status: "In Stock",
      },
      {
        id: "31-3",
        name: "L",
        sku: "KJGHJF5346",
        stock: 28,
        status: "Low Stock",
      },
    ],
  },
  {
    id: "30",
    image: "https://placehold.co/40x40/fef3c7/d97706?text=Img",
    name: "Panjabi For Eid 2026",
    sku: "RTHJ65",
    category: "Mens Fashion",
    subCategory: "Panjabi",
    stock: 23,
    purchasePrice: 500,
    sellingPrice: 700,
    value: 16100,
    profit: 4600,
    status: "Low Stock",
  },
  {
    id: "28",
    image: "https://placehold.co/40x40/e0f2fe/0ea5e9?text=Img",
    name: "Football Jercey",
    variantsCount: 5,
    category: "Mens Fashion",
    subCategory: "T-Shirt",
    stock: 189,
    purchasePrice: 500,
    sellingPrice: 600,
    value: 113400,
    profit: 18900,
    status: "In Stock",
    subRows: [
      {
        id: "28-1",
        name: "S",
        sku: "FBJ001",
        stock: 50,
        status: "In Stock",
      },
    ],
  },
  {
    id: "25",
    image: "https://placehold.co/40x40/fef2f2/ef4444?text=Img",
    name: "Winter Jacket Deluxe",
    sku: "WJD-099",
    category: "Mens Fashion",
    subCategory: "Jacket",
    stock: 0,
    purchasePrice: 2000,
    sellingPrice: 3500,
    value: 0,
    profit: 0,
    status: "Out of Stock",
  },
];

type InventoryFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";
const inventoryFilters: InventoryFilter[] = ["All", "In Stock", "Low Stock", "Out of Stock"];
const allCategories = [...new Set(mockData.map((p) => p.category).filter(Boolean))] as string[];
const allSubCategories = [...new Set(mockData.map((p) => p.subCategory).filter(Boolean))] as string[];

/* ---- Columns ---- */

const columns: ColumnDef<InventoryItem>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.name} ${row.sku || ""} ${row.id}`,
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
    accessorKey: "category",
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
          <ChevronRight className={`size-4 text-muted-foreground transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`} />
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
    accessorKey: "name",
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
          {row.original.image && (
            <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <img src={row.original.image} alt={row.original.name} className="size-full object-cover" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-medium leading-none">{row.original.name}</span>
            {row.original.variantsCount && (
              <Badge variant="outline" className="w-fit text-muted-foreground text-[10px] h-4 px-1.5 mt-1">
                <Layers className="size-3 mr-1" /> {row.original.variantsCount} variants
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      if (row.depth > 0) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{row.original.category}</span>
          <span className="text-xs text-muted-foreground">{row.original.subCategory}</span>
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
    accessorKey: "sellingPrice",
    header: "Price",
    cell: ({ row }) => {
      if (row.depth > 0 || !row.original.sellingPrice) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="tabular-nums font-medium">৳{row.original.sellingPrice.toFixed(2)}</span>
          <span className="tabular-nums text-xs text-muted-foreground line-through">
             ৳{row.original.purchasePrice?.toFixed(2) || "0.00"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      if (row.depth > 0 || !row.original.profit) return null;
      return <span className="tabular-nums">৳{row.original.profit.toLocaleString()}</span>;
    },
  },
  {
    id: "statusBadge",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return <Badge variant={s === "In Stock" ? "default" : s === "Low Stock" ? "secondary" : "destructive"}>{s}</Badge>;
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

function RowActions({ row }: { row: InventoryItem }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  if (row.subRows && row.subRows.length > 0) {
    return <div className="flex w-full justify-end text-muted-foreground text-sm italic pr-4">per variant</div>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-end">
            <Button aria-label="Open actions" size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Minus className="mr-2 h-4 w-4" />
            Reduce Stock
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit Item
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
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item from inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                toast.success(`Item has been deleted successfully.`);
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

function exportToExcel(data: InventoryItem[]) {
  const headers = ["ID", "Name", "SKU", "Category", "Sub Category", "Stock", "Status"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.id,
        `"${row.name}"`,
        row.sku || "",
        `"${row.category || ""}"`,
        `"${row.subCategory || ""}"`,
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

export function InventoryTable() {
  const [activeFilter, setActiveFilter] = React.useState<InventoryFilter>("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: mockData,
    columns,
    state: {
      columnFilters,
      sorting,
      expanded,
      columnVisibility: { search: false, status: false, categoryFilter: false, subCategoryFilter: false },
      pagination,
    },
    getRowId: (row) => row.id,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const totalCount = table.getFilteredRowModel().rows.length;

  const filterLabel = activeFilter === "All" ? "All Inventory" : `${activeFilter} Items`;
  const countDescription = `${totalCount} records`;

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
                placeholder="Search inventory..."
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
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
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
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                const filter = value as InventoryFilter;
                setActiveFilter(filter);
                table.getColumn("status")?.setFilterValue(filter === "All" ? undefined : filter);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeFilter}
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={row.depth > 0 ? "bg-muted/30" : ""}>
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
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : activeFilter !== "All"
                              ? `There are no ${activeFilter.toLowerCase()} items.`
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
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
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
