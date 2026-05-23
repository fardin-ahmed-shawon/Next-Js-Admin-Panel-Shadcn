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
  ArrowUpDown,
  Ban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Ellipsis,
  Eye,
  FileDown,
  FileText,
  Filter,
  MoreHorizontal,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldOff,
  Trash2,
  Truck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ProductsModal } from "./products-modal";
import { UpdatePaymentModal } from "./update-payment-modal";

/* ---- Data ---- */

const orderStatuses = [
  "All",
  "Pending",
  "Confirmed",
  "Ready To Ship",
  "In-Courier",
  "Ship Later",
  "Hold",
  "Returned",
  "Pre-Order",
  "Delivered",
  "Cancelled",
  "Missing",
  "Lost",
  "Fake",
  "Trash",
] as const;
const paymentStatuses = ["All", "Full Paid", "Unpaid", "Partially Paid", "Refund"] as const;

const mainCategories = ["All", "Electronics", "Clothing", "Accessories", "Footwear", "Beauty", "Home"];
const subCategories: Record<string, string[]> = {
  Electronics: ["Smartphones", "Laptops", "Earbuds", "Watches"],
  Clothing: ["T-Shirts", "Jeans", "Polo Shirts", "Jackets"],
  Accessories: ["Bags", "Wallets", "Belts"],
  Footwear: ["Sneakers", "Sandals", "Boots"],
  Beauty: ["Skincare", "Makeup", "Fragrance"],
  Home: ["Bottles", "Lamps", "Decor"],
};

type OrderStatus = (typeof orderStatuses)[number];
type PaymentStatus = (typeof paymentStatuses)[number];

export interface OrderRow {
  id: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  date: string;
  avatar: string;
  category: string;
  subCategory: string;
  orderType: string;
  time: string;
  paid: number;
  due: number;
  paymentMethod: string;
  productImages: string[];
  parcelStatus: string;
  courier: string;
  parcelHistory: { total: number; delivered: number; cancelled: number; successRate: string };
}

/* ---- Status badge colors ---- */

function orderStatusVariant(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (["Delivered"].includes(s)) return "default";
  if (["Cancelled", "Fake", "Trash", "Lost"].includes(s)) return "destructive";
  if (["Pending", "Hold", "Ship Later", "Missing"].includes(s)) return "outline";
  return "secondary";
}

function paymentBadge(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (s === "Full Paid") return "default";
  if (s === "Refund") return "destructive";
  if (s === "Partially Paid") return "secondary";
  return "outline";
}

/* ---- Columns ---- */

