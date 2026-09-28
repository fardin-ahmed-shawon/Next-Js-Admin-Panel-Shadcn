"use client";

import * as React from "react";
import {
  Building2,
  Users,
  Network,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useHrmOrgTree,
  saveDepartment,
  deleteDepartment,
  saveDesignation,
  deleteDesignation,
  Department,
  Designation,
} from "@/hooks/useHrm";

export default function OrganizationStructurePage() {
  const { orgData, loading, refetch } = useHrmOrgTree();

  const [activeTab, setActiveTab] = React.useState("chart");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Dialog states for Department
  const [deptModalOpen, setDeptModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);
  const [deptForm, setDeptForm] = React.useState({
    name: "",
    code: "",
    parent_id: "" as string | number,
    description: "",
  });

  // Dialog states for Designation
  const [desigModalOpen, setDesigModalOpen] = React.useState(false);
  const [editingDesig, setEditingDesig] = React.useState<Designation | null>(null);
  const [desigForm, setDesigForm] = React.useState({
    department_id: "" as string | number,
    title: "",
    grade: "",
    description: "",
  });

  const employees = orgData?.employees || [];
  const allDepartments: Department[] = orgData?.all_departments || [];
  const allDesignations: Designation[] = orgData?.all_designations || [];

  // Group employees by manager ("কার অধীনে কাজ করে")
  const managerGroups = React.useMemo(() => {
    const groups: { [key: string]: { managerName: string; subordinates: typeof employees } } = {};

    employees.forEach((emp: any) => {
      const mgrKey = emp.reports_to_id ? String(emp.reports_to_id) : "top";
      const mgrName = emp.manager_name || "Board / Executive Level";
      if (!groups[mgrKey]) {
        groups[mgrKey] = { managerName: mgrName, subordinates: [] };
      }
      groups[mgrKey].subordinates.push(emp);
    });

    return groups;
  }, [employees]);

  // Handle department save
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDepartment(
        {
          name: deptForm.name,
          code: deptForm.code || null,
          parent_id: deptForm.parent_id ? Number(deptForm.parent_id) : null,
          description: deptForm.description || null,
        },
        editingDept?.id
      );
      toast.success(editingDept ? "Department updated" : "Department created");
      setDeptModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save department");
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await deleteDepartment(id);
      toast.success("Department deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
    }
  };

  // Handle designation save
  const handleSaveDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigForm.department_id) {
      toast.error("Please select a department");
      return;
    }
    try {
      await saveDesignation(
        {
          department_id: Number(desigForm.department_id),
          title: desigForm.title,
          grade: desigForm.grade || null,
          description: desigForm.description || null,
        },
        editingDesig?.id
      );
      toast.success(editingDesig ? "Designation updated" : "Designation created");
      setDesigModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save designation");
    }
  };

  const handleDeleteDesig = async (id: number) => {
    if (!confirm("Are you sure you want to delete this designation?")) return;
    try {
      await deleteDesignation(id);
      toast.success("Designation deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete designation");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Network className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Organization Structure & Reporting Hierarchy
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Visual company hierarchy (CEO/MD → Management → Marketing / Sales / Accounts), reporting lines, and departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingDept(null);
              setDeptForm({ name: "", code: "", parent_id: "", description: "" });
              setDeptModalOpen(true);
            }}
            className="gap-1.5 shadow-2xs"
          >
            <PlusCircle className="size-4" />
            <span>Add Department</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingDesig(null);
              setDesigForm({
                department_id: allDepartments[0]?.id || "",
                title: "",
                grade: "Executive",
                description: "",
              });
              setDesigModalOpen(true);
            }}
            className="gap-1.5 shadow-xs"
          >
            <PlusCircle className="size-4" />
            <span>Add Designation</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl border">
          <TabsTrigger value="chart" className="gap-2 text-xs font-semibold px-4 py-2">
            <Network className="size-3.5" /> Visual Org Chart
          </TabsTrigger>
          <TabsTrigger value="reporting" className="gap-2 text-xs font-semibold px-4 py-2">
            <UserCheck className="size-3.5" /> Reporting Hierarchy ("কার অধীনে")
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2 text-xs font-semibold px-4 py-2">
            <Building2 className="size-3.5" /> Departments ({allDepartments.length})
          </TabsTrigger>
          <TabsTrigger value="designations" className="gap-2 text-xs font-semibold px-4 py-2">
            <Layers className="size-3.5" /> Designations ({allDesignations.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. VISUAL ORG CHART */}
        <TabsContent value="chart" className="space-y-6">
          <Card className="border shadow-xs bg-card overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Hierarchical Company Tree (CEO → Management → Divisions)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Interactive organizational flow diagram illustrating leadership tiers and subordinate teams
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                    {employees.length} Total Workforce Members
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-x-auto min-w-[750px]">
              {/* LEVEL 1: CEO / MD */}
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 shadow-md max-w-xs w-full text-center relative hover:shadow-lg transition-all">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    Tier 1 • Top Leadership
                  </span>
                  <div className="size-14 rounded-full bg-primary/20 text-primary font-extrabold text-lg flex items-center justify-center mx-auto mb-2 border-2 border-primary/30">
                    CEO
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground">CEO / Managing Director</h3>
                  <p className="text-xs text-primary font-semibold">Executive & Board Leadership</p>
                  <div className="mt-2 pt-2 border-t text-[11px] text-muted-foreground flex justify-center items-center gap-1.5">
                    <ShieldCheck className="size-3 text-emerald-600 inline" />
                    <span>Company Strategic Head</span>
                  </div>
                </div>

                {/* Connector Down */}
                <div className="w-0.5 h-10 bg-primary/40 my-1" />

                {/* LEVEL 2: General Management */}
                <div className="p-3.5 rounded-xl border-2 border-indigo-500/40 bg-indigo-500/5 shadow-xs max-w-sm w-full text-center relative hover:shadow-md transition-all">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] uppercase font-bold px-2 py-0.2 rounded-full">
                    Tier 2 • Management
                  </span>
                  <h4 className="font-bold text-sm text-foreground">General Management</h4>
                  <p className="text-xs text-indigo-600 font-medium">Operations & Strategic Alignment</p>
                  <p className="text-[11px] text-muted-foreground mt-1">General Manager & Operations Lead</p>
                </div>

                {/* Connector Down with Horizontal Cross-Branch */}
                <div className="w-0.5 h-10 bg-border my-1" />
                <div className="w-4/5 h-0.5 bg-border relative">
                  <div className="absolute left-0 -top-1 size-2 rounded-full bg-border" />
                  <div className="absolute left-1/3 -top-1 size-2 rounded-full bg-border" />
                  <div className="absolute left-2/3 -top-1 size-2 rounded-full bg-border" />
                  <div className="absolute right-0 -top-1 size-2 rounded-full bg-border" />
                </div>

                {/* LEVEL 3: Functional Departments (Marketing, Sales, Accounts, IT) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mt-4">
                  {/* Branch 1: Marketing */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-border -mt-4 mb-2" />
                    <Card className="w-full border-t-4 border-t-purple-500 shadow-2xs">
                      <CardHeader className="p-3 pb-2 text-center bg-purple-500/5">
                        <Badge variant="outline" className="w-fit mx-auto text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
                          MKT Dept
                        </Badge>
                        <CardTitle className="text-xs font-bold mt-1 text-foreground">
                          Marketing Department
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-purple-500" /> Digital Marketer
                          </p>
                          <p className="text-[11px] text-muted-foreground">Ads, campaigns & SEO</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-purple-500" /> Graphic Designer
                          </p>
                          <p className="text-[11px] text-muted-foreground">Creative branding & UI</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-purple-500" /> Video Editor
                          </p>
                          <p className="text-[11px] text-muted-foreground">Reels, ads & media</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Branch 2: Sales & Support */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-border -mt-4 mb-2" />
                    <Card className="w-full border-t-4 border-t-blue-500 shadow-2xs">
                      <CardHeader className="p-3 pb-2 text-center bg-blue-500/5">
                        <Badge variant="outline" className="w-fit mx-auto text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                          SLS Dept
                        </Badge>
                        <CardTitle className="text-xs font-bold mt-1 text-foreground">
                          Sales Department
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-blue-500" /> Sales Executive
                          </p>
                          <p className="text-[11px] text-muted-foreground">Lead closing & order management</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-blue-500" /> Customer Support
                          </p>
                          <p className="text-[11px] text-muted-foreground">CRM & parcel dispatch care</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Branch 3: Accounts */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-border -mt-4 mb-2" />
                    <Card className="w-full border-t-4 border-t-emerald-500 shadow-2xs">
                      <CardHeader className="p-3 pb-2 text-center bg-emerald-500/5">
                        <Badge variant="outline" className="w-fit mx-auto text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                          ACC Dept
                        </Badge>
                        <CardTitle className="text-xs font-bold mt-1 text-foreground">
                          Accounts & Finance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" /> Accountant
                          </p>
                          <p className="text-[11px] text-muted-foreground">General ledger & reconciliations</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" /> Payroll Officer
                          </p>
                          <p className="text-[11px] text-muted-foreground">Salary, loans & tax calculations</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Branch 4: IT & Tech */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-border -mt-4 mb-2" />
                    <Card className="w-full border-t-4 border-t-amber-500 shadow-2xs">
                      <CardHeader className="p-3 pb-2 text-center bg-amber-500/5">
                        <Badge variant="outline" className="w-fit mx-auto text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                          IT Dept
                        </Badge>
                        <CardTitle className="text-xs font-bold mt-1 text-foreground">
                          IT & Software
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-amber-500" /> Tech Lead
                          </p>
                          <p className="text-[11px] text-muted-foreground">Platform architecture & cloud</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-amber-500" /> Developers
                          </p>
                          <p className="text-[11px] text-muted-foreground">Web, API & automation features</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. REPORTING HIERARCHY ("কার অধীনে কাজ করে") */}
        <TabsContent value="reporting" className="space-y-4">
          <Card className="border shadow-xs bg-card">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Employee Reporting Lines ("কার অধীনে কে কাজ করে")
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Direct mapping showing which manager oversees which subordinates
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search employee or manager..."
                    className="pl-8 h-8 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {employees
                .filter((emp: any) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    emp.name?.toLowerCase().includes(q) ||
                    emp.department?.toLowerCase().includes(q) ||
                    emp.designation?.toLowerCase().includes(q) ||
                    emp.manager_name?.toLowerCase().includes(q)
                  );
                })
                .map((emp: any) => (
                  <div
                    key={emp.id}
                    className="p-4 rounded-xl border bg-muted/15 hover:bg-muted/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    {/* Employee Profile */}
                    <div className="flex items-center gap-3.5">
                      <div className="size-11 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center border shadow-2xs shrink-0 text-sm">
                        {emp.name?.slice(0, 2).toUpperCase() || "EM"}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{emp.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {emp.employee_id}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300">
                            {emp.designation}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{emp.department}</span>
                          <span>•</span>
                          <span>{emp.email}</span>
                          <span>•</span>
                          <span className="font-mono">{emp.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reporting To Manager Box */}
                    <div className="flex items-center gap-2.5 bg-card p-2.5 px-3.5 rounded-lg border shadow-2xs shrink-0">
                      <div className="size-7 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <UserCheck className="size-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Reports To (কার অধীনে)
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {emp.manager_name || "Board / Managing Director"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. DEPARTMENTS LIST */}
        <TabsContent value="departments" className="space-y-4">
          <Card className="border shadow-xs bg-card">
            <CardHeader className="border-b flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Departments Directory
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure corporate divisions, code prefixes, and team heads
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4 text-left">Code</th>
                      <th className="py-3 px-4 text-left">Department Name</th>
                      <th className="py-3 px-4 text-left">Parent Division</th>
                      <th className="py-3 px-4 text-left">Designations</th>
                      <th className="py-3 px-4 text-left">Members</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allDepartments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {dept.code || "—"}
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">{dept.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {dept.parent_id
                            ? allDepartments.find((d) => d.id === dept.parent_id)?.name || "Parent Dept"
                            : "Top Level"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-semibold">
                          {dept.designations?.length || 0} designations
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[11px] font-bold">
                            {dept.employees_count || 0} members
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={
                              dept.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {dept.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0"
                              onClick={() => {
                                setEditingDept(dept);
                                setDeptForm({
                                  name: dept.name,
                                  code: dept.code || "",
                                  parent_id: dept.parent_id || "",
                                  description: dept.description || "",
                                });
                                setDeptModalOpen(true);
                              }}
                            >
                              <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0 text-rose-500 hover:text-rose-600"
                              onClick={() => handleDeleteDept(dept.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. DESIGNATIONS LIST */}
        <TabsContent value="designations" className="space-y-4">
          <Card className="border shadow-xs bg-card">
            <CardHeader className="border-b flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Job Designations & Roles
                </CardTitle>
                <CardDescription className="text-xs">
                  Official job titles, rank levels, and assigned departments
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4 text-left">Designation Title</th>
                      <th className="py-3 px-4 text-left">Department</th>
                      <th className="py-3 px-4 text-left">Grade / Level</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allDesignations.map((desig) => (
                      <tr key={desig.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{desig.title}</td>
                        <td className="py-3 px-4 font-medium text-muted-foreground">
                          {desig.department?.name || "Department"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px]">
                            {desig.grade || "General"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={
                              desig.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {desig.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0"
                              onClick={() => {
                                setEditingDesig(desig);
                                setDesigForm({
                                  department_id: desig.department_id,
                                  title: desig.title,
                                  grade: desig.grade || "",
                                  description: desig.description || "",
                                });
                                setDesigModalOpen(true);
                              }}
                            >
                              <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0 text-rose-500 hover:text-rose-600"
                              onClick={() => handleDeleteDesig(desig.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DEPARTMENT DIALOG */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveDept}>
            <DialogHeader>
              <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
              <DialogDescription className="text-xs">
                Enter company division title, code, and parent level
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label>Department Name *</Label>
                <Input
                  required
                  placeholder="e.g. Marketing Department"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Department Code</Label>
                <Input
                  placeholder="e.g. MKT"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Parent Division</Label>
                <Select
                  value={deptForm.parent_id ? String(deptForm.parent_id) : "none"}
                  onValueChange={(val) => setDeptForm({ ...deptForm, parent_id: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {allDepartments
                      .filter((d) => !editingDept || d.id !== editingDept.id)
                      .map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name} ({d.code || "DEPT"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  placeholder="Responsibilities and purpose..."
                  className="text-xs"
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setDeptModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DESIGNATION DIALOG */}
      <Dialog open={desigModalOpen} onOpenChange={setDesigModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveDesig}>
            <DialogHeader>
              <DialogTitle>{editingDesig ? "Edit Designation" : "Add Designation"}</DialogTitle>
              <DialogDescription className="text-xs">
                Create new job title and attach to specific department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label>Department *</Label>
                <Select
                  value={String(desigForm.department_id || "")}
                  onValueChange={(val) => setDesigForm({ ...desigForm, department_id: val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {allDepartments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Job Title / Designation *</Label>
                <Input
                  required
                  placeholder="e.g. Digital Marketer, Video Editor"
                  value={desigForm.title}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Grade / Level</Label>
                <Input
                  placeholder="e.g. Executive, Senior, Lead, C-Level"
                  value={desigForm.grade}
                  onChange={(e) => setDesigForm({ ...desigForm, grade: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  placeholder="Role description..."
                  className="text-xs"
                  rows={2}
                  value={desigForm.description}
                  onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setDesigModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Designation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
