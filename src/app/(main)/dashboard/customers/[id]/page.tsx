"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  CreditCard,
  Edit,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCustomer } from "@/hooks/useCustomers";
import { formatDate, getInitials } from "@/lib/utils";

import { EditCustomerDialog } from "./_components/edit-customer-dialog";
import { CustomerNotesSection } from "./_components/customer-notes-section";
import { CustomerOrdersTable } from "./_components/customer-orders-table";
import { CustomerTagsManager } from "./_components/customer-tags-manager";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { customer, crmStats, addresses, isLoading, error, mutate } = useCustomer(id);

  const [editOpen, setEditOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("orders");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[460px] rounded-xl" />
          <Skeleton className="h-[460px] lg:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="size-8 text-muted-foreground stroke-1" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Customer Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          No customer found matching ID &ldquo;{id}&rdquo;. They may have been deleted or the link is incorrect.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="mr-2 size-4" /> Back to Customers
            </Link>
          </Button>
          <Button variant="default" onClick={() => mutate()}>
            <RefreshCw className="mr-2 size-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const orders = customer.orders || [];
  const stats = crmStats || {
    total_orders: orders.length,
    delivered_orders: orders.filter((o: any) => o.order_status === "Delivered").length,
    cancelled_orders: orders.filter((o: any) => o.order_status === "Cancelled").length,
    returned_orders: orders.filter((o: any) => o.order_status === "Returned").length,
    pending_orders: orders.filter((o: any) => ["Pending", "Processing", "Confirmed"].includes(o.order_status)).length,
    total_spent: customer.parcel_history?.total_spent || 0,
    average_order_value: customer.parcel_history?.average_order_value || 0,
    success_rate: customer.parcel_history?.success_rate || 0,
    return_rate: customer.parcel_history?.return_rate || 0,
    customer_segment: customer.customer_type || "Retail",
    first_order_date: null,
    last_order_date: null,
  };

  const cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "").replace(/^88/, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/88${cleanPhone}` : null;
  const avatarUrl = customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name || "Customer")}&background=0284c7&color=fff`;

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case "VIP":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold hover:bg-amber-500/20">
            <Sparkles className="size-3" /> VIP Customer
          </Badge>
        );
      case "Loyal / Repeat":
      case "Repeat":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold hover:bg-blue-500/20">
            <CheckCircle2 className="size-3" /> Loyal Buyer
          </Badge>
        );
      case "High Return Risk":
        return (
          <Badge variant="destructive" className="gap-1 font-semibold">
            <ShieldAlert className="size-3" /> High Return Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-medium">
            {segment || "Retail"}
          </Badge>
        );
    }
  };

  const primaryAddr = customer.primary_address || {
    address: customer.address || "",
    city: customer.city || "",
    district: customer.district || "",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link href="/dashboard/customers" title="Back to All Customers">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {customer.full_name}
              </h1>
              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                ID: {customer.id}
              </span>
              {getSegmentBadge(stats.customer_segment)}
              <Badge
                variant={customer.status === "active" ? "default" : "outline"}
                className={customer.status === "active" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {customer.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground ml-10">
            Comprehensive CRM profile, order history, communication logs, and customer metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {customer.phone && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`tel:${customer.phone}`}>
                <PhoneCall className="size-3.5 text-blue-600" />
                <span className="hidden sm:inline">Call</span>
              </a>
            </Button>
          )}

          {whatsappUrl && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="size-3.5 text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </Button>
          )}

          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Edit className="size-3.5" />
            <span>Edit Profile</span>
          </Button>

          <Button size="sm" className="gap-1.5" asChild>
            <Link href={`/dashboard/orders/create?customer_id=${customer.id}`}>
              <Plus className="size-3.5" />
              <span>Create Order</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* LTV */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Lifetime Value (LTV)</span>
              <CreditCard className="size-4 text-primary opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-primary">
              ৳{Number(stats.total_spent || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Avg Order: ৳{Number(stats.average_order_value || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Purchases</span>
              <Package className="size-4 text-blue-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.total_orders} <span className="text-xs font-normal text-muted-foreground">orders</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {stats.delivered_orders} delivered
              </span>
              <span>·</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {stats.pending_orders} pending
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Courier Success Rate */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Delivery Success</span>
              <Truck className="size-4 text-emerald-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.success_rate}%
              </div>
              <span className="text-[11px] text-muted-foreground">
                Return: {stats.return_rate}%
              </span>
            </div>
            <Progress value={stats.success_rate} className="h-1.5 mt-2 bg-muted" />
          </CardContent>
        </Card>

        {/* Timeline / Retention */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Customer Activity</span>
              <Calendar className="size-4 text-purple-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-foreground truncate">
              {stats.last_order_date ? `Last: ${stats.last_order_date.split(" ")[0]}` : "No purchases yet"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Joined {formatDate(customer.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Profile Card + Right Tabs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Customer Profile & Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Identity Card */}
          <Card className="border-border">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
              <Avatar className="size-20 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={avatarUrl} alt={customer.full_name} />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {getInitials(customer.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">{customer.full_name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {customer.password ? "Registered Account" : "Guest Buyer"}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    {customer.gender !== "unknown" ? customer.gender : ""}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Contact details */}
              <div className="w-full space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground truncate">{customer.phone}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                    onClick={() => copyToClipboard(customer.phone, "Phone number")}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-[190px]">
                      {customer.email || "No email registered"}
                    </span>
                  </div>
                  {customer.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                      onClick={() => copyToClipboard(customer.email, "Email")}
                    >
                      <Copy className="size-3" />
                    </Button>
                  )}
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-medium text-foreground leading-relaxed">
                      {primaryAddr.address || "No address recorded"}
                    </span>
                    {(primaryAddr.city || primaryAddr.district) && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {[primaryAddr.city, primaryAddr.district, primaryAddr.division]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags Section */}
              <div className="w-full text-left">
                <CustomerTagsManager
                  customerId={customer.id}
                  tags={customer.tags || []}
                  onUpdate={() => mutate()}
                />
              </div>

              <Separator />

              {/* Fraud & Courier Assessment */}
              <div className="w-full text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> Courier Trust Score
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      stats.return_rate > 30
                        ? "text-rose-600 border-rose-200 bg-rose-50"
                        : "text-emerald-600 border-emerald-200 bg-emerald-50"
                    }
                  >
                    {stats.return_rate > 30 ? "Careful" : "Reliable"}
                  </Badge>
                </div>

                <div className="rounded-md border bg-muted/40 p-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivered Orders:</span>
                    <span className="font-semibold text-foreground">{stats.delivered_orders}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cancelled / Returned:</span>
                    <span className="font-semibold text-foreground">
                      {stats.cancelled_orders + stats.returned_orders}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Success Rate:</span>
                    <span className="font-bold text-foreground">{stats.success_rate}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Metadata */}
              <div className="w-full space-y-1.5 text-[11px] text-muted-foreground text-left">
                <div className="flex justify-between">
                  <span>Customer Since:</span>
                  <span>{formatDate(customer.created_at)}</span>
                </div>
                {customer.last_contacted_at && (
                  <div className="flex justify-between">
                    <span>Last Interaction:</span>
                    <span>{formatDate(customer.last_contacted_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabbed Sections */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders" className="text-xs gap-1.5">
                <ShoppingBag className="size-3.5" />
                <span>Orders ({orders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs gap-1.5">
                <MessageSquare className="size-3.5" />
                <span>CRM Notes ({customer.notes?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="text-xs gap-1.5">
                <MapPin className="size-3.5" />
                <span>Addresses ({addresses.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              <CustomerOrdersTable orders={orders} customerId={customer.id} />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4">
              <CustomerNotesSection
                customerId={customer.id}
                notes={customer.notes || []}
                onRefresh={() => mutate()}
              />
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="size-4 text-primary" /> Delivery Addresses History
                  </CardTitle>
                  <CardDescription>
                    All delivery addresses used by this customer across their orders.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground text-sm">
                      No shipping addresses saved yet.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addresses.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border p-4 bg-card hover:border-primary/40 transition-colors flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-primary">
                                Address #{idx + 1}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {item.orders_count} order(s)
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground pt-1">
                              {item.address}
                            </p>
                            {(item.shipping_area || item.district) && (
                              <p className="text-xs text-muted-foreground">
                                {[item.shipping_area, item.district].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>

                          <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-2 border-t">
                            <span>Last used: {item.last_used || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <EditCustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
