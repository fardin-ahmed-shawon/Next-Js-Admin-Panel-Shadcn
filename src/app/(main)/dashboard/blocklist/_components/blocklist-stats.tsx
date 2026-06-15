import React from "react";
import { ListFilter, Monitor, PhoneCall, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BlocklistStatsProps {
  data: any[];
}

export function BlocklistStats({ data }: BlocklistStatsProps) {
  const stats = [
    {
      title: "Total Entries",
      value: data.length.toString(),
      icon: ListFilter,
    },
    {
      title: "Active Blocks",
      value: data.filter(item => item.status === "Active").length.toString(),
      icon: ShieldCheck,
    },
    {
      title: "Inactive",
      value: data.filter(item => item.status === "Inactive").length.toString(),
      icon: ShieldOff,
    },
    {
      title: "Phone Blocks",
      value: data.filter(item => item.type === "Phone").length.toString(),
      icon: PhoneCall,
    },
    {
      title: "IP Blocks",
      value: data.filter(item => item.type === "IP").length.toString(),
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