import { AddCouponDialog } from "./_components/add-coupon-dialog";
import { CouponsStats } from "./_components/coupons-stats";
import { CouponsTable } from "./_components/coupons-table";

export default function CouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm">Manage discount coupons and promotions.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddCouponDialog />
        </div>
      </div>

      <CouponsStats />
      <CouponsTable />
    </div>
  );
}
