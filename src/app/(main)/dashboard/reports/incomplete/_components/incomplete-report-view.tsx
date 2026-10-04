"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarIcon,
  Download,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  UserCheck,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Phone,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncompleteReport } from "@/hooks/useIncompleteReport";
import { downloadCSV } from "@/lib/csv-export";
import { formatOrderDateTime } from "@/lib/utils";

export type TimeRange =
  | "daily"
  | "yesterday"
  | "weekly"
  | "monthly"
  | "last_month"
  | "4months"
  | "6months"
  | "yearly"
  | "custom"
  | "all_time";

const rangeLabels: Record<TimeRange, string> = {
  all_time: "All Time",
  daily: "Today",
  yesterday: "Yesterday",
  weekly: "Last 7 Days",
  monthly: "This Month",
  last_month: "Last Month",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "This Year",
  custom: "Custom Range",
};

interface IncompleteReportViewProps {
  embedded?: boolean;
  timeRange?: TimeRange;
  dateType?: "completed_at" | "created_at";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  customFrom?: string;
  customTo?: string;
  allOrders?: boolean;
}

export function IncompleteReportView({
  embedded = false,
  timeRange: propTimeRange,
  dateType: propDateType,
  sortBy: propSortBy,
  sortDir: propSortDir,
  customFrom: propCustomFrom,
  customTo: propCustomTo,
  allOrders: propAllOrders,
}: IncompleteReportViewProps) {
  const [internalTimeRange, setInternalTimeRange] = React.useState<TimeRange>("all_time");
  const [internalDateType, setInternalDateType] = React.useState<"completed_at" | "created_at">("completed_at");
  const [internalCustomFrom, setInternalCustomFrom] = React.useState<string>("");
  const [internalCustomTo, setInternalCustomTo] = React.useState<string>("");
  const [internalSortBy, setInternalSortBy] = React.useState<string>("completed_time");
  const [internalSortDir, setInternalSortDir] = React.useState<"asc" | "desc">("desc");

  const timeRange = propTimeRange !== undefined ? propTimeRange : internalTimeRange;
  // Actual Conversion Report always works with Completed Date (Actual)
  const dateType = "completed_at";
  const sortBy = propSortBy !== undefined ? propSortBy : internalSortBy;
  const sortDir = propSortDir !== undefined ? propSortDir : internalSortDir;
  const customFrom = propCustomFrom !== undefined ? propCustomFrom : internalCustomFrom;
  const customTo = propCustomTo !== undefined ? propCustomTo : internalCustomTo;
  const allOrders = propAllOrders !== undefined ? propAllOrders : true;

  const [page, setPage] = React.useState<number>(1);
  const [perPage, setPerPage] = React.useState<number>(20);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState(false);

  const queryParams = React.useMemo(() => {
    const p: Record<string, any> = {
      period: timeRange,
      date_type: "completed_at",
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      per_page: perPage,
      all_orders: allOrders,
    };
    if (timeRange === "custom") {
      if (customFrom) p.start_date = customFrom;
      if (customTo) p.end_date = customTo;
    }
    return p;
  }, [timeRange, sortBy, sortDir, page, perPage, customFrom, customTo, allOrders]);

  const { periodLabel, summary, breakdown, employeeBreakdown, orders, pagination, isLoading, mutate } =
    useIncompleteReport(queryParams);

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o: any) =>
      o.order_no?.toLowerCase().includes(q) ||
      o.customer_full_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      if (!orders || orders.length === 0) {
        toast.info("No converted orders to export in this period.");
        return;
      }

      const rows = orders.map((o: any, idx: number) => ({
        "SL": idx + 1,
        "Order No": o.order_no,
        "Customer Name": o.customer_full_name || "—",
        "Phone": o.customer_phone || "—",
        "Order Status": o.order_status,
        "Grand Total (Tk)": o.grand_total_amount || 0,
        "Order Time": o.created_at,
        "Incomplete to Complete Timestamp": o.incomplete_completed_at || o.updated_at || "—",
        "Duration to Convert": o.duration_to_complete || "—",
        "Assigned Employee": o.employee_orders?.[0]?.user?.full_name || "—",
        "Shipping Address": o.customer_shipping_address || "—",
      }));

      const dateSuffix = new Date().toISOString().slice(0, 10);
      downloadCSV(rows, `actual_incomplete_to_complete_report_${timeRange}_${dateSuffix}.csv`);
      toast.success("Incomplete to Complete Report exported successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Header & Toolbar for Standalone Page */}
      {!embedded && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Actual Incomplete to Complete Report</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Analyze orders converted from incomplete to complete across daily, monthly, and custom time periods.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Select
              value={timeRange}
              onValueChange={(v) => {
                setInternalTimeRange(v as TimeRange);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(rangeLabels) as TimeRange[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {rangeLabels[r]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => mutate()} className="h-9 gap-1.5">
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExportCSV}
              disabled={isExporting || !orders?.length}
              className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="size-4" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>
      )}

      {/* KPI Stats Strip - simple UI UX matching Complete Tabs */}
      <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-3 xl:grid-cols-6 xl:[&>*]:border-b-0 xl:[&>*:not(:last-child)]:border-r xl:[&>*:last-child]:border-r-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Total Incomplete</CardTitle>
              <CardAction>
                <ShoppingCart className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl leading-none tracking-tight">
                  {(summary?.total_incomplete_placed ?? summary?.total_incomplete_orders ?? 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Still Incomplete</CardTitle>
              <CardAction>
                <Clock className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl leading-none tracking-tight">
                  {(summary?.still_incomplete_orders ?? 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Converted Orders</CardTitle>
              <CardAction>
                <CheckCircle2 className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl leading-none tracking-tight">
                  {(summary?.total_completed_orders ?? 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Conversion Rate</CardTitle>
              <CardAction>
                <Percent className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl leading-none tracking-tight">
                  {summary?.conversion_rate ?? 0}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Revenue Recovered</CardTitle>
              <CardAction>
                <DollarSign className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl leading-none tracking-tight">
                  ৳{(summary?.extra_earned_value ?? 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Avg. Convert Time</CardTitle>
              <CardAction>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl leading-none tracking-tight">
                  {summary?.avg_conversion_time || "—"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2-Column Layout from Medium Devices: Daily Conversion Breakdown & Employee Conversion Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch w-full">
        {/* Left Column: Daily / Monthly Grouped Breakdown Table */}
        <Card className="border border-border/60 shadow-xs flex flex-col h-full">
          <CardHeader className="px-4 py-2.5 sm:px-5 sm:py-2.5 border-b border-border/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  {timeRange === "yearly" || timeRange === "4months" || timeRange === "6months" || timeRange === "all_time"
                    ? "Monthly Conversion Breakdown"
                    : "Daily Conversion Breakdown"}
                </CardTitle>
                <CardDescription className="text-xs">
                  Period-by-period recovered orders & revenue.
                </CardDescription>
              </div>
              {breakdown && breakdown.length > 0 && (
                <Badge variant="outline" className="w-fit text-xs font-normal">
                  {breakdown.length} {breakdown.length === 1 ? "Period" : "Periods"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {breakdown && breakdown.length > 0 ? (
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs">Date / Period</TableHead>
                      <TableHead className="text-center font-semibold text-xs whitespace-nowrap">Total Incomplete</TableHead>
                      <TableHead className="text-center font-semibold text-xs whitespace-nowrap">Still Incomplete</TableHead>
                      <TableHead className="text-center font-semibold text-xs">Converted</TableHead>
                      <TableHead className="text-center font-semibold text-xs">Rate</TableHead>
                      <TableHead className="text-right font-semibold text-xs">Earned (Tk)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdown.map((row) => (
                      <TableRow key={row.period_key} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-xs py-2.5">
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <CalendarIcon className="size-3 text-muted-foreground shrink-0" />
                            {row.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs font-medium py-2.5">
                          {row.total_incomplete_placed ?? row.incomplete_count}
                        </TableCell>
                        <TableCell className="text-center text-xs py-2.5">
                          <span
                            className={
                              (row.still_incomplete_count ?? 0) > 0
                                ? "text-rose-600 dark:text-rose-400 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {row.still_incomplete_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs py-2.5">
                          <Badge
                            variant="secondary"
                            className={
                              row.completed_count > 0
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "text-muted-foreground"
                            }
                          >
                            {row.completed_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-semibold py-2.5">
                          <span>{row.conversion_rate}%</span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 py-2.5">
                          {row.earned_value.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground flex-1 flex items-center justify-center">
                No conversion breakdown data for this period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Employee Conversion Performance */}
        <Card className="border border-border/60 shadow-xs flex flex-col h-full">
          <CardHeader className="px-4 py-2.5 sm:px-5 sm:py-2.5 border-b border-border/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserCheck className="size-4 text-emerald-600" />
                  Employee Conversion Performance
                </CardTitle>
                <CardDescription className="text-xs">
                  Staff members converting incomplete orders.
                </CardDescription>
              </div>
              {employeeBreakdown && employeeBreakdown.length > 0 && (
                <Badge variant="outline" className="w-fit text-xs font-normal">
                  {employeeBreakdown.length} {employeeBreakdown.length === 1 ? "Employee" : "Employees"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {employeeBreakdown && employeeBreakdown.length > 0 ? (
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs">Employee</TableHead>
                      <TableHead className="text-center font-semibold text-xs">Converted</TableHead>
                      <TableHead className="text-right font-semibold text-xs">Recovered (Tk)</TableHead>
                      <TableHead className="text-right font-semibold text-xs">Avg. Value (Tk)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeBreakdown.map((emp) => (
                      <TableRow key={emp.user_id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-xs py-2.5">
                          <span className="flex items-center gap-2">
                            <span className="size-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {emp.employee_name.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="truncate max-w-[120px]">{emp.employee_name}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs py-2.5">
                          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                            {emp.completed_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 py-2.5">
                          {emp.earned_value.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground py-2.5">
                          {Math.round(emp.avg_value).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground flex-1 flex items-center justify-center">
                No employee assignment data available for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Converted Orders Detailed List */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="px-4 py-2.5 sm:px-5 sm:py-2.5 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Actual Converted Orders List
              </CardTitle>
              <CardDescription className="text-xs">
                All individual orders converted from incomplete state with exact conversion timestamps.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search converted orders..."
                className="h-8 pl-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && !orders?.length ? (
            <div className="p-8 text-center space-y-3">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-72 mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <AlertCircle className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No converted orders found in this time range.</p>
              <p className="text-xs text-muted-foreground">
                Try selecting a broader time period or switching to &ldquo;All Time&rdquo;.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-xs">Order No</TableHead>
                    <TableHead className="font-semibold text-xs">Customer</TableHead>
                    <TableHead className="font-semibold text-xs">Order Time</TableHead>
                    <TableHead className="font-semibold text-xs">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Completed Timestamp (Actual)
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold text-xs">Time Taken</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Grand Total</TableHead>
                    <TableHead className="font-semibold text-xs">Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => {
                    const orderDate = formatOrderDateTime(order.created_at);
                    const completedDate = formatOrderDateTime(
                      order.incomplete_completed_at || order.updated_at
                    );
                    const employeeName =
                      order.employee_orders?.[0]?.user?.full_name || "Unassigned";

                    return (
                      <TableRow key={order.order_no} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold">
                          <Link
                            href={`/dashboard/orders`}
                            className="hover:underline text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                          >
                            {order.order_no}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer_full_name || "—"}</span>
                            <span className="text-[11px] text-muted-foreground">{order.customer_phone || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex flex-col">
                            <span>{orderDate.date}</span>
                            <span className="text-[11px]">{orderDate.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col rounded bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 w-fit">
                            <span className="font-semibold">{completedDate.date}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              {completedDate.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.duration_to_complete ? (
                            <Badge variant="outline" className="text-[10px] font-medium bg-muted/40">
                              {order.duration_to_complete}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="secondary"
                            className={
                              order.order_status === "Confirmed" || order.order_status === "Delivered"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : order.order_status === "Cancelled"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            }
                          >
                            {order.order_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-foreground">
                          {Number(order.grand_total_amount || 0).toLocaleString()} Tk
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {employeeName}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total orders)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.current_page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
