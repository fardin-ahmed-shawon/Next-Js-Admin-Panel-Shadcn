import { AlertCircle, Banknote, Layers, Package, TrendingUp, XCircle } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Products",
    value: "20",
    icon: Package,
    subtitle: "Total products listed",
  },
  {
    title: "Total Units",
    value: "972",
    icon: Layers,
    subtitle: "Items in stock",
  },
  {
    title: "Inventory Value",
    value: "৳11,066,728",
    icon: Banknote,
    subtitle: "Total stock worth",
  },
  {
    title: "Potential Profit",
    value: "৳10,612,728",
    icon: TrendingUp,
    subtitle: "Expected margin",
  },
  {
    title: "Low Stock",
    value: "2",
    icon: AlertCircle,
    subtitle: "Needs restocking soon",
  },
  {
    title: "Out of Stock",
    value: "0",
    icon: XCircle,
    subtitle: "Unavailable items",
  },
];

export function InventoryStats() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-3 xl:grid-cols-6 xl:[&>*]:border-b-0 xl:[&>*:not(:last-child)]:border-r xl:[&>*:last-child]:border-r-0">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className="font-medium text-xl tabular-nums leading-none tracking-tight">{stat.value}</div>
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
