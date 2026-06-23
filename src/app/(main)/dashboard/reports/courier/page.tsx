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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import { useCourierReports } from "@/hooks/useCourierReports";
import { CourierReportStats } from "./_components/courier-reports-stats";
import { CourierReportsTable } from "./_components/courier-reports-table";
import { downloadCSV } from "@/lib/csv-export";

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
  const [page, setPage] = React.useState(1);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  
  const [sortBy, setSortBy] = React.useState("created_at");
  const [sortDir, setSortDir] = React.useState("desc");
  const [tab, setTab] = React.useState("all");

  const [isExporting, setIsExporting] = React.useState(false);

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

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
      // Construct the URL to fetch all data for the current filters
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
      const endpoint = process.env.NEXT_PUBLIC_API_COURIER_REPORTS_URL || "courier-reports";
      
      // Assume fetchClient is available globally or we can use standard fetch with our token 
      // For this implementation we will hit our SWR fetcher endpoint manually
      // Actually, since we need to pass Auth, we can just use the global fetchClient or a standard fetch if cookies are handled.
      // But we can also just dynamically import the fetchClient to avoid changing imports.
      const { fetchClient } = await import("@/lib/fetch-client");
      const res = await fetchClient(`${baseUrl}${endpoint}?${exportParams.toString()}`);
      
      if (!res.ok) throw new Error("Failed to export data");
      
      const json = await res.json();
      if (json.success && json.table_data && json.table_data.data) {
        downloadCSV(json.table_data.data, `Courier_Reports_${new Date().toISOString().split("T")[0]}.csv`);
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
          <h1 className="text-3xl tracking-tight">Courier Report</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your courier performance, deliveries, and returns.
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

            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 size-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
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

          <Button variant="outline" size="sm" className="sm:hidden w-full mt-2" onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 size-4" />
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <CourierReportStats stats={data?.stats} />

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Order No or Tracking Code..."
              className="pl-8 bg-background"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-muted-foreground shrink-0">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date</SelectItem>
              <SelectItem value="order_no">Order No</SelectItem>
              <SelectItem value="order_status">Order Status</SelectItem>
              <SelectItem value="payment_status">Payment Status</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortDir} onValueChange={setSortDir}>
            <SelectTrigger className="w-[100px] bg-background">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table with Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Parcels</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>
        
        {["all", "delivered", "returned"].map((t) => (
          <TabsContent key={t} value={t} className="mt-0">
            <CourierReportsTable
              data={data?.table_data?.data}
              currentPage={data?.table_data?.current_page || 1}
              lastPage={data?.table_data?.last_page || 1}
              onPageChange={(p) => setPage(p)}
              isLoading={isLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
