"use client";

import { ExcelExportButton } from "@/components/excel-export-button";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Search,
  ExternalLink,
  Truck,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpDown,
  Calendar,
  AlertTriangle,
  User,
  Filter,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatOrderDateTime, getImageUrl, parseDateTime } from "@/lib/utils";
import {
  OrderStatusPills,
  PaymentStatusPills,
  OrderStatusBadge,
  VALID_ORDER_STATUSES,
  VALID_PAYMENT_STATUSES,
} from "./order-status-pills";
import { TablePagination } from "./table-pagination";

interface CustomerOrdersTableProps {
  orders: any[];
  customerId: number | string;
  customerPrimaryName?: string;
}

export function CustomerOrdersTable({
  orders = [],
  customerId,
  customerPrimaryName = "",
}: CustomerOrdersTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [paymentFilter, setPaymentFilter] = React.useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = React.useState("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "paid-desc" | "due-desc">("date-desc");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Status counts for order status pills
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: orders.length };
    orders.forEach((o) => {
      const s = o.order_status;
      if (s) {
        counts[s] = (counts[s] || 0) + 1;
      }
      if (o.is_partial_return && s !== "Partial") {
        counts["Partial"] = (counts["Partial"] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  // Payment status counts for payment status pills
  const paymentStatusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      All: orders.length,
      "Full Paid": 0,
      "Partially Paid": 0,
      Unpaid: 0,
      Refund: 0,
    };

    orders.forEach((o) => {
      const p = (o.payment_status || "").toLowerCase();
      const paid = Number(o.paid_amount || 0);
      const total = Number(o.grand_total_amount || 0);

      const isFullPaid = (paid >= total && total > 0) || p === "full paid" || p === "paid";
      const isPartialPaid = (paid > 0 && paid < total) || p === "partially paid" || p === "partial paid" || p === "partial";
      const isRefund = p === "refund" || p === "refunded";

      if (isFullPaid) {
        counts["Full Paid"]++;
      } else if (isPartialPaid) {
        counts["Partially Paid"]++;
      } else if (isRefund) {
        counts["Refund"]++;
      } else {
        counts["Unpaid"]++;
      }
    });

    return counts;
  }, [orders]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, paymentFilter, dateRangeFilter, fromDate, toDate, sortBy]);

  // Date filtering logic
  const isDateInRange = React.useCallback(
    (orderDateStr: string) => {
      if (dateRangeFilter === "all" && !fromDate && !toDate) return true;
      const orderDate = parseDateTime(orderDateStr);
      if (!orderDate) return true;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateRangeFilter) {
        case "today": {
          return orderDate >= startOfToday;
        }
        case "7d": {
          const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= sevenDaysAgo;
        }
        case "30d": {
          const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= thirtyDaysAgo;
        }
        case "this_month": {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return orderDate >= startOfMonth;
        }
        case "last_month": {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
        }
        case "custom": {
          if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (orderDate < from) return false;
          }
          if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (orderDate > to) return false;
          }
          return true;
        }
        default:
          return true;
      }
    },
    [dateRangeFilter, fromDate, toDate]
  );

  const filteredAndSortedOrders = React.useMemo(() => {
    const list = orders.filter((order) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        order.order_no?.toLowerCase().includes(q) ||
        order.customer_full_name?.toLowerCase().includes(q) ||
        order.customer_shipping_address?.toLowerCase().includes(q) ||
        order.ordered_products?.some((op: any) =>
          op.product?.title?.toLowerCase().includes(q)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        order.order_status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate = isDateInRange(order.created_at);

      let matchesPayment = true;
      if (paymentFilter !== "ALL") {
        const p = (order.payment_status || "").toLowerCase();
        const paid = Number(order.paid_amount || 0);
        const total = Number(order.grand_total_amount || 0);

        const isFullPaid = (paid >= total && total > 0) || p === "full paid" || p === "paid";
        const isPartialPaid = (paid > 0 && paid < total) || p === "partially paid" || p === "partial paid" || p === "partial";
        const isRefund = p === "refund" || p === "refunded";
        const isUnpaid = (!isFullPaid && !isPartialPaid && !isRefund) || p === "unpaid";

        if (paymentFilter === "Full Paid") matchesPayment = isFullPaid;
        else if (paymentFilter === "Partially Paid") matchesPayment = isPartialPaid;
        else if (paymentFilter === "Unpaid") matchesPayment = isUnpaid;
        else if (paymentFilter === "Refund") matchesPayment = isRefund;
        else matchesPayment = p === paymentFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesDate && matchesPayment;
    });

    // Sorting
    return list.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      const amountA = Number(a.grand_total_amount || 0);
      const amountB = Number(b.grand_total_amount || 0);
      const paidA = Number(a.paid_amount || 0);
      const paidB = Number(b.paid_amount || 0);
      const dueA = Number(a.due_amount || 0);
      const dueB = Number(b.due_amount || 0);

      switch (sortBy) {
        case "date-asc":
          return dateA - dateB;
        case "amount-desc":
          return amountB - amountA;
        case "amount-asc":
          return amountA - amountB;
        case "paid-desc":
          return paidB - paidA;
        case "due-desc":
          return dueB - dueA;
        case "date-desc":
        default:
          return dateB - dateA;
      }
    });
  }, [orders, search, statusFilter, paymentFilter, isDateInRange, sortBy]);

  const totalItems = filteredAndSortedOrders.length;
  const paginatedOrders = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedOrders.slice(start, start + pageSize);
  }, [filteredAndSortedOrders, page, pageSize]);


  const getPaymentBadge = (status: string, paidAmount: number, grandTotal: number) => {
    const isPaid = paidAmount >= grandTotal && grandTotal > 0;
    const isPartial = paidAmount > 0 && paidAmount < grandTotal;

    if (isPaid || status?.toLowerCase() === "full paid" || status?.toLowerCase() === "paid") {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          Full Paid
        </span>
      );
    }
    if (isPartial || status?.toLowerCase() === "partial" || status?.toLowerCase() === "partial paid") {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
          Partial Paid
        </span>
      );
    }
    if (status?.toLowerCase() === "refund") {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
          Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
        Unpaid
      </span>
    );
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-col gap-4 pb-4">
        {/* Top Row: Title on Left, Controls (Search, Date Range, Sort Orders By) on Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingBag className="size-4 text-primary" /> Purchase & Order History
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Showing {filteredAndSortedOrders.length} of {orders.length} order(s) for this customer.
            </CardDescription>
          </div>

          {/* Top Right: Search Bar, Date Range, Sort Orders By */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56 md:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order no, product, recipient..."
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>

            {/* Date Range Selector */}
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px] gap-1.5 bg-background">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Time</SelectItem>
                <SelectItem value="today" className="text-xs">Today</SelectItem>
                <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
                <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
                <SelectItem value="this_month" className="text-xs">This Month</SelectItem>
                <SelectItem value="last_month" className="text-xs">Last Month</SelectItem>
                <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Orders By */}
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="h-8 text-xs w-[140px] gap-1.5 bg-background">
                <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc" className="text-xs">Newest Date</SelectItem>
                <SelectItem value="date-asc" className="text-xs">Oldest Date</SelectItem>
                <SelectItem value="amount-desc" className="text-xs">Total Amount (High-Low)</SelectItem>
                <SelectItem value="amount-asc" className="text-xs">Total Amount (Low-High)</SelectItem>
                <SelectItem value="paid-desc" className="text-xs">Paid Amount (High-Low)</SelectItem>
                <SelectItem value="due-desc" className="text-xs">Due Balance (High-Low)</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button (only shown when any filter is active) */}
            {(statusFilter !== "ALL" || paymentFilter !== "ALL" || dateRangeFilter !== "all" || search || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                  setDateRangeFilter("all");
                  setSearch("");
                  setFromDate("");
                  setToDate("");
                  setSortBy("date-desc");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Custom Date Inputs if custom range selected */}
        {dateRangeFilter === "custom" && (
          <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground font-medium">From:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-7 text-xs bg-background"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground font-medium">To:</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-7 text-xs bg-background"
              />
            </div>
          </div>
        )}

        {/* Order Status Horizontal Pills (wraps naturally, no overflow) */}
        <div className="pt-2 border-t space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Order Status
          </div>
          <OrderStatusPills
            selectedStatus={statusFilter}
            onSelectStatus={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
            statusCounts={statusCounts}
          />
        </div>

        {/* Bottom of Order Status tab: Payment Status wise Tab also */}
        <div className="pt-2 border-t space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Payment Status
          </div>
          <PaymentStatusPills
            selectedStatus={paymentFilter}
            onSelectStatus={(status) => {
              setPaymentFilter(status);
              setPage(1);
            }}
            statusCounts={paymentStatusCounts}
          />
        </div>
      <ExcelExportButton module="crm" title="Customer orders" />
      </CardHeader>

      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Package className="size-12 stroke-1 mb-3 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">No orders recorded</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              This customer hasn&apos;t placed any orders yet.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" asChild>
              <Link href={`/dashboard/orders/create?customer_id=${customerId}`}>
                <ShoppingBag className="size-3.5" /> Create New Order
              </Link>
            </Button>
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No orders match the selected filters or date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-6 w-[180px]">Order No & Date</TableHead>
                  <TableHead className="min-w-[280px]">Ordered Items & Return Details</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[170px]">Paid & Balance</TableHead>
                  <TableHead className="w-[170px]">Shipping Area & Details</TableHead>
                  <TableHead className="pr-6 text-right w-[80px]">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const { date, time } = formatOrderDateTime(order.created_at);
                  const items = order.ordered_products || [];
                  const grandTotal = Number(order.grand_total_amount || 0);
                  const paidAmount = Number(order.paid_amount || 0);
                  const dueAmount = Math.max(0, grandTotal - paidAmount);

                  // Recipient name check
                  const orderCustomerName = (order.customer_full_name || "").trim();
                  const isDifferentRecipient =
                    orderCustomerName &&
                    customerPrimaryName &&
                    orderCustomerName.toLowerCase() !== customerPrimaryName.toLowerCase();

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30 align-top">
                      {/* Order No & Date */}
                      <TableCell className="pl-6 font-medium">
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/orders/${order.order_no}`}
                            className="font-mono text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                          >
                            {order.order_no}
                          </Link>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3 shrink-0" />
                            <span>{date}</span>
                            <span>·</span>
                            <span>{time}</span>
                          </div>
                          {isDifferentRecipient && (
                            <div className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded border inline-flex items-center gap-1 mt-0.5">
                              <User className="size-2.5" />
                              <span>Recipient: {orderCustomerName}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Items & Return Details */}
                      <TableCell>
                        <div className="flex flex-col gap-2.5 py-1">
                          {items.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">No products listed</span>
                          ) : (
                            items.map((item: any, idx: number) => {
                              const p = item.product || {};
                              const thumb = p.product_thumbnail_img;
                              const returnQty = Number(item.return_received_qty || 0);
                              const orderedQty = Number(item.qty || 1);
                              const hasPartialReturn = returnQty > 0 && returnQty < orderedQty;
                              const hasFullReturn = returnQty >= orderedQty && returnQty > 0;

                              return (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <div className="size-10 rounded border bg-muted overflow-hidden shrink-0 mt-0.5">
                                    <img
                                      src={getImageUrl(thumb)}
                                      alt={p.title || "Product"}
                                      className="size-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                                      {p.title || "Product item"}
                                    </span>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                      <span className="font-semibold text-foreground/90">
                                        ৳{Number(item.unit_price).toLocaleString()}
                                      </span>
                                      <span>x {orderedQty}</span>
                                      {(item.size_label || item.color_label) && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded border">
                                          {[item.size_label, item.color_label].filter(Boolean).join(" / ")}
                                        </span>
                                      )}
                                    </div>

                                    {/* Clear Partial Return indicators */}
                                    {hasPartialReturn && (
                                      <div className="mt-1">
                                        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 text-[10px] gap-1 font-semibold">
                                          <RotateCcw className="size-2.5" /> Partial ({returnQty} of {orderedQty} returned)
                                        </Badge>
                                      </div>
                                    )}

                                    {hasFullReturn && (
                                      <div className="mt-1">
                                        <Badge variant="destructive" className="text-[10px] gap-1 font-semibold">
                                          <RotateCcw className="size-2.5" /> Full Return ({returnQty} pcs)
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </TableCell>

                      {/* Order Status */}
                      <TableCell>
                        <div className="space-y-1.5">
                          <OrderStatusBadge status={order.order_status} isPartial={order.is_partial_return} />
                          <div>{getPaymentBadge(order.payment_status, paidAmount, grandTotal)}</div>
                        </div>
                      </TableCell>

                      {/* Paid & Balance Amount */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-foreground">
                            <span>Total:</span>
                            <span>৳{grandTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>Paid:</span>
                            <span>৳{paidAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground pt-0.5 border-t">
                            <span>Due:</span>
                            <span className={dueAmount > 0 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground"}>
                              ৳{dueAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Shipping Area */}
                      <TableCell>
                        <div className="text-xs font-semibold text-foreground">
                          {order.shipping_area || "Standard Area"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[160px] mt-0.5" title={order.customer_shipping_address}>
                          {order.customer_shipping_address || "No address entered"}
                        </div>
                        {order.steadfast_parcel && (
                          <div className="text-[10px] text-blue-600 font-medium mt-1">
                            Steadfast: {order.steadfast_parcel.status || "Booked"}
                          </div>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="pr-6 text-right">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                          <Link href={`/dashboard/orders/${order.order_no}`}>
                            <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Optimized Pagination */}
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
