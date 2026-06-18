"use client";

import { Activity, Clock, CreditCard, DollarSign } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useExpenses from "@/hooks/useExpenses";

export function ExpensesStats() {
  const { expenses, isLoading } = useExpenses();

  const totalAmount = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthAmount = expenses
    .filter((exp: any) => {
      if (!exp.created_at) return false;
      const d = new Date(exp.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    
  const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

  const stats = [
    {
      title: "Total Expenses",
      value: isLoading ? "..." : `৳${totalAmount.toLocaleString()}`,
      subtitle: "All-time expenses",
      icon: DollarSign,
    },
    {
      title: "This Month",
      value: isLoading ? "..." : `৳${thisMonthAmount.toLocaleString()}`,
      subtitle: "Current month expenses",
      icon: CreditCard,
    },
    {
      title: "Total Records",
      value: isLoading ? "..." : expenses.length.toString(),
      subtitle: "Total number of expenses",
      icon: Clock,
    },
    {
      title: "Average Expense",
      value: isLoading ? "..." : `৳${averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      subtitle: "Per transaction average",
      icon: Activity,
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
