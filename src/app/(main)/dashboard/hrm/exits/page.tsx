"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserMinus,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  FileCheck2,
  User,
  Building,
  Edit,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  useHrmExits,
  useHrmEmployees,
  createExitRecord,
  updateExitRecord,
  ExitRecord,
} from "@/hooks/useHrm";
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

export default function ResignationExitManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExit, setSelectedExit] = useState<ExitRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Create
  const [formUserId, setFormUserId] = useState("");
  const [formType, setFormType] = useState<string>("resignation");
  const [formNoticeDate, setFormNoticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [formExitDate, setFormExitDate] = useState("");
  const [formNoticeDays, setFormNoticeDays] = useState(30);
  const [formReason, setFormReason] = useState("");
  const [formAssetDetails, setFormAssetDetails] = useState("Laptop, Official ID card, Access Key");
  const [formPendingSalary, setFormPendingSalary] = useState(0);
  const [formAdvanceAdjustment, setFormAdvanceAdjustment] = useState(0);
  const [formGratuity, setFormGratuity] = useState(0);

  // Edit State
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [editAssetStatus, setEditAssetStatus] = useState<string>("pending");
  const [editPendingSalary, setEditPendingSalary] = useState(0);
  const [editAdvanceAdjustment, setEditAdvanceAdjustment] = useState(0);
  const [editGratuity, setEditGratuity] = useState(0);
  const [editSettlementStatus, setEditSettlementStatus] = useState<string>("unpaid");
  const [editFeedback, setEditFeedback] = useState("");

  const { exits, loading, refetch } = useHrmExits();
  const { employees } = useHrmEmployees();

  const handleOpenEdit = (exit: ExitRecord) => {
    setSelectedExit(exit);
    setEditStatus(exit.status);
    setEditAssetStatus(exit.asset_return_status);
    setEditPendingSalary(exit.pending_salary);
    setEditAdvanceAdjustment(exit.advance_adjustment);
    setEditGratuity(exit.gratuity_or_bonus);
    setEditSettlementStatus(exit.settlement_status);
    setEditFeedback(exit.feedback || "");
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setIsSubmitting(true);
      await createExitRecord({
        user_id: Number(formUserId),
        type: formType,
        notice_date: formNoticeDate,
        exit_date: formExitDate || null,
        notice_period_days: Number(formNoticeDays),
        reason: formReason,
        asset_details: formAssetDetails,
        pending_salary: Number(formPendingSalary),
        advance_adjustment: Number(formAdvanceAdjustment),
        gratuity_or_bonus: Number(formGratuity),
      });

      toast.success("Exit / Resignation request logged successfully!");
      setIsCreateOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create exit record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExit) return;

    try {
      setIsSubmitting(true);
      await updateExitRecord(selectedExit.id, {
        status: editStatus,
        asset_return_status: editAssetStatus,
        pending_salary: Number(editPendingSalary),
        advance_adjustment: Number(editAdvanceAdjustment),
        gratuity_or_bonus: Number(editGratuity),
        settlement_status: editSettlementStatus,
        feedback: editFeedback,
      });

      toast.success("Exit & Settlement records updated successfully!");
      setIsEditOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExits = exits.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.user?.full_name?.toLowerCase().includes(q);
    const reasonMatch = item.reason?.toLowerCase().includes(q);
    const matchesSearch = !searchQuery || nameMatch || reasonMatch;

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalExits = exits.length;
  const pendingSettlementCount = exits.filter((e) => e.settlement_status === "unpaid").length;
  const pendingAssetCount = exits.filter((e) => e.asset_return_status !== "returned").length;
  const totalSettlementDue = exits
    .filter((e) => e.settlement_status === "unpaid")
    .reduce((sum, e) => sum + Number(e.final_settlement_amount), 0);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "resignation":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Resignation</Badge>;
      case "termination":
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">Termination</Badge>;
      case "contract_end":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Contract End</Badge>;
      case "retirement":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Retirement</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <FileCheck2 className="h-3 w-3" /> Exit Completed
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAssetBadge = (status: string) => {
    switch (status) {
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> All Assets Returned
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Clock className="h-3.5 w-3.5" /> Partial Return
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
            <AlertCircle className="h-3.5 w-3.5" /> Pending Return
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/hrm"
              className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> HRM Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Resignation & Termination Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete employee offboarding: Resignation requests, notice periods, asset recovery, and final settlement calculation
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> New Exit Record
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Exits Logged</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{totalExits}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Resignations, terminations & retirements</CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Pending Asset Returns</CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-600">{pendingAssetCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Equipment & company property awaiting handoff</CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Unsettled Dues Count</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">{pendingSettlementCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Offboardings pending final clearance</CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Settlement Due</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">৳ {totalSettlementDue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Net payable after advance deductions</CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exit record by employee name, reason..."
            className="pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Exit Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="resignation">Resignation</SelectItem>
              <SelectItem value="termination">Termination</SelectItem>
              <SelectItem value="contract_end">Contract End</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold">Offboarding Records & Settlement Clearance</CardTitle>
          <CardDescription className="text-xs">
            Review notice period schedules, asset return verification, and final financial clearance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
              Loading offboarding logs...
            </div>
          ) : filteredExits.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
              <UserMinus className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No exit records found</p>
              <p className="text-xs">All employees are currently in active service with no pending exits.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Timeline & Notice</th>
                    <th className="px-4 py-3">Asset Recovery</th>
                    <th className="px-4 py-3">Final Settlement</th>
                    <th className="px-4 py-3">Clearance Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredExits.map((item) => {
                    const netSettlement = Number(item.final_settlement_amount);
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {item.user?.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{item.user?.full_name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {item.user?.employee_detail?.department?.name || "General"} •{" "}
                                {item.user?.employee_detail?.designation?.title || item.user?.employee_detail?.designation?.name || "Staff"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getTypeBadge(item.type)}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" /> Notice: {item.notice_date || "N/A"}
                            </div>
                            <div className="font-medium text-foreground">
                              Exit Date: {item.exit_date || "Pending"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Period: {item.notice_period_days} days
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {getAssetBadge(item.asset_return_status)}
                            {item.asset_details && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                                {item.asset_details}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <div className="font-bold text-foreground">
                              ৳ {netSettlement.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Salary: ৳{Number(item.pending_salary).toLocaleString()} - Adv: ৳
                              {Number(item.advance_adjustment).toLocaleString()}
                            </div>
                            {item.settlement_status === "settled" ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                                Settled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-700 bg-amber-50 text-[10px]">
                                Unpaid Settlement
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Settle & Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Exit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-primary" /> Create Exit / Resignation Record
              </DialogTitle>
              <DialogDescription>
                Initiate employee offboarding, notice period tracking, and initial settlement calculation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="exit-emp" className="text-xs font-semibold">
                  Employee <span className="text-destructive">*</span>
                </Label>
                <Select value={formUserId} onValueChange={setFormUserId} required>
                  <SelectTrigger id="exit-emp">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.full_name} ({emp.employee_detail?.designation?.title || emp.employee_detail?.designation?.name || "Staff"}) - Basic: ৳
                        {emp.employee_detail?.basic_salary || 0}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="exit-type" className="text-xs font-semibold">
                    Exit Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger id="exit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">Resignation</SelectItem>
                      <SelectItem value="termination">Termination</SelectItem>
                      <SelectItem value="contract_end">Contract End</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exit-notice-days" className="text-xs font-semibold">
                    Notice Period (Days)
                  </Label>
                  <Input
                    id="exit-notice-days"
                    type="number"
                    value={formNoticeDays}
                    onChange={(e) => setFormNoticeDays(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="exit-notice-date" className="text-xs font-semibold">
                    Notice Given Date
                  </Label>
                  <Input
                    id="exit-notice-date"
                    type="date"
                    value={formNoticeDate}
                    onChange={(e) => setFormNoticeDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exit-date" className="text-xs font-semibold">
                    Expected Exit Date
                  </Label>
                  <Input
                    id="exit-date"
                    type="date"
                    value={formExitDate}
                    onChange={(e) => setFormExitDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exit-reason" className="text-xs font-semibold">
                  Reason for Leaving
                </Label>
                <Textarea
                  id="exit-reason"
                  placeholder="e.g. Higher studies, Career progression, Relocation, End of contract..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exit-assets" className="text-xs font-semibold">
                  Company Assets to Return
                </Label>
                <Input
                  id="exit-assets"
                  placeholder="e.g. Laptop, Charger, Company Sim, Keycard, Monitor"
                  value={formAssetDetails}
                  onChange={(e) => setFormAssetDetails(e.target.value)}
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-3 border border-border/40">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary" /> Initial Settlement Estimate
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Pending Salary (৳)</Label>
                    <Input
                      type="number"
                      value={formPendingSalary}
                      onChange={(e) => setFormPendingSalary(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Advance Adj. (-) (৳)</Label>
                    <Input
                      type="number"
                      value={formAdvanceAdjustment}
                      onChange={(e) => setFormAdvanceAdjustment(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Gratuity/Bonus (+) (৳)</Label>
                    <Input
                      type="number"
                      value={formGratuity}
                      onChange={(e) => setFormGratuity(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs font-semibold">
                  <span>Net Estimated Settlement:</span>
                  <span className="text-primary font-bold">
                    ৳ {(Number(formPendingSalary) - Number(formAdvanceAdjustment) + Number(formGratuity)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Exit Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit / Settlement Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" /> Settle & Update Clearance Record
              </DialogTitle>
              <DialogDescription>
                Employee: <strong className="text-foreground">{selectedExit?.user?.full_name}</strong> •{" "}
                {selectedExit?.type.toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Clearance Lifecycle Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed (Archived)</SelectItem>
                      <SelectItem value="rejected">Rejected / Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Asset Return Status</Label>
                  <Select value={editAssetStatus} onValueChange={setEditAssetStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial Return</SelectItem>
                      <SelectItem value="returned">All Assets Cleared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-3 border border-border/40">
                <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary" /> Final Settlement Calculation
                  </span>
                  <Badge variant={editSettlementStatus === "settled" ? "secondary" : "outline"}>
                    {editSettlementStatus.toUpperCase()}
                  </Badge>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Pending Salary (৳)</Label>
                    <Input
                      type="number"
                      value={editPendingSalary}
                      onChange={(e) => setEditPendingSalary(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Advance Adj. (-) (৳)</Label>
                    <Input
                      type="number"
                      value={editAdvanceAdjustment}
                      onChange={(e) => setEditAdvanceAdjustment(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Gratuity/Bonus (+) (৳)</Label>
                    <Input
                      type="number"
                      value={editGratuity}
                      onChange={(e) => setEditGratuity(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-sm font-bold">
                  <span>Net Final Settlement:</span>
                  <span className="text-primary text-base">
                    ৳ {(Number(editPendingSalary) - Number(editAdvanceAdjustment) + Number(editGratuity)).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-semibold">Settlement Payment Status</Label>
                  <Select value={editSettlementStatus} onValueChange={setEditSettlementStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid / In Process</SelectItem>
                      <SelectItem value="settled">Settled & Fully Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Exit Interview & HR Feedback</Label>
                <Textarea
                  placeholder="Record handover notes, exit interview feedback, or settlement remarks..."
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Clearance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
