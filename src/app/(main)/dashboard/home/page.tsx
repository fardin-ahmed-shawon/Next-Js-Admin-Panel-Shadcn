import { DokanxActiveOrders } from "./_components/dokanx-active-orders";
import { DokanxMetricCards } from "./_components/dokanx-metric-cards";
import { DokanxMonthlyPayment } from "./_components/dokanx-monthly-payment";
import { DokanxOrderOverview } from "./_components/dokanx-order-overview";
import { DokanxPaymentMethods } from "./_components/dokanx-payment-methods";
import { DokanxPendingOrders } from "./_components/dokanx-pending-orders";
import { DokanxSalesTrend } from "./_components/dokanx-sales-trend";
import { DokanxTopProducts } from "./_components/dokanx-top-products";

export default function DokanXDashboard() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <DokanxMetricCards />

      {/* Row 3: Revenue vs Expense (Area) & Top Products (List) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DokanxMonthlyPayment />
        </div>
        <div className="xl:col-span-4">
          <DokanxOrderOverview />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DokanxPendingOrders />
        <DokanxActiveOrders />
      </div>

      <DokanxPaymentMethods />

      {/* Row 2: Sales Trend (Bar) & Order Overview (Donut) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DokanxSalesTrend />
        </div>

        <div className="xl:col-span-4">
          <DokanxTopProducts />
        </div>
      </div>
    </div>
  );
}
