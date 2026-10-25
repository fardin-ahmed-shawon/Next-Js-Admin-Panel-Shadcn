"use client";
import { useCustomDiscount } from "@/hooks/useCustomDiscount";
import { OrderPeopleFields, type OrderPeople } from "@/components/hrm/order-people-fields";
import { manualOrderSources } from "@/lib/order-list-filters";
import { fetchClient } from "@/lib/fetch-client";

import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  CreditCard,
  Minus,
  Package,
  Percent,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
/* ---- catalogue ---- */
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import useProducts, { type Product } from "@/hooks/useProducts";

import { HoldOrderFields } from "../../_components/hold-order-fields";
import { PartialPaymentForm } from "../../_components/partial-payment-form";
import { CustomPackSizeSelector } from "../../_components/custom-pack-size-selector";
import { districts, divisions, thanas } from "./bd-locations";

interface CartItem {
  lineId?: string;
  product: Product;
  quantity: number;
  color: string;
  size: string;
  unitPrice: number;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return json.data || [];
};

const getImageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

function resolveCartVariant(item: CartItem) {
  const variants = item.product.variants || [];
  return variants.find((v: any) => {
    const size = v.option_label || v.size?.label || v.size?.name || (typeof v.size === "string" ? v.size : "");
    const color = v.color?.label || v.color?.name || (typeof v.color === "string" ? v.color : "");
    return ((!v.size_id && !size) || size === item.size) && ((!v.color_id && !color) || color === item.color);
  });
}

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

