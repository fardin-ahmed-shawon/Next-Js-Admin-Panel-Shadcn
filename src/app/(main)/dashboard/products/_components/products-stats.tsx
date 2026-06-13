"use client";

import { PackageCheck, PackageMinus, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useProducts from "@/hooks/useProducts";

export function ProductsStats() {
  const { stats, loading } = useProducts({ per_page: 1 });

  const statsData = [
    {
      title: "Total Products",
      value: stats?.total_products ?? 0,
      icon: ShoppingBag,
      subtitle: "All products in catalog",
    },
    {
      title: "Active Products",
      value: stats?.active_products ?? 0,
      icon: PackageCheck,
      subtitle: "Visible on storefront",
    },
    {
      title: "Inactive Products",
      value: stats?.inactive_products ?? 0,
      icon: PackageMinus,
      subtitle: "Hidden from storefront",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 lg:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {statsData.map((stat, i) => (
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
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {loading ? "..." : stat.value}
            </div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
