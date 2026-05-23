import { FileText, Tags, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Categories",
    value: "14",
    subtitle: "All defined expense categories",
    icon: Tags,
  },
  {
    title: "Active Categories",
    value: "12",
    subtitle: "Categories currently in use",
    icon: FileText,
  },
  {
    title: "Highest Expense",
    value: "Office Rent",
    subtitle: "Largest expense category",
    icon: TrendingUp,
  },
  {
    title: "Lowest Expense",
    value: "Subscriptions",
    subtitle: "Smallest expense category",
    icon: TrendingDown,
  },
];

export function ExpenseCategoryStats() {
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
