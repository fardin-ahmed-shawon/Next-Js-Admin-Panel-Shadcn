import { ArrowUpRight, DollarSign, Ellipsis, Package, ShoppingCart, UserCheck, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderRow {
  id: string; customer: string; phone: string; items: number; total: number;
  orderStatus: string; paymentStatus: string; date: string; avatar: string;
  category: string; subCategory: string;
}

export function OrderStats({ data }: { data: OrderRow[] }) {
  const totalOrders = data.length;
  const totalValue = data.reduce((s, o) => s + o.total, 0);
  const totalProducts = new Set(data.map((o) => o.category + o.subCategory)).size;
  const totalUnits = data.reduce((s, o) => s + o.items, 0);

  const customerCounts = new Map<string, number>();
  data.forEach((o) => customerCounts.set(o.phone, (customerCounts.get(o.phone) || 0) + 1));
  const newCustomers = [...customerCounts.values()].filter((c) => c === 1).length;
  const repeatedCustomers = [...customerCounts.values()].filter((c) => c > 1).length;

  const stats = [
    { title: "Total Orders",    value: totalOrders.toLocaleString(),       icon: Package,      trend: "+8.3%",  from: "—",                              period: "selected range" },
    { title: "Order Value",     value: `৳${totalValue.toLocaleString()}`,  icon: DollarSign,   trend: "+15.8%", from: `৳${Math.round(totalValue * 0.86).toLocaleString()}`, period: "prev period" },
    { title: "Product Types",   value: totalProducts.toLocaleString(),     icon: ShoppingCart, trend: "+4.1%",  from: `${Math.max(0, totalProducts - 1)}`,  period: "prev period" },
    { title: "Purchased Units", value: totalUnits.toLocaleString(),        icon: Package,      trend: "+12.5%", from: `${Math.round(totalUnits * 0.89)}`,   period: "prev period" },
    { title: "New Customers",   value: newCustomers.toLocaleString(),      icon: UserPlus,     trend: "+6.2%",  from: `${Math.max(0, newCustomers - 1)}`,   period: "prev period" },
    { title: "Repeat Customers",value: repeatedCustomers.toLocaleString(), icon: UserCheck,    trend: "+3.7%",  from: `${Math.max(0, repeatedCustomers - 1)}`, period: "prev period" },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <Ellipsis className="size-4" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-2xl leading-none tracking-tight">{stat.value}</div>
                <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                  <ArrowUpRight />
                  {stat.trend}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>from <span className="text-foreground">{stat.from}</span></span>
                <span>•</span>
                <span>{stat.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
