"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const monthlySalesTrend = [
  { month: "Jan", revenue: 100 },
  { month: "Feb", revenue: 120 },
  { month: "Mar", revenue: 150 },
  { month: "Apr", revenue: 600 },
  { month: "May", revenue: 200 },
  { month: "Jun", revenue: 250 },
  { month: "Jul", revenue: 220 },
  { month: "Aug", revenue: 300 },
  { month: "Sep", revenue: 350 },
  { month: "Oct", revenue: 320 },
  { month: "Nov", revenue: 380 },
  { month: "Dec", revenue: 400 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DokanxSalesTrend() {
  const totalRevenue = monthlySalesTrend.reduce((sum, item) => sum + item.revenue, 0);
  const targetRevenue = 5000;
  const targetProgress = Math.round((totalRevenue / targetRevenue) * 100);

  return (
    <Card className="xl:col-span-12">
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
