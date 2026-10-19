"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/hooks/useRoles";
import { hrmApiRequest, useHrmCalendar } from "@/hooks/useHrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmployeePicker, type PickerEmployee } from "./employee-picker";
import { HrmSummary } from "./hrm-summary";
import styles from "./hrm-page.module.css";

type Warning = {
  id: number; user_id: number; subject: string; description: string; warning_date: string; severity: string;
  user?: { id: number; full_name: string; employee_detail?: { department?: { name: string } } };
  issuer?: { full_name: string };
};
const emptyForm = { user_id: "", subject: "", description: "", warning_date: "", severity: "written" };
const selectClass = "h-9 rounded-md border bg-background px-3 text-sm";

export function HrmWarnings() {
  const { user } = useAuth();
  const canManage = hasModuleAccess(user, "hrm_manage_notices");
  const { data, loading, error, refetch } = useHrmCalendar("warnings");
  const { data: recipients } = useHrmCalendar(canManage ? "notices/recipients" : "departments");
  const { mutate } = useSWRConfig();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("");
  const [employee, setEmployee] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const warnings = (data || []) as Warning[];
  const available = (recipients?.employees || []) as PickerEmployee[];
  const employees = Array.from(new Map([...available, ...warnings.flatMap(row => row.user ? [row.user] : [])].map(person => [person.id, person])).values());
  const rows = warnings.filter(row => (!severity || row.severity === severity) && (!employee || String(row.user_id) === employee)
    && [row.subject, row.description, row.user?.full_name, row.user?.employee_detail?.department?.name].join(" ").toLowerCase().includes(query.toLowerCase()));

  async function refresh() {
    await refetch();
    await mutate(key => typeof key === "string" && key.includes("/self-service"));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.user_id) { setFormError("Select an employee from the suggestions."); return; }
    setSaving(true); setFormError("");
    try {
      const response = await hrmApiRequest(editing ? "warnings/" + editing : "warnings", {
        method: editing ? "PUT" : "POST", body: JSON.stringify({ ...form, user_id: Number(form.user_id) }),
      });
      toast.success(response.message); setOpen(false); await refresh();
    } catch (error) { setFormError(error instanceof Error ? error.message : "Unable to save warning"); }
    finally { setSaving(false); }
  }

  async function remove(row: Warning) {
    if (!window.confirm("Delete warning: " + row.subject + "?")) return;
    setSaving(true);
    try { await hrmApiRequest("warnings/" + row.id, { method: "DELETE" }); toast.success("Warning deleted"); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete warning"); }
    finally { setSaving(false); }
  }

  return <div className={styles.page}>
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl">Employee Warnings</h2><p className="text-sm text-muted-foreground">Assigned employees see these records in Self-Service → Warnings / Disciplinary.</p></div>
      {canManage && <Button onClick={() => { setEditing(null); setForm(emptyForm); setFormError(""); setOpen(true); }}><Plus className="mr-2 size-4" />Add Warning</Button>}
    </div>
    <HrmSummary loading={loading} items={[
      { label: "Total Warnings", value: rows.length, hint: "Matching filters" },
      ...["verbal", "written", "final"].map(level => ({ label: level.charAt(0).toUpperCase() + level.slice(1), value: rows.filter(row => row.severity === level).length, hint: "Warnings" })),
    ]} />
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex flex-wrap gap-3 border-b p-4">
        <Input aria-label="Search warnings" placeholder="Search employee, subject or department…" value={query} onChange={e => setQuery(e.target.value)} className="max-w-sm" />
        <select className={selectClass} aria-label="Filter employee" value={employee} onChange={e => setEmployee(e.target.value)}><option value="">All employees</option>{employees.map(person => <option key={person.id} value={person.id}>{person.full_name}</option>)}</select>
        <select className={selectClass} aria-label="Filter severity" value={severity} onChange={e => setSeverity(e.target.value)}><option value="">All severity levels</option>{["verbal", "written", "final"].map(level => <option key={level} value={level}>{level}</option>)}</select>
      </div>
      {loading ? <div className="space-y-3 p-6" aria-label="Loading warnings">{[1,2,3].map(key => <div key={key} className="h-12 animate-pulse rounded bg-muted" />)}</div>
        : error ? <div className="p-6" role="alert">Unable to load warnings. <Button variant="outline" onClick={() => refetch()}>Retry</Button></div>
        : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>SL No.</th><th>Employee</th><th>Warning</th><th>Severity</th><th>Date</th><th>Issued by</th><th>Actions</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={row.id}><td>{index + 1}</td><td>{row.user?.full_name}<p className="text-xs text-muted-foreground">{row.user?.employee_detail?.department?.name}</p></td><td><p className="font-medium">{row.subject}</p><p className="max-w-md whitespace-pre-wrap text-muted-foreground">{row.description}</p></td><td><Badge variant={row.severity === "final" ? "destructive" : "secondary"}>{row.severity}</Badge></td><td className="whitespace-nowrap">{row.warning_date.slice(0,10)}</td><td>{row.issuer?.full_name || "—"}</td><td>{canManage && <div className="flex"><Button variant="ghost" size="icon" aria-label={"Edit " + row.subject} disabled={saving} onClick={() => { setEditing(row.id); setForm({ user_id: String(row.user_id), subject: row.subject, description: row.description, warning_date: row.warning_date.slice(0,10), severity: row.severity }); setFormError(""); setOpen(true); }}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={"Delete " + row.subject} disabled={saving} onClick={() => remove(row)}><Trash2 className="size-4" /></Button></div>}</td></tr>)}
          {!rows.length && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No warnings found.</td></tr>}</tbody></table></div>}
    </div>
    <Dialog open={open} onOpenChange={value => { if (!saving) setOpen(value); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle className="text-2xl font-bold">{editing ? "Edit Warning" : "Add Warning"}</DialogTitle><DialogDescription>This warning appears in the selected employee’s disciplinary records and the management list.</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <EmployeePicker key={String(editing)} employees={available.length ? available : employees} value={form.user_id} onChange={value => setForm({ ...form, user_id: value })} />
        <div className="space-y-2"><Label htmlFor="warning-subject">Subject</Label><Input id="warning-subject" required maxLength={200} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="warning-description">Description</Label><Textarea id="warning-description" required maxLength={10000} rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="warning-date">Warning date</Label><Input id="warning-date" type="date" required value={form.warning_date} onChange={e => setForm({ ...form, warning_date: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="warning-severity">Severity</Label><select id="warning-severity" className={selectClass + " w-full"} value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>{["verbal", "written", "final"].map(level => <option key={level} value={level}>{level}</option>)}</select></div></div>
        {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Issue warning"}</Button></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}
