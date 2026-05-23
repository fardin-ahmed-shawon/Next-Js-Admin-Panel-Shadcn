"use client";

import * as React from "react";

import { CalendarIcon, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { allOrders } from "../orders/page";
import { SalesReportsOrderHistory } from "./_components/sales-reports-order-history";
import { SalesReportsStats } from "./_components/sales-reports-stats";
import { SalesReportsTopCustomers } from "./_components/sales-reports-top-customers";
import { SalesReportsTopProducts } from "./_components/sales-reports-top-products";
import { SalesReportsTransactions } from "./_components/sales-reports-transactions";

type TimeRange = "alltime" | "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "custom";

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
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "Yearly",
  custom: "Custom Range",
};

export default function SalesReportPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const filteredByTime = React.useMemo(() => {
    if (timeRange === "alltime") return allOrders;
    if (timeRange === "custom") {
      return allOrders.filter((o) => {
        if (customFrom && o.date < customFrom) return false;
        if (customTo && o.date > customTo) return false;
        return true;
      });
    }
    const from = getDateFrom(timeRange);
    return allOrders.filter((o) => o.date >= from);
  }, [timeRange, customFrom, customTo]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground text-sm">
            Analyze your sales data, revenue trends, and payment distributions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-32 sm:w-40 bg-background">
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

            {timeRange === "custom" && (
              <div className="hidden sm:flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="h-9 w-36 text-xs"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="h-9 w-36 text-xs"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}

            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>

          {timeRange === "custom" && (
            <div className="flex sm:hidden items-center gap-2 w-full mt-2">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}

          <Button variant="outline" size="sm" className="sm:hidden w-full mt-2">
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
        </div>
      </div>

      <SalesReportsStats data={filteredByTime} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesReportsTopProducts data={filteredByTime} />
        <SalesReportsTopCustomers data={filteredByTime} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesReportsOrderHistory data={filteredByTime} />
        <SalesReportsTransactions data={filteredByTime} />
      </div>
    </div>
  );
}
