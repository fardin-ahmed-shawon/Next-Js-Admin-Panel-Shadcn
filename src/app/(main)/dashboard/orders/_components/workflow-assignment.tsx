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
import { EmployeeAssignmentPicker } from "./employee-assignment-picker";
import { useAuth } from "@/hooks/useAuth";
import { canAssignWorkflow, canChangeOrderAssignment } from "@/hooks/useRoles";
import { fetchClient } from "@/lib/fetch-client";
import { adminApiUrl, readAdminApiResponse } from "@/lib/admin-api";

export function WorkflowAssignment({
  workflow,
  orderNos,
  name,
  onSaved,
  editable = true,
  management = false,
  rowAction = false,
  currentUserId,
}: {
  workflow: "agent" | "packing" | "returns";
  management?: boolean;
  rowAction?: boolean;
  currentUserId?: number | null;
  orderNos: string[];
  name?: string | null;
  onSaved?: () => void;
  editable?: boolean;
}) {
  const { user } = useAuth();
  const allowed =
    editable &&
    (management ? canChangeOrderAssignment(user, workflow) : workflow !== "agent" && canAssignWorkflow(user, workflow));
  const [open, setOpen] = React.useState(false);
  const [recipient, setRecipient] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const label = workflow === "agent" ? "Order Agent" : workflow === "packing" ? "Packing By" : "Return Confirmed By";
  const {
    data,
    error,
    isLoading,
    mutate: retryEmployees,
  } = useSWR(
    open && allowed
      ? adminApiUrl(
          management
            ? "order-assignments/recipients?assignment_type=" + workflow
            : "order-workflows/" + workflow + "/recipients",
        )
      : null,
    async (url) => {
      const response = await fetchClient(url);
      return readAdminApiResponse(response);
    },
  );
  const employees = data?.data || [];
  async function save() {
    setSaving(true);
    try {
      const response = await fetchClient(
        adminApiUrl(management ? "orders/bulk-assign" : "order-workflows/" + workflow + "/assign"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignment_type: workflow,
            order_nos: orderNos,
            user_id: recipient === "unassigned" ? null : Number(recipient),
          }),
        },
      );
      await readAdminApiResponse(response);
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
      {(!management || rowAction) && orderNos.length === 1 && (
        <span className="block font-medium">{name || "Unassigned"}</span>
      )}
      {allowed && (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 py-0 text-xs"
          onClick={() => {
            setRecipient(currentUserId ? String(currentUserId) : "");
            setOpen(true);
          }}
        >
          {management && !rowAction
            ? `Change ${label} (${orderNos.length})`
            : orderNos.length > 1
              ? `Assign ${label} (${orderNos.length})`
              : name
                ? "Change"
                : "Assign"}
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
            <DialogTitle>
              {currentUserId ? "Change" : "Assign"} {label}
            </DialogTitle>
            <DialogDescription>
              Update {orderNos.length} selected order{orderNos.length === 1 ? "" : "s"}. Other order assignments stay
              unchanged.
            </DialogDescription>
          </DialogHeader>
          <EmployeeAssignmentPicker
            employees={employees}
            value={recipient}
            onChange={setRecipient}
            loading={isLoading}
            loadFailed={!!error}
            disabled={saving || !!error}
            allowUnassigned
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error.message}
              <Button type="button" variant="link" onClick={() => retryEmployees()}>
                Retry
              </Button>
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                saving ||
                isLoading ||
                !recipient ||
                !!error ||
                (recipient !== "unassigned" &&
                  !employees.some((employee: { id: number }) => String(employee.id) === recipient))
              }
              onClick={save}
            >
              {saving ? "Saving..." : "Save assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
