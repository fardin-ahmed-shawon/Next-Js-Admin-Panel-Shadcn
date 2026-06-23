"use client";

import * as React from "react";
import { Loader2, Search, Users, Trophy, TrendingUp, PackageCheck, ListTodo, Coins } from "lucide-react";
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
import Link from "next/link";

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
  pending: number;
  confirmed: number;
  readyToShip: number;
  inCourier: number;
  shipLater: number;
  hold: number;
  returned: number;
  preOrder: number;
  delivered: number;
  cancelled: number;
  missing: number;
  lost: number;
  fake: number;
  trash: number;
  totalItems: number;
  totalRevenue: number;
  totalDue: number;
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

  const reportData = React.useMemo(() => {
    if (!rawReports) return [];
    return rawReports
      .map((report) => {
        let pending = 0;
        let confirmed = 0;
        let readyToShip = 0;
        let inCourier = 0;
        let shipLater = 0;
        let hold = 0;
        let returned = 0;
        let preOrder = 0;
        let delivered = 0;
        let cancelled = 0;
        let missing = 0;
        let lost = 0;
        let fake = 0;
        let trash = 0;
        let totalItems = 0;
        let totalRevenue = 0;
        let totalDue = 0;

        report.orders.forEach((order) => {
          const statusLower = order.order_status?.toLowerCase().replace(/[\s-]/g, "") || "";

          if (statusLower === "pending") pending++;
          else if (statusLower === "confirmed") confirmed++;
          else if (statusLower === "readytoship") readyToShip++;
          else if (statusLower === "incourier") inCourier++;
          else if (statusLower === "shiplater") shipLater++;
          else if (statusLower === "hold") hold++;
          else if (statusLower === "returned" || statusLower === "return") returned++;
          else if (statusLower === "preorder") preOrder++;
          else if (statusLower === "delivered") delivered++;
          else if (statusLower === "cancelled" || statusLower === "cancel" || statusLower === "canceled") cancelled++;
          else if (statusLower === "missing") missing++;
          else if (statusLower === "lost") lost++;
          else if (statusLower === "fake") fake++;
          else if (statusLower === "trash") trash++;

          const paidSum = order.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
          totalRevenue += paidSum;
          totalDue += Math.max(0, Number(order.grand_total_amount || 0) - paidSum);

          order.ordered_products?.forEach((product) => {
            totalItems += product.qty;
          });
        });

        return {
          userId: report.user_id,
          name: report.full_name,
          email: report.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(report.full_name || "U")}&background=random`,
          totalAssigned: report.orders.length,
          pending,
          confirmed,
          readyToShip,
          inCourier,
          shipLater,
          hold,
          returned,
          preOrder,
          delivered,
          cancelled,
          missing,
          lost,
          fake,
          trash,
          totalItems,
          totalRevenue,
          totalDue,
          rawReport: report,
        } as EmployeeReportAggregatedData;
      })
      .filter((emp) => emp.totalAssigned > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue); // Default sort by revenue for Top Performer
  }, [rawReports]);

  // Aggregate Stats
  const globalStats = React.useMemo(() => {
    return reportData.reduce(
      (acc, curr) => {
        acc.totalAssigned += curr.totalAssigned;
        acc.totalDelivered += curr.delivered;
        acc.totalRevenue += curr.totalRevenue;
        acc.totalDue += curr.totalDue;
        return acc;
      },
      { totalAssigned: 0, totalDelivered: 0, totalRevenue: 0, totalDue: 0 }
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
          <div className="flex items-center gap-3 min-w-[170px]">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground leading-none">{name}</span>
              <span className="text-[11px] text-muted-foreground mt-1">{row.original.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAssigned",
      header: "Total Order",
      cell: ({ row }) => <span className="font-semibold text-primary">{row.getValue("totalAssigned")}</span>,
    },
    {
      accessorKey: "pending",
      header: "Pending",
      cell: ({ row }) => {
        const val = row.original.pending;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "confirmed",
      header: "Confirmed",
      cell: ({ row }) => {
        const val = row.original.confirmed;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "readyToShip",
      header: "Ready To Ship",
      cell: ({ row }) => {
        const val = row.original.readyToShip;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "inCourier",
      header: "In-Courier",
      cell: ({ row }) => {
        const val = row.original.inCourier;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "shipLater",
      header: "Ship Later",
      cell: ({ row }) => {
        const val = row.original.shipLater;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "hold",
      header: "Hold",
      cell: ({ row }) => {
        const val = row.original.hold;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "returned",
      header: "Returned",
      cell: ({ row }) => {
        const val = row.original.returned;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "preOrder",
      header: "Pre-Order",
      cell: ({ row }) => {
        const val = row.original.preOrder;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "delivered",
      header: "Delivered",
      cell: ({ row }) => {
        const val = row.original.delivered;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "cancelled",
      header: "Cancelled",
      cell: ({ row }) => {
        const val = row.original.cancelled;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "missing",
      header: "Missing",
      cell: ({ row }) => {
        const val = row.original.missing;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lost",
      header: "Lost",
      cell: ({ row }) => {
        const val = row.original.lost;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "fake",
      header: "Fake",
      cell: ({ row }) => {
        const val = row.original.fake;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "trash",
      header: "Trash",
      cell: ({ row }) => {
        const val = row.original.trash;
        return val === 0 ? <span className="text-muted-foreground/30">0</span> : (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold">
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalRevenue",
      header: "Collected Revenue",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalRevenue"));
        return <span className="font-semibold text-emerald-600">৳{amount.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "totalDue",
      header: "Due Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalDue"));
        return <span className="font-semibold text-red-600">৳{amount.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "totalItems",
      header: "Items Handled",
      cell: ({ row }) => {
        return <span className="font-semibold">{row.getValue("totalItems")}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/reports/employee/${row.original.userId}?timeRange=${timeRange}&from=${customFrom}&to=${customTo}`}>
              View Details
            </Link>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">Workforce Due</CardTitle>
            <Coins className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">৳{globalStats.totalDue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total outstanding due</p>
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

    </div>
  );
}
