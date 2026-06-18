import { Banknote, Clock, DollarSign, Wallet } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueStats({ summary }: { summary: any }) {
  if (!summary) return null;

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.total_revenue),
      subtitle: "All-time revenue",
      icon: Banknote,
    },
    {
      title: "This Month",
      value: formatCurrency(summary.this_month),
      subtitle: "Current month revenue",
      icon: Wallet,
    },
    {
      title: "Today",
      value: formatCurrency(summary.today),
      subtitle: "Today's revenue",
      icon: DollarSign,
    },
    {
      title: "Pending",
      value: formatCurrency(summary.pending),
      subtitle: "In transit or unpaid",
      icon: Clock,
    },
  ];
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-4 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0">
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
