"use client";

import * as React from "react";
import { Activity, BadgePercent, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const DISCOUNT_API_URL = process.env.NEXT_PUBLIC_API_DISCOUNT_URL || "discounts";

// Helper function for discount-specific URLs
const getDiscountUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }

  const discountPath = DISCOUNT_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${discountPath}/${cleanPath}` : discountPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface DiscountsStatsProps {
  refreshTrigger?: number;
}

interface DiscountStats {
  total: number;
  active: number;
  freeShipping: number;
}

export function DiscountsStats({ refreshTrigger }: DiscountsStatsProps) {
  const [stats, setStats] = React.useState<DiscountStats>({
    total: 0,
    active: 0,
    freeShipping: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const url = getDiscountUrl();
      console.log("Fetching stats from:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      console.log("Stats API Response:", data);

      // Handle different response structures
      let discountsData = [];
      if (data.data) {
        discountsData = data.data;
      } else if (Array.isArray(data)) {
        discountsData = data;
      } else if (data.discounts) {
        discountsData = data.discounts;
      }

      // Calculate statistics
      const total = discountsData.length;
      const active = discountsData.filter((d: any) => d.status === "active").length;

      // Count free shipping - handles both 1/0 and true/false
      const freeShipping = discountsData.filter((d: any) => {
        return d.has_free_shipping === 1 || d.has_free_shipping === true;
      }).length;

      console.log(`Stats calculated - Total: ${total}, Active: ${active}, Free Shipping: ${freeShipping}`);

      setStats({
        total,
        active,
        freeShipping,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const statItems = [
    {
      title: "Total Discounts",
      value: stats.total,
      icon: BadgePercent,
      subtitle: "All rules configured",
    },
    {
      title: "Active",
      value: stats.active,
      icon: Activity,
      subtitle: "Currently running rules",
    },
    {
      title: "Free Shipping",
      value: stats.freeShipping,
      icon: Truck,
      subtitle: "Rules offering free delivery",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="flex size-7 items-center justify-center rounded-lg border bg-muted">
                  <div className="size-4" />
                </div>
              </CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className="h-9 w-16 bg-muted rounded"></div>
              <p className="text-muted-foreground text-sm">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statItems.map((stat, i) => (
        <Card
          key={i}
          className="bg-linear-to-t from-primary/5 to-card shadow-xs hover:shadow-md transition-shadow duration-200"
        >
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <stat.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>{stat.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
