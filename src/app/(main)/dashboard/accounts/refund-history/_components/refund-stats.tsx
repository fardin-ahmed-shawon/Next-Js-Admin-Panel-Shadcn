import { HandCoins, PackageX, RefreshCcw, Undo2 } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Refunded Amount",
    value: "৳1,500",
    subtitle: "Total funds returned to customers",
    icon: Undo2,
    valueClass: "text-amber-600 dark:text-amber-500",
  },
  {
    title: "Refunded Orders",
    value: "2",
    subtitle: "Total orders with refunds",
    icon: PackageX,
  },
  {
    title: "Average Refund",
    value: "৳750",
    subtitle: "per refunded order",
    icon: HandCoins,
  },
  {
    title: "Pending Refunds",
    value: "1",
    subtitle: "Awaiting processing",
    icon: RefreshCcw,
  },
];

export function RefundStats() {
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
