"use client";

import { HrmSummary } from "@/components/hrm/hrm-summary";
import hrmStyles from "@/components/hrm/hrm-page.module.css";

import * as React from "react";
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Pencil,
  Building2,
  Briefcase,
  UserCheck,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useHrmEmployees,
  useHrmDepartments,
  useHrmDesignations,
  updateEmployeeProfile,
  HrmEmployee,
} from "@/hooks/useHrm";

export default function EmployeesDirectoryPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [designationFilter, setDesignationFilter] = React.useState("all");
  const [sort, setSort] = React.useState("name_asc");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { employees, loading, refetch } = useHrmEmployees();
  const { departments } = useHrmDepartments();
  const { designations } = useHrmDesignations();

  // Edit employee state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<HrmEmployee | null>(null);
  const [formState, setFormState] = React.useState({
    full_name: "",
    phone: "",
    email: "",
    employee_id: "",
    department_id: "" as string | number,
    designation_id: "" as string | number,
    reports_to_id: "" as string | number,
    joining_date: "",
    employment_type: "Full-time",
    basic_salary: 0,
    house_allowance: 0,
    medical_allowance: 0,
    transport_allowance: 0,
    food_allowance: 0,
    other_allowance: 0,
    blood_group: "",
    emergency_contact: "",
    bank_name: "",
    bank_account_no: "",
    bkash_or_nagad: "",
  });

  const openEditModal = (emp: HrmEmployee) => {
    setSelectedUser(emp);
    const detail = emp.employee_detail;
    setFormState({
      full_name: emp.full_name,
      phone: emp.phone,
      email: emp.email,
      employee_id: detail?.employee_id || `EMP-${String(emp.id).padStart(3, "0")}`,
      department_id: detail?.department_id || "",
      designation_id: detail?.designation_id || "",
      reports_to_id: detail?.reports_to_id || "",
      joining_date: detail?.joining_date || "",
      employment_type: detail?.employment_type || "Full-time",
      basic_salary: detail?.basic_salary || 0,
      house_allowance: detail?.house_allowance || 0,
      medical_allowance: detail?.medical_allowance || 0,
      transport_allowance: detail?.transport_allowance || 0,
      food_allowance: detail?.food_allowance || 0,
      other_allowance: detail?.other_allowance || 0,
      blood_group: detail?.blood_group || "",
      emergency_contact: detail?.emergency_contact || "",
      bank_name: detail?.bank_name || "",
      bank_account_no: detail?.bank_account_no || "",
      bkash_or_nagad: detail?.bkash_or_nagad || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await updateEmployeeProfile(selectedUser.id, {
        ...formState,
        department_id: formState.department_id ? Number(formState.department_id) : null,
        designation_id: formState.designation_id ? Number(formState.designation_id) : null,
        reports_to_id: formState.reports_to_id ? Number(formState.reports_to_id) : null,
        basic_salary: Number(formState.basic_salary || 0),
        house_allowance: Number(formState.house_allowance || 0),
        medical_allowance: Number(formState.medical_allowance || 0),
        transport_allowance: Number(formState.transport_allowance || 0),
        food_allowance: Number(formState.food_allowance || 0),
        other_allowance: Number(formState.other_allowance || 0),
      });
      toast.success("Employee profile & salary configuration updated");
      setEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update employee profile");
    }
  };

  // Filtered employees
  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      if (designationFilter !== "all" && String(emp.employee_detail?.designation_id) !== designationFilter) return false;
      if (departmentFilter !== "all" && String(emp.employee_detail?.department_id) !== departmentFilter) {
        return false;
      }
      if (statusFilter !== "all" && emp.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          emp.full_name?.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q) ||
          emp.phone?.toLowerCase().includes(q) ||
          emp.employee_detail?.employee_id?.toLowerCase().includes(q) ||
          emp.employee_detail?.designation?.title?.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const field = sort.split("_")[0];
      const value = (emp: HrmEmployee) => field === "department" ? emp.employee_detail?.department?.name || "" : field === "designation" ? emp.employee_detail?.designation?.title || "" : emp.full_name || "";
      return value(a).localeCompare(value(b)) * (sort.endsWith("desc") ? -1 : 1) || a.id - b.id;
    });
  }, [employees, departmentFilter, designationFilter, statusFilter, searchQuery, sort]);
  const hasActiveFilters =
    designationFilter !== "all" || sort !== "name_asc" || departmentFilter !== "all" ||
    statusFilter !== "all" ||
    !!searchQuery;

  const handleResetFilters = () => {
    setDepartmentFilter("all"); setDesignationFilter("all"); setSort("name_asc");
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
            <h1 className="text-3xl tracking-tight">Employees Directory</h1>

          </div>
          <p className="text-muted-foreground text-sm">
            Workforce roster, department designations, reporting lines, and compensation profiles.
          </p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl tracking-tight">Employees Directory</h1>

          </div>
          <p className="text-muted-foreground text-sm">
            Workforce roster and employee profile management.
          </p>
        </div>

        {/* Controls: on mobile = full-width row, desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end flex-wrap">
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              aria-label="Refresh employees"
              onClick={() => refetch()}
              disabled={loading}
              title="Refresh employee directory"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <HrmSummary loading={loading} items={[
        { label: "Total Employees", value: employees.length, hint: "Within your access" },
        { label: "Active Employees", value: employees.filter(e => e.status === "active").length, hint: "Currently active" },
        { label: "Departments", value: new Set(employees.map(e => e.employee_detail?.department_id).filter(Boolean)).size, hint: "Represented in your workforce" },
        { label: "Designations", value: new Set(employees.map(e => e.employee_detail?.designation_id).filter(Boolean)).size, hint: "Roles across the workforce" },
      ]} />
      {/* Minimal Search & Filter Toolbar */}
      <div className={hrmStyles.toolbar}>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, phone..."
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

        <Select value={departmentFilter} onValueChange={value => { setDepartmentFilter(value); setDesignationFilter("all"); }}>
          <SelectTrigger className="h-8 text-xs w-[150px] shrink-0">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={designationFilter} onValueChange={setDesignationFilter}>
          <SelectTrigger className="h-8 text-xs w-44" aria-label="Filter designation"><SelectValue placeholder="All Designations" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Designations</SelectItem>{designations.filter(d => departmentFilter === "all" || String(d.department_id) === departmentFilter).map(d => <SelectItem key={d.id} value={String(d.id)}>{d.title}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-8 text-xs w-44" aria-label="Sort employees"><SelectValue /></SelectTrigger>
          <SelectContent>{[["name_asc", "Name: A–Z"], ["name_desc", "Name: Z–A"], ["department_asc", "Department: A–Z"], ["department_desc", "Department: Z–A"], ["designation_asc", "Designation: A–Z"], ["designation_desc", "Designation: Z–A"]].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs w-[120px] shrink-0">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
        <CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Employee Directory</CardTitle><CardDescription className="text-xl text-foreground tabular-nums">{filteredEmployees.length} of {employees.length} employees</CardDescription></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">EMP ID</th>
                  <th className="py-3 px-4 text-left">Employee Name</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">Designation</th>
                  <th className="py-3 px-4 text-left">Reports To (কার অধীনে)</th>
                  <th className="py-3 px-4 text-left">Basic Salary</th>
                  <th className="py-3 px-4 text-left">Gross Salary</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (<tr><td colSpan={9} className="p-6"><div role="status" aria-label="Loading employees" className="space-y-3">{[1,2,3,4].map(row => <div key={row} className="h-10 animate-pulse rounded bg-muted" />)}</div></td></tr>) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-muted p-3">
                          <Users className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium text-foreground">No employees found</p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {hasActiveFilters
                            ? "No employee records match your selected filter criteria."
                            : "No employees registered yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const detail = emp.employee_detail;
                    return (
                      <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {detail?.employee_id || `EMP-${String(emp.id).padStart(3, "0")}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                              {emp.full_name?.slice(0, 2).toUpperCase() || "EM"}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block">{emp.full_name}</span>
                              <span className="text-[11px] text-muted-foreground">{emp.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {detail?.department?.name || "Unassigned"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {detail?.designation?.title || "Executive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">
                            {detail?.manager?.full_name || "Board / Managing Director"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          ৳{Number(detail?.basic_salary || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{Number(detail?.gross_salary || detail?.basic_salary || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={
                              emp.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 text-[10px]"
                                : "bg-rose-500/10 text-rose-600 text-[10px]"
                            }
                          >
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => openEditModal(emp)}
                          >
                            <Pencil className="size-3" />
                            <span>Edit Profile</span>
                          </Button>
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

      {/* EDIT EMPLOYEE MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle>Configure Employee Profile & Salary</DialogTitle>
              <DialogDescription className="text-xs">
                Set department, designation, reporting manager, and salary breakdown for {selectedUser?.full_name}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="job" className="py-3">
              <TabsList className="bg-muted p-1 rounded-lg">
                <TabsTrigger value="job" className="text-xs">
                  Job & Hierarchy
                </TabsTrigger>
                <TabsTrigger value="salary" className="text-xs">
                  Salary Structure
                </TabsTrigger>
                <TabsTrigger value="personal" className="text-xs">
                  Personal & Bank Info
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Job & Hierarchy */}
              <TabsContent value="job" className="space-y-3.5 pt-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Full Name *</Label>
                    <Input
                      required
                      value={formState.full_name}
                      onChange={(e) => setFormState({ ...formState, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Employee ID Code</Label>
                    <Input
                      placeholder="e.g. EMP-001"
                      value={formState.employee_id}
                      onChange={(e) => setFormState({ ...formState, employee_id: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Department *</Label>
                    <Select
                      value={String(formState.department_id || "")}
                      onValueChange={(val) => setFormState({ ...formState, department_id: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Designation / Job Title *</Label>
                    <Select
                      value={String(formState.designation_id || "")}
                      onValueChange={(val) => setFormState({ ...formState, designation_id: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        {designations
                          .filter(
                            (des) =>
                              !formState.department_id ||
                              String(des.department_id) === String(formState.department_id)
                          )
                          .map((des) => (
                            <SelectItem key={des.id} value={String(des.id)}>
                              {des.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Reporting To (Manager) */}
                <div className="space-y-1">
                  <Label>Reports To (কার অধীনে কাজ করে) *</Label>
                  <Select
                    value={formState.reports_to_id ? String(formState.reports_to_id) : "none"}
                    onValueChange={(val) => setFormState({ ...formState, reports_to_id: val === "none" ? "" : val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select Reporting Manager" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="none">None (Top Level / Board)</SelectItem>
                      {employees
                        .filter((u) => !selectedUser || u.id !== selectedUser.id)
                        .map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.full_name} ({u.employee_detail?.designation?.title || "Staff"})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    This determines who approves leaves, monitors tasks, and appears in the Org Hierarchy Tree.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Joining Date</Label>
                    <Input
                      type="date"
                      value={formState.joining_date}
                      onChange={(e) => setFormState({ ...formState, joining_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Employment Type</Label>
                    <Select
                      value={formState.employment_type}
                      onValueChange={(val) => setFormState({ ...formState, employment_type: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Employment Type" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Salary Structure (Requirement 21) */}
              <TabsContent value="salary" className="space-y-3.5 pt-3 text-xs">
                <div className="p-3 rounded-lg border bg-primary/5 space-y-1">
                  <h4 className="font-bold text-foreground">Formula: Basic Salary + Allowances = Gross Salary</h4>
                  <p className="text-[11px] text-muted-foreground">
                    This structure is automatically used during Monthly Payroll Generation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Basic Salary (৳) *</Label>
                    <Input
                      type="number"
                      required
                      min={0}
                      value={formState.basic_salary}
                      onChange={(e) =>
                        setFormState({ ...formState, basic_salary: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>House Rent Allowance (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formState.house_allowance}
                      onChange={(e) =>
                        setFormState({ ...formState, house_allowance: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Medical Allowance (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formState.medical_allowance}
                      onChange={(e) =>
                        setFormState({ ...formState, medical_allowance: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Transport Allowance (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formState.transport_allowance}
                      onChange={(e) =>
                        setFormState({ ...formState, transport_allowance: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Food / Other (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formState.food_allowance}
                      onChange={(e) =>
                        setFormState({ ...formState, food_allowance: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between font-bold">
                  <span>Computed Gross Monthly Salary:</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
                    ৳
                    {(
                      Number(formState.basic_salary || 0) +
                      Number(formState.house_allowance || 0) +
                      Number(formState.medical_allowance || 0) +
                      Number(formState.transport_allowance || 0) +
                      Number(formState.food_allowance || 0) +
                      Number(formState.other_allowance || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </TabsContent>

              {/* Tab 3: Personal & Bank Info */}
              <TabsContent value="personal" className="space-y-3.5 pt-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Blood Group</Label>
                    <Input
                      placeholder="e.g. A+, B+, O+, AB+"
                      value={formState.blood_group}
                      onChange={(e) => setFormState({ ...formState, blood_group: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Emergency Contact Number</Label>
                    <Input
                      placeholder="e.g. 01700000000"
                      value={formState.emergency_contact}
                      onChange={(e) =>
                        setFormState({ ...formState, emergency_contact: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="e.g. Dutch-Bangla Bank"
                      value={formState.bank_name}
                      onChange={(e) => setFormState({ ...formState, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Bank Account Number</Label>
                    <Input
                      placeholder="Account number..."
                      value={formState.bank_account_no}
                      onChange={(e) =>
                        setFormState({ ...formState, bank_account_no: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>bKash / Nagad Number (for mobile payroll)</Label>
                  <Input
                    placeholder="e.g. 01800000000"
                    value={formState.bkash_or_nagad}
                    onChange={(e) => setFormState({ ...formState, bkash_or_nagad: e.target.value })}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Employee Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
