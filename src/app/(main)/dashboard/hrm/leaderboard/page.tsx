"use client";

import * as React from "react";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  TrendingUp,
  Search,
  Filter,
  Users,
  PackageCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
  Loader2,
  RefreshCw,
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
import Link from "next/link";

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
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
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
  const departmentSummaries = data?.department_summaries || [];

  // Filter leaderboard by live search
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
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold text-sm shadow-sm">
          🥇 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300/30 text-slate-600 dark:text-slate-300 border border-slate-300/60 flex items-center justify-center font-bold text-sm shadow-sm">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-500 border border-amber-700/40 flex items-center justify-center font-bold text-sm shadow-sm">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" /> HRM Performance Profile & Leaderboard
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              Department Performance Leaderboard
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Inspire excellence and healthy competition. Real-time department metrics, order delivery rates, audit trails, and upsell achievements.
            </p>
          </div>

          {/* Quick Links & Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/dashboard/reports/upsell">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Flame className="w-4 h-4 text-emerald-500" />
                Upsell Report
              </Button>
            </Link>
            <Link href="/dashboard/reports/employee">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                Employee Report
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Bar inside Header */}
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Department Pills / Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedDepartment("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedDepartment === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              All Departments ({data?.total_participants || 0})
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(String(dept.id))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDepartment === String(dept.id)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Controls: Time & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={timePreset} onValueChange={(val) => setTimePreset(val as TimePreset)}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>

            {timePreset === "custom" && (
              <div className="flex items-center gap-1 text-xs">
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
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
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
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topPodium.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 - Silver */}
          {topPodium[1] && (
            <Card className="order-2 md:order-1 relative overflow-hidden border-slate-300/40 dark:border-slate-700/50 bg-gradient-to-b from-slate-100/60 dark:from-slate-900/40 to-card shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-3 right-3 text-2xl">🥈</div>
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <Avatar className="h-16 w-16 border-2 border-slate-300 shadow-md">
                    <AvatarImage src={topPodium[1].avatar} alt={topPodium[1].name} />
                    <AvatarFallback className="font-bold">
                      {topPodium[1].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
                    #2
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight">
                  {topPodium[1].name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {topPodium[1].department_name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{topPodium[1].designation_title}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-border/50 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Delivered</div>
                    <div className="font-bold text-foreground text-sm mt-0.5">{topPodium[1].delivered_count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Upsell</div>
                    <div className="font-bold text-emerald-600 text-sm mt-0.5">৳{topPodium[1].upsell_total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Score</div>
                    <div className="font-extrabold text-primary text-sm mt-0.5">{topPodium[1].performance_score}</div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmployee(topPodium[1])}
                  className="mt-3 text-xs w-full gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rank 1 - Gold Champion */}
          {topPodium[0] && (
            <Card className="order-1 md:order-2 relative overflow-hidden border-amber-500/40 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-card shadow-lg ring-2 ring-amber-500/20">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
              <div className="absolute top-3 right-3 text-3xl animate-bounce">👑</div>
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 blur-sm opacity-70" />
                  <Avatar className="h-20 w-20 border-3 border-amber-400 shadow-xl relative">
                    <AvatarImage src={topPodium[0].avatar} alt={topPodium[0].name} />
                    <AvatarFallback className="font-black text-xl bg-amber-100 text-amber-900">
                      {topPodium[0].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 text-xs font-black shadow">
                    #1 CHAMPION
                  </span>
                </div>
                <h3 className="font-black text-lg text-foreground leading-tight">
                  {topPodium[0].name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-semibold">
                    {topPodium[0].department_name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-medium">{topPodium[0].designation_title}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-amber-500/20 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Delivered</div>
                    <div className="font-black text-foreground text-base mt-0.5">{topPodium[0].delivered_count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Upsell Total</div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-base mt-0.5">৳{topPodium[0].upsell_total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Score</div>
                    <div className="font-black text-amber-600 dark:text-amber-400 text-base mt-0.5">{topPodium[0].performance_score}</div>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedEmployee(topPodium[0])}
                  className="mt-3.5 text-xs w-full gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow"
                >
                  <Eye className="w-3.5 h-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rank 3 - Bronze */}
          {topPodium[2] && (
            <Card className="order-3 relative overflow-hidden border-amber-700/30 dark:border-amber-900/40 bg-gradient-to-b from-amber-700/10 dark:from-amber-950/20 to-card shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-3 right-3 text-2xl">🥉</div>
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <Avatar className="h-16 w-16 border-2 border-amber-700/40 shadow-md">
                    <AvatarImage src={topPodium[2].avatar} alt={topPodium[2].name} />
                    <AvatarFallback className="font-bold">
                      {topPodium[2].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-400 text-[10px] font-bold">
                    #3
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight">
                  {topPodium[2].name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {topPodium[2].department_name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{topPodium[2].designation_title}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-border/50 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Delivered</div>
                    <div className="font-bold text-foreground text-sm mt-0.5">{topPodium[2].delivered_count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Upsell</div>
                    <div className="font-bold text-emerald-600 text-sm mt-0.5">৳{topPodium[2].upsell_total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] uppercase font-semibold">Score</div>
                    <div className="font-extrabold text-primary text-sm mt-0.5">{topPodium[2].performance_score}</div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmployee(topPodium[2])}
                  className="mt-3 text-xs w-full gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Activity Trail
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Leaderboard Table Section */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Employee Rankings & Detailed Breakdown
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Rankings calculated department-wise based on delivery rate, order volume, and upsell value.
            </CardDescription>
          </div>

          {/* Live Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search employee, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead className="min-w-[200px]">Employee</TableHead>
                  <TableHead className="min-w-[130px]">Department</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="min-w-[160px]">Delivery Success</TableHead>
                  <TableHead className="text-right">Delivered Value</TableHead>
                  <TableHead className="min-w-[140px] text-right">Upsell Total</TableHead>
                  <TableHead className="min-w-[170px]">Status Breakdown</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm">Calculating department metrics & leaderboard...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
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
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage src={emp.avatar} alt={emp.name} />
                            <AvatarFallback className="text-xs font-bold">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-sm truncate">
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
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="secondary" className="text-[11px] font-semibold">
                            {emp.department_name}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {emp.designation_title}
                          </span>
                        </div>
                      </TableCell>

                      {/* Assigned Orders */}
                      <TableCell className="text-center">
                        <span className="font-bold text-foreground text-sm">
                          {emp.total_assigned}
                        </span>
                      </TableCell>

                      {/* Delivery Rate with Progress */}
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
                      <TableCell className="text-right font-bold text-sm text-foreground">
                        ৳{emp.delivered_revenue.toLocaleString()}
                      </TableCell>

                      {/* Upsell Total */}
                      <TableCell className="text-right">
                        {emp.upsell_total > 0 ? (
                          <div className="flex flex-col items-end">
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                              <TrendingUp className="w-3 h-3" />
                              +৳{emp.upsell_total.toLocaleString()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {emp.upsell_count} upsold
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">৳0</span>
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
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black text-sm">
                          {emp.performance_score}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployee(emp)}
                          className="h-8 px-2 text-xs text-primary hover:bg-primary/10 font-semibold gap-1"
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
