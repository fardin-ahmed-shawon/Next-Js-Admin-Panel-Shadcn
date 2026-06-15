"use client";

import * as React from "react";
import { Activity, Clock, Ticket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const COUPON_API_URL = process.env.NEXT_PUBLIC_API_COUPON_URL || "coupons";

const getCouponUrl = (path: string = '') => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith('/')) baseUrl += '/';
  const couponPath = COUPON_API_URL.replace(/^\/|\/$/g, '');
  const cleanPath = path.replace(/^\/|\/$/g, '');
  const fullPath = cleanPath ? `${couponPath}/${cleanPath}` : couponPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface CouponsStatsProps {
  refreshTrigger?: number;
}

interface CouponStats {
  total: number;
  active: number;
  expired: number;
}

export function CouponsStats({ refreshTrigger }: CouponsStatsProps) {
  const [stats, setStats] = React.useState<CouponStats>({
    total: 0,
    active: 0,
    expired: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const url = getCouponUrl();
      const response = await fetch(url, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      let couponsData = [];
      if (data.data) couponsData = data.data;
      else if (Array.isArray(data)) couponsData = data;
      else if (data.coupons) couponsData = data.coupons;

      const now = new Date();
      
      // Active coupons: status is 'active' AND expiry_date is in the future
      const active = couponsData.filter((c: any) => {
        const isActive = c.status === 'active';
        const expiryDate = c.expiry_date ? new Date(c.expiry_date) : null;
        const isNotExpired = !expiryDate || expiryDate > now;
        return isActive && isNotExpired;
      }).length;
      
      // Expired coupons: expiry_date has passed (regardless of status)
      const expired = couponsData.filter((c: any) => {
        const expiryDate = c.expiry_date ? new Date(c.expiry_date) : null;
        return expiryDate && expiryDate <= now;
      }).length;

      setStats({
        total: couponsData.length,
        active,
        expired,
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
      title: "Total Coupons",
      value: stats.total,
      icon: Ticket,
      subtitle: "All coupons in the system",
    },
    {
      title: "Active",
      value: stats.active,
      icon: Activity,
      subtitle: "Currently valid coupons",
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: Clock,
      subtitle: "Past their validity period",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle><div className="flex size-7 items-center justify-center rounded-lg border bg-muted"><div className="size-4" /></div></CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent><div className="h-9 w-16 bg-muted rounded"></div></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statItems.map((stat, i) => (
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
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}