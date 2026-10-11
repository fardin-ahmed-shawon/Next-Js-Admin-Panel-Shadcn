"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmployeeAssignmentPicker, type AssignmentEmployee } from "../orders/_components/employee-assignment-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchClient } from "@/lib/fetch-client";

type Employee = AssignmentEmployee & { status?: string };
type Pool = {
  enabled: boolean;
  employees: Employee[];
  priorities: { id: number; user_id: number; active: boolean | number; user?: Employee }[];
};
const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
async function request(url: string, options?: RequestInit) {
  const response = await fetchClient(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Unable to save automatic assignment settings");
  return result;
}

function WorkflowPool({ workflow }: { workflow: "packing" | "returns" }) {
  const endpoint = base + "auto-order-workflows/" + workflow;
  const { data, error, isLoading, mutate } = useSWR<{ data: Pool }>(endpoint, request);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const label = workflow === "packing" ? "Packing By" : "Return Confirmed By";
  const pool = data?.data;
  const eligible = new Set(pool?.employees.map((employee) => employee.id));
  const available = (pool?.employees || []).filter(
    (employee) => !pool?.priorities.some((priority) => priority.user_id === employee.id),
  );
  const activeCount =
    pool?.priorities.filter((priority) => !!Number(priority.active) && eligible.has(priority.user_id)).length || 0;

  async function save(path: string, method: string, body?: unknown) {
    setSaving(true);
    try {
      await request(endpoint + path, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      await mutate();
      toast.success(label + " automatic assignment updated");
      return true;
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Unable to update settings");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Auto {label}</h2>
          <p className="text-xs text-muted-foreground">{activeCount} eligible employees in rotation</p>
        </div>
        <Switch
          aria-label={"Enable auto " + label}
          checked={!!pool?.enabled}
          disabled={!pool || saving}
          onCheckedChange={(enabled) => save("", "PUT", { enabled })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {workflow === "packing"
          ? "Assign when orders become Confirmed or Ready To Ship."
          : "Assign when orders enter Pending Return or Partial Return."}{" "}
        Orders rotate evenly through active employees in this pool. Manual assignments are kept.
      </p>
      {isLoading && <p className="text-sm">Loading pool…</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Could not load settings.{" "}
          <Button variant="link" onClick={() => mutate()}>
            Retry
          </Button>
        </p>
      )}
      {pool?.enabled && activeCount === 0 && (
        <p className="text-sm text-amber-700">
          Add or enable an eligible employee before orders can be assigned automatically.
        </p>
      )}
      {pool && (
        <div className="divide-y">
          {pool.priorities.length === 0 && <p className="py-2 text-sm text-muted-foreground">No employees added.</p>}
          {pool.priorities.map((priority, index) => (
            <div key={priority.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {index + 1}. {priority.user?.full_name || "Unavailable employee"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[
                    priority.user?.employee_detail?.department?.name,
                    priority.user?.employee_detail?.designation?.title,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {!eligible.has(priority.user_id) && (
                  <p className="text-xs text-amber-700">
                    Skipped: employee is inactive or no longer has this page access.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  aria-label={"Include " + priority.user?.full_name + " in " + label + " rotation"}
                  checked={!!Number(priority.active)}
                  disabled={saving || (!eligible.has(priority.user_id) && !Number(priority.active))}
                  onCheckedChange={(active) => save("/priorities/" + priority.id, "PUT", { active })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  onClick={() => save("/priorities/" + priority.id, "DELETE")}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={!pool || saving}
        onClick={() => {
          setSelected("");
          setOpen(true);
        }}
      >
        Add employee
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!saving) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to {label} pool</DialogTitle>
            <DialogDescription>
              Choose an active employee with access to this section. Each pool rotates independently.
            </DialogDescription>
          </DialogHeader>
          <EmployeeAssignmentPicker employees={available} value={selected} onChange={setSelected} disabled={saving} />
          {available.length === 0 && (
            <p className="text-sm text-muted-foreground">No matching eligible employees outside this pool.</p>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving || !selected}
              onClick={async () => {
                if (await save("/priorities", "POST", { user_id: Number(selected) })) setOpen(false);
              }}
            >
              {saving ? "Saving…" : "Add employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function AutoWorkflowPools() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <WorkflowPool workflow="packing" />
      <WorkflowPool workflow="returns" />
    </div>
  );
}
