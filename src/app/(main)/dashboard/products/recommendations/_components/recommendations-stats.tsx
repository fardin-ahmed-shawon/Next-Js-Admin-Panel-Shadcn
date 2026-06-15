"use client";

import { ArrowRightLeft, Package, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useProductRecommendations } from "@/hooks/useProductRecommendations";

export function RecommendationsStats() {
  const { data, isLoading } = useProductRecommendations();

  // Derive stats from live data
  const totalRecs = data.length;
  const uniqueBaseProducts = new Set(data.map((r) => r.product_id)).size;
  const uniqueRecommended = new Set(data.map((r) => r.recommended_product_id)).size;
  const avgPerProduct = uniqueBaseProducts > 0 ? (totalRecs / uniqueBaseProducts).toFixed(1) : "0";

  const stats = [
    {
      title: "Total Recommendations",
      value: totalRecs,
      icon: Sparkles,
      subtitle: "Active product links",
    },
    {
      title: "Base Products",
      value: uniqueBaseProducts,
      icon: Package,
      subtitle: "Products with recommendations",
    },
    {
      title: "Recommended Products",
      value: uniqueRecommended,
      icon: ArrowRightLeft,
      subtitle: "Unique recommended items",
    },
    {
      title: "Avg. per Product",
      value: avgPerProduct,
      icon: TrendingUp,
      subtitle: "Recommendations per base product",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat, i) => (
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
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
                {stat.value}
              </div>
            )}
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
