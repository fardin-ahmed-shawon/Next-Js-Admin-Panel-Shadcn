import { Activity, Clock, CreditCard, DollarSign } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Expenses",
    value: "৳2,074,800",
    subtitle: "All-time expenses",
    icon: DollarSign,
  },
  {
    title: "This Month",
    value: "৳35,000",
    subtitle: "Current month expenses",
    icon: CreditCard,
  },
  {
    title: "Pending Payments",
    value: "৳50,000",
    subtitle: "Unpaid expenses",
    icon: Clock,
  },
  {
    title: "Average Expense",
    value: "৳15,400",
    subtitle: "Per transaction average",
    icon: Activity,
  },
];

export function ExpensesStats() {
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
