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
  FileSpreadsheet,
  Upload,
  UploadCloud,
  FileCheck,
  AlertCircle,
  HelpCircle,
  X,
  FileText,
  ArrowUpDown,
  RotateCcw,
  ShieldAlert,
  Info,
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
  useHrmDepartments,
  recordAttendance,
  importAttendances,
  AttendanceRecord,
} from "@/hooks/useHrm";
import { useAuth } from "@/hooks/useAuth";
import { hasManageAttendanceAccess } from "@/hooks/useRoles";

export default function AttendanceManagementPage() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

  // Filters and Sorting - Default to current month's data
  const [timeRange, setTimeRange] = React.useState<string>("this_month");
  const [startDate, setStartDate] = React.useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = React.useState<string>(todayStr);
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("date");
  const [sortOrder, setSortOrder] = React.useState<string>("desc");

  const { user } = useAuth();
  const canManageAttendance = hasManageAttendanceAccess(user);

  const { attendances, summary, policy, loading, refetch } = useHrmAttendances({
    time_range: timeRange,
    start_date: timeRange === "custom" ? startDate : undefined,
    end_date: timeRange === "custom" ? endDate : undefined,
    department_id: departmentFilter !== "all" ? departmentFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { employees } = useHrmEmployees();
  const { departments } = useHrmDepartments();

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

  // Bulk Excel Import State
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const openLogModal = (record?: AttendanceRecord) => {
    if (!canManageAttendance) {
      toast.error("You do not have permission to manage attendance records.");
      return;
    }

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
        date: todayStr,
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
    if (!canManageAttendance) {
      toast.error("You do not have permission to manage attendance records.");
      return;
    }
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

  const handleExportCSV = () => {
    if (!filteredAttendances.length) {
      toast.info("No attendance records to export for this view");
      return;
    }

    const headers = [
      "Date",
      "Employee ID",
      "Employee Name",
      "Department",
      "Check-In",
      "Check-Out",
      "Working Hours",
      "Overtime (h)",
      "Late (mins)",
      "Deficit Hours (h)",
      "Status",
      "Notes",
    ];

    const rows = filteredAttendances.map((att) => [
      att.date,
      att.user?.employee_detail?.employee_id || `ID-${att.user_id}`,
      `"${att.user?.full_name || "Employee"}"`,
      `"${att.user?.employee_detail?.department?.name || "Unassigned"}"`,
      att.check_in || "",
      att.check_out || "",
      att.working_hours || 0,
      att.overtime_hours || 0,
      att.late_minutes || 0,
      att.deficit_hours || 0,
      att.status,
      `"${att.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${timeRange}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Template for Excel / CSV Import
  const handleDownloadSampleTemplate = () => {
    const templateData = [
      {
        employee_id: "EMP-001",
        employee_name: "Mr John (Reference Only)",
        date: todayStr,
        check_in: "09:00:00",
        check_out: "18:00:00",
        status: "Present",
        notes: "Biometric on-time entry",
      },
      {
        employee_id: "EMP-002",
        employee_name: "Ms Sarah (Reference Only)",
        date: todayStr,
        check_in: "09:25:00",
        check_out: "18:00:00",
        status: "Late",
        notes: "Traffic congestion",
      },
      {
        employee_id: "EMP-003",
        employee_name: "Alex Smith (Reference Only)",
        date: todayStr,
        check_in: "",
        check_out: "",
        status: "Absent",
        notes: "Unexcused absence",
      },
    ];

    const headers = ["employee_id", "employee_name", "date", "check_in", "check_out", "status", "notes"];
    const rows = [
      headers.join(","),
      `"EMP-001","Mr John (Reference Only)","${todayStr}","09:00:00","18:00:00","Present","Biometric on-time entry"`,
      `"EMP-002","Ms Sarah (Reference Only)","${todayStr}","09:25:00","18:00:00","Late","Traffic congestion"`,
      `"EMP-003","Alex Smith (Reference Only)","${todayStr}","","","Absent","Unexcused absence"`,
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_bulk_import_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance template (.csv) downloaded! Ready to open & edit in Microsoft Excel.");
  };

  // Zero-dependency pure CSV parser
  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map((h) =>
      h.toLowerCase().replace(/[\s_-]+/g, "_").replace(/^"|"$/g, "")
    );
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.every((v) => v === "")) continue;
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = (values[idx] ?? "").replace(/^"|"$/g, "");
      });
      data.push(row);
    }

    return data;
  };

  // Helper to dynamically load XLSX parser on-demand if user uploads an Excel file (.xlsx / .xls)
  const loadXLSX = async (): Promise<any> => {
    if (typeof window === "undefined") return null;
    if ((window as any).XLSX) return (window as any).XLSX;

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="xlsx"]');
      if (existing) {
        existing.addEventListener("load", () => resolve((window as any).XLSX));
        existing.addEventListener("error", () => reject(new Error("Failed to load Excel library")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.async = true;
      script.onload = () => resolve((window as any).XLSX);
      script.onerror = () => reject(new Error("Unable to load Excel parser from CDN. Please upload in .csv format."));
      document.head.appendChild(script);
    });
  };

  // Helper to normalize dates from Excel serial numbers, CSV text, etc.
  const normalizeDateString = (val: any): string => {
    if (!val && val !== 0) return "";
    if (typeof val === "number" && val > 10000 && val < 100000) {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      return d.toISOString().split("T")[0];
    }
    const str = String(val).trim();
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const parts = str.split(/[\/\-\.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
      if (parts[2].length === 4 || parts[2].length === 2) {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        if (p0 > 12) {
          return `${year}-${String(p1).padStart(2, "0")}-${String(p0).padStart(2, "0")}`;
        }
        return `${year}-${String(p0).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
      }
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return str;
  };

  // Handle file selection and parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);

    const processRawData = (rawData: any[]) => {
      if (!rawData || rawData.length === 0) {
        toast.error("The selected file is empty or contains no readable rows.");
        setParsedRows([]);
        return;
      }

      const normalizedRows = rawData.map((row) => {
        const rawDate = row.date ?? row.attendance_date ?? "";
        const dateStr = normalizeDateString(rawDate);
        return {
          ...row,
          date: dateStr || rawDate,
        };
      });

      setParsedRows(normalizedRows);
      toast.success(`Loaded ${normalizedRows.length} records from ${file.name}`);
    };

    const isCSV = file.name.endsWith(".csv") || file.name.endsWith(".txt") || file.type.includes("csv");

    if (isCSV) {
      try {
        const text = await file.text();
        const rawData = parseCSV(text);
        processRawData(rawData);
      } catch (err: any) {
        toast.error("Error reading CSV file: " + (err.message || "Invalid file format"));
        setParsedRows([]);
      }
    } else {
      // For .xlsx / .xls, dynamically load XLSX parser
      try {
        toast.info("Loading Excel parser...");
        const XLSX = await loadXLSX();
        if (!XLSX) {
          throw new Error("Excel parser could not be initialized. Please upload as .csv format.");
        }
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        processRawData(rawData);
      } catch (err: any) {
        toast.error("Error reading Excel file: " + (err.message || "Please upload as .csv format"));
        setParsedRows([]);
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedRows.length && !importFile) {
      toast.error("Please select a valid Excel or CSV file to import.");
      return;
    }

    try {
      setIsImporting(true);
      const res = await importAttendances({
        rows: parsedRows,
        file: importFile || undefined,
      });

      setImportResult({
        imported: res.data?.imported || 0,
        updated: res.data?.updated || 0,
        skipped: res.data?.skipped || 0,
        errors: res.data?.errors || [],
      });

      toast.success(res.message || "Attendance records imported successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Bulk import failed. Please verify file format.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportModal = () => {
    setImportFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImportModalOpen(false);
  };

  const filteredAttendances = React.useMemo(() => {
    return attendances.filter((att) => {
      if (statusFilter !== "all" && att.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = att.user?.full_name?.toLowerCase() || "";
        const empId = att.user?.employee_detail?.employee_id?.toLowerCase() || "";
        const dept = att.user?.employee_detail?.department?.name?.toLowerCase() || "";
        return name.includes(q) || empId.includes(q) || dept.includes(q);
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

        {canManageAttendance && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => {
                setImportModalOpen(true);
                setImportResult(null);
              }}
              className="gap-2 shadow-xs text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>Import Attendance (Excel/CSV)</span>
            </Button>
            <Button onClick={() => openLogModal()} className="gap-2 shadow-sm text-xs">
              <PlusCircle className="size-4" />
              <span>Log Manual Attendance</span>
            </Button>
          </div>
        )}
      </div>

      {/* Policy Info Banner */}
      {policy && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/[0.03] text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <Clock className="size-3.5" />
            </div>
            <div>
              <span className="font-bold text-foreground">
                Work Hours Policy: {policy.policy_name}
              </span>
              <span className="text-muted-foreground ml-2">
                • Standard {policy.expected_daily_hours} hrs/day
              </span>
              <span className="text-muted-foreground ml-2">
                • Active Weekdays: {policy.working_days?.join(", ") || "Sun, Mon, Tue, Wed, Thu"}
              </span>
            </div>
            {policy.enable_deficit_deduction ? (
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20">
                Deficit Deductions Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Standard Tracking
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground italic">
            Working hours, overtime, late penalties & deficit hours are auto-calculated adhering to this policy.
          </span>
        </div>
      )}

      {/* KPI Cards (6 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Records
            </span>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {summary?.total || 0}
            </div>
            <p className="text-[10px] text-muted-foreground">Shifts in period</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Present
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              {summary?.present || 0}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">Attended shifts</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Late Arrivals
            </span>
            <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
              {summary?.late || 0}
            </div>
            <p className="text-[10px] text-muted-foreground">Checked in past grace</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Absent / Missed
            </span>
            <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
              {summary?.absent || 0}
            </div>
            <p className="text-[10px] text-rose-600 font-medium">Unexcused absence</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Overtime Hours
            </span>
            <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
              {summary?.overtime_hours ? `${summary.overtime_hours}h` : "0h"}
            </div>
            <p className="text-[10px] text-blue-600 font-medium">Extra hours logged</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card border-rose-500/20 bg-rose-500/[0.02]">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Deficit Hours
            </span>
            <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
              {summary?.deficit_hours ? `${summary.deficit_hours}h` : "0h"}
            </div>
            <p className="text-[10px] text-rose-600 font-medium">Under-worked deficit</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Container */}
      <Card className="border shadow-2xs">
        {/* Filters and Controls */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Controls: Time Range & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Time Range Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Range:</span>
                <Select value={timeRange} onValueChange={(val) => setTimeRange(val)}>
                  <SelectTrigger className="w-36 h-8 text-xs font-medium">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="this_month">This Month (Initial)</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                    <SelectItem value="all_time">All History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range Picker */}
              {timeRange === "custom" && (
                <div className="flex items-center gap-1.5 border rounded-md px-2.5 py-1 bg-background text-xs">
                  <span className="text-muted-foreground text-[11px]">From:</span>
                  <input
                    type="date"
                    className="bg-transparent text-xs outline-hidden text-foreground"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-muted-foreground text-[11px]">To:</span>
                  <input
                    type="date"
                    className="bg-transparent text-xs outline-hidden text-foreground"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
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

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>

              {/* Multi-Column Sorting */}
              <Select
                value={`${sortBy}_${sortOrder}`}
                onValueChange={(val) => {
                  const parts = val.split("_");
                  const order = parts.pop()!;
                  const field = parts.join("_");
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger className="w-48 h-8 text-xs font-medium">
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown className="size-3 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="date_desc">Date: Newest First</SelectItem>
                  <SelectItem value="date_asc">Date: Oldest First</SelectItem>
                  <SelectItem value="working_hours_desc">Working Hours: High to Low</SelectItem>
                  <SelectItem value="working_hours_asc">Working Hours: Low to High</SelectItem>
                  <SelectItem value="overtime_hours_desc">Overtime: High to Low</SelectItem>
                  <SelectItem value="late_minutes_desc">Late Minutes: High to Low</SelectItem>
                  <SelectItem value="deficit_hours_desc">Deficit Hours: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Box */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, ID..."
                  className="pl-8 text-xs h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Reset to This Month button */}
              {(timeRange !== "this_month" || departmentFilter !== "all" || statusFilter !== "all" || searchQuery || sortBy !== "date" || sortOrder !== "desc") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                  onClick={() => {
                    setTimeRange("this_month");
                    setDepartmentFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                    setSortBy("date");
                    setSortOrder("desc");
                  }}
                  title="Reset filters to current month"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            {/* Right Controls: Actions */}
            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              {canManageAttendance && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    onClick={() => {
                      setImportModalOpen(true);
                      setImportResult(null);
                    }}
                  >
                    <FileSpreadsheet className="size-3.5 text-emerald-600" />
                    Import Excel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs bg-primary"
                    onClick={() => openLogModal()}
                  >
                    <PlusCircle className="size-3.5" />
                    Log Attendance
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleExportCSV}
              >
                <Download className="size-3.5" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <CardContent className="p-0 border-t">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Employee</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">Check-In</th>
                  <th className="py-3 px-4 text-left">Check-Out</th>
                  <th className="py-3 px-4 text-left">Working Hours</th>
                  <th className="py-3 px-4 text-left">Overtime</th>
                  <th className="py-3 px-4 text-left">Late Minutes</th>
                  <th className="py-3 px-4 text-left">Deficit Hours</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                  {canManageAttendance && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={canManageAttendance ? 12 : 11} className="py-12 text-center text-muted-foreground">
                      <Clock className="size-6 animate-spin mx-auto text-primary mb-2" />
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredAttendances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManageAttendance ? 12 : 11}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No attendance records found for selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((att) => {
                    const statusBadgeColors: Record<string, string> = {
                      Present: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
                      Late: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                      Absent: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
                      "Half Day": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
                      "On Leave": "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
                      Holiday: "bg-muted text-muted-foreground",
                    };

                    const dateObj = new Date(att.date);
                    const dayOfWeek = isNaN(dateObj.getTime())
                      ? ""
                      : dateObj.toLocaleDateString("en-US", { weekday: "short" });

                    const isNonWorkingDay =
                      policy?.working_days &&
                      policy.working_days.length > 0 &&
                      !policy.working_days.some((d) => d.toLowerCase().slice(0, 3) === dayOfWeek.toLowerCase().slice(0, 3));

                    const hasDeficit = Number(att.deficit_hours || 0) > 0;

                    return (
                      <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                        {/* Date with day of week */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-semibold text-foreground">{att.date}</span>
                            {dayOfWeek && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${
                                  isNonWorkingDay
                                    ? "bg-muted text-muted-foreground border-dashed"
                                    : "bg-primary/5 text-primary border-primary/20"
                                }`}
                              >
                                {dayOfWeek}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Employee */}
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

                        {/* Department & Designation */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground block">
                            {att.user?.employee_detail?.department?.name || "Unassigned"}
                          </span>
                          {att.user?.employee_detail?.designation?.title && (
                            <span className="text-[10px] text-muted-foreground block">
                              {att.user.employee_detail.designation.title}
                            </span>
                          )}
                        </td>

                        {/* Check-In */}
                        <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                          {att.check_in ? att.check_in.slice(0, 5) : "—"}
                        </td>

                        {/* Check-Out */}
                        <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                          {att.check_out ? att.check_out.slice(0, 5) : "—"}
                        </td>

                        {/* Working Hours */}
                        <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                          {att.working_hours ? `${att.working_hours}h` : "—"}
                        </td>

                        {/* Overtime */}
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          {att.overtime_hours > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              +{att.overtime_hours}h
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0h</span>
                          )}
                        </td>

                        {/* Late Minutes */}
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          {att.late_minutes > 0 ? (
                            <span className="text-amber-600 font-semibold">{att.late_minutes}m</span>
                          ) : (
                            <span className="text-muted-foreground">0m</span>
                          )}
                        </td>

                        {/* Deficit Hours (Policy shortfall) */}
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          {hasDeficit ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-bold px-1.5 py-0.5"
                            >
                              -{att.deficit_hours}h Deficit
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0h</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-2 py-0.5 ${
                              statusBadgeColors[att.status] || "bg-muted"
                            }`}
                          >
                            {att.status}
                          </Badge>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4 text-muted-foreground truncate max-w-[150px]" title={att.notes || ""}>
                          {att.notes || "—"}
                        </td>

                        {/* Actions */}
                        {canManageAttendance && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0"
                              onClick={() => openLogModal(att)}
                              title="Edit Attendance"
                            >
                              <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* LOG / EDIT ATTENDANCE DIALOG (Only accessible when canManageAttendance is true) */}
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

      {/* BULK EXCEL / CSV IMPORT DIALOG */}
      <Dialog open={importModalOpen} onOpenChange={(open) => { if (!open) resetImportModal(); else setImportModalOpen(true); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="size-5 text-emerald-600" />
              <span>Bulk Attendance Excel / CSV Import</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload biometric device logs or external timesheets in bulk (.xlsx, .xls, or .csv).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Template download strip */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
              <div className="space-y-0.5">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs">Need the right format?</p>
                <p className="text-muted-foreground text-[11px]">Download our sample pre-formatted template with guidance columns.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSampleTemplate}
                className="gap-1.5 text-xs bg-background shrink-0 border-emerald-600/30 text-emerald-700 dark:text-emerald-300"
              >
                <Download className="size-3.5" />
                Download Template
              </Button>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/60 hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="size-11 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <UploadCloud className="size-6" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-xs text-foreground">
                  {importFile ? importFile.name : "Click to select or drag and drop your Excel or CSV file"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {importFile
                    ? `${(importFile.size / 1024).toFixed(1)} KB • ${parsedRows.length} rows detected`
                    : "Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)"}
                </p>
              </div>
            </div>

            {/* Import Results Summary if available */}
            {importResult && (
              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                  <FileCheck className="size-4 text-emerald-600" />
                  <span>Import Completed</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-base block">
                      {importResult.imported}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">New Created</span>
                  </div>
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40">
                    <span className="font-extrabold text-blue-700 dark:text-blue-300 text-base block">
                      {importResult.updated}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">Updated Existing</span>
                  </div>
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40">
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 text-base block">
                      {importResult.skipped}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">Skipped / Failed</span>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded border border-rose-200 dark:border-rose-900/40">
                    {importResult.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && !importResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Preview Data (First {Math.min(parsedRows.length, 5)} of {parsedRows.length} rows):
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {parsedRows.length} Records Ready
                  </Badge>
                </div>

                <div className="overflow-x-auto max-h-56 rounded-md border text-[11px]">
                  <table className="w-full">
                    <thead className="bg-muted/60 border-b font-semibold text-muted-foreground sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-left">#</th>
                        <th className="py-2 px-3 text-left">Employee ID</th>
                        <th className="py-2 px-3 text-left">Date</th>
                        <th className="py-2 px-3 text-left">Check In</th>
                        <th className="py-2 px-3 text-left">Check Out</th>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-1.5 px-3 text-muted-foreground">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-foreground">
                            {row.employee_id || row.emp_id || row.user_id || row.phone || row.email || row.name || "—"}
                          </td>
                          <td className="py-1.5 px-3">{row.date || row.attendance_date || "—"}</td>
                          <td className="py-1.5 px-3">{row.check_in || row.checkin || row.in_time || "—"}</td>
                          <td className="py-1.5 px-3">{row.check_out || row.checkout || row.out_time || "—"}</td>
                          <td className="py-1.5 px-3">{row.status || "Auto"}</td>
                          <td className="py-1.5 px-3 text-muted-foreground truncate max-w-[120px]">
                            {row.notes || row.note || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded border">
                  <AlertCircle className="size-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    Employees are matched automatically by Employee ID, Phone, Email, or Full Name. Working hours, overtime, and late minutes will be automatically calculated if Check-In and Check-Out are provided.
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={resetImportModal}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button
                type="button"
                size="sm"
                disabled={!parsedRows.length || isImporting}
                onClick={handleConfirmImport}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Upload className="size-3.5" />
                {isImporting ? "Importing Data..." : `Confirm & Import (${parsedRows.length} Rows)`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
