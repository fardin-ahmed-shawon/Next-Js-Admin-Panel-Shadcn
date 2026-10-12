"use client";

import { Edit, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderAssignmentCell({
  name,
  label,
  editable,
  onAssign,
}: {
  name?: string | null;
  label: string;
  editable: boolean;
  onAssign: () => void;
}) {
  if (!editable) {
    return (
      <div
        title={name || undefined}
        className="w-[100px] truncate pl-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400"
      >
        {name || "—"}
      </div>
    );
  }

  return (
    <div className="flex w-[100px] flex-col gap-1">
      {name ? (
        <button
          type="button"
          title={name}
          aria-label={"Change " + label + ": " + name}
          className="flex items-center justify-between gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          onClick={onAssign}
        >
          <span className="truncate">{name}</span>
          <Edit className="size-3 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={"Assign " + label}
          className="h-7 justify-center border-dashed border-muted-foreground/40 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          onClick={onAssign}
        >
          <UserPlus className="mr-1 size-3" /> Assign
        </Button>
      )}
    </div>
  );
}
