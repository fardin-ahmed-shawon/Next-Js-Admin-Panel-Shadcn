import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Wallet, Banknote, RotateCcw, Ban } from "lucide-react";

interface ParcelReportStatsProps {
  stats?: {
    total_parcels: number;
    total_order_value: number;
    total_revenue_collected: number;
    delivery_success_rate: number;
    [key: string]: any;
  };
}

export function ParcelReportStats({ stats }: ParcelReportStatsProps) {
  const items = [
    {
      title: "Total Parcels",
      value: stats?.total_parcels || 0,
      icon: Package,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Order Value",
      value: stats?.total_order_value !== undefined ? `৳${stats.total_order_value.toLocaleString()}` : "৳0",
      icon: Banknote,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Revenue Collected",
      value: stats?.total_revenue_collected !== undefined ? `৳${stats.total_revenue_collected.toLocaleString()}` : "৳0",
      icon: Wallet,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Delivery Success Rate",
      value: stats?.delivery_success_rate !== undefined ? `${stats.delivery_success_rate}%` : "0%",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Return Rate",
      value: stats?.return_rate !== undefined ? `${stats.return_rate}%` : "0%",
      icon: RotateCcw,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Cancellation Rate",
      value: stats?.cancellation_rate !== undefined ? `${stats.cancellation_rate}%` : "0%",
      icon: Ban,
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
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
