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
  Check,
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
  Loader2,
  MoreHorizontal,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldOff,
  Trash2,
  Truck,
  UserPlus,
  UserX,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

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
import { useAuth } from "@/hooks/useAuth";
import { usePathaoSetup } from "@/hooks/usePathaoSetup";
import { useRedxSetup } from "@/hooks/useRedxSetup";
import { hasModuleAccess } from "@/hooks/useRoles";
import { useSteadfastSetup } from "@/hooks/useSteadfastSetup";
import { OrderContext } from "../page";
import { fetchClient } from "@/lib/fetch-client";
import { usePrintModal } from "@/hooks/usePrintModal";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { AssignOrderDialog } from "../assign-orders/_components/assign-order-dialog";
import { UpdatePaymentModal } from "./update-payment-modal";
import { EditOrderForm } from "./edit-order-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
  "Incomplete",
] as const;
const paymentStatuses = ["All", "Full Paid", "Unpaid", "Partially Paid", "Refund"] as const;

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
  orderedProducts: any[];
  parcelStatus: string;
  courier: string;
  parcelHistory: { total: number; delivered: number; cancelled: number; successRate: string };
  previousOrdersCountByPhone?: number;
  ipAddress?: string;
  createdAt?: string;
  shippingAddress?: string;
  steadfast_parcel?: any;
  pathao_parcel?: any;
  redx_parcel?: any;
  courier_details?: any;
  source?: string;
  is_ai_called?: boolean;
  invoice_status?: string;
}

/* ---- Status badge colors ---- */

export function orderStatusVariant(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (["Delivered", "Ready To Ship", "In-Courier"].includes(s)) return "default";
  if (["Cancelled", "Fake", "Trash", "Lost", "Returned"].includes(s)) return "destructive";
  if (["Pending", "Hold", "Ship Later", "Missing"].includes(s)) return "outline";
  return "secondary";
}

export function paymentBadge(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (s === "Full Paid") return "default";
  if (s === "Refund") return "destructive";
  if (s === "Partially Paid") return "secondary";
  return "outline";
}

/* ---- API Helpers ---- */
export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

export function invalidateOrders() {
  const ordersEndpoint = process.env.NEXT_PUBLIC_API_WEB_ORDERS || "orders";
  mutate(
    (key) => {
      if (typeof key === "string") {
        return key.includes(ordersEndpoint);
      }
      if (Array.isArray(key)) {
        return key.some((k) => typeof k === "string" && k.includes(ordersEndpoint));
      }
      return false;
    },
    undefined,
    { revalidate: true },
  );
}

