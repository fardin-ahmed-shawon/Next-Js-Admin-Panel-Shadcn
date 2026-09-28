"use client";

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
    });
  }, [employees, departmentFilter, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Employees Directory & Profiles
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            System users mapped as employees with department designations, salary structure, and reporting lines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold">
            {employees.length} Total Registered Users
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border shadow-xs bg-card">
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, ID, email, phone, role..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="h-9 text-xs w-[170px]">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      No employee records found.
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
