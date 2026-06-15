"use client";

import { useState, useCallback } from "react";
import { AddCouponDialog } from "./_components/add-coupon-dialog";
import { CouponsStats } from "./_components/coupons-stats";
import { CouponsTable } from "./_components/coupons-table";

export default function CouponsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCouponAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleCouponDeleted = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm">Manage discount coupons and promotions.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddCouponDialog onCouponAdded={handleCouponAdded} />
        </div>
      </div>

      <CouponsStats refreshTrigger={refreshTrigger} />
      <CouponsTable refreshTrigger={refreshTrigger} onCouponDeleted={handleCouponDeleted} />
    </div>
  );
}