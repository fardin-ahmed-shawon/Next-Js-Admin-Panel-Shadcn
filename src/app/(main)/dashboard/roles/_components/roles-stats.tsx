import { Shield, Key, Grid, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Roles",
    value: "4",
    icon: Shield,
    subtitle: "Active role configurations",
  },
  {
    title: "Permission Slots",
    value: "24",
    icon: Key,
    subtitle: "Available permission types",
  },
  {
    title: "Permission Groups",
    value: "6",
    icon: Grid,
    subtitle: "Organized categories",
  },
  {
    title: "Total Admins",
    value: "3",
    icon: Users,
    subtitle: "Users across all roles",
  },
];

export function RolesStats() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <stat.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription className="uppercase tracking-wider font-semibold text-xs mt-2">
              {stat.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
