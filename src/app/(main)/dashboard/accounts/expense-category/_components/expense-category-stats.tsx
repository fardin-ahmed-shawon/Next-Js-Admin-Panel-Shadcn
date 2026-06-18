"use client";

import { FileText, Tags } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useExpenseCategories from "@/hooks/useExpenseCategories";

export function ExpenseCategoryStats() {
  const { expenseCategories, isLoading } = useExpenseCategories();

  const stats = [
    {
      title: "Total Categories",
      value: isLoading ? "..." : expenseCategories.length.toString(),
      subtitle: "All defined expense categories",
      icon: Tags,
    },
    {
      title: "Recently Added",
      value: isLoading ? "..." : expenseCategories[0]?.title || "N/A",
      subtitle: "The most recent category added",
      icon: FileText,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-2 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0">
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
