"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { CreditCard, Minus, Package, Plus, RefreshCw, Search, Send, ShoppingCart, Truck, User, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { PartialPaymentForm } from "../../_components/partial-payment-form";
import { districts, divisions, thanas } from "./bd-locations";

/* ---- catalogue ---- */

const colorOptions = [
  "Red",
  "Blue",
  "Green",
  "Black",
  "White",
  "Yellow",
  "Pink",
  "Purple",
  "Orange",
  "Navy",
  "Maroon",
  "Gray",
];
const sizeOptions = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "Free Size",
];

const productCatalogue = [
  {
    id: "PRD-001",
    name: "Premium Cotton T-Shirt",
    sku: "SKU-001",
    price: 850,
    stock: 124,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=TS",
    category: "Clothing",
  },
  {
    id: "PRD-002",
    name: "Slim Fit Denim Jeans",
    sku: "SKU-002",
    price: 1450,
    stock: 67,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=DJ",
    category: "Clothing",
  },
  {
    id: "PRD-003",
    name: "Wireless Bluetooth Earbuds",
    sku: "SKU-003",
    price: 2200,
    stock: 42,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=BE",
    category: "Electronics",
  },
  {
    id: "PRD-004",
    name: "Leather Crossbody Bag",
    sku: "SKU-004",
    price: 3100,
    stock: 18,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=CB",
    category: "Accessories",
  },
  {
    id: "PRD-005",
    name: "Running Sneakers Pro",
    sku: "SKU-005",
    price: 2800,
    stock: 55,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=RS",
    category: "Footwear",
  },
  {
    id: "PRD-006",
    name: "Organic Face Moisturizer",
    sku: "SKU-006",
    price: 650,
    stock: 200,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=FM",
    category: "Beauty",
  },
  {
    id: "PRD-007",
    name: "Stainless Steel Water Bottle",
    sku: "SKU-007",
    price: 480,
    stock: 310,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=WB",
    category: "Home",
  },
  {
    id: "PRD-008",
    name: "Smart Fitness Watch",
    sku: "SKU-008",
    price: 4500,
    stock: 29,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=FW",
    category: "Electronics",
  },
  {
    id: "PRD-009",
    name: "Classic Polo Shirt",
    sku: "SKU-009",
    price: 950,
    stock: 88,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=PS",
    category: "Clothing",
  },
  {
    id: "PRD-010",
    name: "Minimalist Desk Lamp",
    sku: "SKU-010",
    price: 1200,
    stock: 45,
    image: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=DL",
    category: "Home",
  },
];

const mockCustomers = [
  {
    id: "CUST-001",
    name: "Arham Khan",
    phone: "+880 1711-234567",
    email: "arham@example.com",
    address: "House 12, Road 5, Banani",
    division: "Dhaka",
    district: "Dhaka",
    thana: "Banani",
  },
  {
    id: "CUST-002",
    name: "Nusrat Jahan",
    phone: "+880 1614-567890",
    email: "nusrat@example.com",
    address: "Flat 4B, Green Tower, Dhanmondi",
    division: "Dhaka",
    district: "Dhaka",
    thana: "Dhanmondi",
  },
  {
    id: "CUST-003",
    name: "Maliha Sultana",
    phone: "+880 1918-901234",
    email: "maliha@example.com",
    address: "24/A, South Surma",
    division: "Sylhet",
    district: "Sylhet",
    thana: "South Surma",
  },
];

type CatalogueProduct = (typeof productCatalogue)[0];

interface CartItem {
  product: CatalogueProduct;
  quantity: number;
  color: string;
  size: string;
}

/* ---- component ---- */

