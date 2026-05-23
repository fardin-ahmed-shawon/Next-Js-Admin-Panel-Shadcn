import { AddDiscountDialog } from "./_components/add-discount-dialog";
import { DiscountsStats } from "./_components/discounts-stats";
import { DiscountsTable } from "./_components/discounts-table";

export default function DiscountsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Discounts</h1>
          <p className="text-muted-foreground text-sm">Manage automated store discounts based on purchase amount.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddDiscountDialog />
        </div>
      </div>

      <DiscountsStats />
      <DiscountsTable />
    </div>
  );
}
