"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Users,
  Building2,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
  RefreshCw,
  PackageCheck,
  TrendingUp,
  Sparkles,
  BarChart3,
  Flame,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
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
import { useHrmLeaderboard, LeaderboardEmployee } from "@/hooks/useHrmLeaderboard";
import { EmployeeActivityModal } from "@/components/hrm/EmployeeActivityModal";

type TimePreset = "today" | "this_week" | "this_month" | "last_month" | "all_time" | "custom";

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

export default function HrmLeaderboardPage() {
  const [timePreset, setTimePreset] = React.useState<TimePreset>("all_time");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("score");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] = React.useState<LeaderboardEmployee | null>(null);

  const dates = React.useMemo(() => {
    if (timePreset === "custom") {
      return { start: customStart || undefined, end: customEnd || undefined };
    }
    return getDateRange(timePreset);
  }, [timePreset, customStart, customEnd]);

  const { data, isLoading, mutate } = useHrmLeaderboard({
    startDate: dates.start,
    endDate: dates.end,
    departmentId: selectedDepartment,
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

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div
          className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs"
          title="Rank #1"
        >
          <Trophy className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div
          className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs"
          title="Rank #2"
        >
          <Medal className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div
          className="w-7 h-7 rounded-full bg-amber-700/15 text-amber-700 dark:text-amber-500 border border-amber-700/30 flex items-center justify-center font-bold text-xs"
          title="Rank #3"
        >
          <Award className="w-3.5 h-3.5" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-[11px] border border-border/40">
        {rank}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1680px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Department Performance Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time department metrics, order fulfillment rates, upsell contributions, and employee audit trails.
          </p>
        </div>

        {/* Quick Links & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/hrm/department-performance">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Dept Performance
            </Button>
          </Link>
          <Link href="/dashboard/reports/upsell">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Flame className="w-3.5 h-3.5 text-emerald-500" />
              Upsell Report
            </Button>
          </Link>
          <Link href="/dashboard/reports/employee">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Employee Report
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="gap-1.5 h-9 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 space-y-3.5">
          {/* Department Selection Pills (No ugly scrollbar) */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setSelectedDepartment("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                selectedDepartment === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All Departments ({data?.total_participants || 0})
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDepartment(String(dept.id))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedDepartment === String(dept.id)
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
            {/* Live Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search employee, email, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={timePreset} onValueChange={(val) => setTimePreset(val as TimePreset)}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all_time">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {timePreset === "custom" && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="h-9 w-32 text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="h-9 w-32 text-xs"
                  />
                </div>
              )}

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="score">Performance Score</SelectItem>
                  <SelectItem value="delivered">Delivered Orders</SelectItem>
                  <SelectItem value="revenue">Delivered Value</SelectItem>
                  <SelectItem value="upsell">Upsell Value</SelectItem>
                  <SelectItem value="rate">Delivery Rate %</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium Cards */}
      {topPodium.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 - Silver Performer */}
          {topPodium[1] && (
            <Card className="order-2 md:order-1 border-slate-300 dark:border-slate-800 bg-card shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 mb-3">
                  <Medal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                  <span>2nd Place</span>
                </div>

                <Avatar className="h-16 w-16 ring-2 ring-slate-300 dark:ring-slate-700 shadow-sm mb-3">
                  <AvatarImage src={topPodium[1].avatar} alt={topPodium[1].name} />
                  <AvatarFallback className="font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {topPodium[1].name.slice(0, 2).toUpperCase()}
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
                  <Eye className="w-3.5 h-3.5" /> View Activity Trail
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
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>1st Place Champion</span>
                </div>

                <Avatar className="h-20 w-20 ring-3 ring-amber-400 shadow-sm mb-3">
                  <AvatarImage src={topPodium[0].avatar} alt={topPodium[0].name} />
                  <AvatarFallback className="font-black text-base bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
                    {topPodium[0].name.slice(0, 2).toUpperCase()}
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
                  <Eye className="w-3.5 h-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rank 3 - Bronze Performer */}
          {topPodium[2] && (
            <Card className="order-3 border-amber-700/30 dark:border-amber-900/40 bg-card shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-700/10 text-amber-800 dark:text-amber-400 text-[11px] font-bold border border-amber-700/20 mb-3">
                  <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
                  <span>3rd Place</span>
                </div>

                <Avatar className="h-16 w-16 ring-2 ring-amber-700/40 shadow-sm mb-3">
                  <AvatarImage src={topPodium[2].avatar} alt={topPodium[2].name} />
                  <AvatarFallback className="font-bold text-sm bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                    {topPodium[2].name.slice(0, 2).toUpperCase()}
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
                  <Eye className="w-3.5 h-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Leaderboard Table Section */}
      <Card className="border shadow-xs bg-card">
        <CardHeader className="p-4 sm:p-5 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">
              Employee Rankings & Detailed Breakdown
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Rankings calculated department-wise based on delivery rate, order volume, and verified upsell value.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                <TableRow>
                  <TableHead className="w-14 text-center">Rank</TableHead>
                  <TableHead className="min-w-[180px]">Employee</TableHead>
                  <TableHead className="min-w-[130px]">Department</TableHead>
                  <TableHead className="text-center w-20">Assigned</TableHead>
                  <TableHead className="min-w-[160px]">Delivery Success</TableHead>
                  <TableHead className="text-right min-w-[120px]">Delivered Value</TableHead>
                  <TableHead className="text-right min-w-[120px]">Upsell Total</TableHead>
                  <TableHead className="min-w-[170px]">Status Breakdown</TableHead>
                  <TableHead className="text-center w-20">Score</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                      <span className="text-xs">Calculating department performance rankings...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Users className="w-8 h-8 text-muted-foreground/40 mb-1" />
                        <p className="font-semibold text-sm text-foreground">No employees found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search query."
                            : "No orders assigned or upsells recorded for the selected department/period."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaderboard.map((emp) => (
                    <TableRow key={emp.user_id} className="hover:bg-muted/30 transition-colors">
                      {/* Rank */}
                      <TableCell className="text-center font-bold">
                        <div className="flex justify-center">{getRankBadge(emp.rank)}</div>
                      </TableCell>

                      {/* Employee Info */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={emp.avatar} alt={emp.name} />
                            <AvatarFallback className="text-xs font-bold">
                              {emp.name.slice(0, 2).toUpperCase()}
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
                        <div className="space-y-1">
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
                              <TrendingUp className="w-2.5 h-2.5" />
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
                              <Truck className="w-2.5 h-2.5" /> {emp.status_counts.in_courier}
                            </Badge>
                          )}
                          {emp.status_counts.confirmed > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300 gap-1 px-1.5 py-0"
                              title="Confirmed"
                            >
                              <CheckCircle className="w-2.5 h-2.5" /> {emp.status_counts.confirmed}
                            </Badge>
                          )}
                          {emp.status_counts.returned > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300 gap-1 px-1.5 py-0"
                              title="Returned"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> {emp.status_counts.returned}
                            </Badge>
                          )}
                          {emp.status_counts.cancelled > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 gap-1 px-1.5 py-0"
                              title="Cancelled"
                            >
                              <XCircle className="w-2.5 h-2.5" /> {emp.status_counts.cancelled}
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
                          <Eye className="w-3.5 h-3.5" />
                          Activity
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Modal */}
      <EmployeeActivityModal
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
      />
    </div>
  );
}
