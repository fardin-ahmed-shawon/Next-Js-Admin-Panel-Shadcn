import { ShieldCheck, Star, Users } from "lucide-react";
import { User } from "@/hooks/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersStatsProps {
  users: User[];
  loading: boolean;
}

export function UsersStats({ users, loading }: UsersStatsProps) {
  const totalUsers = users.length;
  
  // Calculate unique roles in use
  const distinctRolesCount = new Set(users.map(u => u.role_id)).size;

  // Calculate most common role
  const roleCounts: Record<string, number> = {};
  let mostCommonRole = "N/A";
  let maxCount = 0;

  users.forEach((user) => {
    const roleName = user.role?.role_name || "Unknown";
    roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
    if (roleCounts[roleName] > maxCount) {
      maxCount = roleCounts[roleName];
      mostCommonRole = roleName;
    }
  });

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      subtitle: "Active admin accounts",
    },
    {
      title: "Roles in Use",
      value: distinctRolesCount.toString(),
      icon: ShieldCheck,
      subtitle: "Distinct role types",
    },
    {
      title: "Most Common Role",
      value: mostCommonRole,
      icon: Star,
      subtitle: maxCount === 1 ? "1 user" : `${maxCount} users`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 dark:*:data-[slot=card]:bg-card">
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
          <CardContent className="space-y-1">
            {loading ? (
              <>
                <Skeleton className="h-9 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
