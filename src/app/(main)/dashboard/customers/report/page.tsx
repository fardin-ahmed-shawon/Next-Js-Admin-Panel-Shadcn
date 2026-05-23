"use client";

import * as React from "react";

import { Ban, Trophy, UserCheck, UserMinus, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BestCustomersTable } from "./_components/best-customers-table";
import { CustomerEngagementGrid } from "./_components/customer-engagement-grid";

/* ------------------------------------------------------------------ */
/*  Stat Summary Cards                                                 */
/* ------------------------------------------------------------------ */

const summaryStats = [
  {
    title: "All Customers",
    value: "17",
    icon: Users,
    subtitle: "Total customers in the system",
    color: "text-foreground",
  },
  { title: "Active", value: "8", icon: UserCheck, subtitle: "Ordered in last 30 days", color: "text-emerald-600" },
  { title: "Inactive", value: "6", icon: UserMinus, subtitle: "No orders in 90+ days", color: "text-amber-600" },
  { title: "Banned", value: "3", icon: Ban, subtitle: "Permanently restricted", color: "text-destructive" },
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
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
              <div className={`font-medium text-3xl tabular-nums leading-none tracking-tight ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best Customers — Full Table */}
      <BestCustomersTable />

      {/* Active / Inactive / Banned — 3‑Column Card Grid */}
      <CustomerEngagementGrid />
    </div>
  );
}
