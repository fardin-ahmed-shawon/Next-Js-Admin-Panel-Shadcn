"use client";

import * as React from "react";
import {
  Building2,
  PlusCircle,
  Pencil,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  FolderTree,
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
import { Department, Designation } from "@/hooks/useHrm";

interface CompanyOrgTreeProps {
  departments: Department[];
  allDepartments: Department[];
  allDesignations: Designation[];
  employees: any[];
  companyName?: string;
  onAddDepartment: () => void;
  onAddDesignation: (departmentId?: number) => void;
  onEditDepartment: (dept: Department) => void;
}

// Preset color themes for child departments
const DEPT_COLORS = [
  { border: "border-purple-500", text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", bar: "bg-purple-500" },
  { border: "border-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", bar: "bg-blue-500" },
  { border: "border-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
  { border: "border-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", bar: "bg-amber-500" },
  { border: "border-rose-500", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", bar: "bg-rose-500" },
  { border: "border-cyan-500", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10", bar: "bg-cyan-500" },
  { border: "border-indigo-500", text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10", bar: "bg-indigo-500" },
];

function getDeptColor(id: number, name: string) {
  let hash = 0;
  const str = `${id}-${name}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEPT_COLORS.length;
  return DEPT_COLORS[index];
}

export function CompanyOrgTree({
  departments,
  allDepartments,
  allDesignations,
  employees,
  companyName = "Zymerce",
  onAddDepartment,
  onAddDesignation,
  onEditDepartment,
}: CompanyOrgTreeProps) {
  const [zoom, setZoom] = React.useState(100);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

  // Group departments into parent (no parent_id) and child departments
  const { rootDepartments, childrenByParent } = React.useMemo(() => {
    const deptMap = new Map<number, Department>();
    allDepartments.forEach((d) => deptMap.set(d.id, d));

    const childrenMap = new Map<number, Department[]>();
    allDepartments.forEach((d) => {
      if (d.parent_id && deptMap.has(d.parent_id)) {
        const list = childrenMap.get(d.parent_id) || [];
        list.push(d);
        childrenMap.set(d.parent_id, list);
      }
    });

    const roots = allDepartments.filter((d) => !d.parent_id || !deptMap.has(d.parent_id));

    return { rootDepartments: roots, childrenByParent: childrenMap };
  }, [allDepartments]);

  // Helper to get designations belonging to a department
  const getDeptDesignations = (dept: Department): Designation[] => {
    if (dept.designations && dept.designations.length > 0) {
      return dept.designations;
    }
    return allDesignations.filter((d) => d.department_id === dept.id);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 60), 140));
  };
  const resetZoom = () => setZoom(100);

  // Check if department matches search
  const isDeptMatch = (dept: Department) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = dept.name.toLowerCase().includes(q);
    const codeMatch = dept.code?.toLowerCase().includes(q);
    const desigs = getDeptDesignations(dept);
    const desigMatch = desigs.some((d) => d.title.toLowerCase().includes(q));
    return nameMatch || codeMatch || desigMatch;
  };

  // Render child department card
  const renderChildDepartment = (dept: Department) => {
    const theme = getDeptColor(dept.id, dept.name);
    const desigs = getDeptDesignations(dept);
    const subDepts = childrenByParent.get(dept.id) || [];
    const matchesSearch = isDeptMatch(dept);

    return (
      <div
        key={dept.id}
        className={`flex flex-col items-center transition-all ${
          matchesSearch ? "opacity-100" : "opacity-40 grayscale"
        }`}
      >
        {/* Vertical branch stem connecting from horizontal bar */}
        <div className="w-0.5 h-4 bg-border -mt-4 mb-2" />

        <Card
          className={`w-full border-t-4 ${theme.border} shadow-2xs hover:shadow-md transition-all group overflow-hidden bg-card`}
        >
          <CardHeader className="p-3.5 pb-2.5 border-b bg-muted/15">
            <div className="flex items-center justify-between gap-1.5">
              <Badge
                variant="outline"
                className={`text-[10px] font-mono font-bold ${theme.bg} ${theme.text} border-current/20`}
              >
                {dept.code || `DEPT-${dept.id}`}
              </Badge>

              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {desigs.length} {desigs.length === 1 ? "Role" : "Roles"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                  onClick={() => onEditDepartment(dept)}
                  title="Edit Department"
                >
                  <Pencil className="size-3" />
                </Button>
              </div>
            </div>

            <CardTitle className="text-xs font-bold mt-1 text-foreground leading-snug">
              {dept.name}
            </CardTitle>
            {dept.description && (
              <CardDescription className="text-[10px] line-clamp-1 mt-0.5">
                {dept.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-3.5 space-y-3">
            {/* DESIGNATIONS ONLY - NO EMPLOYEES */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Layers className="size-3" /> Roles / Designations ({desigs.length})
                </span>
                <button
                  type="button"
                  onClick={() => onAddDesignation(dept.id)}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  <PlusCircle className="size-2.5" /> Add
                </button>
              </div>

              {desigs.length > 0 ? (
                <div className="space-y-1.5">
                  {desigs.map((desig) => (
                    <div
                      key={desig.id}
                      className="p-2 rounded-lg bg-muted/30 border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`size-1.5 rounded-full shrink-0 ${theme.bar}`} />
                        <span className="font-semibold text-foreground truncate">{desig.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-medium shrink-0 ml-1.5">
                        {desig.grade || "Executive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed text-center text-[10px] text-muted-foreground italic bg-muted/10">
                  No designations added yet
                </div>
              )}
            </div>

            {/* Nested Sub-Departments if any */}
            {subDepts.length > 0 && (
              <div className="pt-2 border-t">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Sub-Units ({subDepts.length})
                </span>
                <div className="space-y-1">
                  {subDepts.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-1 px-2 rounded bg-muted/40 border flex items-center justify-between text-[10px]"
                    >
                      <span className="font-semibold text-foreground">{sub.name}</span>
                      <Badge variant="outline" className="text-[9px]">
                        {sub.code || "SUB"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card Footer Actions */}
            <div className="pt-2 border-t flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setSelectedDept(dept);
                  setDetailsModalOpen(true);
                }}
                className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="size-3" />
                <span>Inspect</span>
              </button>

              <button
                type="button"
                onClick={() => onAddDesignation(dept.id)}
                className="text-primary hover:text-primary/80 font-bold flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="size-3" />
                <span>Add Role</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border rounded-2xl p-3.5 px-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Dynamic Company Architecture</h2>
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                Live Data
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {allDepartments.length} Departments • {allDesignations.length} Designations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tree..."
              className="pl-8 h-8 text-xs bg-muted/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40">
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => handleZoom(-10)}
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="text-[11px] font-mono px-1 font-semibold text-muted-foreground min-w-8 text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => handleZoom(10)}
              title="Zoom In"
            >
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={resetZoom}
              title="Reset Zoom"
            >
              <RotateCcw className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Interactive Tree Container */}
      <Card className="border shadow-xs bg-card/60 backdrop-blur-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[580px] p-6 sm:p-10 flex flex-col items-center select-none">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 flex flex-col items-center w-full min-w-[900px]"
          >
            {/* ============================================================== */}
            {/* LEVEL 0: ENTERPRISE ROOT (Exact UI matched to screenshot) */}
            {/* ============================================================== */}
            <div className="relative group">
              <div className="p-4 rounded-2xl border-2 border-primary bg-card shadow-md max-w-xs w-full text-center relative hover:shadow-lg transition-all">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] uppercase font-black px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1 whitespace-nowrap">
                  ★ TIER 0 • ENTERPRISE ROOT
                </span>
                <div className="size-14 rounded-full bg-black text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-2 border-2 border-primary/30">
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-base text-foreground tracking-tight">{companyName}</h3>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  Corporate Structure & Governance
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-border/80 text-[11px] text-muted-foreground flex justify-center items-center gap-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Building2 className="size-3 text-primary" /> {allDepartments.length} Departments
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="size-3 text-indigo-500" /> {allDesignations.length} Designations
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Connector Down to Level 1 */}
            <div className="w-0.5 h-10 bg-primary/40 my-1" />

            {/* ============================================================== */}
            {/* LEVEL 1: PARENT DEPARTMENT (No parent_id - e.g. Management) */}
            {/* ============================================================== */}
            {rootDepartments.map((rootDept) => {
              const rootDesigs = getDeptDesignations(rootDept);
              const childDepts = childrenByParent.get(rootDept.id) || [];

              return (
                <div key={rootDept.id} className="w-full flex flex-col items-center">
                  {/* Parent Department Card */}
                  <div className="w-full max-w-4xl p-5 rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-500/5 via-card to-background shadow-xs text-center relative hover:shadow-md transition-all">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] uppercase font-extrabold px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1 whitespace-nowrap">
                      <ShieldCheck className="size-3" /> TIER 1 • EXECUTIVE LEADERSHIP & MANAGEMENT
                    </span>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
                      <div className="text-left">
                        <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                          {rootDept.name}
                          {rootDept.code && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono border-indigo-500/30 text-indigo-600"
                            >
                              {rootDept.code}
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {rootDept.description || "Operations, Strategic Growth & Core Governance"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddDesignation(rootDept.id)}
                          className="text-xs h-7 gap-1"
                        >
                          <PlusCircle className="size-3" /> Add Designation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 gap-1 border-indigo-500/30 hover:bg-indigo-500/10"
                          onClick={() => {
                            setSelectedDept(rootDept);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <Layers className="size-3" />
                          <span>View Division</span>
                        </Button>
                      </div>
                    </div>

                    {/* DESIGNATIONS GRID (EXACT SAME CARD UI, NO EMPLOYEES!) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3.5">
                      {rootDesigs.length > 0 ? (
                        rootDesigs.map((desig) => (
                          <div
                            key={desig.id}
                            className="p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3 text-left shadow-2xs group/card"
                          >
                            <div className="size-9 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-500/30 group-hover/card:bg-indigo-500 group-hover/card:text-white transition-colors">
                              <Briefcase className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate">{desig.title}</p>
                              <Badge
                                variant="secondary"
                                className="text-[9px] mt-0.5 px-1.5 py-0 font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                              >
                                {desig.grade || "Executive"}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
                          No designations configured in this department yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vertical Connector Down to Child Divisions */}
                  {childDepts.length > 0 && (
                    <>
                      <div className="w-0.5 h-10 bg-border my-1" />

                      {/* Horizontal Cross-Branching Bar */}
                      <div className="w-11/12 h-0.5 bg-border relative">
                        <div className="absolute left-0 -top-1 size-2 rounded-full bg-border" />
                        <div className="absolute right-0 -top-1 size-2 rounded-full bg-border" />
                      </div>

                      {/* ============================================================== */}
                      {/* LEVEL 2: FUNCTIONAL CHILD DEPARTMENTS (DESIGNATIONS ONLY) */}
                      {/* ============================================================== */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 w-full mt-4 items-start">
                        {childDepts.map((child) => renderChildDepartment(child))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {rootDepartments.length === 0 && (
              <div className="mt-8 text-center p-8 border border-dashed rounded-2xl max-w-md">
                <Building2 className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">No Parent Department Found</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create a top-level department (without a parent) to begin building your tree.
                </p>
                <Button size="sm" onClick={onAddDepartment} className="gap-1.5">
                  <PlusCircle className="size-4" />
                  <span>Create Department</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* DEPARTMENT INSPECT MODAL */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedDept && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                    {selectedDept.code || "DEPT"}
                  </Badge>
                  <DialogTitle className="text-base font-bold">{selectedDept.name}</DialogTitle>
                </div>
                <DialogDescription className="text-xs">
                  {selectedDept.description || "Corporate division details and designations."}
                </DialogDescription>
              </DialogHeader>

              {/* Designations in this department */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="size-3.5 text-primary" /> Configured Designations
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      onAddDesignation(selectedDept.id);
                    }}
                  >
                    <PlusCircle className="size-3" /> Add Designation
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {getDeptDesignations(selectedDept).length > 0 ? (
                    getDeptDesignations(selectedDept).map((desig) => (
                      <div
                        key={desig.id}
                        className="p-2.5 rounded-lg border bg-card flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-3.5 text-primary" />
                          <span className="font-semibold text-foreground">{desig.title}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {desig.grade || "Executive"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-3 text-center">
                      No designations created yet.
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