function PaymentStatusCell({ row }: { row: any }) {
  const [status, setStatus] = React.useState(row.original.paymentStatus);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <Select
        value={status}
        onValueChange={(val) => {
          setStatus(val);
          if (val !== "Partially Paid") {
            toast.success(`Order ${row.original.id} payment → ${val}`);
          }
        }}
      >
        <SelectTrigger className="h-7 w-[130px] text-xs border-border/60 rounded-md px-2 gap-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {paymentStatuses
            .filter((s) => s !== "All")
            .map((s) => (
              <SelectItem
                key={s}
                value={s}
                className="text-xs"
                onPointerUp={() => {
                  if (s === "Partially Paid") {
                    setModalOpen(true);
                  }
                }}
              >
                {s}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <UpdatePaymentModal
        order={{ ...row.original, paymentStatus: status }}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

function ProductsCell({ row }: { row: any }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  return (
    <>
      <div
        className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity w-fit"
        onClick={() => setModalOpen(true)}
        title="View all products"
      >
        {row.original.productImages.slice(0, 3).map((img: string, i: number) => (
          <div key={i} className="size-8 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted">
            <img src={img} alt="" className="size-full object-cover" />
          </div>
        ))}
        {row.original.productImages.length > 3 && (
          <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
            +{row.original.productImages.length - 3}
          </div>
        )}
      </div>
      <ProductsModal order={row.original} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

const columns: ColumnDef<OrderRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />,
    enableSorting: false,
    enableHiding: false,
  },
  // Hidden filter columns
  {
    id: "search",
    accessorFn: (r) => `${r.customer} ${r.id} ${r.phone}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  { accessorKey: "orderStatus", filterFn: "equals", enableHiding: true },
  { accessorKey: "paymentStatus", filterFn: "equals", enableHiding: true },
  { accessorKey: "category", filterFn: "equals", enableHiding: true },
  { accessorKey: "subCategory", filterFn: "equals", enableHiding: true },

  // Orders column
  {
    id: "order",
    header: "Orders",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-mono text-sm font-semibold">{row.original.id}</p>
        <p className="text-[11px] text-muted-foreground">
          {row.original.date} · {row.original.time}
        </p>
      </div>
    ),
  },

  // Customer column
  {
    id: "customerInfo",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="size-8 shrink-0 overflow-hidden rounded-full border bg-muted">
          <img src={row.original.avatar} alt="" className="size-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-medium leading-tight">{row.original.customer}</p>
          <p className="text-[11px] text-muted-foreground">{row.original.phone}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 h-6 gap-1 text-[10px] px-2"
            onClick={() => {
              navigator.clipboard.writeText(row.original.phone);
              toast.success("Phone copied!");
            }}
          >
            <Phone className="size-3" /> Call
          </Button>
        </div>
      </div>
    ),
  },

  // Payment info column
  {
    id: "paymentInfo",
    header: "Payment",
    cell: ({ row }) => (
      <div className="min-w-[110px] space-y-0.5">
        <Badge variant="outline" className="text-[10px] h-5 mb-1">
          {row.original.paymentMethod}
        </Badge>
        <p className="text-[11px]">
          Total: <span className="font-semibold tabular-nums">৳{row.original.total.toLocaleString()}</span>
        </p>
        <p className="text-[11px] text-emerald-600">
          Paid: <span className="font-semibold tabular-nums">৳{row.original.paid.toLocaleString()}</span>
        </p>
        <p className="text-[11px] text-destructive">
          Due: <span className="font-semibold tabular-nums">৳{row.original.due.toLocaleString()}</span>
        </p>
      </div>
    ),
  },

  // Products column
  { id: "products", header: "Products", cell: ({ row }) => <ProductsCell row={row} /> },

  // Parcel History column
  {
    id: "parcel",
    header: "Parcel History",
    cell: ({ row }) => (
      <div className="min-w-[120px] text-[11px] space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold tabular-nums">{row.original.parcelHistory.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivered:</span>
          <span className="font-semibold tabular-nums">{row.original.parcelHistory.delivered}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cancelled:</span>
          <span className="font-semibold tabular-nums">{row.original.parcelHistory.cancelled}</span>
        </div>
        <div className="font-semibold text-emerald-600 mt-1">{row.original.parcelHistory.successRate}% success</div>
      </div>
    ),
  },

  // Order Status column
  {
    id: "oStatus",
    header: "Order Status",
    cell: ({ row }) => (
      <Select
        defaultValue={row.original.orderStatus}
        onValueChange={(val) => toast.success(`Order ${row.original.id} status → ${val}`)}
      >
        <SelectTrigger className="h-7 w-[140px] text-xs border-border/60 rounded-md px-2 gap-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {orderStatuses
            .filter((s) => s !== "All")
            .map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {status}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    ),
  },

  // Payment Status column
  { id: "pStatus", header: "Payment Status", cell: ({ row }) => <PaymentStatusCell row={row} /> },

  // Send Courier column
  {
    id: "sendCourier",
    header: "Send Courier",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1.5 w-[100px]">
        <Button
          size="sm"
          className="h-7 bg-[#00b074] hover:bg-[#00b074]/90 text-white text-[11px] px-2 justify-start font-medium"
          onClick={() => toast.success(`Order ${row.original.id} sent to Steadfast`)}
        >
          <Truck className="mr-1.5 size-3.5" /> Steadfast
        </Button>
        <Button
          size="sm"
          className="h-7 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-[11px] px-2 justify-start font-medium"
          onClick={() => toast.success(`Order ${row.original.id} sent to Pathao`)}
        >
          <Truck className="mr-1.5 size-3.5" /> Pathao
        </Button>
      </div>
    ),
  },

  // Print Invoice column
  {
    id: "printInvoice",
    header: "Print Invoice",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8 border-muted-foreground/30 text-muted-foreground"
          onClick={() => toast.success(`A4 Invoice generated for ${row.original.id}`)}
          title="Regular A4"
        >
          <FileText className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8 border-muted-foreground/30 text-muted-foreground"
          onClick={() => toast.success(`POS Invoice generated for ${row.original.id}`)}
          title="POS Receipt"
        >
          <Printer className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          onClick={() => toast.success(`Parcel Invoice generated for ${row.original.id}`)}
          title="Parcel Invoice"
        >
          <Truck className="size-4" />
        </Button>
      </div>
    ),
  },

  // Actions column
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${row.original.id}`}>
                <Eye className="mr-2 size-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${row.original.id}/edit`}>
                <Edit className="mr-2 size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.warning(`Customer ${row.original.customer} blocked.`)}>
              <Ban className="mr-2 size-4" />
              Block
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => toast.success(`Order ${row.original.id} deleted.`)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

/* ---- Export ---- */

function exportOrders(data: OrderRow[]) {
  const h = [
    "Order ID",
    "Customer",
    "Phone",
    "Items",
    "Total",
    "Paid",
    "Due",
    "Order Status",
    "Payment Status",
    "Payment Method",
    "Date",
  ];
  const rows = [
    h.join(","),
    ...data.map((r) =>
      [
        r.id,
        `"${r.customer}"`,
        `"${r.phone}"`,
        r.items,
        r.total,
        r.paid,
        r.due,
        r.orderStatus,
        r.paymentStatus,
        r.paymentMethod,
        r.date,
      ].join(","),
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---- Component ---- */

export function OrdersTable({ data }: { data: OrderRow[] }) {
  const [activeOrderFilter, setActiveOrderFilter] = React.useState<OrderStatus>("All");
  const [activePaymentFilter, setActivePaymentFilter] = React.useState<PaymentStatus>("All");
  const [activeCatFilter, setActiveCatFilter] = React.useState("All");
  const [activeSubCatFilter, setActiveSubCatFilter] = React.useState("All");
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);
  const [showStatusFilter, setShowStatusFilter] = React.useState(true);
  const [showPaymentFilter, setShowPaymentFilter] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      pagination,
      columnVisibility: {
        search: false,
        orderStatus: false,
        paymentStatus: false,
        category: false,
        subCategory: false,
      },
    },
    getRowId: (r) => r.id,
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

  const orderStatusCounts = React.useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((o) => {
      c[o.orderStatus] = (c[o.orderStatus] || 0) + 1;
    });
    return c;
  }, [data]);
  const paymentStatusCounts = React.useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((o) => {
      c[o.paymentStatus] = (c[o.paymentStatus] || 0) + 1;
    });
    return c;
  }, [data]);

  function applyOrderFilter(v: string) {
    setActiveOrderFilter(v as OrderStatus);
    table.getColumn("orderStatus")?.setFilterValue(v === "All" ? undefined : v);
    table.setPageIndex(0);
    setRowSelection({});
  }
  function applyPaymentFilter(v: string) {
    setActivePaymentFilter(v as PaymentStatus);
    table.getColumn("paymentStatus")?.setFilterValue(v === "All" ? undefined : v);
    table.setPageIndex(0);
    setRowSelection({});
  }
  function applyCatFilter(v: string) {
    setActiveCatFilter(v);
    setActiveSubCatFilter("All");
    table.getColumn("category")?.setFilterValue(v === "All" ? undefined : v);
    table.getColumn("subCategory")?.setFilterValue(undefined);
    table.setPageIndex(0);
    setRowSelection({});
  }
  function applySubCatFilter(v: string) {
    setActiveSubCatFilter(v);
    table.getColumn("subCategory")?.setFilterValue(v === "All" ? undefined : v);
    table.setPageIndex(0);
    setRowSelection({});
  }
  function clearAllFilters() {
    setActiveOrderFilter("All");
    setActivePaymentFilter("All");
    setActiveCatFilter("All");
    setActiveSubCatFilter("All");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setRowSelection({});
    table.getColumn("search")?.setFilterValue(undefined);
  }

  const availableSubs = activeCatFilter !== "All" ? subCategories[activeCatFilter] || [] : [];
  const hasFilters =
    activeOrderFilter !== "All" || activePaymentFilter !== "All" || activeCatFilter !== "All" || searchQuery;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Order Management</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} orders`}
        </CardDescription>
        <CardAction>
          {/* Export button — always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportOrders(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Toolbar: Search + Categories + Sort */}
        <div className="flex flex-wrap items-center gap-3 px-4">
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 w-full sm:w-52 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                table.getColumn("search")?.setFilterValue(e.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </div>
          <Select value={activeCatFilter} onValueChange={applyCatFilter}>
            <SelectTrigger className="h-8 w-[calc(50%-0.375rem)] sm:w-36 text-xs">
              <SelectValue placeholder="Main Category" />
            </SelectTrigger>
            <SelectContent>
              {mainCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availableSubs.length > 0 && (
            <Select value={activeSubCatFilter} onValueChange={applySubCatFilter}>
              <SelectTrigger className="h-8 w-[calc(50%-0.375rem)] sm:w-36 text-xs">
                <SelectValue placeholder="Sub Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {availableSubs.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="icon-sm"
              variant={showFiltersMobile ? "secondary" : "outline"}
              className="sm:hidden"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            >
              <Filter className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              className={showFiltersMobile ? "flex" : "hidden sm:flex"}
              onClick={() => table.getColumn("total")?.toggleSorting(table.getColumn("total")?.getIsSorted() === "asc")}
              title="Sort by Total"
            >
              <ArrowUpDown />
            </Button>
          </div>
        </div>

        {/* Advanced Filters (Hidden on mobile by default) */}
        <div className={`flex-col gap-3 ${showFiltersMobile ? "flex" : "hidden sm:flex"}`}>
          {/* Order Status Filter */}
          <div className="flex flex-col gap-2 px-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground shrink-0">
                Status:
              </span>
              <Button
                size="icon-sm"
                variant={showStatusFilter ? "ghost" : "outline"}
                className="h-6 w-6"
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                title={showStatusFilter ? "Hide Status Filters" : "Show Status Filters"}
              >
                <ChevronDown className={`size-3.5 transition-transform ${showStatusFilter ? "" : "-rotate-90"}`} />
              </Button>
            </div>
            {showStatusFilter && (
              <div className="flex flex-wrap gap-2">
                {orderStatuses.map((s) => (
                  <Button
                    key={s}
                    variant={activeOrderFilter === s ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => applyOrderFilter(s)}
                  >
                    {s} {s === "All" ? `(${data.length})` : orderStatusCounts[s] ? `(${orderStatusCounts[s]})` : "(0)"}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status Filter */}
          <div className="flex flex-col gap-2 px-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground shrink-0">
                Payment:
              </span>
              <Button
                size="icon-sm"
                variant={showPaymentFilter ? "ghost" : "outline"}
                className="h-6 w-6"
                onClick={() => setShowPaymentFilter(!showPaymentFilter)}
                title={showPaymentFilter ? "Hide Payment Filters" : "Show Payment Filters"}
              >
                <ChevronDown className={`size-3.5 transition-transform ${showPaymentFilter ? "" : "-rotate-90"}`} />
              </Button>
            </div>
            {showPaymentFilter && (
              <div className="flex flex-wrap gap-2">
                {paymentStatuses.map((s) => (
                  <Button
                    key={s}
                    variant={activePaymentFilter === s ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => applyPaymentFilter(s)}
                  >
                    {s}{" "}
                    {s === "All" ? `(${data.length})` : paymentStatusCounts[s] ? `(${paymentStatusCounts[s]})` : "(0)"}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk action row — appears below pay filter when rows selected */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 px-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-medium text-muted-foreground shrink-0">{selectedCount} selected:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="h-7 gap-1.5 text-xs relative">
                  <Ellipsis className="size-3.5" />
                  Bulk Actions
                  <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {selectedCount > 9 ? "9+" : selectedCount}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {selectedCount} order{selectedCount > 1 ? "s" : ""} selected
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setRowSelection({})}>
                    <Ban className="mr-2 size-4" />
                    Clear Selection
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      toast.success(`${selectedCount} order(s) deleted.`);
                      setRowSelection({});
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Bulk Update</DropdownMenuLabel>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ChevronDown className="mr-2 size-4" />
                      Order Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-44">
                      {orderStatuses
                        .filter((s) => s !== "All")
                        .map((s) => (
                          <DropdownMenuItem key={s} onClick={() => toast.success(`Bulk order status → ${s}`)}>
                            {s}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ChevronDown className="mr-2 size-4" />
                      Payment Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-44">
                      {paymentStatuses
                        .filter((s) => s !== "All")
                        .map((s) => (
                          <DropdownMenuItem key={s} onClick={() => toast.success(`Bulk payment status → ${s}`)}>
                            {s}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Bulk Print</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => toast.success("Printing all A4 invoices…")}>
                    <FileText className="mr-2 size-4" />
                    Print A4 Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Printing all parcel invoices…")}>
                    <Printer className="mr-2 size-4" />
                    Print Parcel Invoice
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                      <p className="text-sm font-medium">No orders found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pb-2">
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
                {[5, 10, 20, 50].map((s) => (
                  <SelectItem key={s} value={`${s}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
