"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Coins, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CapitalSummary } from "@/hooks/useCapitals";

interface CapitalStatsProps {
  summary: CapitalSummary;
  isLoading?: boolean;
}

export function CapitalStats({ summary, isLoading }: CapitalStatsProps) {
  const totalCapital = summary.total_capital ?? ((summary.total_cash_in || 0) - (summary.total_cash_out || 0));
  const totalCashIn = summary.total_cash_in ?? 0;
  const totalCashOut = summary.total_cash_out ?? 0;

  const cards = [
    {
      title: "Total Capital",
      value: `৳${totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Net Capital (Total Cash In − Total Cash Out)",
      icon: Wallet,
      color: totalCapital >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
      bgColor: totalCapital >= 0 ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "bg-destructive/10 dark:bg-destructive/20",
      creditTag: "Net Balance",
    },
    {
      title: "Total Cash In",
      value: `৳${totalCashIn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Total owner & investor injections",
      icon: ArrowDownRight,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      creditTag: "Inflows",
    },
    {
      title: "Total Cash Out",
      value: `৳${totalCashOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Total drawings & withdrawals",
      icon: ArrowUpRight,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10 dark:bg-rose-500/20",
      creditTag: "Outflows",
    },
    {
      title: "Total Transactions",
      value: (summary.total_entries || 0).toLocaleString(),
      description: "Recorded cash flow entries",
      icon: Coins,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="relative overflow-hidden border bg-card shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <div className={`flex size-8 items-center justify-center rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="mt-3">
                {isLoading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{card.value}</h3>
                    {card.creditTag && (
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {card.creditTag}
                      </span>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
