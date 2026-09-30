"use client";

import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  CalendarDays,
  Users,
  User,
  Building2,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  RefreshCw,
  Printer,
  Download,
  Eye,
  Receipt,
  Percent,
  ChevronRight,
  Info,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  X,
  FileCheck,
  ArrowUpDown,
  BookOpen,
  LayoutGrid,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { hasAllUserAccess } from "@/hooks/useRoles";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  useHrmCashFlow,
  useWorkHourPolicy,
  saveWorkHourPolicy,
  recalculateCashFlow,
  useHrmEmployees,
  fetchPayslip,
  CashFlowLedgerRecord,
  CashFlowStatementEntry,
  WorkHourPolicy,
} from "@/hooks/useHrm";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = [
  { id: "Sun", label: "Sunday" },
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
];

export default function EmployeeCashFlowPage() {
  const { user } = useAuth();
  const canAccessAllCashFlow = hasAllUserAccess(user, "cash_flow");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Filters State
  const [viewMode, setViewMode] = React.useState<"monthly" | "yearly">("monthly");
  const [displayTab, setDisplayTab] = React.useState<"statement" | "grid">("statement"); // 'statement' (passbook) vs 'grid' (payroll table)
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(currentMonth);
  const [selectedUserId, setSelectedUserId] = React.useState<string>(
    !canAccessAllCashFlow && user?.id ? String(user.id) : "all"
  );
  const [selectedDeptId, setSelectedDeptId] = React.useState<string>("all");
  const [selectedDesigId, setSelectedDesigId] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  React.useEffect(() => {
    if (!canAccessAllCashFlow && user?.id) {
      setSelectedUserId(String(user.id));
    }
  }, [canAccessAllCashFlow, user?.id]);

  // Data Fetching
  const { data, loading, refetch } = useHrmCashFlow({
    view: viewMode,
    year: selectedYear,
    month: selectedMonth,
    user_id: selectedUserId,
    department_id: selectedDeptId,
    designation_id: selectedDesigId,
    sort_by: sortBy,
    sort_order: sortOrder,
    search: searchTerm,
  });

  const { employees } = useHrmEmployees();
  const { policy, refetch: refetchPolicy } = useWorkHourPolicy(selectedDeptId);

  // Policy Settings Modal State
  const [policyModalOpen, setPolicyModalOpen] = React.useState(false);
  const [policyForm, setPolicyForm] = React.useState<Partial<WorkHourPolicy> & { recalculate_unpaid: boolean }>({
    policy_name: "Standard Company Work Hours",
    department_id: null,
    expected_daily_hours: 8,
    working_days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    enable_deficit_deduction: true,
    calculation_basis: "basic_salary",
    handle_absent_days: "hour_deficit_only",
    grace_hours_monthly: 0,
    status: "active",
    notes: "",
    recalculate_unpaid: true,
  });
  const [isSavingPolicy, setIsSavingPolicy] = React.useState(false);

  // Breakdown Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState<CashFlowLedgerRecord | null>(null);

  // Payslip Modal State
  const [payslipModalOpen, setPayslipModalOpen] = React.useState(false);
  const [payslipData, setPayslipData] = React.useState<any>(null);
  const [isPayslipLoading, setIsPayslipLoading] = React.useState(false);

  // Recalculating State
  const [isRecalculating, setIsRecalculating] = React.useState(false);

  // Initialize policy form when policy is loaded
  React.useEffect(() => {
    if (policy) {
      setPolicyForm({
        id: policy.id,
        policy_name: policy.policy_name || "Standard Company Work Hours",
        department_id: policy.department_id || null,
        expected_daily_hours: policy.expected_daily_hours || 8,
        working_days: Array.isArray(policy.working_days) ? policy.working_days : ["Sun", "Mon", "Tue", "Wed", "Thu"],
        enable_deficit_deduction: policy.enable_deficit_deduction !== false,
        calculation_basis: policy.calculation_basis || "basic_salary",
        handle_absent_days: policy.handle_absent_days || "hour_deficit_only",
        grace_hours_monthly: policy.grace_hours_monthly || 0,
        status: policy.status || "active",
        notes: policy.notes || "",
        recalculate_unpaid: true,
      });
    }
  }, [policy]);

  const summary = data?.summary || {
    total_gross_inflow: 0,
    total_basic_salary: 0,
    total_allowance: 0,
    total_commissions: 0,
    total_bonus_overtime: 0,
    total_hour_deficit_deduction: 0,
    total_absent_deduction: 0,
    total_loan_deduction: 0,
    total_other_deduction: 0,
    total_deductions: 0,
    total_net_cash_outflow: 0,
    paid_cash_outflow: 0,
    unpaid_cash_outflow: 0,
    total_expected_hours: 0,
    total_actual_hours: 0,
    total_deficit_hours: 0,
    employee_count: 0,
    records_count: 0,
  };

  const timeline = data?.timeline || [];
  const ledger = data?.ledger || [];
  const statementEntries = data?.statement_entries || [];
  const departments = data?.departments || [];
  const designations = data?.designations || [];
  const activePolicy = data?.active_policy || policy;

  // Filtered Statement Entries
  const filteredStatementEntries = React.useMemo(() => {
    return statementEntries.filter((entry) => {
      if (categoryFilter === "credits") return entry.credit !== null && entry.credit > 0;
      if (categoryFilter === "debits") return entry.debit !== null && entry.debit > 0;
      if (categoryFilter === "deficits") return entry.category === "hour_deficit";
      if (categoryFilter === "payments") return entry.category === "salary_payment";
      return true;
    });
  }, [statementEntries, categoryFilter]);

  const hoursFulfillmentPct = summary.total_expected_hours > 0
    ? Math.min(100, Math.round((summary.total_actual_hours / summary.total_expected_hours) * 100))
    : 100;

  // Handle Save Policy
  const handleSavePolicy = async () => {
    setIsSavingPolicy(true);
    try {
      await saveWorkHourPolicy(policyForm);
      toast.success("Work hour policy saved and salaries recalculated successfully");
      setPolicyModalOpen(false);
      refetchPolicy();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save work hour policy");
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Handle Recalculate Cash Flow
  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateCashFlow({
        month: selectedMonth,
        year: selectedYear,
        user_id: selectedUserId !== "all" ? Number(selectedUserId) : undefined,
      });
      toast.success("Cash flow salaries recalculated with latest rules & hour policies");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to recalculate cash flow");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Open Payslip
  const handleOpenPayslip = async (record: CashFlowLedgerRecord) => {
    setPayslipData(record);
    setPayslipModalOpen(true);
    setIsPayslipLoading(true);
    try {
      const res = await fetchPayslip(record.id);
      if (res && res.data) {
        setPayslipData(res.data);
      }
    } catch (err) {
      console.error("Failed to load fresh payslip", err);
    } finally {
      setIsPayslipLoading(false);
    }
  };

  // Toggle Weekday Selection
  const toggleWeekday = (day: string) => {
    const currentDays = policyForm.working_days || [];
    if (currentDays.includes(day)) {
      if (currentDays.length <= 1) {
        toast.error("At least one working day must be selected");
        return;
      }
      setPolicyForm({
        ...policyForm,
        working_days: currentDays.filter((d) => d !== day),
      });
    } else {
      setPolicyForm({
        ...policyForm,
        working_days: [...currentDays, day],
      });
    }
  };

  // Selected Employee object if single employee filtered
  const selectedEmpObj = React.useMemo(() => {
    if (selectedUserId === "all") return null;
    return employees.find((e) => String(e.id) === selectedUserId) || null;
  }, [employees, selectedUserId]);

  // Format Currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace("BDT", "৳");
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto w-full">
      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <DollarSign className="size-7 text-primary" />
            Employee Cash Flow & Payment Statement
            {!canAccessAllCashFlow && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                Attribute Based (Self Data)
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Financial ledger statement tracking gross compensation inflows, incentive commissions, weekday working hour deficit penalties, and net disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setPolicyModalOpen(true)}
            className="gap-2 text-xs"
          >
            <Clock className="size-4 text-primary" />
            <span>Work Hours & Weekdays Rule</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`size-4 ${isRecalculating ? "animate-spin" : ""}`} />
            <span>Recalculate</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 text-xs"
          >
            <Printer className="size-4" />
            <span>Print Statement</span>
          </Button>
        </div>
      </div>

      {/* Hero Banner for Selected Employee */}
      {selectedEmpObj && (
        <Card className="border shadow-xs bg-gradient-to-r from-primary/5 via-card to-card border-primary/20">
          <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 rounded-full border-2 border-primary ring-4 ring-primary/10 shadow-sm shrink-0">
                <AvatarFallback className="rounded-full text-base font-black bg-gradient-to-br from-primary/25 via-primary/10 to-muted text-primary">
                  {selectedEmpObj.full_name?.substring(0, 2).toUpperCase() || "EM"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-foreground">
                    {selectedEmpObj.full_name}
                  </h2>
                  <Badge variant="outline" className="text-xs font-mono font-bold bg-background text-primary border-primary/30">
                    {selectedEmpObj.employee_id || `#${selectedUserId}`}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {selectedEmpObj.department?.name || "General"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {selectedEmpObj.designation?.title || "Staff"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5 flex-wrap">
                  {selectedEmpObj.email && <span>Email: {selectedEmpObj.email}</span>}
                  {selectedEmpObj.phone && <span>Phone: {selectedEmpObj.phone}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Net Cash Outflow</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(summary.total_net_cash_outflow)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserId("all")}
                className="text-xs h-8 gap-1.5"
              >
                <X className="size-3.5" />
                <span>Show All Employees</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Comprehensive Filter & Sort Control Toolbar */}
      <Card className="border shadow-xs bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Display View Tabs: Statement Passbook (screenshot style) vs Payroll Grid */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border">
              <Button
                variant={displayTab === "statement" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplayTab("statement")}
                className="text-xs h-8 px-3 gap-1.5"
              >
                <BookOpen className="size-3.5" />
                <span>Payment Statement (Passbook)</span>
              </Button>
              <Button
                variant={displayTab === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplayTab("grid")}
                className="text-xs h-8 px-3 gap-1.5"
              >
                <LayoutGrid className="size-3.5" />
                <span>All Employees Payroll Grid</span>
              </Button>
            </div>

            {/* View Mode Toggle: Monthly vs Yearly */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border">
              <Button
                variant={viewMode === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("monthly")}
                className="text-xs h-8 px-3"
              >
                <Calendar className="size-3.5 mr-1.5" />
                Monthly
              </Button>
              <Button
                variant={viewMode === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("yearly")}
                className="text-xs h-8 px-3"
              >
                <CalendarDays className="size-3.5 mr-1.5" />
                Yearly
              </Button>
            </div>
          </div>

          <Separator />

          {/* Filtering & Sorting Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Employee Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <User className="size-3 text-primary" />
                Employee
              </label>
              <Select
                value={!canAccessAllCashFlow && user?.id ? String(user.id) : selectedUserId}
                onValueChange={(val) => {
                  if (canAccessAllCashFlow) setSelectedUserId(val);
                }}
                disabled={!canAccessAllCashFlow}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={!canAccessAllCashFlow ? (user?.full_name || "My Cash Flow") : "All Employees"} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {canAccessAllCashFlow ? (
                    <>
                      <SelectItem value="all" className="text-xs font-semibold">
                        All Employees ({employees.length})
                      </SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)} className="text-xs">
                          {emp.full_name} ({emp.employee_id || `#${emp.id}`})
                        </SelectItem>
                      ))}
                    </>
                  ) : (
                    <SelectItem value={String(user?.id)} className="text-xs font-semibold">
                      {user?.full_name || "My Profile"} (Self Records)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Department Filter / Sort */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="size-3 text-primary" />
                Department
              </label>
              <Select
                value={selectedDeptId}
                onValueChange={(val) => setSelectedDeptId(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs font-semibold">
                    All Departments ({departments.length})
                  </SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)} className="text-xs">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Designation Filter / Sort */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Briefcase className="size-3 text-primary" />
                Designation
              </label>
              <Select
                value={selectedDesigId}
                onValueChange={(val) => setSelectedDesigId(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Designations" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all" className="text-xs font-semibold">
                    All Designations ({designations.length})
                  </SelectItem>
                  {designations.map((desig) => (
                    <SelectItem key={desig.id} value={String(desig.id)} className="text-xs">
                      {desig.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Sorting Option */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <ArrowUpDown className="size-3 text-primary" />
                Sort By
              </label>
              <Select
                value={sortBy}
                onValueChange={(val) => setSortBy(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date" className="text-xs">
                    Date / Period
                  </SelectItem>
                  <SelectItem value="name" className="text-xs">
                    Employee Name
                  </SelectItem>
                  <SelectItem value="department" className="text-xs">
                    Department Wise
                  </SelectItem>
                  <SelectItem value="designation" className="text-xs">
                    Designation Wise
                  </SelectItem>
                  <SelectItem value="net_salary" className="text-xs">
                    Net Cash Outflow
                  </SelectItem>
                  <SelectItem value="gross_salary" className="text-xs">
                    Gross Salary
                  </SelectItem>
                  <SelectItem value="hour_deficit_deduction" className="text-xs">
                    Hour Deficit Penalty
                  </SelectItem>
                  <SelectItem value="deficit_hours" className="text-xs">
                    Deficit Hours Short
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5. Period Selectors */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3 text-primary" />
                Period
              </label>
              <div className="flex gap-1.5">
                {viewMode === "monthly" && (
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={(val) => setSelectedMonth(Number(val))}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, idx) => (
                        <SelectItem key={idx + 1} value={String(idx + 1)} className="text-xs">
                          {m.substring(0, 3)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={String(selectedYear)}
                  onValueChange={(val) => setSelectedYear(Number(val))}
                >
                  <SelectTrigger className="h-8 text-xs w-[75px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                      <SelectItem key={yr} value={String(yr)} className="text-xs">
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 6. Search Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="size-3 text-primary" />
                Live Search
              </label>
              <Input
                type="text"
                placeholder="Name, ID, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Active Policy Status Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Working Hours Policy:
              </span>
              <span>
                {activePolicy?.expected_daily_hours || 8} hrs/day • Weekdays:{" "}
                {Array.isArray(activePolicy?.working_days)
                  ? activePolicy.working_days.join(", ")
                  : "Sun-Thu"}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${
                  activePolicy?.enable_deficit_deduction
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {activePolicy?.enable_deficit_deduction
                  ? "Deficit Deduction Active"
                  : "Deficit Deduction Disabled"}
              </Badge>
            </div>

            <Button
              variant="link"
              size="sm"
              onClick={() => setPolicyModalOpen(true)}
              className="h-auto p-0 text-xs text-primary"
            >
              Configure Policy Rules
              <ChevronRight className="size-3 ml-0.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Financial Stats KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Net Cash Outflow */}
        <Card className="border shadow-xs bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Net Cash Outflow</span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-foreground">
                {formatCurrency(summary.total_net_cash_outflow)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                <span>Paid: {formatCurrency(summary.paid_cash_outflow)}</span>
                <span className="text-amber-600 font-medium">Pending: {formatCurrency(summary.unpaid_cash_outflow)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Gross Inflows (Basic + Allowances) */}
        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Base Inflows (Credits)</span>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Briefcase className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">
                {formatCurrency(summary.total_basic_salary + summary.total_allowance)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Basic: {formatCurrency(summary.total_basic_salary)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Performance & Upsell Incentives */}
        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Incentive Commissions</span>
              <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                +{formatCurrency(summary.total_commissions)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Overtime/Bonus: +{formatCurrency(summary.total_bonus_overtime)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Work Hour Deficit Deductions */}
        <Card className="border shadow-xs bg-card border-amber-500/20 bg-amber-500/[0.02]">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Hour Deficit Deductions</span>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                -{formatCurrency(summary.total_hour_deficit_deduction)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Shortfall: {summary.total_deficit_hours} hrs short
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Other Deductions */}
        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Other Deductions</span>
              <div className="size-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
                <ShieldAlert className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(summary.total_loan_deduction + summary.total_absent_deduction + summary.total_other_deduction)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Loans: {formatCurrency(summary.total_loan_deduction)} • Absences: {formatCurrency(summary.total_absent_deduction)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Work Hours Fulfilled */}
        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Hours Fulfilled</span>
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Percent className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <span>{hoursFulfillmentPct}%</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({summary.total_actual_hours}h / {summary.total_expected_hours}h)
                </span>
              </div>
              <div className="mt-2">
                <Progress value={hoursFulfillmentPct} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. MAIN DISPLAY SECTION */}
      {displayTab === "statement" ? (
        /* ========================================================================= */
        /* PASSBOOK STATEMENT VIEW (Exactly like user's Payment History screenshot) */
        /* ========================================================================= */
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b bg-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="size-4 text-primary" />
                  Payment History & Financial Passbook
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Chronological financial ledger entries displaying Description, Debit, Credit, and Running Balance.
                </CardDescription>
              </div>

              {/* Transaction Category Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                  className="text-xs h-7 px-2.5"
                >
                  All ({statementEntries.length})
                </Button>
                <Button
                  variant={categoryFilter === "credits" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("credits")}
                  className="text-xs h-7 px-2.5 text-emerald-600"
                >
                  Inflows (Credit)
                </Button>
                <Button
                  variant={categoryFilter === "debits" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("debits")}
                  className="text-xs h-7 px-2.5 text-rose-600"
                >
                  Deductions (Debit)
                </Button>
                <Button
                  variant={categoryFilter === "deficits" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("deficits")}
                  className="text-xs h-7 px-2.5 text-amber-600"
                >
                  Hour Deficits
                </Button>
                <Button
                  variant={categoryFilter === "payments" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("payments")}
                  className="text-xs h-7 px-2.5 text-blue-600"
                >
                  Paid Salaries
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table Header: Employee Profile | Description | Debit | Credit | Balance */}
            <div className="border-b bg-muted/40 px-5 py-3 grid grid-cols-12 gap-x-4 items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-12 md:col-span-3">Employee Details</div>
              <div className="col-span-12 md:col-span-3">Transaction / Description</div>
              <div className="col-span-4 md:col-span-2 text-right text-rose-600 font-bold">Debit</div>
              <div className="col-span-4 md:col-span-2 text-right text-emerald-600 font-bold">Credit</div>
              <div className="col-span-4 md:col-span-2 text-right text-foreground font-bold">Balance</div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                Loading payment statement ledger...
              </div>
            ) : filteredStatementEntries.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No statement entries found matching the filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredStatementEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-5 py-4 grid grid-cols-12 gap-x-4 items-center hover:bg-muted/20 transition-colors gap-y-3 md:gap-y-0"
                  >
                    {/* 1. First Left Corner: Employee Profile with Circular Avatar */}
                    <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                      <Avatar className="size-11 rounded-full border-2 border-primary/25 shadow-xs ring-2 ring-background shrink-0">
                        <AvatarFallback className="rounded-full text-xs font-black bg-gradient-to-br from-primary/25 via-primary/10 to-muted text-primary">
                          {entry.employee_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-extrabold text-sm text-foreground truncate">
                          {entry.employee_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs flex-wrap">
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-bold rounded-full bg-muted border border-border/60">
                            {entry.employee_id}
                          </Badge>
                          <span className="font-semibold text-primary text-[11px] truncate">
                            {entry.designation}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate font-medium">
                          {entry.department}
                        </div>
                      </div>
                    </div>

                    {/* 2. Transaction Description Column (Shifted more to the left) */}
                    <div className="col-span-12 md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                          {entry.date}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 font-medium whitespace-nowrap ${
                            entry.category === "hour_deficit"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                              : entry.category === "incentive"
                              ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
                              : entry.category === "salary_payment"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                              : entry.type === "credit"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                          }`}
                        >
                          {entry.category_label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {entry.description}
                      </p>
                    </div>

                    {/* 3. Debit Column (Red) - Wide & Clearly Visible */}
                    <div className="col-span-4 md:col-span-2 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap tabular-nums">
                      {entry.debit !== null && entry.debit > 0 ? (
                        <span>-{formatCurrency(entry.debit)}</span>
                      ) : (
                        <span className="text-muted-foreground/30 font-normal">—</span>
                      )}
                    </div>

                    {/* 4. Credit Column (Green) - Wide & Clearly Visible */}
                    <div className="col-span-4 md:col-span-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap tabular-nums">
                      {entry.credit !== null && entry.credit > 0 ? (
                        <span>+{formatCurrency(entry.credit)}</span>
                      ) : (
                        <span className="text-muted-foreground/30 font-normal">—</span>
                      )}
                    </div>

                    {/* 5. Balance Column (Running cumulative balance) - Wide & Clearly Visible */}
                    <div className="col-span-4 md:col-span-2 text-right font-mono font-black text-foreground text-sm whitespace-nowrap tabular-nums">
                      {formatCurrency(entry.balance)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ========================================================================= */
        /* PAYROLL GRID VIEW (All Employees sorted by Department/Designation/Amount) */
        /* ========================================================================= */
        <Card className="border shadow-xs">
          <CardHeader className="p-4 sm:p-5 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Employee Cash Flow & Payroll Grid
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Showing {ledger.length} compensation disbursements sorted by{" "}
                  <strong>{sortBy} ({sortOrder.toUpperCase()})</strong> for{" "}
                  {viewMode === "yearly" ? `Year ${selectedYear}` : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="text-xs h-8 gap-1.5"
                >
                  <ArrowUpDown className="size-3.5" />
                  <span>Order: {sortOrder.toUpperCase()}</span>
                </Button>
                <Badge variant="outline" className="text-xs font-normal">
                  {ledger.length} Records
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[220px] text-xs font-bold">Employee</TableHead>
                    <TableHead className="text-xs font-bold">Department & Designation</TableHead>
                    <TableHead className="text-xs font-bold">Period</TableHead>
                    <TableHead className="text-xs font-bold text-right">Basic Salary</TableHead>
                    <TableHead className="text-xs font-bold text-right">Allowances</TableHead>
                    <TableHead className="text-xs font-bold text-right">Incentives</TableHead>
                    <TableHead className="text-xs font-bold text-right">Gross Salary</TableHead>
                    <TableHead className="text-xs font-bold text-center">Work Hours (Act / Exp)</TableHead>
                    <TableHead className="text-xs font-bold text-right text-amber-700 dark:text-amber-400">Hour Deficit Penalty</TableHead>
                    <TableHead className="text-xs font-bold text-right text-red-600">Other Deductions</TableHead>
                    <TableHead className="text-xs font-bold text-right">Net Cash Outflow</TableHead>
                    <TableHead className="text-xs font-bold text-center">Status</TableHead>
                    <TableHead className="w-[100px] text-xs font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={13} className="py-12 text-center text-xs text-muted-foreground">
                        <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                        Loading employee cash flow ledger...
                      </TableCell>
                    </TableRow>
                  ) : ledger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="py-12 text-center text-xs text-muted-foreground">
                        No salary or cash flow records found for the selected period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledger.map((record) => {
                      const empName = record.user?.full_name || record.user?.name || `Employee #${record.user_id}`;
                      const empId = record.user?.employee_detail?.employee_id || `#${record.user_id}`;
                      const deptName = record.user?.employee_detail?.department?.name || "General";
                      const desigName = record.user?.employee_detail?.designation?.title || "Staff";

                      const expHours = record.expected_working_hours || 0;
                      const actHours = record.actual_working_hours || 0;
                      const defHours = record.deficit_hours || 0;
                      const hourlyRate = expHours > 0 ? (record.basic_salary / expHours) : 0;

                      return (
                        <TableRow key={record.id} className="hover:bg-muted/30">
                          {/* Employee in First Left Corner */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-11 rounded-full border-2 border-primary/25 shadow-xs ring-2 ring-background shrink-0">
                                <AvatarFallback className="rounded-full text-xs font-black bg-gradient-to-br from-primary/25 via-primary/10 to-muted text-primary">
                                  {empName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 space-y-0.5">
                                <div className="font-extrabold text-sm text-foreground truncate">{empName}</div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-bold rounded-full bg-muted border border-border/60">
                                    {empId}
                                  </Badge>
                                  <span className="font-semibold text-primary text-[11px] truncate">{desigName}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate font-medium">{deptName}</div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Department & Designation Column */}
                          <TableCell className="text-xs">
                            <div className="font-semibold text-foreground">{deptName}</div>
                            <div className="text-[11px] text-muted-foreground">{desigName}</div>
                          </TableCell>

                          {/* Period */}
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {MONTHS[record.month - 1].substring(0, 3)} {record.year}
                          </TableCell>

                          {/* Basic Salary */}
                          <TableCell className="text-xs text-right font-medium">
                            {formatCurrency(record.basic_salary)}
                          </TableCell>

                          {/* Allowances */}
                          <TableCell className="text-xs text-right text-muted-foreground">
                            {formatCurrency(record.total_allowance)}
                          </TableCell>

                          {/* Incentives */}
                          <TableCell className="text-xs text-right">
                            {record.commission_amount > 0 ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                +{formatCurrency(record.commission_amount)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">৳0.00</span>
                            )}
                          </TableCell>

                          {/* Gross Salary */}
                          <TableCell className="text-xs text-right font-bold text-foreground">
                            {formatCurrency(record.gross_salary)}
                          </TableCell>

                          {/* Work Hours Fulfillment */}
                          <TableCell className="text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-xs font-semibold">
                                {actHours}h / {expHours}h
                              </span>
                              {defHours > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                >
                                  -{defHours}h short
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                >
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Hour Deficit Deduction */}
                          <TableCell className="text-xs text-right">
                            {record.hour_deficit_deduction > 0 ? (
                              <div className="font-bold text-amber-700 dark:text-amber-400">
                                -{formatCurrency(record.hour_deficit_deduction)}
                                <div className="text-[9px] text-muted-foreground font-normal">
                                  @{formatCurrency(hourlyRate)}/h
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">৳0.00</span>
                            )}
                          </TableCell>

                          {/* Other Deductions */}
                          <TableCell className="text-xs text-right text-muted-foreground">
                            {record.loan_deduction + record.absent_deduction + record.other_deduction > 0 ? (
                              <span className="text-red-600">
                                -{formatCurrency(record.loan_deduction + record.absent_deduction + record.other_deduction)}
                              </span>
                            ) : (
                              "৳0.00"
                            )}
                          </TableCell>

                          {/* Net Cash Outflow */}
                          <TableCell className="text-xs text-right font-extrabold text-foreground">
                            {formatCurrency(record.net_salary)}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 capitalize ${
                                record.payment_status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                  : record.payment_status === "partial"
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {record.payment_status}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setActiveRecord(record);
                                        setBreakdownModalOpen(true);
                                      }}
                                      className="size-7"
                                    >
                                      <Eye className="size-3.5 text-primary" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">View Breakdown</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenPayslip(record)}
                                      className="size-7"
                                    >
                                      <Receipt className="size-3.5 text-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">View Payslip</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Work Hours & Weekday Rule Settings Sheet (Slides in beside the right sidebar) */}
      <Sheet open={policyModalOpen} onOpenChange={setPolicyModalOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg md:max-w-xl data-[side=right]:sm:max-w-xl p-0 flex flex-col justify-between gap-0 z-50 bg-background"
        >
          <SheetHeader className="p-5 border-b bg-muted/10">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Work Hours & Weekdays Deficit Policy
            </SheetTitle>
            <SheetDescription className="text-xs">
              Define standard workday hours and working weekdays. If an employee does not achieve the expected hours, salary is automatically deducted proportionally.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Policy Name & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Policy Name</Label>
                <Input
                  value={policyForm.policy_name}
                  onChange={(e) => setPolicyForm({ ...policyForm, policy_name: e.target.value })}
                  placeholder="e.g. Standard Work Policy"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Department</Label>
                <Select
                  value={policyForm.department_id ? String(policyForm.department_id) : "global"}
                  onValueChange={(val) =>
                    setPolicyForm({
                      ...policyForm,
                      department_id: val === "global" ? null : Number(val),
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Company-Wide (Global)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global" className="text-xs font-semibold">
                      Company-Wide Default (All Departments)
                    </SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)} className="text-xs">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Daily Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expected Work Hours / Day</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    value={policyForm.expected_daily_hours}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, expected_daily_hours: parseFloat(e.target.value) || 8 })
                    }
                    className="h-8 text-xs pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-muted-foreground font-semibold">
                    hrs
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Calculation Basis</Label>
                <Select
                  value={policyForm.calculation_basis}
                  onValueChange={(val: any) => setPolicyForm({ ...policyForm, calculation_basis: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic_salary" className="text-xs">
                      Basic Salary
                    </SelectItem>
                    <SelectItem value="gross_salary" className="text-xs">
                      Gross Salary
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monthly Grace Buffer</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={policyForm.grace_hours_monthly || 0}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, grace_hours_monthly: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 text-xs pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-muted-foreground font-semibold">
                    hrs
                  </span>
                </div>
              </div>
            </div>

            {/* Working Weekdays Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Active Working Weekdays</Label>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {WEEKDAYS.map((day) => {
                  const isSelected = policyForm.working_days?.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleWeekday(day.id)}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="text-[11px]">{day.id}</div>
                      <div className="text-[9px] font-normal opacity-80">{day.label.substring(0, 3)}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Selected {policyForm.working_days?.length || 0} days per week. Month expected hours = (Weekdays count in month) × {policyForm.expected_daily_hours || 8} hrs.
              </p>
            </div>

            {/* Deficit Deduction Toggle & Absent Handling */}
            <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground text-xs">Enable Under-Worked Hour Deduction</div>
                  <div className="text-[11px] text-muted-foreground">
                    If actual attended hours fall short of expected hours, deduct: Deficit Hours × Hourly Rate.
                  </div>
                </div>
                <Switch
                  checked={policyForm.enable_deficit_deduction}
                  onCheckedChange={(checked) =>
                    setPolicyForm({ ...policyForm, enable_deficit_deduction: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground text-xs">Absent Days Treatment</div>
                  <div className="text-[11px] text-muted-foreground">
                    "Hour Deficit Only" avoids duplicate penalties by deducting all missing hours via the hourly rate.
                  </div>
                </div>
                <Select
                  value={policyForm.handle_absent_days}
                  onValueChange={(val: any) => setPolicyForm({ ...policyForm, handle_absent_days: val })}
                >
                  <SelectTrigger className="h-8 text-xs w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour_deficit_only" className="text-xs">
                      Hour Deficit Only (Unified)
                    </SelectItem>
                    <SelectItem value="both_separate" className="text-xs">
                      Deduct Both Separately
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recalculate unpaid salaries checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="recalc"
                checked={policyForm.recalculate_unpaid}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, recalculate_unpaid: e.target.checked })
                }
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <label htmlFor="recalc" className="text-xs font-medium cursor-pointer text-foreground">
                Automatically recalculate all unpaid salaries for current and active months with this rule
              </label>
            </div>
          </div>

          <SheetFooter className="p-4 border-t bg-muted/10 flex flex-row items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setPolicyModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} disabled={isSavingPolicy} className="text-xs gap-1.5">
              {isSavingPolicy && <RefreshCw className="size-3.5 animate-spin" />}
              <span>Save & Apply Policy</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 6. Individual Cash Flow Breakdown Modal */}
      <Dialog open={breakdownModalOpen} onOpenChange={setBreakdownModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Info className="size-4 text-primary" />
              Cash Flow Breakdown & Work Hours Audit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detailed mathematical breakdown of earnings, performance incentives, and work hour deductions.
            </DialogDescription>
          </DialogHeader>

          {activeRecord && (
            <div className="space-y-4 py-2 text-xs">
              {/* Employee Summary Card */}
              <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">
                    {activeRecord.user?.full_name || activeRecord.user?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeRecord.user?.employee_detail?.employee_id || `#${activeRecord.user_id}`} •{" "}
                    {activeRecord.user?.employee_detail?.department?.name || "General"} •{" "}
                    {activeRecord.user?.employee_detail?.designation?.title || "Staff"}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {MONTHS[activeRecord.month - 1]} {activeRecord.year}
                </Badge>
              </div>

              {/* Earnings Inflow Breakdown */}
              <div className="space-y-2 border rounded-lg p-3">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>Gross Cash Inflow (Earnings)</span>
                  <span className="text-emerald-600 font-extrabold">{formatCurrency(activeRecord.gross_salary)}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span className="font-medium text-foreground">{formatCurrency(activeRecord.basic_salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allowances:</span>
                    <span className="font-medium text-foreground">{formatCurrency(activeRecord.total_allowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incentive Commission:</span>
                    <span className="font-semibold text-emerald-600">+{formatCurrency(activeRecord.commission_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus / Overtime:</span>
                    <span className="font-medium text-foreground">+{formatCurrency(activeRecord.bonus + activeRecord.overtime_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Work Hours & Deficit Calculation */}
              <div className="space-y-2 border rounded-lg p-3 bg-amber-500/[0.02] border-amber-500/20">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                  <span>Working Hours & Deficit Calculation</span>
                  <span className="font-extrabold">-{formatCurrency(activeRecord.hour_deficit_deduction)}</span>
                </div>
                <Separator />
                <div className="space-y-1.5 text-muted-foreground pt-1">
                  <div className="flex justify-between">
                    <span>Expected Working Hours:</span>
                    <span className="font-medium text-foreground">
                      {activeRecord.expected_working_hours} hrs ({activeRecord.work_hours_details?.expected_working_days || 22} days × {activeRecord.work_hours_details?.expected_daily_hours || 8}h)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Attended Hours:</span>
                    <span className="font-medium text-foreground">{activeRecord.actual_working_hours} hrs</span>
                  </div>
                  <div className="flex justify-between font-semibold text-amber-700 dark:text-amber-400">
                    <span>Deficit Hours Short:</span>
                    <span>{activeRecord.deficit_hours} hrs</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Hourly Rate Basis:</span>
                    <span>
                      {formatCurrency(activeRecord.basic_salary)} ÷ {activeRecord.expected_working_hours}h ={" "}
                      <strong className="text-foreground">
                        {formatCurrency(activeRecord.expected_working_hours > 0 ? activeRecord.basic_salary / activeRecord.expected_working_hours : 0)}/hr
                      </strong>
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 text-foreground">
                    <span>Hour Deficit Deduction:</span>
                    <span className="text-amber-700 dark:text-amber-400">
                      {activeRecord.deficit_hours}h × {formatCurrency(activeRecord.expected_working_hours > 0 ? activeRecord.basic_salary / activeRecord.expected_working_hours : 0)} = -{formatCurrency(activeRecord.hour_deficit_deduction)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions & Net Payout */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Other Deductions (Loan, Absent):</span>
                  <span>-{formatCurrency(activeRecord.loan_deduction + activeRecord.absent_deduction + activeRecord.other_deduction)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Deductions:</span>
                  <span className="text-red-600 font-semibold">-{formatCurrency(activeRecord.total_deduction)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-extrabold text-foreground pt-1">
                  <span>Net Company Cash Outflow:</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(activeRecord.net_salary)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBreakdownModalOpen(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Payslip Modal Preview */}
      <Dialog open={payslipModalOpen} onOpenChange={setPayslipModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="size-4 text-primary" />
              Employee Salary Payslip
            </DialogTitle>
            <DialogDescription className="text-xs">
              Official payslip reflecting latest incentive rules and working hour deficit calculations.
            </DialogDescription>
          </DialogHeader>

          {isPayslipLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
              Generating fresh payslip...
            </div>
          ) : payslipData ? (
            <div className="border rounded-lg p-5 space-y-4 bg-card text-xs">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    {payslipData.user?.full_name || payslipData.user?.name}
                  </h3>
                  <p className="text-muted-foreground text-[11px]">
                    ID: {payslipData.user?.employee_detail?.employee_id || `#${payslipData.user_id}`} •{" "}
                    {payslipData.user?.employee_detail?.designation?.title || "Staff"} (
                    {payslipData.user?.employee_detail?.department?.name || "General"})
                  </p>
                </div>
                <Badge variant="outline" className="font-bold">
                  {MONTHS[payslipData.month - 1]} {payslipData.year}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Inflows */}
                <div className="space-y-1.5">
                  <div className="font-bold text-foreground border-b pb-1">Earnings & Inflows</div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Basic Salary:</span>
                    <span>{formatCurrency(payslipData.basic_salary)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Allowances:</span>
                    <span>{formatCurrency(payslipData.total_allowance)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Incentive Commission:</span>
                    <span>+{formatCurrency(payslipData.commission_amount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Bonus / Overtime:</span>
                    <span>+{formatCurrency(payslipData.bonus + payslipData.overtime_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1 text-foreground">
                    <span>Gross Salary:</span>
                    <span>{formatCurrency(payslipData.gross_salary)}</span>
                  </div>
                </div>

                {/* Outflows / Deductions */}
                <div className="space-y-1.5">
                  <div className="font-bold text-foreground border-b pb-1">Outflows & Deductions</div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                    <span>Hour Deficit Deduction:</span>
                    <span>-{formatCurrency(payslipData.hour_deficit_deduction || 0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Loan / Advance Repayment:</span>
                    <span>-{formatCurrency(payslipData.loan_deduction)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Absent Penalty:</span>
                    <span>-{formatCurrency(payslipData.absent_deduction)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Other Deductions:</span>
                    <span>-{formatCurrency(payslipData.other_deduction)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1 text-red-600">
                    <span>Total Deductions:</span>
                    <span>-{formatCurrency(payslipData.total_deduction)}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Net Salary Payable</div>
                  <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(payslipData.net_salary)}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${
                    payslipData.payment_status === "paid"
                      ? "bg-emerald-500/20 text-emerald-700"
                      : "bg-amber-500/20 text-amber-700"
                  }`}
                >
                  {payslipData.payment_status}
                </Badge>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()} className="text-xs gap-1.5">
              <Printer className="size-3.5" />
              <span>Print Payslip</span>
            </Button>
            <Button onClick={() => setPayslipModalOpen(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
