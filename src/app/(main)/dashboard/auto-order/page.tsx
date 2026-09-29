"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { useAutoOrder, AutoOrderPriority } from "@/hooks/useAutoOrder";
import { useHrmDepartments, useHrmDesignations } from "@/hooks/useHrm";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchClient } from "@/lib/fetch-client";
import {
  Trash2,
  Users,
  UserPlus,
  RotateCcw,
  Sparkles,
  Search,
  Building2,
  Briefcase,
  ArrowUpDown,
  Check,
  Filter,
  Layers,
} from "lucide-react";

export default function AutoOrderPage() {
  const { features } = useModularFeatures();
  if (
    features?.employee_management === false ||
    String(features?.employee_management) === "0" ||
    features?.employee_auto_order_distribution === false ||
    String(features?.employee_auto_order_distribution) === "0"
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">
          The Auto Order Distribution feature is currently disabled.
        </p>
      </div>
    );
  }

  const {
    priorities,
    isAutoOrderEnabled,
    isLoading,
    fetchPriorities,
    toggleAutoOrder,
    addPriority,
    updatePriorityStatus,
    updatePriorityCustomerType,
    deletePriority,
  } = useAutoOrder();

  const { departments: allDepts } = useHrmDepartments();
  const { designations: allDesigs } = useHrmDesignations();

  // Users for Add Dialog
  const [users, setUsers] = useState<any[]>([]);

  // Add Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogSearch, setDialogSearch] = useState("");
  const [dialogDeptFilter, setDialogDeptFilter] = useState("all");
  const [dialogDesigFilter, setDialogDesigFilter] = useState("all");
  const [dialogSortBy, setDialogSortBy] = useState<"name" | "dept" | "desig">("name");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">("active");
  const [selectedCustomerType, setSelectedCustomerType] = useState<"all" | "new" | "old">("all");

  // Main Page Filters & Sort States
  const [mainSearch, setMainSearch] = useState("");
  const [mainDeptFilter, setMainDeptFilter] = useState("all");
  const [mainDesigFilter, setMainDesigFilter] = useState("all");
  const [mainCustomerTypeFilter, setMainCustomerTypeFilter] = useState("all_filter");
  const [mainSortBy, setMainSortBy] = useState<"seq" | "name" | "dept" | "desig" | "type">("seq");
  const [mainSortOrder, setMainSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchPriorities();
    fetchUsers();
  }, [fetchPriorities]);

  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const usersEndpoint = process.env.NEXT_PUBLIC_API_USERS || "users";
      const api_url = baseUrl.endsWith("/") ? `${baseUrl}${usersEndpoint}` : `${baseUrl}/${usersEndpoint}`;
      const res = await fetchClient(api_url);
      if (res.ok) {
        const response = await res.json();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!selectedUser) return;
    const success = await addPriority(Number(selectedUser), selectedStatus, selectedCustomerType);
    if (success) {
      setIsDialogOpen(false);
      setSelectedUser("");
      setSelectedStatus("active");
      setSelectedCustomerType("all");
      setDialogSearch("");
      setDialogDeptFilter("all");
      setDialogDesigFilter("all");
    }
  };

  // Set of user IDs already added in priorities
  const alreadyAddedUserIds = useMemo(() => {
    return new Set(priorities.map((p) => p.user_id));
  }, [priorities]);

  // Unique departments & designations list from users and priorities
  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();
    allDepts.forEach((d) => map.set(d.name, d.name));
    users.forEach((u) => {
      const name = u.employee_detail?.department?.name;
      if (name) map.set(name, name);
    });
    priorities.forEach((p) => {
      const name = p.user?.employee_detail?.department?.name;
      if (name) map.set(name, name);
    });
    return Array.from(map.values()).sort();
  }, [allDepts, users, priorities]);

  const designationOptions = useMemo(() => {
    const map = new Map<string, string>();
    allDesigs.forEach((d) => map.set(d.title, d.title));
    users.forEach((u) => {
      const title = u.employee_detail?.designation?.title;
      if (title) map.set(title, title);
    });
    priorities.forEach((p) => {
      const title = p.user?.employee_detail?.designation?.title;
      if (title) map.set(title, title);
    });
    return Array.from(map.values()).sort();
  }, [allDesigs, users, priorities]);

  // Filtered & sorted users in Add Dialog
  const dialogFilteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const q = dialogSearch.toLowerCase().trim();
        const matchesSearch =
          !q ||
          u.full_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.employee_detail?.department?.name?.toLowerCase().includes(q) ||
          u.employee_detail?.designation?.title?.toLowerCase().includes(q);

        const deptName = u.employee_detail?.department?.name || "";
        const matchesDept = dialogDeptFilter === "all" || deptName === dialogDeptFilter;

        const desigTitle = u.employee_detail?.designation?.title || "";
        const matchesDesig = dialogDesigFilter === "all" || desigTitle === dialogDesigFilter;

        return matchesSearch && matchesDept && matchesDesig;
      })
      .sort((a, b) => {
        if (dialogSortBy === "dept") {
          const aDept = a.employee_detail?.department?.name || "";
          const bDept = b.employee_detail?.department?.name || "";
          return aDept.localeCompare(bDept);
        }
        if (dialogSortBy === "desig") {
          const aDes = a.employee_detail?.designation?.title || "";
          const bDes = b.employee_detail?.designation?.title || "";
          return aDes.localeCompare(bDes);
        }
        return (a.full_name || "").localeCompare(b.full_name || "");
      });
  }, [users, dialogSearch, dialogDeptFilter, dialogDesigFilter, dialogSortBy]);

  // Main page filtered & sorted priorities
  const displayedPriorities = useMemo(() => {
    return priorities
      .filter((p) => {
        const q = mainSearch.toLowerCase().trim();
        const deptName = p.user?.employee_detail?.department?.name || "";
        const desigTitle = p.user?.employee_detail?.designation?.title || "";
        const custType = p.customer_type || "all";

        const matchesSearch =
          !q ||
          p.user?.full_name?.toLowerCase().includes(q) ||
          p.user?.email?.toLowerCase().includes(q) ||
          deptName.toLowerCase().includes(q) ||
          desigTitle.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          custType.toLowerCase().includes(q);

        const matchesDept = mainDeptFilter === "all" || deptName === mainDeptFilter;
        const matchesDesig = mainDesigFilter === "all" || desigTitle === mainDesigFilter;
        const matchesCustomer =
          mainCustomerTypeFilter === "all_filter" || custType === mainCustomerTypeFilter;

        return matchesSearch && matchesDept && matchesDesig && matchesCustomer;
      })
      .sort((a, b) => {
        let comp = 0;
        if (mainSortBy === "name") {
          comp = (a.user?.full_name || "").localeCompare(b.user?.full_name || "");
        } else if (mainSortBy === "dept") {
          const aDept = a.user?.employee_detail?.department?.name || "";
          const bDept = b.user?.employee_detail?.department?.name || "";
          comp = aDept.localeCompare(bDept);
        } else if (mainSortBy === "desig") {
          const aDes = a.user?.employee_detail?.designation?.title || "";
          const bDes = b.user?.employee_detail?.designation?.title || "";
          comp = aDes.localeCompare(bDes);
        } else if (mainSortBy === "type") {
          comp = (a.customer_type || "all").localeCompare(b.customer_type || "all");
        } else {
          comp = a.id - b.id;
        }
        return mainSortOrder === "asc" ? comp : -comp;
      });
  }, [
    priorities,
    mainSearch,
    mainDeptFilter,
    mainDesigFilter,
    mainCustomerTypeFilter,
    mainSortBy,
    mainSortOrder,
  ]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = priorities.length;
    const allCount = priorities.filter((p) => !p.customer_type || p.customer_type === "all").length;
    const newCount = priorities.filter((p) => p.customer_type === "new").length;
    const oldCount = priorities.filter((p) => p.customer_type === "old").length;
    const activeCount = priorities.filter((p) => p.status === "active").length;
    return { total, allCount, newCount, oldCount, activeCount };
  }, [priorities]);

  const toggleSort = (col: "seq" | "name" | "dept" | "desig" | "type") => {
    if (mainSortBy === col) {
      setMainSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setMainSortBy(col);
      setMainSortOrder("asc");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Auto Order Distribution
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
              Department & Customer Segment Aware
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sequence auto order distribution across departments, designations, and customer tiers (New vs. Old).
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-muted/40 border p-2.5 px-4 rounded-xl">
          <span className="font-semibold text-xs text-foreground">
            System {isAutoOrderEnabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={isAutoOrderEnabled}
            onCheckedChange={toggleAutoOrder}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Segment Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setMainCustomerTypeFilter("all_filter")}
          className={`p-3.5 rounded-xl border bg-card hover:bg-muted/20 cursor-pointer transition-all ${
            mainCustomerTypeFilter === "all_filter" ? "ring-2 ring-primary border-primary shadow-xs" : ""
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Queue</span>
            <Users className="size-4" />
          </div>
          <p className="text-xl font-extrabold text-foreground mt-1">
            {stats.activeCount} <span className="text-xs font-normal text-muted-foreground">/ {stats.total} Active</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Active in rotation</p>
        </div>

        <div
          onClick={() => setMainCustomerTypeFilter("new")}
          className={`p-3.5 rounded-xl border bg-card hover:bg-muted/20 cursor-pointer transition-all ${
            mainCustomerTypeFilter === "new" ? "ring-2 ring-emerald-500 border-emerald-500 shadow-xs" : ""
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">New Customers</span>
            <UserPlus className="size-4" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.newCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Assigned to first-time buyers</p>
        </div>

        <div
          onClick={() => setMainCustomerTypeFilter("old")}
          className={`p-3.5 rounded-xl border bg-card hover:bg-muted/20 cursor-pointer transition-all ${
            mainCustomerTypeFilter === "old" ? "ring-2 ring-indigo-500 border-indigo-500 shadow-xs" : ""
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Old / Repeat</span>
            <RotateCcw className="size-4" />
          </div>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats.oldCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Assigned to repeat customers</p>
        </div>

        <div
          onClick={() => setMainCustomerTypeFilter("all")}
          className={`p-3.5 rounded-xl border bg-card hover:bg-muted/20 cursor-pointer transition-all ${
            mainCustomerTypeFilter === "all" ? "ring-2 ring-slate-500 border-slate-500 shadow-xs" : ""
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">All Customers</span>
            <Sparkles className="size-4" />
          </div>
          <p className="text-xl font-extrabold text-foreground mt-1">{stats.allCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Receives both new & old</p>
        </div>
      </div>

      {/* Main Table Card with Search, Filter & Sort */}
      <div className="bg-card rounded-2xl shadow-xs border p-5 space-y-4">
        {/* Top Control Bar: Search + Department Filter + Designation Filter + Add Employee */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Priority Sequence List</h2>
            <p className="text-xs text-muted-foreground">
              Filter by department/designation and manage order assignment rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Live Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Live search priority..."
                className="pl-8 h-8 text-xs bg-muted/20"
                value={mainSearch}
                onChange={(e) => setMainSearch(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <Select value={mainDeptFilter} onValueChange={setMainDeptFilter}>
              <SelectTrigger className="h-8 text-xs w-40 bg-muted/20">
                <Building2 className="size-3 text-muted-foreground mr-1" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Designation Filter */}
            <Select value={mainDesigFilter} onValueChange={setMainDesigFilter}>
              <SelectTrigger className="h-8 text-xs w-40 bg-muted/20">
                <Briefcase className="size-3 text-muted-foreground mr-1" />
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Designations</SelectItem>
                {designationOptions.map((des) => (
                  <SelectItem key={des} value={des}>
                    {des}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button if any active */}
            {(mainSearch || mainDeptFilter !== "all" || mainDesigFilter !== "all" || mainCustomerTypeFilter !== "all_filter") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => {
                  setMainSearch("");
                  setMainDeptFilter("all");
                  setMainDesigFilter("all");
                  setMainCustomerTypeFilter("all_filter");
                }}
              >
                Reset
              </Button>
            )}

            {/* ADD EMPLOYEE DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1.5 shadow-xs">
                  <UserPlus className="size-3.5" />
                  <span>Add Employee</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold">Add Employee to Auto Order</DialogTitle>
                  <DialogDescription className="text-xs">
                    Search and sort employees by department and designation, then assign their customer segment.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3.5 py-2 overflow-y-auto pr-1">
                  {/* Dialog Controls: Live Search + Dept Sort/Filter */}
                  <div className="space-y-2 p-3 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Live search by name, email, department, role..."
                          className="pl-8 h-8 text-xs bg-background"
                          value={dialogSearch}
                          onChange={(e) => setDialogSearch(e.target.value)}
                        />
                      </div>

                      {/* Sort option */}
                      <Select value={dialogSortBy} onValueChange={(v: any) => setDialogSortBy(v)}>
                        <SelectTrigger className="h-8 text-xs w-36 bg-background">
                          <ArrowUpDown className="size-3 text-muted-foreground mr-1" />
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="name">Sort: Name (A-Z)</SelectItem>
                          <SelectItem value="dept">Sort: Department</SelectItem>
                          <SelectItem value="desig">Sort: Designation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={dialogDeptFilter} onValueChange={setDialogDeptFilter}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <Building2 className="size-3 text-muted-foreground mr-1" />
                          <SelectValue placeholder="Filter Department" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="all">All Departments</SelectItem>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={dialogDesigFilter} onValueChange={setDialogDesigFilter}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <Briefcase className="size-3 text-muted-foreground mr-1" />
                          <SelectValue placeholder="Filter Designation" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="all">All Designations</SelectItem>
                          {designationOptions.map((des) => (
                            <SelectItem key={des} value={des}>
                              {des}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Employee Selection List */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Select Employee ({dialogFilteredUsers.length} available)</span>
                      {selectedUser && (
                        <span className="text-[10px] text-primary font-bold">1 Employee Selected</span>
                      )}
                    </label>

                    <div className="max-h-56 overflow-y-auto space-y-1.5 border rounded-xl p-2 bg-muted/10 divide-y divide-border/40">
                      {dialogFilteredUsers.length > 0 ? (
                        dialogFilteredUsers.map((u) => {
                          const isAlreadyInQueue = alreadyAddedUserIds.has(u.id);
                          const isSelected = selectedUser === String(u.id);
                          const deptName = u.employee_detail?.department?.name || "Unassigned Dept";
                          const desigTitle = u.employee_detail?.designation?.title || "Executive";

                          return (
                            <div
                              key={u.id}
                              onClick={() => {
                                if (!isAlreadyInQueue) {
                                  setSelectedUser(String(u.id));
                                }
                              }}
                              className={`p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 text-xs ${
                                isAlreadyInQueue
                                  ? "opacity-45 cursor-not-allowed bg-muted/20"
                                  : isSelected
                                  ? "bg-primary/10 border border-primary text-foreground shadow-2xs cursor-pointer"
                                  : "hover:bg-muted/40 cursor-pointer bg-card"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`size-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-primary/10 text-primary border-primary/20"
                                  }`}
                                >
                                  {u.full_name?.slice(0, 2).toUpperCase() || "EM"}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-foreground truncate">{u.full_name}</span>
                                    <Badge
                                      variant="secondary"
                                      className="text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold"
                                    >
                                      {desigTitle}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                    <span className="font-medium text-foreground">{deptName}</span>
                                    {u.email && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-[140px]">{u.email}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isAlreadyInQueue ? (
                                  <Badge variant="outline" className="text-[9px] text-muted-foreground font-mono">
                                    In Queue
                                  </Badge>
                                ) : isSelected ? (
                                  <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                    <Check className="size-3" />
                                  </div>
                                ) : (
                                  <div className="size-5 rounded-full border-2 border-muted-foreground/30" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-xs text-muted-foreground italic">
                          No employees match the search and department filter.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Segment Rule Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-foreground">
                      Customer Segment Rule *
                    </label>
                    <Select
                      value={selectedCustomerType}
                      onValueChange={(v: any) => setSelectedCustomerType(v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Users className="size-3.5 text-slate-500" />
                            <span className="font-semibold">All Customers (Both New & Old)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <UserPlus className="size-3.5 text-emerald-500" />
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              New Customers Only
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="old">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="size-3.5 text-indigo-500" />
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              Old / Repeat Customers Only
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Initial Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Initial Status</label>
                    <Select value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="active">Active (Receiving Orders)</SelectItem>
                        <SelectItem value="inactive">Inactive (Paused)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 border-t mt-2">
                  <Button className="w-full text-xs h-9" onClick={handleAdd} disabled={!selectedUser}>
                    Add to Distribution Queue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Priority Sequence Table with Column Sorts */}
        <div className="overflow-x-auto rounded-xl border">
          <Table className="text-xs">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead
                  onClick={() => toggleSort("seq")}
                  className="w-20 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold">
                    <span>Seq</span>
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => toggleSort("name")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold">
                    <span>Employee Name</span>
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => toggleSort("dept")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold">
                    <span>Department</span>
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => toggleSort("desig")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold">
                    <span>Designation</span>
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => toggleSort("type")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold">
                    <span>Customer Segment Focus</span>
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>

                <TableHead>Queue Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {displayedPriorities.map((p) => {
                const currentSegment = p.customer_type || "all";
                const deptName = p.user?.employee_detail?.department?.name || "Unassigned";
                const deptCode = p.user?.employee_detail?.department?.code;
                const desigTitle = p.user?.employee_detail?.designation?.title || "Executive";
                const desigGrade = p.user?.employee_detail?.designation?.grade;

                return (
                  <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                    {/* Seq ID */}
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      #{p.id}
                    </TableCell>

                    {/* Employee Profile */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                          {p.user?.full_name?.slice(0, 2).toUpperCase() || "EM"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{p.user?.full_name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.user?.email || `User #${p.user_id}`}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{deptName}</span>
                        {deptCode && (
                          <Badge variant="outline" className="text-[9px] font-mono">
                            {deptCode}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Designation */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        >
                          {desigTitle}
                        </Badge>
                        {desigGrade && (
                          <span className="text-[10px] text-muted-foreground">({desigGrade})</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Customer Segment Dropdown (Inline Editable) */}
                    <TableCell>
                      <Select
                        value={currentSegment}
                        onValueChange={(val: "all" | "new" | "old") =>
                          updatePriorityCustomerType(p.id, val)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs w-[185px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="all">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              <span className="size-2 rounded-full bg-slate-500 shrink-0" />
                              <span>All Customers</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="new">
                            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>New Customers Only</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="old">
                            <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                              <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                              <span>Old / Repeat Only</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Queue Status Toggle */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={p.status === "active"}
                          onCheckedChange={(val) =>
                            updatePriorityStatus(p.id, val ? "active" : "inactive")
                          }
                        />
                        <Badge
                          variant="secondary"
                          className={
                            p.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] capitalize"
                              : "bg-muted text-muted-foreground text-[10px] capitalize"
                          }
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePriority(p.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 size-8"
                        title="Remove from queue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {displayedPriorities.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-28 text-muted-foreground text-xs">
                    No employees match your search, department, or customer segment filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
