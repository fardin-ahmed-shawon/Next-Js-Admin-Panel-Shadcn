"use client";
import { ModularFeature } from "@/components/modular-feature";

import * as React from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileText,
  Printer,
  Truck,
  FileClock,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useInvoices } from "@/hooks/useInvoices";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { orderStatusVariant, paymentBadge, SendCourierCell } from "../_components/orders-table";
import { ArrowUpDown } from "lucide-react";

const invoiceTypes = ["All", "a4", "pos", "label"];

type TimeRange = "daily" | "yesterday" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily":
      return now.toISOString().slice(0, 10);
    case "weekly":
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    case "monthly":
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 10);
    case "4months":
      d.setMonth(d.getMonth() - 4);
      return d.toISOString().slice(0, 10);
    case "6months":
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0, 10);
    default:
      return "";
  }
}

const rangeLabels: Record<TimeRange, string> = {
  alltime: "All Time",
  daily: "Today",
  yesterday: "Yesterday",
  weekly: "Weekly",
  monthly: "Monthly",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "Yearly",
  custom: "Custom Range",
};
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function InvoiceDashboardPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("daily");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTypeFilter, setActiveTypeFilter] = React.useState("All");
  const [courierFilter, setCourierFilter] = React.useState("All");

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(100);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [orderDateFilter, setOrderDateFilter] = React.useState("");

  const filters = React.useMemo(() => {
    let from_date = "";
    let to_date = "";

    if (timeRange === "custom") {
      from_date = customFrom;
      to_date = customTo;
    } else if (timeRange === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      from_date = d.toISOString().slice(0, 10);
      to_date = d.toISOString().slice(0, 10);
    } else if (timeRange !== "alltime") {
      from_date = getDateFrom(timeRange);
    }

    return {
      search: searchQuery,
      type: activeTypeFilter,
      fromDate: from_date,
      toDate: to_date,
      sort: sortOrder,
      orderDate: orderDateFilter,
      courier: courierFilter,
    };
  }, [timeRange, customFrom, customTo, searchQuery, activeTypeFilter, sortOrder, orderDateFilter, courierFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data: response, isLoading } = useInvoices({ page, perPage, ...filters });

  if (isLoading && !response) {
    return <InvoiceSkeleton />;
  }

  const finalInvoices = response?.data?.data || [];
  const totalPages = response?.data?.last_page || 1;
  const totalCount = response?.data?.total || 0;

  const stats = React.useMemo(() => {
    return {
      total: response?.stats?.total || 0,
      a4: response?.stats?.a4 || 0,
      pos: response?.stats?.pos || 0,
      label: response?.stats?.label || 0,
      today: response?.stats?.today || 0,
    };
  }, [response?.stats]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "a4":
        return <FileText className="size-4 text-blue-500" />;
      case "pos":
        return <Printer className="size-4 text-green-500" />;
      case "label":
        return <Truck className="size-4 text-purple-500" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "a4":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "pos":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "label":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterLabel = activeTypeFilter === "All" ? "All Invoices" : `${activeTypeFilter} Invoices`;
  const countDescription = `${totalCount} invoices`;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight font-semibold">Invoice Dashboard</h1>
          <p className="text-muted-foreground text-sm">Monitor all printed invoices and receipts.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-32 sm:w-36">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(rangeLabels) as TimeRange[])
                    .filter((r) => r !== "custom")
                    .map((r) => (
                      <SelectItem key={r} value={r}>
                        {rangeLabels[r]}
                      </SelectItem>
                    ))}
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Custom date inputs - inline on desktop */}
            {timeRange === "custom" && (
              <div className="hidden sm:flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="h-8 w-36 text-xs"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="h-8 w-36 text-xs"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Custom date inputs - mobile */}
          {timeRange === "custom" && (
            <div className="flex sm:hidden items-center gap-2 w-full">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                className="h-8 flex-1 text-xs"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <Input
                type="date"
                className="h-8 flex-1 text-xs"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Printed</CardTitle>
            <FileClock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">In selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A4 Invoices</CardTitle>
            <FileText className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.a4}</div>
            <p className="text-xs text-muted-foreground mt-1">Standard size prints</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">POS Receipts</CardTitle>
            <Printer className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pos}</div>
            <p className="text-xs text-muted-foreground mt-1">Thermal prints</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courier Labels</CardTitle>
            <Truck className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.label}</div>
            <p className="text-xs text-muted-foreground mt-1">Shipping labels</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">{filterLabel}</CardTitle>
          <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            {countDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <ToggleGroup
                className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30 shrink-0 h-9"
                onValueChange={(value) => {
                  if (value) setActiveTypeFilter(value);
                }}
                size="sm"
                spacing={1}
                type="single"
                value={activeTypeFilter}
              >
                {invoiceTypes.map((t) => (
                  <ToggleGroupItem key={t} value={t} className="capitalize px-3 text-xs">
                    {t}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <Select value={courierFilter} onValueChange={setCourierFilter}>
                <SelectTrigger className="w-32 h-9 text-xs shrink-0">
                  <SelectValue placeholder="Courier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="All">All Couriers</SelectItem>
                    <ModularFeature name="courier_steadfast">
                      <SelectItem value="Steadfast">Steadfast</SelectItem>
                    </ModularFeature>
                    <ModularFeature name="courier_pathao">
                      <SelectItem value="Pathao">Pathao</SelectItem>
                    </ModularFeature>
                    <ModularFeature name="courier_redx">
                      <SelectItem value="RedX">RedX</SelectItem>
                    </ModularFeature>
                    <SelectItem value="Pending">Not Sent</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {(activeTypeFilter !== "All" || courierFilter !== "All" || searchQuery || timeRange !== "alltime") && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={() => {
                    setActiveTypeFilter("All");
                    setCourierFilter("All");
                    setSearchQuery("");
                    setTimeRange("alltime");
                    setCustomFrom("");
                    setCustomTo("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">SL No</TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1.5 py-1">
                      <span>Order No</span>
                      <Input
                        type="date"
                        className="h-7 text-xs w-[125px] px-2 py-1"
                        value={orderDateFilter}
                        onChange={(e) => setOrderDateFilter(e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>Invoice Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Printed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalInvoices.length > 0 ? (
                  finalInvoices.map((invoice: any, index: number) => {
                    const order = invoice.order || {};
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium text-xs">{(page - 1) * perPage + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-sm">{invoice.order_no}</span>
                            {order.created_at ? (
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {format(new Date(order.created_at), "yyyy-MM-dd · hh:mm a")}
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {format(new Date(invoice.created_at), "yyyy-MM-dd · hh:mm a")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.order_status ? (
                            <Badge variant={orderStatusVariant(order.order_status)}>{order.order_status}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.payment_status ? (
                            <Badge variant={paymentBadge(order.payment_status)}>{order.payment_status}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.order_no || order.id ? (
                            <SendCourierCell
                              row={{
                                original: {
                                  ...order,
                                  id: order.order_no || order.id,
                                  orderStatus: order.order_status,
                                  steadfast_parcel: order.steadfast_parcel || order.steadfastParcel || null,
                                  pathao_parcel: order.pathao_parcel || order.pathaoParcel || null,
                                  redx_parcel: order.redx_parcel || order.redxParcel || null,
                                  courier_details: order.courier_details || null,
                                },
                              }}
                              readOnly
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getBadgeColor(invoice.type)} variant="secondary">
                            <div className="flex items-center gap-1.5 capitalize">
                              {getTypeIcon(invoice.type)}
                              {invoice.type}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {format(new Date(invoice.created_at), "MMM dd, yyyy - hh:mm a")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No invoices printed yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 px-4 py-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={`${perPage}`}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50, 100, 150, 200].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button size="icon-sm" variant="outline" onClick={() => setPage(1)} disabled={page === 1}>
                <ChevronsLeft />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-12 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between border-b pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16 rounded" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
