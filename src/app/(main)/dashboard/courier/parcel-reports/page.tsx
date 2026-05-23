"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ParcelReportsStats } from "./_components/parcel-reports-stats";
import { type OrderRow, ParcelReportsTable } from "./_components/parcel-reports-table";

/* ---- All orders data ---- */
const allOrders: OrderRow[] = [
  {
    id: "ORD-5001",
    customer: { name: "John Doe", email: "john@example.com", phone: "+8801700000001" },
    amount: "৳150.00",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    date: "2024-03-15",
    time: "10:30 AM",
    orderStatus: "Processing",
    parcelStatus: "Not Added",
    courier: "Steadfast",
  },
  {
    id: "ORD-5002",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "+8801700000002" },
    amount: "৳85.50",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    date: "2024-03-15",
    time: "02:15 PM",
    orderStatus: "Shipped",
    parcelStatus: "Added",
    courier: "Pathao",
  },
  {
    id: "ORD-5003",
    customer: { name: "Alice Johnson", email: "alice@example.com", phone: "+8801700000003" },
    amount: "৳210.00",
    paymentMethod: "Bkash",
    paymentStatus: "Paid",
    date: "2024-03-14",
    time: "11:45 AM",
    orderStatus: "Delivered",
    parcelStatus: "Returned",
    courier: "Steadfast",
  },
  {
    id: "ORD-5004",
    customer: { name: "Bob Brown", email: "bob@example.com", phone: "+8801700000004" },
    amount: "৳45.00",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    date: "2024-03-14",
    time: "04:20 PM",
    orderStatus: "Processing",
    parcelStatus: "Not Added",
    courier: "Steadfast",
  },
  {
    id: "ORD-5005",
    customer: { name: "Charlie Davis", email: "charlie@example.com", phone: "+8801700000005" },
    amount: "৳320.00",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Paid",
    date: "2024-03-13",
    time: "09:00 AM",
    orderStatus: "Shipped",
    parcelStatus: "Added",
    courier: "Pathao",
  },
  {
    id: "ORD-5006",
    customer: { name: "Diana Evans", email: "diana@example.com", phone: "+8801700000006" },
    amount: "৳90.00",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    date: "2024-03-12",
    time: "01:30 PM",
    orderStatus: "Returned",
    parcelStatus: "Returned",
    courier: "Steadfast",
  },
];

/* ---- Time range helpers ---- */
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

export default function ParcelReportsPage() {
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Parcel Reports</h1>
          <p className="text-muted-foreground text-sm">
            Manage all your courier orders and shipments across all providers.
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

            {/* Custom date inputs — inline on desktop only */}
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
          </div>

          {/* Custom date inputs — own row on mobile only */}
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
        </div>
      </div>

      <ParcelReportsStats data={filteredByTime} />
      <ParcelReportsTable data={filteredByTime} />
    </div>
  );
}
