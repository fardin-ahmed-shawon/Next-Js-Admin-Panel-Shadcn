import { Activity, Clock, FileWarning, Ticket } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Coupons",
    value: "128",
    icon: Ticket,
    subtitle: "All coupons in the system",
  },
  {
    title: "Active",
    value: "45",
    icon: Activity,
    subtitle: "Currently valid coupons",
  },
  {
    title: "Expired",
    value: "72",
    icon: Clock,
    subtitle: "Past their validity period",
  },
  {
    title: "Usage Limited",
    value: "11",
    icon: FileWarning,
    subtitle: "Nearing usage limits",
  },
];

export function CouponsStats() {
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
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
