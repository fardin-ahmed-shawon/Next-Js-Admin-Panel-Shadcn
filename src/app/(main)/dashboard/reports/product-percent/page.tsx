"use client";
import { useModularFeatures } from "@/hooks/useModularFeatures";

import * as React from "react";
import { CalendarIcon, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useProductPercentReports } from "@/hooks/useProductPercentReports";
import { ProductPercentStats } from "./_components/product-percent-stats";
import { ProductPercentTable } from "./_components/product-percent-table";
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

export default function ProductPercentReportPage() {
  const { features } = useModularFeatures();
  if (features?.reports_product_percent === false || String(features?.reports_product_percent) === "0") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">This report feature is currently disabled.</p>
      </div>
    );
  }
  const [timeRange, setTimeRange] = React.useState<TimeRange>("all_time");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Filters within table card
  const [searchVal, setSearchVal] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [sortBy, setSortBy] = React.useState("orders");
  const [sortDir, setSortDir] = React.useState("desc");

  const [isExporting, setIsExporting] = React.useState(false);

  // Reset page when any filter query changes
  React.useEffect(() => {
    setPage(1);
  }, [timeRange, customFrom, customTo, sortBy, sortDir, searchQuery]);

  const queryParams: Record<string, any> = {
    page,
    limit: 15,
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  if (searchQuery) queryParams.search = searchQuery;

  if (timeRange === "custom") {
    if (customFrom) queryParams.start_date = customFrom;
    if (customTo) queryParams.end_date = customTo;
  } else if (timeRange !== "all_time") {
    queryParams.period = timeRange;
  }

  const { data, isLoading } = useProductPercentReports(queryParams);

  const handleFilterSubmit = () => {
    setSearchQuery(searchVal);
    setPage(1);
  };

  const handleReset = () => {
    setSearchVal("");
    setSearchQuery("");
    setTimeRange("all_time");
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const exportParams = new URLSearchParams();
      exportParams.append("limit", "10000"); // load all records
      exportParams.append("sort_by", sortBy);
      exportParams.append("sort_dir", sortDir);
      if (searchQuery) exportParams.append("search", searchQuery);

      if (timeRange === "custom") {
        if (customFrom) exportParams.append("start_date", customFrom);
        if (customTo) exportParams.append("end_date", customTo);
      } else if (timeRange !== "all_time") {
        exportParams.append("period", timeRange);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_PRODUCT_PERCENT_URL || "product-percent";

      const { fetchClient } = await import("@/lib/fetch-client");
      const res = await fetchClient(`${baseUrl}${endpoint}?${exportParams.toString()}`);

      if (!res.ok) throw new Error("Failed to export data");

      const json = await res.json();
      if (json.success && json.data?.data) {
        // Flatten the status percentages for clean CSV export
        const exportData = json.data.data.map((row: any, index: number) => ({
          SL_No: index + 1,
          Product_Name: row.product_name,
          SKU: row.sku,
          Date: row.date,
          Total_Orders: row.orders,
          Pending_Count: row.pending?.count || 0,
          Pending_Percentage: `${row.pending?.percentage || 0}%`,
          Confirmed_Count: row.confirmed?.count || 0,
          Confirmed_Percentage: `${row.confirmed?.percentage || 0}%`,
          ReadyToShip_Count: row.ready_to_ship?.count || 0,
          ReadyToShip_Percentage: `${row.ready_to_ship?.percentage || 0}%`,
          InCourier_Count: row.in_courier?.count || 0,
          InCourier_Percentage: `${row.in_courier?.percentage || 0}%`,
          Delivered_Count: row.delivered?.count || 0,
          Delivered_Percentage: `${row.delivered?.percentage || 0}%`,
          Returned_Count: row.returned?.count || 0,
          Returned_Percentage: `${row.returned?.percentage || 0}%`,
          Cancelled_Count: row.cancelled?.count || 0,
          Cancelled_Percentage: `${row.cancelled?.percentage || 0}%`,
        }));

        downloadCSV(exportData, `Product_Percent_Report_${new Date().toISOString().split("T")[0]}.csv`);
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
          <h1 className="text-3xl tracking-tight">Product Percent Report</h1>
          <p className="text-muted-foreground text-sm">
            View order status distributions and percentages for each product.
          </p>
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

            {/* Custom date range selection — desktop */}
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

          {/* Custom date range selection — mobile */}
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

      {/* Summary Stats Cards */}
      <ProductPercentStats summary={data?.summary} />

      {/* Product Percent Data Table */}
      <ProductPercentTable
        data={data?.data?.data || []}
        isLoading={isLoading}
        currentPage={data?.data?.current_page || 1}
        lastPage={data?.data?.last_page || 1}
        total={data?.data?.total || 0}
        from={data?.data?.from || 0}
        to={data?.data?.to || 0}
        onPageChange={(p) => setPage(p)}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onFilterSubmit={handleFilterSubmit}
        onReset={handleReset}
      />
    </div>
  );
}
