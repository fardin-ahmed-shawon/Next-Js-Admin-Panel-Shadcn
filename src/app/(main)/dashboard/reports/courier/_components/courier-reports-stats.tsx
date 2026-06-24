import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, AlertCircle, TrendingUp } from "lucide-react";
import { CourierAnalyticsResponse } from "@/hooks/useCourierAnalytics";

interface CourierReportsStatsProps {
  stats?: CourierAnalyticsResponse["stats"];
}

export function CourierReportsStats({ stats }: CourierReportsStatsProps) {
  if (!stats) return null;

  // Find dynamic courier distribution keys
  const courierKeys = Object.keys(stats).filter(
    (key) => key.endsWith("_distribution_count") && key !== "not_distributed_count"
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Orders Card */}
      <Card className="overflow-hidden border-none bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          <div className="p-2 rounded-full bg-blue-500/10">
            <Package className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_orders || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Total orders across the platform</p>
        </CardContent>
      </Card>

      {/* Dynamic Courier Cards */}
      {courierKeys.map((key) => {
        const courierName = key.split("_")[0];
        const formattedName = courierName.charAt(0).toUpperCase() + courierName.slice(1);
        const count = stats[key] || 0;
        const percentageKey = key.replace("_count", "_percentage");
        const percentage = stats[percentageKey] || 0;

        return (
          <Card key={key} className="overflow-hidden border-none bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {formattedName} Distribution
              </CardTitle>
              <div className="p-2 rounded-full bg-emerald-500/10">
                <Truck className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="size-3" />
                {percentage}% of total orders
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Not Distributed Card */}
      <Card className="overflow-hidden border-none bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Not Distributed</CardTitle>
          <div className="p-2 rounded-full bg-rose-500/10">
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.not_distributed_count || 0}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="size-3" />
            {stats.not_distributed_percentage || 0}% of total orders
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
