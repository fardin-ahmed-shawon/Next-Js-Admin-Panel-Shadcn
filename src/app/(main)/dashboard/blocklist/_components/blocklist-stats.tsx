import { ListFilter, ShieldCheck, ShieldOff, PhoneCall, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function BlocklistStats() {
  const stats = [
    {
      title: "Total Entries",
      value: "7",
      icon: ListFilter,
    },
    {
      title: "Active Blocks",
      value: "3",
      icon: ShieldCheck,
    },
    {
      title: "Inactive",
      value: "4",
      icon: ShieldOff,
    },
    {
      title: "Phone Blocks",
      value: "4",
      icon: PhoneCall,
    },
    {
      title: "IP Blocks",
      value: "3",
      icon: Monitor,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-3 lg:grid-cols-5 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <stat.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription className="uppercase text-xs tracking-wider font-semibold">{stat.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
