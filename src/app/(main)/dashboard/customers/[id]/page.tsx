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
  Banknote,
  DollarSign,
  Send,
  Clock,
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
import { CustomerProductOrdersTable } from "./_components/customer-product-orders-table";
import { CustomerReturnHistoryTable } from "./_components/customer-return-history-table";
import { CustomerPaymentsTable } from "./_components/customer-payments-table";
import { CustomerTagsManager } from "./_components/customer-tags-manager";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { customer, crmStats, payments, returns = [], allNames, addresses, isLoading, error, mutate } = useCustomer(id);

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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-12">
          <Skeleton className="h-[460px] xl:col-span-4 2xl:col-span-3 rounded-xl" />
          <Skeleton className="h-[460px] xl:col-span-8 2xl:col-span-9 rounded-xl" />
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
  const totalOrdersCount = orders.length;
  const deliveredList = orders.filter((o: any) => o.order_status === "Delivered");
  const cancelledList = orders.filter((o: any) => o.order_status === "Cancelled");
  const returnedList = orders.filter((o: any) =>
    ["Returned", "Partial", "Pending-Return"].includes(o.order_status) || Boolean(o.is_partial_return)
  );

  const stats = {
    total_orders: crmStats?.total_orders ?? totalOrdersCount,

    // Delivered: Count, %, Value
    delivered_orders: crmStats?.delivered_orders ?? deliveredList.length,
    delivered_percent: crmStats?.delivered_percent ?? (totalOrdersCount > 0 ? Math.round((deliveredList.length / totalOrdersCount) * 100) : 0),
    delivered_value: crmStats?.delivered_value ?? deliveredList.reduce((acc: number, o: any) => acc + Number(o.grand_total_amount || 0), 0),

    // Cancelled: Count, %, Value
    cancelled_orders: crmStats?.cancelled_orders ?? cancelledList.length,
    cancelled_percent: crmStats?.cancelled_percent ?? (totalOrdersCount > 0 ? Math.round((cancelledList.length / totalOrdersCount) * 100) : 0),
    cancelled_value: crmStats?.cancelled_value ?? cancelledList.reduce((acc: number, o: any) => acc + Number(o.grand_total_amount || 0), 0),

    // Returned: Count, %, Value
    returned_orders: crmStats?.returned_orders ?? returnedList.length,
    returned_percent: crmStats?.returned_percent ?? (totalOrdersCount > 0 ? Math.round((returnedList.length / totalOrdersCount) * 100) : 0),
    returned_value: crmStats?.returned_value ?? returnedList.reduce((acc: number, o: any) => acc + Number(o.grand_total_amount || 0), 0),
    partial_returns_count: crmStats?.partial_returns_count ?? orders.filter((o: any) => o.order_status === "Partial" || Boolean(o.is_partial_return)).length,

    pending_orders: crmStats?.pending_orders ?? orders.filter((o: any) => ["Pending", "Processing", "Confirmed", "Packaging"].includes(o.order_status)).length,
    in_courier_orders: crmStats?.in_courier_orders ?? orders.filter((o: any) => ["In-Courier", "Dispatched", "Handover"].includes(o.order_status)).length,

    total_spent: crmStats?.total_spent ?? (customer.parcel_history?.total_spent || 0),
    total_paid: crmStats?.total_paid ?? 0,
    total_due: crmStats?.total_due ?? (customer.parcel_history?.total_spent || 0),
    average_order_value: crmStats?.average_order_value ?? (customer.parcel_history?.average_order_value || 0),
    success_rate: crmStats?.success_rate ?? (customer.parcel_history?.success_rate || 0),
    return_rate: crmStats?.return_rate ?? (customer.parcel_history?.return_rate || 0),
    customer_segment: crmStats?.customer_segment || customer.customer_type || "Retail",
    first_order_date: crmStats?.first_order_date || null,
    last_order_date: crmStats?.last_order_date || null,
    all_names: crmStats?.all_names || [customer.full_name],
  };

  const cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "").replace(/^88/, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/88${cleanPhone}` : null;
  const avatarUrl = customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name || "Customer")}&background=0284c7&color=fff`;

  const customerNamesList: string[] = allNames && allNames.length > 0
    ? allNames
    : Array.from(
        new Set(
          [customer.full_name, ...(orders.map((o: any) => o.customer_full_name) || [])]
            .filter(Boolean)
            .map((n: string) => n.trim())
        )
      );

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
            Complete CRM profile, order history, communication logs, and customer metrics.
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

          {customer.phone && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700 shadow-2xs font-medium"
              onClick={() => setActiveTab("notes")}
            >
              <Send className="size-3.5" />
              <span className="hidden sm:inline">Send SMS</span>
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

      {/* KPI Metric Cards (6 Cards: Purchases, Total Paid, Orders, Delivered, Cancelled, Returned) */}
      <div className="grid gap-3.5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {/* Lifetime Purchases */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Lifetime Purchases</span>
              <ShoppingBag className="size-3.5 text-primary opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-primary">
              ৳{Number(stats.total_spent || 0).toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1 border-t border-border/50">
              <span>Avg Order:</span>
              <span className="font-semibold text-foreground">
                ৳{Number(stats.average_order_value || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Paid</span>
              <CreditCard className="size-3.5 text-emerald-600 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              ৳{Number(stats.total_paid || 0).toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1 border-t border-border/50">
              <span>Due:</span>
              <span
                className={
                  Number(stats.total_due || 0) > 0
                    ? "font-bold text-amber-600 dark:text-amber-400"
                    : "font-semibold text-foreground"
                }
              >
                ৳{Number(stats.total_due || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Orders</span>
              <Package className="size-3.5 text-blue-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {stats.total_orders}{" "}
              <span className="text-xs font-normal text-muted-foreground">orders</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1 border-t border-border/50">
              <span className="text-amber-600 font-medium">{stats.pending_orders || 0} pending</span>
              <span className="text-blue-600 font-medium">{stats.in_courier_orders || 0} courier</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Delivered</span>
              <CheckCircle2 className="size-3.5 text-emerald-600 opacity-90" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between gap-1">
              <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {stats.delivered_orders}{" "}
                <span className="text-xs font-normal text-muted-foreground">orders</span>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 font-semibold"
              >
                {stats.delivered_percent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1 border-t border-border/50">
              <span>Value:</span>
              <span className="font-semibold text-foreground">
                ৳{Number(stats.delivered_value || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Cancelled</span>
              <XCircle className="size-3.5 text-rose-500 opacity-90" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between gap-1">
              <div className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {stats.cancelled_orders}{" "}
                <span className="text-xs font-normal text-muted-foreground">orders</span>
              </div>
              <Badge
                variant="outline"
                className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] px-1.5 py-0 font-semibold"
              >
                {stats.cancelled_percent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1 border-t border-border/50">
              <span>Value:</span>
              <span className="font-semibold text-foreground">
                ৳{Number(stats.cancelled_value || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Returned */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Returned</span>
              <RotateCcw className="size-3.5 text-amber-500 opacity-90" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between gap-1">
              <div className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {stats.returned_orders}{" "}
                <span className="text-xs font-normal text-muted-foreground">orders</span>
              </div>
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 font-semibold"
              >
                {stats.returned_percent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1 border-t border-border/50">
              <span>Value:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">
                  ৳{Number(stats.returned_value || 0).toLocaleString()}
                </span>
                {Number(stats.partial_returns_count || 0) > 0 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    ({stats.partial_returns_count} Partial)
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Reduced Left Column Width (xl:col-span-4 2xl:col-span-3) + Increased Right Column (xl:col-span-8 2xl:col-span-9) */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12">
        {/* Left Column: Compact Profile Summary */}
        <div className="space-y-6 xl:col-span-4 2xl:col-span-3">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3.5">
              <Avatar className="size-16 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={avatarUrl} alt={customer.full_name} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {getInitials(customer.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground leading-snug">{customer.full_name}</h2>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[11px] py-0 px-2">
                    {customer.password ? "Registered" : "Guest Buyer"}
                  </Badge>
                  {customer.gender && customer.gender !== "unknown" && (
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {customer.gender}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Customer All Full Name Variations List */}
              <div className="w-full text-left space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="size-3 text-primary" /> Full Name Variations ({customerNamesList.length})
                </span>
                <div className="flex flex-col gap-1">
                  {customerNamesList.map((name, i) => (
                    <div
                      key={i}
                      className="text-xs bg-muted/40 border rounded px-2 py-1 flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">{name}</span>
                      {i === 0 && <span className="text-[10px] text-primary font-semibold">Primary</span>}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Contact details */}
              <div className="w-full space-y-2.5 text-xs text-left">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="size-3.5 text-muted-foreground shrink-0" />
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
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-[170px]">
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

                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-medium text-foreground leading-relaxed block">
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

              {/* CRM Tags Section */}
              <div className="w-full text-left">
                <CustomerTagsManager
                  customerId={customer.id}
                  tags={customer.tags || []}
                  onUpdate={() => mutate()}
                />
              </div>

              <Separator />

              {/* Fraud & Courier Assessment */}
              <div className="w-full text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-3 text-emerald-600" /> Delivery Trust
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      stats.return_rate > 30
                        ? "text-rose-600 border-rose-200 bg-rose-50 text-[10px]"
                        : "text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]"
                    }
                  >
                    {stats.return_rate > 30 ? "High Return Risk" : "Good Buyer"}
                  </Badge>
                </div>

                <div className="rounded-md border bg-muted/30 p-2 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivered Orders:</span>
                    <span className="font-semibold text-foreground">{stats.delivered_orders}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cancelled / Returns:</span>
                    <span className="font-semibold text-foreground">
                      {stats.cancelled_orders + stats.returned_orders}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Success Rate:</span>
                    <span className="font-bold text-foreground">{stats.success_rate}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="w-full space-y-1 text-[11px] text-muted-foreground text-left">
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

        {/* Right Area: Spacious Tabs Content (xl:col-span-8 2xl:col-span-9) */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="orders" className="text-xs gap-1.5">
                <ShoppingBag className="size-3.5" />
                <span>Orders ({orders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="returns" className="text-xs gap-1.5">
                <RotateCcw className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Return History ({returns.length || stats.returned_orders || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs gap-1.5">
                <CreditCard className="size-3.5" />
                <span>Payments ({payments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>Follow-Ups & Notes ({customer.notes?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="text-xs gap-1.5">
                <MapPin className="size-3.5" />
                <span>Addresses ({addresses.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab: Orders Table + Bottom Product-wise Orders Data */}
            <TabsContent value="orders" className="mt-4 space-y-6">
              <CustomerOrdersTable
                orders={orders}
                customerId={customer.id}
                customerPrimaryName={customer.full_name}
              />

              {/* Bottom Section: Product-wise Orders Data working with delivery status */}
              <CustomerProductOrdersTable
                orders={orders}
                customerId={customer.id}
              />
            </TabsContent>

            {/* Return History Tab */}
            <TabsContent value="returns" className="mt-4">
              <CustomerReturnHistoryTable
                returns={returns}
                orders={orders}
                customerId={customer.id}
              />
            </TabsContent>

            {/* Payments Tab (Requested New Feature) */}
            <TabsContent value="payments" className="mt-4">
              <CustomerPaymentsTable payments={payments} customerId={customer.id} />
            </TabsContent>

            {/* Follow-Ups & Notes Tab */}
            <TabsContent value="notes" className="mt-4">
              <CustomerNotesSection
                customerId={customer.id}
                customer={customer}
                notes={customer.notes || []}
                onRefresh={() => mutate()}
              />
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-4">
              <Card className="border-border shadow-sm">
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
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {addresses.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border p-4 bg-card hover:border-primary/40 transition-colors flex flex-col justify-between gap-3 shadow-sm"
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
