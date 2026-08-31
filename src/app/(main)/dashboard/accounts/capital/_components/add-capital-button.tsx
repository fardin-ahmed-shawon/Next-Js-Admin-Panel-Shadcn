"use client";

import * as React from "react";
import { Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CapitalDialog } from "./capital-dialog";
import useCapitals from "@/hooks/useCapitals";

interface AddCapitalButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  onSuccess?: () => void;
  label?: string;
}

export function AddCapitalButton({
  onSuccess,
  label = "Record Cash In / Out",
  className,
  variant,
  size,
  ...props
}: AddCapitalButtonProps) {
  const [open, setOpen] = React.useState(false);
  const { mutate } = useCapitals();

  const handleSuccess = () => {
    mutate();
    onSuccess?.();
  };

  return (
    <>
      <Button
        variant={variant || "default"}
        size={size}
        className={className || "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2"}
        onClick={() => setOpen(true)}
        {...props}
      >
        <Wallet className="size-4" />
        <span>{label}</span>
      </Button>

      <CapitalDialog open={open} onOpenChange={setOpen} mode="add" onSuccess={handleSuccess} />
    </>
  );
}
