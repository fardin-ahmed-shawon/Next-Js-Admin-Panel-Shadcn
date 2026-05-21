"use client";

import * as React from "react";
import Link from "next/link";

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
  Copy,
  Download,
  Edit,
  Eye,
  LayoutTemplate,
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
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

/* ---- Demo Data ---- */

const landingPages = [
  {
    id: "LP-1001",
    title: "Summer Flash Sale 2026",
    slug: "summer-flash-sale-2026",
    category: "Promotions",
    status: "Published",
    views: 14250,
    clicks: 2130,
    conversions: 487,
    createdAt: "2026-05-01",
    updatedAt: "2026-05-18",
    thumbnail: "https://placehold.co/80x50/6366f1/ffffff?text=SFS",
  },
  {
    id: "LP-1002",
    title: "Eid Collection Launch",
    slug: "eid-collection-launch",
    category: "Seasonal",
    status: "Published",
    views: 22400,
    clicks: 3820,
    conversions: 910,
    createdAt: "2026-04-15",
    updatedAt: "2026-05-10",
    thumbnail: "https://placehold.co/80x50/f59e0b/ffffff?text=ECL",
  },
  {
    id: "LP-1003",
    title: "New Arrivals - Electronics",
    slug: "new-arrivals-electronics",
    category: "Products",
    status: "Draft",
    views: 0,
    clicks: 0,
    conversions: 0,
    createdAt: "2026-05-19",
    updatedAt: "2026-05-20",
    thumbnail: "https://placehold.co/80x50/06b6d4/ffffff?text=NAE",
  },
  {
    id: "LP-1004",
    title: "Referral Program Campaign",
    slug: "referral-program-campaign",
    category: "Marketing",
    status: "Published",
    views: 8700,
    clicks: 1240,
    conversions: 198,
    createdAt: "2026-03-10",
    updatedAt: "2026-04-20",
    thumbnail: "https://placehold.co/80x50/10b981/ffffff?text=RPC",
  },
  {
    id: "LP-1005",
    title: "Black Friday Countdown",
    slug: "black-friday-countdown",
    category: "Promotions",
    status: "Published",
    views: 31200,
    clicks: 5600,
    conversions: 1230,
    createdAt: "2025-11-01",
    updatedAt: "2025-12-01",
    thumbnail: "https://placehold.co/80x50/1f2937/ffffff?text=BFC",
  },
  {
    id: "LP-1006",
    title: "Clothing Category Showcase",
    slug: "clothing-category-showcase",
    category: "Products",
    status: "Published",
    views: 5420,
    clicks: 820,
    conversions: 145,
    createdAt: "2026-02-20",
    updatedAt: "2026-05-05",
    thumbnail: "https://placehold.co/80x50/8b5cf6/ffffff?text=CCS",
  },
  {
    id: "LP-1007",
    title: "Loyalty Points Reward",
    slug: "loyalty-points-reward",
    category: "Marketing",
    status: "Draft",
    views: 0,
    clicks: 0,
    conversions: 0,
    createdAt: "2026-05-20",
    updatedAt: "2026-05-20",
    thumbnail: "https://placehold.co/80x50/ec4899/ffffff?text=LPR",
  },
  {
    id: "LP-1008",
    title: "Monsoon Deals Extravaganza",
    slug: "monsoon-deals-extravaganza",
    category: "Seasonal",
    status: "Published",
    views: 9800,
    clicks: 1560,
    conversions: 312,
    createdAt: "2026-06-01",
    updatedAt: "2026-06-01",
    thumbnail: "https://placehold.co/80x50/0ea5e9/ffffff?text=MDE",
  },
  {
    id: "LP-1009",
    title: "Gift Cards Promotion",
    slug: "gift-cards-promotion",
    category: "Promotions",
    status: "Draft",
    views: 0,
    clicks: 0,
    conversions: 0,
    createdAt: "2025-12-10",
    updatedAt: "2026-01-15",
    thumbnail: "https://placehold.co/80x50/f43f5e/ffffff?text=GCP",
  },
  {
    id: "LP-1010",
    title: "Beauty & Skincare Hub",
    slug: "beauty-skincare-hub",
    category: "Products",
    status: "Published",
    views: 7600,
    clicks: 980,
    conversions: 210,
    createdAt: "2026-04-01",
    updatedAt: "2026-05-15",
    thumbnail: "https://placehold.co/80x50/d946ef/ffffff?text=BSH",
  },
  {
    id: "LP-1011",
    title: "Footwear Festival",
    slug: "footwear-festival",
    category: "Seasonal",
    status: "Draft",
    views: 0,
    clicks: 0,
    conversions: 0,
    createdAt: "2026-05-21",
    updatedAt: "2026-05-21",
    thumbnail: "https://placehold.co/80x50/14b8a6/ffffff?text=FF",
  },
  {
    id: "LP-1012",
    title: "Back to School Bundles",
    slug: "back-to-school-bundles",
    category: "Marketing",
    status: "Published",
    views: 11500,
    clicks: 2100,
    conversions: 445,
    createdAt: "2026-01-15",
    updatedAt: "2026-03-01",
    thumbnail: "https://placehold.co/80x50/f97316/ffffff?text=BSB",
  },
];

