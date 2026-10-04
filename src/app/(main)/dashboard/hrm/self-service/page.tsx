"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Bell,
  CheckSquare,
  Plus,
  ArrowLeft,
  Briefcase,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard,
  LogOut,
  LogIn,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import {
  useHrmSelfService,
  essCheckIn,
  essCheckOut,
  essApplyLeave,
  essRequestAdvance,
  updateTaskStatus,
} from "@/hooks/useHrm";
import { hasSelfAttendanceAccess } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmployeeSelfServicePortalPage() {
  const { portalData, loading, refetch } = useHrmSelfService();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isPunching, setIsPunching] = useState(false);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState("casual");
  const [leaveStart, setLeaveStart] = useState(new Date().toISOString().split("T")[0]);
  const [leaveEnd, setLeaveEnd] = useState(new Date().toISOString().split("T")[0]);
  const [leaveReason, setLeaveReason] = useState("");

  // Advance Form
  const [advanceAmount, setAdvanceAmount] = useState(5000);
  const [advanceInstallments, setAdvanceInstallments] = useState(2);
  const [advancePurpose, setAdvancePurpose] = useState("");

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      setIsPunching(true);
      const res = await essCheckIn();
      toast.success(res.message || "Checked in successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Check-in failed");
    } finally {
      setIsPunching(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsPunching(true);
      const res = await essCheckOut();
      toast.success(res.message || "Checked out successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Check-out failed");
    } finally {
      setIsPunching(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await essApplyLeave({
        leave_type: leaveType,
        start_date: leaveStart,
        end_date: leaveEnd,
        reason: leaveReason,
      });
      toast.success("Leave request submitted to HR for approval!");
      setIsLeaveModalOpen(false);
      setLeaveReason("");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await essRequestAdvance({
        amount: Number(advanceAmount),
        total_installments: Number(advanceInstallments),
        purpose: advancePurpose,
      });
      toast.success("Salary advance request submitted successfully!");
      setIsAdvanceModalOpen(false);
      setAdvancePurpose("");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit advance request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await updateTaskStatus(taskId, nextStatus);
      toast.success(`Task marked as ${nextStatus}`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to update task");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground animate-pulse">
        Loading your Employee Self-Service dashboard...
      </div>
    );
  }

  const user = portalData?.user;
  const detail = user?.employee_detail;
  const todayAtt = portalData?.today_attendance;
  const leaveBalance = portalData?.leave_balance || { total: 20, taken: 0, remaining: 20 };
  const recentAttendances = portalData?.recent_attendances || [];
  const mySalaries = portalData?.my_salaries || [];
  const myLoans = portalData?.my_loans || [];
  const myDocs = portalData?.my_documents || [];
  const notices = portalData?.notices || [];
  const myWarnings = portalData?.my_warnings || [];
  const myTasks = portalData?.my_tasks || [];

  const canSelfCheckInOut = portalData?.can_self_check_in_out !== undefined 
    ? Boolean(portalData.can_self_check_in_out) 
    : hasSelfAttendanceAccess(user);

  return (
    <div className="space-y-6">
      {/* Top Banner / User Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-border/60 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{user?.full_name}</h1>
                <Badge variant="secondary" className="bg-primary/15 text-primary text-xs font-semibold">
                  {detail?.employee_id || `#EMP-${user?.id}`}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <span>{detail?.designation?.name || "Staff Member"}</span>
                <span>•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {detail?.department?.name || "Operations"}
                </span>
              </p>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                <span>Reporting To: <strong className="text-foreground">{detail?.manager?.full_name || "CEO / Management"}</strong></span>
                <span>•</span>
                <span>Join Date: {detail?.joining_date || "2026-01-01"}</span>
                <span>•</span>
                <span>Email: {user?.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Punch / Time Widget */}
          <div className="bg-background/90 backdrop-blur-md rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center min-w-[240px]">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
              <Clock className="h-3.5 w-3.5 text-primary" /> Live Time
            </div>
            <div className="text-2xl font-black font-mono tracking-wider text-foreground mb-3">
              {currentTime || "09:00:00 AM"}
            </div>
            <div className="flex items-center gap-2 w-full">
              {!canSelfCheckInOut ? (
                <div className="w-full py-2 px-3 text-center bg-muted/60 text-muted-foreground text-xs rounded-lg border border-border flex items-center justify-center gap-1.5 font-medium">
                  <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Self Punch Disabled</span>
                </div>
              ) : !todayAtt?.check_in ? (
                <Button
                  onClick={handleCheckIn}
                  disabled={isPunching}
                  size="sm"
                  className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <LogIn className="h-4 w-4" /> Check In
                </Button>
              ) : !todayAtt?.check_out ? (
                <Button
                  onClick={handleCheckOut}
                  disabled={isPunching}
                  size="sm"
                  variant="destructive"
                  className="w-full gap-1.5 font-semibold"
                >
                  <LogOut className="h-4 w-4" /> Check Out
                </Button>
              ) : (
                <div className="w-full py-1 text-center bg-emerald-50 text-emerald-700 text-xs font-semibold rounded border border-emerald-200 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Day Completed
                </div>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 text-center">
              {todayAtt?.check_in
                ? `In: ${todayAtt.check_in} ${todayAtt.check_out ? `• Out: ${todayAtt.check_out}` : "(Active)"}`
                : canSelfCheckInOut
                ? "Not checked in yet today"
                : "Attendance managed by HR / Biometrics"}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Leave Balance */}
        <Card className="border-border/60 shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Annual Leave Balance</span>
              <Calendar className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {leaveBalance.remaining}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ {leaveBalance.total} Days Left</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex justify-between items-center pt-0">
            <span>Taken: {leaveBalance.taken} days</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary text-xs font-semibold"
              onClick={() => setIsLeaveModalOpen(true)}
            >
              Apply Leave
            </Button>
          </CardContent>
        </Card>

        {/* Basic Salary */}
        <Card className="border-border/60 shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Monthly Base Salary</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              ৳ {Number(detail?.basic_salary || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex justify-between items-center pt-0">
            <span>Allowances: ৳{Number(detail?.total_allowances || 0).toLocaleString()}</span>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Active</Badge>
          </CardContent>
        </Card>

        {/* Active Advance / Loan */}
        <Card className="border-border/60 shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Salary Advance Due</span>
              <CreditCard className="h-4 w-4 text-amber-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              ৳{" "}
              {myLoans
                .filter((l: any) => l.status === "active" || l.status === "approved")
                .reduce((s: number, l: any) => s + Number(l.remaining_amount), 0)
                .toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex justify-between items-center pt-0">
            <span>Monthly Deduction</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary text-xs font-semibold"
              onClick={() => setIsAdvanceModalOpen(true)}
            >
              Request Advance
            </Button>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-border/60 shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Assigned Tasks</span>
              <CheckSquare className="h-4 w-4 text-purple-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {myTasks.filter((t: any) => t.status !== "completed").length}{" "}
              <span className="text-xs font-normal text-muted-foreground">Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex justify-between items-center pt-0">
            <span>{myTasks.filter((t: any) => t.status === "completed").length} Completed</span>
            <Badge variant="outline" className="text-[10px]">{myTasks.length} Total</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs for ESS Portal */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 flex flex-wrap h-auto gap-1 border border-border/50">
          <TabsTrigger value="attendance" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <Clock className="h-3.5 w-3.5" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <Calendar className="h-3.5 w-3.5" /> Leaves
          </TabsTrigger>
          <TabsTrigger value="payslips" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <DollarSign className="h-3.5 w-3.5" /> Salary & Payslips
          </TabsTrigger>
          <TabsTrigger value="advances" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <CreditCard className="h-3.5 w-3.5" /> Advances / Loans
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <CheckSquare className="h-3.5 w-3.5" /> My Tasks
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <FileText className="h-3.5 w-3.5" /> My Documents
          </TabsTrigger>
          <TabsTrigger value="notices" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <Bell className="h-3.5 w-3.5" /> Notice Board
            {notices.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary text-primary-foreground">
                {notices.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="warnings" className="text-xs flex items-center gap-1.5 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Warnings / Disciplinary
            {myWarnings.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white">
                {myWarnings.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 1. ATTENDANCE HISTORY TAB */}
        <TabsContent value="attendance">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Attendance Log (Past 30 Days)</CardTitle>
                  <CardDescription className="text-xs">Your verified check-ins, working hours, and overtime records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check-In</th>
                      <th className="px-4 py-3">Check-Out</th>
                      <th className="px-4 py-3">Hours Worked</th>
                      <th className="px-4 py-3">Overtime</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recentAttendances.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                          No recent attendance logs found.
                        </td>
                      </tr>
                    ) : (
                      recentAttendances.map((att: any) => (
                        <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{att.date}</td>
                          <td className="px-4 py-3 text-xs">{att.check_in || "—"}</td>
                          <td className="px-4 py-3 text-xs">{att.check_out || "—"}</td>
                          <td className="px-4 py-3 text-xs font-mono">{att.working_hours} hrs</td>
                          <td className="px-4 py-3 text-xs text-emerald-600 font-mono">
                            {att.overtime_hours > 0 ? `+${att.overtime_hours} hrs` : "0"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                att.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : att.status === "late"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : att.status === "leave"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }
                            >
                              {att.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. LEAVES TAB */}
        <TabsContent value="leaves">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">My Leave Requests</CardTitle>
                  <CardDescription className="text-xs">
                    Apply for casual, sick, or annual leave and track manager approval
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsLeaveModalOpen(true)} className="gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Apply for Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                    <tr>
                      <th className="px-4 py-3">Leave Type</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {portalData?.my_leaves?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          No leave applications logged yet.
                        </td>
                      </tr>
                    ) : (
                      portalData?.my_leaves?.map((lv: any) => (
                        <tr key={lv.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold capitalize text-foreground">{lv.leave_type} Leave</td>
                          <td className="px-4 py-3 text-xs">
                            {lv.start_date} to {lv.end_date}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium">{lv.days} day(s)</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{lv.reason}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                lv.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : lv.status === "rejected"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {lv.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. SALARY & PAYSLIPS TAB */}
        <TabsContent value="payslips">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Salary & Payment Slips</CardTitle>
              <CardDescription className="text-xs">
                Monthly breakdown: Basic, Allowances, Overtime, Bonus, Deductions & Net Payout
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                    <tr>
                      <th className="px-4 py-3">Month / Year</th>
                      <th className="px-4 py-3">Gross Salary</th>
                      <th className="px-4 py-3">Advance Deduction</th>
                      <th className="px-4 py-3 text-rose-600">Fines & Penalties</th>
                      <th className="px-4 py-3">Net Salary</th>
                      <th className="px-4 py-3">Payment Status</th>
                      <th className="px-4 py-3">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {mySalaries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                          No payroll slips generated yet.
                        </td>
                      </tr>
                    ) : (
                      mySalaries.map((sal: any) => (
                        <tr key={sal.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {sal.month}/{sal.year}
                          </td>
                          <td className="px-4 py-3 text-xs">৳ {Number(sal.gross_salary).toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs text-rose-600">
                            - ৳ {Number(sal.loan_deduction).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {Number(sal.fine_deduction || 0) > 0 ? (
                              <span className="text-rose-600 font-semibold font-mono">
                                - ৳ {Number(sal.fine_deduction).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40 font-mono">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-primary">
                            ৳ {Number(sal.net_salary).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={sal.payment_status === "paid" ? "secondary" : "outline"}
                              className={
                                sal.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "text-amber-700 bg-amber-50"
                              }
                            >
                              {sal.payment_status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {sal.payment_date || "Pending"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. SALARY ADVANCES / LOANS TAB */}
        <TabsContent value="advances">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Salary Advances & Loan Records</CardTitle>
                  <CardDescription className="text-xs">
                    Track emergency advances, installment deduction progress, and balances
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAdvanceModalOpen(true)} className="gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Request Salary Advance
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                    <tr>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Advance Amount</th>
                      <th className="px-4 py-3">Monthly Deduction</th>
                      <th className="px-4 py-3">Paid / Remaining</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {myLoans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          No active or past salary advance requests found.
                        </td>
                      </tr>
                    ) : (
                      myLoans.map((ln: any) => (
                        <tr key={ln.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground text-xs">{ln.purpose}</div>
                            <div className="text-[11px] text-muted-foreground">
                              Date: {ln.disbursement_date || ln.created_at?.split("T")[0]}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-xs">
                            ৳ {Number(ln.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            ৳ {Number(ln.monthly_deduction).toLocaleString()} / mo ({ln.total_installments} inst.)
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="text-emerald-600 font-semibold">
                              ৳ {Number(ln.paid_amount).toLocaleString()}
                            </span>{" "}
                            /{" "}
                            <span className="text-rose-600 font-semibold">
                              ৳ {Number(ln.remaining_amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                ln.status === "repaid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ln.status === "active"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {ln.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. TASKS TAB */}
        <TabsContent value="tasks">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">My Assigned Tasks</CardTitle>
              <CardDescription className="text-xs">
                To-do items and department responsibilities assigned by management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No tasks assigned to you currently. Good job!
                </div>
              ) : (
                myTasks.map((t: any) => {
                  const isDone = t.status === "completed";
                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                        isDone
                          ? "bg-muted/30 border-border/40 opacity-70"
                          : "bg-background border-border/60 hover:border-primary/40 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleTaskStatus(t.id, t.status)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <div>
                          <h4
                            className={`font-semibold text-sm ${
                              isDone ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {t.title}
                          </h4>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground mt-1.5">
                            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md text-[11px] font-medium">
                              <span className="text-[10px] uppercase font-bold text-blue-600/80">Given By:</span>
                              <span className="font-semibold text-foreground">
                                {t.creator?.full_name || "Management / Admin"}
                              </span>
                              {t.creator?.employee_detail?.designation?.title && (
                                <span className="text-muted-foreground font-normal text-[10px]">
                                  ({t.creator.employee_detail.designation.title})
                                </span>
                              )}
                            </div>
                            {t.due_date && <span>Due: {t.due_date}</span>}
                            <span>•</span>
                            <span className="capitalize">Priority: {t.priority || "Medium"}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={isDone ? "secondary" : "outline"} className="text-[10px]">
                        {t.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">My Uploaded Documents</CardTitle>
              <CardDescription className="text-xs">
                Archived CV, Employment Contract, Joining Letter, Certificates and NID
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {myDocs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No personal documents uploaded to your vault yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {myDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <h5 className="font-semibold text-xs line-clamp-1">{doc.title}</h5>
                          <p className="text-[11px] text-muted-foreground capitalize">
                            {doc.document_type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium ml-2"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. NOTICE BOARD TAB */}
        <TabsContent value="notices">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Company Announcements & Notice Board</CardTitle>
              <CardDescription className="text-xs">Official corporate notices and workplace updates</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {notices.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No company notices published at this moment.
                </div>
              ) : (
                notices.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl border border-border/60 bg-background hover:border-primary/40 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" /> {n.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={
                          n.priority === "urgent" || n.priority === "high"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {n.priority?.toUpperCase() || "NORMAL"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.content}</p>
                    <div className="text-[11px] text-muted-foreground pt-1">
                      Posted: {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. WARNINGS / DISCIPLINARY TAB */}
        <TabsContent value="warnings">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-600">
                <ShieldAlert className="h-5 w-5" /> Official HR Warnings & Notices
              </CardTitle>
              <CardDescription className="text-xs">
                Formal performance or attendance warnings issued by management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {myWarnings.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-foreground">Clean Record!</p>
                  <p>You have no disciplinary warnings or attendance notices on file.</p>
                </div>
              ) : (
                myWarnings.map((w: any) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-rose-700 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> {w.subject}
                      </h4>
                      <Badge variant="destructive" className="capitalize text-[10px]">
                        {w.severity} Warning
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{w.description}</p>
                    <div className="text-[11px] text-muted-foreground flex justify-between pt-1">
                      <span>Date Issued: {w.warning_date}</span>
                      <span>Issuer: Management HR</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply Leave Modal */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleApplyLeave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Apply for Leave
              </DialogTitle>
              <DialogDescription>
                Submit a leave request. You currently have{" "}
                <strong className="text-foreground">{leaveBalance.remaining} days</strong> remaining balance.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Leave Type</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Start Date</Label>
                  <Input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">End Date</Label>
                  <Input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reason for Leave</Label>
                <Textarea
                  placeholder="State the reason for your leave request..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Leave Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Salary Advance Request Modal */}
      <Dialog open={isAdvanceModalOpen} onOpenChange={setIsAdvanceModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleRequestAdvance}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Request Salary Advance
              </DialogTitle>
              <DialogDescription>
                Request an emergency advance against next month's salary with installment deduction.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Requested Amount (৳)</Label>
                <Input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  min={500}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Number of Installments (Months)</Label>
                <Select
                  value={String(advanceInstallments)}
                  onValueChange={(val) => setAdvanceInstallments(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month (Full deduction next month)</SelectItem>
                    <SelectItem value="2">2 Months (50% each month)</SelectItem>
                    <SelectItem value="3">3 Months (33% each month)</SelectItem>
                    <SelectItem value="4">4 Months (25% each month)</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Estimated deduction: ৳ {Math.round(advanceAmount / advanceInstallments).toLocaleString()} / month
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reason / Purpose</Label>
                <Textarea
                  placeholder="Medical emergency, family expenditure, etc..."
                  value={advancePurpose}
                  onChange={(e) => setAdvancePurpose(e.target.value)}
                  required
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdvanceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Advance Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
