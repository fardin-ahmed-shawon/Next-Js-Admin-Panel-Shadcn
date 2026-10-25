"use client";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useWorkHourPolicy, saveWorkHourPolicy, type WorkHourPolicy } from "@/hooks/useHrm";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(id => ({id, label:id}));
export function WorkHourPolicyEditor({ deductionsOnly = false }: { deductionsOnly?: boolean }) {
  const [departmentId, setDepartmentId] = React.useState("all");
  const { policy, departments, loading, error, refetch } = useWorkHourPolicy(departmentId);
  const [policyForm, setPolicyForm] = React.useState<Partial<WorkHourPolicy> & { recalculate_unpaid: boolean }>({ recalculate_unpaid: true });
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if(policy) setPolicyForm({...policy, enable_deficit_deduction: !!policy.enable_deficit_deduction && !policy.late_deduction_enabled, id: (policy.department_id || null) === (departmentId === "all" ? null : Number(departmentId)) ? policy.id : undefined, department_id: departmentId === "all" ? null : Number(departmentId), shift_start: policy.shift_start?.slice(0,5) || "09:00", recalculate_unpaid: true}); }, [policy, departmentId]);
  const toggleWeekday = (day: string) => setPolicyForm(form => ({ ...form, working_days: form.working_days?.includes(day) ? form.working_days.filter(value => value !== day) : [...form.working_days || [], day] }));
  async function save() { setSaving(true); try { await saveWorkHourPolicy(policyForm); toast.success("Work hour policy saved"); await refetch(); } catch(error) { toast.error(error instanceof Error ? error.message : "Unable to save policy"); } finally { setSaving(false); } }
  if(error) return <p role="alert">Unable to load policy. <Button onClick={() => refetch()}>Retry</Button></p>;
  if (deductionsOnly) return <div className="rounded-xl border bg-card p-4 space-y-4">
    <div><h2 className="text-lg font-semibold">Deduction Rules</h2><p className="text-sm text-muted-foreground">Department policy overrides the company-wide default. Choose one deduction mode. Turn off the active mode to enable the other; both may be off.</p></div>
    <select aria-label="Deduction rule department" className="h-9 rounded-md border bg-background px-3" value={departmentId} onChange={e => setDepartmentId(e.target.value)}><option value="all">All Departments (Default)</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
    {loading ? <div className="h-28 animate-pulse bg-muted rounded" /> : <>
            {/* Deficit Deduction Toggle & Absent Handling */}
            <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground text-xs">Enable Under-Worked Hour Deduction</div>
                  <div className="text-[11px] text-muted-foreground">
                    If actual attended hours fall short of expected hours, deduct: Deficit Hours × Hourly Rate.
                  </div>
                </div>
                <Switch
                  aria-label="Enable Under-Worked Hour Deduction"
                  disabled={!!policyForm.late_deduction_enabled}
                  checked={policyForm.enable_deficit_deduction ?? false}
                  onCheckedChange={(checked) =>
                    setPolicyForm({ ...policyForm, enable_deficit_deduction: checked, ...(checked ? { late_deduction_enabled: false } : {}) })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground text-xs">Absent Days Treatment</div>
                  <div className="text-[11px] text-muted-foreground">
                    "Hour Deficit Only" avoids duplicate penalties by deducting all missing hours via the hourly rate.
                  </div>
                </div>
                <span className="text-xs font-semibold">Hour Deficit Only (Unified)</span>
              </div>
            </div>

    <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
    <div className="flex items-center justify-between gap-4"><Label htmlFor="late-rule-enabled">Late attendance deduction</Label><Switch id="late-rule-enabled" disabled={!!policyForm.enable_deficit_deduction} checked={policyForm.late_deduction_enabled ?? false} onCheckedChange={value => setPolicyForm({ ...policyForm, late_deduction_enabled: value, ...(value ? { enable_deficit_deduction: false } : {}) })} /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="late-count">Every number of late days</Label><Input id="late-count" type="number" min={1} max={31} value={policyForm.late_days_threshold ?? 3} onChange={e => setPolicyForm({ ...policyForm, late_days_threshold: Number(e.target.value) })} /></div><div className="space-y-2"><Label htmlFor="late-pay-days">Deduct days of salary</Label><Input id="late-pay-days" type="number" min={0.25} max={31} step={0.25} value={policyForm.late_deduction_days ?? 0.5} onChange={e => setPolicyForm({ ...policyForm, late_deduction_days: Number(e.target.value) })} /></div></div>
    <p className="text-xs text-muted-foreground">Daily pay = expected daily hours × hourly working rate. Only check-ins after daily grace count as late. Approved leave and holidays are excluded. Counts reset each month.</p>
    </div>
    <div className="flex justify-end"><Button disabled={saving || !policyForm.policy_name} onClick={save}>{saving ? "Saving…" : "Save & Apply Rule"}</Button></div></>}
  </div>;
  return <div className="rounded-xl border bg-card"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="text-lg font-semibold">Work Hour Policy</h2><p className="text-xs text-muted-foreground">Office hours, grace periods and hourly rate calculation.</p></div><select aria-label="Load department policy" className="h-9 rounded-md border bg-background px-3" value={departmentId} onChange={event => setDepartmentId(event.target.value)}><option value="all">Company-wide policy</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}</select></div>
  {loading ? <div className="m-4 h-60 animate-pulse rounded bg-muted" /> : <>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Policy Name & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Policy Name</Label>
                <Input
                  value={policyForm.policy_name}
                  onChange={(e) => setPolicyForm({ ...policyForm, policy_name: e.target.value })}
                  placeholder="e.g. Standard Work Policy"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Department</Label>
                <Select
                  value={policyForm.department_id ? String(policyForm.department_id) : "global"}
                  onValueChange={(val) =>
                    setPolicyForm({
                      ...policyForm,
                      id: undefined,
                      department_id: val === "global" ? null : Number(val),
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Company-Wide (Global)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global" className="text-xs font-semibold">
                      Company-Wide Default (All Departments)
                    </SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)} className="text-xs">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="shift-start">Office start time</Label><Input id="shift-start" type="time" value={policyForm.shift_start || "09:00"} onChange={e => setPolicyForm({ ...policyForm, shift_start: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="daily-grace">Daily late grace (minutes)</Label><Input id="daily-grace" type="number" min={0} max={240} value={policyForm.late_grace_minutes ?? 15} onChange={e => setPolicyForm({ ...policyForm, late_grace_minutes: Number(e.target.value) })} /></div>
            </div>
            <p className="text-xs text-muted-foreground">Shift end = start time + expected daily hours. Arrival within the daily grace is Present; arrival after it is Late. Approved leave and holidays never incur absence deductions.</p>
            {/* Expected Daily Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expected Work Hours / Day</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    value={policyForm.expected_daily_hours}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, expected_daily_hours: parseFloat(e.target.value) || 8 })
                    }
                    className="h-8 text-xs pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-muted-foreground font-semibold">
                    hrs
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Calculation Basis</Label>
                <Select
                  value={policyForm.calculation_basis}
                  onValueChange={(val: any) => setPolicyForm({ ...policyForm, calculation_basis: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic_salary" className="text-xs">
                      Basic Salary
                    </SelectItem>
                    <SelectItem value="gross_salary" className="text-xs">
                      Gross Salary
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

<div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hourly Rate Days</Label>
                <Select value={policyForm.hourly_rate_basis || "weekdays"} onValueChange={(value: "weekdays" | "fixed_days") => setPolicyForm({ ...policyForm, hourly_rate_basis: value, fixed_working_days: policyForm.fixed_working_days || 30 })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="weekdays">Only Weekdays</SelectItem><SelectItem value="fixed_days">Fixed Days</SelectItem></SelectContent>
                </Select>
                {policyForm.hourly_rate_basis === "fixed_days" && <Input aria-label="Fixed working days" type="number" min={1} max={31} value={policyForm.fixed_working_days ?? 30} onChange={e => setPolicyForm({ ...policyForm, fixed_working_days: Number(e.target.value) })} />}
              </div>
            </div>

            {/* Working Weekdays Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Active Working Weekdays</Label>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {WEEKDAYS.map((day) => {
                  const isSelected = policyForm.working_days?.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleWeekday(day.id)}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="text-[11px]">{day.id}</div>
                      <div className="text-[9px] font-normal opacity-80">{day.label.substring(0, 3)}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Selected {policyForm.working_days?.length || 0} days per week. Monthly grace = working weekdays in the month × {policyForm.late_grace_minutes ?? 15} minutes, applied once to total deficit. Hourly rate = salary ÷ (selected rate days × daily hours). Holidays and approved leave remain exempt from deficits.
              </p>
            </div>

            {/* Recalculate unpaid salaries checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="recalc"
                checked={policyForm.recalculate_unpaid}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, recalculate_unpaid: e.target.checked })
                }
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <label htmlFor="recalc" className="text-xs font-medium cursor-pointer text-foreground">
                Automatically recalculate all unpaid salaries for current and active months with this rule
              </label>
            </div>
          </div>


  <div className="flex justify-end border-t p-4"><Button disabled={saving || !policyForm.policy_name || !policyForm.working_days?.length} onClick={save}>{saving ? "Saving…" : "Save & Apply Policy"}</Button></div></>}
  </div>;
}
