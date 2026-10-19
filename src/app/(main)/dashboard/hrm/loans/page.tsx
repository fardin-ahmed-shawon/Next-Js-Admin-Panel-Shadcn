"use client";

import hrmStyles from "@/components/hrm/hrm-page.module.css";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { hasAllUserAccess } from "@/hooks/useRoles";
import {
  CreditCard,
  DollarSign,
  PlusCircle,
  Pencil,
  CheckCircle2,
  Calendar,
  Search,
  Eye,
  ArrowRight,
  TrendingUp,
  Receipt,
  RotateCcw,
  RefreshCw,
  X,
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
import { Textarea } from "@/components/ui/textarea";

import {
  useHrmLoans,
  useHrmEmployees,
  createLoan,
  recordLoanRepayment,
  updateLoanStatus,
  LoanRecord,
} from "@/hooks/useHrm";

export default function LoansAdvancesPage() {
  const { user } = useAuth();
  const canManageEmployee = (id: number | null | undefined) => hasAllUserAccess(user, "loans") || Number(id) === Number(user?.id);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { loans, summary, loading, refetch } = useHrmLoans({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const { employees } = useHrmEmployees("", "loans");

  // Create Loan Modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [loanForm, setLoanForm] = React.useState({
    user_id: "",
    loan_type: "salary_advance",
    amount: 10000,
    disbursement_date: new Date().toISOString().split("T")[0],
    total_installments: 2,
    purpose: "Salary advance requested for personal emergency",
  });

  // Manual Repayment Modal
  const [repayModalOpen, setRepayModalOpen] = React.useState(false);
  const [activeLoan, setActiveLoan] = React.useState<LoanRecord | null>(null);
  const [repayForm, setRepayForm] = React.useState({
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    notes: "",
  });

  // Loan Repayments View Modal
  const [historyModalOpen, setHistoryModalOpen] = React.useState(false);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.user_id) {
      toast.error("Please select an employee");
      return;
    }
    try {
      await createLoan({
        user_id: Number(loanForm.user_id),
        loan_type: loanForm.loan_type,
        amount: Number(loanForm.amount),
        disbursement_date: loanForm.disbursement_date,
        total_installments: Number(loanForm.total_installments),
        purpose: loanForm.purpose,
      });
      toast.success("Salary advance / loan approved and registered");
      setCreateModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create loan");
    }
  };

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) return;
    try {
      await recordLoanRepayment(activeLoan.id, repayForm);
      toast.success("Installment repayment recorded successfully");
      setRepayModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to record repayment");
    }
  };

  const openRepayModal = (loan: LoanRecord) => {
    setActiveLoan(loan);
    setRepayForm({
      amount: loan.monthly_deduction || loan.remaining_amount,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      notes: "Manual installment payment",
    });
    setRepayModalOpen(true);
  };

  const openHistoryModal = (loan: LoanRecord) => {
    setActiveLoan(loan);
    setHistoryModalOpen(true);
  };

  const filteredLoans = React.useMemo(() => {
    return loans.filter((l) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.user?.full_name?.toLowerCase().includes(q) ||
        l.user?.employee_detail?.employee_id?.toLowerCase().includes(q) ||
        l.purpose?.toLowerCase().includes(q)
      );
    });
  }, [loans, searchQuery]);
  const hasActiveFilters = statusFilter !== "all" || !!searchQuery;

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <div className={hrmStyles.page}>
      {/* Header + Toolbar (Orders page pattern) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Title + description */}
        <div className="space-y-1 hidden sm:block">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl tracking-tight">Loans &amp; Salary Advances</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {summary?.active_count || 0} Active
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Advance disbursements, installment repayment schedules, remaining balances, and monthly salary deductions.
          </p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl tracking-tight">Loans &amp; Advances</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {summary?.active_count || 0} Active
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Advance disbursements and installment schedules.
          </p>
        </div>

        {/* Controls: on mobile = full-width row, desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end flex-wrap">
            <Button
              size="sm"
              onClick={() => {
                setLoanForm({
                  user_id: employees.find((employee) => canManageEmployee(employee.id))?.id?.toString() || "",
                  loan_type: "salary_advance",
                  amount: 10000,
                  disbursement_date: new Date().toISOString().split("T")[0],
                  total_installments: 2,
                  purpose: "Salary advance requested for emergency expenses",
                });
                setCreateModalOpen(true);
              }}
              className="gap-1.5 h-9 text-xs"
            >
              <PlusCircle className="size-4" />
              <span>Issue Advance / Loan</span>
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              aria-label="Refresh loan records"
              onClick={() => refetch()}
              disabled={loading}
              title="Refresh loan records"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={hrmStyles.stats}>
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Disbursed
            </span>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              ৳{Number(summary?.total_disbursed || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground">Cumulative advances issued</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Recovered
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              ৳{Number(summary?.total_paid || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Repaid via payroll deduction</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Balance Remaining
            </span>
            <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
              ৳{Number(summary?.total_remaining || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground">Pending next payroll cycles</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Loans
            </span>
            <div className="text-2xl font-extrabold text-primary tabular-nums">
              {summary?.active_count || 0}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {summary?.pending_count || 0} requests pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Minimal Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-48 sm:w-60">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by employee, purpose..."
            className="pl-8 h-8 text-xs w-full bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs w-[130px] shrink-0">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="repaid">Repaid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
            onClick={handleResetFilters}
            title="Reset filters"
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="border shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Employee</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Loan Amount</th>
                  <th className="py-3 px-4 text-left">Deduction / Mo</th>
                  <th className="py-3 px-4 text-left">Installments</th>
                  <th className="py-3 px-4 text-left">Paid</th>
                  <th className="py-3 px-4 text-left">Remaining</th>
                  <th className="py-3 px-4 text-left">Progress</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-muted p-3">
                          <CreditCard className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium text-foreground">No loans or advances recorded</p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {hasActiveFilters
                            ? "No loan records match your selected filter criteria."
                            : "There are currently no active employee loans or advances."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => {
                    const pct = loan.amount > 0 ? Math.round((loan.paid_amount / loan.amount) * 100) : 0;
                    return (
                      <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {loan.user?.full_name?.slice(0, 2).toUpperCase() || "EM"}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block">
                                {loan.user?.full_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {loan.user?.employee_detail?.employee_id || `#${loan.user_id}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize font-medium text-foreground">
                          {loan.loan_type.replace("_", " ")}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          ৳{loan.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-amber-600">
                          ৳{loan.monthly_deduction.toLocaleString()}/mo
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-semibold">
                          {loan.total_installments} months
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">
                          ৳{loan.paid_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          ৳{loan.remaining_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold ${
                              loan.status === "active"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                                : loan.status === "repaid"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {loan.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => openHistoryModal(loan)}
                            >
                              <Receipt className="size-3" />
                              <span>History</span>
                            </Button>
                            {canManageEmployee(loan.user_id) && loan.remaining_amount > 0 && (
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1 px-2.5"
                                onClick={() => openRepayModal(loan)}
                              >
                                <RotateCcw className="size-3" />
                                <span>Repay</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE LOAN DIALOG */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateLoan}>
            <DialogHeader>
              <DialogTitle>Issue Employee Loan / Salary Advance</DialogTitle>
              <DialogDescription className="text-xs">
                Configure advance amount, installment duration, and monthly automatic payroll deduction
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label>Employee *</Label>
                <Select
                  value={loanForm.user_id}
                  onValueChange={(val) => setLoanForm({ ...loanForm, user_id: val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {employees.filter((employee) => canManageEmployee(employee.id)).map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.full_name} ({e.employee_detail?.employee_id || `EMP-${e.id}`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Advance Amount (৳) *</Label>
                  <Input
                    type="number"
                    min={500}
                    required
                    value={loanForm.amount}
                    onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Installments (Months) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={loanForm.total_installments}
                    onChange={(e) =>
                      setLoanForm({ ...loanForm, total_installments: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/30 flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Monthly Payroll Deduction:</span>
                <span className="font-mono text-amber-600 font-bold">
                  ৳
                  {loanForm.total_installments > 0
                    ? Math.round(loanForm.amount / loanForm.total_installments).toLocaleString()
                    : 0}
                  /month
                </span>
              </div>

              <div className="space-y-1">
                <Label>Disbursement Date *</Label>
                <Input
                  type="date"
                  required
                  value={loanForm.disbursement_date}
                  onChange={(e) => setLoanForm({ ...loanForm, disbursement_date: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Reason / Purpose</Label>
                <Textarea
                  placeholder="Purpose of salary advance..."
                  rows={2}
                  className="text-xs"
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Approve & Issue Advance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RECORD REPAYMENT DIALOG */}
      <Dialog open={repayModalOpen} onOpenChange={setRepayModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleRecordRepayment}>
            <DialogHeader>
              <DialogTitle>Record Installment Repayment</DialogTitle>
              <DialogDescription className="text-xs">
                Manual repayment entry for {activeLoan?.user?.full_name} (Remaining: ৳
                {activeLoan?.remaining_amount.toLocaleString()})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label>Repayment Amount (৳) *</Label>
                <Input
                  type="number"
                  required
                  min={100}
                  max={activeLoan?.remaining_amount}
                  value={repayForm.amount}
                  onChange={(e) => setRepayForm({ ...repayForm, amount: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <Select
                    value={repayForm.payment_method}
                    onValueChange={(val) => setRepayForm({ ...repayForm, payment_method: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="cash">Cash Handover</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="bkash">bKash / Nagad</SelectItem>
                      <SelectItem value="salary_deduction">Salary Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    required
                    value={repayForm.payment_date}
                    onChange={(e) => setRepayForm({ ...repayForm, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Input
                  placeholder="e.g. Received cash at accounts desk"
                  value={repayForm.notes}
                  onChange={(e) => setRepayForm({ ...repayForm, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRepayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REPAYMENT HISTORY VIEW MODAL */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Repayment History</DialogTitle>
            <DialogDescription className="text-xs">
              Installment deductions & repayments for {activeLoan?.user?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/20 border text-center">
              <div>
                <span className="text-[10px] text-muted-foreground block">Loan Total</span>
                <strong className="font-mono text-foreground">
                  ৳{activeLoan?.amount.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Repaid Amount</span>
                <strong className="font-mono text-emerald-600">
                  ৳{activeLoan?.paid_amount.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Remaining</span>
                <strong className="font-mono text-amber-600">
                  ৳{activeLoan?.remaining_amount.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {activeLoan?.repayments?.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">No repayments recorded yet.</p>
              ) : (
                activeLoan?.repayments?.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg border bg-muted/10 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-mono font-bold text-foreground">
                        ৳{rep.amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {rep.payment_method.replace("_", " ").toUpperCase()} • {rep.payment_date}
                      </span>
                      {rep.notes && <span className="text-[10px] text-muted-foreground">{rep.notes}</span>}
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                      Success
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
