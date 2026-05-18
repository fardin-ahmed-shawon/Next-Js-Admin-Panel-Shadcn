"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Download,
  Medal,
  Award,
  Search,
  Trophy,
  UserX,
} from "lucide-react";

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

const allBestCustomers = [
  { rank: 1, name: "Nusrat Jahan", email: "nusrat@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NJ", orders: 127, spent: 84500, period: "all" as const },
  { rank: 2, name: "Maliha Sultana", email: "maliha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MS", orders: 98, spent: 62300, period: "all" as const },
  { rank: 3, name: "Ayesha Siddiqua", email: "ayesha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AS", orders: 85, spent: 51200, period: "all" as const },
  { rank: 4, name: "Arham Khan", email: "arham@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AK", orders: 72, spent: 43800, period: "all" as const },
  { rank: 5, name: "Imran Haque", email: "imran@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=IH", orders: 64, spent: 38900, period: "all" as const },
  { rank: 6, name: "Fatima Akter", email: "fatima@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=FA", orders: 58, spent: 32100, period: "all" as const },
  { rank: 7, name: "Kamal Hossain", email: "kamal@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=KH", orders: 45, spent: 27600, period: "all" as const },
  { rank: 8, name: "Tanvir Hossain", email: "tanvir@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=TH", orders: 39, spent: 21400, period: "all" as const },
  { rank: 9, name: "Priya Das", email: "priya@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=PD", orders: 31, spent: 18900, period: "all" as const },
  { rank: 10, name: "Rahim Uddin", email: "rahim@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RU", orders: 22, spent: 12500, period: "all" as const },
  { rank: 11, name: "Sadia Rahman", email: "sadia@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=SR", orders: 19, spent: 10200, period: "all" as const },
  { rank: 12, name: "Rafiq Islam", email: "rafiq@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RI", orders: 14, spent: 8750, period: "all" as const },
  { rank: 13, name: "Habibur Rahman", email: "habib@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=HR", orders: 11, spent: 6400, period: "all" as const },
  { rank: 14, name: "Nasir Uddin", email: "nasir@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NU", orders: 8, spent: 4200, period: "all" as const },
  { rank: 15, name: "Shahid Mia", email: "shahid@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=SM", orders: 5, spent: 2800, period: "all" as const },
];

type BestCustomerRow = (typeof allBestCustomers)[0];
type PeriodFilter = "All" | "Monthly" | "Yearly";
const periodFilters: PeriodFilter[] = ["All", "Monthly", "Yearly"];

/* ---- Rank Icon ---- */

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="size-4 text-amber-500" />;
  if (rank === 2) return <Medal className="size-4 text-slate-400" />;
  if (rank === 3) return <Award className="size-4 text-amber-700" />;
  return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
}

/* ---- Columns ---- */

const columns: ColumnDef<BestCustomerRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.name} ${row.email}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => (
      <div className="flex items-center justify-center size-7">
        <RankBadge rank={row.original.rank} />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 overflow-hidden rounded-full border bg-muted">
          <img src={row.original.avatar} alt={row.original.name} className="size-full object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="font-medium leading-none text-sm">{row.original.name}</div>
          <div className="text-muted-foreground text-xs">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">{row.original.orders}</span>
    ),
  },
  {
    accessorKey: "spent",
    header: "Total Spent",
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold text-primary">৳{row.original.spent.toLocaleString()}</span>
    ),
  },
  {
    id: "tier",
    header: "Tier",
    cell: ({ row }) => {
      const s = row.original.spent;
      if (s >= 50000) return <Badge variant="default">Platinum</Badge>;
      if (s >= 20000) return <Badge variant="secondary">Gold</Badge>;
      if (s >= 10000) return <Badge variant="outline">Silver</Badge>;
      return <Badge variant="outline">Bronze</Badge>;
    },
  },
];

/* ---- CSV Export ---- */

function exportBestCustomers(data: BestCustomerRow[]) {
  const headers = ["Rank", "Name", "Email", "Orders", "Total Spent"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [row.rank, `"${row.name}"`, `"${row.email}"`, row.orders, row.spent].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "best-customers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Component ---- */

export function BestCustomersTable() {
  const [activeFilter, setActiveFilter] = React.useState<PeriodFilter>("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "spent", desc: true }]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const table = useReactTable({
    data: allBestCustomers,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false },
      pagination,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-5 text-amber-500" />
          Best Customers
        </CardTitle>
        <CardDescription>
          Top customers ranked by total spent &middot; {totalCount} customers
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportBestCustomers(table.getFilteredRowModel().rows.map((r) => r.original))}
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
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                setActiveFilter(value as PeriodFilter);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeFilter}
            >
              {periodFilters.map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => table.getColumn("spent")?.toggleSorting(table.getColumn("spent")?.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                        <UserX className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No customers found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
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
            <Select value={`${pagination.pageSize}`} onValueChange={(v) => setPagination((p) => ({ ...p, pageSize: Number(v), pageIndex: 0 }))}>
              <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button size="icon-sm" variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
