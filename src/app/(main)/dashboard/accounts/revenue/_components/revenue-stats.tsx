import { Banknote, Clock, DollarSign, Wallet } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Revenue",
    value: "৳3,499,320",
    subtitle: "All-time revenue",
    icon: Banknote,
  },
  {
    title: "This Month",
    value: "৳209,337",
    subtitle: "Current month revenue",
    icon: Wallet,
  },
  {
    title: "Today",
    value: "৳0",
    subtitle: "Today's revenue",
    icon: DollarSign,
  },
  {
    title: "Pending",
    value: "৳58,000",
    subtitle: "In transit or unpaid",
    icon: Clock,
  },
];

export function RevenueStats() {
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
              <div className="font-medium text-xl tabular-nums leading-none tracking-tight">{stat.value}</div>
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
