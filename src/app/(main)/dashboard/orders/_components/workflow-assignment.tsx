"use client";

import * as React from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { canAssignWorkflow } from "@/hooks/useRoles";
import { fetchClient } from "@/lib/fetch-client";

const base = () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

export function WorkflowAssignment({
  workflow,
  orderNos,
  name,
  onSaved,
  editable = true,
}: {
  workflow: "packing" | "returns";
  orderNos: string[];
  name?: string | null;
  onSaved?: () => void;
  editable?: boolean;
}) {
  const { user } = useAuth();
  const allowed = editable && canAssignWorkflow(user, workflow);
  const [open, setOpen] = React.useState(false);
  const [recipient, setRecipient] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const label = workflow === "packing" ? "Packing By" : "Return Confirmed By";
  const { data, error, isLoading } = useSWR(
    open && allowed ? base() + "order-workflows/" + workflow + "/recipients" : null,
    async (url) => {
      const response = await fetchClient(url);
      if (!response.ok) throw new Error("Unable to load eligible employees");
      return response.json();
    },
  );
  const employees = (data?.data || []).filter((employee: any) =>
    [employee.full_name, employee.employee_detail?.department?.name, employee.employee_detail?.designation?.title].some(
      (value) => value?.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  async function save() {
    setSaving(true);
    try {
      const response = await fetchClient(base() + "order-workflows/" + workflow + "/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_nos: orderNos, user_id: recipient === "unassigned" ? null : Number(recipient) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update assignments");
      toast.success(label + " updated");
      setOpen(false);
      await mutate((key) => {
        const url = Array.isArray(key) ? key[0] : key;
        return typeof url === "string" && (url.includes("orders") || url.includes("return-queue"));
      });
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update assignments");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="min-w-[130px] text-xs">
      {orderNos.length === 1 && <span className="block font-medium">{name || "Unassigned"}</span>}
      {allowed && (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 py-0 text-xs"
          onClick={() => {
            setRecipient("");
            setSearch("");
            setOpen(true);
          }}
        >
          {orderNos.length > 1 ? `Assign ${label} (${orderNos.length})` : name ? "Change" : "Assign"}
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!saving) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {label}</DialogTitle>
            <DialogDescription>
              Update {orderNos.length} selected order{orderNos.length === 1 ? "" : "s"}. Other order assignments stay
              unchanged.
            </DialogDescription>
          </DialogHeader>
          <Input
            aria-label="Find workflow employee"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, department or designation"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          )}
          <Select value={recipient} onValueChange={setRecipient} disabled={isLoading || !!error || saving}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoading ? "Loading employees..." : "Choose employee"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map((employee: any) => (
                <SelectItem key={employee.id} value={String(employee.id)}>
                  {employee.full_name}
                  {employee.employee_detail?.department?.name ? ` — ${employee.employee_detail.department.name}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !recipient || !!error} onClick={save}>
              {saving ? "Saving..." : "Save assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
