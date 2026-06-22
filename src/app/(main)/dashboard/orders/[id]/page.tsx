"use client";

import * as React from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Edit,
  FileText,
  History,
  Loader2,
  MapPin,
  Package,
  Phone,
  Printer,
  RotateCcw,
  Save,
  Send,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { mutate as globalMutate } from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useOrderDetail } from "@/hooks/useOrderDetail";
import { UpdatePaymentModal } from "../_components/update-payment-modal";
import { fetchClient } from "@/lib/fetch-client";

/* ---- constants ---- */

const orderStatuses = [
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

const paymentStatuses = ["Full Paid", "Unpaid", "Partially Paid", "Refund"] as const;

/* ---- badge helpers ---- */

function statusColor(s: string) {
  if (["Delivered", "Ready To Ship", "In-Courier"].includes(s)) return "default";
  if (["Cancelled", "Fake", "Trash", "Lost", "Returned"].includes(s)) return "destructive";
  if (["Pending", "Hold", "Ship Later", "Missing"].includes(s)) return "outline";
  return "secondary";
}

function paymentColor(s: string) {
  if (s === "Full Paid") return "default";
  if (s === "Refund") return "destructive";
  if (s === "Partially Paid") return "secondary";
  return "outline";
}

/* ---- image helper ---- */
function getImageUrl(path: string | null | undefined): string {
  if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Img";
  if (path.startsWith("http")) return path;
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000";
  return `${base}/${path.replace(/^\//, "")}`;
}

/* ---- date helper ---- */
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ---- API helpers ---- */

async function patchOrder(orderNo: string, payload: Record<string, unknown>) {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${base}orders/${orderNo}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Request failed");
  }
  return res.json();
}

/* ---- Customer History Tab ---- */

interface CustomerOrder {
  id: number;
  order_no: string;
  grand_total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  customer_shipping_address: string;
  shipping_area: string;
}

