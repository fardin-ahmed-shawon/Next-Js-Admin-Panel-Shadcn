import { AppWindow, Eye, LayoutTemplate, MousePointerClick, TrendingUp, Zap } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Pages",
    value: "24",
    icon: LayoutTemplate,
    subtitle: "All landing pages",
  },
  {
    title: "Published",
    value: "16",
    icon: AppWindow,
    subtitle: "Live on storefront",
  },
  {
    title: "Total Views",
    value: "84.2K",
    icon: Eye,
    subtitle: "Across all pages",
  },
  {
    title: "Total Clicks",
    value: "12.4K",
    icon: MousePointerClick,
    subtitle: "CTA interactions",
  },
  {
    title: "Avg. CTR",
    value: "14.7%",
    icon: TrendingUp,
    subtitle: "Click-through rate",
  },
  {
    title: "Conversions",
    value: "3,218",
    icon: Zap,
    subtitle: "Total conversions",
  },
];

export function LandingPagesStats() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-3 xl:grid-cols-6 xl:[&>*]:border-b-0 xl:[&>*:not(:last-child)]:border-r xl:[&>*:last-child]:border-r-0">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{stat.title}</CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
