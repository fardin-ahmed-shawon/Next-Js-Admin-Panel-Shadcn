"use client";

import * as React from "react";

import { ArrowDownRight, ArrowUpRight, HandCoins, Wallet } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatementContext } from "../page";
import useAccountStatements from "@/hooks/useAccountStatements";

export function StatementStats() {
  const { params } = React.useContext(StatementContext);
  const { summary, isLoading } = useAccountStatements(params);

  const stats = [
    {
      title: "Total Capital",
      value: isLoading ? "..." : `৳${Number(summary.total_capital || 0).toLocaleString()}`,
      subtitle: "Total Cash In − Cash Out",
      icon: Wallet,
      valueClass: "text-emerald-600 dark:text-emerald-400 font-semibold",
    },
    {
      title: "Total In (Revenue + Capital)",
      value: isLoading ? "..." : `৳${Number(summary.total_in || 0).toLocaleString()}`,
      subtitle: "Revenue + Cash In",
      icon: ArrowDownRight,
      valueClass: "text-emerald-600 dark:text-emerald-500 font-semibold",
    },
    {
      title: "Total Out",
      value: isLoading ? "..." : `৳${Number(summary.total_out || 0).toLocaleString()}`,
      subtitle: "Cash Out + Expenses + Supplier Payments",
      icon: ArrowUpRight,
      valueClass: "text-destructive font-semibold",
    },
    {
      title: "Ending Balance",
      value: isLoading ? "..." : `৳${Number(summary.ending_balance || 0).toLocaleString()}`,
      subtitle: "Net period balance (In − Out)",
      icon: HandCoins,
      valueClass: "text-foreground font-bold",
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
