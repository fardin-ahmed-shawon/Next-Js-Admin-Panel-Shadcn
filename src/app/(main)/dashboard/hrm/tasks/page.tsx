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
  Filter,
  Trash2,
  User,
  Calendar,
  Building2,
  ListTodo,
  CheckCircle,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  ArrowDown,
  Send,
  UserCheck,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useHrmTasks,
  assignTask,
  updateTaskStatus,
  deleteTask,
  useHrmEmployees,
  useHrmDepartments,
  TaskRecord,
} from "@/hooks/useHrm";

export default function PeerTasksPage() {
  const { user } = useAuth();
  const canManageEmployee = (id: number | null | undefined) => hasAllUserAccess(user, "tasks") || Number(id) === Number(user?.id);
  const [scope, setScope] = React.useState<"all" | "assigned_to_me" | "assigned_by_me">("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const { tasks, summary, loading, refetch } = useHrmTasks({
    scope,
    status: statusFilter,
    priority: priorityFilter,
    department_id: departmentFilter,
    search: searchQuery,
  });

  const { employees } = useHrmEmployees();
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
        return <Badge variant="destructive" className="capitalize text-xs">{priority}</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white capitalize text-xs">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize text-xs">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Peer Task Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign, track, and collaborate on operational tasks across departments and team members.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Assign Peer Task
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{summary.total}</h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">{summary.pending}</h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-full text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{summary.in_progress}</h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-full text-blue-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{summary.completed}</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-full text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Scope Controls */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <Tabs
              value={scope}
              onValueChange={(val) => setScope(val as any)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-[380px]">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="assigned_to_me">Assigned to Me</TabsTrigger>
                <TabsTrigger value="assigned_by_me">Created by Me</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, delegators, performers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-sm h-9"
                />
              </div>

              {/* Grid / Table View Toggle */}
              <div className="flex items-center border rounded-lg p-0.5 bg-muted/30 shrink-0">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2.5 gap-1.5 text-xs shadow-none"
                  onClick={() => setViewMode("grid")}
                  title="Card View"
                >
                  <LayoutGrid className="size-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2.5 gap-1.5 text-xs shadow-none"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <TableIcon className="size-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
            {/* Department Filter */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-9 text-xs">
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
            </div>

            {/* Status Filter */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List / Cards or Table */}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Clock className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
          <p>Loading peer tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <ListTodo className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
            There are no tasks matching your selected filters. Create a new task or adjust your search criteria.
          </p>
          <Button onClick={() => setCreateModalOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Assign a Task
          </Button>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Task</th>
                  <th className="py-3 px-4 text-left">Priority</th>
                  <th className="py-3 px-4 text-left">Given By (Creator)</th>
                  <th className="py-3 px-4 text-left">Assigned To (Performer)</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  return (
                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                      {/* Task Info */}
                      <td className="py-3 px-4 max-w-[280px]">
                        <span
                          className={`font-semibold text-sm block ${
                            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-[11px] text-muted-foreground truncate block max-w-xs mt-0.5">
                            {task.description}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getPriorityBadge(task.priority)}
                      </td>

                      {/* Given By (Creator) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {task.creator?.full_name?.slice(0, 2).toUpperCase() || "AD"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground block">
                                {task.creator?.full_name || "Management / Admin"}
                              </span>
                              <Badge variant="outline" className="text-[9px] py-0 h-3.5 bg-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-500/20">
                                Creator
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              {task.creator?.employee_detail?.designation?.title || task.creator?.employee_detail?.department?.name || "Zymerce"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned To (Performer) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {task.assignee?.full_name?.slice(0, 2).toUpperCase() || "AS"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground block">
                                {task.assignee?.full_name || "Unassigned"}
                              </span>
                              <Badge variant="outline" className="text-[9px] py-0 h-3.5 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                                Assignee
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              {task.assignee?.employee_detail?.designation?.title || task.assignee?.employee_detail?.department?.name || "Zymerce"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono">
                        {task.due_date ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            {task.due_date}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Select
                          disabled={!(canManageEmployee(task.assigned_to) || canManageEmployee(task.assigned_by))}
                          value={task.status}
                          onValueChange={(val) => handleStatusChange(task.id, val)}
                        >
                          <SelectTrigger className="h-7 text-xs w-[125px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center gap-1.5 text-amber-600">
                                <Clock className="size-3" /> Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <span className="flex items-center gap-1.5 text-blue-600">
                                <AlertCircle className="size-3" /> In Progress
                              </span>
                            </SelectItem>
                            <SelectItem value="completed">
                              <span className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle2 className="size-3" /> Completed
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={!(canManageEmployee(task.assigned_to) || canManageEmployee(task.assigned_by))}
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <Card
                key={task.id}
                className={`border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                  isCompleted ? "opacity-85 border-emerald-500/30 bg-emerald-500/[0.02]" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.due_date}
                          </span>
                        )}
                      </div>
                      <CardTitle
                        className={`text-base font-semibold leading-snug ${
                          isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
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
                      <Trash2 className="h-3.5 w-3.5" />
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
                          Given By (Task Delegator)
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
                          Assigned To (Task Performer)
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
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        </SelectItem>
                        <SelectItem value="in_progress">
                          <span className="flex items-center gap-1.5 text-blue-600">
                            <AlertCircle className="h-3 w-3" /> In Progress
                          </span>
                        </SelectItem>
                        <SelectItem value="completed">
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Completed
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
              <DialogTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
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
                  <SelectTrigger id="assignee">
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
                    <SelectTrigger id="task-priority">
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
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? "Assigning..." : "Assign Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
