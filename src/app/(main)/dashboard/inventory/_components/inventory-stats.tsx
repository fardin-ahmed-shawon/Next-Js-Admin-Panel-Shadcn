import { formatStockQuantity } from "@/lib/stock-quantity";
import { AlertCircle, Banknote, Layers, Package, SlidersHorizontal, TrendingUp, XCircle, PackageCheck } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventorySummary } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryStatsProps {
  summary?: InventorySummary;
  loading?: boolean;
  onOpenLowStockRules?: () => void;
  statusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export function InventoryStats({
  summary,
  loading,
  onOpenLowStockRules,
  statusFilter,
  onSelectStatusFilter,
}: InventoryStatsProps) {
  const stats = [
    {
      title: "Products",
      value: summary?.total_products?.toLocaleString() || "0",
      icon: Package,
      subtitle: "Total products listed",
      filter: "All",
    },
    {
      title: "Stock by unit",
      value: Object.entries(summary?.quantities_by_unit || { piece: summary?.total_units || 0 }).map(([unit, quantity]) => (
        <span key={unit} className="block text-base leading-normal font-semibold">
          {formatStockQuantity(quantity, unit)}
        </span>
      )),
      icon: Layers,
      subtitle: "Remaining / Current on-hand",
    },
    {
      title: "Total Stock",
      value: Object.entries(summary?.total_quantities_by_unit || { piece: summary?.total_stock ?? summary?.total_units ?? 0 }).map(([unit, quantity]) => (
        <span key={unit} className="block text-base leading-normal font-bold text-primary">
          {formatStockQuantity(quantity, unit)}
        </span>
      )),
      icon: PackageCheck,
      subtitle: Number(summary?.total_reserved_units || 0) > 0
        ? `Incl. ${summary?.total_reserved_units} reserved in orders`
        : "Remaining + Reserved stock",
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
      subtitle: summary?.potential_profit_excludes_bulk ? "Independent stock margin" : "Expected margin",
    },
    {
      title: "Low Stock",
      value: summary?.low_stock?.toLocaleString() || "0",
      icon: AlertCircle,
      subtitle: "Needs restocking soon",
      filter: "Low Stock",
      action: onOpenLowStockRules ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLowStockRules();
          }}
          title="Configure Low Stock Rules"
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-amber-600 transition-colors"
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
      ) : null,
    },
    {
      title: "Out of Stock",
      value: summary?.out_of_stock?.toLocaleString() || "0",
      icon: XCircle,
      subtitle: "Unavailable items",
      filter: "Out of Stock",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-3 xl:grid-cols-7 xl:[&>*]:border-b-0 xl:[&>*:not(:last-child)]:border-r xl:[&>*:last-child]:border-r-0">
        {stats.map((stat, i) => {
          const isClickable = !!stat.filter && !!onSelectStatusFilter;
          const isActive = stat.filter && statusFilter === stat.filter;

          return (
            <Card
              key={i}
              onClick={() => {
                if (isClickable && stat.filter) {
                  onSelectStatusFilter(stat.filter);
                }
              }}
              className={`transition-colors ${isClickable ? "cursor-pointer hover:bg-accent/40" : ""} ${isActive ? "bg-accent/30 ring-1 ring-primary/20" : ""}`}
            >
              <CardHeader>
                <CardTitle className="font-normal text-sm flex items-center justify-between">
                  <span>{stat.title}</span>
                  {isActive && <span className="size-1.5 rounded-full bg-primary" />}
                </CardTitle>
                <CardAction>
                  {stat.action || <stat.icon className="size-4 text-muted-foreground" />}
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
          );
        })}
      </div>
    </div>
  );
}
