"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { fetchClient } from "@/lib/fetch-client";

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
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  RefreshCcw,
  Search,
  Truck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSteadfastParcels } from "@/hooks/useSteadfastParcels";

type ParcelRow = {
  id: number;
  order_no: string;
  consignment_id: number;
  tracking_code: string;
  status: string;
  parcel_status: string;
  created_at: string;
  order: {
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    grand_total_amount: string | number;
    payment_method: string;
    payment_status: string;
    order_status: string;
  } | null;
};

const columns: ColumnDef<ParcelRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all orders"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select order ${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "order_no",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">{row.original.order_no}</span>,
  },
  {
    accessorKey: "tracking_code",
    header: "Tracking",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{row.original.tracking_code}</span>
        {row.original.consignment_id && (
          <span className="text-muted-foreground text-xs">ID: {row.original.consignment_id}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original.order;
      if (!order) return <span className="text-muted-foreground">N/A</span>;
      
      const initials = (order.customer_full_name || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-full bg-slate-900 border-0">
            <AvatarFallback className="bg-slate-900 text-white text-xs font-medium border-0">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm leading-none">{order.customer_full_name}</span>
            <span className="text-muted-foreground text-xs">{order.customer_phone}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const order = row.original.order;
      if (!order) return "N/A";
      return <span>৳{Number(order.grand_total_amount).toLocaleString()}</span>;
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.original.order?.payment_status || "Unknown";
      return <Badge variant={status === "Full Paid" ? "default" : "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.original.created_at;
      const dateObj = new Date(dateStr);
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric'})}</span>
          <span className="text-muted-foreground text-xs">{dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit'})}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.original.order?.order_status || "Unknown";
      return (
        <Badge
          variant="outline"
          className={
            status === "Delivered"
              ? "border-green-500 text-green-600"
              : status === "Cancelled" || status === "Returned"
                ? "border-red-500 text-red-600"
                : "border-blue-500 text-blue-600"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "parcelStatus",
    header: "Parcel Status",
    cell: ({ row }) => {
      const status = row.original.parcel_status || row.original.status || "pending";
      return (
        <Badge
          variant="outline"
          className={
            status === "delivered"
              ? "border-green-500 text-green-600"
              : status === "cancelled"
                ? "border-red-500 text-red-600"
                : status === "returned" || status === "in_return"
                  ? "border-orange-500 text-orange-600"
                  : status === "delivered_approval_pending" || status === "partial_delivered_approval_pending" || status === "unknown_approval_pending"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-blue-500 text-blue-600"
          }
        >
          {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
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

function RowActions({ row }: { row: ParcelRow }) {
  const handleCheckStatus = async () => {
    const toastId = toast.loading("Checking parcel status...");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
      const res = await fetchClient(`${baseUrl}${endpoint}/${row.order_no}/status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || "Failed to fetch status.");
      }
      const data = await res.json();
      const statusText = data?.data?.delivery_status || "Unknown";
      toast.success(`Current Status: ${statusText.replace(/_/g, " ").toUpperCase()}`, { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong.", { id: toastId });
    }
  };

  const handleReturnRequest = async () => {
    if (!confirm("Are you sure you want to create a return request for this parcel?")) return;
    const toastId = toast.loading("Creating return request...");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
      const res = await fetchClient(`${baseUrl}${endpoint}/${row.order_no}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Requested from Admin Panel" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || "Failed to create return request.");
      }
      toast.success("Return request created successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong.", { id: toastId });
    }
  };

  return (
    <div className="flex w-full justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCheckStatus} className="cursor-pointer">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Check Status
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/orders/${row.order_no}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Order
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReturnRequest} className="text-red-600 cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            Send Return Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SteadfastTable() {
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: apiData, isLoading } = useSteadfastParcels({
    page: pageIndex + 1,
    per_page: pageSize,
    search: debouncedSearch || undefined,
  });

  const parcelsData = Array.isArray(apiData?.data?.data) ? apiData.data.data : (Array.isArray(apiData?.data) ? apiData.data : []);
  const meta = apiData?.data || {};
  const totalCount = meta?.total || parcelsData.length || 0;
  const pageCount = meta?.last_page || 1;

  const table = useReactTable({
    data: parcelsData,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageCount,
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Parcels</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalCount > 0 ? `${totalCount} parcels` : "No parcels"}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
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
                placeholder="Search order no or tracking..."
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPageIndex(0);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.getColumn("order_no")?.toggleSorting(table.getColumn("order_no")?.getIsSorted() === "asc")}
            >
              <ArrowUpDown className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="outline">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuLabel className="text-xs">Bulk Actions</DropdownMenuLabel>
                <DropdownMenuItem disabled={selectedCount === 0}>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Export Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5 min-w-[800px]">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading parcels...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No parcels found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchInput
                            ? "Try adjusting your search to find what you're looking for."
                            : "There are no parcels available right now."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Viewing {table.getRowModel().rows.length} of {totalCount} parcels
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
