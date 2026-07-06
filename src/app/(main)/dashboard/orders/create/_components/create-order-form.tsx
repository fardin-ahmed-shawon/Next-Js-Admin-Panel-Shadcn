"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { CreditCard, Minus, Package, Plus, RefreshCw, Search, Send, ShoppingCart, Truck, User, X } from "lucide-react";
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

import { PartialPaymentForm } from "../../_components/partial-payment-form";
import { districts, divisions, thanas } from "./bd-locations";

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
  size: string;
  unitPrice: number;
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

const getImageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
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

  const allSizes = React.useMemo(() => {
    const list = Array.isArray(sizesRes) ? sizesRes : sizesRes?.data || [];
    return list;
  }, [sizesRes]);

  const allColors = React.useMemo(() => {
    const list = Array.isArray(colorsRes) ? colorsRes : colorsRes?.data || [];
    return list;
  }, [colorsRes]);

  const variants = React.useMemo(() => {
    return item.product.variants || [];
  }, [item.product.variants]);

  const sizes = React.useMemo(
    () => allSizes.filter((s: any) => variants.some((v: any) => v.size_id === s.id)),
    [allSizes, variants],
  );
  const colors = React.useMemo(
    () => allColors.filter((c: any) => variants.some((v: any) => v.color_id === c.id)),
    [allColors, variants],
  );

  const requiresVariant = Number(item.product.has_variants) === 1 && variants.length > 0;
  let isValidVariant = true;

  const availableColors = item.size
    ? colors.filter((c: any) => {
        const sizeId = sizes.find((s: any) => s.label === item.size)?.id;
        return variants.some((v: any) => v.size_id === sizeId && v.color_id === c.id);
      })
    : colors;

  const availableSizes = item.color
    ? sizes.filter((s: any) => {
        const colorId = colors.find((c: any) => c.label === item.color)?.id;
        return variants.some((v: any) => v.color_id === colorId && v.size_id === s.id);
      })
    : sizes;

  React.useEffect(() => {
    if (requiresVariant && item.size && item.color) {
      const selectedSizeId = sizes.find((s: any) => s.label === item.size)?.id || null;
      const selectedColorId = colors.find((c: any) => c.label === item.color)?.id || null;
      const variant = variants.find((v: any) => v.size_id === selectedSizeId && v.color_id === selectedColorId);

      if (variant && variant.variant_pricing) {
        updateUnitPrice(item.product.id, variant.variant_pricing.selling_price);
      }
    }
  }, [item.size, item.color, sizes, colors, variants]);

  React.useEffect(() => {
    if (requiresVariant) {
      if (availableSizes.length === 1 && item.size !== availableSizes[0].label) {
        updateCartItem(item.product.id, "size", availableSizes[0].label);
      }
      if (availableColors.length === 1 && item.color !== availableColors[0].label) {
        updateCartItem(item.product.id, "color", availableColors[0].label);
      }
    }
  }, [availableSizes, availableColors, item.size, item.color, requiresVariant]);

  const requiresSize = sizes.length > 0;
  const requiresColor = colors.length > 0;
  const isSizeComplete = !requiresSize || !!item.size;
  const isColorComplete = !requiresColor || !!item.color;

  if (requiresVariant && isSizeComplete && isColorComplete && (item.size || item.color)) {
    const selectedSizeId = requiresSize ? sizes.find((s: any) => s.label === item.size)?.id : null;
    const selectedColorId = requiresColor ? colors.find((c: any) => c.label === item.color)?.id : null;
    isValidVariant = variants.some(
      (v: any) =>
        (requiresSize ? v.size_id === selectedSizeId : true) && (requiresColor ? v.color_id === selectedColorId : true),
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
          <p className="text-xs text-muted-foreground">
            {item.product.sku || "N/A"} · ৳{item.unitPrice.toLocaleString()} each
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={() => updateQuantity(item.product.id, -1)}>
            <Minus className="size-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
          <Button variant="outline" size="icon-sm" onClick={() => updateQuantity(item.product.id, 1)}>
            <Plus className="size-3" />
          </Button>
        </div>
        <span className="w-20 text-right text-sm font-semibold tabular-nums">
          ৳{(item.unitPrice * item.quantity).toLocaleString()}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => removeFromCart(item.product.id)}>
          <X className="size-4 text-muted-foreground" />
        </Button>
      </div>

      {requiresVariant && (
        <div className="mt-2 flex flex-col gap-2 pl-15">
          <div className="flex items-center gap-3">
            {availableColors.length > 1 ? (
              <Select value={item.color} onValueChange={(v) => updateCartItem(item.product.id, "color", v)}>
                <SelectTrigger
                  className={`h-7 w-28 text-xs ${!isValidVariant && item.color ? "border-destructive text-destructive" : ""}`}
                >
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((c: any) => (
                    <SelectItem key={c.id} value={c.label}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : availableColors.length === 1 ? (
              <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0">
                Color: {availableColors[0].label}
              </div>
            ) : null}

            {availableSizes.length > 1 ? (
              <Select value={item.size} onValueChange={(v) => updateCartItem(item.product.id, "size", v)}>
                <SelectTrigger
                  className={`h-7 w-28 text-xs ${!isValidVariant && item.size ? "border-destructive text-destructive" : ""}`}
                >
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((s: any) => (
                    <SelectItem key={s.id} value={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : availableSizes.length === 1 ? (
              <div className="h-7 px-3 py-1 bg-muted/50 rounded-md border text-xs flex items-center shrink-0">
                Size: {availableSizes[0].label}
              </div>
            ) : null}

            {(item.color || item.size) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  updateCartItem(item.product.id, "color", "");
                  updateCartItem(item.product.id, "size", "");
                  updateUnitPrice(
                    item.product.id,
                    item.product.has_variant_wise_pricing ? 0 : item.product.selling_price || 0,
                  );
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

export function CreateOrderForm() {
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
        const res = await fetch(url);
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
        const res = await fetch(url);
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
  const [paymentStatus, setPaymentStatus] = React.useState("Unpaid");
  const [paidAmount, setPaidAmount] = React.useState<number | "">("");

  const [discountType, setDiscountType] = React.useState("fixed");
  const [discountValue, setDiscountValue] = React.useState("");
  const [orderNote, setOrderNote] = React.useState("");
  const [orderStatus, setOrderStatus] = React.useState("Pending");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const searchRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const availableDistricts = division ? districts[division] || [] : [];
  const availableThanas = district ? thanas[district] || [] : [];

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));

      // If it has variant wise pricing, but no variants selected yet, we might want to default to 0 or product.selling_price
      // It will auto-update when they select a size/color via the useEffect in CartItemRow
      const initialPrice = product.has_variant_wise_pricing ? 0 : product.selling_price || 0;
      return [...prev, { product, quantity: 1, color: "", size: "", unitPrice: initialPrice }];
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

  function updateCartItem(productId: number, field: "color" | "size", value: string) {
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, [field]: value } : i)));
  }

  function updateUnitPrice(productId: number, price: number) {
    setCart((prev) => {
      let changed = false;
      const next = prev.map((i) => {
        if (i.product.id === productId && i.unitPrice !== price) {
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

  function selectCustomer(customer: any) {
    setCustomerId(customer.id);
    setCustomerName(customer.full_name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");

    // Automatically fill address if available in parcel_history or orders? No, just address from the model if any.
    // They don't have address in the root JSON, so leave address blank for them to type.

    setCustomerSearchQuery("");
    setCustomerSearchFocused(false);
    toast.success("Customer details loaded.");
  }

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
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

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
    setPaymentStatus("unpaid");
    setPaidAmount("");
    setDiscountType("fixed");
    setDiscountValue("");
    setOrderNote("");
    setOrderStatus("Pending");
    toast.info("Form has been reset.");
  }

  async function handleCreateOrder() {
    if (cart.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Customer phone is required.");
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error("Shipping address is required.");
      return;
    }

    const fullAddress = [shippingAddress, thana, district, division]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ");

    const payload = {
      customer_id: customerId || 0,
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
      order_note: orderNote,
      payment_method:
        paymentMethod === "cod"
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
      paid_amount: Number(paidAmount) || 0,
      payment_status: paymentStatus,
      products: cart.map((item) => ({
        product_id: item.product.id,
        qty: item.quantity,
        unit_price: item.unitPrice,
        ...(item.size ? { size_label: item.size } : {}),
        ...(item.color ? { color_label: item.color } : {}),
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.status) {
        toast.success(json.message || `Order created successfully! Total: ৳${total.toLocaleString()}`);
        router.push("/dashboard/orders");
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
          <h1 className="text-3xl tracking-tight">Create Order</h1>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ======== LEFT ======== */}
        <div className="flex flex-col gap-6 lg:col-span-2">
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
                              {p.has_variant_wise_pricing
                                ? "Variant Pricing"
                                : `৳${(p.selling_price || 0).toLocaleString()}`}
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
                      key={item.product.id}
                      item={item}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                      updateCartItem={updateCartItem}
                      updateUnitPrice={updateUnitPrice}
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
              <div ref={customerSearchRef} className="relative z-40">
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
              </div>

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
                  <Label htmlFor="customer-email">Email</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="size-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>Where should this order be delivered?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="shipping-address">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="shipping-address"
                  placeholder="House #, Road #, Block, Area..."
                  className="min-h-[80px] resize-y"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
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
              </div>
              <Separator />
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
            </CardContent>
          </Card>
        </div>

        {/* ======== RIGHT ======== */}
        <div className="flex flex-col gap-6">
          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <CreditCard className="size-5" />
                Payment
              </CardTitle>
              <CardDescription>Select payment method and status.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label className="text-primary font-medium">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-2 border-t pt-4">
                <PartialPaymentForm
                  orderTotal={total}
                  status={paymentStatus}
                  onStatusChange={setPaymentStatus}
                  paidAmount={paidAmount}
                  onPaidAmountChange={setPaidAmount}
                  paymentMethod={paymentMethod}
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Discount</CardTitle>
              <CardDescription>Apply a discount to this order.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-primary font-medium">Type</Label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (৳)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-medium">Value</Label>
                  <Input
                    type="number"
                    placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 200"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>
              {discountAmount > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  Discount applied: −৳{discountAmount.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Order Status</CardTitle>
              <CardDescription>Set the initial status for this order.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Ready To Ship">Ready To Ship</SelectItem>
                  <SelectItem value="In-Courier">In-Courier</SelectItem>
                  <SelectItem value="Ship Later">Ship Later</SelectItem>
                  <SelectItem value="Hold">Hold</SelectItem>
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
              <div className="space-y-2">
                <Label htmlFor="order-note" className="text-primary font-medium">
                  Order Note
                </Label>
                <Textarea
                  id="order-note"
                  placeholder="Internal notes about this order..."
                  className="min-h-[80px] resize-y"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium tabular-nums">৳{shippingCost.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium tabular-nums text-emerald-600">−৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold tabular-nums text-primary">৳{total.toLocaleString()}</span>
              </div>
              <Button className="w-full mt-2" onClick={handleCreateOrder} disabled={isSubmitting}>
                <Send className="mr-2 size-4" />
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
