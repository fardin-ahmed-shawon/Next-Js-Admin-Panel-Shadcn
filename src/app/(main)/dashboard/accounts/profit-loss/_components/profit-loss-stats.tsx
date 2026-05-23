import { ArrowDownRight, ArrowUpRight, DollarSign, PackageOpen, Percent, TrendingUp } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Revenue",
    value: "৳24,560,000",
    subtitle: "+12% from last year",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Total COGS",
    value: "৳6,140,000",
    subtitle: "Cost of goods sold",
    icon: PackageOpen,
    trend: "up",
  },
  {
    title: "Total Expenses",
    value: "৳9,090,000",
    subtitle: "+5% from last year",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Net Profit",
    value: "৳9,330,000",
    subtitle: "+22% from last year",
    icon: ArrowUpRight,
    trend: "up",
    valueClass: "text-emerald-600 dark:text-emerald-500",
  },
];

export function ProfitLossStats() {
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
