import { CreditCard, RefreshCw, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PurchaseStats({ data }: { data: any[] }) {
  const totalCustomers = data.length;
  const totalSpent = data.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.totalOrders, 0);

  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
  const repeatCustomers = data.filter((c) => c.totalOrders > 1).length;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      icon: Users,
      subtitle: "Customers with purchases",
    },
    {
      title: "Total Revenue",
      value: `৳${totalSpent.toLocaleString()}`,
      icon: CreditCard,
      subtitle: "Lifetime revenue",
    },
    {
      title: "Avg. Order Value",
      value: `৳${avgOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      subtitle: "Per order average",
    },
    {
      title: "Repeat Customers",
      value: repeatCustomers.toString(),
      icon: RefreshCw,
      subtitle: "Bought more than once",
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
            <CardDescription className="uppercase tracking-wider font-semibold text-xs mt-2">
              {stat.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
