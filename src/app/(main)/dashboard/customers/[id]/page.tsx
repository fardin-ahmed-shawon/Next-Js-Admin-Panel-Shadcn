"use client";

import * as React from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, CreditCard, Mail, MapPin, Package, Phone, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Using our mock data concept
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
    avatar: "https://placehold.co/100x100/1a1a2e/e0e0e0?text=AK",
    totalOrders: 15,
    totalSpent: 45000,
    lastPurchaseDate: "2026-05-19",
    status: "Active",
    customerType: "Registered",
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
    avatar: "https://placehold.co/100x100/1a1a2e/e0e0e0?text=NJ",
    totalOrders: 8,
    totalSpent: 22000,
    lastPurchaseDate: "2026-05-18",
    status: "Active",
    customerType: "Registered",
  },
];

const mockOrderHistory = [
  {
    id: "ORD-8901",
    date: "2026-05-19",
    total: 3500,
    status: "Delivered",
    paymentStatus: "Full Paid",
    items: [
      { name: "Premium Cotton T-Shirt", price: 850, qty: 2, color: "Black", size: "M" },
      { name: "Slim Fit Denim Jeans", price: 1450, qty: 1, color: "Blue", size: "32" },
    ],
  },
  {
    id: "ORD-8750",
    date: "2026-04-12",
    total: 2200,
    status: "Delivered",
    paymentStatus: "Full Paid",
    items: [{ name: "Wireless Bluetooth Earbuds", price: 2200, qty: 1, color: "White", size: "Standard" }],
  },
  {
    id: "ORD-8102",
    date: "2026-02-28",
    total: 480,
    status: "Returned",
    paymentStatus: "Refund",
    items: [{ name: "Stainless Steel Water Bottle", price: 480, qty: 1, color: "Silver", size: "500ml" }],
  },
];

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();

  // Find customer or fallback to first one for preview purposes
  const customer = mockCustomers.find((c) => c.id === id) || mockCustomers[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link href="/dashboard/purchase-history">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="text-3xl tracking-tight">Customer Profile</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            View complete details, history, and metrics for this customer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Edit Customer
          </Button>
          <Button size="sm">Create New Order</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-primary/10 bg-primary/5">
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <Avatar className="size-24 border-4 border-background shadow-sm">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="text-2xl">{customer.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant={customer.customerType === "Registered" ? "secondary" : "outline"}
                  className={customer.customerType === "Registered" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                >
                  {customer.customerType}
                </Badge>
                <Badge variant={customer.status === "Active" ? "default" : "secondary"}>{customer.status}</Badge>
              </div>
            </div>

            <Separator className="my-2 bg-primary/10" />

            <div className="w-full space-y-4 text-sm text-left">
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{customer.email || "No email provided"}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="font-medium text-muted-foreground leading-snug">
                  {customer.address}
                  <br />
                  {customer.thana}, {customer.district}
                  <br />
                  {customer.division}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics & History */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="size-4" /> Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{customer.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Last order on {customer.lastPurchaseDate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="size-4" /> Lifetime Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">৳{customer.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average order: ৳{Math.round(customer.totalSpent / customer.totalOrders).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>The most recent purchases made by {customer.name}.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Products & Variants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrderHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 py-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-sm font-medium">
                                {item.name} <span className="text-muted-foreground font-normal">x{item.qty}</span>
                              </span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  <div
                                    className="size-2 rounded-full bg-border"
                                    style={{ backgroundColor: item.color.toLowerCase() }}
                                  />{" "}
                                  {item.color}
                                </span>
                                <span>·</span>
                                <span>Size: {item.size}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "default"
                                : order.status === "Returned"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right font-semibold">৳{order.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
