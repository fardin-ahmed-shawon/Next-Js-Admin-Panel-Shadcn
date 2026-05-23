"use client";

import * as React from "react";

import Link from "next/link";

import { CalendarIcon, Ellipsis, FileDown, Plus, Printer, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { PurchaseStats } from "./_components/purchase-stats";
import { type CustomerPurchaseEntry, PurchaseTable } from "./_components/purchase-table";

// Mock Data for Customer-wise Purchase History
const allCustomers: CustomerPurchaseEntry[] = [
  {
    id: "CUST-001",
    customerName: "Arham Khan",
    phone: "+880 1711-234567",
    avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=AK",
    totalOrders: 15,
    totalSpent: 45000,
    lastPurchaseDate: "2026-05-19",
    status: "Active",
    customerType: "Registered",
  },
  {
    id: "CUST-002",
    customerName: "Nusrat Jahan",
    phone: "+880 1614-567890",
    avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=NJ",
    totalOrders: 8,
    totalSpent: 22000,
    lastPurchaseDate: "2026-05-18",
    status: "Active",
    customerType: "Registered",
  },
  {
    id: "CUST-003",
    customerName: "Maliha Sultana",
    phone: "+880 1918-901234",
    avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=MS",
    totalOrders: 1,
    totalSpent: 1450,
    lastPurchaseDate: "2026-05-15",
    status: "Inactive",
    customerType: "Guest",
  },
  {
    id: "CUST-004",
    customerName: "Imran Haque",
    phone: "+880 1817-890123",
    avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=IH",
    totalOrders: 24,
    totalSpent: 120500,
    lastPurchaseDate: "2026-05-10",
    status: "Active",
    customerType: "Registered",
  },
  {
    id: "CUST-005",
    customerName: "Fatima Akter",
    phone: "+880 1812-345678",
    avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=FA",
    totalOrders: 3,
    totalSpent: 4500,
    lastPurchaseDate: "2026-04-25",
    status: "Blocked",
    customerType: "Guest",
  },
];

type TimeRange = "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

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

export default function PurchaseHistoryPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const filteredByTime = React.useMemo(() => {
    if (timeRange === "alltime") return allCustomers;
    if (timeRange === "custom") {
      return allCustomers.filter((c) => {
        if (customFrom && c.lastPurchaseDate < customFrom) return false;
        if (customTo && c.lastPurchaseDate > customTo) return false;
        return true;
      });
    }
    const from = getDateFrom(timeRange);
    return allCustomers.filter((c) => c.lastPurchaseDate >= from);
  }, [timeRange, customFrom, customTo]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + Toolbar combined */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Title + description */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl tracking-tight">Customer Purchase History</h1>
          <p className="text-muted-foreground text-sm">
            Track lifetime value, total orders, and purchase history of your customers.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Period select + 3-dot */}
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

              {/* Custom date inputs — inline on desktop only */}
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

              {/* 3-dot actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="More actions">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Printer className="mr-2 size-4" /> Print Records
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileDown className="mr-2 size-4" /> Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <RefreshCw className="mr-2 size-4" /> Refresh Data
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Custom date inputs — own row on mobile only */}
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

      <PurchaseStats data={filteredByTime} />

      <div className="w-full min-w-0">
        <PurchaseTable data={filteredByTime} />
      </div>
    </div>
  );
}
