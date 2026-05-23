import { Banknote, FileText, Wallet } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Records",
    value: "77",
    subtitle: "Total payment entries",
    icon: FileText,
  },
  {
    title: "Full Paid",
    value: "৳3,498,820",
    subtitle: "34 transactions",
    icon: Banknote,
  },
  {
    title: "Partially Paid",
    value: "৳500",
    subtitle: "1 transactions",
    icon: Wallet,
  },
];

export function PaymentsStats() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-1 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b md:grid-cols-3 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0">
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
