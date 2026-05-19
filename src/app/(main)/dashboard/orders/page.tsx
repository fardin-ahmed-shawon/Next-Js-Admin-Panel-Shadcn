"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarIcon, Ellipsis, FileDown, FileText, Plus, Printer, RefreshCw, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStats } from "./_components/order-stats";
import { OrdersTable } from "./_components/orders-table";

/* ---- All orders data (shared between stats & table) ---- */

export const allOrders = [
  { id: "ORD-2601", customer: "Nusrat Jahan", phone: "+880 1614-567890", items: 3, total: 4100, paid: 4100, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "bKash", date: "2026-05-18", time: "11:25 AM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=NJ", category: "Clothing", subCategory: "T-Shirts", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=TS", "https://placehold.co/40/1a1a2e/e0e0e0?text=DJ", "https://placehold.co/40/1a1a2e/e0e0e0?text=PS"], parcelStatus: "Delivered", courier: "Steadfast", parcelHistory: { total: 5, delivered: 4, cancelled: 1, successRate: "80.0" } },
  { id: "ORD-2602", customer: "Arham Khan", phone: "+880 1711-234567", items: 2, total: 2300, paid: 0, due: 2300, orderStatus: "Pending", paymentStatus: "Unpaid", paymentMethod: "COD", date: "2026-05-18", time: "10:15 AM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=AK", category: "Electronics", subCategory: "Earbuds", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=BE", "https://placehold.co/40/1a1a2e/e0e0e0?text=FW"], parcelStatus: "", courier: "", parcelHistory: { total: 2, delivered: 2, cancelled: 0, successRate: "100.0" } },
  { id: "ORD-2603", customer: "Maliha Sultana", phone: "+880 1918-901234", items: 1, total: 1450, paid: 1450, due: 0, orderStatus: "In-Courier", paymentStatus: "Full Paid", paymentMethod: "Nagad", date: "2026-05-17", time: "3:42 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=MS", category: "Clothing", subCategory: "Jeans", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=DJ"], parcelStatus: "In Transit", courier: "Pathao", parcelHistory: { total: 10, delivered: 9, cancelled: 1, successRate: "90.0" } },
  { id: "ORD-2604", customer: "Imran Haque", phone: "+880 1817-890123", items: 4, total: 5800, paid: 2000, due: 3800, orderStatus: "Confirmed", paymentStatus: "Partially Paid", paymentMethod: "bKash", date: "2026-05-17", time: "1:10 PM", orderType: "wholesale", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=IH", category: "Electronics", subCategory: "Watches", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=FW", "https://placehold.co/40/1a1a2e/e0e0e0?text=BE", "https://placehold.co/40/1a1a2e/e0e0e0?text=DL", "https://placehold.co/40/1a1a2e/e0e0e0?text=WB"], parcelStatus: "", courier: "", parcelHistory: { total: 1, delivered: 0, cancelled: 0, successRate: "0.0" } },
  { id: "ORD-2605", customer: "Fatima Akter", phone: "+880 1812-345678", items: 1, total: 850, paid: 850, due: 0, orderStatus: "Cancelled", paymentStatus: "Refund", paymentMethod: "COD", date: "2026-05-16", time: "9:30 AM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=FA", category: "Beauty", subCategory: "Skincare", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=FM"], parcelStatus: "Returned", courier: "Steadfast", parcelHistory: { total: 3, delivered: 2, cancelled: 1, successRate: "66.7" } },
  { id: "ORD-2606", customer: "Tanvir Hossain", phone: "+880 1515-678901", items: 2, total: 3200, paid: 3200, due: 0, orderStatus: "Ready To Ship", paymentStatus: "Full Paid", paymentMethod: "Bank", date: "2026-05-16", time: "2:20 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=TH", category: "Footwear", subCategory: "Sneakers", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=RS", "https://placehold.co/40/1a1a2e/e0e0e0?text=RS"], parcelStatus: "", courier: "", parcelHistory: { total: 12, delivered: 12, cancelled: 0, successRate: "100.0" } },
  { id: "ORD-2607", customer: "Ayesha Siddiqua", phone: "+880 1520-123456", items: 3, total: 4750, paid: 4750, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "bKash", date: "2026-05-15", time: "4:55 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=AS", category: "Accessories", subCategory: "Bags", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=CB", "https://placehold.co/40/1a1a2e/e0e0e0?text=WB", "https://placehold.co/40/1a1a2e/e0e0e0?text=FM"], parcelStatus: "Delivered", courier: "Pathao", parcelHistory: { total: 4, delivered: 4, cancelled: 0, successRate: "100.0" } },
  { id: "ORD-2608", customer: "Kamal Hossain", phone: "+880 1721-234567", items: 1, total: 950, paid: 0, due: 950, orderStatus: "Ship Later", paymentStatus: "Unpaid", paymentMethod: "COD", date: "2026-05-15", time: "11:00 AM", orderType: "pre-order", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=KH", category: "Clothing", subCategory: "Polo Shirts", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=PS"], parcelStatus: "", courier: "", parcelHistory: { total: 8, delivered: 7, cancelled: 1, successRate: "87.5" } },
  { id: "ORD-2609", customer: "Rahim Uddin", phone: "+880 1913-456789", items: 2, total: 1800, paid: 0, due: 1800, orderStatus: "Hold", paymentStatus: "Unpaid", paymentMethod: "COD", date: "2026-05-14", time: "12:30 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=RU", category: "Home", subCategory: "Lamps", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=DL", "https://placehold.co/40/1a1a2e/e0e0e0?text=WB"], parcelStatus: "", courier: "", parcelHistory: { total: 2, delivered: 1, cancelled: 1, successRate: "50.0" } },
  { id: "ORD-2610", customer: "Priya Das", phone: "+880 1822-345678", items: 1, total: 650, paid: 650, due: 0, orderStatus: "Returned", paymentStatus: "Refund", paymentMethod: "Nagad", date: "2026-05-14", time: "5:15 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=PD", category: "Beauty", subCategory: "Makeup", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=FM"], parcelStatus: "Returned", courier: "Steadfast", parcelHistory: { total: 1, delivered: 0, cancelled: 1, successRate: "0.0" } },
  { id: "ORD-2611", customer: "Sadia Rahman", phone: "+880 1716-789012", items: 2, total: 2100, paid: 1000, due: 1100, orderStatus: "Pre-Order", paymentStatus: "Partially Paid", paymentMethod: "bKash", date: "2026-05-13", time: "8:45 AM", orderType: "pre-order", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=SR", category: "Electronics", subCategory: "Smartphones", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=BE", "https://placehold.co/40/1a1a2e/e0e0e0?text=FW"], parcelStatus: "", courier: "", parcelHistory: { total: 6, delivered: 6, cancelled: 0, successRate: "100.0" } },
  { id: "ORD-2612", customer: "Rafiq Islam", phone: "+880 1619-012345", items: 1, total: 480, paid: 0, due: 480, orderStatus: "Pending", paymentStatus: "Unpaid", paymentMethod: "COD", date: "2026-05-01", time: "10:00 AM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=RI", category: "Home", subCategory: "Bottles", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=WB"], parcelStatus: "", courier: "", parcelHistory: { total: 0, delivered: 0, cancelled: 0, successRate: "0.0" } },
  { id: "ORD-2613", customer: "Habibur Rahman", phone: "+880 1721-234567", items: 3, total: 3900, paid: 3900, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "Bank", date: "2026-04-28", time: "2:00 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=HR", category: "Clothing", subCategory: "Jackets", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=TS", "https://placehold.co/40/1a1a2e/e0e0e0?text=DJ", "https://placehold.co/40/1a1a2e/e0e0e0?text=PS"], parcelStatus: "Delivered", courier: "Pathao", parcelHistory: { total: 20, delivered: 18, cancelled: 2, successRate: "90.0" } },
  { id: "ORD-2614", customer: "Nasir Uddin", phone: "+880 1812-345678", items: 1, total: 1200, paid: 1200, due: 0, orderStatus: "Missing", paymentStatus: "Full Paid", paymentMethod: "Nagad", date: "2026-04-20", time: "6:30 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=NU", category: "Electronics", subCategory: "Laptops", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=BE"], parcelStatus: "Missing", courier: "Steadfast", parcelHistory: { total: 5, delivered: 4, cancelled: 0, successRate: "80.0" } },
  { id: "ORD-2615", customer: "Shahid Mia", phone: "+880 1913-456789", items: 2, total: 2800, paid: 0, due: 2800, orderStatus: "Fake", paymentStatus: "Unpaid", paymentMethod: "COD", date: "2026-03-15", time: "9:00 AM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=SM", category: "Footwear", subCategory: "Boots", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=RS", "https://placehold.co/40/1a1a2e/e0e0e0?text=RS"], parcelStatus: "", courier: "", parcelHistory: { total: 2, delivered: 0, cancelled: 2, successRate: "0.0" } },
  { id: "ORD-2616", customer: "Raju Ahmed", phone: "+880 1614-567890", items: 1, total: 950, paid: 950, due: 0, orderStatus: "Lost", paymentStatus: "Refund", paymentMethod: "bKash", date: "2026-02-10", time: "7:45 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=RA", category: "Accessories", subCategory: "Wallets", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=CB"], parcelStatus: "Lost", courier: "Pathao", parcelHistory: { total: 9, delivered: 8, cancelled: 0, successRate: "88.9" } },
  { id: "ORD-2617", customer: "Monir Hossain", phone: "+880 1515-678901", items: 4, total: 6200, paid: 6200, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "Bank", date: "2026-01-05", time: "3:00 PM", orderType: "wholesale", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=MH", category: "Clothing", subCategory: "T-Shirts", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=TS", "https://placehold.co/40/1a1a2e/e0e0e0?text=DJ", "https://placehold.co/40/1a1a2e/e0e0e0?text=PS", "https://placehold.co/40/1a1a2e/e0e0e0?text=CB"], parcelStatus: "Delivered", courier: "Steadfast", parcelHistory: { total: 2, delivered: 2, cancelled: 0, successRate: "100.0" } },
  { id: "ORD-2618", customer: "Nusrat Jahan", phone: "+880 1614-567890", items: 1, total: 850, paid: 850, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "bKash", date: "2025-12-20", time: "1:30 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=NJ", category: "Beauty", subCategory: "Fragrance", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=FM"], parcelStatus: "Delivered", courier: "Pathao", parcelHistory: { total: 5, delivered: 4, cancelled: 1, successRate: "80.0" } },
  { id: "ORD-2619", customer: "Arham Khan", phone: "+880 1711-234567", items: 2, total: 3400, paid: 3400, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "Nagad", date: "2025-11-10", time: "10:20 AM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=AK", category: "Home", subCategory: "Decor", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=DL", "https://placehold.co/40/1a1a2e/e0e0e0?text=WB"], parcelStatus: "Delivered", courier: "Steadfast", parcelHistory: { total: 2, delivered: 2, cancelled: 0, successRate: "100.0" } },
  { id: "ORD-2620", customer: "Maliha Sultana", phone: "+880 1918-901234", items: 3, total: 4500, paid: 4500, due: 0, orderStatus: "Delivered", paymentStatus: "Full Paid", paymentMethod: "bKash", date: "2025-08-01", time: "4:10 PM", orderType: "regular", avatar: "https://placehold.co/40x40/1a1a2e/e0e0e0?text=MS", category: "Clothing", subCategory: "Jeans", productImages: ["https://placehold.co/40/1a1a2e/e0e0e0?text=DJ", "https://placehold.co/40/1a1a2e/e0e0e0?text=TS", "https://placehold.co/40/1a1a2e/e0e0e0?text=PS"], parcelStatus: "Delivered", courier: "Pathao", parcelHistory: { total: 10, delivered: 9, cancelled: 1, successRate: "90.0" } },
];

/* ---- Time range helpers ---- */

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
  alltime: "All Time", daily: "Daily", weekly: "Weekly", monthly: "Monthly", "4months": "Last 4 Months",
  "6months": "Last 6 Months", yearly: "Yearly", custom: "Custom Range",
};

export default function OrdersPage() {
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
      {/* Header + Toolbar combined */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Title + description (hidden on mobile, shown on sm+) */}
        <div className="space-y-1 hidden sm:block">
          <h1 className="text-3xl tracking-tight">Order Management</h1>
          <p className="text-muted-foreground text-sm">Track, manage, and fulfill all customer orders.</p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <h1 className="text-2xl tracking-tight">Order Management</h1>
          <p className="text-muted-foreground text-sm">Track, manage, and fulfill all customer orders.</p>
        </div>

        {/* Controls: on mobile = full-width row (Create Order left, period+3dot right). On desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Create Order button */}
            <Button size="sm" asChild>
              <Link href="/dashboard/orders/create"><Plus className="mr-2 size-4" />Create Order</Link>
            </Button>

            {/* Period select + 3-dot */}
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-32 sm:w-36">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(rangeLabels) as TimeRange[]).filter(r => r !== "custom").map((r) => (
                      <SelectItem key={r} value={r}>{rangeLabels[r]}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Custom date inputs — inline on desktop only */}
              {timeRange === "custom" && (
                <div className="hidden sm:flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Input type="date" className="h-8 w-36 text-xs" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input type="date" className="h-8 w-36 text-xs" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                </div>
              )}

              {/* 3-dot actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="More order actions"><Ellipsis /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Bulk Invoice</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => { }}>
                      <FileText className="mr-2 size-4" />All Invoice A4
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { }}>
                      <Printer className="mr-2 size-4" />All Parcel Invoice
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Management</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => { }}>
                      <ShieldOff className="mr-2 size-4" />Block List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { }}>
                      <RefreshCw className="mr-2 size-4" />Refresh
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { }}>
                      <FileDown className="mr-2 size-4" />Export Report
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
              <Input type="date" className="h-8 flex-1 text-xs" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <Input type="date" className="h-8 flex-1 text-xs" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Stats — driven by time-filtered data */}
      <OrderStats data={filteredByTime} />

      {/* Table — driven by time-filtered data */}
      <div className="w-full min-w-0">
        <OrdersTable data={filteredByTime} />
      </div>
    </div>
  );
}
