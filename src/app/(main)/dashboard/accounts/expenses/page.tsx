import { Metadata } from "next";

import { AddExpenseButton } from "./_components/add-expense-button";
import { ExpensesStats } from "./_components/expenses-stats";
import { ExpensesTable } from "./_components/expenses-table";

export const metadata: Metadata = {
  title: "Expenses",
  description: "Manage, add, and track all your business expenses in one place.",
};

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm">Manage, add, and track all your business expenses in one place.</p>
        </div>
        <AddExpenseButton />
      </div>

      <ExpensesStats />
      <ExpensesTable />
    </div>
  );
}
