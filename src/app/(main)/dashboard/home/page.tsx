import { DokanxMetricCards } from "./_components/dokanx-metric-cards";
import { DokanxMonthlyPayment } from "./_components/dokanx-monthly-payment";
import { DokanxSalesTrend } from "./_components/dokanx-sales-trend";
import { DokanxOrderOverview } from "./_components/dokanx-order-overview";
import { DokanxPaymentMethods } from "./_components/dokanx-payment-methods";
import { DokanxTopProducts } from "./_components/dokanx-top-products";
import { DokanxRecentOrders } from "./_components/dokanx-recent-orders";

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
        <DokanxRecentOrders title="Pending Orders" description="Orders awaiting acceptance" filterStatus="Pending" />
        <DokanxRecentOrders title="Active Orders" description="Currently active orders" filterStatus="Active" />
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
