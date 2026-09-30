"use client";

import * as React from "react";
import {
  Building2,
  Users,
  Network,
  PlusCircle,
  Pencil,
  Trash2,
  UserCheck,
  Layers,
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

import { CompanyOrgTree } from "./CompanyOrgTree";
import { ReportingHierarchyView } from "./ReportingHierarchyView";

export default function OrganizationStructurePage() {
  const { orgData, loading, refetch } = useHrmOrgTree();

  const [activeTab, setActiveTab] = React.useState("chart");

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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Organization Structure & Reporting Hierarchy
          </h1>
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

        {/* 1. VISUAL ORG CHART (DYNAMIC HIERARCHICAL COMPANY TREE) */}
        <TabsContent value="chart" className="space-y-6">
          <CompanyOrgTree
            departments={orgData?.department_tree || []}
            allDepartments={allDepartments}
            allDesignations={allDesignations}
            employees={employees}
            companyName={orgData?.company?.name || "Zymerce"}
            onAddDepartment={() => {
              setEditingDept(null);
              setDeptForm({ name: "", code: "", parent_id: "", description: "" });
              setDeptModalOpen(true);
            }}
            onAddDesignation={(departmentId) => {
              setEditingDesig(null);
              setDesigForm({
                department_id: departmentId || allDepartments[0]?.id || "",
                title: "",
                grade: "Executive",
                description: "",
              });
              setDesigModalOpen(true);
            }}
            onEditDepartment={(dept) => {
              setEditingDept(dept);
              setDeptForm({
                name: dept.name,
                code: dept.code || "",
                parent_id: dept.parent_id || "",
                description: dept.description || "",
              });
              setDeptModalOpen(true);
            }}
          />
        </TabsContent>

        {/* 2. REPORTING HIERARCHY (GENERAL VIEW & TREE VIEW) */}
        <TabsContent value="reporting" className="space-y-4">
          <ReportingHierarchyView
            employees={employees}
            allDepartments={allDepartments}
          />
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
