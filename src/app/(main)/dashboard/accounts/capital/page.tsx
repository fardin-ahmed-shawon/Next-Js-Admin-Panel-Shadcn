"use client";

import * as React from "react";
import { format, subDays, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, Download, RefreshCw, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCapitals from "@/hooks/useCapitals";
import { CapitalStats } from "./_components/capital-stats";
import { CapitalTable } from "./_components/capital-table";
import { AddCapitalButton } from "./_components/add-capital-button";

type TimeRange = "alltime" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

const rangeLabels: Record<TimeRange, string> = {
  alltime: "All Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom Range",
};

export default function CapitalPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(15);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = React.useMemo(() => {
    const p: any = {
      page,
      per_page: perPage,
      search: debouncedSearch,
      type: typeFilter,
      payment_method: paymentMethodFilter,
      period: timeRange,
    };

    if (timeRange === "custom") {
      if (customFrom) p.start_date = customFrom;
      if (customTo) p.end_date = customTo;
    }

    return p;
  }, [page, perPage, debouncedSearch, typeFilter, paymentMethodFilter, timeRange, customFrom, customTo]);

  const { summary, capitals, pagination, isLoading, mutate } = useCapitals(params);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Cash In / Cash Out</h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              Cash Flow & Capital
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Record cash injections (Cash In) and cash withdrawals (Cash Out). Net Capital is calculated as Total Cash In − Total Cash Out.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <Select
            value={timeRange}
            onValueChange={(v) => {
              setTimeRange(v as TimeRange);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32 sm:w-36 h-9 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(Object.keys(rangeLabels) as TimeRange[])
                  .filter((r) => r !== "custom")
                  .map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {rangeLabels[r]}
                    </SelectItem>
                  ))}
                <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {timeRange === "custom" && (
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                className="h-9 w-32 text-xs"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setPage(1);
                }}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="h-9 w-32 text-xs"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          <AddCapitalButton onSuccess={() => mutate()} />
        </div>
      </div>

      {/* Summary Cards */}
      <CapitalStats summary={summary} isLoading={isLoading} />

      {/* Capital / Cash Flow History Table */}
      <CapitalTable
        capitals={capitals}
        pagination={pagination}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        onRefresh={() => mutate()}
      />
    </div>
  );
}
