"use client";

import { Banknote, Package, RefreshCcw, Truck, Undo2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSteadfastBalance } from "@/hooks/useSteadfastBalance";
import { useSteadfastReturns } from "@/hooks/useSteadfastReturns";
import { useSteadfastParcels } from "@/hooks/useSteadfastParcels";
import { useOrders } from "@/hooks/useOrders";
import { useSteadfastReturnedParcels } from "@/hooks/useSteadfastReturnedParcels";

export function SteadfastStats() {
  const { data: balanceData } = useSteadfastBalance();
  const { data: returnsData } = useSteadfastReturns();
  const { data: parcelsData } = useSteadfastParcels();
  const { pagination: ordersPagination } = useOrders({ page: 1, per_page: 1 });
  const { data: returnedParcelsData } = useSteadfastReturnedParcels({ page: 1, per_page: 1 });

  const stats = [
    {
      title: "Available Balance",
      value:
        balanceData?.current_balance !== undefined ? `৳${Number(balanceData.current_balance).toLocaleString()}` : "—",
      icon: Banknote,
      subtitle: "Current Steadfast balance",
    },
    {
      title: "Total Orders",
      value: ordersPagination?.total ?? "—",
      icon: Package,
      subtitle: "All system orders",
    },
    {
      title: "Sent to Steadfast",
      value: parcelsData?.data?.total ?? (Array.isArray(parcelsData?.data) ? parcelsData.data.length : "—"),
      icon: Truck,
      subtitle: "Parcels pushed to courier",
    },
    {
      title: "Return Requests",
      value: Array.isArray(returnsData) ? returnsData.length : "—",
      icon: RefreshCcw,
      subtitle: "Pending returns",
    },
    {
      title: "Returned Parcels",
      value:
        returnedParcelsData?.data?.total ??
        (Array.isArray(returnedParcelsData?.data) ? returnedParcelsData.data.length : "—"),
      icon: Undo2,
      subtitle: "Locally marked returned",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 dark:*:data-[slot=card]:bg-card">
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
