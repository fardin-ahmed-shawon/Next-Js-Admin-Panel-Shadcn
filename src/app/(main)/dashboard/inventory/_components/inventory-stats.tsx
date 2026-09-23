import { formatStockQuantity } from "@/lib/stock-quantity";
import { AlertCircle, Banknote, Layers, Package, TrendingUp, XCircle } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventorySummary } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryStatsProps {
  summary?: InventorySummary;
  loading?: boolean;
}

export function InventoryStats({ summary, loading }: InventoryStatsProps) {
  const stats = [
    {
      title: "Products",
      value: summary?.total_products?.toLocaleString() || "0",
      icon: Package,
      subtitle: "Total products listed",
    },
    {
      title: "Stock by unit",
      value: Object.entries(summary?.quantities_by_unit || {piece: summary?.total_units || 0}).map(([unit, quantity]) => <span key={unit} className="block text-base leading-normal">{formatStockQuantity(quantity, unit)}</span>),
      icon: Layers,
      subtitle: "Shared bulk stock counted once",
    },
    {
      title: "Inventory Value",
      value: `৳${(summary?.inventory_value || 0).toLocaleString()}`,
      icon: Banknote,
      subtitle: "Total stock worth",
    },
    {
      title: "Potential Profit",
      value: `৳${(summary?.potential_profit || 0).toLocaleString()}`,
      icon: TrendingUp,
      subtitle: summary?.potential_profit_excludes_bulk ? "Independent stock only; bulk margin depends on pack sales" : "Expected margin",
    },
    {
      title: "Low Stock",
      value: summary?.low_stock?.toLocaleString() || "0",
      icon: AlertCircle,
      subtitle: "Needs restocking soon",
    },
    {
      title: "Out of Stock",
      value: summary?.out_of_stock?.toLocaleString() || "0",
      icon: XCircle,
      subtitle: "Unavailable items",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-3 xl:grid-cols-6 xl:[&>*]:border-b-0 xl:[&>*:not(:last-child)]:border-r xl:[&>*:last-child]:border-r-0">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="font-medium text-xl tabular-nums leading-none tracking-tight">{stat.value}</div>
              )}
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
