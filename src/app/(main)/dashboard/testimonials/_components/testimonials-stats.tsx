"use client";

import { CheckCircle2, FileEdit, MessageSquareQuote, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  position: string;
  photo: string;
  rating: number;
  text: string;
}

interface TestimonialsStatsProps {
  testimonials: Testimonial[];
}

export function TestimonialsStats({ testimonials }: TestimonialsStatsProps) {
  const [stats, setStats] = useState({
    totalTestimonials: "0",
    averageRating: "0",
    fiveStarReviews: "0",
    recentReviews: "0",
  });

  useEffect(() => {
    const total = testimonials.length;
    const average = testimonials.reduce((acc, curr) => acc + curr.rating, 0) / (total || 1);
    const fiveStar = testimonials.filter((t) => t.rating === 5).length;

    // Recent reviews from last 7 days (if you have created_at field)
    // For now, showing all as recent since no date field

    setStats({
      totalTestimonials: total.toString(),
      averageRating: average.toFixed(1),
      fiveStarReviews: fiveStar.toString(),
      recentReviews: total.toString(),
    });
  }, [testimonials]);

  const statCards = [
    {
      title: "Total Testimonials",
      value: stats.totalTestimonials,
      icon: MessageSquareQuote,
      subtitle: "All customer reviews",
    },
    {
      title: "Average Rating",
      value: stats.averageRating,
      icon: Star,
      subtitle: "Out of 5 stars",
    },
    {
      title: "5-Star Reviews",
      value: stats.fiveStarReviews,
      icon: CheckCircle2,
      subtitle: "Top rated feedback",
    },
    {
      title: "Recent Reviews",
      value: stats.recentReviews,
      icon: FileEdit,
      subtitle: "Total testimonials",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {statCards.map((stat, i) => (
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
