import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, RotateCcw } from "lucide-react";

interface ParcelReportStatsProps {
  stats?: {
    total_parcels: number;
    total_delivered_parcel: number;
    total_returned_parcel: number;
    total_return_request: number;
  };
}

export function ParcelReportStats({ stats }: ParcelReportStatsProps) {
  const items = [
    {
      title: "Total Parcels",
      value: stats?.total_parcels || 0,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Delivered Parcels",
      value: stats?.total_delivered_parcel || 0,
      icon: Truck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Returned Parcels",
      value: stats?.total_returned_parcel || 0,
      icon: RotateCcw,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden border-none bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
