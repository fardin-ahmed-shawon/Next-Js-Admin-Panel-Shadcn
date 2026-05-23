import { CheckCircle2, FileEdit, MessageSquareQuote, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Testimonials",
    value: "2",
    icon: MessageSquareQuote,
    subtitle: "All customer reviews",
  },
  {
    title: "Average Rating",
    value: "4.5",
    icon: Star,
    subtitle: "Out of 5 stars",
  },
  {
    title: "5-Star Reviews",
    value: "1",
    icon: CheckCircle2,
    subtitle: "Top rated feedback",
  },
  {
    title: "Recent Reviews",
    value: "2",
    icon: FileEdit,
    subtitle: "Added this week",
  },
];

export function TestimonialsStats() {
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
