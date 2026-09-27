"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  TrendingUp,
  Clock,
  RotateCcw,
  Sparkles,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Award,
  Calendar,
  AlertTriangle,
  CreditCard,
  UserX,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useCustomers } from "@/hooks/useCustomers";
import { formatDate, getInitials } from "@/lib/utils";

export default function CrmDashboardPage() {
  const { data: response, isLoading, error } = useCustomers();
  const rawCustomers: any[] = response?.data || [];

  // Compute CRM Aggregates
  const crmAnalytics = React.useMemo(() => {
    const totalCustomers = rawCustomers.length;
    let totalLtv = 0;
    let repeatCustomersCount = 0;
    let totalOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let returnedOrdersCount = 0;

    const vipCustomers: any[] = [];
    const loyalCustomers: any[] = [];
    const newCustomers: any[] = [];
    const atRiskCustomers: any[] = [];
    const highReturnRiskCustomers: any[] = [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const allNotes: { customer: any; note: any }[] = [];

    rawCustomers.forEach((c) => {
      const orders = c.orders || [];
      const orderCount = orders.length;
      totalOrdersCount += orderCount;

      const spent = orders.reduce((sum: number, o: any) => sum + Number(o.grand_total_amount || 0), 0);
      totalLtv += spent;

      if (orderCount > 1) {
        repeatCustomersCount++;
      }

      const delivered = orders.filter((o: any) => o.order_status === "Delivered").length;
      const returned = orders.filter((o: any) =>
        ["Returned", "Partial", "Pending-Return"].includes(o.order_status) || Boolean(o.is_partial_return)
      ).length;

      deliveredOrdersCount += delivered;
      returnedOrdersCount += returned;

      const successRate = orderCount > 0 ? Math.round((delivered / orderCount) * 100) : 0;
      const returnRate = orderCount > 0 ? Math.round((returned / orderCount) * 100) : 0;

      // Extract notes
      const notes = c.notes || [];
      notes.forEach((n: any) => {
        allNotes.push({ customer: c, note: n });
      });

      const customerObj = {
        ...c,
        orderCount,
        spent,
        successRate,
        returnRate,
      };

      // Segmentation logic
      if (spent >= 10000 || orderCount >= 5) {
        vipCustomers.push(customerObj);
      } else if (orderCount >= 2 && successRate >= 60) {
        loyalCustomers.push(customerObj);
      }

      const createdAt = new Date(c.created_at || now);
      if (createdAt >= thirtyDaysAgo) {
        newCustomers.push(customerObj);
      }

      // Check last order date for at-risk
      const lastOrder = orders[0];
      const lastOrderDate = lastOrder ? new Date(lastOrder.created_at) : createdAt;
      if (lastOrderDate < sixtyDaysAgo && orderCount > 0) {
        atRiskCustomers.push(customerObj);
      }

      if (returnRate > 30 && orderCount > 0) {
        highReturnRiskCustomers.push(customerObj);
      }
    });

    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomersCount / totalCustomers) * 100) : 0;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalLtv / totalOrdersCount) : 0;
    const avgLtv = totalCustomers > 0 ? Math.round(totalLtv / totalCustomers) : 0;

    // Top VIPs sorted by spent
    const topVipCustomers = [...rawCustomers]
      .map((c) => {
        const orders = c.orders || [];
        const spent = orders.reduce((sum: number, o: any) => sum + Number(o.grand_total_amount || 0), 0);
        return { ...c, spent, orderCount: orders.length };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    // Recent notes sorted by date desc
    allNotes.sort((a, b) => new Date(b.note.created_at || 0).getTime() - new Date(a.note.created_at || 0).getTime());

    return {
      totalCustomers,
      totalLtv,
      repeatRate,
      repeatCustomersCount,
      totalOrdersCount,
      avgOrderValue,
      avgLtv,
      vipCustomersCount: vipCustomers.length,
      loyalCustomersCount: loyalCustomers.length,
      newCustomersCount: newCustomers.length,
      atRiskCustomersCount: atRiskCustomers.length,
      highReturnRiskCount: highReturnRiskCustomers.length,
      topVipCustomers,
      recentNotes: allNotes.slice(0, 5),
    };
  }, [rawCustomers]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              Customer Intelligence
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Holistic relationship metrics, lifetime value, segmentation cohorts, and follow-up activities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/crm/follow-ups">
              <PhoneCall className="mr-2 size-3.5" /> Follow-Ups
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/crm/segmentation">
              <Sparkles className="mr-2 size-3.5 text-amber-500" /> Segmentation
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/customers">
              <Users className="mr-2 size-3.5" /> All Customers
            </Link>
          </Button>
        </div>
      </div>

      {/* Top 4 Core Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Customer Base
            </CardTitle>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {crmAnalytics.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>{crmAnalytics.totalOrdersCount} total orders recorded</span>
            </p>
          </CardContent>
        </Card>

        {/* Customer Lifetime Value */}
        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customer Lifetime Value
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ৳{crmAnalytics.totalLtv.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average ৳{crmAnalytics.avgLtv.toLocaleString()} per customer
            </p>
          </CardContent>
        </Card>

        {/* Repeat Customer Rate */}
        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Repeat Purchase Rate
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <RotateCcw className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {crmAnalytics.repeatRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {crmAnalytics.repeatCustomersCount} buyers purchased 2+ times
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Order Value (AOV)
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ৳{crmAnalytics.avgOrderValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all customer transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segmentation Cohorts */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <span>Customer Segmentation Cohorts</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Targeted behavioral clusters for retention, personalized re-engagement, and risk mitigation.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/crm/segmentation">
                View All Segments <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* VIP High Spenders */}
            <Link
              href="/dashboard/crm/segmentation?tab=vip"
              className="rounded-xl border p-4 bg-card hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Award className="size-4" />
                  </span>
                  <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px]">
                    VIP Tier
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-amber-600 transition-colors">
                  VIP Spenders
                </h4>
                <p className="text-xs text-muted-foreground">Spend ৳10,000+ or 5+ orders</p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {crmAnalytics.vipCustomersCount}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {crmAnalytics.totalCustomers > 0 ? Math.round((crmAnalytics.vipCustomersCount / crmAnalytics.totalCustomers) * 100) : 0}% of base
                </span>
              </div>
            </Link>

            {/* Loyal Customers */}
            <Link
              href="/dashboard/crm/segmentation?tab=loyal"
              className="rounded-xl border p-4 bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <UserCheck className="size-4" />
                  </span>
                  <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]">
                    Loyal
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                  Repeat Buyers
                </h4>
                <p className="text-xs text-muted-foreground">2+ orders & 60%+ success</p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {crmAnalytics.loyalCustomersCount}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {crmAnalytics.totalCustomers > 0 ? Math.round((crmAnalytics.loyalCustomersCount / crmAnalytics.totalCustomers) * 100) : 0}% of base
                </span>
              </div>
            </Link>

            {/* New Customers */}
            <Link
              href="/dashboard/crm/segmentation?tab=new"
              className="rounded-xl border p-4 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Calendar className="size-4" />
                  </span>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                    Recent
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                  New Buyers
                </h4>
                <p className="text-xs text-muted-foreground">Joined within last 30 days</p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {crmAnalytics.newCustomersCount}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {crmAnalytics.totalCustomers > 0 ? Math.round((crmAnalytics.newCustomersCount / crmAnalytics.totalCustomers) * 100) : 0}% of base
                </span>
              </div>
            </Link>

            {/* At-Risk / Inactive */}
            <Link
              href="/dashboard/crm/segmentation?tab=at_risk"
              className="rounded-xl border p-4 bg-card hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Clock className="size-4" />
                  </span>
                  <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]">
                    Re-engage
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                  At-Risk (Inactive)
                </h4>
                <p className="text-xs text-muted-foreground">No purchases in 60+ days</p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {crmAnalytics.atRiskCustomersCount}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Win-back target
                </span>
              </div>
            </Link>

            {/* High Return Risk */}
            <Link
              href="/dashboard/crm/segmentation?tab=high_risk"
              className="rounded-xl border p-4 bg-card hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <ShieldAlert className="size-4" />
                  </span>
                  <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]">
                    High Risk
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-rose-600 transition-colors">
                  Return Risk
                </h4>
                <p className="text-xs text-muted-foreground">Return rate above 30%</p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {crmAnalytics.highReturnRiskCount}
                </span>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  Caution on COD
                </span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Top VIP Customers + Recent CRM Activity Notes */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Top 5 High-Value Customers (7 cols) */}
        <Card className="lg:col-span-7 border-border shadow-sm">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="size-4 text-amber-500" />
                <span>Top VIP Clients by Spend</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Highest lifetime value customers generating the most revenue.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/customers" className="text-xs gap-1">
                View All <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {crmAnalytics.topVipCustomers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No customer transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {crmAnalytics.topVipCustomers.map((cust, idx) => (
                  <div
                    key={cust.id}
                    className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-muted-foreground w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <Avatar className="size-9 border shrink-0">
                        <AvatarImage src={cust.avatar} alt={cust.full_name} />
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {getInitials(cust.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/customers/${cust.id}`}
                          className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {cust.full_name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground truncate">{cust.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          ৳{cust.spent.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {cust.orderCount} {cust.orderCount === 1 ? "order" : "orders"}
                        </p>
                      </div>

                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 font-medium" asChild>
                        <Link href={`/dashboard/customers/${cust.id}`}>
                          360 View <ExternalLink className="ml-1 size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent CRM Staff Notes & Activity Stream (5 cols) */}
        <Card className="lg:col-span-5 border-border shadow-sm">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <span>Recent Staff Notes</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Latest interaction memos entered by support & sales team.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/crm/follow-ups" className="text-xs gap-1">
                Queue <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {crmAnalytics.recentNotes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
                <MessageSquare className="size-8 text-muted-foreground/40 stroke-1" />
                <p>No recent administrative notes recorded.</p>
                <p className="text-[11px]">Notes added on customer profiles will appear here in real-time.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {crmAnalytics.recentNotes.map((item, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-muted/30 transition-colors space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/customers/${item.customer.id}`}
                        className="font-semibold text-primary hover:underline truncate"
                      >
                        {item.customer.full_name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDate(item.note.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-foreground bg-muted/40 p-2 rounded border leading-relaxed">
                      &ldquo;{item.note.note}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>Logged by: <strong className="text-foreground">{item.note.admin_name || "Admin"}</strong></span>
                      <Link
                        href={`/dashboard/customers/${item.customer.id}`}
                        className="text-primary hover:underline font-medium text-[11px]"
                      >
                        360 View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
