import * as React from "react";
import { DollarSign, Package, Package2, Repeat2, ShoppingCart, UserPlus, Users } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderContext } from "../page";

export function OrderStats({ data }: { data?: any[] }) {
  const context = React.useContext(OrderContext);
  const summary = context?.summary;

  const totalOrders = data ? data.length : (summary?.total_orders || 0);
  const totalValue = data ? data.reduce((s, o) => s + o.total, 0) : (summary?.total_value || 0);
  const totalProducts = data ? new Set(data.map((o) => o.category + o.subCategory)).size : (summary?.total_products || 0);
  const totalUnits = data ? data.reduce((s, o) => s + o.items, 0) : (summary?.total_units || 0);

  const customerCounts = new Map<string, number>();
  if (data) {
    data.forEach((o) => customerCounts.set(o.phone, (customerCounts.get(o.phone) || 0) + 1));
  }
  const newCustomers = data ? [...customerCounts.values()].filter((c) => c === 1).length : (summary?.new_customers || 0);
  const repeatedCustomers = data ? [...customerCounts.values()].filter((c) => c > 1).length : (summary?.repeat_customers || 0);

  const stats = [
    { title: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingCart },
    { title: "Order Value", value: `৳${totalValue.toLocaleString()}`, icon: DollarSign },
    { title: "Product Types", value: totalProducts.toLocaleString(), icon: Package },
    { title: "Purchased Units", value: totalUnits.toLocaleString(), icon: Package2 },
    { title: "New Customers", value: newCustomers.toLocaleString(), icon: UserPlus },
    { title: "Repeat Customers", value: repeatedCustomers.toLocaleString(), icon: Repeat2 },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-3 xl:grid-cols-6 xl:[&>*]:border-b-0 xl:[&>*:not(:last-child)]:border-r xl:[&>*:last-child]:border-r-0">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
