"use client";

import * as React from "react";

import { Calendar, Eye, FileText, ThumbsUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_URL || "blogs";
const API_URL = `${BASE}${BLOG_PATH}`;

interface BlogRow {
  id: number;
  title: string;
  description: string;
  img: string;
  created_at: string;
  updated_at: string;
}

export function BlogsStats() {
  const [totalPosts, setTotalPosts] = React.useState<number | null>(null);
  const [thisMonth, setThisMonth] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { success: boolean; data: BlogRow[] } = await res.json();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthCount = json.data.filter((blog) => {
          const d = new Date(blog.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        setTotalPosts(json.data.length);
        setThisMonth(monthCount);
      } catch {
        setTotalPosts(0);
        setThisMonth(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Posts",
      value: isLoading ? null : `${totalPosts}`,
      icon: FileText,
      subtitle: "All blog articles",
    },
    {
      title: "Total Views",
      value: "14.2k",
      icon: Eye,
      subtitle: "Across all articles",
    },
    {
      title: "Engagement",
      value: "8.5%",
      icon: ThumbsUp,
      subtitle: "Avg. read & interaction",
    },
    {
      title: "This Month",
      value: isLoading ? null : `${thisMonth}`,
      icon: Calendar,
      subtitle: "New articles published",
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
            {stat.value === null ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            )}
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