function CustomerOrderHistory({
  orders,
  currentOrderNo,
}: {
  orders: CustomerOrder[];
  currentOrderNo: string;
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
        <ShoppingBag className="size-8" />
        <p className="text-sm">No previous orders found for this customer.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => {
        const isCurrent = o.order_no === currentOrderNo;
        return (
          <div
            key={o.id}
            className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
              isCurrent ? "bg-primary/5 border-primary/30" : "bg-muted/20"
            }`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {o.order_no}
                </span>
                {isCurrent && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Current
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{formatDate(o.created_at)}</span>
                <span>·</span>
                <MapPin className="size-3" />
                <span>{o.shipping_area || o.customer_shipping_address || "—"}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge variant={statusColor(o.order_status) as any}>
                {o.order_status}
              </Badge>
              <Badge variant={paymentColor(o.payment_status) as any}>
                {o.payment_status}
              </Badge>
              <span className="text-sm font-semibold tabular-nums text-foreground min-w-[72px] text-right">
                ৳{Number(o.grand_total_amount).toLocaleString()}
              </span>
              {!isCurrent && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href={`/dashboard/orders/${o.order_no}`}>View</Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Page ---- */

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading, mutate } = useOrderDetail(id ?? null);

  /* local state for editable dropdowns */
  const [orderStatus, setOrderStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [isSavingStatus, setIsSavingStatus] = React.useState(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [isEditingNote, setIsEditingNote] = React.useState(false);

  /* sync from API data */
  React.useEffect(() => {
    if (order) {
      setOrderStatus(order.order_status ?? "");
      setPaymentStatus(order.payment_status ?? "");
      setNote(order.order_note ?? "");
    }
  }, [order]);

  /* ---- handlers ---- */

  const handleSaveOrderStatus = async () => {
    if (!order) return;
    setIsSavingStatus(true);
    const toastId = toast.loading("Updating order status…");
    try {
      await patchOrder(order.order_no, { order_status: orderStatus });
      toast.success("Order status updated!", { id: toastId });
      mutate();
      globalMutate(
        (key) => typeof key === "string" && key.includes("orders"),
        undefined,
        { revalidate: true }
      );
    } catch (e: any) {
      toast.error(e?.message || "Failed to update order status", { id: toastId });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSavePaymentStatus = async () => {
    if (!order) return;
    // If selecting "Partially Paid", open modal instead
    if (paymentStatus === "Partially Paid") {
      setModalOpen(true);
      return;
    }
    setIsSavingPayment(true);
    const toastId = toast.loading("Updating payment status…");
    try {
      const payload: Record<string, unknown> = { payment_status: paymentStatus };
      // When marking as Full Paid, send the grand total as the paid amount
      if (paymentStatus === "Full Paid") {
        payload.paid_amount = Number(order.grand_total_amount ?? 0);
      }
      await patchOrder(order.order_no, payload);
      toast.success("Payment status updated!", { id: toastId });
      mutate();
      globalMutate(
        (key) => typeof key === "string" && key.includes("orders"),
        undefined,
        { revalidate: true }
      );
    } catch (e: any) {
      toast.error(e?.message || "Failed to update payment status", { id: toastId });
    } finally {
      setIsSavingPayment(false);
    }
  };

  /* ---- derived values ---- */
  const paidAmount =
    order?.payments?.reduce(
      (sum: number, p: any) => sum + Number(p.paid_amount ?? 0),
      0
    ) ?? 0;
  const grandTotal = Number(order?.grand_total_amount ?? 0);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const statusChanged = order && orderStatus !== order.order_status;
  const paymentChanged = order && paymentStatus !== order.payment_status;

  /* ---- loading / not-found ---- */
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading order details…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="size-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Order not found</p>
        <p className="text-sm text-muted-foreground">
          Order <code className="rounded bg-muted px-1">{id}</code> does not exist.
        </p>
        <Button asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 size-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  /* ---- render ---- */
  const customerOrders: CustomerOrder[] = order.customer?.orders ?? [];
  const parcelHistory = order.customer?.parcel_history;

  const initials = (order.customer_full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Order details
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight">{order.order_no}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.created_at)} · {order.customer_full_name} ·{" "}
              {order.shipping_area || "—"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusColor(order.order_status) as any}>
                {order.order_status}
              </Badge>
              <Badge variant={paymentColor(order.payment_status) as any}>
                {order.payment_status}
              </Badge>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/invoice/${order.order_no}`} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 size-4" />
                Invoice
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/invoice/${order.order_no}/pos`} target="_blank" rel="noopener noreferrer">
                <Printer className="mr-2 size-4" />
                POS
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/invoice/${order.order_no}/label`} target="_blank" rel="noopener noreferrer">
                <Truck className="mr-2 size-4" />
                Label
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/dashboard/orders/${id}/edit`}>
                <Edit className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Send to Courier</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => toast.success("Sent to Steadfast!")}
                  >
                    <Truck className="mr-2 size-4" />
                    Steadfast
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.success("Sent to Pathao!")}
                  >
                    <Truck className="mr-2 size-4" />
                    Pathao
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => toast.success("Customer blocked.")}
                >
                  <Ban className="mr-2 size-4" />
                  Block Customer
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    toast.success("Order deleted.");
                    router.push("/dashboard/orders");
                  }}
                >
                  <X className="mr-2 size-4" />
                  Delete Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">
            <Package className="mr-1.5 size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-1.5 size-4" />
            Customer History
            {customerOrders.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                {customerOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW TAB ─── */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Left column (2/3) ── */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Products Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Products</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5">
                    {(order.ordered_products ?? []).map((item: any, i: number) => (
                      <div
                        key={item.id ?? i}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <img
                              src={getImageUrl(
                                item.product?.product_thumbnail_img
                              )}
                              alt={item.product?.title ?? "Product"}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-base font-medium leading-none">
                              {item.product?.title ?? "Unknown Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.product?.sku ?? "—"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {item.product?.main_category?.name && (
                                <span className="rounded-sm bg-muted px-1.5 py-0.5">
                                  {item.product.main_category.name}
                                </span>
                              )}
                              {item.product?.sub_category?.name && (
                                <span className="rounded-sm bg-muted px-1.5 py-0.5">
                                  {item.product.sub_category.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.size_label ? `Size: ${item.size_label}` : ""}
                              {item.color_label ? ` · Color: ${item.color_label}` : ""}
                              {" · "} Qty: {item.qty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-medium tabular-nums">
                            ৳{Number(item.unit_price).toLocaleString()}
                          </p>
                          {item.qty > 1 && (
                            <p className="text-xs text-muted-foreground tabular-nums">
                              × {item.qty} = ৳
                              {(Number(item.unit_price) * item.qty).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="flex flex-col gap-3 text-sm ml-auto w-full sm:w-1/2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">
                        ৳{Number(order.subtotal_amount).toLocaleString()}
                      </span>
                    </div>
                    {Number(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="tabular-nums">
                          − ৳{Number(order.discount_amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="tabular-nums">
                        ৳{Number(order.shipping_charge).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-base mt-1 pt-3 border-t">
                      <span>Grand Total</span>
                      <span className="tabular-nums">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Status Cards */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Payment details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment details</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Grand Total
                      </span>
                      <span className="text-base font-medium tabular-nums">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Paid</span>
                      <span className="text-base font-medium text-green-600 dark:text-green-400 tabular-nums">
                        ৳{paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due</span>
                      <span className="text-base font-medium text-destructive tabular-nums">
                        ৳{dueAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Payment entries */}
                    {order.payments && order.payments.length > 0 && (
                      <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 mt-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Payment Records
                        </p>
                        {order.payments.map((p: any, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between text-xs text-muted-foreground"
                          >
                            <span>
                              {p.payment_method ?? "Payment"} ·{" "}
                              {p.transaction_id ?? "—"}
                            </span>
                            <span className="font-semibold text-foreground tabular-nums">
                              ৳{Number(p.paid_amount).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <UpdatePaymentModal
                      order={{
                        id: order.order_no,
                        total: grandTotal,
                        paid: paidAmount,
                        due: dueAmount,
                        paymentStatus: paymentStatus,
                      }}
                      open={modalOpen}
                      onOpenChange={(open) => {
                        setModalOpen(open);
                        if (!open) mutate();
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order status</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    {/* Order Status */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">
                        Fulfillment Status
                      </Label>
                      <Select
                        value={orderStatus}
                        onValueChange={setOrderStatus}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={!statusChanged || isSavingStatus}
                        onClick={handleSaveOrderStatus}
                        className="self-start h-8 text-xs"
                      >
                        {isSavingStatus ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 size-3.5" />
                        )}
                        Save Status
                      </Button>
                    </div>

                    <Separator />

                    {/* Payment Status */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">
                        Payment Status
                      </Label>
                      <Select
                        value={paymentStatus}
                        onValueChange={(val) => {
                          setPaymentStatus(val);
                          if (val === "Partially Paid") {
                            setModalOpen(true);
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatuses.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={
                          !paymentChanged ||
                          isSavingPayment ||
                          paymentStatus === "Partially Paid"
                        }
                        onClick={handleSavePaymentStatus}
                        className="self-start h-8 text-xs"
                        variant={
                          paymentStatus === "Partially Paid"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {isSavingPayment ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 size-3.5" />
                        )}
                        {paymentStatus === "Partially Paid"
                          ? "Open Payment Form"
                          : "Save Payment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Note */}
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Order note</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingNote((v) => !v)}
                  >
                    {isEditingNote ? (
                      <X className="size-4" />
                    ) : (
                      <Edit className="size-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {note && !isEditingNote ? (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
                      {note}
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Add a note for this order…"
                      className="min-h-[100px] resize-none text-sm"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      readOnly={!isEditingNote}
                    />
                  )}
                  {isEditingNote && (
                    <Button
                      size="sm"
                      className="self-start"
                      onClick={async () => {
                        const toastId = toast.loading("Saving note…");
                        try {
                          await patchOrder(order.order_no, {
                            order_note: note,
                          });
                          toast.success("Note saved.", { id: toastId });
                          setIsEditingNote(false);
                          mutate();
                        } catch {
                          toast.error("Failed to save note.", { id: toastId });
                        }
                      }}
                    >
                      <Save className="mr-2 size-4" />
                      Save Note
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right column (1/3) ── */}
            <div className="flex flex-col gap-6">
              {/* Customer Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="size-12 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
                      <span className="text-base font-bold text-muted-foreground">
                        {initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-medium">
                        {order.customer_full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </p>
                      {order.customer_email && (
                        <p className="text-xs text-muted-foreground">
                          {order.customer_email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Parcel history */}
                  {parcelHistory && (
                    <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Parcel History
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {parcelHistory.total ?? 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Total
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {parcelHistory.delivered ?? 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Success
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-destructive">
                            {parcelHistory.cancelled ?? 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Failed
                          </span>
                        </div>
                      </div>
                      {parcelHistory.success_rate !== undefined && (
                        <p className="text-center text-xs text-muted-foreground">
                          Success rate:{" "}
                          <span className="font-semibold text-foreground">
                            {parcelHistory.success_rate}%
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(order.customer_phone);
                        toast.success("Phone copied!");
                      }}
                    >
                      <Phone className="size-4 text-muted-foreground" />
                      Copy Phone Number
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                      asChild
                    >
                      <Link href="/dashboard/customers">
                        <User className="size-4 text-muted-foreground" />
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping address</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {order.customer_full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_shipping_address}
                      </p>
                      {order.shipping_area && (
                        <p className="text-xs text-muted-foreground">
                          {order.shipping_area}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery / Courier Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery details</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Courier
                      </Label>
                      <span className="text-sm font-medium">
                        {order.courier_details?.courier ?? "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Parcel Status
                      </Label>
                      <span className="text-sm font-medium">
                        {order.courier_details?.parcel_status ?? "Not dispatched"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success("Sent to Steadfast!")}
                    >
                      <Truck className="mr-2 size-4 text-muted-foreground" />
                      Send via Steadfast
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success("Sent to Pathao!")}
                    >
                      <Send className="mr-2 size-4 text-muted-foreground" />
                      Send via Pathao
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Activity / Status logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.status_logs && order.status_logs.length > 0 ? (
                    <ol className="relative ml-2 border-l border-border flex flex-col gap-6">
                      {order.status_logs.map((log: any, i: number) => (
                        <li key={i} className="ml-5">
                          <div className="absolute -left-[9px] flex size-4 items-center justify-center rounded-full bg-background ring-4 ring-background">
                            <div className="size-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium leading-none">
                              {log.status ?? log.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.created_at
                                ? formatDate(log.created_at)
                                : "—"}
                            </p>
                            {log.note && (
                              <p className="text-sm mt-1">{log.note}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ol className="relative ml-2 border-l border-border flex flex-col gap-6">
                      {/* Fallback built from order data */}
                      {[
                        {
                          label: "Order Placed",
                          desc: "Customer placed the order.",
                          date: formatDate(order.created_at),
                          icon: Package,
                          show: true,
                        },
                        {
                          label: "Confirmed",
                          desc: "Order details verified.",
                          date: formatDate(order.updated_at),
                          icon: CheckCircle2,
                          show: ["Confirmed", "In-Courier", "Ready To Ship", "Delivered"].includes(
                            order.order_status
                          ),
                        },
                        {
                          label: "Dispatched",
                          desc: `Handed to ${order.courier_details?.courier ?? "courier"}.`,
                          date: formatDate(order.updated_at),
                          icon: Truck,
                          show: !!order.courier_details?.courier,
                        },
                        {
                          label: "Delivered",
                          desc: "Package received by customer.",
                          date: formatDate(order.updated_at),
                          icon: CheckCircle2,
                          show: order.order_status === "Delivered",
                        },
                        {
                          label: order.order_status,
                          desc: "Order was cancelled or returned.",
                          date: formatDate(order.updated_at),
                          icon: RotateCcw,
                          show: ["Returned", "Cancelled"].includes(order.order_status),
                        },
                      ]
                        .filter((item) => item.show)
                        .map((item, i) => (
                          <li key={i} className="ml-5">
                            <div className="absolute -left-[9px] flex size-4 items-center justify-center rounded-full bg-background ring-4 ring-background">
                              <div className="size-2 rounded-full bg-primary" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium leading-none">
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.date}
                              </p>
                              <p className="text-sm mt-1">{item.desc}</p>
                            </div>
                          </li>
                        ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── CUSTOMER HISTORY TAB ─── */}
        <TabsContent value="history">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="size-5" />
                    All Orders by {order.customer_full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerOrderHistory
                    orders={customerOrders}
                    currentOrderNo={order.order_no}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              {/* Customer summary card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
                      <span className="text-base font-bold text-muted-foreground">
                        {initials}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{order.customer_full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total orders</span>
                      <span className="font-semibold">{customerOrders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total spent</span>
                      <span className="font-semibold tabular-nums">
                        ৳
                        {customerOrders
                          .reduce(
                            (sum, o) => sum + Number(o.grand_total_amount),
                            0
                          )
                          .toLocaleString()}
                      </span>
                    </div>
                    {parcelHistory && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Delivered
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {parcelHistory.delivered ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Cancelled
                          </span>
                          <span className="font-semibold text-destructive">
                            {parcelHistory.cancelled ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Success rate
                          </span>
                          <span className="font-semibold">
                            {parcelHistory.success_rate ?? 0}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
