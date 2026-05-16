"use client";

import * as React from "react";
import {
  Award,
  Ban,
  Crown,
  Medal,
  ShieldAlert,
  Star,
  TrendingUp,
  Trophy,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const bestCustomersMonthly = [
  { rank: 1, name: "Nusrat Jahan", email: "nusrat@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NJ", orders: 8, spent: 4250 },
  { rank: 2, name: "Maliha Sultana", email: "maliha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MS", orders: 6, spent: 3120 },
  { rank: 3, name: "Ayesha Siddiqua", email: "ayesha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AS", orders: 5, spent: 2890 },
  { rank: 4, name: "Arham Khan", email: "arham@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AK", orders: 4, spent: 2100 },
  { rank: 5, name: "Imran Haque", email: "imran@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=IH", orders: 3, spent: 1680 },
];

const bestCustomersYearly = [
  { rank: 1, name: "Nusrat Jahan", email: "nusrat@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NJ", orders: 42, spent: 28750 },
  { rank: 2, name: "Maliha Sultana", email: "maliha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MS", orders: 31, spent: 18500 },
  { rank: 3, name: "Ayesha Siddiqua", email: "ayesha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AS", orders: 28, spent: 15200 },
  { rank: 4, name: "Arham Khan", email: "arham@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AK", orders: 24, spent: 12450 },
  { rank: 5, name: "Fatima Akter", email: "fatima@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=FA", orders: 18, spent: 8920 },
];

const bestCustomersAllTime = [
  { rank: 1, name: "Nusrat Jahan", email: "nusrat@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NJ", orders: 127, spent: 84500 },
  { rank: 2, name: "Maliha Sultana", email: "maliha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MS", orders: 98, spent: 62300 },
  { rank: 3, name: "Ayesha Siddiqua", email: "ayesha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AS", orders: 85, spent: 51200 },
  { rank: 4, name: "Arham Khan", email: "arham@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AK", orders: 72, spent: 43800 },
  { rank: 5, name: "Imran Haque", email: "imran@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=IH", orders: 64, spent: 38900 },
];

const activeCustomers = [
  { name: "Nusrat Jahan", email: "nusrat@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NJ", lastOrder: "2 hours ago", orders: 42, spent: 28750 },
  { name: "Arham Khan", email: "arham@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AK", lastOrder: "1 day ago", orders: 24, spent: 12450 },
  { name: "Maliha Sultana", email: "maliha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MS", lastOrder: "2 days ago", orders: 31, spent: 18500 },
  { name: "Fatima Akter", email: "fatima@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=FA", lastOrder: "3 days ago", orders: 18, spent: 8920 },
  { name: "Ayesha Siddiqua", email: "ayesha@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AS", lastOrder: "4 days ago", orders: 28, spent: 15200 },
  { name: "Imran Haque", email: "imran@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=IH", lastOrder: "5 days ago", orders: 15, spent: 9820 },
  { name: "Kamal Hossain", email: "kamal@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=KH", lastOrder: "1 week ago", orders: 9, spent: 5430 },
  { name: "Tanvir Hossain", email: "tanvir@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=TH", lastOrder: "2 weeks ago", orders: 7, spent: 3680 },
];

const inactiveCustomers = [
  { name: "Rahim Uddin", email: "rahim@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RU", lastOrder: "4 months ago", orders: 3, spent: 1250, daysSinceLast: 120 },
  { name: "Sadia Rahman", email: "sadia@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=SR", lastOrder: "5 months ago", orders: 1, spent: 580, daysSinceLast: 150 },
  { name: "Rafiq Islam", email: "rafiq@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RI", lastOrder: "3 months ago", orders: 1, spent: 450, daysSinceLast: 90 },
  { name: "Priya Das", email: "priya@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=PD", lastOrder: "6 months ago", orders: 2, spent: 1200, daysSinceLast: 180 },
  { name: "Habibur Rahman", email: "habib@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=HR", lastOrder: "8 months ago", orders: 5, spent: 3200, daysSinceLast: 240 },
];

const bannedCustomers = [
  { name: "Shahid Mia", email: "shahid@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=SM", reason: "Multiple fraudulent chargebacks", bannedDate: "2025-12-10", orders: 6, spent: 0 },
  { name: "Raju Ahmed", email: "raju@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RA", reason: "Repeated abusive behaviour towards delivery staff", bannedDate: "2026-01-22", orders: 12, spent: 4500 },
  { name: "Nasir Uddin", email: "nasir@example.com", avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NU", reason: "Violation of terms of service", bannedDate: "2026-03-05", orders: 3, spent: 980 },
];

/* ------------------------------------------------------------------ */
/*  Helper — rank icon                                                 */
/* ------------------------------------------------------------------ */

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="size-5 text-amber-500" />;
  if (rank === 2) return <Medal className="size-5 text-slate-400" />;
  if (rank === 3) return <Award className="size-5 text-amber-700" />;
  return <span className="flex size-5 items-center justify-center text-xs font-bold text-muted-foreground">#{rank}</span>;
}

/* ------------------------------------------------------------------ */
/*  Stat Summary Cards                                                 */
/* ------------------------------------------------------------------ */

const summaryStats = [
  { title: "Active", value: activeCustomers.length.toString(), icon: UserCheck, subtitle: "Ordered in last 30 days", color: "text-emerald-600" },
  { title: "Inactive", value: inactiveCustomers.length.toString(), icon: UserMinus, subtitle: "No orders in 90+ days", color: "text-amber-600" },
  { title: "Banned", value: bannedCustomers.length.toString(), icon: Ban, subtitle: "Permanently restricted", color: "text-destructive" },
  { title: "Top Spender", value: "৳84,500", icon: Trophy, subtitle: "Nusrat Jahan — all time", color: "text-primary" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CustomerReportPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Customer Report</h1>
        <p className="text-muted-foreground text-sm">
          Insights into customer engagement, top spenders, and account health.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        {summaryStats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <stat.icon className="size-4" />
                </div>
              </CardTitle>
              <CardDescription>{stat.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className={`font-medium text-3xl tabular-nums leading-none tracking-tight ${stat.color}`}>{stat.value}</div>
              <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ====== Best Customers ====== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-5 text-amber-500" />
            Best Customers
          </CardTitle>
          <CardDescription>Top customers ranked by total spent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>

            {[
              { key: "monthly", data: bestCustomersMonthly, label: "This Month" },
              { key: "yearly", data: bestCustomersYearly, label: "This Year" },
              { key: "alltime", data: bestCustomersAllTime, label: "All Time" },
            ].map(({ key, data, label }) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="flex flex-col gap-2">
                  {data.map((c) => (
                    <div key={c.rank} className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center">
                          <RankIcon rank={c.rank} />
                        </div>
                        <div className="size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
                          <img src={c.avatar} alt={c.name} className="size-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
                          <p className="text-sm font-medium tabular-nums">{c.orders}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spent</p>
                          <p className="text-sm font-semibold tabular-nums text-primary">৳{c.spent.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground text-center">Showing top 5 customers for {label.toLowerCase()}</p>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* ====== Active / Inactive / Banned Grid ====== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="size-5 text-emerald-600" />
              Active Customers
            </CardTitle>
            <CardDescription>Customers who placed an order recently.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {activeCustomers.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="size-9 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <img src={c.avatar} alt={c.name} className="size-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spent</p>
                    <p className="text-sm font-medium tabular-nums">৳{c.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Order</p>
                    <p className="text-xs font-medium text-emerald-600">{c.lastOrder}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inactive Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserMinus className="size-5 text-amber-600" />
              Inactive Customers
            </CardTitle>
            <CardDescription>No orders placed in 90+ days.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {inactiveCustomers.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="size-9 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <img src={c.avatar} alt={c.name} className="size-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
                    <p className="text-sm font-medium tabular-nums">{c.orders}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Inactive</p>
                    <p className="text-xs font-medium text-amber-600">{c.daysSinceLast} days</p>
                  </div>
                </div>
              </div>
            ))}
            <Separator className="my-1" />
            <p className="text-xs text-muted-foreground text-center">Consider sending a re-engagement campaign to these customers.</p>
          </CardContent>
        </Card>
      </div>

      {/* ====== Banned Customers ====== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-5 text-destructive" />
            Banned Customers
          </CardTitle>
          <CardDescription>Customers who have been permanently restricted from the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {bannedCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <UserX className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No banned customers</p>
              <p className="text-xs text-muted-foreground">All customers are in good standing.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {bannedCustomers.map((c, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full border bg-muted opacity-60 grayscale">
                      <img src={c.avatar} alt={c.name} className="size-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{c.name}</p>
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Banned</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:items-end sm:text-right">
                    <p className="text-xs text-destructive font-medium">{c.reason}</p>
                    <p className="text-[10px] text-muted-foreground">Banned on {c.bannedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
