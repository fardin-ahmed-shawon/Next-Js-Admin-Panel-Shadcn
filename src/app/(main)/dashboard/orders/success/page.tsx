"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  MapPin,
  Package,
  Plus,
  Printer,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Demo order data (simulates what would come from a server response) */
/* ------------------------------------------------------------------ */

const order = {
  id: "ORD-20260518-0042",
  date: "May 18, 2026 — 11:25 AM",
  status: "Confirmed",
  customer: {
    name: "Arham Khan",
    email: "arham@example.com",
    phone: "+880 1711-234567",
  },
  shipping: {
    address: "House #12, Road #5, Block C, Mirpur-10",
    division: "Dhaka",
    district: "Dhaka",
    thana: "Mirpur",
    method: "Inside Dhaka",
    cost: 70,
  },
  payment: {
    method: "bKash",
    status: "Full Paid",
    transactionId: "TXN8A3K92M1X",
  },
  items: [
    { name: "Premium Cotton T-Shirt", sku: "SKU-001", color: "Black", size: "L", qty: 2, price: 850, image: "https://placehold.co/64x64/1a1a2e/e0e0e0?text=TS" },
    { name: "Slim Fit Denim Jeans", sku: "SKU-002", color: "Navy", size: "32", qty: 1, price: 1450, image: "https://placehold.co/64x64/1a1a2e/e0e0e0?text=DJ" },
    { name: "Classic Polo Shirt", sku: "SKU-009", color: "White", size: "XL", qty: 1, price: 950, image: "https://placehold.co/64x64/1a1a2e/e0e0e0?text=PS" },
  ],
  subtotal: 4100,
  discount: 200,
  shippingCost: 70,
  total: 3970,
  note: "Please deliver between 10 AM - 2 PM.",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OrderSuccessPage() {
  function copyOrderId() {
    navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied to clipboard.");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Success Banner */}
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-emerald-50/50 py-10 dark:bg-emerald-950/10">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Order Created Successfully!</h1>
          <p className="text-sm text-muted-foreground">Your order has been placed and is being processed.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2">
          <span className="text-sm text-muted-foreground">Order ID:</span>
          <span className="font-mono text-sm font-semibold">{order.id}</span>
          <Button variant="ghost" size="icon-sm" onClick={copyOrderId}>
            <Copy className="size-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{order.date}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => toast.info("Print functionality coming soon.")}>
          <Printer className="mr-2 size-4" />Print Invoice
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders"><Package className="mr-2 size-4" />View All Orders</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/dashboard/orders/create"><Plus className="mr-2 size-4" />Create Another Order</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ======== LEFT — Order Items ======== */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-5" />
                Order Items
              </CardTitle>
              <CardDescription>{order.items.length} product(s) in this order</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <img src={item.image} alt={item.name} className="size-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sku} · {item.color} · {item.size}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium tabular-nums">৳{(item.price * item.qty).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">৳{item.price.toLocaleString()} × {item.qty}</p>
                  </div>
                </div>
              ))}

              <Separator className="my-1" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">৳{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping ({order.shipping.method})</span>
                  <span className="font-medium tabular-nums">৳{order.shippingCost.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium tabular-nums text-emerald-600">−৳{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold tabular-nums text-primary">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Note */}
          {order.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ======== RIGHT — Details ======== */}
        <div className="flex flex-col gap-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <User className="size-5" />Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{order.customer.name}</p>
                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <MapPin className="size-5" />Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm">{order.shipping.address}</p>
              <p className="text-xs text-muted-foreground">
                {order.shipping.thana}, {order.shipping.district}, {order.shipping.division}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Truck className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">{order.shipping.method} — ৳{order.shipping.cost}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <CreditCard className="size-5" />Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="text-sm font-medium">{order.payment.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">{order.payment.status}</Badge>
              </div>
              {order.payment.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="text-xs font-mono font-medium">{order.payment.transactionId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm px-3 py-1">{order.status}</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
