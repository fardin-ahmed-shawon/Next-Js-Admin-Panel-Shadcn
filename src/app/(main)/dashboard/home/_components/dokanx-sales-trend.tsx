"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DokanxSalesTrend() {
  const { data, isLoading } = useAdminDashboard();

  const monthlySalesTrend = React.useMemo(() => {
    if (!data?.revenue_expense_chart) return [];
    return data.revenue_expense_chart.map((item) => ({
      month: item.name,
      revenue: Number(item.sales) || 0,
    }));
  }, [data?.revenue_expense_chart]);

  const totalRevenue = monthlySalesTrend.reduce((sum, item) => sum + item.revenue, 0);
  const targetRevenue = 50000;
  const targetProgress = Math.round((totalRevenue / Math.max(targetRevenue, 1)) * 100);

  return (
    <Card className="xl:col-span-12">
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart data={monthlySalesTrend} margin={{ left: 0, right: 0, top: 0, bottom: 0 }} barSize={38}>
              <defs>
                <pattern
                  id="dokanx-sales-pattern"
                  width="4"
                  height="4"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill="var(--color-revenue)" fillOpacity="0.15" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="var(--color-revenue)"
                    strokeWidth="1.25"
                    strokeOpacity="0.40"
                  />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="0" />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <Bar
                dataKey="revenue"
                fill="url(#dokanx-sales-pattern)"
                radius={[8, 8, 0, 0]}
                stroke="var(--color-revenue)"
                strokeOpacity={0.5}
                strokeWidth={0.5}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
