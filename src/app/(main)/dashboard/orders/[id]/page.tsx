"use client";

import * as React from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Ban,
  Check,
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
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { mutate as globalMutate } from "swr";

import { districts } from "@/app/(main)/dashboard/orders/create/_components/bd-locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { usePathaoSetup } from "@/hooks/usePathaoSetup";
import { useSteadfastSetup } from "@/hooks/useSteadfastSetup";
import { fetchClient } from "@/lib/fetch-client";

import { UpdatePaymentModal } from "../_components/update-payment-modal";

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

const allDistricts = Object.values(districts).flat().sort();

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
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
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

function getRelativeTime(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "just now";

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

/* ---- API helpers ---- */

async function patchOrder(orderNo: string, payload: Record<string, unknown>) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
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

function CustomerOrderHistory({ orders, currentOrderNo }: { orders: CustomerOrder[]; currentOrderNo: string }) {
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
                <span className="font-mono text-sm font-semibold text-foreground">{o.order_no}</span>
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
              <Badge variant={statusColor(o.order_status) as any}>{o.order_status}</Badge>
              <Badge variant={paymentColor(o.payment_status) as any}>{o.payment_status}</Badge>
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
  const { data: steadfastConfig } = useSteadfastSetup();
  const { data: pathaoConfig } = usePathaoSetup();

  const isSteadfastActive = steadfastConfig?.status === "active";
  const isPathaoActive = pathaoConfig?.status === "active";

  /* local state for editable dropdowns */
  const [orderStatus, setOrderStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [isSavingStatus, setIsSavingStatus] = React.useState(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [isEditingNote, setIsEditingNote] = React.useState(false);
  const [selectedDistrict, setSelectedDistrict] = React.useState("");
  const [isSavingDistrict, setIsSavingDistrict] = React.useState(false);
  const [isEditingCosts, setIsEditingCosts] = React.useState(false);
  const [shippingChargeInput, setShippingChargeInput] = React.useState<number>(0);
  const [discountAmountInput, setDiscountAmountInput] = React.useState<number>(0);
  const [isSavingCosts, setIsSavingCosts] = React.useState(false);

  const [fraudData, setFraudData] = React.useState<any>(null);
  const [fraudLoading, setFraudLoading] = React.useState(false);
  const [fraudError, setFraudError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (order?.customer_phone) {
      const fetchFraudData = async () => {
        setFraudLoading(true);
        setFraudError(null);
        try {
          const res = await fetch("/api/fraud-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: order.customer_phone }),
          });
          if (res.ok) {
            const data = await res.json();
            setFraudData(data);
          } else {
            const err = await res.json().catch(() => ({}));
            setFraudError(err.error || "Failed to load fraud checker data");
          }
        } catch (err: any) {
          setFraudError(err.message || "Failed to scan phone number");
        } finally {
          setFraudLoading(false);
        }
      };
      fetchFraudData();
    }
  }, [order?.customer_phone]);

  const getFraudCourierMetrics = (courierName: string, data: any) => {
    if (!data || !data.apis) {
      return { name: courierName, total: 0, delivered: 0, cancelled: 0 };
    }
    const searchName = courierName.toLowerCase().replace(" ", "");
    const matchedKey = Object.keys(data.apis).find((k) => {
      const normalizedKey = k.toLowerCase().replace(" ", "");
      if (searchName === "redx" && normalizedKey === "redex") return true;
      if (searchName === "redex" && normalizedKey === "redx") return true;
      return normalizedKey === searchName;
    });

    const raw = matchedKey ? data.apis[matchedKey] : {};
    const total = Number(raw.total_parcels ?? raw.total ?? 0);
    const delivered = Number(raw.total_delivered_parcels ?? raw.success ?? raw.delivered ?? raw.total_delivered ?? 0);
    const cancelled = Number(raw.total_cancelled_parcels ?? raw.cancel ?? raw.cancelled ?? raw.total_cancelled ?? 0);

    return { name: courierName, total, delivered, cancelled };
  };

  let fraudTotal = 0;
  let fraudDelivered = 0;
  let fraudCancelled = 0;
  let fraudSuccessRate = "-";

  if (fraudData) {
    const courierNames = ["Pathao", "Steadfast", "Redx", "Paperfly"];
    const metrics = courierNames.map((name) => getFraudCourierMetrics(name, fraudData));
    fraudTotal = metrics.reduce((sum, c) => sum + c.total, 0);
    fraudDelivered = metrics.reduce((sum, c) => sum + c.delivered, 0);
    fraudCancelled = metrics.reduce((sum, c) => sum + c.cancelled, 0);
    if (fraudTotal > 0) {
      fraudSuccessRate = `${Math.round((fraudDelivered / fraudTotal) * 100)}%`;
    }
  }

  /* sync from API data */
  React.useEffect(() => {
    if (order) {
      setOrderStatus(order.order_status ?? "");
      setPaymentStatus(order.payment_status ?? "");
      setNote(order.order_note ?? "");
      setSelectedDistrict(order.district ?? "");
      setShippingChargeInput(Number(order.shipping_charge ?? 0));
      setDiscountAmountInput(Number(order.discount_amount ?? 0));

      if (order.order_no) {
        const fetchDistrict = async () => {
          try {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
            const res = await fetchClient(`${base}orders/${order.order_no}/district`);
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.district) {
                setSelectedDistrict(json.district);
              }
            }
          } catch (err) {
            console.error("Failed to fetch order district:", err);
          }
        };
        fetchDistrict();
      }
    }
  }, [order]);

  /* ---- handlers ---- */

  const handleSaveDistrict = async () => {
    if (!order || !order.order_no) return;
    if (!selectedDistrict) {
      toast.error("Please select a district.");
      return;
    }
    setIsSavingDistrict(true);
    const toastId = toast.loading("Updating order district…");
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const res = await fetchClient(`${base}orders/${order.order_no}/district`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district: selectedDistrict }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update district");
      }
      toast.success(json.message || "Order district updated!", { id: toastId });
      mutate();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update district";
      toast.error(message, { id: toastId });
    } finally {
      setIsSavingDistrict(false);
    }
  };

  const handleSaveOrderStatus = async () => {
    if (!order) return;
    setIsSavingStatus(true);
    const toastId = toast.loading("Updating order status…");
    try {
      await patchOrder(order.order_no, { order_status: orderStatus });
      toast.success("Order status updated!", { id: toastId });
      mutate();
      globalMutate((key) => typeof key === "string" && key.includes("orders"), undefined, { revalidate: true });
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
      globalMutate((key) => typeof key === "string" && key.includes("orders"), undefined, { revalidate: true });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update payment status", { id: toastId });
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSaveCosts = async () => {
    if (!order) return;
    setIsSavingCosts(true);
    const toastId = toast.loading("Saving charges…");
    try {
      await patchOrder(order.order_no, {
        shipping_charge: shippingChargeInput,
        discount_amount: discountAmountInput,
      });
      toast.success("Charges updated successfully!", { id: toastId });
      setIsEditingCosts(false);
      mutate();
      globalMutate((key) => typeof key === "string" && key.includes("orders"), undefined, { revalidate: true });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update charges", { id: toastId });
    } finally {
      setIsSavingCosts(false);
    }
  };

  /* ---- derived values ---- */
  const paidAmount = order?.payments?.reduce((sum: number, p: any) => sum + Number(p.paid_amount ?? 0), 0) ?? 0;
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

  const steadfastParcel = order?.steadfast_parcel || order?.steadfastParcel || null;
  const pathaoParcel = order?.pathao_parcel || order?.pathaoParcel || null;
  const hasSteadfastParcel = !!steadfastParcel;
  const hasPathaoParcel = !!pathaoParcel;

  const determinedCourier = steadfastParcel ? "Steadfast" : pathaoParcel ? "Pathao" : (order?.courier_details?.courier ?? "—");

  let genuineStatus = "Not dispatched";
  if (order?.courier_details?.parcel_status) {
    genuineStatus = order.courier_details.parcel_status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  const getFraudCourierMetricsDetailed = (courierName: string) => {
    if (!fraudData || !fraudData.apis) {
      return { name: courierName, total: 0, delivered: 0, cancelled: 0, successRate: "-" };
    }

    const searchName = courierName.toLowerCase().replace(" ", "");
    const matchedKey = Object.keys(fraudData.apis).find((k) => {
      const normalizedKey = k.toLowerCase().replace(" ", "");
      if (searchName === "redx" && normalizedKey === "redex") return true;
      if (searchName === "redex" && normalizedKey === "redx") return true;
      return normalizedKey === searchName;
    });

    const raw = matchedKey ? fraudData.apis[matchedKey] : {};

    const total = Number(raw.total_parcels ?? raw.total ?? 0);
    const delivered = Number(raw.total_delivered_parcels ?? raw.success ?? raw.delivered ?? raw.total_delivered ?? 0);
    const cancelled = Number(raw.total_cancelled_parcels ?? raw.cancel ?? raw.cancelled ?? raw.total_cancelled ?? 0);

    let successRate = "-";
    if (total > 0) {
      successRate = `${Math.round((delivered / total) * 100)}%`;
    } else if (raw.success_rate || raw.successRate) {
      successRate = String(raw.success_rate || raw.successRate);
      if (!successRate.endsWith("%")) successRate += "%";
    }

    return { name: courierName, total, delivered, cancelled, successRate };
  };

  const detailedCouriers = [
    getFraudCourierMetricsDetailed("Pathao"),
    getFraudCourierMetricsDetailed("Steadfast"),
    getFraudCourierMetricsDetailed("Redx"),
    getFraudCourierMetricsDetailed("Paperfly"),
  ];

  const aggregateTotal = detailedCouriers.reduce((sum, c) => sum + c.total, 0);
  const aggregateDelivered = detailedCouriers.reduce((sum, c) => sum + c.delivered, 0);
  const aggregateCancelled = detailedCouriers.reduce((sum, c) => sum + c.cancelled, 0);
  const aggregateSuccessRate =
    aggregateTotal > 0 ? `${Math.round((aggregateDelivered / aggregateTotal) * 100)}%` : "-";

  let fraudStatusText = "Waiting";
  let fraudStatusVariant: "outline" | "secondary" | "default" | "destructive" = "outline";
  if (fraudLoading) {
    fraudStatusText = "Scanning...";
    fraudStatusVariant = "secondary";
  } else if (fraudError) {
    fraudStatusText = "Error";
    fraudStatusVariant = "destructive";
  } else if (fraudData) {
    fraudStatusText = "Success";
    fraudStatusVariant = "default";
  }

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
          <span className="text-sm font-medium text-muted-foreground">Order details</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{order.order_no}</h1>
              {order.created_at && (
                <span className="text-xs font-semibold text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-full select-none">
                  {getRelativeTime(order.created_at)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 items-center">
              <span>{formatDate(order.created_at)}</span>
              <span>·</span>
              <span>{order.customer_full_name}</span>
              <span>·</span>
              <span>{order.shipping_area || "—"}</span>
              {(order.customer_ip_address || order.customerIpAddress) && (
                <>
                  <span>·</span>
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    IP: {order.customer_ip_address || order.customerIpAddress}
                  </span>
                </>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusColor(order.order_status) as any}>{order.order_status}</Badge>
              <Badge variant={paymentColor(order.payment_status) as any}>{order.payment_status}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/invoice/${order.order_no}`} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 size-4" />
                Invoice
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/invoice/${order.order_no}/pos`} target="_blank" rel="noopener noreferrer">
                <Printer className="mr-2 size-4" />
                POS
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
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
                    onClick={async () => {
                      const toastId = toast.loading("Sending order to Steadfast...");
                      try {
                        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
                        const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
                        const res = await fetchClient(`${baseUrl}${endpoint}/${order.order_no}`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                        });

                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          throw new Error(err?.error || err?.message || "Failed to send to Steadfast.");
                        }

                        toast.success("Order sent to Steadfast successfully!", { id: toastId });
                      } catch (e: any) {
                        toast.error(e?.message || "Something went wrong.", { id: toastId });
                      }
                    }}
                  >
                    <Truck className="mr-2 size-4" />
                    Steadfast
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const toastId = toast.loading("Sending order to Pathao...");
                      try {
                        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
                        const res = await fetchClient(`${baseUrl}pathao-parcels/${order.order_no}`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                        });

                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          throw new Error(err?.error || err?.message || "Failed to send to Pathao.");
                        }

                        toast.success("Order sent to Pathao successfully!", { id: toastId });
                        mutate();
                      } catch (e: any) {
                        toast.error(e?.message || "Something went wrong.", { id: toastId });
                      }
                    }}
                  >
                    <Truck className="mr-2 size-4" />
                    Pathao
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => toast.success("Customer blocked.")}>
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
          <TabsTrigger value="parcel-history">
            <ShieldAlert className="mr-1.5 size-4 text-primary" />
            Parcel History
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
                      <div key={item.id ?? i} className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <img
                              src={getImageUrl(item.product?.product_thumbnail_img)}
                              alt={item.product?.title ?? "Product"}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-base font-medium leading-none">
                              {item.product?.title ?? "Unknown Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">SKU: {item.product?.sku ?? "—"}</p>
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
                              × {item.qty} = ৳{(Number(item.unit_price) * item.qty).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="flex flex-col gap-3 text-sm ml-auto w-full sm:w-1/2">
                    <div className="flex items-center justify-between border-b pb-2 mb-1">
                      <span className="font-semibold text-muted-foreground">Charges & Totals</span>
                      {!isEditingCosts ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShippingChargeInput(Number(order.shipping_charge ?? 0));
                            setDiscountAmountInput(Number(order.discount_amount ?? 0));
                            setIsEditingCosts(true);
                          }}
                          className="h-7 px-2 text-xs font-semibold"
                        >
                          <Edit className="mr-1 size-3" /> Edit
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveCosts}
                            disabled={isSavingCosts}
                            className="h-7 px-2 text-xs font-bold text-green-600 hover:text-green-700"
                          >
                            {isSavingCosts ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3 mr-1" />} Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingCosts(false)}
                            disabled={isSavingCosts}
                            className="h-7 px-2 text-xs font-medium text-muted-foreground"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center h-9">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">৳{Number(order.subtotal_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center h-9">
                      <span className="text-muted-foreground">Discount</span>
                      {isEditingCosts ? (
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
                          <input
                            type="number"
                            min="0"
                            value={discountAmountInput}
                            onChange={(e) => setDiscountAmountInput(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-right pr-2 pl-6 h-8 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ) : (
                        <span className="tabular-nums text-green-600 dark:text-green-400">
                          − ৳{Number(order.discount_amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center h-9">
                      <span className="text-muted-foreground">Shipping</span>
                      {isEditingCosts ? (
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
                          <input
                            type="number"
                            min="0"
                            value={shippingChargeInput}
                            onChange={(e) => setShippingChargeInput(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-right pr-2 pl-6 h-8 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ) : (
                        <span className="tabular-nums">৳{Number(order.shipping_charge).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center font-semibold text-base mt-1 pt-3 border-t h-9">
                      <span>Grand Total</span>
                      <span className="tabular-nums">
                        ৳{isEditingCosts 
                          ? (Number(order.subtotal_amount) - discountAmountInput + shippingChargeInput).toLocaleString()
                          : grandTotal.toLocaleString()}
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
                      <span className="text-sm text-muted-foreground">Grand Total</span>
                      <span className="text-base font-medium tabular-nums">৳{grandTotal.toLocaleString()}</span>
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
                          <div key={i} className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {p.payment_method ?? "Payment"} · {p.transaction_id ?? "—"}
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
                      <Label className="text-sm text-muted-foreground">Fulfillment Status</Label>
                      <Select value={orderStatus} onValueChange={setOrderStatus}>
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
                      <Label className="text-sm text-muted-foreground">Payment Status</Label>
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
                        disabled={!paymentChanged || isSavingPayment || paymentStatus === "Partially Paid"}
                        onClick={handleSavePaymentStatus}
                        className="self-start h-8 text-xs"
                        variant={paymentStatus === "Partially Paid" ? "secondary" : "default"}
                      >
                        {isSavingPayment ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 size-3.5" />
                        )}
                        {paymentStatus === "Partially Paid" ? "Open Payment Form" : "Save Payment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Note */}
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Order note</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNote((v) => !v)}>
                    {isEditingNote ? <X className="size-4" /> : <Edit className="size-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {note && !isEditingNote ? (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground">{note}</div>
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
                      <span className="text-base font-bold text-muted-foreground">{initials}</span>
                    </div>
                    <div>
                      <p className="text-base font-medium">{order.customer_full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      {order.customer_email && <p className="text-xs text-muted-foreground">{order.customer_email}</p>}
                    </div>
                  </div>

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
                    <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                      <Link href="/dashboard/customers">
                        <User className="size-4 text-muted-foreground" />
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Parcel History (Courier) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="size-4 text-primary" />
                    Parcel History (Courier)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fraudLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      Scanning courier metrics...
                    </div>
                  ) : fraudError ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-destructive font-medium">{fraudError}</p>
                    </div>
                  ) : fraudData ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="flex flex-col rounded-lg bg-muted/40 p-2">
                          <span className="font-semibold text-base">{fraudTotal}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                        </div>
                        <div className="flex flex-col rounded-lg bg-muted/40 p-2">
                          <span className="font-semibold text-base text-green-600 dark:text-green-400">
                            {fraudDelivered}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">Success</span>
                        </div>
                        <div className="flex flex-col rounded-lg bg-muted/40 p-2">
                          <span className="font-semibold text-base text-destructive">{fraudCancelled}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Failed</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t pt-2.5">
                        <span className="text-muted-foreground">Global Success Rate:</span>
                        <Badge
                          variant="outline"
                          className={`font-mono font-semibold border-none ${
                            fraudTotal === 0
                              ? "bg-muted text-muted-foreground"
                              : fraudDelivered / fraudTotal >= 0.8
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : fraudDelivered / fraudTotal >= 0.5
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {fraudSuccessRate}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center">
                        Scanned from Pathao, Steadfast, Redx & Paperfly
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">No courier metrics scanned.</p>
                  )}
                </CardContent>
              </Card>

              {/* Customer History (System Summary) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    Customer History (System)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parcelHistory ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="flex flex-col rounded-lg bg-muted/40 p-2">
                          <span className="font-semibold text-base">{parcelHistory.total ?? 0}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                        </div>
                        <div className="flex flex-col rounded-lg bg-muted/40 p-2">
                          <span className="font-semibold text-base text-green-600 dark:text-green-400">
                            {parcelHistory.delivered ?? 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">Success</span>
                        </div>
                        <div className="flex flex-col rounded-lg bg-muted/40 p-2">
                          <span className="font-semibold text-base text-destructive">
                            {parcelHistory.cancelled ?? 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">Failed</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t pt-2.5">
                        <span className="text-muted-foreground">Success Rate:</span>
                        <Badge variant="secondary" className="font-mono font-semibold">
                          {parcelHistory.success_rate ?? 0}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="font-semibold text-foreground">
                          ৳{Number(parcelHistory.total_spent ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">
                      No system order metrics available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping address</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{order.customer_full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_shipping_address}</p>
                      {order.shipping_area && (
                        <p className="text-xs text-muted-foreground mt-1">{order.shipping_area}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Order District</Label>
                    <div className="flex gap-2">
                      <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger className="h-9 text-sm flex-1">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {allDistricts.map((d) => (
                            <SelectItem key={d} value={d} className="text-sm">
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={selectedDistrict === (order.district ?? "") || isSavingDistrict}
                        onClick={handleSaveDistrict}
                        className="h-9"
                      >
                        {isSavingDistrict ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Save className="size-3.5 mr-1" />
                        )}
                        Save
                      </Button>
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
                      <Label className="text-sm text-muted-foreground">Courier</Label>
                      <span className="text-sm font-medium">{determinedCourier}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm text-muted-foreground">Parcel Status</Label>
                      <span className="text-sm font-medium">
                        {genuineStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {hasSteadfastParcel || hasPathaoParcel ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-md justify-center w-full select-none">
                        <Check className="size-4 shrink-0" />
                        <span>Already Sent</span>
                      </div>
                    ) : (
                      <>
                        {isSteadfastActive && (
                          <Button
                            size="sm"
                            className="w-full bg-[#00b074] hover:bg-[#00b074]/90 text-white font-medium gap-2"
                            onClick={async () => {
                              const toastId = toast.loading(`Sending Order ${order.order_no} to Steadfast...`);
                              try {
                                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
                                const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
                                const res = await fetchClient(`${baseUrl}${endpoint}/${order.order_no}`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  throw new Error(err?.error || err?.message || "Failed to send to Steadfast.");
                                }
                                toast.success(`Order ${order.order_no} sent to Steadfast`, { id: toastId });
                                mutate();
                              } catch (err: any) {
                                toast.error(err?.message || "Something went wrong.", { id: toastId });
                              }
                            }}
                          >
                            <Truck className="size-4" /> Send via Steadfast
                          </Button>
                        )}
                        {isPathaoActive && (
                          <Button
                            size="sm"
                            className="w-full bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium gap-2"
                            onClick={async () => {
                              const toastId = toast.loading(`Sending Order ${order.order_no} to Pathao...`);
                              try {
                                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
                                const res = await fetchClient(`${baseUrl}pathao-parcels/${order.order_no}`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  throw new Error(err?.error || err?.message || "Failed to send to Pathao.");
                                }
                                toast.success(`Order ${order.order_no} sent to Pathao`, { id: toastId });
                                mutate();
                              } catch (err: any) {
                                toast.error(err?.message || "Something went wrong.", { id: toastId });
                              }
                            }}
                          >
                            <Send className="size-4" /> Send via Pathao
                          </Button>
                        )}
                        {!isSteadfastActive && !isPathaoActive && (
                          <span className="text-xs text-muted-foreground text-center italic py-2">
                            Courier integrations are not active.
                          </span>
                        )}
                      </>
                    )}
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
                            <p className="text-sm font-medium leading-none">{log.status ?? log.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.created_at ? formatDate(log.created_at) : "—"}
                            </p>
                            {log.note && <p className="text-sm mt-1">{log.note}</p>}
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
                          show: ["Confirmed", "In-Courier", "Ready To Ship", "Delivered"].includes(order.order_status),
                        },
                        {
                          label: "Dispatched",
                          desc: `Handed to ${determinedCourier === "—" ? "courier" : determinedCourier}.`,
                          date: formatDate(order.updated_at),
                          icon: Truck,
                          show: determinedCourier !== "—",
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
                              <p className="text-sm font-medium leading-none">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.date}</p>
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
                  <CustomerOrderHistory orders={customerOrders} currentOrderNo={order.order_no} />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              {/* Customer Summary Card inside history tab */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
                      <span className="text-base font-bold text-muted-foreground">{initials}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{order.customer_full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
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
                        ৳{customerOrders.reduce((sum, o) => sum + Number(o.grand_total_amount), 0).toLocaleString()}
                      </span>
                    </div>
                    {parcelHistory && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivered</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {parcelHistory.delivered ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cancelled</span>
                          <span className="font-semibold text-destructive">{parcelHistory.cancelled ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success rate</span>
                          <span className="font-semibold">{parcelHistory.success_rate ?? 0}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── PARCEL HISTORY TAB ─── */}
        <TabsContent value="parcel-history">
          <Card className="shadow-md">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="size-5 text-muted-foreground" />
                    Courier-wise Breakdown
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Aggregated delivery metrics for the provided phone number
                  </CardDescription>
                </div>
                <Badge variant={fraudStatusVariant} className="bg-background">
                  Status: {fraudStatusText}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-transparent">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground h-10 px-6">COURIER SERVICE</TableHead>
                      <TableHead className="text-center font-semibold text-foreground h-10">TOTAL</TableHead>
                      <TableHead className="text-center font-semibold text-foreground h-10">DELIVERED</TableHead>
                      <TableHead className="text-center font-semibold text-foreground h-10">CANCELLED</TableHead>
                      <TableHead className="text-center font-semibold text-foreground h-10 px-6">SUCCESS RATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedCouriers.map((courier) => (
                      <TableRow key={courier.name} className="transition-colors hover:bg-muted/40">
                        <TableCell className="font-medium py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-md bg-muted/50 border flex items-center justify-center shrink-0">
                              <Package className="size-4 text-muted-foreground" />
                            </div>
                            {courier.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3 font-medium tabular-nums">{courier.total}</TableCell>
                        <TableCell className="text-center py-3 font-medium tabular-nums text-green-600 dark:text-green-500">
                          {courier.delivered}
                        </TableCell>
                        <TableCell className="text-center py-3 font-medium tabular-nums text-red-600 dark:text-red-500">
                          {courier.cancelled}
                        </TableCell>
                        <TableCell className="text-center py-3 px-6">
                          <Badge variant="secondary" className="px-3 py-1 font-semibold tabular-nums text-muted-foreground">
                            {courier.successRate}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-primary/5 border-t-2 border-primary/20">
                    <TableRow className="hover:bg-primary/5">
                      <TableCell className="py-3 px-6 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-primary" />
                          AGGREGATE TOTAL
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 font-bold text-foreground tabular-nums text-lg text-primary">
                        {aggregateTotal}
                      </TableCell>
                      <TableCell className="text-center py-3 font-bold text-green-600 dark:text-green-500 tabular-nums text-lg">
                        {aggregateDelivered}
                      </TableCell>
                      <TableCell className="text-center py-3 font-bold text-red-600 dark:text-red-500 tabular-nums text-lg">
                        {aggregateCancelled}
                      </TableCell>
                      <TableCell className="text-center py-3 px-6">
                        <Badge className="px-3 py-1 font-bold bg-primary text-primary-foreground hover:bg-primary">
                          {aggregateSuccessRate}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
