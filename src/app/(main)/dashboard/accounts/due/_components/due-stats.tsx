"use client";

import { AlertCircle, FileText, Receipt, Users } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useDueCollection from "@/hooks/useDueCollection";

export function DueStats() {
  const { summary, isLoading } = useDueCollection();

  const stats = [
    {
      title: "Total Outstanding Due",
      value: isLoading ? "..." : `৳${Number(summary.total_outstanding_due || 0).toLocaleString()}`,
      subtitle: "Across all pending invoices",
      icon: AlertCircle,
      valueClass: "text-amber-600 dark:text-amber-500",
    },
    {
      title: "Due Invoices",
      value: isLoading ? "..." : summary.due_invoices?.toString() || "0",
      subtitle: "Unpaid or partially paid",
      icon: FileText,
    },
    {
      title: "Average Due",
      value: isLoading ? "..." : `৳${Number(summary.average_due || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      subtitle: "Per outstanding invoice",
      icon: Receipt,
    },
    {
      title: "Customers with Dues",
      value: isLoading ? "..." : summary.customers_with_dues?.toString() || "0",
      subtitle: "Unique customers owing balance",
      icon: Users,
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
              <div className={`font-medium text-xl tabular-nums leading-none tracking-tight ${stat.valueClass || ""}`}>
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
