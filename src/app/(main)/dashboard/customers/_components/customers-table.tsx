"use client";

import * as React from "react";
import Link from "next/link";
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
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Trash,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const customers = [
  { id: "CUS-1001", name: "Arham Khan", email: "arham@example.com", phone: "+880 1711-234567", totalOrders: 24, totalSpent: 12450, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=AK", joinDate: "2024-03-15" },
  { id: "CUS-1002", name: "Fatima Akter", email: "fatima@example.com", phone: "+880 1812-345678", totalOrders: 18, totalSpent: 8920, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=FA", joinDate: "2024-05-22" },
  { id: "CUS-1003", name: "Rahim Uddin", email: "rahim@example.com", phone: "+880 1913-456789", totalOrders: 3, totalSpent: 1250, status: "Guest", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=RU", joinDate: "2025-01-10" },
  { id: "CUS-1004", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+880 1614-567890", totalOrders: 42, totalSpent: 28750, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=NJ", joinDate: "2023-11-08" },
  { id: "CUS-1005", name: "Tanvir Hossain", email: "tanvir@example.com", phone: "+880 1515-678901", totalOrders: 7, totalSpent: 3680, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=TH", joinDate: "2024-09-01" },
  { id: "CUS-1006", name: "Sadia Rahman", email: "sadia@example.com", phone: "+880 1716-789012", totalOrders: 1, totalSpent: 580, status: "Guest", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=SR", joinDate: "2025-04-20" },
  { id: "CUS-1007", name: "Imran Haque", email: "imran@example.com", phone: "+880 1817-890123", totalOrders: 15, totalSpent: 9820, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=IH", joinDate: "2024-02-14" },
  { id: "CUS-1008", name: "Maliha Sultana", email: "maliha@example.com", phone: "+880 1918-901234", totalOrders: 31, totalSpent: 18500, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=MS", joinDate: "2024-01-05" },
  { id: "CUS-1009", name: "Rafiq Islam", email: "rafiq@example.com", phone: "+880 1619-012345", totalOrders: 1, totalSpent: 450, status: "Guest", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=RI", joinDate: "2025-03-12" },
  { id: "CUS-1010", name: "Ayesha Siddiqua", email: "ayesha@example.com", phone: "+880 1520-123456", totalOrders: 28, totalSpent: 15200, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=AS", joinDate: "2023-08-30" },
  { id: "CUS-1011", name: "Kamal Hossain", email: "kamal@example.com", phone: "+880 1721-234567", totalOrders: 9, totalSpent: 5430, status: "Registered", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=KH", joinDate: "2024-07-18" },
  { id: "CUS-1012", name: "Priya Das", email: "priya@example.com", phone: "+880 1822-345678", totalOrders: 2, totalSpent: 1200, status: "Guest", avatar: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=PD", joinDate: "2025-05-01" },
];

type CustomerRow = (typeof customers)[0];
type CustomerFilter = "All" | "Registered" | "Guest";
const customerFilters: CustomerFilter[] = ["All", "Registered", "Guest"];

/* ---- Columns ---- */

const columns: ColumnDef<CustomerRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all customers"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select customer ${row.original.id}`}
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
    accessorFn: (row) => `${row.name} ${row.id} ${row.email} ${row.phone}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "status",
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
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
          <img src={row.original.avatar} alt={row.original.name} className="size-full object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <Link href={`/dashboard/customers/${row.original.id}`} className="font-medium leading-none hover:underline text-primary">
            {row.original.name}
          </Link>
          <div className="text-muted-foreground text-xs">{row.original.phone}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">{row.original.totalOrders}</span>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">৳{row.original.totalSpent.toLocaleString()}</span>
    ),
  },
  {
    id: "statusBadge",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <Badge variant={s === "Registered" ? "default" : "outline"}>
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

function RowActions({ row }: { row: CustomerRow }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/customers/${row.id}`}>
              <Eye className="mr-2 size-4" />View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.success(`Customer ${row.name} deleted.`)}>
            <Trash className="mr-2 size-4" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ---- CSV Export ---- */

function exportToExcel(data: CustomerRow[]) {
  const headers = ["ID", "Name", "Email", "Phone", "Total Orders", "Total Spent", "Status", "Join Date"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [row.id, `"${row.name}"`, `"${row.email}"`, `"${row.phone}"`, row.totalOrders, row.totalSpent, row.status, row.joinDate].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "customers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- Main Table Component ---- */

export function CustomersTable() {
  const [activeFilter, setActiveFilter] = React.useState<CustomerFilter>("All");
  const [rowSelection, setRowSelection] = React.useState({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      columnVisibility: { search: false, status: false },
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

  const filterLabel = activeFilter === "All" ? "All Customers" : `${activeFilter} Customers`;
  const countDescription = selectedCount > 0
    ? `${selectedCount} of ${totalCount} selected`
    : `${totalCount} customers`;

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

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                const filter = value as CustomerFilter;
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
              {customerFilters.map((filter) => (
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
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    className="capitalize"
                    onClick={() => col.toggleVisibility(!col.getIsVisible())}
                  >
                    <Checkbox checked={col.getIsVisible()} className="mr-2" />
                    {col.id}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bulk delete bar */}
        {selectedCount > 0 && (
          <div className="mx-4 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
            <span className="text-sm font-medium">{selectedCount} customer(s) selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
                Clear
              </Button>
              <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash className="mr-2 size-4" />Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Delete {selectedCount} customer(s)?</DialogTitle>
                  <DialogDescription>This action cannot be undone. The selected customers will be permanently removed.</DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button variant="destructive" onClick={() => { toast.success(`${selectedCount} customer(s) deleted.`); setRowSelection({}); setBulkDeleteOpen(false); }}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

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
