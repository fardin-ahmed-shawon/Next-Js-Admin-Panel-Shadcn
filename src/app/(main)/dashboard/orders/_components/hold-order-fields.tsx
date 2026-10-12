"use client";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HoldOrderFields({
  note,
  date,
  onNoteChange,
  onDateChange,
  disabled = false,
}: {
  note: string;
  date: string;
  onNoteChange: (value: string) => void;
  onDateChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-50/30 p-3 dark:bg-amber-950/10">
      <div className="space-y-1.5">
        <Label htmlFor={id + "-note"}>
          Hold Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={id + "-note"}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Reason for holding the order or next steps…"
          maxLength={2000}
          disabled={disabled}
          className="min-h-20"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={id + "-date"}>
          Next Action Date <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={id + "-date"}
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
