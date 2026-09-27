"use client";

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
import { formatOrderDateTime, getImageUrl } from "@/lib/utils";

interface CustomerOrdersTableProps {
  orders: any[];
  customerId: number | string;
}

export function CustomerOrdersTable({ orders = [], customerId }: CustomerOrdersTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !search.trim() ||
        order.order_no?.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_shipping_address?.toLowerCase().includes(search.toLowerCase()) ||
        order.ordered_products?.some((op: any) =>
          op.product?.title?.toLowerCase().includes(search.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        order.order_status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const getOrderStatusBadge = (status: string) => {
    const s = status || "Pending";
    switch (s.toLowerCase()) {
      case "delivered":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium hover:bg-emerald-500/20">
            <CheckCircle2 className="size-3" /> Delivered
          </Badge>
        );
      case "in-courier":
      case "dispatched":
      case "handover":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-medium hover:bg-blue-500/20">
            <Truck className="size-3" /> In-Courier
          </Badge>
        );
      case "pending":
      case "processing":
      case "confirmed":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-medium hover:bg-amber-500/20">
            <Clock className="size-3" /> {s}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-muted-foreground border-border gap-1 font-medium">
            <XCircle className="size-3" /> Cancelled
          </Badge>
        );
      case "returned":
        return (
          <Badge variant="destructive" className="gap-1 font-medium">
            <RotateCcw className="size-3" /> Returned
          </Badge>
        );
      default:
        return <Badge variant="secondary">{s}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const p = paymentStatus || "Unpaid";
    switch (p.toLowerCase()) {
      case "full paid":
      case "paid":
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Full Paid
          </span>
        );
      case "partial":
      case "partial paid":
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            Partial
          </span>
        );
      case "refund":
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
            {p}
          </span>
        );
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" /> Purchase & Order History
          </CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} order(s) for this customer.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or product..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="In-Courier">In-Courier</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Package className="size-12 stroke-1 mb-3 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              This customer hasn&apos;t placed any orders yet. You can create a new order directly for them.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" asChild>
              <Link href={`/dashboard/orders/create?customer_id=${customerId}`}>
                <ShoppingBag className="size-3.5" /> Create New Order
              </Link>
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No orders match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-6 w-[160px]">Order No</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="min-w-[260px]">Ordered Items</TableHead>
                  <TableHead className="w-[150px]">Shipping Area</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[110px]">Payment</TableHead>
                  <TableHead className="text-right w-[110px]">Total</TableHead>
                  <TableHead className="pr-6 text-right w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const { date, time } = formatOrderDateTime(order.created_at);
                  const items = order.ordered_products || [];

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/dashboard/orders/${order.order_no}`}
                          className="font-mono text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          {order.order_no}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{date}</div>
                        <div className="text-[11px] text-muted-foreground">{time}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-2 py-1">
                          {items.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">No product details</span>
                          ) : (
                            items.map((item: any, idx: number) => {
                              const p = item.product || {};
                              const thumb = p.product_thumbnail_img;

                              return (
                                <div key={idx} className="flex items-center gap-2.5">
                                  <div className="size-9 rounded border bg-muted overflow-hidden shrink-0">
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
                                    <span className="text-xs font-medium text-foreground truncate max-w-[220px]">
                                      {p.title || "Product item"}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                      <span className="font-semibold text-foreground/80">
                                        ৳{Number(item.unit_price).toLocaleString()}
                                      </span>
                                      <span>x {item.qty}</span>
                                      {(item.size_label || item.color_label) && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded border">
                                          {[item.size_label, item.color_label].filter(Boolean).join(" / ")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-foreground font-medium">
                          {order.shipping_area || "Standard"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[150px]" title={order.customer_shipping_address}>
                          {order.customer_shipping_address || "—"}
                        </div>
                      </TableCell>

                      <TableCell>{getOrderStatusBadge(order.order_status)}</TableCell>

                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>

                      <TableCell className="text-right font-bold text-sm text-foreground">
                        ৳{Number(order.grand_total_amount || 0).toLocaleString()}
                      </TableCell>

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
