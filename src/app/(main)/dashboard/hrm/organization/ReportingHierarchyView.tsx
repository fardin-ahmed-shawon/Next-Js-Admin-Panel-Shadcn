"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  Search,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  List,
  Crown,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Maximize2,
  Minimize2,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department } from "@/hooks/useHrm";

interface EmployeeItem {
  id: number; // user_id
  employee_record_id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  department_id: number;
  designation: string;
  designation_id: number;
  grade?: string;
  reports_to_id?: number | null;
  manager_name?: string;
  employment_type?: string;
  basic_salary?: number;
  gross_salary?: number;
  joining_date?: string;
  status?: string;
}

interface ReportingHierarchyViewProps {
  employees: EmployeeItem[];
  allDepartments: Department[];
}

interface TreeNode {
  employee: EmployeeItem;
  children: TreeNode[];
  level: number;
}

export function ReportingHierarchyView({
  employees,
  allDepartments,
}: ReportingHierarchyViewProps) {
  const [viewMode, setViewMode] = React.useState<"general" | "tree">("general");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState<string>("all");
  const [zoom, setZoom] = React.useState(100);
  const [collapsedNodes, setCollapsedNodes] = React.useState<Set<number>>(new Set());
  const [selectedEmp, setSelectedEmp] = React.useState<EmployeeItem | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Filtered employees for list / general view
  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !searchQuery.trim() ||
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.manager_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        deptFilter === "all" || String(emp.department_id) === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, deptFilter]);

  // Build hierarchy tree
  const { rootNodes, managersCount } = React.useMemo(() => {
    const idMap = new Map<number, EmployeeItem>();
    employees.forEach((emp) => idMap.set(emp.id, emp));

    // Map children
    const childrenMap = new Map<number, EmployeeItem[]>();
    employees.forEach((emp) => {
      if (emp.reports_to_id && idMap.has(emp.reports_to_id)) {
        const list = childrenMap.get(emp.reports_to_id) || [];
        list.push(emp);
        childrenMap.set(emp.reports_to_id, list);
      }
    });

    const managers = new Set<number>();
    childrenMap.forEach((children, mgrId) => {
      if (children.length > 0) managers.add(mgrId);
    });

    function buildNode(emp: EmployeeItem, level = 1): TreeNode {
      const childEmps = childrenMap.get(emp.id) || [];
      return {
        employee: emp,
        level,
        children: childEmps.map((c) => buildNode(c, level + 1)),
      };
    }

    // Roots are employees without a manager or whose manager is not in the list
    const roots: TreeNode[] = employees
      .filter((emp) => !emp.reports_to_id || !idMap.has(emp.reports_to_id))
      .map((emp) => buildNode(emp, 1));

    return { rootNodes: roots, managersCount: managers.size };
  }, [employees]);

  // Toggle node collapse in tree
  const toggleCollapse = (nodeId: number) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedNodes(new Set());

  const collapseAll = () => {
    const allParentIds = new Set<number>();
    employees.forEach((emp) => {
      if (employees.some((e) => e.reports_to_id === emp.id)) {
        allParentIds.add(emp.id);
      }
    });
    setCollapsedNodes(allParentIds);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 60), 140));
  };
  const resetZoom = () => setZoom(100);

  // Check if an employee matches search
  const isMatch = (emp: EmployeeItem) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.employee_id?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q)
    );
  };

  // Direct subordinates of selected employee
  const selectedSubordinates = React.useMemo(() => {
    if (!selectedEmp) return [];
    return employees.filter((e) => e.reports_to_id === selectedEmp.id);
  }, [selectedEmp, employees]);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNode) => {
    const { employee: emp, children, level } = node;
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedNodes.has(emp.id);
    const matchesSearch = isMatch(emp);

    // Tier badge
    let tierText = "Tier 3 • Team Staff";
    let tierColor = "bg-muted text-muted-foreground border-border";
    if (level === 1) {
      tierText = "Tier 1 • Top Leadership";
      tierColor = "bg-primary/10 text-primary border-primary/20";
    } else if (hasChildren) {
      tierText = `Tier ${level} • Lead / Supervisor`;
      tierColor = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    }

    return (
      <div key={emp.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => {
            setSelectedEmp(emp);
            setModalOpen(true);
          }}
          className={`cursor-pointer w-64 p-3 rounded-2xl border-2 transition-all duration-200 bg-card hover:bg-muted/30 shadow-2xs hover:shadow-md relative group select-none text-left ${
            matchesSearch
              ? "border-primary ring-2 ring-primary/40 shadow-md"
              : level === 1
              ? "border-primary/50 bg-primary/5"
              : hasChildren
              ? "border-indigo-500/40"
              : "border-border/80"
          }`}
        >
          {/* Top Tier Tag */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tierColor}`}>
              {tierText}
            </span>
            <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0">
              {emp.employee_id}
            </Badge>
          </div>

          {/* Profile Row */}
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20 text-xs">
              {emp.name?.slice(0, 2).toUpperCase() || "EM"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {emp.name}
              </h4>
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                {emp.designation}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{emp.department}</p>
            </div>
          </div>

          {/* Bottom Info & Subordinate Badge */}
          <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground truncate max-w-[120px]">
              {emp.reports_to_id ? (
                <span className="flex items-center gap-1">
                  <UserCheck className="size-2.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Reports to {emp.manager_name?.split(" ")[0]}</span>
                </span>
              ) : (
                <span className="text-primary font-medium">★ Top Level</span>
              )}
            </span>

            {hasChildren && (
              <Badge
                variant="secondary"
                className="text-[9px] font-bold px-1.5 py-0 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              >
                {children.length} {children.length === 1 ? "report" : "reports"}
              </Badge>
            )}
          </div>

          {/* Collapse / Expand Button on Node */}
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(emp.id);
              }}
              title={isCollapsed ? "Expand Direct Reports" : "Collapse Direct Reports"}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 size-6 rounded-full bg-background border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold z-10"
            >
              {isCollapsed ? "+" : "−"}
            </button>
          )}
        </div>

        {/* Tree Branch Connectors & Children */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full mt-3">
            {/* Vertical stem from parent down */}
            <div className="w-0.5 h-6 bg-indigo-400/40" />

            {/* If more than 1 child, render horizontal distribution line */}
            {children.length > 1 ? (
              <div className="relative w-full flex justify-center">
                {/* Horizontal crossbar */}
                <div
                  className="h-0.5 bg-indigo-400/40 absolute top-0"
                  style={{
                    left: `${(1 / (children.length * 2)) * 100}%`,
                    right: `${(1 / (children.length * 2)) * 100}%`,
                  }}
                />
                <div className="flex items-start justify-center gap-6 pt-3">
                  {children.map((childNode) => (
                    <div key={childNode.employee.id} className="flex flex-col items-center">
                      {/* Vertical line from crossbar into child */}
                      <div className="w-0.5 h-3 bg-indigo-400/40 -mt-3 mb-1" />
                      {renderTreeNode(childNode)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2">{renderTreeNode(children[0])}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Switcher & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-card border rounded-2xl p-3.5 px-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Reporting Hierarchy ("কার অধীনে কে কাজ করে")</h2>
              <Badge variant="outline" className="text-[10px] font-medium">
                {employees.length} Employees
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct reporting lines, management supervisors, and subordinate chains.
            </p>
          </div>
        </div>

        {/* View Toggle (General View vs Tree View) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          {/* Segmented View Switcher */}
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border">
            <Button
              variant={viewMode === "general" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("general")}
              className="text-xs h-7 px-3 gap-1.5 rounded-lg shadow-2xs"
            >
              <List className="size-3.5" />
              <span>General View</span>
            </Button>
            <Button
              variant={viewMode === "tree" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tree")}
              className="text-xs h-7 px-3 gap-1.5 rounded-lg shadow-2xs"
            >
              <Network className="size-3.5" />
              <span>Tree View</span>
            </Button>
          </div>

          {/* Department Filter */}
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-36 sm:w-44 text-xs h-8">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Departments</SelectItem>
              {allDepartments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search employee or manager..."
              className="pl-8 h-8 text-xs bg-muted/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: GENERAL VIEW (Current Card List with Polish) */}
      {viewMode === "general" && (
        <Card className="border shadow-xs bg-card">
          <CardHeader className="border-b py-3.5 bg-muted/15">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Employee Reporting Directory
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredEmployees.length} of {employees.length} workforce members
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {managersCount} Supervisors / Leads
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-3">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const subordinates = employees.filter((e) => e.reports_to_id === emp.id);

                return (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setSelectedEmp(emp);
                      setModalOpen(true);
                    }}
                    className="p-4 rounded-xl border bg-muted/15 hover:bg-muted/30 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                  >
                    {/* Employee Profile */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-11 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center border shadow-2xs shrink-0 text-sm group-hover:scale-105 transition-transform">
                        {emp.name?.slice(0, 2).toUpperCase() || "EM"}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {emp.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {emp.employee_id}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300"
                          >
                            {emp.designation}
                          </Badge>
                          {subordinates.length > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                            >
                              {subordinates.length} Subordinates
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="font-medium text-foreground">{emp.department}</span>
                          {emp.email && (
                            <>
                              <span>•</span>
                              <span>{emp.email}</span>
                            </>
                          )}
                          {emp.phone && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{emp.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reporting To Manager Box */}
                    <div className="flex items-center gap-2.5 bg-card p-2.5 px-3.5 rounded-lg border shadow-2xs shrink-0 group-hover:border-primary/30 transition-colors">
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
                );
              })
            ) : (
              <div className="text-center py-12 border border-dashed rounded-xl">
                <Users className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-foreground">No employees match your search</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Try clearing filters or search query.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* VIEW MODE 2: TREE VIEW (Interactive Hierarchical Visual Tree) */}
      {viewMode === "tree" && (
        <Card className="border shadow-xs bg-card/60 backdrop-blur-xs overflow-hidden">
          <CardHeader className="border-b py-3 px-4 bg-muted/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div>
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Network className="size-3.5 text-primary" />
                Interactive Reporting Tree (Manager → Subordinates)
              </CardTitle>
              <CardDescription className="text-[11px]">
                Click any employee card to inspect full profile. Use +/- to expand or fold team branches.
              </CardDescription>
            </div>

            {/* Tree Toolbar Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={expandAll}
                title="Expand all nodes"
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={collapseAll}
                title="Collapse all nodes"
              >
                Collapse All
              </Button>

              <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40 ml-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleZoom(-10)}
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3" />
                </Button>
                <span className="text-[10px] font-mono px-1 font-semibold text-muted-foreground min-w-7 text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleZoom(10)}
                  title="Zoom In"
                >
                  <ZoomIn className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={resetZoom}
                  title="Reset Zoom"
                >
                  <RotateCcw className="size-2.5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-10 overflow-x-auto min-h-[580px] flex flex-col items-center">
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              className="transition-transform duration-200 flex flex-col items-center w-full min-w-[850px]"
            >
              {/* Executive Tier Header */}
              <div className="p-3 px-5 rounded-2xl border bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/10 text-center shadow-2xs mb-2">
                <div className="flex items-center gap-2 justify-center">
                  <Crown className="size-4 text-primary" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    Executive Board & Senior Management
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Top-level leadership tier with direct organizational oversight
                </p>
              </div>

              {/* Vertical connector down from header */}
              <div className="w-0.5 h-6 bg-primary/40" />

              {/* Root Nodes Container */}
              {rootNodes.length > 0 ? (
                <div className="w-full flex flex-col items-center">
                  {rootNodes.length > 1 && (
                    <div className="w-10/12 h-0.5 bg-primary/30 relative">
                      <div className="absolute left-0 -top-1 size-2 rounded-full bg-primary" />
                      <div className="absolute right-0 -top-1 size-2 rounded-full bg-primary" />
                    </div>
                  )}

                  <div className="flex items-start justify-center gap-10 w-full pt-4">
                    {rootNodes.map((root) => (
                      <div key={root.employee.id} className="flex flex-col items-center">
                        {rootNodes.length > 1 && (
                          <div className="w-0.5 h-4 bg-primary/30 -mt-4 mb-2" />
                        )}
                        {renderTreeNode(root)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No employees found to generate tree hierarchy.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* EMPLOYEE QUICK DETAILS MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedEmp && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center border">
                    {selectedEmp.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <DialogTitle className="text-base font-bold">{selectedEmp.name}</DialogTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {selectedEmp.employee_id}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs">
                      {selectedEmp.designation} • {selectedEmp.department}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Contact & Status details */}
              <div className="space-y-2 border rounded-xl p-3 bg-muted/20 text-xs">
                {selectedEmp.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3 text-primary" /> Email
                    </span>
                    <span className="font-semibold text-foreground">{selectedEmp.email}</span>
                  </div>
                )}
                {selectedEmp.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3 text-primary" /> Phone
                    </span>
                    <span className="font-semibold text-foreground font-mono">{selectedEmp.phone}</span>
                  </div>
                )}
                {selectedEmp.joining_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3 text-primary" /> Joining Date
                    </span>
                    <span className="font-semibold text-foreground">{selectedEmp.joining_date}</span>
                  </div>
                )}
                {selectedEmp.employment_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="size-3 text-primary" /> Employment Type
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedEmp.employment_type}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Hierarchy Context */}
              <div className="space-y-2.5 pt-1">
                {/* Reports to */}
                <div className="p-3 rounded-xl border bg-card flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Direct Supervisor (কার অধীনে)
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedEmp.manager_name || "Board / Managing Director"}
                    </span>
                  </div>
                  <UserCheck className="size-4 text-indigo-500" />
                </div>

                {/* Subordinates list */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                    Direct Subordinates ({selectedSubordinates.length})
                  </span>
                  {selectedSubordinates.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedSubordinates.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2 rounded-lg border bg-muted/20 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-[10px] flex items-center justify-center">
                              {sub.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{sub.name}</p>
                              <p className="text-[10px] text-muted-foreground">{sub.designation}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-mono">
                            {sub.employee_id}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-2 rounded-lg bg-muted/20">
                      No direct subordinates report to this employee.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
