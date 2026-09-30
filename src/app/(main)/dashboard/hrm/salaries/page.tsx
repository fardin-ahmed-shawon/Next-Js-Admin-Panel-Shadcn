"use client";

import * as React from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Pencil,
  Eye,
  Printer,
  Download,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Receipt,
  Building2,
  UserCheck,
  SlidersHorizontal,
  Target,
  Percent,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import {
  useHrmSalaries,
  generatePayroll,
  updateSalaryPayment,
  SalaryRecord,
  useHrmIncentiveRules,
  createIncentiveRule,
  updateIncentiveRule,
  deleteIncentiveRule,
  previewIncentiveCalculation,
  SalaryIncentiveRule,
  useHrmDepartments,
  useHrmEmployees,
} from "@/hooks/useHrm";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SalaryManagementPage() {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"payroll" | "rules">("payroll");

  // Payroll state
  const [selectedMonth, setSelectedMonth] = React.useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(now.getFullYear());
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const { salaries, summary, loading, refetch } = useHrmSalaries({
    month: selectedMonth,
    year: selectedYear,
    payment_status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Incentive Rules state
  const { rules, loading: rulesLoading, refetch: refetchRules } = useHrmIncentiveRules();
  const { departments } = useHrmDepartments();
  const { employees } = useHrmEmployees();

  // Payroll generation modal
  const [generateModalOpen, setGenerateModalOpen] = React.useState(false);
  const [genMonth, setGenMonth] = React.useState(selectedMonth);
  const [genYear, setGenYear] = React.useState(selectedYear);
  const [genBonus, setGenBonus] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Update payment modal
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [activeSalary, setActiveSalary] = React.useState<SalaryRecord | null>(null);
  const [payForm, setPayForm] = React.useState({
    payment_status: "paid" as "unpaid" | "paid" | "partial",
    payment_method: "Bank Transfer",
    payment_date: new Date().toISOString().split("T")[0],
    transaction_ref: "",
    bonus: 0,
    notes: "",
  });

  // Payslip modal & breakdown modal
  const [payslipModalOpen, setPayslipModalOpen] = React.useState(false);
  const [payslipData, setPayslipData] = React.useState<SalaryRecord | null>(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = React.useState(false);
  const [activeBreakdown, setActiveBreakdown] = React.useState<SalaryRecord | null>(null);

  // Rule Form modal (Create / Edit)
  const [ruleModalOpen, setRuleModalOpen] = React.useState(false);
  const [editingRuleId, setEditingRuleId] = React.useState<number | null>(null);
  const [ruleForm, setRuleForm] = React.useState({
    rule_name: "",
    department_id: "all",
    user_id: "none",
    min_delivered_orders: 0,
    order_delivered_bonus: 0,
    min_delivered_value: 0,
    delivered_value_commission_pct: 0,
    collection_commission_pct: 0,
    upsell_commission_pct: 0,
    extra_hours_bonus_rate: 0,
    extra_hours_min_threshold: 0,
    extra_hours_salary_pct: 0,
    status: "active" as "active" | "inactive",
    notes: "",
  });
  const [isSavingRule, setIsSavingRule] = React.useState(false);

  // Preview Incentive modal
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);
  const [previewUserId, setPreviewUserId] = React.useState<string>("");
  const [previewMonth, setPreviewMonth] = React.useState<number>(selectedMonth);
  const [previewYear, setPreviewYear] = React.useState<number>(selectedYear);
  const [previewResult, setPreviewResult] = React.useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await generatePayroll(genMonth, genYear, genBonus);
      toast.success(`Payroll processed with dynamic incentives for ${MONTHS[genMonth - 1]} ${genYear}`);
      setGenerateModalOpen(false);
      setSelectedMonth(genMonth);
      setSelectedYear(genYear);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate payroll");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSalary) return;
    try {
      await updateSalaryPayment(activeSalary.id, payForm);
      toast.success("Salary payment status updated");
      setPayModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment status");
    }
  };

  const openPayModal = (sal: SalaryRecord) => {
    setActiveSalary(sal);
    setPayForm({
      payment_status: "paid",
      payment_method: sal.payment_method || "Bank Transfer",
      payment_date: sal.payment_date || new Date().toISOString().split("T")[0],
      transaction_ref: sal.transaction_ref || "",
      bonus: sal.bonus || 0,
      notes: sal.notes || "",
    });
    setPayModalOpen(true);
  };

  const openPayslip = (sal: SalaryRecord) => {
    setPayslipData(sal);
    setPayslipModalOpen(true);
  };

  const openBreakdown = (sal: SalaryRecord) => {
    setActiveBreakdown(sal);
    setBreakdownModalOpen(true);
  };

  const openCreateRuleModal = () => {
    setEditingRuleId(null);
    setRuleForm({
      rule_name: "",
      department_id: "all",
      user_id: "none",
      min_delivered_orders: 0,
      order_delivered_bonus: 0,
      min_delivered_value: 0,
      delivered_value_commission_pct: 0,
      collection_commission_pct: 0,
      upsell_commission_pct: 0,
      extra_hours_bonus_rate: 0,
      extra_hours_min_threshold: 0,
      extra_hours_salary_pct: 0,
      status: "active",
      notes: "",
    });
    setRuleModalOpen(true);
  };

  const openEditRuleModal = (r: SalaryIncentiveRule) => {
    setEditingRuleId(r.id);
    setRuleForm({
      rule_name: r.rule_name,
      department_id: r.department_id ? String(r.department_id) : "all",
      user_id: r.user_id ? String(r.user_id) : "none",
      min_delivered_orders: r.min_delivered_orders || 0,
      order_delivered_bonus: r.order_delivered_bonus || 0,
      min_delivered_value: r.min_delivered_value || 0,
      delivered_value_commission_pct: r.delivered_value_commission_pct || 0,
      collection_commission_pct: r.collection_commission_pct || 0,
      upsell_commission_pct: r.upsell_commission_pct || 0,
      extra_hours_bonus_rate: r.extra_hours_bonus_rate || 0,
      extra_hours_min_threshold: r.extra_hours_min_threshold || 0,
      extra_hours_salary_pct: r.extra_hours_salary_pct || 0,
      status: r.status,
      notes: r.notes || "",
    });
    setRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.rule_name.trim()) {
      toast.error("Please enter a rule name");
      return;
    }

    setIsSavingRule(true);
    try {
      const payload: any = {
        rule_name: ruleForm.rule_name.trim(),
        department_id: ruleForm.department_id !== "all" ? Number(ruleForm.department_id) : null,
        user_id: ruleForm.user_id !== "none" ? Number(ruleForm.user_id) : null,
        min_delivered_orders: Number(ruleForm.min_delivered_orders),
        order_delivered_bonus: Number(ruleForm.order_delivered_bonus),
        min_delivered_value: Number(ruleForm.min_delivered_value),
        delivered_value_commission_pct: Number(ruleForm.delivered_value_commission_pct),
        collection_commission_pct: Number(ruleForm.collection_commission_pct),
        upsell_commission_pct: Number(ruleForm.upsell_commission_pct),
        extra_hours_bonus_rate: Number(ruleForm.extra_hours_bonus_rate),
        extra_hours_min_threshold: Number(ruleForm.extra_hours_min_threshold),
        extra_hours_salary_pct: Number(ruleForm.extra_hours_salary_pct),
        status: ruleForm.status,
        notes: ruleForm.notes.trim() || null,
      };

      if (editingRuleId) {
        await updateIncentiveRule(editingRuleId, payload);
        toast.success("Incentive rule updated successfully");
      } else {
        await createIncentiveRule(payload);
        toast.success("Incentive rule created successfully");
      }
      setRuleModalOpen(false);
      refetchRules();
    } catch (err: any) {
      toast.error(err.message || "Failed to save incentive rule");
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm("Are you sure you want to delete this incentive policy?")) return;
    try {
      await deleteIncentiveRule(ruleId);
      toast.success("Incentive rule deleted");
      refetchRules();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete rule");
    }
  };

  const handlePreviewIncentive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUserId) {
      toast.error("Please select an employee to preview");
      return;
    }

    setIsPreviewLoading(true);
    setPreviewResult(null);
    try {
      const res = await previewIncentiveCalculation(Number(previewUserId), previewMonth, previewYear);
      setPreviewResult(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to preview incentive");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const filteredSalaries = React.useMemo(() => {
    return salaries.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.user?.full_name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.user?.employee_detail?.employee_id?.toLowerCase().includes(q) ||
        s.user?.employee_detail?.designation?.title?.toLowerCase().includes(q)
      );
    });
  }, [salaries, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Salary & Incentive Rules Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dynamic incentive rules (delivered orders, sales value, collections, upsells & extra hours) integrated with monthly payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => {
              setPreviewUserId(employees[0]?.id ? String(employees[0].id) : "");
              setPreviewResult(null);
              setPreviewModalOpen(true);
            }}
            className="gap-2 text-xs"
          >
            <Target className="size-4 text-primary" />
            <span>Test / Preview Incentive</span>
          </Button>

          <Button
            onClick={() => {
              setGenMonth(selectedMonth);
              setGenYear(selectedYear);
              setGenerateModalOpen(true);
            }}
            className="gap-2 text-xs shadow-xs"
          >
            <Sparkles className="size-4" />
            <span>Process Monthly Payroll</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <div className="flex justify-between items-center border-b pb-2">
          <TabsList className="grid grid-cols-2 w-full sm:w-[440px]">
            <TabsTrigger value="payroll" className="gap-2">
              <CreditCard className="size-4" />
              Monthly Payroll ({MONTHS[selectedMonth - 1]} {selectedYear})
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <SlidersHorizontal className="size-4" />
              Incentive Rules Engine ({rules.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: MONTHLY PAYROLL                                         */}
        {/* ============================================================== */}
        <TabsContent value="payroll" className="space-y-6 pt-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card className="border shadow-2xs bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Net Payroll
                </span>
                <div className="text-2xl font-extrabold text-foreground tabular-nums">
                  ৳{Number(summary?.total_net || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Across {summary?.count || 0} employee records
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Base & Allowances
                </span>
                <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
                  ৳{(Number(summary?.total_basic || 0) + Number(summary?.total_allowance || 0)).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground">Guaranteed monthly pay</p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Incentive Commission
                </span>
                <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                  ৳{Number((summary as any)?.total_commission || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">Delivered sales & upsells</p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Bonus & Overtime
                </span>
                <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
                  ৳{(Number(summary?.total_bonus || 0) + Number(summary?.total_overtime || 0)).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground">Performance & extra hours</p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Deductions
                </span>
                <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
                  ৳{Number(summary?.total_deductions || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-rose-500 font-medium">Loans & absent penalties</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Period Selection */}
          <Card className="border shadow-xs bg-card">
            <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search employee, ID, designation..."
                    className="pl-9 h-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(val) => setSelectedMonth(Number(val))}
                >
                  <SelectTrigger className="h-9 text-xs w-[130px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {MONTHS.map((m, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(selectedYear)}
                  onValueChange={(val) => setSelectedYear(Number(val))}
                >
                  <SelectTrigger className="h-9 text-xs w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <CardContent className="p-0 border-t">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4 text-left">Employee</th>
                      <th className="py-3 px-4 text-left">Basic Salary</th>
                      <th className="py-3 px-4 text-left">Allowances</th>
                      <th className="py-3 px-4 text-left">Incentive Commission</th>
                      <th className="py-3 px-4 text-left">Bonus & Extra Hrs</th>
                      <th className="py-3 px-4 text-left">Overtime</th>
                      <th className="py-3 px-4 text-left">Gross Salary</th>
                      <th className="py-3 px-4 text-left">Deductions</th>
                      <th className="py-3 px-4 text-left">Net Salary</th>
                      <th className="py-3 px-4 text-left">Payment</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-muted-foreground">
                          Loading monthly payroll records...
                        </td>
                      </tr>
                    ) : filteredSalaries.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-muted-foreground">
                          No payroll records generated yet for {MONTHS[selectedMonth - 1]} {selectedYear}.
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGenerateModalOpen(true)}
                              className="text-xs"
                            >
                              Process Payroll with Incentive Engine
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSalaries.map((sal) => (
                        <tr key={sal.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                                {sal.user?.full_name?.slice(0, 2).toUpperCase() || "EM"}
                              </div>
                              <div>
                                <span className="font-bold text-foreground block">
                                  {sal.user?.full_name || "Employee"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {sal.user?.employee_detail?.designation?.title || "Staff"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">
                            ৳{sal.basic_salary.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground">
                            ৳{sal.total_allowance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-emerald-600">
                                ৳{(sal.commission_amount || 0).toLocaleString()}
                              </span>
                              {sal.incentive_details && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-muted-foreground hover:text-primary"
                                  onClick={() => openBreakdown(sal)}
                                  title="View Incentive Breakdown"
                                >
                                  <Eye className="size-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-600">
                            {sal.bonus > 0 ? `+৳${sal.bonus.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-600">
                            {sal.overtime_amount > 0 ? `+৳${sal.overtime_amount.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-foreground">
                            ৳{sal.gross_salary.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-rose-600 font-semibold">
                            {sal.total_deduction > 0 ? `-৳${sal.total_deduction.toLocaleString()}` : "৳0"}
                          </td>
                          <td className="py-3 px-4 font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            ৳{sal.net_salary.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                sal.payment_status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                              }`}
                            >
                              {sal.payment_status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 px-2"
                                onClick={() => openPayslip(sal)}
                              >
                                <Receipt className="size-3" />
                                <span>Slip</span>
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs gap-1 px-2.5"
                                onClick={() => openPayModal(sal)}
                              >
                                <Pencil className="size-3" />
                                <span>Pay</span>
                              </Button>
                            </div>
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

        {/* ============================================================== */}
        {/* TAB 2: DYNAMIC INCENTIVE RULES ENGINE                          */}
        {/* ============================================================== */}
        <TabsContent value="rules" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <SlidersHorizontal className="size-5 text-primary" />
                Configured Incentive Policies
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rules can be configured department-wide, with optional individual employee overrides.
              </p>
            </div>

            <Button onClick={openCreateRuleModal} className="gap-2 text-xs">
              <Plus className="size-4" />
              <span>Create New Incentive Policy</span>
            </Button>
          </div>

          {/* Rule Cards Grid */}
          {rulesLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              <Clock className="size-8 animate-spin mx-auto text-primary mb-2" />
              <p>Loading incentive policies...</p>
            </div>
          ) : rules.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <SlidersHorizontal className="size-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No Incentive Rules Configured</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Configure dynamic rules for departments or employees to automate commission calculations based on delivered orders, sales value, collections, and upsells.
              </p>
              <Button onClick={openCreateRuleModal} className="mt-4 gap-2 text-xs">
                <Plus className="size-4" />
                Create Incentive Rule
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => {
                const isEmployeeOverride = !!rule.user_id;

                return (
                  <Card key={rule.id} className="border shadow-xs flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={rule.status === "active" ? "default" : "secondary"}
                              className="text-[10px] capitalize"
                            >
                              {rule.status}
                            </Badge>
                            {isEmployeeOverride ? (
                              <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                                Employee Override: {rule.user?.full_name}
                              </Badge>
                            ) : rule.department ? (
                              <Badge variant="outline" className="text-[10px]">
                                Department: {rule.department.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                Global Default
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-bold text-foreground">
                            {rule.rule_name}
                          </CardTitle>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditRuleModal(rule)}
                            title="Edit Rule"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteRule(rule.id)}
                            title="Delete Rule"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {rule.notes && (
                        <CardDescription className="text-xs mt-1">
                          {rule.notes}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/60">
                        {/* Delivered Orders */}
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground block">
                            Delivered Orders Bonus:
                          </span>
                          <span className="font-semibold text-foreground">
                            {rule.order_delivered_bonus > 0
                              ? `৳${rule.order_delivered_bonus} / order (min: ${rule.min_delivered_orders})`
                              : "None"}
                          </span>
                        </div>

                        {/* Delivered Value */}
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground block">
                            Delivered Value Commission:
                          </span>
                          <span className="font-semibold text-foreground">
                            {rule.delivered_value_commission_pct > 0
                              ? `${rule.delivered_value_commission_pct}% (min: ৳${rule.min_delivered_value.toLocaleString()})`
                              : "None"}
                          </span>
                        </div>

                        {/* Collections */}
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground block">
                            Collection / Paid Commission:
                          </span>
                          <span className="font-semibold text-foreground">
                            {rule.collection_commission_pct > 0
                              ? `${rule.collection_commission_pct}% of cash collected`
                              : "None"}
                          </span>
                        </div>

                        {/* Upsells */}
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground block">
                            Delivered Upsell Commission:
                          </span>
                          <span className="font-semibold text-amber-600">
                            {rule.upsell_commission_pct > 0
                              ? `${rule.upsell_commission_pct}% of upsell value`
                              : "None"}
                          </span>
                        </div>

                        {/* Extra Hours */}
                        <div className="col-span-2 pt-1 border-t border-border/40 flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground">Extra Hours / Overtime Policy:</span>
                          <span className="font-medium text-blue-600">
                            {rule.extra_hours_bonus_rate > 0
                              ? `৳${rule.extra_hours_bonus_rate}/hr`
                              : "Standard 1.5x Basic"}
                            {rule.extra_hours_salary_pct > 0
                              ? ` + ${rule.extra_hours_salary_pct}% basic bonus (≥${rule.extra_hours_min_threshold}h)`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ============================================================== */}
      {/* INCENTIVE BREAKDOWN MODAL                                      */}
      {/* ============================================================== */}
      <Dialog open={breakdownModalOpen} onOpenChange={setBreakdownModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-600" />
              Dynamic Incentive Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Itemized performance earnings for {activeBreakdown?.user?.full_name} for{" "}
              {MONTHS[(activeBreakdown?.month || 1) - 1]} {activeBreakdown?.year}
            </DialogDescription>
          </DialogHeader>

          {activeBreakdown?.incentive_details && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                <span className="font-bold text-foreground">Total Dynamic Commission</span>
                <span className="text-xl font-extrabold text-emerald-600 font-mono">
                  ৳{(activeBreakdown.commission_amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="divide-y border rounded-lg bg-card">
                {/* 1. Delivered Orders Count */}
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-foreground block">Delivered Orders Bonus</span>
                    <span className="text-[11px] text-muted-foreground">
                      {activeBreakdown.incentive_details.delivered_orders_count || 0} delivered orders
                    </span>
                  </div>
                  <span className="font-mono font-semibold">
                    ৳{(activeBreakdown.incentive_details.delivered_orders_bonus || 0).toLocaleString()}
                  </span>
                </div>

                {/* 2. Delivered Sales Value */}
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-foreground block">Delivered Sales Commission</span>
                    <span className="text-[11px] text-muted-foreground">
                      Delivered Value: ৳
                      {(activeBreakdown.incentive_details.delivered_order_value || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="font-mono font-semibold">
                    ৳{(activeBreakdown.incentive_details.delivered_value_commission || 0).toLocaleString()}
                  </span>
                </div>

                {/* 3. Collection Value */}
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-foreground block">Collection / Paid Commission</span>
                    <span className="text-[11px] text-muted-foreground">
                      Total Collected: ৳
                      {(activeBreakdown.incentive_details.collection_value || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="font-mono font-semibold">
                    ৳{(activeBreakdown.incentive_details.collection_commission || 0).toLocaleString()}
                  </span>
                </div>

                {/* 4. Delivered Upsell Commission */}
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-foreground block">Delivered Upsell Commission</span>
                    <span className="text-[11px] text-muted-foreground">
                      {activeBreakdown.incentive_details.upsell_count || 0} upsells (৳
                      {(activeBreakdown.incentive_details.upsell_value || 0).toLocaleString()})
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-amber-600">
                    ৳{(activeBreakdown.incentive_details.upsell_commission || 0).toLocaleString()}
                  </span>
                </div>

                {/* 5. Extra Hours */}
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-foreground block">Extra Hours / Overtime</span>
                    <span className="text-[11px] text-muted-foreground">
                      {activeBreakdown.incentive_details.overtime_hours || 0} overtime hours logged
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-blue-600 block">
                      ৳{(activeBreakdown.incentive_details.overtime_amount || 0).toLocaleString()}
                    </span>
                    {(activeBreakdown.incentive_details.extra_hours_bonus || 0) > 0 && (
                      <span className="text-[10px] text-emerald-600">
                        +৳{activeBreakdown.incentive_details.extra_hours_bonus} extra bonus
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" onClick={() => setBreakdownModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* PREVIEW INCENTIVE CALCULATION MODAL                            */}
      {/* ============================================================== */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handlePreviewIncentive}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Live Incentive Calculation Preview
              </DialogTitle>
              <DialogDescription className="text-xs">
                Test and verify how active incentive rules calculate commissions for an employee in real-time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label>Select Employee *</Label>
                <Select value={previewUserId} onValueChange={setPreviewUserId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose an employee..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 text-xs">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.full_name}{" "}
                        {emp.employee_detail?.department
                          ? `(${emp.employee_detail.department.name})`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Month</Label>
                  <Select
                    value={String(previewMonth)}
                    onValueChange={(val) => setPreviewMonth(Number(val))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MONTHS.map((m, idx) => (
                        <SelectItem key={idx + 1} value={String(idx + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Year</Label>
                  <Select
                    value={String(previewYear)}
                    onValueChange={(val) => setPreviewYear(Number(val))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isPreviewLoading} className="w-full gap-2 text-xs">
                {isPreviewLoading ? "Calculating Live..." : "Compute Incentive Now"}
              </Button>

              {previewResult && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        Rule Applied:
                      </span>
                      <strong className="text-foreground">
                        {previewResult.calculation?.rule_applied?.name || "Standard Default (No Rule)"}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Total Commission:
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-600">
                        ৳{(previewResult.calculation?.commission_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {previewResult.calculation?.breakdown && (
                    <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered Orders:</span>
                        <span className="font-semibold">
                          {previewResult.calculation.breakdown.delivered_orders_count} orders (Bonus: ৳
                          {previewResult.calculation.breakdown.delivered_orders_bonus})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered Sales Value:</span>
                        <span className="font-semibold">
                          ৳{previewResult.calculation.breakdown.delivered_order_value} (Comm: ৳
                          {previewResult.calculation.breakdown.delivered_value_commission})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Collected Cash:</span>
                        <span className="font-semibold">
                          ৳{previewResult.calculation.breakdown.collection_value} (Comm: ৳
                          {previewResult.calculation.breakdown.collection_commission})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered Upsells:</span>
                        <span className="font-semibold text-amber-600">
                          {previewResult.calculation.breakdown.upsell_count} items (৳
                          {previewResult.calculation.breakdown.upsell_value}, Comm: ৳
                          {previewResult.calculation.breakdown.upsell_commission})
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-muted-foreground">Overtime / Extra Hours:</span>
                        <span className="font-semibold text-blue-600">
                          {previewResult.calculation.breakdown.overtime_hours}h (৳
                          {previewResult.calculation.breakdown.overtime_amount})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreviewModalOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* CREATE / EDIT INCENTIVE RULE MODAL                             */}
      {/* ============================================================== */}
      <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveRule}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal className="size-5 text-primary" />
                {editingRuleId ? "Edit Incentive Policy" : "Create Dynamic Incentive Policy"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure threshold criteria for delivered orders count, sales value, collections, upsells, and extra hours.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Rule Name */}
              <div className="space-y-1.5">
                <Label>Policy Name *</Label>
                <Input
                  placeholder="e.g. Sales Team Q4 Incentive Rule"
                  value={ruleForm.rule_name}
                  onChange={(e) => setRuleForm({ ...ruleForm, rule_name: e.target.value })}
                  required
                />
              </div>

              {/* Target Scope */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Department Scope</Label>
                  <Select
                    value={ruleForm.department_id}
                    onValueChange={(val) => setRuleForm({ ...ruleForm, department_id: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="all">Company Wide (All)</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Employee Specific Override</Label>
                  <Select
                    value={ruleForm.user_id}
                    onValueChange={(val) => setRuleForm({ ...ruleForm, user_id: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="None (Department Rule)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 text-xs">
                      <SelectItem value="none">None (Use Department Policy)</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Criteria 1: Delivered Orders Count */}
              <div className="space-y-2">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Target className="size-4 text-primary" />
                  Criteria 1: Delivered Orders Slab
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Min Delivered Orders Threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      value={ruleForm.min_delivered_orders}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, min_delivered_orders: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Bonus Per Delivered Order (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={ruleForm.order_delivered_bonus}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, order_delivered_bonus: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Criteria 2: Delivered Order Value */}
              <div className="space-y-2">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <DollarSign className="size-4 text-primary" />
                  Criteria 2: Total Delivered Sales Value
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Min Delivered Sales Threshold (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={ruleForm.min_delivered_value}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, min_delivered_value: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Sales Value Commission (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      placeholder="e.g. 2.5"
                      value={ruleForm.delivered_value_commission_pct}
                      onChange={(e) =>
                        setRuleForm({
                          ...ruleForm,
                          delivered_value_commission_pct: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Criteria 3 & 4: Collections & Upsells */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-foreground flex items-center gap-1.5">
                    <Percent className="size-3.5 text-primary" />
                    Criteria 3: Collection %
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="e.g. 1.0"
                    value={ruleForm.collection_commission_pct}
                    onChange={(e) =>
                      setRuleForm({
                        ...ruleForm,
                        collection_commission_pct: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">% of cash collected/paid</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Criteria 4: Upsell Commission %
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="e.g. 5.0"
                    value={ruleForm.upsell_commission_pct}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, upsell_commission_pct: Number(e.target.value) })
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">% of delivered upsell value</p>
                </div>
              </div>

              {/* Criteria 5: Extra Working Hours */}
              <div className="space-y-2">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-4 text-blue-500" />
                  Criteria 5: Extra Hours / Overtime Policy
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Hourly Overtime Rate (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0 for 1.5x basic"
                      value={ruleForm.extra_hours_bonus_rate}
                      onChange={(e) =>
                        setRuleForm({
                          ...ruleForm,
                          extra_hours_bonus_rate: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Min Extra Hours Threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      value={ruleForm.extra_hours_min_threshold}
                      onChange={(e) =>
                        setRuleForm({
                          ...ruleForm,
                          extra_hours_min_threshold: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Salary Bonus % If Threshold Met</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="e.g. 5.0"
                      value={ruleForm.extra_hours_salary_pct}
                      onChange={(e) =>
                        setRuleForm({
                          ...ruleForm,
                          extra_hours_salary_pct: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <Label>Policy Status</Label>
                  <Select
                    value={ruleForm.status}
                    onValueChange={(val: any) => setRuleForm({ ...ruleForm, status: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Policy Notes / Description</Label>
                  <Input
                    placeholder="e.g. Effective from Q4 sales sprint"
                    value={ruleForm.notes}
                    onChange={(e) => setRuleForm({ ...ruleForm, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRuleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSavingRule}>
                {isSavingRule ? "Saving Policy..." : "Save Incentive Policy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* PROCESS PAYROLL MODAL                                          */}
      {/* ============================================================== */}
      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleGeneratePayroll}>
            <DialogHeader>
              <DialogTitle>Process Monthly Payroll</DialogTitle>
              <DialogDescription className="text-xs">
                Auto-calculates Basic Salary + Allowances + Dynamic Commission (Delivered orders, value, collections, upsells) + Overtime Pay − Deductions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Salary Month *</Label>
                  <Select
                    value={String(genMonth)}
                    onValueChange={(val) => setGenMonth(Number(val))}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MONTHS.map((m, idx) => (
                        <SelectItem key={idx + 1} value={String(idx + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Salary Year *</Label>
                  <Select
                    value={String(genYear)}
                    onValueChange={(val) => setGenYear(Number(val))}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30 text-muted-foreground space-y-1 text-[11px]">
                <p className="font-semibold text-foreground">Incentive Automation Details:</p>
                <p>• Applies configured department rules & employee overrides.</p>
                <p>• Calculates bonus for delivered orders & sales value threshold.</p>
                <p>• Computes commissions for cash collections & verified delivered upsells.</p>
                <p>• Pulls overtime hours from attendance & applies extra hours bonuses.</p>
                <p>• Deducts active loans and absent penalties automatically.</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isGenerating}>
                {isGenerating ? "Processing..." : "Generate Payroll"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* PAYMENT DISBURSEMENT MODAL                                     */}
      {/* ============================================================== */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdatePayment}>
            <DialogHeader>
              <DialogTitle>Disburse / Update Salary Payment</DialogTitle>
              <DialogDescription className="text-xs">
                Update payment status for {activeSalary?.user?.full_name} (Net: ৳
                {activeSalary?.net_salary.toLocaleString()})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label>Payment Status *</Label>
                <Select
                  value={payForm.payment_status}
                  onValueChange={(val: any) => setPayForm({ ...payForm, payment_status: val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="paid">Paid (Disbursed)</SelectItem>
                    <SelectItem value="unpaid">Unpaid (Pending)</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <Select
                    value={payForm.payment_method}
                    onValueChange={(val) => setPayForm({ ...payForm, payment_method: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Disbursement Date</Label>
                  <Input
                    type="date"
                    value={payForm.payment_date}
                    onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Transaction Reference / Cheque No.</Label>
                <Input
                  placeholder="e.g. TRX-99210 or Cheque #1029"
                  value={payForm.transaction_ref}
                  onChange={(e) => setPayForm({ ...payForm, transaction_ref: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Special Festival Bonus (৳)</Label>
                <Input
                  type="number"
                  min={0}
                  value={payForm.bonus}
                  onChange={(e) => setPayForm({ ...payForm, bonus: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setPayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Payment Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* OFFICIAL PAYSLIP MODAL                                         */}
      {/* ============================================================== */}
      <Dialog open={payslipModalOpen} onOpenChange={setPayslipModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          {payslipData && (
            <div className="space-y-5 text-xs">
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">OFFICIAL SALARY PAYSLIP</h2>
                  <p className="text-xs text-muted-foreground">
                    For the month of {MONTHS[payslipData.month - 1]} {payslipData.year}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-foreground block">Zymerce E-Commerce Ltd.</span>
                  <span className="text-[11px] text-muted-foreground">Corporate Headquarters, Dhaka</span>
                </div>
              </div>

              {/* Employee Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-muted/20 border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Employee Name:</span>
                  <strong className="text-foreground">{payslipData.user?.full_name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Employee ID:</span>
                  <strong className="text-foreground font-mono">
                    {payslipData.user?.employee_detail?.employee_id || `EMP-${payslipData.user_id}`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Department:</span>
                  <strong className="text-foreground">
                    {payslipData.user?.employee_detail?.department?.name || "Unassigned"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Designation:</span>
                  <strong className="text-foreground">
                    {payslipData.user?.employee_detail?.designation?.title || "Staff"}
                  </strong>
                </div>
              </div>

              {/* Breakdown Grid: Earnings vs Deductions */}
              <div className="grid grid-cols-2 gap-4 border rounded-xl overflow-hidden">
                {/* Earnings */}
                <div className="p-3.5 space-y-2 border-r bg-muted/5">
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 block border-b pb-1">
                    EARNINGS & INCENTIVES
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Salary:</span>
                      <span className="font-mono font-semibold">৳{payslipData.basic_salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Allowances:</span>
                      <span className="font-mono font-semibold">৳{payslipData.total_allowance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium text-emerald-600">
                        Incentive Commission:
                      </span>
                      <span className="font-mono font-bold text-emerald-600">
                        +৳{(payslipData.commission_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonus & Extra Hours:</span>
                      <span className="font-mono font-semibold text-amber-600">
                        ৳{payslipData.bonus.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overtime Pay:</span>
                      <span className="font-mono font-semibold text-blue-600">
                        ৳{payslipData.overtime_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Gross Earnings:</span>
                      <span className="font-mono">৳{payslipData.gross_salary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-3.5 space-y-2 bg-muted/5">
                  <span className="font-bold text-xs text-rose-700 dark:text-rose-400 block border-b pb-1">
                    DEDUCTIONS & ADJUSTMENTS
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan / Advance Deduction:</span>
                      <span className="font-mono font-semibold text-amber-600">
                        ৳{payslipData.loan_deduction.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Absent Penalty:</span>
                      <span className="font-mono font-semibold text-rose-600">
                        ৳{payslipData.absent_deduction.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other Deductions:</span>
                      <span className="font-mono font-semibold">৳{payslipData.other_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-6 border-t font-bold text-rose-600">
                      <span>Total Deductions:</span>
                      <span className="font-mono">৳{payslipData.total_deduction.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Banner */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    NET SALARY PAYABLE
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Status: <strong className="uppercase">{payslipData.payment_status}</strong> (
                    {payslipData.payment_method || "Pending"})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary font-mono">
                    ৳{payslipData.net_salary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setPayslipModalOpen(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => window.print()} className="gap-1.5">
                  <Printer className="size-3.5" />
                  <span>Print Payslip</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
