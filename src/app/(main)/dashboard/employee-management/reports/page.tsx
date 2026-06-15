"use client";

import * as React from "react";
import { Loader2, Search, Users, Trophy, TrendingUp, PackageCheck, ListTodo } from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployeeReports, EmployeeReportData } from "@/hooks/useEmployeeReports";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeReportDetails } from "./_components/employee-report-details";

type TimeRange = "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily":
      return now.toISOString().slice(0, 10);
    case "weekly":
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    case "monthly":
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 10);
    case "4months":
      d.setMonth(d.getMonth() - 4);
      return d.toISOString().slice(0, 10);
    case "6months":
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0, 10);
    default:
      return "";
  }
}

interface EmployeeReportAggregatedData {
  userId: number;
  name: string;
  email: string;
  avatar: string;
  totalAssigned: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalItems: number;
  totalRevenue: number;
  totalCollected: number;
  rawReport: EmployeeReportData;
}

export default function EmployeeReportsPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const startDate = React.useMemo(() => {
    if (timeRange === "custom") return customFrom || undefined;
    if (timeRange === "alltime") return undefined;
    return getDateFrom(timeRange);
  }, [timeRange, customFrom]);

  const endDate = React.useMemo(() => {
    if (timeRange === "custom") return customTo || undefined;
    if (timeRange === "alltime") return undefined;
    return new Date().toISOString().slice(0, 10);
  }, [timeRange, customTo]);

  const { data: rawReports, isLoading } = useEmployeeReports(startDate, endDate);
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeReportData | null>(null);

  const reportData = React.useMemo(() => {
    return rawReports.map((report) => {
      let deliveredOrders = 0;
      let pendingOrders = 0;
      let totalItems = 0;
      let totalRevenue = 0;
      let totalCollected = 0;

      report.orders.forEach((order) => {
        if (order.order_status === "Delivered") deliveredOrders++;
        if (order.order_status === "Pending") pendingOrders++;
        
        totalRevenue += order.grand_total_amount;
        
        order.ordered_products?.forEach((product) => {
          totalItems += product.qty;
        });

        order.payments?.forEach((payment) => {
          totalCollected += payment.paid_amount;
        });
      });

      return {
        userId: report.user_id,
        name: report.full_name,
        email: report.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(report.full_name || "U")}&background=random`,
        totalAssigned: report.assigned_orders_count,
        deliveredOrders,
        pendingOrders,
        totalItems,
        totalRevenue,
        totalCollected,
        rawReport: report,
      } as EmployeeReportAggregatedData;
    }).sort((a, b) => b.totalRevenue - a.totalRevenue); // Default sort by revenue for Top Performer
  }, [rawReports]);

  // Aggregate Stats
  const globalStats = React.useMemo(() => {
    return reportData.reduce(
      (acc, curr) => {
        acc.totalAssigned += curr.totalAssigned;
        acc.totalDelivered += curr.deliveredOrders;
        acc.totalRevenue += curr.totalRevenue;
        return acc;
      },
      { totalAssigned: 0, totalDelivered: 0, totalRevenue: 0 }
    );
  }, [reportData]);

  const topPerformer = reportData.length > 0 ? reportData[0] : null;

  const columns: ColumnDef<EmployeeReportAggregatedData>[] = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const initials = name.substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAssigned",
      header: "Total Assigned",
      cell: ({ row }) => <span className="font-medium text-primary">{row.getValue("totalAssigned")}</span>,
    },
    {
      accessorKey: "deliveredOrders",
      header: "Delivered",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {row.getValue("deliveredOrders")}
        </Badge>
      ),
    },
    {
      accessorKey: "pendingOrders",
      header: "Pending",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {row.getValue("pendingOrders")}
        </Badge>
      ),
    },
    {
      accessorKey: "totalItems",
      header: "Items Handled",
      cell: ({ row }) => <span className="font-medium">{row.getValue("totalItems")}</span>,
    },
    {
      accessorKey: "totalRevenue",
      header: "Total Revenue",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalRevenue"));
        return <span className="font-semibold text-primary">৳{amount.toLocaleString()}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(row.original.rawReport)}>
            View Details
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reportData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl tracking-tight flex items-center gap-2">
            Employee Reports
            {isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground text-sm">
            Performance metrics and order handling overview for your workforce.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          {timeRange === "custom" && (
            <>
              <Input
                type="date"
                className="w-36"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                className="w-36"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </>
          )}
          <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
            <SelectTrigger className="w-36 bg-background">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="4months">4 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="alltime">All Time</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" /> Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformer ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={topPerformer.avatar} />
                  <AvatarFallback>{topPerformer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{topPerformer.name}</span>
                  <span className="text-xs text-muted-foreground">৳{topPerformer.totalRevenue.toLocaleString()} Generated</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Workforce Revenue</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{globalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total order value handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <ListTodo className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalAssigned}</div>
            <p className="text-xs text-muted-foreground">Orders delegated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Successful Deliveries</CardTitle>
            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{globalStats.totalDelivered}</div>
            <p className="text-xs text-muted-foreground">Across all employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Breakdown</CardTitle>
          <CardDescription>Detailed stats for each employee in the selected time period.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Employee..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="h-8 w-64 pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="size-6 text-muted-foreground" />
                        <span className="text-sm">No employee data found for this period.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmployeeReportDetails
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
        employeeData={selectedEmployee}
      />
    </div>
  );
}
