import { ArrowDownRight, ArrowUpRight, HandCoins, Landmark } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Starting Balance",
    value: "৳2,450,000",
    subtitle: "At the start of period",
    icon: Landmark,
    valueClass: "text-muted-foreground",
  },
  {
    title: "Total In",
    value: "৳1,800,000",
    subtitle: "Total received",
    icon: ArrowDownRight,
    valueClass: "text-emerald-600 dark:text-emerald-500",
  },
  {
    title: "Total Out",
    value: "৳1,100,000",
    subtitle: "Total spent (Expenses + COGS)",
    icon: ArrowUpRight,
    valueClass: "text-destructive",
  },
  {
    title: "Ending Balance",
    value: "৳3,150,000",
    subtitle: "At the end of period",
    icon: HandCoins,
    valueClass: "text-foreground font-bold",
  },
];

export function StatementStats() {
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
