"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Eye,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRight,
  Boxes,
  Send,
  Sparkles,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { usePrintModal } from "@/hooks/usePrintModal";
import { useSteadfastSetup } from "@/hooks/useSteadfastSetup";
import { fetchClient } from "@/lib/fetch-client";
import { formatOrderDateTime, parseDateTime } from "@/lib/utils";

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

function formatSafeOrderDt(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const { date, time } = formatOrderDateTime(dateStr);
  return `${date} ${time}`.trim();
}

export default function PackagingTeamPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"confirmed" | "ready_to_ship">("confirmed");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [confirmedPage, setConfirmedPage] = React.useState(1);
  const [readyPage, setReadyPage] = React.useState(1);
  const [selectedConfirmed, setSelectedConfirmed] = React.useState<Set<string>>(new Set());
  const [selectedReady, setSelectedReady] = React.useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Steadfast Configuration Check
  const { data: steadfastConfig } = useSteadfastSetup();
  const isSteadfastActive =
    steadfastConfig?.status === "active" ||
    steadfastConfig?.is_active === 1 ||
    steadfastConfig?.is_active === "1" ||
    steadfastConfig?.is_active === true;

  // SWR Orders: Confirmed Tab
  const {
    orders: confirmedOrders,
    pagination: confirmedPagination,
    isLoading: isLoadingConfirmed,
    mutate: mutateConfirmed,
  } = useOrders({
    status: "Confirmed",
    page: confirmedPage,
    per_page: 50,
    search: searchQuery,
    all_orders: true,
  });

  // SWR Orders: Ready to Ship Tab
  const {
    orders: readyOrders,
    pagination: readyPagination,
    isLoading: isLoadingReady,
    mutate: mutateReady,
  } = useOrders({
    status: "Ready To Ship",
    page: readyPage,
    per_page: 50,
    search: searchQuery,
    all_orders: true,
  });

  const refreshAll = React.useCallback(() => {
    mutateConfirmed();
    mutateReady();
  }, [mutateConfirmed, mutateReady]);

  // Handle Printing Invoice and Automatically Moving to "Ready To Ship"
  const handlePrintAndMoveToReady = async (
    order: any,
    type: "a4" | "pos" | "label" = "a4"
  ) => {
    const orderNo = order.order_no || order.id;
    const printUrl =
      type === "pos"
        ? `/invoice/${orderNo}/pos`
        : type === "label"
        ? `/invoice/${orderNo}/label`
        : `/invoice/${orderNo}`;

    // Open print window
    window.open(printUrl, "_blank", "noopener,noreferrer");

    const toastId = toast.loading(`Printing invoice & moving #${orderNo} to Ready to Ship...`);
    try {
      // 1. Record invoice print in backend
      try {
        await fetchClient(`${getApiBaseUrl()}invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_no: orderNo, type }),
        });
      } catch (invErr) {
        console.warn("Invoice log error:", invErr);
      }

      // 2. Automate transition: Move to "Ready To Ship"
      const res = await fetchClient(`${getApiBaseUrl()}orders/bulk-update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_nos: [orderNo],
          order_status: "Ready To Ship",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to update order status");
      }

      toast.success(`Order #${orderNo} is now Ready to Ship!`, { id: toastId });
      refreshAll();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update order status", { id: toastId });
    }
  };

  // Bulk Print Confirmed Orders & Move All to "Ready To Ship"
  const handleBulkPrintConfirmed = async (type: "a4" | "pos" = "a4") => {
    const orderNos = Array.from(selectedConfirmed);
    if (orderNos.length === 0) return;

    const printUrl =
      type === "pos"
        ? `/invoice/bulk/pos?ids=${orderNos.join(",")}`
        : `/invoice/bulk?ids=${orderNos.join(",")}`;

    window.open(printUrl, "_blank", "noopener,noreferrer");

    const toastId = toast.loading(
      `Printing ${orderNos.length} invoices & updating status to Ready to Ship...`
    );
    try {
      // 1. Record invoices
      try {
        await fetchClient(`${getApiBaseUrl()}invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_nos: orderNos, type }),
        });
      } catch (e) {
        console.warn(e);
      }

      // 2. Bulk update status to Ready To Ship
      const res = await fetchClient(`${getApiBaseUrl()}orders/bulk-update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_nos: orderNos,
          order_status: "Ready To Ship",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to bulk update status");
      }

      toast.success(`${orderNos.length} orders moved to Ready to Ship!`, { id: toastId });
      setSelectedConfirmed(new Set());
      refreshAll();
    } catch (err: any) {
      toast.error(err?.message || "Error bulk updating orders", { id: toastId });
    }
  };

  // Send an order directly to Steadfast Courier
  const handleSendToSteadfast = async (order: any) => {
    const orderIdentifier = order.id || order.order_no;
    const toastId = toast.loading(`Dispatching order #${order.order_no} to Steadfast...`);

    try {
      const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
      const res = await fetchClient(`${getApiBaseUrl()}${endpoint}/${orderIdentifier}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || "Failed to send order to Steadfast.");
      }

      const json = await res.json().catch(() => ({}));
      const trackingCode = json?.data?.tracking_code || json?.data?.consignment_id || "";

      toast.success(
        `Order #${order.order_no} sent to Steadfast successfully! ${trackingCode ? `(Consignment: ${trackingCode})` : ""}`,
        { id: toastId }
      );
      refreshAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to dispatch to Steadfast.", { id: toastId });
    }
  };

  // Bulk Send Selected Ready-to-Ship Orders to Steadfast
  const handleBulkSendToSteadfast = async () => {
    const readyList = readyOrders.filter((o: any) => selectedReady.has(o.order_no));
    if (readyList.length === 0) return;

    setIsProcessing(true);
    const toastId = toast.loading(`Dispatching ${readyList.length} orders to Steadfast...`);

    let successCount = 0;
    let failCount = 0;

    for (const order of readyList) {
      try {
        const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
        const res = await fetchClient(`${getApiBaseUrl()}${endpoint}/${order.id || order.order_no}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsProcessing(false);
    setSelectedReady(new Set());
    refreshAll();

    if (successCount > 0) {
      toast.success(
        `Successfully sent ${successCount} orders to Steadfast!${failCount > 0 ? ` (${failCount} failed)` : ""}`,
        { id: toastId }
      );
    } else {
      toast.error(`Failed to send orders to Steadfast.`, { id: toastId });
    }
  };

  // Toggle Selection Handlers
  const toggleSelectConfirmed = (orderNo: string) => {
    setSelectedConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(orderNo)) next.delete(orderNo);
      else next.add(orderNo);
      return next;
    });
  };

  const toggleSelectAllConfirmed = () => {
    if (selectedConfirmed.size === confirmedOrders.length) {
      setSelectedConfirmed(new Set());
    } else {
      setSelectedConfirmed(new Set(confirmedOrders.map((o: any) => o.order_no)));
    }
  };

  const toggleSelectReady = (orderNo: string) => {
    setSelectedReady((prev) => {
      const next = new Set(prev);
      if (next.has(orderNo)) next.delete(orderNo);
      else next.add(orderNo);
      return next;
    });
  };

  const toggleSelectAllReady = () => {
    if (selectedReady.size === readyOrders.length) {
      setSelectedReady(new Set());
    } else {
      setSelectedReady(new Set(readyOrders.map((o: any) => o.order_no)));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* 1. Header Section with Station Details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Package className="size-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">Packaging Station</h1>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                  Packaging Team
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Process confirmed orders &rarr; Print invoices &rarr; Move to Ready to Ship &rarr; Dispatch to Steadfast Courier
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            className="h-9 gap-1.5 shadow-2xs text-xs font-medium"
          >
            <RefreshCw className="size-3.5" />
            Refresh Orders
          </Button>

          {isSteadfastActive ? (
            <Badge variant="outline" className="h-9 px-3 gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Steadfast API Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="h-9 px-3 gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs font-semibold">
              <AlertCircle className="size-3.5 text-amber-500" />
              Steadfast Setup Pending
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Pipeline Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Confirmed Orders Card */}
        <Card
          onClick={() => setActiveTab("confirmed")}
          className={`cursor-pointer transition-all border shadow-2xs hover:shadow-md ${
            activeTab === "confirmed"
              ? "border-blue-500/50 bg-blue-500/[0.03] ring-2 ring-blue-500/20"
              : "border-border/60 hover:border-blue-500/30"
          }`}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage 1: To Pack & Print</span>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Printer className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black tabular-nums text-foreground">
              {isLoadingConfirmed ? <Skeleton className="h-8 w-16" /> : confirmedPagination?.total ?? confirmedOrders.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              Confirmed orders ready for invoice printing
            </p>
          </CardContent>
        </Card>

        {/* Ready to Ship Card */}
        <Card
          onClick={() => setActiveTab("ready_to_ship")}
          className={`cursor-pointer transition-all border shadow-2xs hover:shadow-md ${
            activeTab === "ready_to_ship"
              ? "border-emerald-500/50 bg-emerald-500/[0.03] ring-2 ring-emerald-500/20"
              : "border-border/60 hover:border-emerald-500/30"
          }`}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage 2: To Dispatch</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
              {isLoadingReady ? <Skeleton className="h-8 w-16" /> : readyPagination?.total ?? readyOrders.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              Packed orders waiting to send to Steadfast
            </p>
          </CardContent>
        </Card>

        {/* Workflow Info Card */}
        <Card className="border-border/60 bg-muted/20 shadow-2xs sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Automation Rule</span>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-xs text-foreground font-semibold">Automatic Status Advancement</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              When printing invoices for <strong>Confirmed</strong> orders, the system automatically transitions their status to <strong>Ready to Ship</strong>.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search & Tabs Controller */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border shadow-2xs">
          <TabsList className="grid grid-cols-2 w-full sm:w-[380px] h-10 p-1">
            <TabsTrigger value="confirmed" className="text-xs font-semibold gap-2">
              <Printer className="size-3.5" />
              Confirmed Orders ({confirmedPagination?.total ?? confirmedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready_to_ship" className="text-xs font-semibold gap-2">
              <Truck className="size-3.5" />
              Ready to Ship ({readyPagination?.total ?? readyOrders.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by order no, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs bg-background shadow-2xs"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CONFIRMED ORDERS (To Pack & Print)                 */}
        {/* ========================================================= */}
        <TabsContent value="confirmed" className="m-0 space-y-4">
          {/* Bulk Action Bar */}
          {selectedConfirmed.size > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  {selectedConfirmed.size} Confirmed Order{selectedConfirmed.size > 1 ? "s" : ""} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkPrintConfirmed("a4")}
                  className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <Printer className="size-3.5" />
                  Bulk Print A4 &amp; Mark Ready To Ship
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkPrintConfirmed("pos")}
                  className="h-8 text-xs gap-1.5 bg-background shadow-2xs"
                >
                  <Printer className="size-3.5" />
                  Bulk POS Print &amp; Mark Ready
                </Button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-3 px-3 w-10">
                      <Checkbox
                        checked={
                          confirmedOrders.length > 0 &&
                          selectedConfirmed.size === confirmedOrders.length
                        }
                        onCheckedChange={toggleSelectAllConfirmed}
                      />
                    </th>
                    <th className="py-3 px-3">Order Details</th>
                    <th className="py-3 px-3">Customer &amp; Location</th>
                    <th className="py-3 px-3">Products to Pack</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoadingConfirmed ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx}>
                        <td colSpan={6} className="py-4 px-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : confirmedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="font-semibold text-sm text-foreground">No Confirmed Orders Awaiting Packaging!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          All orders have been packed or moved to Ready to Ship.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    confirmedOrders.map((order: any) => {
                      const isSelected = selectedConfirmed.has(order.order_no);
                      const products = order.ordered_products || order.orderedProducts || [];
                      const customerName = order.customer_full_name || order.customer?.full_name || "Customer";
                      const phone = order.customer_phone || order.customer?.phone || "";
                      const district = order.district || order.city || "";
                      const address = order.customer_shipping_address || order.shipping_address || "";

                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-muted/40 transition-colors ${
                            isSelected ? "bg-blue-500/[0.04]" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3 align-middle">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectConfirmed(order.order_no)}
                            />
                          </td>

                          {/* Order Details */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-bold text-foreground text-sm flex items-center gap-1.5">
                                #{order.order_no}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Badge variant="outline" className="h-4 px-1 text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 font-medium">
                                  Confirmed
                                </Badge>
                                <span className="opacity-40">•</span>
                                <span>{formatSafeOrderDt(order.created_at)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Customer & Location */}
                          <td className="py-3.5 px-3 align-middle max-w-[240px]">
                            <div className="font-semibold text-foreground truncate">{customerName}</div>
                            {phone && (
                              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="size-2.5 opacity-60" />
                                {phone}
                              </div>
                            )}
                            {district && (
                              <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 font-medium">
                                <MapPin className="size-2.5" />
                                {district}
                              </div>
                            )}
                          </td>

                          {/* Products to Pack */}
                          <td className="py-3.5 px-3 align-middle max-w-[320px]">
                            <div className="space-y-1.5">
                              {products.length > 0 ? (
                                products.map((item: any, i: number) => {
                                  const title = item.product?.title || item.product_title_snapshot || `Item #${item.product_id}`;
                                  const qty = item.qty || 1;
                                  const size = item.size_label || item.size;
                                  const color = item.color_label || item.color;
                                  const image = item.product?.product_thumbnail_img;

                                  return (
                                    <div key={i} className="flex items-center gap-2 text-[11px]">
                                      {image ? (
                                        <img
                                          src={image}
                                          alt=""
                                          className="size-7 rounded object-cover border shrink-0"
                                        />
                                      ) : (
                                        <div className="size-7 rounded bg-muted flex items-center justify-center border shrink-0 text-muted-foreground">
                                          <Package className="size-3.5" />
                                        </div>
                                      )}
                                      <div className="truncate">
                                        <div className="font-medium text-foreground truncate">{title}</div>
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                          <span className="font-bold text-foreground">x{qty}</span>
                                          {(size || color) && (
                                            <span>
                                              ({[size, color].filter(Boolean).join(" / ")})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground italic text-[11px]">No products snapshot</span>
                              )}
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-3 align-middle text-right font-mono font-bold text-foreground">
                            ৳{Number(order.total_amount || order.total || 0).toLocaleString()}
                            <div className="text-[10px] font-normal text-muted-foreground">
                              {order.payment_method || "COD"}
                            </div>
                          </td>

                          {/* Actions: Print & Auto Move */}
                          <td className="py-3.5 px-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handlePrintAndMoveToReady(order, "a4")}
                                className="h-8 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                              >
                                <Printer className="size-3.5" />
                                Print Invoice
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    <ChevronDown className="size-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="text-xs">
                                  <DropdownMenuLabel>Print Formats</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePrintAndMoveToReady(order, "a4")}>
                                    <Printer className="mr-2 size-3.5" />
                                    A4 Invoice (Auto Ready)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePrintAndMoveToReady(order, "pos")}>
                                    <Printer className="mr-2 size-3.5 text-emerald-600" />
                                    Thermal POS Receipt (Auto Ready)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePrintAndMoveToReady(order, "label")}>
                                    <Printer className="mr-2 size-3.5 text-purple-600" />
                                    Courier Label (Auto Ready)
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {confirmedPagination && confirmedPagination.last_page > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/20 text-xs">
                <span className="text-muted-foreground">
                  Page {confirmedPage} of {confirmedPagination.last_page} ({confirmedPagination.total} records)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={confirmedPage <= 1}
                    onClick={() => setConfirmedPage((p) => p - 1)}
                    className="h-7 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={confirmedPage >= confirmedPagination.last_page}
                    onClick={() => setConfirmedPage((p) => p + 1)}
                    className="h-7 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: READY TO SHIP ORDERS (Dispatch to Steadfast)       */}
        {/* ========================================================= */}
        <TabsContent value="ready_to_ship" className="m-0 space-y-4">
          {/* Bulk Action Bar */}
          {selectedReady.size > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedReady.size} Ready to Ship Order{selectedReady.size > 1 ? "s" : ""} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={handleBulkSendToSteadfast}
                  className="h-8 text-xs gap-1.5 bg-[#00b074] hover:bg-[#00b074]/90 text-white font-semibold shadow-xs"
                >
                  <Truck className="size-3.5" />
                  Bulk Send to Steadfast ({selectedReady.size})
                </Button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-3 px-3 w-10">
                      <Checkbox
                        checked={
                          readyOrders.length > 0 &&
                          selectedReady.size === readyOrders.length
                        }
                        onCheckedChange={toggleSelectAllReady}
                      />
                    </th>
                    <th className="py-3 px-3">Order Details</th>
                    <th className="py-3 px-3">Customer &amp; Address</th>
                    <th className="py-3 px-3">Package Contents</th>
                    <th className="py-3 px-3 text-right">Collect Amount</th>
                    <th className="py-3 px-3 text-center">Courier Status</th>
                    <th className="py-3 px-3 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoadingReady ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx}>
                        <td colSpan={7} className="py-4 px-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : readyOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Truck className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-sm text-foreground">No Orders in Ready to Ship</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Print invoices from Confirmed orders to move them into this dispatch queue.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    readyOrders.map((order: any) => {
                      const isSelected = selectedReady.has(order.order_no);
                      const products = order.ordered_products || order.orderedProducts || [];
                      const customerName = order.customer_full_name || order.customer?.full_name || "Customer";
                      const phone = order.customer_phone || order.customer?.phone || "";
                      const district = order.district || order.city || "";
                      const address = order.customer_shipping_address || order.shipping_address || "";
                      const steadfastParcel = order.steadfast_parcel || order.steadfastParcel;
                      const hasSteadfastParcel = !!steadfastParcel;

                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-muted/40 transition-colors ${
                            isSelected ? "bg-emerald-500/[0.04]" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3 align-middle">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectReady(order.order_no)}
                            />
                          </td>

                          {/* Order Details */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-bold text-foreground text-sm">
                                #{order.order_no}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Badge variant="outline" className="h-4 px-1 text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium">
                                  Ready To Ship
                                </Badge>
                                <span className="opacity-40">•</span>
                                <span>{formatSafeOrderDt(order.created_at)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Customer & Address */}
                          <td className="py-3.5 px-3 align-middle max-w-[240px]">
                            <div className="font-semibold text-foreground truncate">{customerName}</div>
                            {phone && (
                              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="size-2.5 opacity-60" />
                                {phone}
                              </div>
                            )}
                            {district && (
                              <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 font-medium">
                                <MapPin className="size-2.5" />
                                {district}
                              </div>
                            )}
                            {address && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[220px] mt-0.5">
                                {address}
                              </p>
                            )}
                          </td>

                          {/* Products Summary */}
                          <td className="py-3.5 px-3 align-middle max-w-[280px]">
                            <div className="text-[11px] font-medium text-foreground">
                              {products.length} item{products.length !== 1 ? "s" : ""}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[260px] mt-0.5">
                              {products.map((p: any) => p.product?.title || p.product_title_snapshot).filter(Boolean).join(", ")}
                            </div>
                          </td>

                          {/* Collect Amount */}
                          <td className="py-3.5 px-3 align-middle text-right font-mono font-bold text-foreground">
                            ৳{Number(order.total_amount || order.total || 0).toLocaleString()}
                          </td>

                          {/* Courier Status */}
                          <td className="py-3.5 px-3 align-middle text-center">
                            {hasSteadfastParcel ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <Badge className="bg-[#00b074]/15 text-[#00b074] border-[#00b074]/30 text-[10px] font-semibold gap-1">
                                  <Check className="size-3" />
                                  Sent to Steadfast
                                </Badge>
                                {steadfastParcel?.consignment_id && (
                                  <span className="font-mono text-[9px] text-muted-foreground">
                                    ID: {steadfastParcel.consignment_id}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Not Dispatched
                              </Badge>
                            )}
                          </td>

                          {/* Primary Action: Send to Steadfast */}
                          <td className="py-3.5 px-3 align-middle text-right">
                            {hasSteadfastParcel ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-8 text-xs font-medium text-muted-foreground bg-muted/40"
                              >
                                Dispatched
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSendToSteadfast(order)}
                                className="h-8 text-xs font-bold gap-1.5 bg-[#00b074] hover:bg-[#00b074]/90 text-white shadow-2xs"
                              >
                                <Truck className="size-3.5" />
                                Send to Steadfast
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {readyPagination && readyPagination.last_page > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/20 text-xs">
                <span className="text-muted-foreground">
                  Page {readyPage} of {readyPagination.last_page} ({readyPagination.total} records)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={readyPage <= 1}
                    onClick={() => setReadyPage((p) => p - 1)}
                    className="h-7 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={readyPage >= readyPagination.last_page}
                    onClick={() => setReadyPage((p) => p + 1)}
                    className="h-7 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
