"use client";

import * as React from "react";
import { CalendarIcon, Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";

import { useCourierAnalytics } from "@/hooks/useCourierAnalytics";
import { CourierReportsTable } from "./_components/courier-reports-table";
import { CourierReportsStats } from "./_components/courier-reports-stats";

type TimeRange = "all_time" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

const rangeLabels: Record<TimeRange, string> = {
  all_time: "All Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom Range",
};

export default function CourierReportPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("all_time");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const queryParams: Record<string, any> = {
    period: timeRange,
  };

  if (timeRange === "custom") {
    queryParams.start_date = customFrom;
    queryParams.end_date = customTo;
  }

  const { data, isLoading } = useCourierAnalytics(queryParams);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Courier Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Analyze your parcel delivery performance across all couriers.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-32 sm:w-40 bg-background">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(rangeLabels) as TimeRange[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {rangeLabels[r]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {timeRange === "custom" && (
              <div className="hidden sm:flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="h-9 w-36 text-xs"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="h-9 w-36 text-xs"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}
          </div>

          {timeRange === "custom" && (
            <div className="flex sm:hidden items-center gap-2 w-full mt-2">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <CourierReportsStats stats={data?.stats} />

      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">
            Courier Performance Data
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <CourierReportsTable data={data?.data} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
