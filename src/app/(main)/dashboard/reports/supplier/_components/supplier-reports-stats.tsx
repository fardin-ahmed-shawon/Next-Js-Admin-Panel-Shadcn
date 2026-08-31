import { Users, ShoppingBag, DollarSign, Wallet, AlertCircle } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupplierReportSummary } from "@/hooks/useSupplierReports";

interface SupplierReportsStatsProps {
  summary?: SupplierReportSummary;
}

export function SupplierReportsStats({ summary }: SupplierReportsStatsProps) {
  const totalSuppliers = Number(summary?.total_suppliers || 0);
  const totalPurchases = Number(summary?.total_purchase_count || 0);
  const totalPurchaseAmount = Number(summary?.total_purchase_amount || 0);
  const totalPaid = Number(summary?.total_paid_amount || 0);
  const totalDue = Number(summary?.total_due_amount || 0);

  const stats = [
    {
      title: "Total Suppliers",
      value: totalSuppliers.toLocaleString(),
      subtitle: "Active vendors in system",
      icon: Users,
    },
    {
      title: "Purchase Lots",
      value: totalPurchases.toLocaleString(),
      subtitle: `${totalSuppliers} registered suppliers`,
      icon: ShoppingBag,
    },
    {
      title: "Total Purchase Amount",
      value: `৳${totalPurchaseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Gross procurement volume",
      icon: DollarSign,
    },
    {
      title: "Total Paid Amount",
      value: `৳${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${totalPurchaseAmount > 0 ? ((totalPaid / totalPurchaseAmount) * 100).toFixed(1) : 0}% settled`,
      icon: Wallet,
    },
    {
      title: "Total Due Amount",
      value: `৳${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Outstanding supplier balance",
      icon: AlertCircle,
      textColor: totalDue > 0 ? "text-red-500" : "text-emerald-500",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div
        className={`grid grid-cols-1 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:[&>*]:border-b-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*:last-child]:border-r-0`}
      >
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className={`font-medium text-xl tabular-nums leading-none tracking-tight ${stat.textColor || ""}`}>
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
