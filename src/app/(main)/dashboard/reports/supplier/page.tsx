"use client";

import * as React from "react";
import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { useSupplierReports } from "@/hooks/useSupplierReports";
import { SupplierReportsStats } from "./_components/supplier-reports-stats";
import { SupplierReportsTable } from "./_components/supplier-reports-table";
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

export default function SupplierReportPage() {
  const { features } = useModularFeatures();
  if (features?.reports_supplier === false || String(features?.reports_supplier) === "0") {
    // Enabled by default unless explicitly set to false
  }

  const [timeRange, setTimeRange] = React.useState<TimeRange>("all_time");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Filters within table card
  const [searchVal, setSearchVal] = React.useState("");
  const [statusVal, setStatusVal] = React.useState("all");

  // Submitted filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [sortBy, setSortBy] = React.useState("total_purchase_amount");
  const [sortDir, setSortDir] = React.useState("desc");

  const [isExporting, setIsExporting] = React.useState(false);

  // Reset page when any filter query changes
  React.useEffect(() => {
    setPage(1);
  }, [timeRange, customFrom, customTo, sortBy, sortDir, searchQuery, statusFilter]);

  const queryParams: Record<string, any> = {
    page,
    limit: 15,
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  if (searchQuery) queryParams.search = searchQuery;
  if (statusFilter !== "all") queryParams.payment_status = statusFilter;

  if (timeRange === "custom") {
    if (customFrom) queryParams.start_date = customFrom;
    if (customTo) queryParams.end_date = customTo;
  } else if (timeRange !== "all_time") {
    queryParams.period = timeRange;
  }

  const { data, isLoading, mutate } = useSupplierReports(queryParams);

  const handleFilterSubmit = () => {
    setSearchQuery(searchVal);
    setStatusFilter(statusVal);
    setPage(1);
  };

  const handleReset = () => {
    setSearchVal("");
    setStatusVal("all");
    setSearchQuery("");
    setStatusFilter("all");
    setTimeRange("all_time");
    setCustomFrom("");
    setCustomTo("");
    setSortBy("total_purchase_amount");
    setSortDir("desc");
    setPage(1);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const items = data?.data?.data || [];
      if (items.length === 0) {
        toast.info("No supplier report data to export.");
        return;
      }

      const csvData = items.map((item, index) => ({
        "SL": index + 1,
        "Supplier ID": item.supplier_id || "N/A",
        "Supplier Name": item.supplier_name,
        "Phone": item.phone || "N/A",
        "Email": item.email || "N/A",
        "Address": item.address || "N/A",
        "Purchase Count": item.purchase_count,
        "Total Purchase Amount (BDT)": Number(item.total_purchase_amount || 0).toFixed(2),
        "Total Paid Amount (BDT)": Number(item.total_paid_amount || 0).toFixed(2),
        "Total Due Amount (BDT)": Number(item.total_due_amount || 0).toFixed(2),
        "Payment Status": item.payment_status?.toUpperCase() || "N/A",
        "Last Purchase Date": item.last_purchase_date ? new Date(item.last_purchase_date).toLocaleDateString() : "N/A",
      }));

      downloadCSV(csvData, `supplier-report-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("Supplier report exported successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export supplier report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Report</h1>
          <p className="text-muted-foreground text-sm">
            Monitor supplier purchases, paid amounts, outstanding balances, and settlement analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
            <SelectTrigger className="w-[150px] h-9">
              <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {(Object.keys(rangeLabels) as TimeRange[]).map((range) => (
                  <SelectItem key={range} value={range}>
                    {rangeLabels[range]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Custom Date Inputs if custom is selected */}
          {timeRange === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 w-[130px] text-xs"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 w-[130px] text-xs"
              />
            </div>
          )}

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={handleExportCSV}
            disabled={isExporting || isLoading}
          >
            <Download className="mr-2 size-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => mutate()}
            title="Refresh Data"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <SupplierReportsStats summary={data?.summary} />

      {/* Supplier Report Table */}
      <SupplierReportsTable
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
        statusFilter={statusVal}
        setStatusFilter={setStatusVal}
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
