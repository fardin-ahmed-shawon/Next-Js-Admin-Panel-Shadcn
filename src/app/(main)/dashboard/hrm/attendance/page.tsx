"use client";

import * as React from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Users,
  PlusCircle,
  Pencil,
  Download,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
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

import {
  useHrmAttendances,
  useHrmEmployees,
  recordAttendance,
  AttendanceRecord,
} from "@/hooks/useHrm";

export default function AttendanceManagementPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = React.useState(todayStr);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { attendances, summary, loading, refetch } = useHrmAttendances({ date: selectedDate });
  const { employees } = useHrmEmployees();

  // Log / Override modal
  const [logModalOpen, setLogModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<AttendanceRecord | null>(null);
  const [formState, setFormState] = React.useState({
    user_id: "",
    date: todayStr,
    check_in: "09:00",
    check_out: "18:00",
    status: "Present",
    notes: "",
  });

  const openLogModal = (record?: AttendanceRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormState({
        user_id: String(record.user_id),
        date: record.date,
        check_in: record.check_in ? record.check_in.slice(0, 5) : "09:00",
        check_out: record.check_out ? record.check_out.slice(0, 5) : "18:00",
        status: record.status,
        notes: record.notes || "",
      });
    } else {
      setEditingRecord(null);
      setFormState({
        user_id: employees[0]?.id ? String(employees[0].id) : "",
        date: selectedDate,
        check_in: "09:00",
        check_out: "18:00",
        status: "Present",
        notes: "Manual entry / HR log",
      });
    }
    setLogModalOpen(true);
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.user_id) {
      toast.error("Please select an employee");
      return;
    }
    try {
      await recordAttendance({
        user_id: Number(formState.user_id),
        date: formState.date,
        check_in: formState.check_in ? `${formState.check_in}:00` : null,
        check_out: formState.check_out ? `${formState.check_out}:00` : null,
        status: formState.status,
        notes: formState.notes,
      });
      toast.success("Attendance record saved successfully");
      setLogModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to record attendance");
    }
  };

  const filteredAttendances = React.useMemo(() => {
    return attendances.filter((att) => {
      if (statusFilter !== "all" && att.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          att.user?.full_name?.toLowerCase().includes(q) ||
          att.user?.employee_detail?.employee_id?.toLowerCase().includes(q) ||
          att.user?.employee_detail?.department?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [attendances, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Attendance & Working Hours Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time daily punch check-in, check-out, working hours, late penalty, overtime, and attendance logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={() => openLogModal()} className="gap-2 shadow-sm text-xs">
            <PlusCircle className="size-4" />
            <span>Log Manual Attendance</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Present Today
            </span>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {summary?.present || 0}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">On duty or completed</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Late Arrivals
            </span>
            <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
              {summary?.late || 0}
            </div>
            <p className="text-[11px] text-muted-foreground">Checked in past 09:15 AM</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Absent Count
            </span>
            <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
              {summary?.absent || 0}
            </div>
            <p className="text-[11px] text-rose-500 font-medium">No check-in recorded</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Overtime Hours
            </span>
            <div className="text-2xl font-extrabold text-primary tabular-nums">
              {summary?.overtime_hours || 0}h
            </div>
            <p className="text-[11px] text-muted-foreground">Credited to payroll bonus</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <Card className="border shadow-xs bg-card">
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search employee, ID, department..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Input
                type="date"
                className="h-9 text-xs w-[145px]"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5"
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Table */}
        <CardContent className="p-0 border-t">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Employee</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">Check-In</th>
                  <th className="py-3 px-4 text-left">Check-Out</th>
                  <th className="py-3 px-4 text-left">Working Hours</th>
                  <th className="py-3 px-4 text-left">Overtime</th>
                  <th className="py-3 px-4 text-left">Late Minutes</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground">
                      No attendance records found for {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((att) => {
                    const statusBadgeColors = {
                      Present: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
                      Late: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                      Absent: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
                      "Half Day": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
                      "On Leave": "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
                      Holiday: "bg-muted text-muted-foreground",
                    };

                    return (
                      <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {att.user?.full_name?.slice(0, 2).toUpperCase() || "EM"}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block">
                                {att.user?.full_name || "Employee"}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {att.user?.employee_detail?.employee_id || `#${att.user_id}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {att.user?.employee_detail?.department?.name || "Unassigned"}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {att.check_in ? att.check_in.slice(0, 5) : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {att.check_out ? att.check_out.slice(0, 5) : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {att.working_hours ? `${att.working_hours}h` : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                          {att.overtime_hours > 0 ? `+${att.overtime_hours}h` : "0h"}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-600 font-medium">
                          {att.late_minutes > 0 ? `${att.late_minutes}m` : "0m"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-2 py-0.5 ${
                              statusBadgeColors[att.status] || "bg-muted"
                            }`}
                          >
                            {att.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground truncate max-w-[150px]">
                          {att.notes || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0"
                            onClick={() => openLogModal(att)}
                          >
                            <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
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

      {/* LOG / EDIT ATTENDANCE DIALOG */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveAttendance}>
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Attendance" : "Log Manual Attendance"}</DialogTitle>
              <DialogDescription className="text-xs">
                Record or adjust employee punch-in times, shift status, and late notes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label>Employee *</Label>
                <Select
                  disabled={Boolean(editingRecord)}
                  value={formState.user_id}
                  onValueChange={(val) => setFormState({ ...formState, user_id: val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.full_name} ({e.employee_detail?.employee_id || `EMP-${e.id}`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Date *</Label>
                <Input
                  type="date"
                  required
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Check-In Time</Label>
                  <Input
                    type="time"
                    value={formState.check_in}
                    onChange={(e) => setFormState({ ...formState, check_in: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Check-Out Time</Label>
                  <Input
                    type="time"
                    value={formState.check_out}
                    onChange={(e) => setFormState({ ...formState, check_out: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Status *</Label>
                <Select
                  value={formState.status}
                  onValueChange={(val) => setFormState({ ...formState, status: val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Notes / Reason</Label>
                <Input
                  placeholder="e.g. Approved early leave, traffic delay"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setLogModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Attendance Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
