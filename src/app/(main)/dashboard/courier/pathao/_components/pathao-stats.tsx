"use client";

import { Package, PackageMinus, RefreshCcw, Truck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathaoParcels } from "@/hooks/usePathaoParcels";
import { useOrders } from "@/hooks/useOrders";

export function PathaoStats() {
  const { data: parcelsData, isLoading: loadingParcels } = usePathaoParcels();
  const { pagination: ordersPagination, isLoading: loadingOrders } = useOrders({ page: 1, per_page: 1 });

  const totalSystemOrders = ordersPagination?.total ?? 0;
  const totalParcels = parcelsData?.data?.total ?? (Array.isArray(parcelsData?.data) ? parcelsData.data.length : 0);

  // Filter dynamic counts if we have the items list array
  const listItems = Array.isArray(parcelsData?.data?.data)
    ? parcelsData.data.data
    : Array.isArray(parcelsData?.data)
      ? parcelsData.data
      : [];

  const returnedCount = listItems.filter(
    (p: any) => p.parcel_status === "returned" || p.status === "returned"
  ).length;

  const notAddedCount = Math.max(0, totalSystemOrders - totalParcels);

  const stats = [
    {
      title: "Total System Orders",
      value: loadingOrders ? "..." : totalSystemOrders.toLocaleString(),
      icon: Package,
      subtitle: "All orders in dashboard",
    },
    {
      title: "Not Shipped Yet",
      value: loadingOrders || loadingParcels ? "..." : notAddedCount.toLocaleString(),
      icon: PackageMinus,
      subtitle: "Pending courier assignment",
    },
    {
      title: "Sent to Pathao",
      value: loadingParcels ? "..." : totalParcels.toLocaleString(),
      icon: Truck,
      subtitle: "Registered consignments",
    },
    {
      title: "Returned Parcels",
      value: loadingParcels ? "..." : returnedCount.toLocaleString(),
      icon: RefreshCcw,
      subtitle: "Parcels marked returned",
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
