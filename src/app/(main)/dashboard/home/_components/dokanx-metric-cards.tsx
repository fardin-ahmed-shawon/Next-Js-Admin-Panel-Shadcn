import {
  Box,
  CheckCircle,
  Clock,
  LayoutGrid,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const topCards = [
  {
    title: "Total Products",
    value: "20",
    icon: Package,
    subtitle: "Total available products",
    trend: "+2",
    trendIcon: TrendingUp,
    trendType: "default",
  },
  {
    title: "Product Categories",
    value: "6",
    icon: LayoutGrid,
    subtitle: "Active categories",
    trend: "+1",
    trendIcon: TrendingUp,
    trendType: "default",
  },
  {
    title: "Total Stock Unit",
    value: "986",
    icon: Box,
    subtitle: "Units currently in stock",
    trend: "-15",
    trendIcon: TrendingDown,
    trendType: "destructive",
  },
  {
    title: "Customers",
    value: "7",
    icon: Users,
    subtitle: "Registered users",
    trend: "+3",
    trendIcon: TrendingUp,
    trendType: "default",
  },
  {
    title: "Total Purchased Unit",
    value: "158",
    icon: ShoppingCart,
    subtitle: "Items sold this month",
    trend: "+24%",
    trendIcon: TrendingUp,
    trendType: "default",
  },
  {
    title: "Total Collection",
    value: "৳ 3,499,320",
    icon: Wallet,
    subtitle: "Revenue this month",
    trend: "+12.5%",
    trendIcon: TrendingUp,
    trendType: "default",
  },
  {
    title: "Pending Orders",
    value: "23",
    icon: Clock,
    subtitle: "Awaiting processing",
    trend: "-5%",
    trendIcon: TrendingDown,
    trendType: "destructive",
  },
  {
    title: "Approved Orders",
    value: "64",
    icon: CheckCircle,
    subtitle: "Processed successfully",
    trend: "+8%",
    trendIcon: TrendingUp,
    trendType: "default",
  },
];

export function DokanxMetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {topCards.map((card, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <card.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>{card.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{card.value}</div>
              <Badge variant={card.trendType as "default" | "destructive"}>
                <card.trendIcon className="size-3 mr-1" />
                {card.trend}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
