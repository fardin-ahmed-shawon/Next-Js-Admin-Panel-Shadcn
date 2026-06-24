import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, DollarSign, BarChart2 } from "lucide-react";
import type { ProductReportSummary } from "@/hooks/useProductReports";

interface ProductReportStatsProps {
  summary?: ProductReportSummary;
}

export function ProductReportStats({ summary }: ProductReportStatsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value) + " ৳";

  const items = [
    {
      title: "Total Products",
      value: summary?.total_products || 0,
      display: String(summary?.total_products || 0),
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Sold Units",
      value: summary?.total_sold_unit || 0,
      display: String(summary?.total_sold_unit || 0),
      icon: ShoppingCart,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Order Value",
      value: summary?.total_order_value || 0,
      display: formatCurrency(summary?.total_order_value || 0),
      icon: BarChart2,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Total Purchase Value",
      value: summary?.total_purchase_value || 0,
      display: formatCurrency(summary?.total_purchase_value || 0),
      icon: DollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Profit",
      value: summary?.total_profit || 0,
      display: formatCurrency(summary?.total_profit || 0),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden border-none bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.display}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
