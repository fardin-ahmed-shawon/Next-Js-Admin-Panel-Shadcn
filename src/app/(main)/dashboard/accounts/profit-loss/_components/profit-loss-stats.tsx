"use client";

import { ArrowUpRight, DollarSign, PackageOpen, TrendingUp } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useProfitLoss from "@/hooks/useProfitLoss";

export function ProfitLossStats() {
  const { summary, isLoading } = useProfitLoss();

  const stats = [
    {
      title: "Total Revenue",
      value: isLoading ? "..." : `৳${Number(summary.total_revenue || 0).toLocaleString()}`,
      subtitle: "Gross income",
      icon: TrendingUp,
      valueClass: "text-foreground",
    },
    {
      title: "Total COGS",
      value: isLoading ? "..." : `৳${Number(summary.total_cogs || 0).toLocaleString()}`,
      subtitle: "Cost of goods sold",
      icon: PackageOpen,
      valueClass: "text-destructive",
    },
    {
      title: "Total Expenses",
      value: isLoading ? "..." : `৳${Number(summary.total_expenses || 0).toLocaleString()}`,
      subtitle: "Operating expenses",
      icon: DollarSign,
      valueClass: "text-destructive",
    },
    {
      title: "Net Profit",
      value: isLoading ? "..." : `৳${Number(summary.net_profit || 0).toLocaleString()}`,
      subtitle: "Final bottom line",
      icon: ArrowUpRight,
      valueClass: Number(summary.net_profit) < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-500",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-4 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className={`font-medium text-xl tabular-nums leading-none tracking-tight ${stat.valueClass || ""}`}>
                {stat.value}
              </div>
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
