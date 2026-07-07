"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { fetchClient } from "@/lib/fetch-client";
import { pathaoService } from "@/services/pathao";

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
  Undo2,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePathaoParcels } from "@/hooks/usePathaoParcels";

type ParcelRow = {
  id: number;
  invoice_no: string;
  consignment_id: string;
  parcel_status: string;
  delivery_fee: number;
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
    accessorKey: "invoice_no",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">{row.original.invoice_no}</span>,
  },
  {
    accessorKey: "consignment_id",
    header: "Consignment ID",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{row.original.consignment_id}</span>
        {row.original.delivery_fee > 0 && (
          <span className="text-muted-foreground text-xs">Fee: ৳{row.original.delivery_fee}</span>
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
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.original.order?.payment_status || "Unknown";
      return <Badge variant={status === "Full Paid" || status === "Paid" ? "default" : "secondary"}>{status}</Badge>;
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
          <span className="font-medium text-sm">
            {dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <span className="text-muted-foreground text-xs">
            {dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
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
    accessorKey: "parcel_status",
    header: "Parcel Status",
    cell: ({ row }) => {
      const status = row.original.parcel_status || "pending";
      return (
        <Badge
          variant="outline"
          className={
            status === "delivered"
              ? "border-green-500 text-green-600"
              : status === "cancelled" || status === "failed"
                ? "border-red-500 text-red-600"
                : status === "returned" || status === "return"
                  ? "border-orange-500 text-orange-600"
                  : "border-blue-500 text-blue-600"
          }
        >
          {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
  },
  {
    id: "courierPayStatus",
    header: "Courier Pay Status",
    cell: ({ row }) => <CourierPayStatusCell invoiceNo={row.original.invoice_no} />,
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">Actions</div>,
    cell: ({ row }) => <RowActions row={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];

function CourierPayStatusCell({ invoiceNo }: { invoiceNo: string }) {
  const [payInfo, setPayInfo] = React.useState<{ invoiceId: string | null; paymentStatus: string | null } | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await pathaoService.checkStatus(invoiceNo);
        if (!isMounted) return;
        // Handle both possible structures safely
        const nestedData = res?.data?.data || res?.data || res;
        const invoiceId = nestedData?.invoice_id || null;
        const paymentStatus = nestedData?.payment_status || null;
        setPayInfo({ invoiceId, paymentStatus });
      } catch (err) {
        if (!isMounted) return;
        setPayInfo({ invoiceId: null, paymentStatus: "Error" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [invoiceNo]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1">
        <Loader2 className="size-3 animate-spin text-primary shrink-0" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!payInfo) return <span className="text-xs text-muted-foreground">—</span>;

  const { invoiceId, paymentStatus } = payInfo;
  const formattedStatus = paymentStatus ? paymentStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : null;

  return (
    <div className="flex flex-col gap-1 max-w-[130px] py-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Inv:</span>
        <span className="text-xs font-mono font-medium truncate max-w-[90px]" title={invoiceId || "Not generated"}>
          {invoiceId || "—"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Pay:</span>
        {formattedStatus ? (
          <Badge
            variant="outline"
            className={`text-[9px] font-bold px-1 py-0 rounded border ${
              formattedStatus.toLowerCase().includes("paid")
                ? "border-green-500/30 text-green-600 bg-green-500/5 hover:bg-green-500/10"
                : formattedStatus.toLowerCase().includes("cancel") || formattedStatus.toLowerCase().includes("fail") || formattedStatus.toLowerCase().includes("refund")
                  ? "border-red-500/30 text-red-600 bg-red-500/5 hover:bg-red-500/10"
                  : "border-amber-500/30 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"
            }`}
          >
            {formattedStatus}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

function RowActions({ row }: { row: ParcelRow }) {
  const handleCheckStatus = async () => {
    const toastId = toast.loading("Checking parcel status...");
    try {
      const data = await pathaoService.checkStatus(row.invoice_no);
      const statusText = data?.data?.order_status || data?.data?.delivery_status || "Unknown";
      toast.success(`Current Status: ${statusText.replace(/_/g, " ").toUpperCase()}`, { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong.", { id: toastId });
    }
  };

  const handleMarkAsReturned = async () => {
    if (!confirm(`Are you sure you want to mark order ${row.invoice_no} as returned?`)) return;
    const toastId = toast.loading(`Marking order ${row.invoice_no} as returned...`);
    try {
      await pathaoService.markReturned(row.invoice_no);
      toast.success(`Order ${row.invoice_no} marked as returned!`, { id: toastId });
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "An error occurred.", { id: toastId });
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
            <Link href={`/dashboard/orders/${row.invoice_no}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Order
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleMarkAsReturned} className="text-orange-600 cursor-pointer">
            <Undo2 className="mr-2 h-4 w-4" />
            Mark Returned
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function PathaoTable() {
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

  const { data: apiData, isLoading } = usePathaoParcels({
    page: pageIndex + 1,
    limit: pageSize,
    search: debouncedSearch || undefined,
  });

  const parcelsData = Array.isArray(apiData?.data?.data)
    ? apiData.data.data
    : Array.isArray(apiData?.data)
      ? apiData.data
      : [];
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
      if (typeof updater === "function") {
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
        <CardTitle className="font-normal text-muted-foreground text-sm">Pathao Parcels</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : totalCount > 0 ? (
            `${totalCount} parcels`
          ) : (
            "No parcels"
          )}
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
                placeholder="Search order ID or consignment..."
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
              onClick={() =>
                table.getColumn("invoice_no")?.toggleSorting(table.getColumn("invoice_no")?.getIsSorted() === "asc")
              }
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
                  <TableCell colSpan={columns.length} className="h-auto p-0">
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
                  <TableCell colSpan={columns.length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No parcels found</p>
                        <p className="text-muted-foreground text-xs">
                          Orders sent to Pathao will be listed here.
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
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <div className="text-muted-foreground text-xs tabular-nums">
            {selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `Total ${totalCount} parcels`}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs whitespace-nowrap">Rows per page</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val: string) => {
                  setPageSize(Number(val));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-7.5 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10", "20", "50", "100"].map((size) => (
                    <SelectItem key={size} value={size} className="text-xs">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <span className="text-xs text-muted-foreground min-w-[70px] text-center">
                Page {pageIndex + 1} of {pageCount}
              </span>

              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPageIndex(pageCount - 1)}
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
