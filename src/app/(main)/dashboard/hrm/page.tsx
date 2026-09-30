"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Clock,
  CreditCard,
  Building2,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  UserX,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Send,
  Bell,
  BadgeAlert,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHrmOverview } from "@/hooks/useHrm";
import { useAuth } from "@/hooks/useAuth";

export default function HrmDashboardPage() {
  const { overview, loading } = useHrmOverview();
  const { user } = useAuth();

  const counts = overview?.counts || {
    total_employees: 0,
    active_employees: 0,
    today_present: 0,
    today_late: 0,
    today_absent: 0,
    today_on_leave: 0,
    active_loans_total: 0,
    active_loans_count: 0,
    total_monthly_payroll: 0,
    paid_monthly_payroll: 0,
    unpaid_monthly_payroll: 0,
  };

  const departments = overview?.departments || [];
  const recentNotices = overview?.recent_notices || [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            HRM & People Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete workforce intelligence, organization hierarchy, automated attendance, payroll, loans, documents, and self-service.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/hrm/self-service">
            <Button variant="outline" className="gap-2 shadow-2xs">
              <UserCheck className="size-4 text-emerald-600" />
              <span>Self-Service Portal (ESS)</span>
            </Button>
          </Link>
          <Link href="/dashboard/hrm/organization">
            <Button variant="default" className="gap-2 shadow-sm">
              <Building2 className="size-4" />
              <span>Org Hierarchy Tree</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core HRM Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Workforce */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Workforce
            </CardTitle>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                {counts.total_employees}
              </div>
              <Badge variant="secondary" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                {counts.active_employees} Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Across <strong>{departments.length}</strong> operational departments
            </p>
          </CardContent>
        </Card>

        {/* 2. Today's Attendance */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Attendance
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CalendarCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                {counts.today_present}
                <span className="text-sm font-normal text-muted-foreground ml-1">present</span>
              </div>
              {counts.today_late > 0 && (
                <Badge variant="outline" className="text-[11px] font-semibold text-amber-600 border-amber-500/30">
                  {counts.today_late} Late
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {counts.today_absent > 0 ? (
                <span className="text-rose-500 font-medium">{counts.today_absent} absent</span>
              ) : (
                <span className="text-emerald-600 font-medium">100% On duty</span>
              )}{" "}
              • {counts.today_on_leave} on approved leave
            </p>
          </CardContent>
        </Card>

        {/* 3. Monthly Payroll Expense */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Payroll
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                ৳{Number(counts.total_monthly_payroll || 0).toLocaleString()}
              </div>
              <Badge variant="secondary" className="text-[11px] font-semibold text-blue-600 bg-blue-500/10">
                Processed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Paid: ৳{Number(counts.paid_monthly_payroll || 0).toLocaleString()} • Unpaid: ৳
              {Number(counts.unpaid_monthly_payroll || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* 4. Active Loans & Advances */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Advances & Loans
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                ৳{Number(counts.active_loans_total || 0).toLocaleString()}
              </div>
              <Badge variant="outline" className="text-[11px] font-medium text-amber-600 border-amber-500/30">
                {counts.active_loans_count} Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-deducted installments from monthly payroll
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          HRM Sub-Modules & Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Org Structure */}
          <Link href="/dashboard/hrm/organization">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  18. Organization Structure
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hierarchical company tree (CEO/MD → Management → Marketing / Sales / Accounts) & reporting managers.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>View Org Chart</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 2. Attendance */}
          <Link href="/dashboard/hrm/attendance">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  20. Attendance Management
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Check-in, check-out, working hours, late penalty, overtime tracking, daily sheets & monthly logs.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Manage Attendance</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 3. Salary & Payroll */}
          <Link href="/dashboard/hrm/salaries">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  21. Salary Management
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Basic + Allowances + Bonus - Deductions = Net Salary. Monthly payroll generation, payslips, and payment status.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Payroll & Payslips</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 3.1 Employee Cash Flow */}
          <Link href="/dashboard/hrm/cash-flow">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  Employee Cash Flow
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monthly & yearly cash flow, incentive earnings, weekday working hours rule & under-worked hour deficit deductions.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Cash Flow & Outflow</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 4. Loans & Advances */}
          <Link href="/dashboard/hrm/loans">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  22. Employee Loan / Advance
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Advance amount, installments, remaining amount, automatic monthly deduction from salary payroll.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Manage Loans</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 5. Documents */}
          <Link href="/dashboard/hrm/documents">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  23. Employee Documents
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  CV, Contract, Offer Letter, Joining Letter, Certificates, NID/Passport, Training, and Performance files.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Document Vault</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 6. Resignation / Termination */}
          <Link href="/dashboard/hrm/exits">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserX className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  24. Resignation / Termination
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Notice period, final settlement calculation, advance adjustment, asset return, and exit records.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Exit Management</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 7. Self-Service Portal */}
          <Link href="/dashboard/hrm/self-service">
            <Card className="p-4 border border-primary/30 bg-primary/[0.02] hover:border-primary hover:shadow-sm transition-all group h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  25. Self-Service Portal (ESS)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Employee account access for Punch In/Out, Leave application, Payslips, Documents, Tasks, and Notices.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Open Employee Portal</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 8. Employees Directory */}
          <Link href="/dashboard/hrm/employees">
            <Card className="p-4 border hover:border-primary/50 hover:shadow-sm transition-all group bg-card h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  Employees Directory
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  List of all employees from system users table with assigned departments, designations, and salaries.
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1">
                <span>View All Employees</span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Bottom Section: Department Distribution & Company Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview */}
        <Card className="lg:col-span-2 border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Company Departments & Structure
              </CardTitle>
              <CardDescription className="text-xs">
                Active business units and staff allocations
              </CardDescription>
            </div>
            <Link href="/dashboard/hrm/organization">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                View Org Tree <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((dept: any) => (
                <div
                  key={dept.id}
                  className="p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate">{dept.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {dept.code || "DEPT"}
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                    <span>Team members:</span>
                    <strong className="text-sm font-extrabold text-foreground">
                      {dept.employees_count || 0}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Announcements / Notices */}
        <Card className="border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Company Notices
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No announcements published yet.</p>
            ) : (
              recentNotices.map((n: any) => (
                <div key={n.id} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">{n.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-semibold ${
                        n.priority === "urgent" || n.priority === "high"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }`}
                    >
                      {n.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
