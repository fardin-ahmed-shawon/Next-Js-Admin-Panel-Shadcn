"use client";

import { format, parse } from "date-fns";
import { Banknote, Coins, CreditCard, Package, Rocket, Wallet } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const paymentTrendRanges = ["01-05", "06-10", "11-15", "16-20", "21-25", "26-31"] as const;

const paymentTrendValues = [
  [4820, 5150, 5060, 5520, 5990, 6880],
  [5140, 5360, 5520, 5860, 6120, 6720],
  [4920, 4680, 5150, 5360, 5720, 6150],
  [5480, 5920, 5660, 6180, 6340, 6660],
  [5840, 6220, 6480, 6110, 6680, 7230],
  [6280, 6740, 6960, 7120, 6780, 7240],
  [6820, 7240, 7680, 7410, 7920, 7810],
  [6040, 6420, 6150, 6860, 7080, 7090],
  [5860, 6120, 6340, 6080, 6620, 6900],
  [6520, 6840, 7060, 7420, 7160, 8280],
  [6980, 7320, 7640, 7160, 8040, 8620],
  [6900, 7400, 8100, 8600, 8200, 9360],
] as const;

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function getRollingTrendBuckets() {
  const currentMonth = new Date();
  currentMonth.setDate(1);

  return paymentTrendValues.map((values, index) => {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(currentMonth.getMonth() - (paymentTrendValues.length - 1 - index));

    return {
      month: `${monthFormatter.format(monthDate)} ${String(monthDate.getFullYear()).slice(-2)}`,
      values,
    };
  });
}

const paymentTrendsData = getRollingTrendBuckets().flatMap(({ month, values }) =>
  values.map((revenue, index) => ({
    period: `${month} ${paymentTrendRanges[index]}`,
    volume: Math.round(revenue * (index % 3 === 0 ? 0.24 : index % 3 === 1 ? 0.28 : 0.26)),
    revenue,
  })),
);

const paymentTrendConfig = {
  revenue: {
    label: "Total Value",
    color: "var(--foreground)",
  },
  volume: {
    label: "Transactions",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatMonthTick(value: string) {
  const parts = value.split(" ");
  const range = parts.at(-1);
  const month = parts.slice(0, -1).join(" ");

  return range === "11-15" ? month : "";
}

function formatTooltipLabel(value: string) {
  const parts = value.split(" ");
  const range = parts.at(-1);
  const month = parse(parts.slice(0, -1).join(" "), "MMM yy", new Date());
  const [start, end] = String(range).split("-");
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDate = new Date(month.getFullYear(), month.getMonth(), Number(start));
  const endDate = new Date(month.getFullYear(), month.getMonth(), Math.min(Number(end), lastDayOfMonth));

  return `${format(month, "MMM")} ${format(startDate, "do")} - ${format(endDate, "do")}, ${format(month, "yyyy")}`;
}

export function DokanxPaymentMethods() {
  return (
    <div className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-12">
          {/* Left Grid: 6 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 xl:col-span-5 xl:border-r">
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Total Processing</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  ৳3,500K
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Banknote className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">+12.4%</span>
                  <span className="text-muted-foreground"> vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Cash On Delivery</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  ৳1,588K
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Package className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">45.4% of total revenue</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">bKash</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  ৳724K
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Wallet className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">20.7% of total revenue</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Rocket</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  ৳598K
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Rocket className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">17.1% of total revenue</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r md:border-b-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Upay</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  ৳391K
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <CreditCard className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">11.2% of total revenue</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Nagad</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  ৳195K
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Coins className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">5.6% of total revenue</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Chart */}
          <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
            <CardHeader>
              <CardTitle className="font-normal">Payment Trends</CardTitle>
            </CardHeader>

            <CardContent>
              <ChartContainer config={paymentTrendConfig} className="h-74 w-full">
                <ComposedChart
                  accessibilityLayer
                  data={paymentTrendsData}
                  margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                >
                  <defs>
                    <filter id="payment-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor="var(--color-revenue)" floodOpacity="0.35" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid yAxisId="volume" vertical={false} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    height={30}
                    interval={0}
                    minTickGap={0}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatMonthTick(String(value))}
                  />
                  <YAxis yAxisId="revenue" hide domain={[3000, 10_000]} />
                  <YAxis yAxisId="volume" hide domain={[0, 6000]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        labelFormatter={(value) => formatTooltipLabel(String(value))}
                        formatter={(value, name, item) => (
                          <>
                            <div
                              className="size-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            <div className="flex flex-1 items-center justify-between leading-none">
                              <span className="text-muted-foreground">{String(name ?? "")}</span>
                              <span className="font-medium font-mono text-foreground tabular-nums">
                                {typeof value === "number" ? `৳${value.toLocaleString()}` : String(value ?? "")}
                              </span>
                            </div>
                          </>
                        )}
                      />
                    }
                    cursor={{
                      stroke: "var(--border)",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Bar
                    yAxisId="volume"
                    barSize={4}
                    dataKey="volume"
                    fill="var(--color-volume)"
                    name="Transactions"
                    opacity={0.18}
                    radius={[6, 6, 0, 0]}
                  />
                  <Area
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="none"
                    filter="url(#payment-line-glow)"
                    name="Revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={1.8}
                    type="linear"
                    activeDot={{
                      r: 4,
                      fill: "var(--background)",
                      stroke: "var(--color-revenue)",
                      strokeWidth: 2,
                    }}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