export function CreateOrderForm() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);

  const [customerSearchQuery, setCustomerSearchQuery] = React.useState("");
  const [customerSearchFocused, setCustomerSearchFocused] = React.useState(false);

  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");

  const [shippingAddress, setShippingAddress] = React.useState("");
  const [division, setDivision] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [thana, setThana] = React.useState("");
  const [shippingMethod, setShippingMethod] = React.useState("inside-dhaka");

  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [paymentStatus, setPaymentStatus] = React.useState("unpaid");
  const [transactionId, setTransactionId] = React.useState("");
  const [paidAmount, setPaidAmount] = React.useState<number | "">("");

  const [discountType, setDiscountType] = React.useState("fixed");
  const [discountValue, setDiscountValue] = React.useState("");
  const [orderNote, setOrderNote] = React.useState("");
  const [orderStatus, setOrderStatus] = React.useState("pending");

  const searchRef = React.useRef<HTMLDivElement>(null);
  const customerSearchRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return productCatalogue.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const filteredCustomers = React.useMemo(() => {
    if (!customerSearchQuery.trim()) return [];
    const q = customerSearchQuery.toLowerCase();
    return mockCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customerSearchQuery]);

  const availableDistricts = division ? districts[division] || [] : [];
  const availableThanas = district ? thanas[district] || [] : [];

  function addToCart(product: CatalogueProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { product, quantity: 1, color: "", size: "" }];
    });
    setSearchQuery("");
    setSearchFocused(false);
    toast.success(`${product.name} added to order.`);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateCartItem(productId: string, field: "color" | "size", value: string) {
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, [field]: value } : i)));
  }

  function selectCustomer(customer: (typeof mockCustomers)[0]) {
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone);
    setShippingAddress(customer.address);
    setDivision(customer.division);
    setDistrict(customer.district);
    setThana(customer.thana);
    setCustomerSearchQuery("");
    setCustomerSearchFocused(false);
    toast.success("Customer details loaded.");
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingCost = shippingMethod === "outside-dhaka" ? 150 : shippingMethod === "inside-dhaka" ? 70 : 0;
  const discountAmount =
    discountType === "percentage"
      ? Math.round((subtotal * (Number(discountValue) || 0)) / 100)
      : Number(discountValue) || 0;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  function resetForm() {
    setCart([]);
    setSearchQuery("");
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
    setTransactionId("");
    setPaidAmount("");
    setDiscountType("fixed");
    setDiscountValue("");
    setOrderNote("");
    setOrderStatus("pending");
    toast.info("Form has been reset.");
  }

  function handleCreateOrder() {
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
    toast.success(`Order created successfully! Total: ৳${total.toLocaleString()}`);
    router.push("/dashboard/orders/success");
  }

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node))
        setCustomerSearchFocused(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <Button variant="outline" size="sm" onClick={resetForm}>
            <RefreshCw className="mr-2 size-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleCreateOrder}>
            <Send className="mr-2 size-4" />
            Create Order
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
                            <img src={p.image} alt={p.name} className="size-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.sku} · Stock: {p.stock}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-semibold tabular-nums">৳{p.price.toLocaleString()}</span>
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
                    <div key={item.product.id} className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <img src={item.product.image} alt={item.product.name} className="size-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.product.sku} · ৳{item.product.price.toLocaleString()} each
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
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeFromCart(item.product.id)}>
                          <X className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                      {/* Color & Size */}
                      <div className="mt-2 flex items-center gap-3 pl-15">
                        <Select value={item.color} onValueChange={(v) => updateCartItem(item.product.id, "color", v)}>
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={item.size} onValueChange={(v) => updateCartItem(item.product.id, "size", v)}>
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue placeholder="Size" />
                          </SelectTrigger>
                          <SelectContent>
                            {sizeOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
                        <p className="text-sm font-semibold">{c.name}</p>
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
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
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
                    onChange={(e) => setCustomerPhone(e.target.value)}
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
                    value={division}
                    onValueChange={(v) => {
                      setDivision(v);
                      setDistrict("");
                      setThana("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
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
                    value={district}
                    onValueChange={(v) => {
                      setDistrict(v);
                      setThana("");
                    }}
                    disabled={!division}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Select value={thana} onValueChange={setThana} disabled={!district}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select thana" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectItem value="inside-dhaka">Inside Dhaka — ৳70</SelectItem>
                    <SelectItem value="outside-dhaka">Outside Dhaka — ৳150</SelectItem>
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
                  transactionId={transactionId}
                  onTransactionIdChange={setTransactionId}
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="ready-to-ship">Ready To Ship</SelectItem>
                  <SelectItem value="in-courier">In-Courier</SelectItem>
                  <SelectItem value="ship-later">Ship Later</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="pre-order">Pre-Order</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="fake">Fake</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
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
              <Button className="w-full mt-2" onClick={handleCreateOrder}>
                <Send className="mr-2 size-4" />
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
