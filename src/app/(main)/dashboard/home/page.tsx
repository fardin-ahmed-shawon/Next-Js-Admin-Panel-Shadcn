"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { DokanxActiveOrders } from "./_components/dokanx-active-orders";
import { DokanxMetricCards } from "./_components/dokanx-metric-cards";
import { DokanxMonthlyPayment } from "./_components/dokanx-monthly-payment";
import { DokanxOrderOverview } from "./_components/dokanx-order-overview";
import { DokanxPaymentMethods } from "./_components/dokanx-payment-methods";
import { DokanxPendingOrders } from "./_components/dokanx-pending-orders";
import { DokanxSalesTrend } from "./_components/dokanx-sales-trend";
import { DokanxTopProducts } from "./_components/dokanx-top-products";

export default function DokanXDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const hasAccess = (module: string) => {
    if (!user) return false;
    if (user?.role?.role_name === "Admin") return true;
    return user?.role?.page_access && user.role.page_access[module as keyof typeof user.role.page_access] === 1;
  };

  const showAccounts = hasAccess("accounts") || hasAccess("revenue");
  const showOrders = hasAccess("orders");
  const showProducts = hasAccess("products");

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <DokanxMetricCards />

      {/* Row 3: Revenue vs Expense (Area) & Order Overview (Donut) */}
      {(showAccounts || showOrders) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {showAccounts && (
            <div className={showOrders ? "xl:col-span-8" : "xl:col-span-12"}>
              <DokanxMonthlyPayment />
            </div>
          )}
          {showOrders && (
            <div className={showAccounts ? "xl:col-span-4" : "xl:col-span-12"}>
              <DokanxOrderOverview />
            </div>
          )}
        </div>
      )}

      {showOrders && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DokanxPendingOrders />
          <DokanxActiveOrders />
        </div>
      )}

      {showAccounts && <DokanxPaymentMethods />}

      {/* Row 2: Sales Trend (Bar) & Top Products (List) */}
      {(showOrders || showProducts) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {showOrders && (
            <div className={showProducts ? "xl:col-span-8" : "xl:col-span-12"}>
              <DokanxSalesTrend />
            </div>
          )}

          {showProducts && (
            <div className={showOrders ? "xl:col-span-4" : "xl:col-span-12"}>
              <DokanxTopProducts />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
