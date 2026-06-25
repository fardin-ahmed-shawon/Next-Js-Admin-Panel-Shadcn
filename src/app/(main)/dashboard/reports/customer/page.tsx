"use client";

import * as React from "react";
import { Ban, Trophy, UserCheck, UserMinus, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BestCustomersTable, BestCustomerRow } from "./_components/best-customers-table";
import { CustomerEngagementGrid, EngagementCustomer, EngagementStatus } from "./_components/customer-engagement-grid";
import { useCustomers } from "@/hooks/useCustomers";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CustomerReportPage() {
  const { data: response, isLoading, error } = useCustomers();

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-destructive">Failed to load customer reports.</p>
      </div>
    );
  }

  const customers = response?.data || [];

  const now = new Date().getTime();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  let activeCount = 0;
  let inactiveCount = 0;
  let bannedCount = 0;

  // Process and sort for Best Customers
  const rankedCustomers = [...customers]
    .filter((c) => c.parcel_history?.total_spent > 0)
    .sort((a, b) => (b.parcel_history?.total_spent || 0) - (a.parcel_history?.total_spent || 0))
    .map((c, i) => {
      const bestRow: BestCustomerRow = {
        rank: i + 1,
        name: c.full_name,
        email: c.email || "",
        phone: c.phone || "",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=random`,
        orders: c.parcel_history?.total || 0,
        spent: c.parcel_history?.total_spent || 0,
        period: "all",
      };
      return bestRow;
    });

  const topSpender = rankedCustomers.length > 0 ? rankedCustomers[0] : null;

  // Process for Engagement Grid
  const engagementCustomers: EngagementCustomer[] = customers.map((c: any) => {
    let lastOrderTime = 0;
    if (c.orders && c.orders.length > 0) {
      lastOrderTime = new Date(c.orders[c.orders.length - 1].created_at).getTime();
    } else {
      lastOrderTime = new Date(c.created_at).getTime();
    }

    const daysSince = Math.floor((now - lastOrderTime) / (1000 * 60 * 60 * 24));
    let status: EngagementStatus;
    let meta = "";

    if (c.status === "inactive") {
      status = "Banned";
      meta = "Account deactivated by admin";
      bannedCount++;
    } else if (now - lastOrderTime <= THIRTY_DAYS) {
      status = "Active";
      meta = daysSince === 0 ? "Today" : `${daysSince} day(s) ago`;
      activeCount++;
    } else {
      status = "Inactive";
      meta = `${daysSince} days inactive`;
      inactiveCount++;
    }

    return {
      name: c.full_name,
      phone: c.phone || "",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=random`,
      orders: c.parcel_history?.total || 0,
      spent: c.parcel_history?.total_spent || 0,
      status,
      meta,
    };
  });

  const summaryStats = [
    {
      title: "All Customers",
      value: customers.length.toString(),
      icon: Users,
      subtitle: "Total customers in the system",
      color: "text-foreground",
    },
    {
      title: "Active",
      value: activeCount.toString(),
      icon: UserCheck,
      subtitle: "Ordered in last 30 days",
      color: "text-emerald-600",
    },
    {
      title: "Inactive",
      value: inactiveCount.toString(),
      icon: UserMinus,
      subtitle: "No recent activity",
      color: "text-amber-600",
    },
    {
      title: "Banned",
      value: bannedCount.toString(),
      icon: Ban,
      subtitle: "Permanently restricted",
      color: "text-destructive",
    },
    {
      title: "Top Spender",
      value: topSpender ? `৳${topSpender.spent.toLocaleString()}` : "৳0",
      icon: Trophy,
      subtitle: topSpender ? `${topSpender.name} — all time` : "No purchases yet",
      color: "text-primary",
    },
  ];

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
      <BestCustomersTable data={rankedCustomers} />

      {/* Active / Inactive / Banned — 3‑Column Card Grid */}
      <CustomerEngagementGrid data={engagementCustomers} />
    </div>
  );
}
