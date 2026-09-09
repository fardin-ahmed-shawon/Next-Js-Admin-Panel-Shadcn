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
  Minus,
  Package,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { usePathaoSetup } from "@/hooks/usePathaoSetup";
import { useRedxSetup } from "@/hooks/useRedxSetup";
import useProducts, { type Product } from "@/hooks/useProducts";
import { useSteadfastSetup } from "@/hooks/useSteadfastSetup";
import { useOrders } from "@/hooks/useOrders";
import { fetchClient } from "@/lib/fetch-client";
import { usePrintModal } from "@/hooks/usePrintModal";

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
    const rawStr = dateStr.replace(" ", "T");
    return new Date(rawStr).toLocaleDateString("en-GB", {
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
    const rawStr = dateStr.replace(" ", "T");
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
            className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${isCurrent ? "bg-primary/5 border-primary/30" : "bg-muted/20"
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

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
  size: string;
  unitPrice: number;
  isExisting?: boolean;
  isGift?: boolean;
  manualVariantChange?: boolean;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return json.data || [];
};

const getVariantSellingPrice = (v: any, fallbackPrice: number = 0): number => {
  if (!v) return fallbackPrice;
  const vp = v.variant_pricing || v.variantPricing;
  if (vp && vp.selling_price !== undefined && vp.selling_price !== null && vp.selling_price !== "") {
    return Number(vp.selling_price) || 0;
  }
  if (v.selling_price !== undefined && v.selling_price !== null && v.selling_price !== "") {
    return Number(v.selling_price) || 0;
  }
  if (v.price !== undefined && v.price !== null && v.price !== "") {
    return Number(v.price) || 0;
  }
  return fallbackPrice;
};

function CartItemRow({ item, updateQuantity, removeFromCart, updateCartItem, updateUnitPrice }: any) {
  const { data: sizesRes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_SIZES || "sizes"}`,
    fetcher,
  );
  const { data: colorsRes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_COLORS || "colors"}`,
    fetcher,
  );

  const allSizes = React.useMemo(() => (Array.isArray(sizesRes) ? sizesRes : sizesRes?.data || []), [sizesRes]);
  const allColors = React.useMemo(() => (Array.isArray(colorsRes) ? colorsRes : colorsRes?.data || []), [colorsRes]);

  const variants = React.useMemo(() => item.product.variants || [], [item.product.variants]);

  const sizes = React.useMemo(() => {
    const map = new Map<string | number, { id: number; label: string }>();
    variants.forEach((v: any) => {
      if (v.size_id) {
        const label = v.size?.label || allSizes.find((s: any) => s.id === v.size_id)?.label;
        if (label) map.set(v.size_id, { id: v.size_id, label });
      }
    });
    return Array.from(map.values());
  }, [variants, allSizes]);

  const colors = React.useMemo(() => {
    const map = new Map<string | number, { id: number; label: string }>();
    variants.forEach((v: any) => {
      if (v.color_id) {
        const label = v.color?.label || allColors.find((c: any) => c.id === v.color_id)?.label;
        if (label) map.set(v.color_id, { id: v.color_id, label });
      }
    });
    return Array.from(map.values());
  }, [variants, allColors]);

  const requiresVariant = (Number(item.product.has_variants) === 1 || Boolean(item.product.has_variant_wise_pricing)) && variants.length > 0;
  const requiresSize = sizes.length > 0;
  const requiresColor = colors.length > 0;
  const isSizeComplete = !requiresSize || Boolean(item.size);
  const isColorComplete = !requiresColor || Boolean(item.color);

  let isValidVariant = true;

  const availableColors = item.size
    ? colors.filter((c: any) => {
      const sizeId = sizes.find((s: any) => s.label === item.size)?.id;
      return variants.some((v: any) => String(v.size_id) === String(sizeId) && String(v.color_id) === String(c.id));
    })
    : colors;

  const availableSizes = item.color
    ? sizes.filter((s: any) => {
      const colorId = colors.find((c: any) => c.label === item.color)?.id;
      return variants.some((v: any) => String(v.color_id) === String(colorId) && String(v.size_id) === String(s.id));
    })
    : sizes;

  React.useEffect(() => {
    if (!requiresVariant) return;

    if (isSizeComplete && isColorComplete && (item.size || item.color || (!requiresSize && !requiresColor))) {
      const selectedSizeId = requiresSize ? sizes.find((s: any) => s.label === item.size)?.id : null;
      const selectedColorId = requiresColor ? colors.find((c: any) => c.label === item.color)?.id : null;

      const variant = variants.find((v: any) => {
        const matchSize = requiresSize ? String(v.size_id) === String(selectedSizeId) : true;
        const matchColor = requiresColor ? String(v.color_id) === String(selectedColorId) : true;
        return matchSize && matchColor;
      });

      if (variant) {
        const price = getVariantSellingPrice(variant, item.product.selling_price || 0);
        if (!item.isExisting || item.manualVariantChange || Number(item.unitPrice) === 0) {
          updateUnitPrice(item.product.id, price);
        }
      }
    }
  }, [item.size, item.color, sizes, colors, variants, requiresVariant, requiresSize, requiresColor, isSizeComplete, isColorComplete, item.isExisting, item.manualVariantChange, item.unitPrice]);

  React.useEffect(() => {
    if (requiresVariant) {
      if (availableSizes.length === 1 && item.size !== availableSizes[0].label) updateCartItem(item.product.id, "size", availableSizes[0].label);
      if (availableColors.length === 1 && item.color !== availableColors[0].label) updateCartItem(item.product.id, "color", availableColors[0].label);
    }
  }, [availableSizes, availableColors, item.size, item.color, requiresVariant]);

  if (requiresVariant && isSizeComplete && isColorComplete && (item.size || item.color)) {
    const selectedSizeId = requiresSize ? sizes.find((s: any) => s.label === item.size)?.id : null;
    const selectedColorId = requiresColor ? colors.find((c: any) => c.label === item.color)?.id : null;
    isValidVariant = variants.some(
      (v: any) =>
        (requiresSize ? String(v.size_id) === String(selectedSizeId) : true) &&
        (requiresColor ? String(v.color_id) === String(selectedColorId) : true),
    );
  }

  return (
    <div className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
          <img src={getImageUrl(item.product.product_thumbnail_img)} alt={item.product.title} className="size-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{item.product.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.product.sku || "N/A"} · ৳{Number(item.unitPrice || 0).toLocaleString()} each
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={() => updateQuantity(item.product.id, -1)}><Minus className="size-3" /></Button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
          <Button variant="outline" size="icon-sm" onClick={() => updateQuantity(item.product.id, 1)}><Plus className="size-3" /></Button>
        </div>
        <span className="w-20 text-right text-sm font-semibold tabular-nums">৳{(item.unitPrice * item.quantity).toLocaleString()}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => removeFromCart(item.product.id)}><X className="size-4 text-muted-foreground" /></Button>
      </div>

      {requiresVariant && (
        <div className="mt-2 flex flex-col gap-2 pl-15">
          <div className="flex items-center gap-3">
            {availableColors.length > 1 ? (
              <Select value={item.color} onValueChange={(v) => updateCartItem(item.product.id, "color", v)}>
                <SelectTrigger className={`h-7 w-28 text-xs ${!isValidVariant && item.color ? "border-destructive text-destructive" : ""}`}><SelectValue placeholder="Color" /></SelectTrigger>
                <SelectContent>
                  {availableColors.map((c: any) => {
                    const optVariant = variants.find((v: any) => {
                      const matchColor = String(v.color_id) === String(c.id);
                      const selSizeId = requiresSize ? sizes.find((s: any) => s.label === item.size)?.id : null;
                      const matchSize = requiresSize && selSizeId ? String(v.size_id) === String(selSizeId) : true;
                      return matchColor && matchSize;
                    });
                    const optPrice = optVariant ? getVariantSellingPrice(optVariant, 0) : null;
                    return <SelectItem key={c.id} value={c.label}>{c.label} {optPrice !== null && optPrice > 0 && !requiresSize ? `(৳${optPrice.toLocaleString()})` : ""}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            ) : availableColors.length === 1 ? <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0">Color: {availableColors[0].label}</div> : null}

            {availableSizes.length > 1 ? (
              <Select value={item.size} onValueChange={(v) => updateCartItem(item.product.id, "size", v)}>
                <SelectTrigger className={`h-7 min-w-28 text-xs ${!isValidVariant && item.size ? "border-destructive text-destructive" : ""}`}><SelectValue placeholder="Size / Variant" /></SelectTrigger>
                <SelectContent>
                  {availableSizes.map((s: any) => {
                    const optVariant = variants.find((v: any) => {
                      const matchSize = String(v.size_id) === String(s.id);
                      const selColorId = requiresColor ? colors.find((c: any) => c.label === item.color)?.id : null;
                      const matchColor = requiresColor && selColorId ? String(v.color_id) === String(selColorId) : true;
                      return matchSize && matchColor;
                    });
                    const optPrice = optVariant ? getVariantSellingPrice(optVariant, 0) : null;
                    return <SelectItem key={s.id} value={s.label}>{s.label} {optPrice !== null && optPrice > 0 ? `(৳${optPrice.toLocaleString()})` : ""}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            ) : availableSizes.length === 1 ? <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0">Variant: {availableSizes[0].label}</div> : null}

            {(item.color || item.size) && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { updateCartItem(item.product.id, "color", ""); updateCartItem(item.product.id, "size", ""); const basePrice = item.product.selling_price || (variants[0] ? getVariantSellingPrice(variants[0]) : 0); updateUnitPrice(item.product.id, basePrice); }} title="Clear selections"><X className="size-3.5" /></Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Page ---- */

export function EditOrderForm({ orderId, incompleteMode = false, onCompleted }: { orderId: string; incompleteMode?: boolean; onCompleted?: () => void }) {
  const router = useRouter();
  const { features } = useModularFeatures();

  const { data: order, isLoading, mutate } = useOrderDetail(orderId ?? null);
  const { data: steadfastConfig } = useSteadfastSetup();
  const { data: pathaoConfig } = usePathaoSetup();
  const { data: redxConfig } = useRedxSetup();

  const { orders: phoneMatchedOrders } = useOrders({ search: order?.customer_phone, all_orders: true });

  const isSteadfastActive =
    steadfastConfig?.status === "active" ||
    steadfastConfig?.is_active === 1 ||
    steadfastConfig?.is_active === "1" ||
    steadfastConfig?.is_active === true;
  const isPathaoActive =
    pathaoConfig?.status === "active" ||
    pathaoConfig?.is_active === 1 ||
    pathaoConfig?.is_active === "1" ||
    pathaoConfig?.is_active === true;
  const isRedxActive =
    redxConfig?.status === "active" ||
    redxConfig?.is_active === 1 ||
    redxConfig?.is_active === "1" ||
    redxConfig?.is_active === true;

  /* local state for editable dropdowns */
  const [orderStatus, setOrderStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState("");
  const [shippingChargeInput, setShippingChargeInput] = React.useState<number>(0);
  const [discountAmountInput, setDiscountAmountInput] = React.useState<number>(0);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);

  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: productsData } = useProducts({ search: debouncedSearchQuery });
  const filteredProducts = productsData?.data || [];

  const [courierStatus, setCourierStatus] = React.useState<string | null>(null);
  const [courierLoading, setCourierLoading] = React.useState(false);

  const [shippingAddressInput, setShippingAddressInput] = React.useState("");
  const [shippingAreaInput, setShippingAreaInput] = React.useState("");

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = React.useState("");
  const [customerSearchFocused, setCustomerSearchFocused] = React.useState(false);
  const [isSavingAll, setIsSavingAll] = React.useState(false);
  const [customersData, setCustomersData] = React.useState<any[]>([]);

  const customerSearchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedCustomerSearch(customerSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  React.useEffect(() => {
    async function fetchCustomers() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_CUSTOMERS || "customers"}`;
        const res = await fetchClient(url);
        if (res.ok) {
          const json = await res.json();
          setCustomersData(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = React.useMemo(() => {
    if (!debouncedCustomerSearch.trim()) return [];
    const query = debouncedCustomerSearch.toLowerCase();
    return customersData.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) || c.phone?.includes(query) || c.email?.toLowerCase().includes(query),
    );
  }, [debouncedCustomerSearch, customersData]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node)) {
        setCustomerSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [fraudData, setFraudData] = React.useState<any>(null);
  const [fraudLoading, setFraudLoading] = React.useState(false);
  const [fraudError, setFraudError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (features && (features.fraud_checker === false || String(features.fraud_checker) === "0")) {
      return;
    }
    if (order?.customer_phone) {
      const fetchFraudData = async () => {
        setFraudLoading(true);
        setFraudError(null);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
          const res = await fetchClient(`${baseUrl}fraud-check`, {
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

  React.useEffect(() => {
    if (!order) return;
    const steadfastParcel = order.steadfast_parcel || order.steadfastParcel || null;
    const pathaoParcel = order.pathao_parcel || order.pathaoParcel || null;
    const redxParcel = order.redx_parcel || order.redxParcel || null;

    if (!steadfastParcel && !pathaoParcel && !redxParcel) {
      if (order.order_status === "Delivered") {
        setCourierStatus("Office Delivered");
      } else {
        setCourierStatus("Not dispatched");
      }
      return;
    }

    let isMounted = true;
    const fetchCourierStatus = async () => {
      setCourierLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
        const courier = steadfastParcel ? "steadfast" : pathaoParcel ? "pathao" : "redx";
        const res = await fetchClient(`${baseUrl}${courier}-parcels/${order.order_no}/status`);
        if (!isMounted) return;
        if (res.ok) {
          const json = await res.json();
          const status =
            json.delivery_status ||
            json.status ||
            json.data?.delivery_status ||
            json.data?.status ||
            json.data?.parcel_status ||
            "Unknown";
          setCourierStatus(status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()));
        } else {
          setCourierStatus(
            order.courier_details?.parcel_status
              ? order.courier_details.parcel_status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
              : "Error",
          );
        }
      } catch (err) {
        if (!isMounted) return;
        setCourierStatus(
          order.courier_details?.parcel_status
            ? order.courier_details.parcel_status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
            : "Error",
        );
      } finally {
        if (isMounted) setCourierLoading(false);
      }
    };

    fetchCourierStatus();
    return () => {
      isMounted = false;
    };
  }, [
    order?.order_no,
    order?.steadfast_parcel,
    order?.steadfastParcel,
    order?.pathao_parcel,
    order?.pathaoParcel,
    order?.redx_parcel,
    order?.redxParcel,
    order?.courier_details?.parcel_status,
  ]);

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
      setCustomerName(order.customer_full_name ?? "");
      setCustomerPhone(order.customer_phone ?? "");
      setCustomerEmail(order.customer_email ?? "");
      setShippingAddressInput(order.customer_shipping_address ?? "");
      setShippingAreaInput(order.shipping_area ?? "");

      if (order.ordered_products) {
        const mappedCart = order.ordered_products.map((op: any) => ({
          product: {
            id: op.product_id || Math.random(),
            title: op.product?.title || "Unknown Product",
            sku: op.product?.sku || "",
            selling_price: Number(op.unit_price) || 0,
            available_stock: op.product?.available_stock || 0,
            product_thumbnail_img: op.product?.product_thumbnail_img
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/"}${op.product.product_thumbnail_img.startsWith("/") ? op.product.product_thumbnail_img.slice(1) : op.product.product_thumbnail_img}`
              : "https://placehold.co/80x80/1a1a2e/e0e0e0?text=NA",
            status: "Active",
            regular_price: Number(op.unit_price) || 0,
            has_variants: op.product?.has_variants || 0,
            has_variant_wise_pricing: op.product?.has_variant_wise_pricing || 0,
            variants: op.product?.variants || [],
          },
          quantity: op.qty,
          color: op.color_label || "",
          size: op.size_label || "",
          unitPrice: Number(op.unit_price) || 0,
          isExisting: true,
          isGift: false,
        }));
        setCart(mappedCart);
      }

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

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));

      const variants = product.variants || [];
      const firstVariant = variants.length > 0 ? variants[0] : null;

      const initialSize = firstVariant?.size?.label || "";
      const initialColor = firstVariant?.color?.label || "";
      const initialPrice = firstVariant
        ? getVariantSellingPrice(firstVariant, product.selling_price || 0)
        : (product.selling_price || 0);

      return [...prev, { product, quantity: 1, color: initialColor, size: initialSize, unitPrice: initialPrice, isExisting: false, manualVariantChange: true }];
    });
    setSearchQuery("");
    setSearchFocused(false);
    toast.success(`${product.title} added to order.`);
  }

  function updateQuantity(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateCartItem(productId: number, field: string, value: any) {
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, [field]: value, manualVariantChange: true } : i)));
  }

  function updateUnitPrice(productId: number, price: number) {
    setCart((prev) => {
      let changed = false;
      const next = prev.map((i) => {
        if (i.product.id === productId && Number(i.unitPrice) !== Number(price)) {
          changed = true;
          return { ...i, unitPrice: price };
        }
        return i;
      });
      return changed ? next : prev;
    });
  }

  function selectCustomer(customer: any) {
    setCustomerName(customer.full_name || customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setCustomerSearchQuery("");
    setCustomerSearchFocused(false);
    toast.success("Customer details loaded.");
  }

  const handleSaveAllChanges = async () => {
    if (!order) return;
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Customer phone is required.");
      return;
    }
    if (!shippingAddressInput.trim()) {
      toast.error("Shipping address is required.");
      return;
    }

    if (incompleteMode || order.order_status === "Incomplete") {
      if (!/^01\d{9}$/.test(customerPhone.trim())) {
        toast.error("Please enter a valid 11-digit Bangladeshi phone number (e.g. 01944667441).");
        return;
      }
      if (!shippingAddressInput.trim()) {
        toast.error("Shipping address is required.");
        return;
      }
    }

    setIsSavingAll(true);
    const toastId = toast.loading("Saving all changes...");

    const computedSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const computedGrandTotal = Math.max(0, computedSubtotal - discountAmountInput + shippingChargeInput);

    try {
      const promises = [];

      // Primary order PATCH payload
      const payload: Record<string, any> = {
        shipping_charge: shippingChargeInput,
        discount_amount: discountAmountInput,
        subtotal_amount: computedSubtotal,
        grand_total_amount: computedGrandTotal,
        products: cart.map((item) => ({
          product_id: item.product.id,
          qty: item.quantity,
          unit_price: item.unitPrice,
          ...(item.size ? { size_label: item.size } : {}),
          ...(item.color ? { color_label: item.color } : {}),
        })),
      };

      if (order.order_status === "Incomplete" && orderStatus !== "Incomplete") {
        payload.source = "Incomplete";
      }

      Object.assign(payload, {
        customer_full_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_shipping_address: shippingAddressInput,
        shipping_area: shippingAreaInput,
        order_status: orderStatus,
        payment_status: paymentStatus,
        order_note: note,
      });

      if (paymentStatus === "Full Paid") {
        payload.paid_amount = computedGrandTotal;
      }

      promises.push(patchOrder(order.order_no, payload));

      // Check if district changed
      if (selectedDistrict && selectedDistrict !== (order.district ?? "")) {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
        promises.push(
          fetchClient(`${base}orders/${order.order_no}/district`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ district: selectedDistrict }),
          }).then((res) => {
            if (!res.ok) throw new Error("Failed to save district");
            return res.json();
          }),
        );
      }

      await Promise.all(promises);

      toast.success("Order details updated successfully", { id: toastId });
      if (onCompleted) {
        onCompleted();
      }
      mutate();
      globalMutate((key) => typeof key === "string" && key.includes("orders") && !key.includes(order.order_no));
    } catch (e: any) {
      toast.error(e?.message || "Failed to save order changes", { id: toastId });
    } finally {
      setIsSavingAll(false);
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
          Order <code className="rounded bg-muted px-1">{orderId}</code> does not exist.
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
  // Filter out the current order from the matching list
  const customerOrders: CustomerOrder[] = (phoneMatchedOrders as any[]).filter(o => o.order_no !== order?.order_no) ?? [];
  const parcelHistory = order.customer?.parcel_history;

  const steadfastParcel = order?.steadfast_parcel || order?.steadfastParcel || null;
  const pathaoParcel = order?.pathao_parcel || order?.pathaoParcel || null;
  const redxParcel = order?.redx_parcel || order?.redxParcel || null;
  const hasSteadfastParcel = !!steadfastParcel;
  const hasPathaoParcel = !!pathaoParcel;
  const hasRedxParcel = !!redxParcel;

  const determinedCourier = steadfastParcel
    ? "Steadfast"
    : pathaoParcel
      ? "Pathao"
      : redxParcel
        ? "RedX"
        : (order?.courier_details?.courier ?? "—");

  let genuineStatus =
    order?.order_status === "Delivered" && !hasSteadfastParcel && !hasPathaoParcel && !hasRedxParcel
      ? "Office Delivered"
      : "Not dispatched";
  if (order?.courier_details?.parcel_status) {
    genuineStatus = order.courier_details.parcel_status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
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
  const aggregateSuccessRate = aggregateTotal > 0 ? `${Math.round((aggregateDelivered / aggregateTotal) * 100)}%` : "-";

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
      {/* â”€â”€ Header â”€â”€ */}
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
            <Button size="sm" onClick={handleSaveAllChanges} disabled={isSavingAll} className="gap-1.5">
              {isSavingAll ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Changes
            </Button>
            {!incompleteMode && (
              <>
                <Button variant="outline" size="sm" onClick={() => usePrintModal.getState().openModal(order.order_no, "a4", `/invoice/${order.order_no}`)}>
                  <FileText className="mr-2 size-4" />
                  Invoice
                </Button>
                <Button variant="outline" size="sm" onClick={() => usePrintModal.getState().openModal(order.order_no, "pos", `/invoice/${order.order_no}/pos`)}>
                  <Printer className="mr-2 size-4" />
                  POS
                </Button>
                <Button variant="outline" size="sm" onClick={() => usePrintModal.getState().openModal(order.order_no, "label", `/invoice/${order.order_no}/label`)}>
                  <Truck className="mr-2 size-4" />
                  Label
                </Button>
              </>
            )}
            {!incompleteMode && (
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
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€ */}
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
          {features?.fraud_checker !== false && String(features?.fraud_checker) !== "0" && (
            <TabsTrigger value="parcel-history">
              <ShieldAlert className="mr-1.5 size-4 text-primary" />
              Parcel History
            </TabsTrigger>
          )}
        </TabsList>

        {/* â”€â”€â”€ OVERVIEW TAB â”€â”€â”€ */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* â”€â”€ Left column (2/3) â”€â”€ */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Products Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Products</CardTitle>
                    <CardDescription>Search and update products for this order.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5">
                    {/* Product search */}
                    <div ref={searchRef} className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9 h-10"
                        placeholder="Search by product name, SKU, or ID..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                      />
                      {searchFocused && filteredProducts.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-55 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                          {filteredProducts.map((p) => {
                            const inCart = cart.find((i) => i.product.id === p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                                onClick={() => addToCart(p)}
                              >
                                <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                                  <img
                                    src={getImageUrl(p.product_thumbnail_img)}
                                    alt={p.title}
                                    className="size-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-snug">{p.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {p.sku || "N/A"} · Stock: {p.available_stock}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-sm font-semibold tabular-nums">
                                    {(() => {
                                      if (p.has_variant_wise_pricing || (p.has_variants && p.variants?.length > 0)) {
                                        const prices = p.variants
                                          ?.map((v: any) => {
                                            const vp = v.variant_pricing || v.variantPricing;
                                            return vp?.selling_price ?? v.selling_price;
                                          })
                                          .filter((pr: any) => pr !== undefined && pr !== null && !isNaN(Number(pr)))
                                          .map(Number) || [];

                                        if (prices.length > 0) {
                                          const min = Math.min(...prices);
                                          const max = Math.max(...prices);
                                          return min === max ? `৳${min.toLocaleString()}` : `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
                                        }
                                      }
                                      return `৳${(p.selling_price || 0).toLocaleString()}`;
                                    })()}
                                  </span>
                                  {inCart && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Ã—{inCart.quantity}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Cart items */}
                    <div className="flex flex-col gap-4">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 border border-dashed rounded-lg">
                          <ShoppingCart className="size-8 mb-2 stroke-[1.5]" />
                          <p className="text-sm font-medium">No products in this order</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <CartItemRow
                            key={item.product.id}
                            item={item}
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                            updateCartItem={updateCartItem}
                            updateUnitPrice={updateUnitPrice}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="flex flex-col gap-3 text-sm ml-auto w-full sm:w-1/2">
                    <div className="flex items-center justify-between border-b pb-2 mb-1">
                      <span className="font-semibold text-muted-foreground">Charges & Totals</span>
                    </div>
                    <div className="flex justify-between items-center h-9">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">
                        ৳{cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center h-9">
                      <span className="text-muted-foreground">Discount</span>
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ৳
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={discountAmountInput}
                          onChange={(e) => setDiscountAmountInput(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-right pr-2 pl-6 h-8 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center h-9">
                      <span className="text-muted-foreground">Shipping</span>
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ৳
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={shippingChargeInput}
                          onChange={(e) => setShippingChargeInput(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-right pr-2 pl-6 h-8 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-base mt-1 pt-3 border-t h-9">
                      <span>Grand Total</span>
                      <span className="tabular-nums">
                        ৳
                        {Math.max(
                          0,
                          cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) -
                          discountAmountInput +
                          shippingChargeInput,
                        ).toLocaleString()}
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Note */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order note</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Textarea
                    placeholder="Add a note for this order…"
                    className="min-h-[100px] resize-none text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* â”€â”€ Right column (1/3) â”€â”€ */}
            <div className="flex flex-col gap-6">
              {/* Customer Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Customer</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    {/* Search registered customer */}
                    <div ref={customerSearchRef} className="relative z-40">
                      <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9 bg-muted/30 border-dashed text-sm h-9"
                          placeholder="Search registered customer by name, phone, or email..."
                          value={customerSearchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearchQuery(e.target.value)}
                          onFocus={() => setCustomerSearchFocused(true)}
                        />
                      </div>
                      {customerSearchFocused && filteredCustomers.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                          {filteredCustomers.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-muted/50"
                              onClick={() => selectCustomer(c)}
                            >
                              <p className="text-sm font-semibold text-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.phone} · {c.email}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      {customerSearchFocused && customerSearchQuery.trim() && filteredCustomers.length === 0 && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-4 shadow-lg text-center">
                          <p className="text-sm font-medium">No registered customers found</p>
                        </div>
                      )}
                    </div>

                    {/* Inputs grid */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="customer-name" className="text-xs font-semibold text-muted-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="customer-name"
                          className="h-9 text-sm"
                          placeholder="Customer Full Name"
                          value={customerName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="customer-email" className="text-xs font-semibold text-muted-foreground">
                            Email (Optional)
                          </Label>
                          <Input
                            id="customer-email"
                            className="h-9 text-sm"
                            type="email"
                            placeholder="customer@example.com"
                            value={customerEmail}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="customer-phone" className="text-xs font-semibold text-muted-foreground">
                            Phone <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="customer-phone"
                            className="h-9 text-sm"
                            type="tel"
                            placeholder="+880 1XXX-XXXXXX"
                            value={customerPhone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parcel History (Courier) */}
              {features?.fraud_checker !== false && String(features?.fraud_checker) !== "0" && (
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
                          className={`font-mono font-semibold border-none ${fraudTotal === 0
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
              )}
              {/* Customer History (System Summary) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    Customer History (System)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.customer_id !== 0 && parcelHistory ? (
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
                      {order.customer_id === 0 ? "Guest order - no system history." : "No system order metrics available."}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Customer Summary */}
              {order.customer_id !== 0 ? (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                          {order.customer?.name ? initials : <User className="size-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer?.name || "Unknown"}</span>
                          <span className="text-sm text-muted-foreground">
                            {order.customer?.phone || order.customer_phone}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total orders</span>
                          <span className="font-semibold text-base">{parcelHistory?.total ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total delivered</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {parcelHistory?.delivered ?? 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">This is a guest order. No registered customer data available.</p>
                    </CardContent>
                  </Card>
                )}

              {/* Shipping Address Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Shipping address</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="shipping-address-input" className="text-xs font-semibold text-muted-foreground">
                        Street Address <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="shipping-address-input"
                        className="min-h-[80px] text-sm resize-y"
                        placeholder="House #, Road #, Block, Area..."
                        value={shippingAddressInput}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setShippingAddressInput(e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="shipping-area-input" className="text-xs font-semibold text-muted-foreground">
                        Shipping Area
                      </Label>
                      <Input
                        id="shipping-area-input"
                        className="h-9 text-sm"
                        placeholder="e.g. Mirpur, Uttara"
                        value={shippingAreaInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAreaInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Order District</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger className="h-9 text-sm">
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
                  </div>
                </CardContent>
              </Card>

              {/* Delivery / Courier Card */}
              {!incompleteMode && (
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
                        {courierLoading ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                            <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
                            <span>Fetching status...</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">{courierStatus || genuineStatus}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {hasSteadfastParcel || hasPathaoParcel || hasRedxParcel ? (
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
                                  const baseUrl =
                                    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
                                  const endpoint =
                                    process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
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
                                  const baseUrl =
                                    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
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
                          {isRedxActive && (
                            <Button
                              size="sm"
                              className="w-full bg-rose-600 hover:bg-rose-600/90 text-white font-medium gap-2"
                              onClick={async () => {
                                const toastId = toast.loading(`Sending Order ${order.order_no} to RedX...`);
                                try {
                                  const baseUrl =
                                    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
                                  const res = await fetchClient(`${baseUrl}redx-parcels/${order.order_no}`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                  });
                                  if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    throw new Error(err?.error || err?.message || "Failed to send to RedX.");
                                  }
                                  toast.success(`Order ${order.order_no} sent to RedX`, { id: toastId });

                                  // Automation: Update order status to "Ready To Ship"
                                  try {
                                    await fetchClient(`${baseUrl}orders/bulk-update-status`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ order_nos: [order.order_no], order_status: "Ready To Ship" }),
                                    });
                                  } catch (e) {
                                    console.warn("Failed to automatically update order status", e);
                                  }

                                  mutate();
                                } catch (err: any) {
                                  toast.error(err?.message || "Something went wrong.", { id: toastId });
                                }
                              }}
                            >
                              <Send className="size-4" /> Send via RedX
                            </Button>
                          )}
                          {!isSteadfastActive && !isPathaoActive && !isRedxActive && (
                            <span className="text-xs text-muted-foreground text-center italic py-2">
                              Courier integrations are not active.
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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

        {/* ——— CUSTOMER HISTORY TAB ——— */}
        <TabsContent value="history">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="size-5" />
                    All Orders by {order.customer_phone}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerOrderHistory orders={customerOrders} currentOrderNo={order.order_no} />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              {/* Customer Summary Card inside history tab */}
              {order.customer_id !== 0 ? (
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
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">This is a guest order. No registered customer data available.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        {/* ——— PARCEL HISTORY TAB ——— */}
        {features?.fraud_checker !== false && String(features?.fraud_checker) !== "0" && (
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
                      <TableHead className="text-center font-semibold text-foreground h-10 px-6">
                        SUCCESS RATE
                      </TableHead>
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
                          <Badge
                            variant="secondary"
                            className="px-3 py-1 font-semibold tabular-nums text-muted-foreground"
                          >
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
        )}
      </Tabs>
    </div>
  );
}