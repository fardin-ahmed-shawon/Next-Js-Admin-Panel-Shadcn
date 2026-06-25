import { Archive, BarChart4, CheckCircle, ClipboardList, TrendingUp } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductPercentSummary } from "@/hooks/useProductPercentReports";

interface ProductPercentStatsProps {
  summary?: ProductPercentSummary;
}

export function ProductPercentStats({ summary }: ProductPercentStatsProps) {
  const totalProducts = summary?.total_products || 0;

  // Find top status percentages to show in extra cards
  const statuses = [
    { label: "Pending", data: summary?.pending, icon: ClipboardList, color: "text-amber-500" },
    { label: "Confirmed", data: summary?.confirmed, icon: CheckCircle, color: "text-blue-500" },
    { label: "Delivered", data: summary?.delivered, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Returned", data: summary?.returned, icon: Archive, color: "text-purple-500" },
    { label: "Cancelled", data: summary?.cancelled, icon: BarChart4, color: "text-red-500" },
  ];

  const mainStats = [
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      subtitle: "Unique items ordered",
      icon: Archive,
      color: "text-foreground",
    },
  ];

  const statusStats = statuses.map((s) => ({
    title: `${s.label} Rate`,
    value: `${s.data?.percentage || 0}%`,
    subtitle: `${s.data?.count || 0} orders`,
    icon: s.icon,
    color: s.color,
  }));

  const stats = [...mainStats, ...statusStats];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div
        className={`grid grid-cols-1 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b md:grid-cols-3 xl:grid-cols-6 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0`}
      >
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className={`size-4 ${stat.color}`} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className={`font-medium text-xl tabular-nums leading-none tracking-tight ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
