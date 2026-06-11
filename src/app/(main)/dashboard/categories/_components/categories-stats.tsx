"use client";

import { FolderTree, Layers, LayoutGrid } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useCategories from "@/hooks/useCategories";

export function CategoriesStats() {
  const { categories, stats: apiStats, loading } = useCategories();

  // Compute counts from live data or use API stats
  const mainCount = apiStats?.main || categories.length;
  const subCount = apiStats?.sub || categories.reduce((acc, cat) => acc + (cat["sub-categories"]?.length ?? 0), 0);
  const totalCount = apiStats?.total || mainCount + subCount;

  const stats = [
    {
      title: "Total Categories",
      value: loading ? "—" : String(totalCount),
      icon: Layers,
      subtitle: "All categories combined",
    },
    {
      title: "Total Main Categories",
      value: loading ? "—" : String(mainCount),
      icon: LayoutGrid,
      subtitle: "Top-level categories",
    },
    {
      title: "Total Sub Categories",
      value: loading ? "—" : String(subCount),
      icon: FolderTree,
      subtitle: "Nested under main categories",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 dark:*:data-[slot=card]:bg-card">
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
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
