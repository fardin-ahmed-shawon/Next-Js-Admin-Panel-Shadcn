"use client";

import { useState, useCallback } from "react";
import { AddFlashSaleDialog } from "./_components/add-flash-sale-dialog";
import { FlashSalesTable } from "./_components/flash-sales-table";

export default function FlashSalesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFlashSaleAdded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFlashSaleDeleted = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Flash Sales</h1>
          <p className="text-muted-foreground text-sm">Manage flash sales events.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddFlashSaleDialog onFlashSaleAdded={handleFlashSaleAdded} />
        </div>
      </div>

      <FlashSalesTable refreshTrigger={refreshTrigger} onFlashSaleDeleted={handleFlashSaleDeleted} />
    </div>
  );
}
