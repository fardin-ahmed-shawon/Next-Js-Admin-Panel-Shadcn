"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateCustomer } from "@/hooks/useCustomers";

function dhakaDate(value: string) {
  if (!value.includes("Z") && !/[+-]\d\d:\d\d$/.test(value)) return value.replace(" ", "T").slice(0, 16);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return get("year") + "-" + get("month") + "-" + get("day") + "T" + get("hour") + ":" + get("minute");
}

export function LastContactedEditor({
  id,
  name,
  value,
  onSaved,
}: {
  id: string | number;
  name: string;
  value?: string | null;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await updateCustomer(id, { last_contacted_at: date || null });
      toast.success("Last contacted updated");
      setOpen(false);
      onSaved?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save date.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className="group flex items-center gap-2 rounded-md text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => {
          setDate(value ? dhakaDate(value) : "");
          setError("");
          setOpen(true);
        }}
        aria-label={"Edit last contacted for " + name}
      >
        <span className="text-xs">
          {value ? (
            <>
              <span className="block font-medium">{dhakaDate(value).slice(0, 10)}</span>
              <span className="text-muted-foreground">{dhakaDate(value).slice(11)} · Dhaka</span>
            </>
          ) : (
            <span className="text-muted-foreground">Add contact date</span>
          )}
        </span>
        <Pencil className="size-3 text-muted-foreground" />
      </button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Last contacted</DialogTitle>
            <DialogDescription>
              Record when you last contacted {name}. This does not change their last order date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={"contact-date-" + id}>Date and time (Dhaka)</Label>
            <Input
              id={"contact-date-" + id}
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={busy}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setDate(dhakaDate(new Date().toISOString()))}
              >
                Use current time
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setDate("")}>
                Clear date
              </Button>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={save}>
              {busy && <Loader2 className="size-4 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
