"use client";

import { useState } from "react";
import { Plus, Search, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/hooks/useRoles";
import { hrmApiRequest, useHrmCalendar, useHrmDepartments } from "@/hooks/useHrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  user?: { full_name: string; employee_detail?: { department?: { name: string } } };
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
  date: "",
  department_ids: [] as number[],
  user_id: "",
  leave_type: "Annual",
  start_date: "",
  end_date: "",
  reason: "",
};

export function HrmCalendarPage({ section }: { section: Section }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useHrmCalendar(section);
  const { departments } = useHrmDepartments();
  const canManage = hasModuleAccess(user, `hrm_manage_${section}`);
  const canApprove = hasModuleAccess(user, "hrm_approve_leaves");
  const { data: visibility } = useHrmCalendar(section === "leaves" ? "visibility/leaves" : "departments");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [formError, setFormError] = useState("");
  const rows = ((data || []) as Row[]).filter(
    (row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()) && (!filter || row.status === filter),
  );
  const employees = (visibility?.employees || []) as { id: number; full_name: string }[];
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
    const body =
      section === "notices"
        ? {
            title: form.title,
            content: form.content,
            priority: form.priority,
            target_department_id: form.target_department_id ? Number(form.target_department_id) : null,
          }
        : section === "holidays"
          ? { title: form.title, date: form.date, department_ids: form.department_ids }
          : {
              user_id: form.user_id ? Number(form.user_id) : user?.id,
              leave_type: form.leave_type,
              start_date: form.start_date,
              end_date: form.end_date,
              reason: form.reason,
            };
    if (await action(section, "POST", body)) {
      setOpen(false);
      setForm(initialForm);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{labels[section]}</h1>
          <p className="text-sm text-muted-foreground">
            {section === "notices"
              ? "Publish announcements for all employees or a department."
              : section === "leaves"
                ? "Employee leave requests, approvals and attendance exemptions."
                : "Company and department holidays are excluded from attendance deductions."}
          </p>
        </div>
        {(canManage || section === "leaves") && (
          <Button
            onClick={() => {
              setForm(initialForm);
              setFormError("");
              setOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            {section === "notices" ? "Add Notice" : section === "holidays" ? "Add Holiday" : "Request Leave"}
          </Button>
        )}
      </div>
      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              aria-label="Search records"
              className="pl-9"
              placeholder="Search employee, department or details..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {section === "leaves" && (
            <select
              aria-label="Leave status"
              className={`${selectClass} max-w-48`}
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
                  <th className="p-4">{section === "leaves" ? "Employee" : "Title"}</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">{section === "notices" ? "Audience" : "Date / Period"}</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="p-4 font-medium">
                      {section === "leaves" ? row.user?.full_name : row.title}
                      {section === "leaves" && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.user?.employee_detail?.department?.name}
                        </p>
                      )}
                    </td>
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
                        row.department?.name || "All departments"
                      ) : section === "holidays" ? (
                        row.date
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {section === "notices" ? "Add Notice" : section === "holidays" ? "Add Holiday" : "Request Leave"}
            </SheetTitle>
            <SheetDescription>
              {section === "leaves"
                ? "Approved leave automatically exempts the employee from attendance deductions for these days."
                : "Choose the departments this applies to."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={submit} className="space-y-5 p-6">
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
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    className={selectClass}
                    value={form.target_department_id}
                    onChange={(e) => setForm({ ...form, target_department_id: e.target.value })}
                  >
                    <option value="">All departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {section === "holidays" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="holiday-date">Holiday date</Label>
                  <Input
                    id="holiday-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
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
              {saving ? "Saving…" : section === "leaves" ? "Submit for approval" : "Save"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
