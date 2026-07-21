import * as React from "react";
import { DollarSign, Package, Package2, Repeat2, ShoppingCart, UserPlus, Users } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderContext } from "../page";

export function OrderStats() {
  const { summary } = React.useContext(OrderContext);

  const totalOrders = summary?.total_orders || 0;
  const totalValue = summary?.total_value || 0;
  const totalProducts = summary?.total_products || 0;
  const totalUnits = summary?.total_units || 0;
  const newCustomers = summary?.new_customers || 0;
  const repeatedCustomers = summary?.repeat_customers || 0;

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
