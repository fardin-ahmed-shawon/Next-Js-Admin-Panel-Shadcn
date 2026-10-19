"use client";
import hrmStyles from "./hrm-page.module.css";
import { EmployeePicker, type PickerEmployee } from "./employee-picker";
import { HrmSummary } from "./hrm-summary";

import { useState } from "react";
import { Plus, Search, Trash2, CalendarDays, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/hooks/useRoles";
import { hrmApiRequest, useHrmCalendar, useHrmDepartments } from "@/hooks/useHrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type Section = "notices" | "leaves" | "holidays";
type Row = {
  id: number;
  title?: string;
  content?: string;
  priority?: string;
  date?: string;
  department_ids?: number[];
  department?: { name: string };
  target_department_id?: number;
  recipient?: { id: number; full_name: string };
  target_user_id?: number;
  created_at?: string;
  user_id?: number;
  user?: { id: number; full_name: string; employee_detail?: { department_id?: number; designation_id?: number; department?: { name: string }; designation?: { title: string } } };
  approver?: { full_name: string };
  leave_type?: string;
  reason?: string;
  start_date?: string;
  end_date?: string;
  days?: number;
  status?: string;
};
const labels = { notices: "Notice Board", leaves: "Leave Management", holidays: "Holiday Calendar" };
const selectClass = "h-10 w-full rounded-md border bg-background px-3 text-sm";
const initialForm = {
  title: "",
  content: "",
  priority: "medium",
  target_department_id: "",
  target_user_id: "",
  audience: "all",
  post_as_notice: false,
  date: "",
  department_ids: [] as number[],
  user_id: "",
  leave_type: "Annual",
  start_date: "",
  end_date: "",
  reason: "",
};

export function HrmCalendarPage({ section }: { section: Section }) {
  const Modal = section === "notices" ? Dialog : Sheet;
  const ModalContent = section === "notices" ? DialogContent : SheetContent;
  const ModalHeader = section === "notices" ? DialogHeader : SheetHeader;
  const ModalTitle = section === "notices" ? DialogTitle : SheetTitle;
  const ModalDescription = section === "notices" ? DialogDescription : SheetDescription;
  const { user } = useAuth();
  const { data, loading, error, refetch } = useHrmCalendar(section);
  const { departments } = useHrmDepartments();
  const canManage = hasModuleAccess(user, `hrm_manage_${section}`);
  const canApprove = hasModuleAccess(user, "hrm_approve_leaves");
  const { data: visibility } = useHrmCalendar(section === "leaves" ? "visibility/leaves" : section === "notices" && canManage ? "notices/recipients" : "departments");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("newest");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [formError, setFormError] = useState("");
  const employees = (visibility?.employees || []) as PickerEmployee[];
  const filterEmployees = Array.from(new Map([...employees, ...((data || []) as Row[])
    .flatMap(row => row.recipient ? [row.recipient] : row.user ? [row.user] : [])].map(employee => [employee.id, employee])).values());
  const designations = Array.from(new Map(((data || []) as Row[]).filter(row => row.user?.employee_detail?.designation_id)
    .map(row => [row.user!.employee_detail!.designation_id!, row.user!.employee_detail!.designation?.title || "Designation"])).entries());
  function changePeriod(value: string) {
    setPeriod(value);
    if (value === "all") { setFromDate(""); setToDate(""); return; }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (value !== "daily") {
      start.setDate(1);
      start.setMonth(start.getMonth() - Number(value) + 1);
      end.setMonth(end.getMonth() + 1, 0);
    }
    const iso = (date: Date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    setFromDate(iso(start)); setToDate(iso(end));
  }
  const rows = ((data || []) as Row[]).filter(row => {
    if (!JSON.stringify(row).toLowerCase().includes(query.toLowerCase()) || (filter && row.status !== filter)) return false;
    if (section === "leaves") {
      const detail = row.user?.employee_detail;
      return (!departmentFilter || String(detail?.department_id) === departmentFilter)
        && (!designationFilter || String(detail?.designation_id) === designationFilter)
        && (!employeeFilter || String(row.user_id) === employeeFilter)
        && (!fromDate || (row.end_date || "").slice(0, 10) >= fromDate)
        && (!toDate || (row.start_date || "").slice(0, 10) <= toDate);
    }
    const date = (section === "notices" ? row.created_at : row.date)?.slice(0, 10) || "";
    if ((fromDate && (section === "holidays" ? row.end_date || date : date) < fromDate) || (toDate && (section === "holidays" ? row.start_date || date : date) > toDate)) return false;
    if (employeeFilter && String(row.target_user_id) !== employeeFilter) return false;
    if (departmentFilter) {
      const ids = section === "holidays" ? row.department_ids || [] : row.target_department_id ? [row.target_department_id] : [];
      if (departmentFilter === "company") {
        if (ids.length || row.target_user_id) return false;
      } else if (!ids.includes(Number(departmentFilter))) return false;
    }
    return true;
  }).sort((a, b) => {
    if (section === "leaves") {
      const value = (row: Row) => sort === "employee" ? row.user?.full_name : sort === "department" ? row.user?.employee_detail?.department?.name : sort === "designation" ? row.user?.employee_detail?.designation?.title : row.start_date;
      return (sort === "newest" ? -1 : 1) * ((value(a) || "").localeCompare(value(b) || "") || a.id - b.id);
    }
    if (sort === "title") return (a.title || "").localeCompare(b.title || "") || a.id - b.id;
    if (sort === "department") return (a.department?.name || "").localeCompare(b.department?.name || "") || a.id - b.id;
    if (sort === "employee") return (a.recipient?.full_name || "").localeCompare(b.recipient?.full_name || "") || a.id - b.id;
    const left = (section === "holidays" ? a.date : a.created_at) || "";
    const right = (section === "holidays" ? b.date : b.created_at) || "";
    return (sort === "oldest" ? 1 : -1) * (left.localeCompare(right) || a.id - b.id);
  });
  const departmentNames = (ids?: number[]) =>
    !ids?.length
      ? "All departments"
      : departments
          .filter((d) => ids.includes(d.id))
          .map((d) => d.name)
          .join(", ");

  async function action(endpoint: string, method: string, body?: object) {
    setSaving(true);
    try {
      const result = await hrmApiRequest(endpoint, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      toast.success(result.message || "Saved");
      await refetch();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save";
      setFormError(message);
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    if (section === "notices" && form.audience === "employee" && !form.target_user_id) { setFormError("Select an employee from the suggestions."); return; }
    const body =
      section === "notices"
        ? {
            title: form.title,
            content: form.content,
            priority: form.priority,
            target_department_id: form.audience === "department" ? Number(form.target_department_id) : null,
            target_user_id: form.audience === "employee" ? Number(form.target_user_id) : null,
          }
        : section === "holidays"
          ? { title: form.title, start_date: form.start_date, end_date: form.end_date, department_ids: form.department_ids, post_as_notice: form.post_as_notice }
          : {
              user_id: form.user_id ? Number(form.user_id) : user?.id,
              leave_type: form.leave_type,
              start_date: form.start_date,
              end_date: form.end_date,
              reason: form.reason,
            };
    if (await action(editingId ? section + "/" + editingId + (section === "leaves" ? "/details" : "") : section, editingId ? "PUT" : "POST", body)) {
      setOpen(false);
      setForm(initialForm);
      setEditingId(null);
    }
  }

  return (
    <div className={hrmStyles.page}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{labels[section]}</h1>
          <p className="text-sm text-muted-foreground">
            {section === "notices"
              ? "Publish announcements for all employees, a department or an individual employee."
              : section === "leaves"
                ? "Employee leave requests, approvals and attendance exemptions."
                : "Company and department holidays are excluded from attendance deductions."}
          </p>
        </div>
        {(canManage || section === "leaves") && (
          <Button
            onClick={() => {
              setForm(initialForm);
              setEditingId(null);
              setEmployeeSearch("");
              setFormError("");
              setOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            {section === "notices" ? "Add Notice" : section === "holidays" ? "Add Holiday" : "Request Leave"}
          </Button>
        )}
      </div>
      <HrmSummary loading={loading} items={section === "leaves" ? [
        { label: "Leave Requests", value: rows.length, hint: "Matching selected filters" },
        ...["pending", "approved", "rejected"].map(status => ({ label: status.charAt(0).toUpperCase() + status.slice(1), value: rows.filter(row => row.status === status).length, hint: "Matching leave requests" })),
      ] : section === "notices" ? [
        { label: "Total Notices", value: ((data || []) as Row[]).length, hint: "Visible announcements" },
        ...["high", "medium", "low"].map(priority => ({ label: priority.charAt(0).toUpperCase() + priority.slice(1) + " Priority", value: ((data || []) as Row[]).filter(row => row.priority === priority).length, hint: "Published notices" })),
      ] : [
        { label: "Total Holidays", value: ((data || []) as Row[]).length, hint: "Visible holiday entries" },
        { label: "Upcoming", value: ((data || []) as Row[]).filter(row => (row.end_date || row.date) && (row.end_date || row.date)!.slice(0,10) >= new Date().toLocaleDateString("en-CA")).length, hint: "Today and future dates" },
        { label: "Company Holidays", value: ((data || []) as Row[]).filter(row => !row.department_ids?.length).length, hint: "All departments" },
        { label: "Department Holidays", value: ((data || []) as Row[]).filter(row => row.department_ids?.length).length, hint: "Selected departments" },
      ]} />
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="px-4 pt-4"><p className="text-sm text-muted-foreground">{labels[section]}</p><p className="text-xl tabular-nums">{rows.length} records</p></div>
        <div className="flex flex-wrap items-end gap-3 border-b p-4">
          <div className="relative w-full sm:max-w-96 self-end">
            <Search className="absolute left-3 top-2 size-4 text-muted-foreground" />
            <Input
              aria-label="Search records"
              className="h-8 pl-9 text-xs"
              placeholder="Search employee, department or details..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {section !== "leaves" && <>
            <div className="space-y-1">
              <Label htmlFor="filter-department" className="text-xs">Department audience</Label>
              <select id="filter-department" className="h-8 w-44 rounded-md border bg-background px-2 text-xs" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                <option value="">All audiences</option><option value="company">Company-wide only</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {section === "notices" && <div className="space-y-1">
              <Label htmlFor="filter-employee" className="text-xs">Individual recipient</Label>
              <select id="filter-employee" className="h-8 w-44 rounded-md border bg-background px-2 text-xs" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
                <option value="">All recipients</option>
                {filterEmployees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>}
            <div className="space-y-1">
              <Label htmlFor="filter-from" className="text-xs">{section === "notices" ? "Published from" : "Holiday from"}</Label>
              <Input id="filter-from" type="date" className="h-8 w-36 text-xs" value={fromDate} max={toDate || undefined} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-to" className="text-xs">To date</Label>
              <Input id="filter-to" type="date" className="h-8 w-36 text-xs" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-sort" className="text-xs">Sort by</Label>
              <select id="filter-sort" className="h-8 w-40 rounded-md border bg-background px-2 text-xs" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option>
                {section === "notices" && <><option value="department">Department A–Z</option><option value="employee">Employee A–Z</option></>}
              </select>
            </div>
            <Button variant="outline" size="sm" className="self-end" onClick={() => { setQuery(""); setDepartmentFilter(""); setEmployeeFilter(""); setFromDate(""); setToDate(""); setSort("newest"); }}>Reset</Button>
          </>}
          {section === "leaves" && <>
            <select aria-label="Filter department" className="h-8 w-44 rounded-md border bg-background px-2 text-xs" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
              <option value="">All departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select aria-label="Filter designation" className="h-8 w-44 rounded-md border bg-background px-2 text-xs" value={designationFilter} onChange={e => setDesignationFilter(e.target.value)}>
              <option value="">All designations</option>{designations.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
            </select>
            <select aria-label="Filter employee" className="h-8 w-44 rounded-md border bg-background px-2 text-xs" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
              <option value="">All employees</option>{filterEmployees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
            <select aria-label="Time range" className="h-8 w-40 rounded-md border bg-background px-2 text-xs" value={period} onChange={e => changePeriod(e.target.value)}>
              <option value="all">All Time</option><option value="daily">Daily</option><option value="1">Monthly</option>
              <option value="2">2 Months</option><option value="4">4 Months</option><option value="6">6 Months</option><option value="12">Yearly</option>
            </select>
            <select aria-label="Sort leave report" className="h-8 w-44 rounded-md border bg-background px-2 text-xs" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Start date: newest</option><option value="oldest">Start date: oldest</option>
              <option value="employee">Employee A–Z</option><option value="department">Department A–Z</option><option value="designation">Designation A–Z</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => {setQuery("");setFilter("");setDepartmentFilter("");setDesignationFilter("");setEmployeeFilter("");setSort("newest");changePeriod("all");}}>Reset</Button>
            <p className="w-full text-xs text-muted-foreground">{fromDate ? "Leave dates overlapping " + fromDate + " to " + toDate + ". Multi-month ranges include the current calendar month." : "Showing all leave dates within your access."} {rows.reduce((total, row) => total + (row.days || 0), 0)} requested days across {new Set(rows.map(row => row.user_id)).size} employees.</p>
          </>}
          {section === "leaves" && (
            <select
              aria-label="Leave status"
              className="h-8 w-44 rounded-md border bg-background px-3 text-xs"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {["pending", "approved", "rejected"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          )}
        </div>
        {error && (
          <div role="alert" className="p-5 text-destructive">
            Unable to load records.{" "}
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {loading ? (
          <p className="p-8 text-muted-foreground">Loading…</p>
        ) : !error && !rows.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <CalendarDays className="mx-auto mb-3 size-8" />
            No records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-4">SL No.</th>
                  <th className="p-4">{section === "leaves" ? "Employee" : "Title"}</th>
                  {section === "leaves" && <><th className="p-4">Department</th><th className="p-4">Designation</th></>}
                  <th className="p-4">Details</th>
                  <th className="p-4">{section === "notices" ? "Audience" : "Date / Period"}</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="p-4 tabular-nums">{index + 1}</td>
                    <td className="p-4 font-medium">
                      {section === "leaves" ? row.user?.full_name : row.title}
                      {section === "leaves" && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.user?.employee_detail?.department?.name}
                        </p>
                      )}
                    </td>
                    {section === "leaves" && <><td className="p-4">{row.user?.employee_detail?.department?.name || "—"}</td><td className="p-4">{row.user?.employee_detail?.designation?.title || "—"}</td></>}
                    <td className="max-w-md whitespace-pre-wrap p-4">
                      {section === "notices" ? (
                        <>
                          <Badge variant="secondary">{row.priority}</Badge>
                          <p className="mt-2">{row.content}</p>
                        </>
                      ) : section === "leaves" ? (
                        <>
                          <Badge variant="outline">{row.status}</Badge>
                          <p className="mt-2">
                            {row.leave_type}: {row.reason}
                          </p>
                          {row.approver && (
                            <p className="text-xs text-muted-foreground">Reviewed by {row.approver.full_name}</p>
                          )}
                        </>
                      ) : (
                        departmentNames(row.department_ids)
                      )}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {section === "notices" ? (
                        <><span>{row.recipient?.full_name || row.department?.name || "All employees"}</span><p className="mt-1 text-xs text-muted-foreground">Published {row.created_at?.slice(0, 10)}</p></>
                      ) : section === "holidays" ? (
                        <>{row.start_date || row.date} – {row.end_date || row.date}<p className="text-xs text-muted-foreground">{row.days || 1} day(s)</p></>
                      ) : (
                        <>
                          {row.start_date?.slice(0, 10)} – {row.end_date?.slice(0, 10)}
                          <p className="text-muted-foreground">{row.days} day(s)</p>
                        </>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {section === "leaves" && canApprove && (
                          <>
                            {row.status !== "approved" && (
                              <Button
                                size="sm"
                                disabled={saving}
                                onClick={() => action(`leaves/${row.id}`, "PUT", { status: "approved" })}
                              >
                                Approve
                              </Button>
                            )}
                            {row.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={saving}
                                onClick={() => action(`leaves/${row.id}`, "PUT", { status: "rejected" })}
                              >
                                Reject
                              </Button>
                            )}
                          </>
                        )}
                        {(section === "holidays" && canManage || section === "leaves" && (canManage || row.user_id === user?.id && row.status === "pending")) && <Button variant="ghost" size="icon" aria-label="Edit record" disabled={saving}
                          onClick={() => {
                            setEditingId(row.id); setFormError(""); setEmployeeSearch("");
                            setForm({ ...initialForm, title: row.title || "", start_date: (row.start_date || row.date || "").slice(0,10),
                              end_date: (row.end_date || row.date || "").slice(0,10), department_ids: row.department_ids || [],
                              user_id: String(row.user_id || ""), leave_type: row.leave_type || "Annual", reason: row.reason || "" });
                            setOpen(true);
                          }}><Pencil className="size-4" /></Button>}
                        {section === "notices" && canManage && <Button variant="ghost" size="icon" aria-label={"Edit " + row.title} disabled={saving}
                          onClick={() => {
                            setEditingId(row.id);
                            setForm({ ...initialForm, title: row.title || "", content: row.content || "", priority: row.priority || "medium",
                              audience: row.target_user_id ? "employee" : row.target_department_id ? "department" : "all",
                              target_user_id: row.target_user_id ? String(row.target_user_id) : "",
                              target_department_id: row.target_department_id ? String(row.target_department_id) : "" });
                            setEmployeeSearch(""); setFormError(""); setOpen(true);
                          }}><Pencil className="size-4" /></Button>}
                        {section !== "leaves" && canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${row.title}`}
                            disabled={saving}
                            onClick={() => {
                              if (window.confirm(`Delete ${row.title}?`)) action(`${section}/${row.id}`, "DELETE");
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className={section === "notices" ? "max-h-[90dvh] overflow-y-auto sm:max-w-xl" : "w-full overflow-y-auto sm:max-w-xl"}>
          <ModalHeader>
            <ModalTitle className="text-2xl font-bold">
              {section === "notices" ? editingId ? "Edit Notice" : "Add Notice" : section === "holidays" ? editingId ? "Edit Holiday" : "Add Holiday" : editingId ? "Edit Leave" : "Request Leave"}
            </ModalTitle>
            <ModalDescription>
              {section === "leaves"
                ? editingId ? "Editing submits this leave for approval again. Attendance exemptions apply only after approval." : "Approved leave automatically exempts the employee from attendance deductions for these days."
                : section === "holidays" ? "Choose an inclusive date range and the departments this applies to." : "Choose who should receive this notice."}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={submit} className={section === "notices" ? "space-y-4" : "space-y-5 p-6"}>
            {section !== "leaves" && (
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            )}
            {section === "notices" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="content">Notice</Label>
                  <Textarea
                    id="content"
                    required
                    rows={6}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className={selectClass}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {["low", "medium", "high", "urgent"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Audience</Label>
                  <select id="audience" className={selectClass} value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value, target_department_id: "", target_user_id: "" })}>
                    <option value="all">All employees</option>
                    <option value="department">Department</option>
                    <option value="employee">Individual employee</option>
                  </select>
                </div>
                {form.audience === "department" && <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select id="department" required className={selectClass} value={form.target_department_id}
                    onChange={(e) => setForm({ ...form, target_department_id: e.target.value })}>
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>}
                {form.audience === "employee" && <EmployeePicker key={String(editingId)} employees={employees.length ? employees : filterEmployees} value={form.target_user_id} onChange={value => setForm({ ...form, target_user_id: value })} />}
              </>
            )}
            {section === "holidays" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="holiday-from">From date</Label>
                    <Input id="holiday-from" type="date" required value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value, end_date: form.end_date < e.target.value ? e.target.value : form.end_date })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="holiday-to">To date</Label>
                    <Input id="holiday-to" type="date" required min={form.start_date} value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                {hasModuleAccess(user, "hrm_manage_notices") && <div className="rounded-lg border p-4 space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={form.post_as_notice}
                      onChange={(e) => setForm({ ...form, post_as_notice: e.target.checked })} />
                    Post as notice
                  </label>
                  <p className="text-xs text-muted-foreground">Publish the holiday title and dates to the same departments selected below.</p>
                </div>}
                <fieldset className="space-y-3 rounded-lg border p-4">
                  <legend className="px-1 text-sm">Departments</legend>
                  <label className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!form.department_ids.length}
                      onChange={() => setForm({ ...form, department_ids: [] })}
                    />
                    All departments
                  </label>
                  {departments.map((d) => (
                    <label key={d.id} className="flex gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.department_ids.includes(d.id)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            department_ids: e.target.checked
                              ? [...form.department_ids, d.id]
                              : form.department_ids.filter((id) => id !== d.id),
                          })
                        }
                      />
                      {d.name}
                    </label>
                  ))}
                </fieldset>
              </>
            )}
            {section === "leaves" && (
              <>
                {canManage && (
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Input
                      aria-label="Search employees"
                      placeholder="Search employees"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />
                    <select
                      id="employee"
                      className={selectClass}
                      value={form.user_id}
                      onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    >
                      <option value="">Myself</option>
                      {employees
                        .filter((e) => e.full_name.toLowerCase().includes(employeeSearch.toLowerCase()))
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.full_name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave type</Label>
                  <Input
                    id="leave-type"
                    required
                    value={form.leave_type}
                    onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start date</Label>
                    <Input
                      id="start"
                      type="date"
                      required
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End date</Label>
                    <Input
                      id="end"
                      type="date"
                      min={form.start_date}
                      required
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    required
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </div>
              </>
            )}
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : section === "leaves" ? "Submit for approval" : editingId ? "Save changes" : "Save"}
            </Button>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
