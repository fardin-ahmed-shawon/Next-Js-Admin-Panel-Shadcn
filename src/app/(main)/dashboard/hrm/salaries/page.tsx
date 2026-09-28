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
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";

import {
  useHrmSalaries,
  generatePayroll,
  updateSalaryPayment,
  SalaryRecord,
} from "@/hooks/useHrm";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SalaryManagementPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(now.getFullYear());
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const { salaries, summary, loading, refetch } = useHrmSalaries({
    month: selectedMonth,
    year: selectedYear,
    payment_status: statusFilter === "all" ? undefined : statusFilter,
  });

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

  // Payslip modal
  const [payslipModalOpen, setPayslipModalOpen] = React.useState(false);
  const [payslipData, setPayslipData] = React.useState<SalaryRecord | null>(null);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await generatePayroll(genMonth, genYear, genBonus);
      toast.success(`Payroll generated for ${MONTHS[genMonth - 1]} ${genYear}`);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CreditCard className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Salary & Monthly Payroll Management
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Basic Salary + Allowances + Bonus + Overtime − Deductions (Loans/Advances) = Net Salary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              setGenMonth(selectedMonth);
              setGenYear(selectedYear);
              setGenerateModalOpen(true);
            }}
            className="gap-2 shadow-xs text-xs"
          >
            <Sparkles className="size-4" />
            <span>Process Monthly Payroll</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              Total Allowances
            </span>
            <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
              ৳{Number(summary?.total_allowance || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground">House, medical & transport</p>
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
            <p className="text-[11px] text-rose-500 font-medium">Loan advances & absent cuts</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Disbursement Status
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              {summary?.paid_count || 0} Paid
            </div>
            <p className="text-[11px] text-amber-600 font-medium">
              {summary?.unpaid_count || 0} Pending payment
            </p>
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
                  <th className="py-3 px-4 text-left">Bonus</th>
                  <th className="py-3 px-4 text-left">Overtime</th>
                  <th className="py-3 px-4 text-left">Gross Salary</th>
                  <th className="py-3 px-4 text-left">Loan Deduction</th>
                  <th className="py-3 px-4 text-left">Total Deductions</th>
                  <th className="py-3 px-4 text-left">Net Salary</th>
                  <th className="py-3 px-4 text-left">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSalaries.length === 0 ? (
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
                          Process Payroll Now
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
                      <td className="py-3 px-4 font-mono text-emerald-600">
                        {sal.bonus > 0 ? `+৳${sal.bonus.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600">
                        {sal.overtime_amount > 0 ? `+৳${sal.overtime_amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        ৳{sal.gross_salary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-600 font-semibold">
                        {sal.loan_deduction > 0 ? `-৳${sal.loan_deduction.toLocaleString()}` : "—"}
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

      {/* PROCESS PAYROLL MODAL */}
      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleGeneratePayroll}>
            <DialogHeader>
              <DialogTitle>Process Monthly Payroll</DialogTitle>
              <DialogDescription className="text-xs">
                Auto-calculates Basic Salary + Allowances + Overtime Pay − Loan Deductions & Absent Penalties
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
                <p className="font-semibold text-foreground">Automation Details:</p>
                <p>• Automatically pulls employee base pay & allowances.</p>
                <p>• Calculates overtime pay from recorded attendance hours.</p>
                <p>• Automatically applies monthly installments for active loans & advances.</p>
                <p>• Subtracts absent days deductions from basic salary.</p>
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

      {/* PAYMENT DISBURSEMENT MODAL */}
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

      {/* OFFICIAL PAYSLIP MODAL */}
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
                    EARNINGS & ALLOWANCES
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
                      <span className="text-muted-foreground">Performance Bonus:</span>
                      <span className="font-mono font-semibold text-emerald-600">৳{payslipData.bonus.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overtime Pay:</span>
                      <span className="font-mono font-semibold text-blue-600">৳{payslipData.overtime_amount.toLocaleString()}</span>
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
