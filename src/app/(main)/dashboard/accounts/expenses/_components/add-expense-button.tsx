"use client";

import * as React from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ExpenseDialog } from "./expense-dialog";
import useExpenses from "@/hooks/useExpenses";

export function AddExpenseButton() {
  const [open, setOpen] = React.useState(false);
  const { mutate } = useExpenses();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Add Expense
      </Button>
      <ExpenseDialog open={open} onOpenChange={setOpen} mode="add" onSuccess={() => mutate()} />
    </>
  );
}
