import { Metadata } from "next";

import { AddCategoryButton } from "./_components/add-category-button";
import { ExpenseCategoryStats } from "./_components/expense-category-stats";
import { ExpenseCategoryTable } from "./_components/expense-category-table";

export const metadata: Metadata = {
  title: "Expense Category",
  description: "Manage categories for all your business expenses.",
};

export default function ExpenseCategoryPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Expense Categories</h1>
          <p className="text-muted-foreground text-sm">Manage categories for all your business expenses.</p>
        </div>
        <AddCategoryButton />
      </div>

      <ExpenseCategoryStats />
      <ExpenseCategoryTable />
    </div>
  );
}
