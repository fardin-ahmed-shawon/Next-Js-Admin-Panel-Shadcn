"use client";

import { Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Participant = { user_id: number; name: string; department_name: string; designation: string | null; metrics: Record<string, number> };

export function PerformancePodium({ employees, fields, sortKey, ascending }: { employees: Participant[]; fields: [string, string][]; sortKey: string; ascending: boolean }) {
  const podium = [...employees].sort((a, b) => ((b.metrics[sortKey] || 0) - (a.metrics[sortKey] || 0)) * (ascending ? -1 : 1) || a.name.localeCompare(b.name)).slice(0, 3);
  if (!podium.length) return null;

  return <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
    {[1, 0, 2].filter(rank => podium[rank]).map(rank => {
      const row = podium[rank];
      const initials = row.name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("");
      return <Card key={row.user_id} className={`relative overflow-hidden border-2 ${rank === 0 ? "order-first border-t-amber-500 bg-gradient-to-b from-amber-50/40 to-card md:order-none" : ""}`}>
        <CardContent className="flex h-full flex-col items-center gap-3 p-6 text-center">
          <Badge variant="outline" className={rank === 0 ? "border-amber-200 text-amber-600" : "text-muted-foreground"}><Medal className="mr-1 size-3" />{rank === 0 ? "1st Place" : rank === 1 ? "2nd Place" : "3rd Place"}</Badge>
          <Avatar className={`size-16 border-2 ${rank === 0 ? "border-amber-400" : "border-border"}`}><AvatarFallback className="bg-primary/10 text-xl">{initials}</AvatarFallback></Avatar>
          <div><p className="font-semibold">{row.name}</p><p className="mt-1 text-xs text-muted-foreground">{row.department_name} · {row.designation || "Employee"}</p></div>
          <div className="grid w-full grid-cols-2 gap-3 border-t pt-4">{fields.slice(0, 4).map(([key, label]) => <div key={key}><p className="text-[10px] uppercase text-muted-foreground">{label}</p><p className="mt-1 font-semibold tabular-nums">{(row.metrics[key] || 0).toLocaleString()}</p></div>)}</div>
          <p className="mt-auto pt-2 text-xs text-muted-foreground">Ranked by {fields.find(([key]) => key === sortKey)?.[1]} · {ascending ? "lowest first" : "highest first"}</p>
        </CardContent>
      </Card>;
    })}
  </div>;
}
