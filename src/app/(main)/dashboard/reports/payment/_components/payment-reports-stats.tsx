import { Banknote, FileText, Wallet } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentReportSummary } from "@/hooks/usePaymentReports";

interface PaymentReportsStatsProps {
  summary?: PaymentReportSummary;
}

export function PaymentReportsStats({ summary }: PaymentReportsStatsProps) {
  const totalPaid = Number(summary?.total_paid_amount || 0);
  const totalTransactions = Number(summary?.total_transactions || 0);

  const mainStats = [
    {
      title: "Total Records",
      value: totalTransactions.toLocaleString(),
      subtitle: "Total payment entries",
      icon: FileText,
    },
    {
      title: "Total Paid",
      value: `৳${totalPaid.toLocaleString()}`,
      subtitle: `${totalTransactions} transactions`,
      icon: Wallet,
    },
  ];

  const breakdowns = (summary?.payment_methods_breakdown || []).map((b) => ({
    title: b.payment_method || "Unknown Method",
    value: `৳${Number(b.total || 0).toLocaleString()}`,
    subtitle: `${b.count} transactions`,
    icon: Banknote,
  }));

  const stats = [...mainStats, ...breakdowns];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div
        className={`grid grid-cols-1 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b md:grid-cols-${Math.min(stats.length, 4)} md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0`}
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
              <div className="font-medium text-xl tabular-nums leading-none tracking-tight">{stat.value}</div>
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
