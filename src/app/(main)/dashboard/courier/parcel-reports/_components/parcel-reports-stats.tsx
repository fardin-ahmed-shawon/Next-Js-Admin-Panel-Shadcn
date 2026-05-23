import { Banknote, Package, RefreshCcw, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { OrderRow } from "./parcel-reports-table";

export function ParcelReportsStats({ data }: { data: OrderRow[] }) {
  const totalParcels = data.length;
  const deliveredParcels = data.filter(
    (d) => d.orderStatus === "Delivered" || d.parcelStatus === "Delivered" || d.orderStatus === "Shipped",
  );
  const successRate = totalParcels > 0 ? ((deliveredParcels.length / totalParcels) * 100).toFixed(1) + "%" : "0.0%";

  const totalRevenue = deliveredParcels.reduce((sum, d) => {
    const val = parseFloat(d.amount.replace(/[^0-9.-]+/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const formattedRevenue = `৳ ${totalRevenue.toLocaleString()}`;

  const returnedParcels = data.filter((d) => d.orderStatus === "Returned" || d.parcelStatus === "Returned").length;
  const returnRate = totalParcels > 0 ? ((returnedParcels / totalParcels) * 100).toFixed(1) + "%" : "0.0%";

  const stats = [
    {
      title: "Total Parcels",
      value: totalParcels.toLocaleString(),
      icon: Package,
      subtitle: "Across all couriers",
    },
    {
      title: "Delivery Success Rate",
      value: successRate,
      icon: TrendingUp,
      subtitle: "Consistently delivered",
    },
    {
      title: "Total Revenue Collected",
      value: formattedRevenue,
      icon: Banknote,
      subtitle: "From COD parcels",
    },
    {
      title: "Return Rate",
      value: returnRate,
      icon: RefreshCcw,
      subtitle: "Parcels returned to sender",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat, i) => (
        <Card key={i} data-slot="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <stat.icon className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