type PageRow = (typeof landingPages)[0];
type PageFilter = "All" | "Published" | "Draft";
const pageFilters: PageFilter[] = ["All", "Published", "Draft"];
const allCategories = [...new Set(landingPages.map((p) => p.category))];

/* ---- Columns ---- */

const columns: ColumnDef<PageRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all pages"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select page ${row.original.id}`}
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
    accessorFn: (row) => `${row.title} ${row.id} ${row.category} ${row.slug}`,
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
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium text-xs tabular-nums">{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: "Page",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-16 h-10 shrink-0 overflow-hidden rounded-md border bg-muted">
          <img src={row.original.thumbnail} alt={row.original.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="font-medium leading-none truncate max-w-[220px]">{row.original.title}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[220px]">/{row.original.slug}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">
        {row.original.category}
      </Badge>
    ),
  },
  {
    id: "statusBadge",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <Badge
          variant={s === "Published" ? "default" : "secondary"}
        >
          {s}
        </Badge>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground tabular-nums">{row.original.updatedAt}</span>
    ),
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

function RowActions({ row }: { row: PageRow }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-end">
            <Button aria-label="Open page actions" size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/landing-pages/${row.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/landing-pages/${row.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(`https://yourstore.com/${row.slug}`);
              toast.success("Link copied to clipboard.");
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
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
            <AlertDialogTitle>Delete "{row.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this landing page and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                toast.success(`"${row.title}" has been deleted successfully.`);
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

function exportToCSV(data: PageRow[]) {
  const headers = ["ID", "Title", "Slug", "Category", "Status", "Updated"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.id,
        `"${row.title}"`,
        row.slug,
        row.category,
        row.status,
        row.updatedAt,
      ].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "landing-pages.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function LandingPagesTable() {
  const [activeFilter, setActiveFilter] = React.useState<PageFilter>("All");
  const [rowSelection, setRowSelection] = React.useState({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: landingPages,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      columnVisibility: { search: false, status: false, categoryFilter: false },
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

  const filterLabel = activeFilter === "All" ? "All Pages" : `${activeFilter} Pages`;
  const countDescription =
    selectedCount > 0
      ? `${selectedCount} of ${totalCount} selected`
      : `${totalCount} landing pages`;

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
            onClick={() => exportToCSV(table.getFilteredRowModel().rows.map((r) => r.original))}
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
                placeholder="Search pages..."
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
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Category" />
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

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                const filter = value as PageFilter;
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
              {pageFilters.map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
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
                  <AlertDialogTitle>Delete {selectedCount} pages?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the selected landing pages and all associated data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      toast.success(`${selectedCount} landing pages have been deleted successfully.`);
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
                        <LayoutTemplate className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No landing pages found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search to find what you're looking for."
                            : activeFilter !== "All"
                              ? `No ${activeFilter.toLowerCase()} landing pages found.`
                              : "Start by creating your first landing page."}
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
            Viewing {table.getRowModel().rows.length} of {totalCount} pages
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
