"use client";

import * as React from "react";
import { CheckCircle2, FileEdit, MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const REVIEW_API_URL = process.env.NEXT_PUBLIC_API_REVIEW_URL || "reviews";

const getReviewUrl = (path: string = '') => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith('/')) baseUrl += '/';
  const reviewPath = REVIEW_API_URL.replace(/^\/|\/$/g, '');
  const cleanPath = path.replace(/^\/|\/$/g, '');
  const fullPath = cleanPath ? `${reviewPath}/${cleanPath}` : reviewPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface ReviewsStatsProps {
  refreshTrigger?: number;
}

export function ReviewsStats({ refreshTrigger }: ReviewsStatsProps) {
  const [stats, setStats] = React.useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarReviews: 0,
    recentReviews: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const url = getReviewUrl();
      console.log("Fetching reviews from:", url);
      
      const response = await fetch(url, {
        headers: { 
          Accept: "application/json", 
          "Content-Type": "application/json" 
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`);

      const result = await response.json();
      let reviewsData = [];
      
      if (result.data && Array.isArray(result.data)) {
        reviewsData = result.data;
      } else if (Array.isArray(result)) {
        reviewsData = result;
      } else if (result.reviews && Array.isArray(result.reviews)) {
        reviewsData = result.reviews;
      }

      const totalReviews = reviewsData.length;
      const totalRatings = reviewsData.reduce((sum: number, review: any) => sum + (review.ratings || 0), 0);
      const averageRating = totalReviews > 0 ? (totalRatings / totalReviews).toFixed(1) : 0;
      const fiveStarReviews = reviewsData.filter((review: any) => review.ratings === 5).length;
      
      // Recent reviews (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentReviews = reviewsData.filter((review: any) => {
        const reviewDate = new Date(review.created_at);
        return reviewDate >= thirtyDaysAgo;
      }).length;

      setStats({
        totalReviews,
        averageRating: parseFloat(averageRating as string),
        fiveStarReviews,
        recentReviews,
      });
    } catch (error) {
      console.error("Error fetching review stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const statItems = [
    {
      title: "Total Reviews",
      value: isLoading ? "..." : stats.totalReviews.toString(),
      icon: MessageSquare,
      subtitle: "Across all products",
    },
    {
      title: "Average Rating",
      value: isLoading ? "..." : stats.averageRating.toString(),
      icon: Star,
      subtitle: "Out of 5 stars",
    },
    {
      title: "5-Star Reviews",
      value: isLoading ? "..." : stats.fiveStarReviews.toString(),
      icon: CheckCircle2,
      subtitle: "Excellent customer satisfaction",
    },
    {
      title: "Recent Reviews",
      value: isLoading ? "..." : stats.recentReviews.toString(),
      icon: FileEdit,
      subtitle: "Added in the last 30 days",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="flex size-7 items-center justify-center rounded-lg border bg-muted">
                  <div className="size-4" />
                </div>
              </CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className="h-9 w-16 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {statItems.map((stat, i) => (
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