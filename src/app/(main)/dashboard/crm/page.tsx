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
  Crown,
  Tag,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useCustomers, useSegmentationRules, CustomerSegmentRule } from "@/hooks/useCustomers";
import { formatDate, getInitials, cn } from "@/lib/utils";

const DEFAULT_FALLBACK_RULES: CustomerSegmentRule[] = [
  {
    id: 1,
    key: "vip",
    name: "VIP Spenders",
    description: "Top spenders with high repeat orders and strong loyalty",
    color: "#f59e0b",
    priority: 1,
    min_order_value: 10000,
    min_orders_count: 5,
    recency_days_max: 90,
    min_delivery_success_rate: 70,
    is_active: true,
  },
  {
    id: 2,
    key: "high_value",
    name: "High Value Customer",
    description: "High basket size spenders who make substantial purchases",
    color: "#8b5cf6",
    priority: 2,
    min_order_value: 8000,
    max_order_value: 14999.99,
    recency_days_max: 90,
    is_active: true,
  },
  {
    id: 3,
    key: "returning",
    name: "Repeat Buyers",
    description: "Customers who placed 2 or more orders with steady engagement",
    color: "#3b82f6",
    priority: 3,
    min_orders_count: 2,
    recency_days_max: 60,
    min_delivery_success_rate: 60,
    is_active: true,
  },
  {
    id: 4,
    key: "new",
    name: "New Buyers",
    description: "Recently acquired buyers who placed their first order within 30 days",
    color: "#10b981",
    priority: 4,
    min_orders_count: 1,
    max_orders_count: 1,
    recency_days_max: 30,
    is_active: true,
  },
  {
    id: 5,
    key: "inactive",
    name: "At-Risk (Inactive)",
    description: "Past buyers who have not placed any order in 60+ days",
    color: "#a855f7",
    priority: 5,
    min_orders_count: 1,
    recency_days_min: 60,
    is_active: true,
  },
  {
    id: 6,
    key: "lost",
    name: "Return Risk",
    description: "Customers with higher return rates or prolonged churn",
    color: "#ef4444",
    priority: 6,
    max_return_rate: 30,
    recency_days_min: 90,
    is_active: true,
  },
  {
    id: 7,
    key: "low_value",
    name: "Low Value Customer",
    description: "Buyers with total lifetime purchase value below ৳1,000",
    color: "#64748b",
    priority: 7,
    max_order_value: 1000,
    max_orders_count: 1,
    is_active: true,
  },
];

// Human-readable criteria summary generator
function getRuleCriteriaSummary(rule: any): string {
  const parts: string[] = [];
  if (rule.min_order_value && rule.max_order_value) {
    parts.push(`Spend ৳${Number(rule.min_order_value).toLocaleString()} - ৳${Number(rule.max_order_value).toLocaleString()}`);
  } else if (rule.min_order_value) {
    parts.push(`Spend ৳${Number(rule.min_order_value).toLocaleString()}+`);
  } else if (rule.max_order_value) {
    parts.push(`Spend under ৳${Number(rule.max_order_value).toLocaleString()}`);
  }

  if (rule.min_orders_count && rule.max_orders_count) {
    parts.push(`${rule.min_orders_count}-${rule.max_orders_count} orders`);
  } else if (rule.min_orders_count) {
    parts.push(`${rule.min_orders_count}+ orders`);
  } else if (rule.max_orders_count) {
    parts.push(`≤ ${rule.max_orders_count} orders`);
  }

  if (rule.recency_days_max && rule.recency_days_min) {
    parts.push(`Last order ${rule.recency_days_min}-${rule.recency_days_max}d ago`);
  } else if (rule.recency_days_max) {
    parts.push(`Joined/ordered in last ${rule.recency_days_max}d`);
  } else if (rule.recency_days_min) {
    parts.push(`No purchases in ${rule.recency_days_min}+ days`);
  }

  if (rule.min_delivery_success_rate) {
    parts.push(`${rule.min_delivery_success_rate}%+ success`);
  }
  if (rule.max_return_rate) {
    parts.push(`Return rate above ${rule.max_return_rate}%`);
  }

  return parts.length > 0 ? parts.join(" • ") : (rule.description || "Active criteria");
}

