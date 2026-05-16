import { AddMainCategoryDialog } from "./_components/add-main-category-dialog";
import { AddSubCategoryDialog } from "./_components/add-sub-category-dialog";
import { CategoriesStats } from "./_components/categories-stats";
import { CategoriesTable } from "./_components/categories-table";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">Manage your main and sub categories.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <AddSubCategoryDialog />
          <AddMainCategoryDialog />
        </div>
      </div>

      <CategoriesStats />
      <CategoriesTable />
    </div>
  );
}