function CartItemRow({
  item,
  updateQuantity,
  removeFromCart,
  updateCartItem,
  updateUnitPrice,
  setCartItemQuantity,
  isWholesale,
}: any) {
  const { data: sizesRes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_SIZES || "sizes"}`,
    fetcher,
  );
  const { data: colorsRes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_COLORS || "colors"}`,
    fetcher,
  );

  const allSizes = React.useMemo(() => {
    const list = Array.isArray(sizesRes) ? sizesRes : sizesRes?.data || [];
    return list;
  }, [sizesRes]);

  const allColors = React.useMemo(() => {
    const list = Array.isArray(colorsRes) ? colorsRes : colorsRes?.data || [];
    return list;
  }, [colorsRes]);

  const variants = React.useMemo(() => {
    return (item.product.variants || []).filter((v: any) => v.status !== "hidden");
  }, [item.product.variants]);

  const sizes = React.useMemo(() => {
    const map = new Map<string | number, { id: number; label: string }>();
    variants.forEach((v: any) => {
      if (v.size_id) {
        const label = v.size?.label || allSizes.find((s: any) => s.id === v.size_id)?.label;
        if (label) {
          map.set(v.size_id, { id: v.size_id, label });
        }
      }
    });
    return Array.from(map.values());
  }, [variants, allSizes]);

  const colors = React.useMemo(() => {
    const map = new Map<string | number, { id: number; label: string }>();
    variants.forEach((v: any) => {
      if (v.color_id) {
        const label = v.color?.label || allColors.find((c: any) => c.id === v.color_id)?.label;
        if (label) {
          map.set(v.color_id, { id: v.color_id, label });
        }
      }
    });
    return Array.from(map.values());
  }, [variants, allColors]);

  const isSharedBulk = item.product.inventory_mode === "shared_bulk";
  const requiresVariant =
    ((Number(item.product.has_variants) === 1 || Boolean(item.product.has_variant_wise_pricing)) &&
      variants.length > 0) ||
    isSharedBulk;
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
        updateUnitPrice(item.lineId ?? item.product.id, price);
      }
    }
  }, [
    item.size,
    item.color,
    sizes,
    colors,
    variants,
    requiresVariant,
    requiresSize,
    requiresColor,
    isSizeComplete,
    isColorComplete,
  ]);

  React.useEffect(() => {
    if (requiresVariant) {
      if (availableSizes.length === 1 && item.size !== availableSizes[0].label) {
        updateCartItem(item.lineId ?? item.product.id, "size", availableSizes[0].label);
      }
      if (availableColors.length === 1 && item.color !== availableColors[0].label) {
        updateCartItem(item.lineId ?? item.product.id, "color", availableColors[0].label);
      }
    }
  }, [availableSizes, availableColors, item.size, item.color, requiresVariant]);

  if (requiresVariant && isSizeComplete && isColorComplete && (item.size || item.color)) {
    const selectedSizeId = requiresSize ? sizes.find((s: any) => s.label === item.size)?.id : null;
    const selectedColorId = requiresColor ? colors.find((c: any) => c.label === item.color)?.id : null;
    isValidVariant = isSharedBulk
      ? true
      : variants.some(
          (v: any) =>
            (requiresSize ? String(v.size_id) === String(selectedSizeId) : true) &&
            (requiresColor ? String(v.color_id) === String(selectedColorId) : true),
        );
  }

  return (
    <div className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
          <img
            src={getImageUrl(item.product.product_thumbnail_img)}
            alt={item.product.title}
            className="size-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{item.product.title}</p>
          {isSharedBulk && (
            <p className="text-xs text-muted-foreground">
              Pack: {item.size || "Standard"} · Stock consumed:{" "}
              {Number(resolveCartVariant(item)?.sale_quantity || 0) * item.quantity}{" "}
              {resolveCartVariant(item)?.sale_unit_code || item.product.inventory_unit_code}
            </p>
          )}
          {isWholesale ? (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">{item.product.sku || "N/A"}</p>
              <span className="text-xs text-muted-foreground">· ৳</span>
              <Input
                type="number"
                className="w-20 h-7 text-xs px-2"
                value={item.unitPrice}
                onChange={(e) => updateUnitPrice(item.lineId ?? item.product.id, Number(e.target.value) || 0)}
                min="0"
              />
              <span className="text-xs text-muted-foreground">each</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {item.product.sku || "N/A"} · ৳{Number(item.unitPrice || 0).toLocaleString()} each
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isWholesale ? (
            <Input
              type="number"
              className="w-20 h-8 text-sm tabular-nums text-center px-2"
              value={item.quantity === 0 ? "" : item.quantity}
              onChange={(e) => setCartItemQuantity(item.lineId ?? item.product.id, Number(e.target.value) || 0)}
              min="1"
            />
          ) : (
            <>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => updateQuantity(item.lineId ?? item.product.id, -1)}
              >
                <Minus className="size-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => updateQuantity(item.lineId ?? item.product.id, 1)}
              >
                <Plus className="size-3" />
              </Button>
            </>
          )}
        </div>
        <span className="w-20 text-right text-sm font-semibold tabular-nums">
          ৳{(item.unitPrice * item.quantity).toLocaleString()}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => removeFromCart(item.lineId ?? item.product.id)}>
          <X className="size-4 text-muted-foreground" />
        </Button>
      </div>

      {requiresVariant && (
        <div className="mt-2 flex flex-col gap-2 pl-15">
          <div className="flex items-center gap-3">
            {availableColors.length > 1 ? (
              <Select
                value={item.color}
                onValueChange={(v) => updateCartItem(item.lineId ?? item.product.id, "color", v)}
              >
                <SelectTrigger
                  className={`h-7 w-28 text-xs ${!isValidVariant && item.color ? "border-destructive text-destructive" : ""}`}
                >
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((c: any) => {
                    const optVariant = variants.find((v: any) => {
                      const matchColor = String(v.color_id) === String(c.id);
                      const selSizeId = requiresSize ? sizes.find((s: any) => s.label === item.size)?.id : null;
                      const matchSize = requiresSize && selSizeId ? String(v.size_id) === String(selSizeId) : true;
                      return matchColor && matchSize;
                    });
                    const optPrice = optVariant ? getVariantSellingPrice(optVariant, 0) : null;
                    return (
                      <SelectItem key={c.id} value={c.label}>
                        {c.label}{" "}
                        {optPrice !== null && optPrice > 0 && !requiresSize ? `(৳${optPrice.toLocaleString()})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : availableColors.length === 1 ? (
              <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0">
                Color: {availableColors[0].label}
              </div>
            ) : null}

            {availableSizes.length > 1 ? (
              <Select
                value={item.size}
                onValueChange={(v) => updateCartItem(item.lineId ?? item.product.id, "size", v)}
              >
                <SelectTrigger
                  className={`h-7 min-w-28 text-xs ${!isValidVariant && item.size ? "border-destructive text-destructive" : ""}`}
                >
                  <SelectValue placeholder="Size / Variant" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((s: any) => {
                    const optVariant = variants.find((v: any) => {
                      const matchSize = String(v.size_id) === String(s.id);
                      const selColorId = requiresColor ? colors.find((c: any) => c.label === item.color)?.id : null;
                      const matchColor = requiresColor && selColorId ? String(v.color_id) === String(selColorId) : true;
                      return matchSize && matchColor;
                    });
                    const optPrice = optVariant ? getVariantSellingPrice(optVariant, 0) : null;
                    return (
                      <SelectItem key={s.id} value={s.label}>
                        {s.label} {optPrice !== null && optPrice > 0 ? `(৳${optPrice.toLocaleString()})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : availableSizes.length === 1 ? (
              <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0">
                Variant: {availableSizes[0].label}
              </div>
            ) : isSharedBulk ? (
              <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0 text-muted-foreground">
                Pack: {item.size || "Standard"}
              </div>
            ) : null}

            {isSharedBulk && (
              <CustomPackSizeSelector item={item} updateCartItem={updateCartItem} updateUnitPrice={updateUnitPrice} />
            )}

            {(item.color || item.size) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  updateCartItem(item.lineId ?? item.product.id, "color", "");
                  updateCartItem(item.lineId ?? item.product.id, "size", "");
                  const basePrice =
                    item.product.selling_price || (variants[0] ? getVariantSellingPrice(variants[0]) : 0);
                  updateUnitPrice(item.lineId ?? item.product.id, basePrice);
                }}
                title="Clear selections"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          {!isValidVariant && (item.color || item.size) && (
            <span className="text-[10px] text-destructive font-medium">
              Selected combination is out of stock or unavailable.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- component ---- */

export function CreateOrderForm({ isWholesale = false }: { isWholesale?: boolean }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: productsData } = useProducts({ search: debouncedSearchQuery });
  const filteredProducts = productsData?.data || [];

  const [customersData, setCustomersData] = React.useState<any[]>([]);
  React.useEffect(() => {
    async function fetchCustomers() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_CUSTOMERS || "customers"}`;
        const res = await fetchClient(url);
        const json = await res.json();
        if (json.success && json.data) {
          setCustomersData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    }
    fetchCustomers();
  }, []);

  const [customerSearchQuery, setCustomerSearchQuery] = React.useState("");
  const [customerSearchFocused, setCustomerSearchFocused] = React.useState(false);
  const [orderPeople,setOrderPeople] = React.useState<OrderPeople>({owner:"customer",employeeId:"",moderatorId:"",canAdvance:false});
  const [loanAmount,setLoanAmount] = React.useState("");
  const [loanInstallments,setLoanInstallments] = React.useState("1");
  const [loanDate,setLoanDate] = React.useState(new Date().toLocaleDateString("en-CA"));
  const [loanPurpose,setLoanPurpose] = React.useState("");
  const [customerId, setCustomerId] = React.useState<number>(0);

  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");

  const [shippingAddress, setShippingAddress] = React.useState("");
  const [division, setDivision] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [thana, setThana] = React.useState("");
  const [shippingMethod, setShippingMethod] = React.useState("inside-dhaka");

  const [insideShippingCharge, setInsideShippingCharge] = React.useState(70);
  const [outsideShippingCharge, setOutsideShippingCharge] = React.useState(150);

  React.useEffect(() => {
    async function fetchWebSettings() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_SETTINGS || "web-settings"}`;
        const res = await fetchClient(url);
        const json = await res.json();
        if (json.success && json.data) {
          setInsideShippingCharge(Number(json.data.inside_shipping_charge) || 70);
          setOutsideShippingCharge(Number(json.data.outside_shipping_charge) || 150);
        }
      } catch (err) {
        console.error("Failed to fetch web settings:", err);
      }
    }
    fetchWebSettings();
  }, []);

  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const transactionIdRef = React.useRef<HTMLInputElement>(null);
  const requiresPaymentDetails = paymentMethod !== "cod" && paymentMethod !== "advance";
  const [paymentStatus, setPaymentStatus] = React.useState("Unpaid");
  const [paidAmount, setPaidAmount] = React.useState<number | "">("");

  const discountPolicy = useCustomDiscount();
  const [discountType, setDiscountType] = React.useState("fixed");
  const [discountValue, setDiscountValue] = React.useState("");
  const [orderNote, setOrderNote] = React.useState("");
  const [employeeNote, setEmployeeNote] = React.useState("");
  const [orderStatus, setOrderStatus] = React.useState("Pending");
  const [holdNote, setHoldNote] = React.useState("");
  const [nextActionDate, setNextActionDate] = React.useState("");
  const [orderSource, setOrderSource] = React.useState("Manual");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const searchRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const availableDistricts = division ? districts[division] || [] : [];
  const availableThanas = district ? thanas[district] || [] : [];

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing =
        product.inventory_mode === "shared_bulk" ? undefined : prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));

      const variants = (product.variants || []).filter((v: any) => v.status !== "hidden");
      const firstVariant = variants.length > 0 ? variants[0] : null;

      const initialSize = firstVariant?.option_label || firstVariant?.size?.label || "";
      const initialColor = firstVariant?.color?.label || "";
      const initialPrice = firstVariant
        ? getVariantSellingPrice(firstVariant, product.selling_price || 0)
        : product.selling_price || 0;

      return [
        ...prev,
        {
          lineId: crypto.randomUUID(),
          product,
          quantity: 1,
          color: initialColor,
          size: initialSize,
          unitPrice: initialPrice,
        },
      ];
    });
    setSearchQuery("");
    setSearchFocused(false);
    toast.success(`${product.title} added to order.`);
  }

  function updateQuantity(productId: number | string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          (i.lineId ?? i.product.id) === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function setCartItemQuantity(productId: number | string, qty: number) {
    setCart((prev) =>
      prev.map((i) => ((i.lineId ?? i.product.id) === productId ? { ...i, quantity: Math.max(0, qty) } : i)),
    );
  }

  function removeFromCart(productId: number | string) {
    setCart((prev) => prev.filter((i) => (i.lineId ?? i.product.id) !== productId));
  }

  function updateCartItem(productId: number | string, field: "color" | "size", value: string) {
    setCart((prev) => prev.map((i) => ((i.lineId ?? i.product.id) === productId ? { ...i, [field]: value } : i)));
  }

  function updateUnitPrice(productId: number | string, price: number) {
    setCart((prev) => {
      let changed = false;
      const next = prev.map((i) => {
        if ((i.lineId ?? i.product.id) === productId && i.unitPrice !== price) {
          changed = true;
          return { ...i, unitPrice: price };
        }
        return i;
      });
      return changed ? next : prev;
    });
  }

  const filteredCustomers = React.useMemo(() => {
    if (!customerSearchQuery.trim()) return [];
    const q = customerSearchQuery.toLowerCase();
    return customersData.filter(
      (c) => c.full_name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q),
    );
  }, [customerSearchQuery, customersData]);

  const searchParams = useSearchParams();
  const customerIdParam = searchParams.get("customer_id");

  function selectCustomer(customer: any) {
    setCustomerId(customer.id);
    setCustomerName(customer.full_name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");

    const prefillAddr = customer.primary_address?.address || customer.address;
    if (prefillAddr) {
      setShippingAddress(prefillAddr);
    }
    if (customer.district || customer.primary_address?.district) {
      setDistrict(customer.district || customer.primary_address?.district);
    }
    if (customer.division || customer.primary_address?.division) {
      setDivision(customer.division || customer.primary_address?.division);
    }

    setCustomerSearchQuery("");
    setCustomerSearchFocused(false);
    toast.success("Customer details loaded.");
  }

  React.useEffect(() => {
    if (customerIdParam && customersData.length > 0) {
      const match = customersData.find((c) => String(c.id) === String(customerIdParam));
      if (match) {
        selectCustomer(match);
      }
    }
  }, [customerIdParam, customersData]);

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingCost =
    shippingMethod === "outside-dhaka"
      ? outsideShippingCharge
      : shippingMethod === "inside-dhaka"
        ? insideShippingCharge
        : 0;
  const discountAmount =
    discountType === "percentage"
      ? Math.round((subtotal * (Number(discountValue) || 0)) / 100)
      : Number(discountValue) || 0;
  React.useEffect(() => { if (discountPolicy.data && !discountPolicy.canApply) setDiscountValue(""); }, [discountPolicy.data, discountPolicy.canApply]);
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  React.useEffect(() => {
    if (paymentMethod === "advance") {
      setLoanAmount(total.toFixed(2));
    }
  }, [paymentMethod, total]);


  function resetForm() {
    setCart([]);
    setSearchQuery("");
    setCustomerSearchQuery("");
    setCustomerId(0);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setShippingAddress("");
    setDivision("");
    setDistrict("");
    setThana("");
    setShippingMethod("inside-dhaka");
    setPaymentMethod("cod");
    setAccountNumber("");
    setTransactionId("");
    setPaymentStatus("Unpaid");
    setPaidAmount("");
    setDiscountType("fixed");
    setDiscountValue("");
    setOrderNote("");
    setEmployeeNote("");
    setOrderStatus("Pending");
    setHoldNote("");
    setNextActionDate("");
    setOrderSource("Manual");
    toast.info("Form has been reset.");
  }

  async function handleCreateOrder() {
    const validCart = cart.filter((i) => i.quantity > 0);
    if (validCart.length === 0) {
      toast.error("Please add at least one product with a valid quantity.");
      return;
    }
    if (orderPeople.owner==="employee" && !orderPeople.employeeId) { toast.error("Choose an employee"); return; }
    if (paymentMethod==="advance" && (!loanDate || Number(loanAmount)<=0 || Number(loanAmount)>total || Number(loanInstallments)<1)) {toast.error("Enter a valid advance amount, installments and date. The advance cannot exceed the order total.");return;}
    if (discountAmount > 0 && (!discountPolicy.canApply || discountAmount > discountPolicy.maxAmount(subtotal, 0))) { toast.error("Discount exceeds the available limit for this order."); return; }
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    const phoneTrimmed = customerPhone.trim();
    if (!phoneTrimmed) {
      toast.error("Customer phone is required.");
      return;
    }
    if (phoneTrimmed.length < 11) {
      toast.error("Customer phone must be at least 11 digits.");
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error("Shipping address is required.");
      return;
    }

    if (requiresPaymentDetails && !transactionId.trim()) {
      toast.error("Transaction ID is required for the selected payment method.");
      transactionIdRef.current?.focus();
      return;
    }

    const fullAddress = [shippingAddress, thana, district, division]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ");

    const payload = {
      employee_owner_id: orderPeople.owner==="employee" ? Number(orderPeople.employeeId) : null,
      moderator_id: orderPeople.moderatorId ? Number(orderPeople.moderatorId) : null,
      ...(paymentMethod==="advance" ? {loan_amount:Number(loanAmount),loan_installments:Number(loanInstallments),loan_date:loanDate,loan_purpose:loanPurpose} : {}),
      customer_id: orderPeople.owner==="employee" ? 0 : customerId || 0,
      customer_full_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      customer_shipping_address: fullAddress,
      shipping_area:
        shippingMethod === "inside-dhaka"
          ? "Inside Dhaka"
          : shippingMethod === "outside-dhaka"
            ? "Outside Dhaka"
            : division === "Dhaka"
              ? "Inside Dhaka"
              : "Outside Dhaka",
      subtotal_amount: subtotal,
      discount_amount: discountAmount,
      shipping_charge: shippingCost,
      grand_total_amount: total,
      order_status: orderStatus,
      ...(orderStatus === "Hold" ? { hold_note: holdNote.trim() || null, next_action_date: nextActionDate || null } : {}),
      order_note: orderNote,
      employee_note: employeeNote,
      payment_method:
        paymentMethod === "advance" ? "Loans / Advance" : paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "bkash"
            ? "bKash"
            : paymentMethod === "nagad"
              ? "Nagad"
              : paymentMethod === "rocket"
                ? "Rocket"
                : paymentMethod === "bank"
                  ? "Bank Transfer"
                  : "Card Payment",
      ...(requiresPaymentDetails
        ? { acc_number: accountNumber.trim() || null, transaction_id: transactionId.trim() }
        : {}),
      paid_amount: paymentMethod==="advance" ? 0 : Number(paidAmount) || 0,
      payment_status: paymentMethod==="advance" ? "Unpaid" : paymentStatus,
      source: isWholesale ? "Wholesale" : orderSource,
      products: validCart.map((item) => ({
        product_id: item.product.id,
        product_variant_id: resolveCartVariant(item)?.id,
        qty: item.quantity,
        unit_price: item.unitPrice,
        ...(item.size ? { size_label: item.size } : {}),
        ...(item.color ? { color_label: item.color } : {}),
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.status) {
        toast.success(json.message || `Order created successfully! Total: ৳${total.toLocaleString()}`);
        if (isWholesale) {
          router.push("/dashboard/orders/wholesale");
        } else {
          router.push(`/dashboard/orders/success?order_no=${encodeURIComponent(json.data.order_no)}`);
        }
      } else {
        toast.error(json.error || json.message || "Failed to create order.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const customerSearchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node))
        setCustomerSearchFocused(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${baseUrl}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create Order</h1>
          <p className="text-sm text-muted-foreground">
            Build a new order by searching products, entering customer details, and selecting payment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetForm} disabled={isSubmitting}>
            <RefreshCw className="mr-2 size-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleCreateOrder} disabled={isSubmitting}>
            <Send className="mr-2 size-4" />
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ======== LEFT ======== */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-5" />
                Products
              </CardTitle>
              <CardDescription>Search and add products to this order.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div ref={searchRef} className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by product name, SKU, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                />
                {searchFocused && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover shadow-lg">
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
                                  const prices = (p.variants || [])
                                    .filter((v: any) => v.status !== "hidden")
                                    .map((v: any) => {
                                      const vp = v.variant_pricing || v.variantPricing;
                                      return vp?.selling_price ?? v.selling_price;
                                    })
                                    .filter((pr: any) => pr !== undefined && pr !== null && !isNaN(Number(pr)))
                                    .map(Number);

                                  if (prices.length > 0) {
                                    const min = Math.min(...prices);
                                    const max = Math.max(...prices);
                                    return min === max
                                      ? `৳${min.toLocaleString()}`
                                      : `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
                                  }
                                }
                                return `৳${(p.selling_price || 0).toLocaleString()}`;
                              })()}
                            </span>
                            {inCart && (
                              <Badge variant="secondary" className="text-[10px]">
                                ×{inCart.quantity}
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchFocused && searchQuery.trim() && filteredProducts.length === 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-6 shadow-lg">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Package className="size-8 text-muted-foreground" />
                      <p className="text-sm font-medium">No products found</p>
                      <p className="text-xs text-muted-foreground">Try a different search term.</p>
                    </div>
                  </div>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No products added yet</p>
                  <p className="text-xs text-muted-foreground">Search above to find and add products to this order.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {cart.map((item) => (
                    <CartItemRow
                      key={item.lineId ?? item.product.id}
                      item={item}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                      updateCartItem={updateCartItem}
                      updateUnitPrice={updateUnitPrice}
                      setCartItemQuantity={setCartItemQuantity}
                      isWholesale={isWholesale}
                    />
                  ))}
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-sm text-muted-foreground">
                      {cart.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </span>
                    <span className="text-sm font-semibold tabular-nums">Subtotal: ৳{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-5" />
                Customer Details
              </CardTitle>
              <CardDescription>Enter the customer information for this order.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <OrderPeopleFields value={orderPeople} onChange={value=>{setOrderPeople(value);if(paymentMethod==="advance")setPaymentMethod("cod");}} onEmployee={employee=>{setCustomerId(0);setCustomerName(employee?.full_name || "");setCustomerEmail(employee?.email || "");setCustomerPhone(employee?.phone || "");setShippingAddress("");}} />
              {orderPeople.owner==="customer" && <div ref={customerSearchRef} className="relative z-40">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 bg-muted/50 border-dashed"
                  placeholder="Search registered customer by name, phone, or email..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  onFocus={() => setCustomerSearchFocused(true)}
                />
                {customerSearchFocused && filteredCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-muted/50"
                        onClick={() => selectCustomer(c)}
                      >
                        <p className="text-sm font-semibold">{c.full_name}</p>
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
              </div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customer-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="e.g. Arham Khan"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setCustomerId(0);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email (Optional)</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      setCustomerId(0);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setCustomerId(0);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="size-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping-address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shipping-address"
                  placeholder="House #, Road #, Block, Area..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Select
                    value={division || "none"}
                    onValueChange={(v) => {
                      setDivision(v === "none" ? "" : v);
                      setDistrict("");
                      setThana("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select division</SelectItem>
                      {divisions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select
                    value={district || "none"}
                    onValueChange={(v) => {
                      setDistrict(v === "none" ? "" : v);
                      setThana("");
                    }}
                    disabled={!division}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select district</SelectItem>
                      {availableDistricts.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Thana</Label>
                  <Select
                    value={thana || "none"}
                    onValueChange={(v) => setThana(v === "none" ? "" : v)}
                    disabled={!district}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select thana" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select thana</SelectItem>
                      {availableThanas.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shipping Method</Label>
                  <Select value={shippingMethod} onValueChange={setShippingMethod}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inside-dhaka">Inside Dhaka — ৳{insideShippingCharge}</SelectItem>
                      <SelectItem value="outside-dhaka">Outside Dhaka — ৳{outsideShippingCharge}</SelectItem>
                      <SelectItem value="free">Free Shipping — ৳0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ======== RIGHT ======== */}
        <div className="flex min-w-0 flex-col gap-3 [&_label]:text-xs [&_label]:font-medium [&_[data-slot=select-trigger]]:text-xs [&_input]:text-xs [&_textarea]:text-xs">
          {/* Payment */}
          <Card size="sm" className="gap-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <CreditCard className="size-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <Label className="text-primary font-medium">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value);
                    setAccountNumber("");
                    setTransactionId("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderPeople.owner==="employee" && orderPeople.canAdvance && <SelectItem value="advance">Loans / Advance</SelectItem>}
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod==="advance" && <div className="space-y-3 rounded-lg border p-3">
                <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1"><Label htmlFor="loan-amount">Advance Amount (৳) *</Label><Input id="loan-amount" type="number" min="0.01" max={total} step="0.01" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)}/></div><div className="space-y-1"><Label htmlFor="loan-months">Installments (Months) *</Label><Input id="loan-months" type="number" min="1" max="120" value={loanInstallments} onChange={e=>setLoanInstallments(e.target.value)}/></div></div>
                <div className="rounded-md bg-muted p-3 text-sm">Monthly Payroll Deduction: <strong>৳{(Number(loanAmount)/Math.max(1,Number(loanInstallments))).toFixed(2)}/month</strong></div>
                <Label htmlFor="loan-date">Disbursement Date *</Label><Input id="loan-date" type="date" value={loanDate} onChange={e=>setLoanDate(e.target.value)}/>
                <Label htmlFor="loan-purpose">Reason / Purpose</Label><Textarea id="loan-purpose" value={loanPurpose} onChange={e=>setLoanPurpose(e.target.value)}/>
                <p className="text-xs text-muted-foreground">Creates a linked HRM advance under your existing approval permissions. This is not recorded as cash received.</p>
              </div>}
              {requiresPaymentDetails && (
                <div className="grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-account-number">
                      Acc No <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="payment-account-number"
                      value={accountNumber}
                      onChange={(event) => setAccountNumber(event.target.value)}
                      placeholder="Account number"
                      maxLength={50}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-transaction-id">
                      Transaction ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      ref={transactionIdRef}
                      id="payment-transaction-id"
                      value={transactionId}
                      onChange={(event) => setTransactionId(event.target.value)}
                      placeholder="Transaction reference"
                      maxLength={50}
                      autoComplete="off"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
              )}

              {paymentMethod!=="advance" && <div>
                <PartialPaymentForm
                  compact
                  orderTotal={total}
                  status={paymentStatus}
                  onStatusChange={setPaymentStatus}
                  paidAmount={paidAmount}
                  onPaidAmountChange={setPaidAmount}
                  paymentMethod={paymentMethod}
                />
              </div>}
            </CardContent>
          </Card>

          {discountPolicy.enabled && discountPolicy.canApply && <>
          {/* Discount */}
          <Card size="sm" className="gap-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="size-4" /> Discount{" "}
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-primary font-medium">Type</Label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-primary font-medium">Value</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-8 items-center justify-center border-r text-xs text-muted-foreground">
                      {discountType === "percentage" ? "%" : "৳"}
                    </span>
                    <Input
                      aria-label="Discount value"
                      className="pl-10"
                      type="number"
                      placeholder="0"
                      min={0}
                      max={discountType === "percentage" ? (subtotal > 0 ? discountPolicy.maxAmount(subtotal, 0) / subtotal * 100 : 0) : discountPolicy.maxAmount(subtotal, 0)}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {discountAmount > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  Discount applied: −৳{discountAmount.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
          </>}
          <p className="text-xs text-muted-foreground">{discountPolicy.message}{discountPolicy.canApply && <> · Maximum available for this order: ৳{discountPolicy.maxAmount(subtotal, 0).toLocaleString()}</>}</p>

          {/* Order Settings */}
          <Card size="sm" className="gap-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="size-4" /> Order Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor="order-source">Order Source</Label>
                  <Select
                    value={isWholesale ? "Wholesale" : orderSource}
                    onValueChange={setOrderSource}
                    disabled={isSubmitting || isWholesale}
                  >
                    <SelectTrigger id="order-source" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isWholesale ? (
                        <SelectItem value="Wholesale">Wholesale</SelectItem>
                      ) : (
                        manualOrderSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor="order-status">Order Status</Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger id="order-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Ready To Ship">Ready To Ship</SelectItem>
                      <SelectItem value="In-Courier">In-Courier</SelectItem>
                      <SelectItem value="Ship Later">Ship Later</SelectItem>
                      <SelectItem value="Hold">Hold</SelectItem>
                      <SelectItem value="Pending-Return">Pending-Return</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Returned">Returned</SelectItem>
                      <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                      <SelectItem value="Fake">Fake</SelectItem>
                      <SelectItem value="Trash">Trash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {orderStatus === "Hold" && <HoldOrderFields note={holdNote} date={nextActionDate} onNoteChange={setHoldNote} onDateChange={setNextActionDate} disabled={isSubmitting} />}
              <div className="space-y-1.5">
                <Label htmlFor="order-note" className="text-primary font-medium">
                  Order Note (Customer)
                </Label>
                <Textarea
                  id="order-note"
                  placeholder="Customer note or instructions..."
                  className="min-h-[58px] resize-y"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="employee-note" className="text-primary font-medium">
                  Order Note (Employee)
                </Label>
                <Textarea
                  id="employee-note"
                  placeholder="Internal note..."
                  className="min-h-[58px] resize-y"
                  value={employeeNote}
                  onChange={(e) => setEmployeeNote(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card
            size="sm"
            className="gap-2 bg-amber-50/40 ring-amber-900/10 dark:bg-amber-950/10 dark:ring-amber-200/10"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="size-4 text-amber-800 dark:text-amber-400" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span>Items ({cart.reduce((count, item) => count + item.quantity, 0)})</span>
                <span className="tabular-nums">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Discount</span>
                <span className="tabular-nums">− ৳ {discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Shipping</span>
                <span className="tabular-nums">৳ {shippingCost.toLocaleString()}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  ৳ {total.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
