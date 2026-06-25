"use client";

import * as React from "react";
import { CalendarIcon, Download, Search, Package, ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { toast } from "sonner";

import { useCourierReports } from "@/hooks/useCourierReports";
import { ParcelReportStats } from "./_components/parcel-reports-stats";
import { ParcelReportsTable } from "./_components/parcel-reports-table";
import { downloadCSV } from "@/lib/csv-export";

type TimeRange = "all_time" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

const PARCEL_STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "ready_to_ship", label: "Ready To Ship" },
  { value: "in_courier", label: "In-Courier" },
  { value: "ship_later", label: "Ship Later" },
  { value: "hold", label: "Hold" },
  { value: "returned", label: "Returned" },
  { value: "pre_order", label: "Pre-Order" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "missing", label: "Missing" },
  { value: "lost", label: "Lost" },
  { value: "fake", label: "Fake" },
  { value: "trash", label: "Trash" },
];

const rangeLabels: Record<TimeRange, string> = {
  all_time: "All Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom Range",
};

export default function ParcelReportPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("all_time");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  const [sortBy, setSortBy] = React.useState("created_at");
  const [sortDir, setSortDir] = React.useState("desc");
  const [tab, setTab] = React.useState("all");

  const [isExporting, setIsExporting] = React.useState(false);

  // Debounced search on input change
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // When filters change, reset page to 1
  React.useEffect(() => {
    setPage(1);
  }, [timeRange, customFrom, customTo, sortBy, sortDir, tab]);

  const queryParams: Record<string, any> = {
    period: timeRange,
    page,
    limit: 15,
    sort_by: sortBy,
    sort_dir: sortDir,
    tab: tab,
  };

  if (searchQuery) queryParams.search = searchQuery;
  if (timeRange === "custom") {
    queryParams.start_date = customFrom;
    queryParams.end_date = customTo;
  }

  const { data, isLoading } = useCourierReports(queryParams);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportParams = new URLSearchParams();
      exportParams.append("period", timeRange);
      exportParams.append("limit", "10000"); // large limit to get all records
      exportParams.append("sort_by", sortBy);
      exportParams.append("sort_dir", sortDir);
      exportParams.append("tab", tab);
      if (searchQuery) exportParams.append("search", searchQuery);
      if (timeRange === "custom" && customFrom && customTo) {
        exportParams.append("start_date", customFrom);
        exportParams.append("end_date", customTo);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_PARCEL_REPORTS_URL || "courier-reports";

      const { fetchClient } = await import("@/lib/fetch-client");
      const res = await fetchClient(`${baseUrl}${endpoint}?${exportParams.toString()}`);

      if (!res.ok) throw new Error("Failed to export data");

      const json = await res.json();
      if (json.success && json.table_data && json.table_data.data) {
        downloadCSV(json.table_data.data, `Parcel_Reports_${new Date().toISOString().split("T")[0]}.csv`);
        toast.success("Report exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Parcel Report</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your parcel performance, deliveries, and returns.
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

      {/* Stats Cards */}
      <ParcelReportStats stats={data?.stats} />

      {/* Data Table wrapped in Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">
            {PARCEL_STATUSES.find((s) => s.value === tab)?.label || "All"} Parcels
          </CardTitle>
          <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            {(() => {
              if (!data?.stats) return 0;
              if (tab === "all") return data.stats.total_parcels || 0;
              if (tab === "delivered") return data.stats.total_delivered_parcel || 0;
              if (tab === "returned") return data.stats.total_returned_parcel || 0;
              const dynamicKey = `total_${tab}_parcel`;
              return (data.stats as any)[dynamicKey] || 0;
            })()} parcels
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 size-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative shrink-0 w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-8 w-full rounded-[min(var(--radius-md),12px)] pl-8 bg-background"
                  placeholder="Search orders..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-[140px] bg-background">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="order_no">Order No</SelectItem>
                  <SelectItem value="order_status">Order Status</SelectItem>
                  <SelectItem value="payment_status">Payment Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              >
                <ArrowUpDown />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground tracking-widest uppercase">
              STATUS: <ChevronDown className="size-3" />
            </div>

            <ToggleGroup
              className="flex-wrap justify-start gap-2"
              onValueChange={(v) => {
                if (!v) return;
                setTab(v);
              }}
              type="single"
              value={tab}
            >
              {PARCEL_STATUSES.map((status) => {
                let count = 0;
                if (data?.stats) {
                  if (status.value === "all") count = data.stats.total_parcels || 0;
                  else if (status.value === "delivered") count = data.stats.total_delivered_parcel || 0;
                  else if (status.value === "returned") count = data.stats.total_returned_parcel || 0;
                  else {
                    const dynamicKey = `total_${status.value}_parcel`;
                    count = (data.stats as any)[dynamicKey] || 0;
                  }
                }

                return (
                  <ToggleGroupItem
                    key={status.value}
                    value={status.value}
                    variant="outline"
                    className="whitespace-nowrap h-8 px-3 rounded-md border-border bg-transparent data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:border-foreground hover:bg-muted hover:text-foreground text-xs"
                  >
                    {status.label} ({count})
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          <ParcelReportsTable
            data={data?.table_data?.data}
            currentPage={data?.table_data?.current_page || 1}
            lastPage={data?.table_data?.last_page || 1}
            onPageChange={(p) => setPage(p)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
