import { Archive } from "lucide-react";
import { InventoryStats } from "./_components/inventory-stats";
import { InventoryTable } from "./_components/inventory-table";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">Monitor stock levels and manage product inventory.</p>
        </div>
      </div>

      <InventoryStats />
      <InventoryTable />
    </div>
  );
}
