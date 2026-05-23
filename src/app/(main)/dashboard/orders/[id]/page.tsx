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
  Edit,
  FileText,
  MapPin,
  Package,
  Phone,
  Printer,
  RotateCcw,
  Save,
  Send,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { UpdatePaymentModal } from "../_components/update-payment-modal";
import { allOrders } from "../page";

/* ---- helpers ---- */

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

function statusColor(s: string) {
  if (["Delivered"].includes(s)) return "default";
  if (["Cancelled", "Fake", "Trash", "Lost"].includes(s)) return "destructive";
  if (["Pending", "Hold", "Ship Later", "Missing"].includes(s)) return "outline";
  return "secondary";
}

function paymentColor(s: string) {
  if (s === "Full Paid") return "default";
  if (s === "Refund") return "destructive";
  if (s === "Partially Paid") return "secondary";
  return "outline";
}

/* ---- page ---- */

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const order = React.useMemo(() => allOrders.find((o) => o.id === id), [id]);

  const [isEditing, setIsEditing] = React.useState(false);
  const [orderStatus, setOrderStatus] = React.useState(order?.orderStatus ?? "");
  const [paymentStatus, setPaymentStatus] = React.useState(order?.paymentStatus ?? "");
  const [note, setNote] = React.useState("");
  const [address, setAddress] = React.useState("123 Dhanmondi, Dhaka-1205");
  const [modalOpen, setModalOpen] = React.useState(false);

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
          <span className="text-sm font-medium text-muted-foreground">Order details</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight">{order.id}</h1>
            <p className="text-sm text-muted-foreground">
              Order date {order.date} · Order from {order.customer} · Purchased via {order.paymentMethod}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("A4 invoice generated.")}>
              <FileText className="mr-2 size-4" />
              Invoice
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Parcel invoice generated.")}>
              <Printer className="mr-2 size-4" />
              Label
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
                  <DropdownMenuItem onClick={() => toast.success("Sent to Steadfast!")}>
                    <Truck className="mr-2 size-4" />
                    Steadfast
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Sent to Pathao!")}>
                    <Truck className="mr-2 size-4" />
                    Pathao
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => toast.success("Order blocked.")}>
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

      {/* ── Body grid ── */}
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
                {order.productImages.map((img, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <img src={img} alt="" className="size-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-medium leading-none">
                          {order.subCategory} — Item {i + 1}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          SKU-{order.category.substring(0, 4).toUpperCase()}-{1000 + i}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Default · Quantity 1</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium tabular-nums">
                        ৳{Math.round(order.total / order.items).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-col gap-3 text-sm ml-auto w-full sm:w-1/2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">৳{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">৳0</span>
                </div>
                <div className="flex justify-between font-medium text-base mt-1 pt-3 border-t">
                  <span>Total</span>
                  <span className="tabular-nums">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Status Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total amount</span>
                  <span className="text-base font-medium tabular-nums">৳{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Paid amount</span>
                  <span className="text-base font-medium text-green-600 dark:text-green-400 tabular-nums">
                    ৳{order.paid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Due amount</span>
                  <span className="text-base font-medium text-destructive tabular-nums">
                    ৳{order.due.toLocaleString()}
                  </span>
                </div>
                {isEditing && order.due > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input type="number" placeholder="Enter amount" className="h-8 text-xs" />
                    <Button
                      size="sm"
                      className="h-8 text-xs shrink-0"
                      onClick={() => toast.success("Payment recorded!")}
                    >
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                      Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-muted-foreground">Fulfillment Status</Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger className="h-8 text-sm">
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
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-muted-foreground">Payment Status</Label>
                  <>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatuses.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-sm"
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
                      order={{ ...order, paymentStatus: paymentStatus }}
                      open={modalOpen}
                      onOpenChange={setModalOpen}
                    />
                  </>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order note</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {note && !isEditing ? (
                <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground">{note}</div>
              ) : (
                <Textarea
                  placeholder="Add a note for this order…"
                  className="min-h-[100px] resize-none text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  readOnly={!isEditing}
                />
              )}
              {isEditing && (
                <Button
                  size="sm"
                  className="self-start"
                  onClick={() => {
                    toast.success("Note saved.");
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
                <div className="size-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                  <img src={order.avatar} alt="" className="size-full object-cover" />
                </div>
                <div>
                  <p className="text-base font-medium">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(order.phone);
                    toast.success("Phone copied!");
                  }}
                >
                  <Phone className="size-4 text-muted-foreground" />
                  Copy Phone Number
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                  <Link href="/dashboard/customers">
                    <User className="size-4 text-muted-foreground" />
                    View Profile Details
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
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">{order.customer}</p>
                {isEditing ? (
                  <Textarea
                    className="min-h-[72px] resize-none text-sm mt-1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Courier / Parcel Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm text-muted-foreground">Courier</Label>
                  <span className="text-sm font-medium">{order.courier || "—"}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm text-muted-foreground">Parcel Status</Label>
                  <span className="text-sm font-medium">{order.parcelStatus || "Not dispatched"}</span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Courier History</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold">{order.parcelHistory.total}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {order.parcelHistory.delivered}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">Success</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-destructive">{order.parcelHistory.cancelled}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Failed</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-foreground"
                  onClick={() => toast.success("Sent to Steadfast!")}
                >
                  <Truck className="mr-2 size-4 text-muted-foreground" />
                  Send via Steadfast
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-foreground"
                  onClick={() => toast.success("Sent to Pathao!")}
                >
                  <Send className="mr-2 size-4 text-muted-foreground" />
                  Send via Pathao
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative ml-2 border-l border-border flex flex-col gap-6">
                {[
                  {
                    label: "Order Placed",
                    desc: "Customer successfully placed the order.",
                    date: order.date,
                    time: order.time,
                    icon: Package,
                  },
                  ...(order.orderStatus === "Confirmed" ||
                  ["In-Courier", "Ready To Ship", "Delivered"].includes(order.orderStatus)
                    ? [
                        {
                          label: "Confirmed",
                          desc: "Order details verified.",
                          date: order.date,
                          time: "—",
                          icon: CheckCircle2,
                        },
                      ]
                    : []),
                  ...(order.courier
                    ? [
                        {
                          label: "Dispatched",
                          desc: `Handed over to ${order.courier}.`,
                          date: order.date,
                          time: "—",
                          icon: Truck,
                        },
                      ]
                    : []),
                  ...(order.orderStatus === "Delivered"
                    ? [
                        {
                          label: "Delivered",
                          desc: "Package received by customer.",
                          date: order.date,
                          time: "—",
                          icon: CheckCircle2,
                        },
                      ]
                    : []),
                  ...(["Returned", "Cancelled"].includes(order.orderStatus)
                    ? [
                        {
                          label: order.orderStatus,
                          desc: "Order was cancelled or returned.",
                          date: order.date,
                          time: "—",
                          icon: RotateCcw,
                        },
                      ]
                    : []),
                ].map((item, i) => (
                  <li key={i} className="ml-5">
                    <div className="absolute -left-[9px] flex size-4 items-center justify-center rounded-full bg-background ring-4 ring-background">
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date} at {item.time}
                      </p>
                      <p className="text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
