"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { hasAllUserAccess } from "@/hooks/useRoles";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  Calendar,
  Building2,
  ListTodo,
  LayoutGrid,
  Table as TableIcon,
  ArrowDown,
  Send,
  UserCheck,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useHrmTasks,
  assignTask,
  updateTaskStatus,
  deleteTask,
  useHrmEmployees,
  useHrmDepartments,
} from "@/hooks/useHrm";
import { cn } from "@/lib/utils";

export default function PeerTasksPage() {
  const { user } = useAuth();
  const canManageEmployee = (id: number | null | undefined) =>
    hasAllUserAccess(user, "tasks") || Number(id) === Number(user?.id);

  const [scope, setScope] = React.useState<"all" | "assigned_to_me" | "assigned_by_me">("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { tasks, summary, loading, refetch } = useHrmTasks({
    scope,
    status: statusFilter,
    priority: priorityFilter,
    department_id: departmentFilter,
    search: debouncedSearch,
  });

  const sortedTasks = React.useMemo(() => {
    const list = [...tasks];
    if (sortBy === "oldest") {
      return list.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    }
    if (sortBy === "due_date") {
      return list.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    }
    if (sortBy === "priority") {
      const weights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return list.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    }
    // default newest
    return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [tasks, sortBy]);

  const { employees } = useHrmEmployees("", "tasks");
  const { departments } = useHrmDepartments();

  // Create Task Modal state
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [taskForm, setTaskForm] = React.useState({
    assigned_to: "",
    title: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
    priority: "medium",
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.assigned_to) {
      toast.error("Please select a colleague to assign the task to");
      return;
    }
    if (!taskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignTask({
        assigned_to: Number(taskForm.assigned_to),
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        due_date: taskForm.due_date || undefined,
        priority: taskForm.priority,
      });
      toast.success("Task assigned successfully");
      setCreateModalOpen(false);
      setTaskForm({
        assigned_to: "",
        title: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
        priority: "medium",
      });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Task status updated");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return <Badge variant="destructive" className="capitalize text-xs font-semibold">{priority}</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white capitalize text-xs font-semibold">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize text-xs font-semibold">Low</Badge>;
    }
  };

  const hasActiveFilters =
    scope !== "all" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    departmentFilter !== "all" ||
    sortBy !== "newest" ||
    !!searchQuery;

  const handleResetFilters = () => {
    setScope("all");
    setStatusFilter("all");
    setPriorityFilter("all");
    setDepartmentFilter("all");
    setSortBy("newest");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + Toolbar (Orders page pattern) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Title + description */}
        <div className="space-y-1 hidden sm:block">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl tracking-tight">Peer Tasks</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Assign, track, and collaborate on operational tasks across departments and team members.
          </p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl tracking-tight">Peer Tasks</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {summary.total}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Assign and track operational tasks across team members.
          </p>
        </div>

        {/* Controls: on mobile = full-width row, desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end flex-wrap">
            <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5 h-9">
              <Plus className="size-4" />
              Assign Peer Task
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-[min(var(--radius-md),12px)] p-0.5 bg-background shadow-2xs h-9">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 gap-1.5 text-xs shadow-none"
                onClick={() => setViewMode("grid")}
                title="Card View"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 gap-1.5 text-xs shadow-none"
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              aria-label="Refresh tasks"
              onClick={() => refetch()}
              disabled={loading}
              title="Refresh tasks"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Tasks
            </CardTitle>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ListTodo className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {summary.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active peer tasks
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums tracking-tight">
              {summary.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <AlertCircle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tabular-nums tracking-tight">
              {summary.in_progress}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently underway
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums tracking-tight">
              {summary.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Finished successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Sort Toolbar — Minimal Single Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative w-48 sm:w-60">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 w-full bg-background"
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

        {/* Scope Filter */}
        <Select value={scope} onValueChange={(val: any) => setScope(val)}>
          <SelectTrigger className="h-8 w-[130px] text-xs shrink-0">
            <SelectValue placeholder="Scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="assigned_to_me">Assigned to Me</SelectItem>
            <SelectItem value="assigned_by_me">Created by Me</SelectItem>
          </SelectContent>
        </Select>

        {/* Department Filter */}
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs shrink-0">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs shrink-0">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs shrink-0">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-[125px] text-xs shrink-0">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters (if active) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
            onClick={handleResetFilters}
            title="Reset all filters"
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Task Content: Table or Cards View */}
      {loading ? (
        <Card className="border shadow-2xs p-16 text-center text-muted-foreground">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-sm">Loading peer tasks...</span>
          </div>
        </Card>
      ) : sortedTasks.length === 0 ? (
        <Card className="border shadow-2xs p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <ListTodo className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No tasks found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {hasActiveFilters
                ? "No tasks match your selected filter criteria. Try adjusting or clearing filters."
                : "There are no peer tasks created yet. Click below to assign the first task."}
            </p>
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="mt-3 gap-2">
              <Plus className="size-4" />
              Assign a Task
            </Button>
          </div>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="border shadow-2xs overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1000px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="min-w-[280px]">Task &amp; Details</TableHead>
                  <TableHead className="min-w-[110px]">Priority</TableHead>
                  <TableHead className="min-w-[220px]">Delegator (Given By)</TableHead>
                  <TableHead className="min-w-[220px]">Assignee (Assigned To)</TableHead>
                  <TableHead className="min-w-[120px]">Due Date</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  return (
                    <TableRow key={task.id} className="hover:bg-muted/50 transition-colors">
                      {/* Task Info */}
                      <TableCell className="max-w-[280px]">
                        <span
                          className={`font-semibold text-sm block ${
                            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-xs text-muted-foreground truncate block max-w-xs mt-0.5">
                            {task.description}
                          </span>
                        )}
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="whitespace-nowrap">
                        {getPriorityBadge(task.priority)}
                      </TableCell>

                      {/* Given By (Creator) */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {task.creator?.full_name?.slice(0, 2).toUpperCase() || "AD"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground block text-xs">
                                {task.creator?.full_name || "Management / Admin"}
                              </span>
                              <Badge variant="outline" className="text-[9px] py-0 h-4 bg-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-500/20">
                                Creator
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              {task.creator?.employee_detail?.designation?.title ||
                                task.creator?.employee_detail?.department?.name ||
                                "Zymerce"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Assigned To (Performer) */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {task.assignee?.full_name?.slice(0, 2).toUpperCase() || "AS"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground block text-xs">
                                {task.assignee?.full_name || "Unassigned"}
                              </span>
                              <Badge variant="outline" className="text-[9px] py-0 h-4 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                                Assignee
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              {task.assignee?.employee_detail?.designation?.title ||
                                task.assignee?.employee_detail?.department?.name ||
                                "Zymerce"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell className="whitespace-nowrap text-muted-foreground font-mono text-xs">
                        {task.due_date ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            {task.due_date}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      {/* Status Selector */}
                      <TableCell className="whitespace-nowrap">
                        <Select
                          disabled={!(canManageEmployee(task.assigned_to) || canManageEmployee(task.assigned_by))}
                          value={task.status}
                          onValueChange={(val) => handleStatusChange(task.id, val)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                                <Clock className="size-3.5" /> Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                                <AlertCircle className="size-3.5" /> In Progress
                              </span>
                            </SelectItem>
                            <SelectItem value="completed">
                              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                <CheckCircle2 className="size-3.5" /> Completed
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={!(canManageEmployee(task.assigned_to) || canManageEmployee(task.assigned_by))}
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <Card
                key={task.id}
                className={cn(
                  "border shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs bg-card",
                  isCompleted && "border-emerald-500/30 bg-emerald-500/[0.02]"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                            <Calendar className="size-3" />
                            {task.due_date}
                          </span>
                        )}
                      </div>
                      <CardTitle
                        className={cn(
                          "text-base font-semibold leading-snug",
                          isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {task.title}
                      </CardTitle>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={!(canManageEmployee(task.assigned_to) || canManageEmployee(task.assigned_by))}
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {task.description && (
                    <CardDescription className="text-xs mt-2 line-clamp-3">
                      {task.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* High Visibility Delegation Flow Box */}
                  <div className="rounded-lg border bg-card divide-y divide-border/60 text-xs overflow-hidden shadow-2xs">
                    {/* Given By (Creator) */}
                    <div className="p-2.5 bg-blue-500/[0.04]">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Send className="size-3" />
                          Given By (Delegator)
                        </span>
                        {task.creator?.employee_detail?.department && (
                          <Badge variant="outline" className="text-[9px] py-0 h-4 border-blue-500/20 text-blue-700 dark:text-blue-300 bg-background">
                            {task.creator.employee_detail.department.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {task.creator?.full_name?.slice(0, 2).toUpperCase() || "AD"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground truncate block text-xs">
                            {task.creator?.full_name || "Management / Admin"}
                          </span>
                          {task.creator?.employee_detail?.designation?.title && (
                            <span className="text-[10px] text-muted-foreground block truncate">
                              {task.creator.employee_detail.designation.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flow Connector Arrow */}
                    <div className="px-2.5 py-1 bg-muted/40 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                      <ArrowDown className="size-3 text-primary" />
                      <span>Assigned to colleague</span>
                    </div>

                    {/* Assigned To (Performer) */}
                    <div className="p-2.5 bg-emerald-500/[0.04]">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <UserCheck className="size-3" />
                          Assigned To (Performer)
                        </span>
                        {task.assignee?.employee_detail?.department && (
                          <Badge variant="outline" className="text-[9px] py-0 h-4 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 bg-background">
                            {task.assignee.employee_detail.department.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {task.assignee?.full_name?.slice(0, 2).toUpperCase() || "AS"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground truncate block text-xs">
                            {task.assignee?.full_name || "Unassigned"}
                          </span>
                          {task.assignee?.employee_detail?.designation?.title && (
                            <span className="text-[10px] text-muted-foreground block truncate">
                              {task.assignee.employee_detail.designation.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Switcher */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground font-medium">Status:</span>
                    <Select
                      disabled={!(canManageEmployee(task.assigned_to) || canManageEmployee(task.assigned_by))}
                      value={task.status}
                      onValueChange={(val) => handleStatusChange(task.id, val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                            <Clock className="size-3" /> Pending
                          </span>
                        </SelectItem>
                        <SelectItem value="in_progress">
                          <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <AlertCircle className="size-3" /> In Progress
                          </span>
                        </SelectItem>
                        <SelectItem value="completed">
                          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <CheckCircle2 className="size-3" /> Completed
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assign Task Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ListTodo className="size-5 text-primary" />
                Assign Peer Task
              </DialogTitle>
              <DialogDescription>
                Assign an operational task to a colleague with clear priority and due date.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Colleague Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="assignee" className="text-xs font-semibold">
                  Assign To Colleague *
                </Label>
                <Select
                  value={taskForm.assigned_to}
                  onValueChange={(val) => setTaskForm({ ...taskForm, assigned_to: val })}
                >
                  <SelectTrigger id="assignee" className="h-9 text-xs">
                    <SelectValue placeholder="Select colleague..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.full_name}{" "}
                        {emp.employee_detail?.department
                          ? `(${emp.employee_detail.department.name})`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="task-title" className="text-xs font-semibold">
                  Task Title *
                </Label>
                <Input
                  id="task-title"
                  placeholder="e.g. Verify delivered return parcels from Courier"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="h-9 text-xs"
                  required
                />
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="task-priority" className="text-xs font-semibold">
                    Priority
                  </Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(val) => setTaskForm({ ...taskForm, priority: val })}
                  >
                    <SelectTrigger id="task-priority" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="task-due-date" className="text-xs font-semibold">
                    Due Date
                  </Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="task-desc" className="text-xs font-semibold">
                  Task Instructions / Details
                </Label>
                <Textarea
                  id="task-desc"
                  placeholder="Detailed notes, order IDs, or checklist for your colleague..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="text-xs resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Assign Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
