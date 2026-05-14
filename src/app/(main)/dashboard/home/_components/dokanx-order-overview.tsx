"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardAction, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const orderOverviewData = [
  { name: "Pending", value: 31, fill: "#e4e4e7" },
  { name: "Confirmed", value: 26, fill: "#d4d4d8" },
  { name: "Ready To Ship", value: 19, fill: "#a1a1aa" },
  { name: "Delivered", value: 16, fill: "#71717a" },
  { name: "Processing", value: 8, fill: "#52525b" },
  { name: "Returned", value: 14, fill: "#3f3f46" },
  { name: "Pre-Order", value: 12, fill: "#27272a" },
  { name: "Cancelled", value: 13, fill: "#18181b" },
  { name: "Ship Later", value: 15, fill: "#09090b" },
  { name: "Hold", value: 22, fill: "#e8e8e8ff" },
];

const orderConfig = {
  value: { label: "Orders" },
  Pending: { label: "Pending", color: "#e4e4e7" },
  Confirmed: { label: "Confirmed", color: "#d4d4d8" },
  "Ready To Ship": { label: "Ready To Ship", color: "#a1a1aa" },
  Delivered: { label: "Delivered", color: "#71717a" },
  Processing: { label: "Processing", color: "#52525b" },
  Returned: { label: "Returned", color: "#3f3f46" },
  "Pre-Order": { label: "Pre-Order", color: "#27272a" },
  Cancelled: { label: "Cancelled", color: "#18181b" },
  "Ship Later": { label: "Ship Later", color: "#09090b" },
  Hold: { label: "Hold", color: "#f4f4f5" },
} satisfies ChartConfig;

export function DokanxOrderOverview() {
  const totalOrders = React.useMemo(() => orderOverviewData.reduce((acc, curr) => acc + curr.value, 0), []);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-normal">Order Overview</CardTitle>
        <CardAction>
          <Select defaultValue="monthly">
            <SelectTrigger size="sm" className="min-w-32">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 pb-6">
        <ChartContainer config={orderConfig} className="mx-auto aspect-square max-h-56 w-full">
          <PieChart
            className="m-0"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel className="w-52" nameKey="name" />} />
            <Pie
              cornerRadius={4}
              data={orderOverviewData}
              dataKey="value"
              innerRadius={70}
              nameKey="name"
              outerRadius={95}
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground font-bold text-4xl tabular-nums"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Orders
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 w-full max-w-md mx-auto">
          {orderOverviewData.map((item) => (
            <li key={item.name} className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-sm capitalize">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: item.fill }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="text-sm tabular-nums ml-2">{item.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
