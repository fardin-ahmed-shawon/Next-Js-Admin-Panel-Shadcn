"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, Printer, Truck, FileClock, Search, ChevronDown } from "lucide-react";

import { useInvoices } from "@/hooks/useInvoices";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const invoiceTypes = ["All", "a4", "pos", "label"];
const invoiceStatuses = ["All", "Pending", "Checked", "Invoiced"];

type TimeRange = "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily": return now.toISOString().slice(0, 10);
    case "weekly": d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10);
    case "monthly": d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10);
    case "4months": d.setMonth(d.getMonth() - 4); return d.toISOString().slice(0, 10);
    case "6months": d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10);
    case "yearly": d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10);
    default: return "";
  }
}

const rangeLabels: Record<TimeRange, string> = {
  alltime: "All Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "Yearly",
  custom: "Custom Range",
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function InvoiceDashboardPage() {
  const { data: response, isLoading } = useInvoices(1, 1000); // Fetching a larger set for now, pagination can be added later

  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [activeTypeFilter, setActiveTypeFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");

  const [showTypeFilter, setShowTypeFilter] = React.useState(true);
  const [showStatusFilter, setShowStatusFilter] = React.useState(true);

  if (isLoading && !response) {
    return <InvoiceSkeleton />;
  }

  const allInvoices = response?.data?.data || [];

  const filteredInvoices = React.useMemo(() => {
    if (timeRange === "alltime") return allInvoices;
    
    let fromDate = "";
    let toDate = "";
    
    if (timeRange === "custom") {
      fromDate = customFrom;
      toDate = customTo;
    } else {
      fromDate = getDateFrom(timeRange);
    }
    
    return allInvoices.filter((inv: any) => {
      const invDate = new Date(inv.created_at).toISOString().slice(0, 10);
      if (fromDate && invDate < fromDate) return false;
      if (toDate && invDate > toDate) return false;
      return true;
    });
  }, [allInvoices, timeRange, customFrom, customTo]);

  const stats = React.useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      total: filteredInvoices.length,
      a4: filteredInvoices.filter((i: any) => i.type === "a4").length,
      pos: filteredInvoices.filter((i: any) => i.type === "pos").length,
      label: filteredInvoices.filter((i: any) => i.type === "label").length,
      today: filteredInvoices.filter((i: any) => new Date(i.created_at).toISOString().slice(0, 10) === todayStr).length,
    };
  }, [filteredInvoices]);

  const typeCounts = React.useMemo(() => {
    const c: Record<string, number> = {};
    filteredInvoices.forEach((o: any) => {
      c[o.type] = (c[o.type] || 0) + 1;
    });
    return c;
  }, [filteredInvoices]);

  const statusCounts = React.useMemo(() => {
    const c: Record<string, number> = {};
    filteredInvoices.forEach((o: any) => {
      c[o.status] = (c[o.status] || 0) + 1;
    });
    return c;
  }, [filteredInvoices]);

  const finalInvoices = React.useMemo(() => {
    let result = filteredInvoices;
    
    if (activeTypeFilter !== "All") {
      result = result.filter((inv: any) => inv.type === activeTypeFilter);
    }
    
    if (activeStatusFilter !== "All") {
      result = result.filter((inv: any) => inv.status === activeStatusFilter);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((inv: any) =>
        inv.order_no.toLowerCase().includes(lowerQuery) ||
        String(inv.id).includes(lowerQuery)
      );
    }
    
    return result;
  }, [filteredInvoices, searchQuery, activeTypeFilter, activeStatusFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "a4": return <FileText className="size-4 text-blue-500" />;
      case "pos": return <Printer className="size-4 text-green-500" />;
      case "label": return <Truck className="size-4 text-purple-500" />;
      default: return <FileText className="size-4" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "a4": return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "pos": return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "label": return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Printed</CardTitle>
            <FileClock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Printed Today</CardTitle>
            <FileClock className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground mt-1">Invoices generated today</p>
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
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex flex-col gap-5">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-background pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {(activeTypeFilter !== "All" || activeStatusFilter !== "All" || searchQuery) && (
              <Button variant="secondary" size="sm" className="h-9 shrink-0" onClick={() => {
                setActiveTypeFilter("All");
                setActiveStatusFilter("All");
                setSearchQuery("");
              }}>
                Clear filters
              </Button>
            )}

            {/* Type Tabs */}
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

            {/* Status Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground shrink-0">
                Status:
              </span>
              <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                <SelectTrigger className="w-[120px] h-9 text-xs bg-background">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {invoiceStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Order No</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Printed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalInvoices.length > 0 ? (
                finalInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-xs">#{invoice.id}</TableCell>
                    <TableCell className="font-mono text-sm">{invoice.order_no}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {invoice.status}
                      </Badge>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No invoices printed yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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
