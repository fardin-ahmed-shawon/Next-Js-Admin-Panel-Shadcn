"use client";

import {
  Box,
  CheckCircle,
  Clock,
  LayoutGrid,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Activity
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function DokanxMetricCards() {
  const { user } = useAuth();
  const { data, isLoading } = useAdminDashboard();
  
  const metrics = data?.metrics;
  const orderOverview = data?.order_overview || {};

  const activeStatuses = ["Confirmed", "Ready To Ship", "In-Courier", "Hold", "Ship Later", "Pre-Order"];
  const activeOrdersTotal = activeStatuses.reduce((acc, status) => {
    return acc + (Number(orderOverview[status as keyof typeof orderOverview]) || 0);
  }, 0);

  const hasAccess = (module: string) => {
    if (!user) return false;
    if (user?.role?.role_name === "Admin") return true;
    return user?.role?.page_access && user.role.page_access[module as keyof typeof user.role.page_access] === 1;
  };

  const topCards = [
    {
      title: "Total Products",
      value: metrics?.total_products ?? 0,
      icon: Package,
      subtitle: "Total available products",
      trend: "+2",
      trendIcon: TrendingUp,
      trendType: "default",
      module: "products",
    },
    {
      title: "Product Categories",
      value: metrics?.total_categories ?? 0,
      icon: LayoutGrid,
      subtitle: "Active categories",
      trend: "+1",
      trendIcon: TrendingUp,
      trendType: "default",
      module: "categories",
    },
    {
      title: "Total Stock Unit",
      value: metrics?.total_stock ?? 0,
      icon: Box,
      subtitle: "Units currently in stock",
      trend: "-15",
      trendIcon: TrendingDown,
      trendType: "destructive",
      module: "inventory",
    },
    {
      title: "Customers",
      value: metrics?.customers ?? 0,
      icon: Users,
      subtitle: "Registered users",
      trend: "+3",
      trendIcon: TrendingUp,
      trendType: "default",
      module: "customers",
    },
    {
      title: "Total Purchased Unit",
      value: metrics?.total_purchased_unit ?? 0,
      icon: ShoppingCart,
      subtitle: "Items sold this month",
      trend: "+24%",
      trendIcon: TrendingUp,
      trendType: "default",
      module: "orders",
    },
    {
      title: "Total Collection",
      value: `৳ ${metrics?.total_collection?.toLocaleString() ?? 0}`,
      icon: Wallet,
      subtitle: "Revenue this month",
      trend: "+12.5%",
      trendIcon: TrendingUp,
      trendType: "default",
      module: "accounts",
    },
    {
      title: "Pending Orders",
      value: metrics?.pending_orders ?? 0,
      icon: Clock,
      subtitle: "Awaiting processing",
      trend: "-5%",
      trendIcon: TrendingDown,
      trendType: "destructive",
      module: "orders",
    },
    {
      title: "Active Orders",
      value: activeOrdersTotal,
      icon: Activity,
      subtitle: "Currently active orders",
      trend: "+8%",
      trendIcon: TrendingUp,
      trendType: "default",
      module: "orders",
    },
  ];

  const allowedCards = topCards.filter((card) => {
    if (card.module === "accounts") {
      return hasAccess("accounts") || hasAccess("revenue");
    }
    return hasAccess(card.module);
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {allowedCards.map((card, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <card.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>{card.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
                {isLoading ? <Skeleton className="h-9 w-20" /> : card.value}
              </div>
              {/* Note: the trends are static for now as API does not provide trend data */}
              <Badge variant={card.trendType as "default" | "destructive"}>
                <card.trendIcon className="size-3 mr-1" />
                {card.trend}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
