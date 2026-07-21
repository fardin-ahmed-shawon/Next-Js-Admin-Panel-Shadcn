"use client";

import * as React from "react";
import { format, subDays, subMonths, startOfYear } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { StatementStats } from "./_components/statement-stats";
import { StatementTable } from "./_components/statement-table";
import { AccountStatementParams } from "@/hooks/useAccountStatements";

type TimeRange = "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

const rangeLabels: Record<TimeRange, string> = {
  alltime: "All Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "Yearly",
  custom: "Custom Range",
};

export const StatementContext = React.createContext<{
  params: AccountStatementParams;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  page: number;
  setPage: (p: number) => void;
  perPage: number;
  setPerPage: (p: number) => void;
}>({
  params: {},
  searchQuery: "",
  setSearchQuery: () => {},
  activeFilter: "All",
  setActiveFilter: () => {},
  page: 1,
  setPage: () => {},
  perPage: 10,
  setPerPage: () => {},
});

export default function StatementsPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = React.useMemo(() => {
    const p: AccountStatementParams = {
      page,
      per_page: perPage,
      search: debouncedSearch,
      type: activeFilter,
    };
    
    const now = new Date();
    if (timeRange !== "alltime" && timeRange !== "custom") {
      let fromDate;
      if (timeRange === "daily") fromDate = subDays(now, 1);
      else if (timeRange === "weekly") fromDate = subDays(now, 7);
      else if (timeRange === "monthly") fromDate = subMonths(now, 1);
      else if (timeRange === "4months") fromDate = subMonths(now, 4);
      else if (timeRange === "6months") fromDate = subMonths(now, 6);
      else if (timeRange === "yearly") fromDate = startOfYear(now);
      
      if (fromDate) {
        p.start_date = format(fromDate, "yyyy-MM-dd");
        p.end_date = format(now, "yyyy-MM-dd");
      }
    } else if (timeRange === "custom") {
      if (customFrom) p.start_date = customFrom;
      if (customTo) p.end_date = customTo;
    }
    
    return p;
  }, [page, perPage, debouncedSearch, activeFilter, timeRange, customFrom, customTo]);

  return (
    <StatementContext.Provider value={{ params, searchQuery, setSearchQuery, activeFilter, setActiveFilter, page, setPage, perPage, setPerPage }}>
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Account Statements</h1>
            <p className="text-muted-foreground text-sm">
              Chronological ledger of all inbound and outbound transactions.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Select value={timeRange} onValueChange={(v) => { setTimeRange(v as TimeRange); setPage(1); }}>
                <SelectTrigger className="w-32 sm:w-36">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(rangeLabels) as TimeRange[])
                      .filter((r) => r !== "custom")
                      .map((r) => (
                        <SelectItem key={r} value={r}>
                          {rangeLabels[r]}
                        </SelectItem>
                      ))}
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {timeRange === "custom" && (
                <div className="hidden sm:flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={customFrom}
                    onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={customTo}
                    onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                  />
                </div>
              )}

            </div>

            {/* Custom date inputs — own row on mobile only */}
            {timeRange === "custom" && (
              <div className="flex sm:hidden items-center gap-2 w-full mt-2">
                <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                <Input
                  type="date"
                  className="h-8 w-full text-xs"
                  value={customFrom}
                  onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="h-8 w-full text-xs"
                  value={customTo}
                  onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                />
              </div>
            )}
          </div>
        </div>

        <StatementStats />
        <StatementTable />
      </div>
    </StatementContext.Provider>
  );
}
