"use client";

import * as React from "react";
import { CalendarIcon, Download, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useProductReports } from "@/hooks/useProductReports";
import { ProductReportStats } from "./_components/product-reports-stats";
import { ProductReportsTable } from "./_components/product-reports-table";
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

export default function ProductReportPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("all_time");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [searchInput, setSearchInput] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [sortBy, setSortBy] = React.useState("total_profit");
  const [sortDir, setSortDir] = React.useState("desc");

  const [isExporting, setIsExporting] = React.useState(false);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [timeRange, customFrom, customTo, sortBy, sortDir, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const queryParams: Record<string, any> = {
    period: timeRange,
    page,
    limit: 15,
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  if (searchQuery) queryParams.search = searchQuery;
  if (timeRange === "custom") {
    if (customFrom) queryParams.start_date = customFrom;
    if (customTo) queryParams.end_date = customTo;
  }

  const { data, isLoading } = useProductReports(queryParams);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const exportParams = new URLSearchParams();
      exportParams.append("period", timeRange);
      exportParams.append("limit", "10000");
      exportParams.append("sort_by", sortBy);
      exportParams.append("sort_dir", sortDir);
      if (searchQuery) exportParams.append("search", searchQuery);
      if (timeRange === "custom" && customFrom && customTo) {
        exportParams.append("start_date", customFrom);
        exportParams.append("end_date", customTo);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_PRODUCT_REPORTS_URL || "product-report";

      const { fetchClient } = await import("@/lib/fetch-client");
      const res = await fetchClient(`${baseUrl}${endpoint}?${exportParams.toString()}`);

      if (!res.ok) throw new Error("Failed to export data");

      const json = await res.json();
      if (json.success && json.data?.data) {
        downloadCSV(json.data.data, `Product_Report_${new Date().toISOString().split("T")[0]}.csv`);
        toast.success("Report exported successfully");
      }
    } catch {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Product Report</h1>
          <p className="text-muted-foreground text-sm">Analyze product sales, profits, and stock performance.</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Period Select */}
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

            {/* Custom date pickers — desktop */}
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

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="mr-2 size-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>

          {/* Custom date pickers — mobile */}
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

          <Button
            variant="outline"
            size="sm"
            className="sm:hidden w-full mt-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 size-4" />
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <ProductReportStats summary={data?.summary} />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by product name or SKU..."
              className="pl-8 bg-background"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-muted-foreground shrink-0">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total_profit">Profit</SelectItem>
              <SelectItem value="total_sold_unit">Sold Units</SelectItem>
              <SelectItem value="total_order_value">Order Value</SelectItem>
              <SelectItem value="total_purchase_value">Purchase Value</SelectItem>
              <SelectItem value="product_name">Product Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
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

      {/* Data Table */}
      <ProductReportsTable
        data={data?.data?.data}
        currentPage={data?.data?.current_page || 1}
        lastPage={data?.data?.last_page || 1}
        total={data?.data?.total || 0}
        from={data?.data?.from || 0}
        to={data?.data?.to || 0}
        onPageChange={(p) => setPage(p)}
        isLoading={isLoading}
      />
    </div>
  );
}