export function SendCourierCell({ row, readOnly }: { row: any; readOnly?: boolean }) {
  const { data: steadfastConfig } = useSteadfastSetup();
  const { data: pathaoConfig } = usePathaoSetup();
  const { data: redxConfig } = useRedxSetup();

  const isSteadfastActive = steadfastConfig?.is_active === 1;
  const isPathaoActive = pathaoConfig?.status === "active";
  const isRedxActive = redxConfig?.status === "active";

  const hasSteadfastParcel = !!row.original.steadfast_parcel || !!row.original.steadfastParcel;
  const hasPathaoParcel = !!row.original.pathao_parcel || !!row.original.pathaoParcel;
  const hasRedxParcel = !!row.original.redx_parcel || !!row.original.redxParcel;

  const [courierStatus, setCourierStatus] = React.useState<string | null>(null);
  const [courierLoading, setCourierLoading] = React.useState(false);
  const [payInfo, setPayInfo] = React.useState<{ invoiceId: string | null; paymentStatus: string | null } | null>(null);

  React.useEffect(() => {
    if (!hasSteadfastParcel && !hasPathaoParcel && !hasRedxParcel) return;

    let isMounted = true;
    const fetchCourierStatus = async () => {
      setCourierLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
        const courier = hasSteadfastParcel ? "steadfast" : hasRedxParcel ? "redx" : "pathao";
        const res = await fetchClient(`${baseUrl}${courier}-parcels/${row.original.id}/status`);
        if (!isMounted) return;
        if (res.ok) {
          const json = await res.json();
          const nested = json.data?.data || json.data || json;
          const status =
            nested.parcel?.status ||
            nested.order_status_slug ||
            nested.order_status ||
            nested.delivery_status ||
            nested.status ||
            nested.parcel_status ||
            "Unknown";
          setCourierStatus(status.trim().toLowerCase());

          setPayInfo({
            invoiceId: nested.invoice_id || null,
            paymentStatus: nested.payment_status || null,
          });
        } else {
          setCourierStatus(row.original.courier_details?.parcel_status || null);
          setPayInfo({
            invoiceId: row.original.courier_details?.invoice_id || null,
            paymentStatus: row.original.courier_details?.payment_status || null,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setCourierStatus(row.original.courier_details?.parcel_status || null);
        setPayInfo({
          invoiceId: row.original.courier_details?.invoice_id || null,
          paymentStatus: row.original.courier_details?.payment_status || null,
        });
      } finally {
        if (isMounted) setCourierLoading(false);
      }
    };

    fetchCourierStatus();
    return () => {
      isMounted = false;
    };
  }, [row.original.id, hasSteadfastParcel, hasPathaoParcel, hasRedxParcel, row.original.courier_details?.parcel_status]);

  if (hasSteadfastParcel || hasPathaoParcel || hasRedxParcel) {
    if (courierLoading) {
      return (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted border border-muted-foreground/10 px-2.5 py-1 rounded-md justify-center w-[135px] select-none">
          <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
          <span className="truncate">Loading...</span>
        </div>
      );
    }
    const rawStatus = courierStatus || row.original.courier_details?.parcel_status || "pending";
    const statusText = rawStatus.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

    let statusClass = "border-blue-500 text-blue-600 bg-blue-500/5 hover:bg-blue-500/10";
    if (hasPathaoParcel || hasRedxParcel) {
      if (rawStatus === "delivered") {
        statusClass = "border-green-500 text-green-600 bg-green-500/5 hover:bg-green-500/10";
      } else if (rawStatus === "cancelled" || rawStatus === "failed") {
        statusClass = "border-red-500 text-red-600 bg-red-500/5 hover:bg-red-500/10";
      } else if (rawStatus === "returned" || rawStatus === "return") {
        statusClass = "border-orange-500 text-orange-600 bg-orange-500/5 hover:bg-orange-500/10";
      }
    } else if (hasSteadfastParcel) {
      if (rawStatus === "delivered") {
        statusClass = "border-green-500 text-green-600 bg-green-500/5 hover:bg-green-500/10";
      } else if (rawStatus === "cancelled") {
        statusClass = "border-red-500 text-red-600 bg-red-500/5 hover:bg-red-500/10";
      } else if (rawStatus === "returned" || rawStatus === "in_return") {
        statusClass = "border-orange-500 text-orange-600 bg-orange-500/5 hover:bg-orange-500/10";
      } else if (
        rawStatus === "delivered_approval_pending" ||
        rawStatus === "partial_delivered_approval_pending" ||
        rawStatus === "unknown_approval_pending"
      ) {
        statusClass = "border-yellow-500 text-yellow-600 bg-yellow-500/5 hover:bg-yellow-500/10";
      }
    }

    const courierName = hasSteadfastParcel ? "Steadfast" : hasPathaoParcel ? "Pathao" : hasRedxParcel ? "RedX" : "";

    return (
      <div className="flex flex-col gap-1.5 w-[135px] items-center select-none">
        {courierName && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {courierName}
          </span>
        )}
        <Badge
          variant="outline"
          className={`text-[11px] font-bold px-2 py-0.5 rounded border justify-center w-full text-center ${statusClass}`}
        >
          {statusText}
        </Badge>
        {payInfo && (payInfo.invoiceId || payInfo.paymentStatus) && (
          <div className="flex flex-col gap-0.5 w-full text-left px-1 mt-0.5 border-t border-dashed pt-1.5 border-muted-foreground/20">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-muted-foreground uppercase">Inv:</span>
              <span className="font-mono font-medium text-foreground truncate max-w-[85px]" title={payInfo.invoiceId || "—"}>
                {payInfo.invoiceId || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="font-semibold text-muted-foreground uppercase">Pay:</span>
              {payInfo.paymentStatus ? (
                <span className={`font-bold px-1 rounded-[3px] text-[9px] border ${payInfo.paymentStatus.toLowerCase().includes("paid")
                  ? "border-green-500/30 text-green-600 bg-green-500/5"
                  : payInfo.paymentStatus.toLowerCase().includes("cancel") || payInfo.paymentStatus.toLowerCase().includes("fail") || payInfo.paymentStatus.toLowerCase().includes("refund")
                    ? "border-red-500/30 text-red-600 bg-red-500/5"
                    : "border-amber-500/30 text-amber-600 bg-amber-500/5"
                  }`}>
                  {payInfo.paymentStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (row.original.orderStatus === "Delivered") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md justify-center w-[135px] select-none">
        <span className="truncate">Office Delivered</span>
      </div>
    );
  }

  if (!isSteadfastActive && !isPathaoActive && !isRedxActive) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (readOnly) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted border border-muted-foreground/10 px-2.5 py-1 rounded-md justify-center w-[135px] select-none">
        <span className="truncate">Not Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-[135px]">
      {isSteadfastActive && (
        <Button
          size="sm"
          className="h-7 bg-[#00b074] hover:bg-[#00b074]/90 text-white text-[11px] px-2 justify-start font-medium"
          onClick={async () => {
            const toastId = toast.loading(`Sending Order ${row.original.id} to Steadfast...`);
            try {
              const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
              const res = await fetchClient(`${getApiBaseUrl()}${endpoint}/${row.original.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || err?.message || "Failed to send to Steadfast.");
              }
              toast.success(`Order ${row.original.id} sent to Steadfast`, { id: toastId });
              invalidateOrders();
            } catch (err: any) {
              toast.error(err?.message || "Something went wrong.", { id: toastId });
            }
          }}
        >
          <Truck className="mr-1.5 size-3.5" /> Steadfast
        </Button>
      )}
      {isPathaoActive && (
        <Button
          size="sm"
          className="h-7 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-[11px] px-2 justify-start font-medium"
          onClick={async () => {
            const toastId = toast.loading(`Sending Order ${row.original.id} to Pathao...`);
            try {
              const res = await fetchClient(`${getApiBaseUrl()}pathao-parcels/${row.original.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || err?.message || "Failed to send to Pathao.");
              }
              toast.success(`Order ${row.original.id} sent to Pathao`, { id: toastId });
              invalidateOrders();
            } catch (err: any) {
              toast.error(err?.message || "Something went wrong.", { id: toastId });
            }
          }}
        >
          <Truck className="mr-1.5 size-3.5" /> Pathao
        </Button>
      )}
      {isRedxActive && (
        <Button
          size="sm"
          className="h-7 bg-rose-600 hover:bg-rose-600/90 text-white text-[11px] px-2 justify-start font-medium"
          onClick={async () => {
            const toastId = toast.loading(`Sending Order ${row.original.id} to RedX...`);
            try {
              const res = await fetchClient(`${getApiBaseUrl()}redx-parcels/${row.original.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || err?.message || "Failed to send to RedX.");
              }
              toast.success(`Order ${row.original.id} sent to RedX`, { id: toastId });

              // Automation: Update order status to "Ready To Ship"
              try {
                await fetchClient(`${getApiBaseUrl()}orders/bulk-update-status`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ order_nos: [row.original.id], order_status: "Ready To Ship" }),
                });
              } catch (e) {
                console.warn("Failed to update status to Ready To Ship", e);
              }

              invalidateOrders();
            } catch (err: any) {
              toast.error(err?.message || "Something went wrong.", { id: toastId });
              if (err?.message?.includes("already sent")) {
                invalidateOrders();
              }
            }
          }}
        >
          <Truck className="mr-1.5 size-3.5" /> RedX
        </Button>
      )}
    </div>
  );
}

function AssignedEmployeeCell({ row }: { row: any }) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const employeeName = row.original.assignedEmployee;
  const hasAssignAccess = hasModuleAccess(user, "assign_orders");

  if (!hasAssignAccess) {
    return <div className="w-[100px] text-xs font-semibold text-neutral-600 pl-1">{employeeName || "—"}</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-1 w-[100px]">
        {employeeName ? (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-2 py-1 rounded-md justify-between cursor-pointer transition-colors"
            onClick={() => setDialogOpen(true)}
          >
            <span className="truncate">{employeeName}</span>
            <Edit className="size-3 shrink-0 text-muted-foreground" />
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] px-2 text-muted-foreground border-dashed border-muted-foreground/40 hover:text-foreground justify-center font-medium"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="mr-1 size-3" /> Assign
          </Button>
        )}
      </div>

      <AssignOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prefilledOrderNo={row.original.id}
        onSuccess={invalidateOrders}
      />
    </>
  );
}

/* ---- Columns ---- */

function PaymentStatusCell({ row }: { row: any }) {
  const [status, setStatus] = React.useState(row.original.paymentStatus);
  const [modalOpen, setModalOpen] = React.useState(false);

  if (row.original.orderStatus === "Cancelled" || row.original.orderStatus === "Fake") {
    return <span className="text-xs text-muted-foreground font-medium pl-1">Not Available</span>;
  }

  return (
    <>
      <Select
        value={status}
        onValueChange={async (val) => {
          setStatus(val);
          if (val === "Partially Paid") {
            setModalOpen(true);
          } else {
            const toastId = toast.loading(`Updating payment...`);
            try {
              const payload: Record<string, unknown> = { payment_status: val };
              // When marking as Full Paid, send the grand total as the paid amount
              if (val === "Full Paid") {
                payload.paid_amount = Number(row.original.total ?? 0);
              }
              const res = await fetchClient(`${getApiBaseUrl()}orders/${row.original.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (!res.ok) throw new Error();
              toast.success(`Order ${row.original.id} payment → ${val}`, { id: toastId });
              invalidateOrders();
            } catch (err) {
              toast.error("Failed to update payment status.", { id: toastId });
              setStatus(row.original.paymentStatus);
            }
          }
        }}
      >
        <SelectTrigger className="h-7 w-[115px] text-xs border-border/60 rounded-md px-2 gap-1">
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
  const products = row.original.orderedProducts || [];
  return (
    <div className="flex flex-col gap-2 w-full">
      {products.map((prod: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="size-8 shrink-0 overflow-hidden rounded border bg-muted border-border/50">
            <img src={prod.image} alt="" className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-semibold leading-snug text-foreground whitespace-normal break-words max-w-[9ch]"
              title={prod.name}
            >
              {prod.name}
            </p>
            <div className="flex flex-col text-[10px] text-muted-foreground mt-0.5 gap-0.5">
              <span>Qty: <span className="font-semibold text-foreground">{prod.qty}</span></span>
              {prod.size && prod.size !== "—" && (
                <span>Size: <span className="font-medium text-foreground">{prod.size}</span></span>
              )}
              {prod.color && prod.color !== "—" && (
                <span>Color: <span className="font-medium text-foreground">{prod.color}</span></span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CourierHistoryCell({ row }: { row: any }) {
  const { features } = useModularFeatures();
  const phone = row.original.phone;

  const [loading, setLoading] = React.useState(false);
  const [liveData, setLiveData] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
    fetchClient(`${baseUrl}fraud-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((resData) => {
        if (!isMounted) return;
        if (resData && resData.apis) {
          let total = 0;
          let delivered = 0;
          let cancelled = 0;

          Object.values(resData.apis).forEach((raw: any) => {
            total += Number(raw.total_parcels ?? raw.total ?? 0);
            delivered += Number(
              raw.total_delivered_parcels ?? raw.success ?? raw.delivered ?? raw.total_delivered ?? 0,
            );
            cancelled += Number(raw.total_cancelled_parcels ?? raw.cancel ?? raw.cancelled ?? raw.total_cancelled ?? 0);
          });

          const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

          setLiveData({ total, delivered, cancelled, successRate });
        }
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [phone]);

  if (features && (features.fraud_checker === false || String(features.fraud_checker) === "0")) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-[120px]">
        <Loader2 className="size-3 animate-spin text-primary shrink-0" />
        <span>Scanning Customer</span>
      </div>
    );
  }

  const history = liveData || { total: "-", delivered: "-", cancelled: "-", successRate: "-" };

  return (
    <div className="min-w-[120px] text-[11px] space-y-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Total:</span>
        <span className="font-semibold tabular-nums">{history.total}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Delivered:</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-500 tabular-nums">{history.delivered}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Cancelled:</span>
        <span className="font-semibold text-destructive tabular-nums">{history.cancelled}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="font-semibold text-emerald-600 dark:text-emerald-500">
          {history.successRate !== "-" ? `${history.successRate}% success` : "-"}
        </span>
      </div>
    </div>
  );
}

function CustomerFraudSuccessRate({ phone }: { phone: string }) {
  const { features } = useModularFeatures();
  const [loading, setLoading] = React.useState(false);
  const [successRate, setSuccessRate] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
    fetchClient(`${baseUrl}fraud-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((resData) => {
        if (!isMounted) return;
        if (resData && resData.apis) {
          let total = 0;
          let delivered = 0;
          Object.values(resData.apis).forEach((raw: any) => {
            total += Number(raw.total_parcels ?? raw.total ?? 0);
            delivered += Number(
              raw.total_delivered_parcels ?? raw.success ?? raw.delivered ?? raw.total_delivered ?? 0,
            );
          });
          const rate = total > 0 ? Math.round((delivered / total) * 100) : 0;
          setSuccessRate(rate);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [phone]);

  if (features && (features.fraud_checker === false || String(features.fraud_checker) === "0")) return null;

  if (loading) {
    return (
      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
        <Loader2 className="size-2.5 animate-spin shrink-0 text-primary" />
        Scanning...
      </span>
    );
  }

  if (successRate === null) return null;

  return (
    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1.5">
      {successRate}% Success Rate
    </div>
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
    cell: ({ row }) => {
      const getRelativeTime = (dateStr?: string) => {
        if (!dateStr) return "";
        try {
          const rawStr = dateStr.replace("Z", "").split(".")[0].replace(" ", "T");
          const date = new Date(rawStr);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          if (isNaN(diffMs) || diffMs < 0) return "just now";

          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const calendarDiffDays = Math.floor((today.getTime() - orderDate.getTime()) / 86400000);

          if (calendarDiffDays === 0) {
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return "just now";
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            return `${diffHours}h ago`;
          } else if (calendarDiffDays === 1) {
            return "yesterday";
          } else if (calendarDiffDays < 7) {
            return `${calendarDiffDays}d ago`;
          } else {
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            });
          }
        } catch {
          return "";
        }
      };

      return (
        <div className="flex flex-col gap-0.5 text-left w-full max-w-[14ch]">
          <p className="font-mono text-sm font-semibold whitespace-normal break-words">{row.original.id}</p>
          <p className="text-[11px] text-muted-foreground">
            {row.original.date} · {row.original.time}
          </p>
          <p className="text-[11px] text-muted-foreground/80 font-mono">IP: {row.original.ipAddress || "—"}</p>
          {(row.original.createdAt || row.original.source) && (
            <div className="flex items-center justify-between gap-2 mt-1">
              {row.original.createdAt ? (
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {getRelativeTime(row.original.createdAt)}
                </p>
              ) : (
                <div />
              )}
              {row.original.source && (
                <Badge
                  variant="outline"
                  className={`text-[9px] font-bold px-1.5 py-0 h-4 border leading-none shrink-0 ${row.original.source === "Website"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
                    }`}
                >
                  {row.original.source === "Incomplete" ? "From Incomplete" : row.original.source}
                </Badge>
              )}
            </div>
          )}
          {row.original.invoice_status && (
            <div className="mt-1">
              <Badge
                variant="outline"
                className={`text-[9px] font-bold px-1.5 py-0 h-4 border leading-none w-fit ${
                  row.original.invoice_status === "Invoiced"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20"
                }`}
              >
                {row.original.invoice_status}
              </Badge>
            </div>
          )}
        </div>
      );
    },
  },

  // Customer column
  {
    id: "customerInfo",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 max-w-[11ch]">
          <p className="text-sm font-medium leading-tight whitespace-normal break-words">{row.original.customer}</p>
          <p className="text-[11px] text-muted-foreground whitespace-normal break-words">{row.original.phone}</p>
          {row.original.shippingAddress && (
            <p className="text-[10px] text-muted-foreground/80 mt-1 break-words whitespace-normal">
              {row.original.shippingAddress}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <Button variant="outline" size="sm" className="h-6 gap-1 text-[10px] px-2" asChild>
              <a href={`tel:${row.original.phone}`}>
                <Phone className="size-3" /> Call
              </a>
            </Button>
            {row.original.previousOrdersCountByPhone && row.original.previousOrdersCountByPhone > 1 ? (
              <Badge
                variant="secondary"
                className="text-[9px] h-5 px-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border-none font-semibold uppercase tracking-wider"
              >
                Old
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="text-[9px] h-5 px-1.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 border-none font-semibold uppercase tracking-wider"
              >
                New
              </Badge>
            )}
          </div>
          <div className="mt-1.5 w-full">
            <AiAutoCallButton orderId={row.original.id} isAiCalled={row.original.is_ai_called} />
          </div>
          <CustomerFraudSuccessRate phone={row.original.phone} />
        </div>
      </div>
    ),
  },

  // Payment info column
  {
    id: "paymentInfo",
    header: "Payment",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      if (meta?.simplifiedPaymentColumn) {
        return (
          <div className="min-w-[110px] space-y-0.5">
            <p className="text-[11px]">
              Total: <span className="font-semibold tabular-nums">৳{row.original.total.toLocaleString()}</span>
            </p>
          </div>
        );
      }
      return (
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
          {row.original.orderStatus !== "Cancelled" && row.original.orderStatus !== "Fake" && (
            <p className="text-[11px] text-destructive">
              Due: <span className="font-semibold tabular-nums">৳{row.original.due.toLocaleString()}</span>
            </p>
          )}
        </div>
      );
    },
  },

  // Products column
  { id: "products", header: "Products", cell: ({ row }) => <ProductsCell row={row} /> },

  // Courier History column
  {
    id: "courierHistory",
    header: "Courier History",
    cell: ({ row }) => <CourierHistoryCell row={row} />,
  },

  // Order Status column
  {
    id: "oStatus",
    header: "Order Status",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <Select
          defaultValue={row.original.orderStatus}
          onValueChange={async (val) => {
            const toastId = toast.loading("Updating status...");
            try {
              const res = await fetchClient(`${getApiBaseUrl()}orders/${row.original.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_status: val }),
              });
              if (!res.ok) throw new Error();
              toast.success(`Order ${row.original.id} status → ${val}`, { id: toastId });
              invalidateOrders();
            } catch (e) {
              toast.error("Failed to update status", { id: toastId });
            }
          }}
        >
          <SelectTrigger className="h-7 w-[115px] text-xs border-border/60 rounded-md px-2 gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orderStatuses
              .filter((s) => s !== "All")
              .filter((s) => meta?.showIncompleteStatus ? true : s !== "Incomplete")
              .map((status) => (
                <SelectItem key={status} value={status} className="text-xs">
                  {status}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )
    },
  },

  // Payment Status column
  { id: "pStatus", header: "Payment Status", cell: ({ row }) => <PaymentStatusCell row={row} /> },

  // Assigned Employee column
  {
    id: "assignedEmployee",
    header: "Assigned To",
    cell: ({ row }) => <AssignedEmployeeCell row={row} />,
  },

  // Courier column
  {
    id: "sendCourier",
    header: "Courier",
    cell: ({ row }) => <SendCourierCell row={row} />,
  },

  // Actions column
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const incompleteMode = (table.options.meta as any)?.incompleteOrdersMode;

      if (incompleteMode) {
        return (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">Complete Order</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
                <EditOrderForm orderId={row.original.id} incompleteMode={true} onCompleted={() => {
                  // Refresh the table by mutating
                  mutate((key) => typeof key === "string" && key.includes("orders"));
                }} />
              </DialogContent>
            </Dialog>
          </div>
        );
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/${row.original.id}`}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${row.original.id}/edit`}>
                <Edit className="mr-2 size-4" />
                Edit
              </Link>
            </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => usePrintModal.getState().openModal(row.original.id, "a4", `/invoice/${row.original.id}`)}>
                <FileText className="mr-2 size-4 text-muted-foreground" />
                Print A4 Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => usePrintModal.getState().openModal(row.original.id, "pos", `/invoice/${row.original.id}/pos`)}>
                <Printer className="mr-2 size-4 text-muted-foreground" />
                Print POS Receipt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => usePrintModal.getState().openModal(row.original.id, "label", `/invoice/${row.original.id}/label`)}>
                <Truck className="mr-2 size-4 text-muted-foreground" />
                Print Courier Label
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem onClick={() => toast.warning(`Customer ${row.original.customer} blocked.`)}>
              <Ban className="mr-2 size-4" />
              Block
            </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
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

export interface OrdersTableProps {
  data: OrderRow[];
  hideOrderStatusFilter?: boolean;
  hidePaymentStatusFilter?: boolean;
  hidePaymentStatusColumn?: boolean;
  simplifiedPaymentColumn?: boolean;
  showIncompleteStatus?: boolean;
  incompleteOrdersMode?: boolean;
  hideActionsColumn?: boolean;
  useServerPagination?: boolean;
}

const AiAutoCallButton = ({ orderId, isAiCalled }: { orderId: string; isAiCalled?: boolean }) => {
  const [isCalling, setIsCalling] = React.useState(false);

  if (isAiCalled) {
    return (
      <Badge variant="outline" className="h-6 w-full gap-1 text-[10px] px-2 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 transition-colors flex justify-center items-center font-normal">
        <Bot className="size-3" />
        Already AI Called!
      </Badge>
    );
  }

  const handleAiCall = async () => {
    setIsCalling(true);
    try {
      const response = await fetchClient(`${getApiBaseUrl()}orders/${orderId}/ai-call`, {
        method: "POST",
      });

      if (!response.ok) {
        let errMsg = "Failed to trigger AI call";
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      toast.success("AI Auto Call triggered successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong while triggering AI call.");
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-6 w-full gap-1 text-[10px] px-2 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 transition-colors"
      onClick={handleAiCall}
      disabled={isCalling}
    >
      {isCalling ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />}
      AI Auto Call
    </Button>
  );
};

export function OrdersTable({ data, hideOrderStatusFilter, hidePaymentStatusFilter, hidePaymentStatusColumn, simplifiedPaymentColumn, showIncompleteStatus, incompleteOrdersMode, hideActionsColumn, useServerPagination }: OrdersTableProps) {
  const { features } = useModularFeatures();
  const context = React.useContext(OrderContext);

  const [localPage, setLocalPage] = React.useState(1);
  const [localPerPage, setLocalPerPage] = React.useState(100);
  const [localSearchQuery, setLocalSearchQuery] = React.useState("");
  const [localStatusFilter, setLocalStatusFilter] = React.useState(hideOrderStatusFilter ? "All" : "Pending");
  const [localPaymentFilter, setLocalPaymentFilter] = React.useState("All");
  const [localCourierFilter, setLocalCourierFilter] = React.useState("All");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const page = useServerPagination ? context.page : localPage;
  const setPage = useServerPagination ? context.setPage : setLocalPage;
  const perPage = useServerPagination ? context.perPage : localPerPage;
  const setPerPage = useServerPagination ? context.setPerPage : setLocalPerPage;
  const searchQuery = useServerPagination ? context.searchQuery : localSearchQuery;
  const statusFilter = useServerPagination ? context.statusFilter : localStatusFilter;
  const paymentFilter = useServerPagination ? context.paymentFilter : localPaymentFilter;
  const courierFilter = useServerPagination && context.courierFilter !== undefined ? context.courierFilter : localCourierFilter;

  const setSearchQuery = useServerPagination ? context.setSearchQuery : (v: string) => {
    setLocalSearchQuery(v);
    setColumnFilters(prev => {
      const p = prev.filter(f => f.id !== "search");
      if (v) p.push({ id: "search", value: v });
      return p;
    });
  };

  const setStatusFilter = useServerPagination ? context.setStatusFilter : (v: string) => {
    setLocalStatusFilter(v);
    setColumnFilters(prev => {
      const p = prev.filter(f => f.id !== "orderStatus");
      if (v !== "All") p.push({ id: "orderStatus", value: v });
      return p;
    });
  };

  const setPaymentFilter = useServerPagination ? context.setPaymentFilter : (v: string) => {
    setLocalPaymentFilter(v);
    setColumnFilters(prev => {
      const p = prev.filter(f => f.id !== "paymentStatus");
      if (v !== "All") p.push({ id: "paymentStatus", value: v });
      return p;
    });
  };

  const setCourierFilter = useServerPagination && context.setCourierFilter !== undefined ? context.setCourierFilter : (v: string) => {
    setLocalCourierFilter(v);
    // client-side courier filter is complex because it requires looking into parcel objects,
    // which aren't a flat column in this table structure, so we just set state.
    // Client-side users typically don't have this filter active in the same way.
  };

  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);
  const [showStatusFilter, setShowStatusFilter] = React.useState(true);
  const [showPaymentFilter, setShowPaymentFilter] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});

  // Default sorting
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters: useServerPagination ? undefined : columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
      columnVisibility: {
        search: false,
        orderStatus: false,
        paymentStatus: false,
        category: false,
        subCategory: false,
        courierHistory: features?.fraud_checker === false || String(features?.fraud_checker) === "0" ? false : false,
        pStatus: !hidePaymentStatusColumn,
        sendCourier: !incompleteOrdersMode,
        oStatus: !incompleteOrdersMode,
        actions: !hideActionsColumn,
        assignedEmployee: features?.employee_management !== false && String(features?.employee_management) !== "0",
      },
    },
    meta: {
      simplifiedPaymentColumn,
      showIncompleteStatus,
      incompleteOrdersMode,
    },
    getRowId: (r) => r.id,
    pageCount: useServerPagination ? (context.pagination?.last_page || -1) : Math.ceil(data.length / perPage),
    manualPagination: !!useServerPagination,
    manualFiltering: !!useServerPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: useServerPagination ? undefined : setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page - 1, pageSize: perPage });
        setPage(newState.pageIndex + 1);
        setPerPage(newState.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPerPage(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: useServerPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: useServerPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = useServerPagination ? (context.pagination?.total || 0) : table.getFilteredRowModel().rows.length;

  function applyOrderFilter(v: string) {
    setStatusFilter(v);
    setPage(1);
    setRowSelection({});
  }
  function applyPaymentFilter(v: string) {
    setPaymentFilter(v);
    setPage(1);
    setRowSelection({});
  }
  function clearAllFilters() {
    setStatusFilter(hideOrderStatusFilter ? "All" : "Pending");
    setPaymentFilter("All");
    setSearchQuery("");
    setPage(1);
    setRowSelection({});
  }

  const hasFilters = statusFilter !== (hideOrderStatusFilter ? "All" : "Pending") || paymentFilter !== "All" || searchQuery;

  const handleBulkUpdate = async (type: "status" | "payment", val: string) => {
    const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);
    const toastId = toast.loading(`Updating ${selectedIds.length} orders...`);
    try {
      const endpoint = type === "status" ? "bulk-update-status" : "bulk-update-payment";
      const bodyKey = type === "status" ? "order_status" : "payment_status";

      const res = await fetch(`${getApiBaseUrl()}orders/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_nos: selectedIds, [bodyKey]: val }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Successfully updated ${selectedIds.length} orders.`, { id: toastId });
      setRowSelection({});
      invalidateOrders();
    } catch (err) {
      toast.error(`Failed to bulk update orders.`, { id: toastId });
    }
  };

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
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {hasFilters && (
            <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Select
              value={courierFilter}
              onValueChange={(v) => { setCourierFilter(v); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-[100px] sm:w-[120px]">
                <SelectValue placeholder="Courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Courier</SelectItem>
                <SelectItem value="Steadfast">Steadfast</SelectItem>
                <SelectItem value="Pathao">Pathao</SelectItem>
                <SelectItem value="RedX">RedX</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Rows:</span>
            <Select
              value={`${perPage}`}
              onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100, 150, 200].map((s) => (
                  <SelectItem key={s} value={`${s}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          {!hideOrderStatusFilter && (
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
                  {orderStatuses
                    .filter((s) => showIncompleteStatus ? true : s !== "Incomplete")
                    .map((s) => (
                      <Button
                        key={s}
                        variant={statusFilter === s ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => applyOrderFilter(s)}
                      >
                        {s}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Status Filter */}
          {!hidePaymentStatusFilter && (
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
                      variant={paymentFilter === s ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2.5"
                      onClick={() => applyPaymentFilter(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
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
                          <DropdownMenuItem key={s} onClick={() => handleBulkUpdate("status", s)}>
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
                          <DropdownMenuItem key={s} onClick={() => handleBulkUpdate("payment", s)}>
                            {s}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Bulk Print</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => {
                    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
                    usePrintModal.getState().openModal(ids, "a4", `/invoice/bulk?ids=${ids.join(",")}`);
                  }}>
                    <FileText className="mr-2 size-4" />
                    Print A4 Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
                    usePrintModal.getState().openModal(ids, "pos", `/invoice/bulk/pos?ids=${ids.join(",")}`);
                  }}>
                    <Printer className="mr-2 size-4" />
                    Print Parcel Invoice
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[1000px]">
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
              value={`${perPage}`}
              onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100, 150, 200].map((s) => (
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
