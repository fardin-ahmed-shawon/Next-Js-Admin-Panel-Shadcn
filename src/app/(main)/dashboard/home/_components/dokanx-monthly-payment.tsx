"use client";

import * as React from "react";

import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DokanxMonthlyPayment() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(String(currentYear));
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const { data, isLoading } = useAdminDashboard();

  const monthlyPaymentData = React.useMemo(() => {
    if (!data?.revenue_expense_chart) return [];
    return data.revenue_expense_chart.map((item) => ({
      name: item.name,
      sales: Number(item.sales) || 0,
      expense: Number(item.expense) || 0,
    }));
  }, [data?.revenue_expense_chart]);

  return (
    <Card className="@container/card flex flex-col h-full">
      <CardHeader>
        <CardTitle className="leading-none">Revenue vs Expense</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Revenue vs Operating Expenses for {selectedYear}</span>
          <span className="@[540px]/card:hidden">{selectedYear} Financials</span>
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger size="sm" className="min-w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            View report
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pb-4">
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-[320px] w-full flex-1">
            <ComposedChart data={monthlyPaymentData} margin={{ top: 0, left: -20, right: 0 }}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeOpacity={0.5} />

              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis axisLine={false} tickLine={false} tickMargin={8} tickFormatter={(value) => `৳${value / 1000}k`} />

              <ChartTooltip cursor={false} content={<ChartTooltipContent className="w-50" indicator="line" />} />
              <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-5 justify-end" />} />

              <Area
                dataKey="sales"
                type="natural"
                fill="url(#fillSales)"
                stroke="var(--color-sales)"
                strokeWidth={1.25}
                dot={false}
                fillOpacity={1}
              />
              <Line dataKey="expense" type="natural" stroke="var(--color-expense)" strokeWidth={1.4} dot={false} />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
