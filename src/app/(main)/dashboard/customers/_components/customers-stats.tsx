import { UserCheck, UserMinus, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CustomerRow } from "./customers-table";

export function CustomersStats({ data }: { data: CustomerRow[] }) {
  const totalCustomers = data.length;
  const registered = data.filter((c) => c.status === "Registered").length;
  const guest = data.filter((c) => c.status === "Guest").length;
  const newThisMonth = data.filter((c) => {
    const joinDate = new Date(c.joinDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      subtitle: "All customers in the system",
    },
    {
      title: "Registered",
      value: registered.toLocaleString(),
      icon: UserCheck,
      subtitle: "Customers with accounts",
    },
    {
      title: "Guest",
      value: guest.toLocaleString(),
      icon: UserMinus,
      subtitle: "Checked out without account",
    },
    {
      title: "New This Month",
      value: newThisMonth.toLocaleString(),
      icon: UserPlus,
      subtitle: "Joined in the last 30 days",
    },
  ];

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
            <CardDescription>{stat.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