function getRuleTag(key: string): string {
  switch (key) {
    case "vip":
      return "VIP Tier";
    case "high_value":
      return "High Value";
    case "returning":
      return "Loyal";
    case "new":
      return "Recent";
    case "inactive":
      return "Re-engage";
    case "lost":
      return "High Risk";
    case "low_value":
      return "Budget";
    default:
      return "Segment";
  }
}

function getRuleFooterNote(key: string, count: number, percent: number): string {
  if (key === "lost" || key === "return_risk") {
    return count > 0 ? "Caution on COD" : "Zero risk";
  }
  if (key === "inactive" || key === "at_risk") {
    return count > 0 ? "Win-back target" : "0% of base";
  }
  return `${percent}% of base`;
}

function getSegmentIcon(key: string, className = "size-4") {
  switch (key) {
    case "vip":
      return <Crown className={className} />;
    case "high_value":
      return <Sparkles className={className} />;
    case "returning":
      return <RotateCcw className={className} />;
    case "new":
      return <Calendar className={className} />;
    case "inactive":
      return <Clock className={className} />;
    case "lost":
      return <UserX className={className} />;
    case "low_value":
      return <Tag className={className} />;
    default:
      return <Users className={className} />;
  }
}

export default function CrmDashboardPage() {
  const { data: response, isLoading, error } = useCustomers();
  const rawCustomers: any[] = response?.data || [];

  const { rules: fetchedRules = [], isLoading: isRulesLoading } = useSegmentationRules();
  const segmentationRules = React.useMemo(() => {
    return fetchedRules && fetchedRules.length > 0 ? fetchedRules : DEFAULT_FALLBACK_RULES;
  }, [fetchedRules]);

  // Evaluate dynamic customer segmentation using actual admin rules
  const { segmentCounts } = React.useMemo(() => {
    const activeRules = [...(segmentationRules || [])]
      .filter((r) => r.is_active)
      .sort((a, b) => a.priority - b.priority);

    const counts: Record<string, number> = { all: rawCustomers.length };
    activeRules.forEach((r) => {
      counts[r.key] = 0;
    });

    rawCustomers.forEach((c: any) => {
      const orders = c.orders || [];
      const orderCount = orders.length;
      const spent = orders.reduce((sum: number, o: any) => sum + Number(o.grand_total_amount || 0), 0);
      let productsCount = 0;
      orders.forEach((o: any) => {
        if (o.ordered_products && Array.isArray(o.ordered_products)) {
          o.ordered_products.forEach((p: any) => {
            productsCount += Number(p.qty || 1);
          });
        }
      });
      if (c.segment_metrics?.products_count !== undefined) {
        productsCount = c.segment_metrics.products_count;
      }

      const delivered = orders.filter((o: any) => o.order_status === "Delivered").length;
      const returned = orders.filter((o: any) =>
        ["Returned", "Partial", "Pending-Return"].includes(o.order_status) || Boolean(o.is_partial_return)
      ).length;

      const successRate = orderCount > 0 ? Math.round((delivered / orderCount) * 100) : 0;
      const returnRate = orderCount > 0 ? Math.round((returned / orderCount) * 100) : 0;

      let daysSinceLastOrder: number | null = null;
      if (orders.length > 0) {
        const timestamps = orders
          .map((o: any) => new Date(o.created_at).getTime())
          .filter((t: number) => !isNaN(t));
        if (timestamps.length > 0) {
          const lastOrderDate = new Date(Math.max(...timestamps));
          const diffMs = new Date().getTime() - lastOrderDate.getTime();
          daysSinceLastOrder = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      // Check matching rule dynamically against active rules
      let matchedRule: CustomerSegmentRule | null = null;
      for (const rule of activeRules) {
        let isMatch = true;

        if (rule.min_order_value !== null && rule.min_order_value !== undefined && spent < rule.min_order_value) isMatch = false;
        if (rule.max_order_value !== null && rule.max_order_value !== undefined && spent > rule.max_order_value) isMatch = false;
        if (rule.min_orders_count !== null && rule.min_orders_count !== undefined && orderCount < rule.min_orders_count) isMatch = false;
        if (rule.max_orders_count !== null && rule.max_orders_count !== undefined && orderCount > rule.max_orders_count) isMatch = false;
        if (rule.min_products_count !== null && rule.min_products_count !== undefined && productsCount < rule.min_products_count) isMatch = false;
        if (rule.max_products_count !== null && rule.max_products_count !== undefined && productsCount > rule.max_products_count) isMatch = false;
        if (rule.recency_days_min !== null && rule.recency_days_min !== undefined) {
          if (daysSinceLastOrder === null || daysSinceLastOrder < rule.recency_days_min) isMatch = false;
        }
        if (rule.recency_days_max !== null && rule.recency_days_max !== undefined) {
          if (daysSinceLastOrder === null || daysSinceLastOrder > rule.recency_days_max) isMatch = false;
        }
        if (rule.min_delivery_success_rate !== null && rule.min_delivery_success_rate !== undefined && successRate < rule.min_delivery_success_rate) isMatch = false;
        if (rule.max_return_rate !== null && rule.max_return_rate !== undefined && returnRate > rule.max_return_rate) isMatch = false;

        if (isMatch) {
          matchedRule = rule;
          break;
        }
      }

      const segmentKey = matchedRule ? matchedRule.key : "returning";
      if (counts[segmentKey] !== undefined) {
        counts[segmentKey]++;
      }
    });

    return { segmentCounts: counts };
  }, [rawCustomers, segmentationRules]);

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
          <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {segmentationRules.filter((r) => r.is_active).map((rule) => {
              const count = segmentCounts[rule.key] || 0;
              const percent = crmAnalytics.totalCustomers > 0 ? Math.round((count / crmAnalytics.totalCustomers) * 100) : 0;
              const tag = getRuleTag(rule.key);
              const criteria = getRuleCriteriaSummary(rule);
              const footerNote = getRuleFooterNote(rule.key, count, percent);
              const isHighRisk = rule.key === "lost";

              return (
                <Link
                  key={rule.key}
                  href={`/dashboard/crm/segmentation?segment=${rule.key}`}
                  className="rounded-xl border p-4 bg-card hover:border-primary/50 hover:shadow-sm transition-all group shadow-2xs flex flex-col justify-between hover:-translate-y-0.5"
                  style={{
                    borderColor: `${rule.color}35`,
                  }}
                >
                  <div className="space-y-2">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className="size-8 rounded-lg flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: `${rule.color}15`,
                          color: rule.color,
                        }}
                      >
                        {getSegmentIcon(rule.key, "size-4")}
                      </span>
                      <Badge
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                        style={{
                          backgroundColor: `${rule.color}18`,
                          color: rule.color,
                          borderColor: `${rule.color}35`,
                        }}
                      >
                        {tag}
                      </Badge>
                    </div>

                    {/* Middle: Title + Criteria */}
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {rule.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1" title={criteria}>
                      {criteria}
                    </p>
                  </div>

                  {/* Divider & Bottom: Count + % of base */}
                  <div className="pt-3 border-t mt-3 flex items-baseline justify-between">
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        isHighRisk ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      )}
                    >
                      {count}
                    </span>
                    <span
                      className={cn(
                        "text-[11px]",
                        isHighRisk ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {footerNote}
                    </span>
                  </div>
                </Link>
              );
            })}
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
