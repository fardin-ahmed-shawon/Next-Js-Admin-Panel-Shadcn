"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  Users,
  Calendar,
  Filter,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Award,
  Layers,
  ListTodo,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDepartmentPerformance } from "@/hooks/useHrm";

export default function DepartmentPerformancePage() {
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  const { data, loading, refetch } = useDepartmentPerformance({
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const handleQuickPreset = (preset: "all" | "today" | "month" | "last30") => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (preset === "last30") {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(past30);
      setEndDate(todayStr);
    }
  };

  const summary = data?.summary || {
    total_employees: 0,
    total_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    returned_orders: 0,
    total_revenue: 0,
    total_upsell_value: 0,
    total_tasks: 0,
    completed_tasks: 0,
    delivery_rate: 0,
    cancellation_rate: 0,
    return_rate: 0,
    task_completion_rate: 0,
  };

  const departments = data?.departments || [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Department Performance Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated operational KPIs, order fulfillment efficiency, upsell revenue, and peer task completion rate per department.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/hrm/leaderboard">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              Employee Leaderboard
            </Button>
          </Link>
          <Link href="/dashboard/reports/upsell">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Upsell Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">From:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">To:</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant={!startDate && !endDate ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleQuickPreset("all")}
            >
              All Time
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleQuickPreset("today")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleQuickPreset("month")}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleQuickPreset("last30")}
            >
              Last 30 Days
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivery Success Rate */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Delivery Success Rate</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {summary.delivery_rate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={summary.delivery_rate} className="h-2 mb-2 bg-emerald-100 dark:bg-emerald-950/40" />
            <p className="text-xs text-muted-foreground">
              {summary.delivered_orders} delivered of {summary.total_orders} orders
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue Processed */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Total Revenue Processed</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              ৳{summary.total_revenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From {summary.delivered_orders} successfully delivered orders
            </p>
          </CardContent>
        </Card>

        {/* Total Upsell Value */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Delivered Upsell Revenue</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              ৳{summary.total_upsell_value.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Additional revenue from delivered upsells
            </p>
          </CardContent>
        </Card>

        {/* Task Completion Rate */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Peer Task Completion</span>
              <ListTodo className="h-4 w-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {summary.task_completion_rate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={summary.task_completion_rate} className="h-2 mb-2 bg-blue-100 dark:bg-blue-950/40" />
            <p className="text-xs text-muted-foreground">
              {summary.completed_tasks} completed of {summary.total_tasks} peer tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Return & Cancellation Warning Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-amber-500/30 bg-amber-500/[0.02]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                Return & Partial Return Rate
              </span>
              <h4 className="text-xl font-bold text-amber-600">
                {summary.return_rate}% ({summary.returned_orders} orders)
              </h4>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600">
              Needs Followup
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/[0.02]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-destructive" />
                Cancellation Rate
              </span>
              <h4 className="text-xl font-bold text-destructive">
                {summary.cancellation_rate}% ({summary.cancelled_orders} orders)
              </h4>
            </div>
            <Badge variant="outline" className="border-destructive/40 text-destructive">
              Cancellation Ratio
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Department Breakdown & Comparison
          </CardTitle>
          <CardDescription>
            Performance score and operational statistics for each company department.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Staff Count</TableHead>
                  <TableHead className="text-center">Assigned Orders</TableHead>
                  <TableHead className="text-center">Delivered (Rate %)</TableHead>
                  <TableHead className="text-center">Return Rate</TableHead>
                  <TableHead className="text-center">Cancel Rate</TableHead>
                  <TableHead className="text-right">Revenue (BDT)</TableHead>
                  <TableHead className="text-right">Upsell (BDT)</TableHead>
                  <TableHead className="text-center">Task Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      Loading department performance metrics...
                    </TableCell>
                  </TableRow>
                ) : departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No department data found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.department_id} className="hover:bg-muted/30">
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

                      <TableCell className="text-center font-medium">
                        <Badge variant="secondary" className="font-mono">
                          {dept.employee_count}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-medium">
                        {dept.orders.total}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-semibold text-emerald-600">
                          {dept.orders.delivery_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.orders.delivered} orders)
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-medium text-amber-600">
                          {dept.orders.return_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.orders.returned})
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-medium text-destructive">
                          {dept.orders.cancellation_rate}%
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({dept.orders.cancelled})
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-semibold text-foreground">
                        ৳{dept.financials.total_revenue.toLocaleString()}
                        <div className="text-[11px] text-muted-foreground font-normal">
                          ৳{dept.financials.avg_revenue_per_employee.toLocaleString()} / staff
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-semibold text-amber-600">
                        ৳{dept.financials.total_upsell_value.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-medium text-blue-600">
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
    </div>
  );
}
