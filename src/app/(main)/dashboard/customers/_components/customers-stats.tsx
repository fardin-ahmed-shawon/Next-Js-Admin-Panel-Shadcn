"use client";

import * as React from "react";
import {
  Users,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { CustomerRow } from "./customers-table";

export function CustomersStats({ data }: { data: CustomerRow[] }) {
  const totalCustomers = data.length;

  const registered = data.filter((c) => c.status === "Registered").length;

  const now = new Date();
  const newThisMonth = data.filter((c) => {
    if (!c.joinDate) return false;
    const d = new Date(c.joinDate);
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalRevenue = data.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrders = data.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgLtv = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  const avgAov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const repeatBuyers = data.filter((c) => c.totalOrders > 1).length;
  const repeatRate = totalCustomers > 0 ? Math.round((repeatBuyers / totalCustomers) * 100) : 0;

  const activeIn30d = data.filter((c) => c.daysSinceLastOrder !== null && c.daysSinceLastOrder <= 30).length;

  const customersWithOrders = data.filter((c) => c.totalOrders > 0);
  const avgDeliveryRate =
    customersWithOrders.length > 0
      ? Math.round(customersWithOrders.reduce((sum, c) => sum + (c.successRate || 0), 0) / customersWithOrders.length)
      : 100;
  const avgReturnRate =
    customersWithOrders.length > 0
      ? Math.round(customersWithOrders.reduce((sum, c) => sum + (c.returnRate || 0), 0) / customersWithOrders.length)
      : 0;

  const highReturnRiskCount = data.filter((c) => (c.returnRate || 0) > 30).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Customers */}
      <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Customer Base
          </CardTitle>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {totalCustomers.toLocaleString()}
            </div>
            {newThisMonth > 0 && (
              <Badge variant="secondary" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                +{newThisMonth} this month
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <UserCheck className="size-3 text-primary inline" />
            <span><strong>{registered.toLocaleString()}</strong> Registered Accounts (100%)</span>
          </p>
        </CardContent>
      </Card>

      {/* 2. Cumulative Revenue */}
      <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cumulative Revenue
          </CardTitle>
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CreditCard className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <Badge variant="outline" className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              AOV ৳{avgAov.toLocaleString()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Average customer LTV: <strong className="text-foreground">৳{avgLtv.toLocaleString()}</strong> across base
          </p>
        </CardContent>
      </Card>

      {/* 3. Repeat & Active Buyers */}
      <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Repeat & Retention
          </CardTitle>
          <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <RotateCcw className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {repeatBuyers.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">buyers</span>
            </div>
            <Badge variant="secondary" className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10">
              {repeatRate}% Repeat
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{activeIn30d}</strong> placed an order within last 30 days
          </p>
        </CardContent>
      </Card>

      {/* 4. Courier Delivery Success */}
      <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Fulfillment Reliability
          </CardTitle>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {avgDeliveryRate}%
              <span className="text-xs font-normal text-muted-foreground ml-1">Delivery</span>
            </div>
            {highReturnRiskCount > 0 ? (
              <Badge variant="outline" className="text-[10px] font-medium text-rose-600 dark:text-rose-400 border-rose-500/30">
                {highReturnRiskCount} High Risk
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Healthy Base
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Average return rate: <strong className="text-foreground">{avgReturnRate}%</strong> on dispatched parcels
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
