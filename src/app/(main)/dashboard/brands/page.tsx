import { AddBrandDialog } from "./_components/add-brand-dialog";
import { BrandsStats } from "./_components/brands-stats";
import { BrandsTable } from "./_components/brands-table";

export default function BrandsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Brands</h1>
          <p className="text-muted-foreground text-sm">Manage all product brands and their status.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddBrandDialog />
        </div>
      </div>

      <BrandsStats />
      <BrandsTable />
    </div>
  );
}
