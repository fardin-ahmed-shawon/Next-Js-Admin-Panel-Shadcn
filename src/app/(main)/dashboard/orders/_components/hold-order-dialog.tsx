"use client";
import { useEffect, useState } from "react";
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
import { fetchClient } from "@/lib/fetch-client";
import { adminApiUrl } from "@/lib/admin-api";
import { HoldOrderFields } from "./hold-order-fields";

export function HoldOrderDialog({
  open,
  onOpenChange,
  orderNos,
  initialNote = "",
  initialDate = "",
  bulk = false,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNos: string[];
  initialNote?: string;
  initialDate?: string;
  bulk?: boolean;
  onSaved: () => void;
}) {
  const [note, setNote] = useState(initialNote);
  const [date, setDate] = useState(initialDate);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setNote(initialNote);
      setDate(initialDate);
    }
  }, [open, initialNote, initialDate]);
  async function save() {
    if (saving || !orderNos.length) return;
    setSaving(true);
    try {
      const response = await fetchClient(
        adminApiUrl(bulk ? "orders/bulk-update-status" : "orders/" + encodeURIComponent(orderNos[0])),
        {
          method: bulk ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(bulk ? { order_nos: orderNos } : {}),
            order_status: "Hold",
            hold_note: note.trim() || null,
            next_action_date: date || null,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          Object.values(result.errors || {})
            .flat()
            .join(" ") ||
            result.message ||
            "Unable to save Hold details.",
        );
      toast.success(bulk ? "Selected orders put on Hold." : "Hold details saved.");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save Hold details.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bulk ? "Hold " + orderNos.length + " orders" : "Hold Order"}</DialogTitle>
          <DialogDescription>
            {bulk
              ? "The same note and date will replace the Hold details on every selected order."
              : "Add a reason and choose when to take the next action on this order."}
          </DialogDescription>
        </DialogHeader>
        <HoldOrderFields note={note} date={date} onNoteChange={setNote} onDateChange={setDate} disabled={saving} />
        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={saving || !orderNos.length} onClick={save}>
            {saving ? "Saving…" : "Save Hold Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
