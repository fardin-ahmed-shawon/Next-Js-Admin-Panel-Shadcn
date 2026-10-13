"use client";
import type { PerformanceLayoutProps } from "./performance-layout";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  Building2,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Eye,
  Filter,
  Flame,
  Medal,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  Trophy,
  Truck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useHrmLeaderboard, LeaderboardEmployee } from "@/hooks/useHrmLeaderboard";
import { EmployeeActivityModal } from "@/components/hrm/EmployeeActivityModal";

type TimePreset = "today" | "this_week" | "this_month" | "last_month" | "all_time" | "custom";

const timePresetLabels: Record<TimePreset, string> = {
  all_time: "All Time",
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  last_month: "Last Month",
  custom: "Custom Range",
};

function getDateRange(preset: TimePreset): { start?: string; end?: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  switch (preset) {
    case "today":
      return { start: todayStr, end: todayStr };
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return { start: d.toISOString().slice(0, 10), end: todayStr };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      return { start, end };
    }
    case "all_time":
    default:
      return {};
  }
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
};

export default function HrmLeaderboardPage({ performanceControls, performanceContent, onDatesChange, onPerformanceRefresh, departmentId = "all" }: PerformanceLayoutProps = {}) {
  const [timePreset, setTimePreset] = React.useState<TimePreset>("all_time");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("score");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] = React.useState<LeaderboardEmployee | null>(null);

  // Pagination
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  const dates = React.useMemo(() => {
    if (timePreset === "custom") {
      return { start: customStart || undefined, end: customEnd || undefined };
    }
    return getDateRange(timePreset);
  }, [timePreset, customStart, customEnd]);

  React.useEffect(() => { onDatesChange?.({ start: dates.start, end: dates.end }); }, [onDatesChange, dates.start, dates.end]);

  const { data, isLoading, mutate } = useHrmLeaderboard({
    startDate: dates.start,
    endDate: dates.end,
    departmentId: performanceControls ? departmentId : selectedDepartment,
    sortBy,
  });

  const leaderboard = data?.leaderboard || [];
  const topPodium = data?.top_podium || [];
  const departments = data?.departments || [];

  const filteredLeaderboard = React.useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase();
    return leaderboard.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department_name.toLowerCase().includes(q) ||
        emp.designation_title.toLowerCase().includes(q)
    );
  }, [leaderboard, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaderboard.length / perPage));
  const paginatedEmployees = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredLeaderboard.slice(start, start + perPage);
  }, [filteredLeaderboard, page, perPage]);

  // Aggregate totals
  const totalDeliveredOrders = React.useMemo(
    () => leaderboard.reduce((acc, emp) => acc + (emp.delivered_count || 0), 0),
    [leaderboard]
  );
  const totalDeliveredRevenue = React.useMemo(
    () => leaderboard.reduce((acc, emp) => acc + (emp.delivered_revenue || 0), 0),
    [leaderboard]
  );
  const totalUpsellValue = React.useMemo(
    () => leaderboard.reduce((acc, emp) => acc + (emp.upsell_total || 0), 0),
    [leaderboard]
  );

  const handleResetFilters = () => {
    setSelectedDepartment("all");
    setSortBy("score");
    setSearchQuery("");
    setTimePreset("all_time");
    setCustomStart("");
    setCustomEnd("");
    setPage(1);
  };

  const hasFilters =
    selectedDepartment !== "all" ||
    sortBy !== "score" ||
    !!searchQuery ||
    timePreset !== "all_time";

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-500/20 text-amber-600 font-bold text-xs">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-slate-300/40 text-slate-700 font-bold text-xs">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-700/20 text-amber-800 font-bold text-xs">
          🥉
        </span>
      );
    }
    return (
      <span className="text-xs text-muted-foreground font-semibold">
        #{rank}
      </span>
    );
  };

  if (isLoading && !data && !performanceControls) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + Toolbar (Orders page header design) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Title + description (hidden on mobile, shown on sm+) */}
        <div className="space-y-1 hidden sm:block">
          <h1 className="text-3xl tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Department performance rankings, order fulfillment success rates, and employee activity audit trails.
          </p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <h1 className="text-2xl tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Department performance rankings and employee activity trails.
          </p>
        </div>

        {/* Controls: on mobile = full-width row, desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/hrm/department-performance">
                <Building2 className="mr-2 size-4 text-primary" />
                Departments
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/hrm/upsell-report">
                <Flame className="mr-2 size-4 text-emerald-500" />
                Upsell Report
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Select
                value={timePreset}
                onValueChange={(v) => {
                  setTimePreset(v as TimePreset);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32 sm:w-36">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(timePresetLabels) as TimePreset[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {timePresetLabels[p]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Custom date inputs — inline on desktop only */}
              {timePreset === "custom" && (
                <div className="hidden sm:flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      setPage(1);
                    }}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              )}

              <Button
                size="icon"
                variant="outline"
                aria-label="Refresh leaderboard"
                onClick={() => { mutate(); onPerformanceRefresh?.(); }}
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Custom date inputs — own row on mobile only */}
          {timePreset === "custom" && (
            <div className="flex sm:hidden items-center gap-2 w-full">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                className="h-8 flex-1 text-xs"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPage(1);
                }}
              />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <Input
                type="date"
                className="h-8 flex-1 text-xs"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {performanceControls}
      {performanceContent ?? <>
      {!performanceControls && <>
      {/* Department Filter Section (Top of Stats Area) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground shrink-0">
            Department:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDepartment === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => {
              setSelectedDepartment("all");
              setPage(1);
            }}
          >
            All Departments ({data?.total_participants || leaderboard.length})
          </Button>
          {departments.map((dept) => (
            <Button
              key={dept.id}
              variant={selectedDepartment === String(dept.id) ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => {
                setSelectedDepartment(String(dept.id));
                setPage(1);
              }}
            >
              {dept.name}
            </Button>
          ))}
        </div>
      </div>

      </>}
      {/* KPI Stats Strip (Connected card design matching OrderStats) */}
      <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-2 lg:grid-cols-4 lg:[&>*]:border-b-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*:last-child]:border-r-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Delivered Orders</CardTitle>
              <CardAction>
                <PackageCheck className="size-4 text-blue-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight font-semibold text-foreground">
                {totalDeliveredOrders.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Across all departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Delivered Revenue</CardTitle>
              <CardAction>
                <DollarSign className="size-4 text-emerald-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight font-semibold text-emerald-600 dark:text-emerald-400">
                ৳{totalDeliveredRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Completed orders value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Upsell Value Generated</CardTitle>
              <CardAction>
                <TrendingUp className="size-4 text-amber-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight font-semibold text-amber-600 dark:text-amber-400">
                ৳{totalUpsellValue.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Extra revenue added</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Top Performer</CardTitle>
              <CardAction>
                <Trophy className="size-4 text-purple-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl leading-none tracking-tight font-semibold truncate">
                {topPodium[0]?.name || "None yet"}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Score: {topPodium[0]?.performance_score ?? "0"}
                </span>
                {topPodium[0]?.department_name && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                    {topPodium[0].department_name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topPodium.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 - Silver Performer */}
          {topPodium[1] && (
            <Card className="order-2 md:order-1 border shadow-xs hover:border-slate-400/50 transition-colors flex flex-col justify-between">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 mb-3">
                  <Medal className="size-3.5 text-slate-500 dark:text-slate-300" />
                  <span>2nd Place</span>
                </div>

                <Avatar className="size-16 ring-2 ring-slate-300 dark:ring-slate-700 shadow-xs mb-3">
                  <AvatarImage src={topPodium[1].avatar} alt={topPodium[1].name} />
                  <AvatarFallback className="font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {getInitials(topPodium[1].name)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="font-bold text-base text-foreground leading-snug">
                  {topPodium[1].name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] font-normal py-0">
                    {topPodium[1].department_name}
                  </Badge>
                  <span>•</span>
                  <span>{topPodium[1].designation_title}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3.5 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Delivered</span>
                    <span className="font-bold text-foreground text-sm mt-0.5 block">{topPodium[1].delivered_count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Upsell</span>
                    <span className="font-bold text-emerald-600 text-sm mt-0.5 block">৳{topPodium[1].upsell_total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Score</span>
                    <span className="font-extrabold text-primary text-sm mt-0.5 block">{topPodium[1].performance_score}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployee(topPodium[1])}
                  className="mt-4 text-xs w-full gap-1.5 h-8"
                >
                  <Eye className="size-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rank 1 - Champion */}
          {topPodium[0] && (
            <Card className="order-1 md:order-2 border-amber-500/40 bg-gradient-to-b from-amber-500/[0.04] to-card shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-t-xl" />
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-extrabold border border-amber-500/30 mb-3 shadow-2xs">
                  <Trophy className="size-3.5 text-amber-500" />
                  <span>1st Place Champion</span>
                </div>

                <Avatar className="size-20 ring-3 ring-amber-400 shadow-xs mb-3">
                  <AvatarImage src={topPodium[0].avatar} alt={topPodium[0].name} />
                  <AvatarFallback className="font-black text-base bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
                    {getInitials(topPodium[0].name)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="font-extrabold text-lg text-foreground leading-snug">
                  {topPodium[0].name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 text-[10px] font-semibold py-0">
                    {topPodium[0].department_name}
                  </Badge>
                  <span>•</span>
                  <span>{topPodium[0].designation_title}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3.5 border-t border-amber-500/20 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Delivered</span>
                    <span className="font-bold text-foreground text-sm mt-0.5 block">{topPodium[0].delivered_count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Upsell</span>
                    <span className="font-bold text-emerald-600 text-sm mt-0.5 block">৳{topPodium[0].upsell_total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Score</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm mt-0.5 block">{topPodium[0].performance_score}</span>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedEmployee(topPodium[0])}
                  className="mt-4 text-xs w-full gap-1.5 h-8 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  <Eye className="size-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rank 3 - Bronze Performer */}
          {topPodium[2] && (
            <Card className="order-3 border shadow-xs hover:border-amber-700/40 transition-colors flex flex-col justify-between">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-700/10 text-amber-800 dark:text-amber-400 text-[11px] font-bold border border-amber-700/20 mb-3">
                  <Award className="size-3.5 text-amber-700 dark:text-amber-500" />
                  <span>3rd Place</span>
                </div>

                <Avatar className="size-16 ring-2 ring-amber-700/40 shadow-xs mb-3">
                  <AvatarImage src={topPodium[2].avatar} alt={topPodium[2].name} />
                  <AvatarFallback className="font-bold text-sm bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                    {getInitials(topPodium[2].name)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="font-bold text-base text-foreground leading-snug">
                  {topPodium[2].name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] font-normal py-0">
                    {topPodium[2].department_name}
                  </Badge>
                  <span>•</span>
                  <span>{topPodium[2].designation_title}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3.5 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Delivered</span>
                    <span className="font-bold text-foreground text-sm mt-0.5 block">{topPodium[2].delivered_count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Upsell</span>
                    <span className="font-bold text-emerald-600 text-sm mt-0.5 block">৳{topPodium[2].upsell_total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Score</span>
                    <span className="font-extrabold text-primary text-sm mt-0.5 block">{topPodium[2].performance_score}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployee(topPodium[2])}
                  className="mt-4 text-xs w-full gap-1.5 h-8"
                >
                  <Eye className="size-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Leaderboard Table Section (Orders table design) */}
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-normal text-muted-foreground text-sm">
              Employee Rankings
            </CardTitle>
            <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
              {filteredLeaderboard.length} of {leaderboard.length} employees
            </CardDescription>
          </div>

          <CardAction className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-full sm:w-72 xl:w-96 rounded-[min(var(--radius-md),12px)] pl-8 text-xs"
                aria-label="Search leaderboard"
                placeholder="Search employee, email, designation..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4">
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Performance Score</SelectItem>
                <SelectItem value="delivered">Delivered Orders</SelectItem>
                <SelectItem value="revenue">Delivered Value</SelectItem>
                <SelectItem value="upsell">Upsell Value</SelectItem>
                <SelectItem value="rate">Delivery Rate %</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleResetFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Table Container (Orders table design) */}
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1000px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14 text-center">Rank</TableHead>
                  <TableHead className="min-w-[180px]">Employee</TableHead>
                  <TableHead className="min-w-[140px]">Department</TableHead>
                  <TableHead className="text-center min-w-[90px]">Assigned</TableHead>
                  <TableHead className="min-w-[160px]">Delivery Success</TableHead>
                  <TableHead className="text-right min-w-[120px]">Delivered Value</TableHead>
                  <TableHead className="text-right min-w-[130px]">Upsell Total</TableHead>
                  <TableHead className="min-w-[180px]">Status Breakdown</TableHead>
                  <TableHead className="text-center min-w-[80px]">Score</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="size-6 animate-spin text-primary" />
                        <span className="text-sm">Calculating department performance rankings...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                          <UserX className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No employees found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search query or department filter."
                            : "No orders assigned or upsells recorded for the selected department/period."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <TableRow key={emp.user_id} className="hover:bg-muted/50 transition-colors">
                      {/* Rank */}
                      <TableCell className="text-center font-bold">
                        <div className="flex justify-center">{getRankBadge(emp.rank)}</div>
                      </TableCell>

                      {/* Employee Info */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarImage src={emp.avatar} alt={emp.name} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {getInitials(emp.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground text-xs truncate">
                              {emp.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {emp.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department & Designation */}
                      <TableCell>
                        <div className="flex flex-col items-start gap-0.5">
                          <Badge variant="secondary" className="text-[10px] font-medium py-0">
                            {emp.department_name}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {emp.designation_title}
                          </span>
                        </div>
                      </TableCell>

                      {/* Assigned Orders */}
                      <TableCell className="text-center font-semibold text-xs">
                        {emp.total_assigned}
                      </TableCell>

                      {/* Delivery Rate with Progress */}
                      <TableCell>
                        <div className="space-y-1 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {emp.delivered_count} Delivered
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {emp.delivery_rate}%
                            </span>
                          </div>
                          <Progress
                            value={emp.delivery_rate}
                            className="h-1.5 bg-muted"
                          />
                        </div>
                      </TableCell>

                      {/* Delivered Revenue */}
                      <TableCell className="text-right font-mono font-medium text-xs text-foreground">
                        ৳{emp.delivered_revenue.toLocaleString()}
                      </TableCell>

                      {/* Upsell Total */}
                      <TableCell className="text-right">
                        {emp.upsell_total > 0 ? (
                          <div className="flex flex-col items-end">
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold gap-1 py-0">
                              <TrendingUp className="size-2.5" />
                              ৳{emp.upsell_total.toLocaleString()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {emp.upsell_count} upsold
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Status Breakdown Chips */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {emp.status_counts.in_courier > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 gap-1 px-1.5 py-0"
                              title="In-Courier"
                            >
                              <Truck className="size-2.5" /> {emp.status_counts.in_courier}
                            </Badge>
                          )}
                          {emp.status_counts.confirmed > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300 gap-1 px-1.5 py-0"
                              title="Confirmed"
                            >
                              <CheckCircle className="size-2.5" /> {emp.status_counts.confirmed}
                            </Badge>
                          )}
                          {emp.status_counts.returned > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300 gap-1 px-1.5 py-0"
                              title="Returned"
                            >
                              <RotateCcw className="size-2.5" /> {emp.status_counts.returned}
                            </Badge>
                          )}
                          {emp.status_counts.cancelled > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 gap-1 px-1.5 py-0"
                              title="Cancelled"
                            >
                              <XCircle className="size-2.5" /> {emp.status_counts.cancelled}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Performance Score */}
                      <TableCell className="text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">
                          {emp.performance_score}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployee(emp)}
                          className="h-7 px-2 text-xs text-primary hover:bg-primary/10 font-semibold gap-1"
                        >
                          <Eye className="size-3.5" />
                          Activity
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination (matching Orders page) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={`${perPage}`}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50, 100].map((s) => (
                    <SelectItem key={s} value={`${s}`}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">
                Page {page} of {totalPages}
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage(1)}
                disabled={page <= 1 || isLoading}
                aria-label="First page"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || isLoading}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || isLoading}
                aria-label="Last page"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Modal */}
      <EmployeeActivityModal
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        startDate={dates.start}
        endDate={dates.end}
        timeRangeLabel={timePresetLabels[timePreset]}
      />
      </>}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Department Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 rounded" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-md" />
          ))}
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 [&>*]:border-b lg:[&>*]:border-b-0 [&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r p-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="size-4 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-8 w-52 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-md" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between border-b pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 rounded" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
