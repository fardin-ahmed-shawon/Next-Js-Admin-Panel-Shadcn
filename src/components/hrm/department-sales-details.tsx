"use client";
import type { PerformanceLayoutProps } from "./performance-layout";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  CalendarIcon,
  Sparkles,
  Award,
  ListTodo,
  RefreshCw,
  Search,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDepartmentPerformance } from "@/hooks/useHrm";
import { cn } from "@/lib/utils";

type TimePreset =
  | "all_time"
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "custom";

const timePresetLabels: Record<TimePreset, string> = {
  all_time: "All Time",
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  last_month: "Last Month",
  custom: "Custom Range",
};

function getDateRange(preset: TimePreset): { start?: string; end?: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  switch (preset) {
    case "today":
      return { start: todayStr, end: todayStr };
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return { start: d.toISOString().slice(0, 10), end: todayStr };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      return { start, end };
    }
    case "all_time":
    default:
      return {};
  }
}

export default function DepartmentPerformancePage({ performanceControls, performanceContent, onDatesChange, onPerformanceRefresh, departmentId = "all" }: PerformanceLayoutProps = {}) {
  const [timePreset, setTimePreset] = React.useState<TimePreset>("all_time");
  const [customStart, setCustomStart] = React.useState<string>("");
  const [customEnd, setCustomEnd] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState("revenue");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const dates = React.useMemo(() => {
    if (timePreset === "custom") {
      return { start: customStart || undefined, end: customEnd || undefined };
    }
    return getDateRange(timePreset);
  }, [timePreset, customStart, customEnd]);

  React.useEffect(() => { onDatesChange?.({ start: dates.start, end: dates.end }); }, [onDatesChange, dates.start, dates.end]);

  const { data, loading, refetch } = useDepartmentPerformance({
    start_date: dates.start,
    end_date: dates.end,
  });

  const departments = (data?.departments || []).filter(dept => departmentId === "all" || String(dept.department_id) === departmentId);
  const summary = departments.reduce((sum, dept) => ({
    total_employees: sum.total_employees + dept.employee_count,
    total_orders: sum.total_orders + dept.orders.total,
    delivered_orders: sum.delivered_orders + dept.orders.delivered,
    cancelled_orders: sum.cancelled_orders + dept.orders.cancelled,
    returned_orders: sum.returned_orders + dept.orders.returned,
    total_revenue: sum.total_revenue + dept.financials.total_revenue,
    total_upsell_value: sum.total_upsell_value + dept.financials.total_upsell_value,
    total_tasks: sum.total_tasks + dept.tasks.total,
    completed_tasks: sum.completed_tasks + dept.tasks.completed,
    delivery_rate: 0, cancellation_rate: 0, return_rate: 0, task_completion_rate: 0,
  }), { total_employees: 0, total_orders: 0, delivered_orders: 0, cancelled_orders: 0, returned_orders: 0,
    total_revenue: 0, total_upsell_value: 0, total_tasks: 0, completed_tasks: 0,
    delivery_rate: 0, cancellation_rate: 0, return_rate: 0, task_completion_rate: 0 });
  const rate = (count: number, total: number) => total ? Math.round(count / total * 1000) / 10 : 0;
  summary.delivery_rate = rate(summary.delivered_orders, summary.total_orders);
  summary.cancellation_rate = rate(summary.cancelled_orders, summary.total_orders);
  summary.return_rate = rate(summary.returned_orders, summary.total_orders);
  summary.task_completion_rate = rate(summary.completed_tasks, summary.total_tasks);

  const filteredDepartments = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    const value = (dept: typeof departments[number]) => sortBy === "orders" ? dept.orders.total
      : sortBy === "delivery" ? dept.orders.delivery_rate : sortBy === "upsell" ? dept.financials.total_upsell_value
      : sortBy === "tasks" ? dept.tasks.completion_rate : dept.financials.total_revenue;
    return departments.filter(dept => !q || dept.department_name.toLowerCase().includes(q) || dept.department_code?.toLowerCase().includes(q))
      .sort((a, b) => sortBy === "name" ? a.department_name.localeCompare(b.department_name) : value(b) - value(a) || a.department_name.localeCompare(b.department_name));
  }, [departments, searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + Toolbar (Orders page pattern) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Title + description (hidden on mobile, shown on sm+) */}
        <div className="space-y-1 hidden sm:block">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl tracking-tight">Department Performance</h1>
            {data?.own_department_only && (
              <Badge variant="outline" className="text-xs">
                My Department Only
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Aggregated operational KPIs, order fulfillment efficiency, upsell revenue, and peer task completion rate per department.
          </p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl tracking-tight">Department Performance</h1>
            {data?.own_department_only && (
              <Badge variant="outline" className="text-xs">
                My Department
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Aggregated operational KPIs and order fulfillment efficiency per department.
          </p>
        </div>

        {/* Controls: on mobile = full-width row, desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end flex-wrap">
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/hrm/leaderboard">
                <Award className="mr-2 size-4 text-amber-500" />
                Leaderboard
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/reports/upsell">
                <Sparkles className="mr-2 size-4 text-emerald-500" />
                Upsell Report
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Select
                value={timePreset}
                onValueChange={(v) => {
                  setTimePreset(v as TimePreset);
                }}
              >
                <SelectTrigger className="w-32 sm:w-36 h-9">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(timePresetLabels) as TimePreset[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {timePresetLabels[p]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Custom date inputs — inline on desktop only */}
              {timePreset === "custom" && (
                <div className="hidden sm:flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="h-9 w-36 text-xs"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="h-9 w-36 text-xs"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              )}

              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0"
                aria-label="Refresh performance metrics"
                onClick={() => { refetch(); onPerformanceRefresh?.(); }}
                disabled={loading}
              >
                <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Custom date inputs — own row on mobile only */}
          {timePreset === "custom" && (
            <div className="flex sm:hidden items-center gap-2 w-full">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {performanceControls}
        {!performanceContent && (
      <label className="space-y-2 shrink-0 text-xs text-muted-foreground"><span>Sort departments by</span><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-56" aria-label="Sort departments"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="orders">Assigned Orders</SelectItem><SelectItem value="delivery">Delivery Success Rate</SelectItem><SelectItem value="upsell">Upsell Value</SelectItem><SelectItem value="tasks">Task Completion</SelectItem><SelectItem value="name">Department Name</SelectItem></SelectContent></Select></label>
        )}
      </div>
      {performanceContent ?? <>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Delivery Success Rate */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Delivery Success Rate</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {summary.delivery_rate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={summary.delivery_rate} className="h-2 bg-emerald-100 dark:bg-emerald-950/40" />
            <p className="text-xs text-muted-foreground">
              {summary.delivered_orders} delivered of {summary.total_orders} orders
            </p>
          </CardContent>
        </Card>

        {/* 2. Total Revenue Processed */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Total Revenue Processed</span>
              <DollarSign className="size-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-primary tabular-nums">
              ৳{summary.total_revenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From {summary.delivered_orders} successfully delivered orders
            </p>
          </CardContent>
        </Card>

        {/* 3. Delivered Upsell Revenue */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Delivered Upsell Revenue</span>
              <Sparkles className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
              ৳{summary.total_upsell_value.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Additional revenue from delivered upsells
            </p>
          </CardContent>
        </Card>

        {/* 4. Peer Task Completion */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Peer Task Completion</span>
              <ListTodo className="size-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-blue-600 tabular-nums">
              {summary.task_completion_rate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={summary.task_completion_rate} className="h-2 bg-blue-100 dark:bg-blue-950/40" />
            <p className="text-xs text-muted-foreground">
              {summary.completed_tasks} completed of {summary.total_tasks} peer tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Return & Cancellation Warning Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-amber-500/30 bg-amber-500/[0.02] shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <RotateCcw className="size-4 text-amber-500" />
                Return & Partial Return Rate
              </span>
              <h4 className="text-xl font-bold text-amber-600 tabular-nums">
                {summary.return_rate}% ({summary.returned_orders} orders)
              </h4>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600">
              Needs Followup
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/[0.02] shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <XCircle className="size-4 text-destructive" />
                Cancellation Rate
              </span>
              <h4 className="text-xl font-bold text-destructive tabular-nums">
                {summary.cancellation_rate}% ({summary.cancelled_orders} orders)
              </h4>
            </div>
            <Badge variant="outline" className="border-destructive/40 text-destructive">
              Cancellation Ratio
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown & Comparison Table Card */}
      <Card className="border shadow-2xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <CardTitle className="text-lg font-semibold tracking-tight">
                Department Breakdown &amp; Comparison
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {filteredDepartments.length} {filteredDepartments.length === 1 ? "Dept" : "Depts"}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Performance scores, fulfillment metrics, and financial contributions per department.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs w-full"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1000px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="min-w-[180px]">Department</TableHead>
                  <TableHead className="text-center min-w-[100px]">Staff Count</TableHead>
                  <TableHead className="text-center min-w-[120px]">Assigned Orders</TableHead>
                  <TableHead className="text-center min-w-[140px]">Delivered (Rate %)</TableHead>
                  <TableHead className="text-center min-w-[110px]">Return Rate</TableHead>
                  <TableHead className="text-center min-w-[110px]">Cancel Rate</TableHead>
                  <TableHead className="text-right min-w-[150px]">Revenue (BDT)</TableHead>
                  <TableHead className="text-right min-w-[130px]">Upsell (BDT)</TableHead>
                  <TableHead className="text-center min-w-[130px]">Task Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span className="text-sm">Loading department performance metrics...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-muted p-3">
                          <Building2 className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium text-foreground">
                          No department data found
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {searchQuery
                            ? `No departments matched "${searchQuery}". Try adjusting your search query.`
                            : "There is no performance data available for the selected timeframe."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.department_id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {dept.department_name}
                        </div>
                        {dept.department_code && (
                          <div className="text-[11px] text-muted-foreground">
                            Code: {dept.department_code}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {dept.employee_count}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-medium tabular-nums">
                        {dept.orders.total}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-semibold text-emerald-600 tabular-nums">
                          {dept.orders.delivery_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.orders.delivered} orders)
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-medium text-amber-600 tabular-nums">
                          {dept.orders.return_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.orders.returned})
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-medium text-destructive tabular-nums">
                          {dept.orders.cancellation_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.orders.cancelled})
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="font-semibold text-foreground tabular-nums">
                          ৳{dept.financials.total_revenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-normal tabular-nums">
                          ৳{dept.financials.avg_revenue_per_employee.toLocaleString()} / staff
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-semibold text-amber-600 tabular-nums">
                        ৳{dept.financials.total_upsell_value.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-medium text-blue-600 tabular-nums">
                          {dept.tasks.completion_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.tasks.completed}/{dept.tasks.total})
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </>}
    </div>
  );
}
