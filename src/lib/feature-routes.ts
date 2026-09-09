import type { ModularFeaturesData } from "@/hooks/useModularFeatures";

const routes: Record<string, string[]> = {
  "/dashboard/accounts": ["accounts_dashboard"],
  "/dashboard/accounts/revenue": ["accounts_revenue"],
  "/dashboard/accounts/expenses": ["accounts_expenses"],
  "/dashboard/accounts/expense-category": ["accounts_expenses"],
  "/dashboard/accounts/profit-loss": ["accounts_profit_n_loss"],
  "/dashboard/accounts/statements": ["accounts_statement", "accounts_cash_flow"],
  "/dashboard/accounts/due": ["accounts_due"],
  "/dashboard/accounts/capital": ["accounts_cash_flow"],
  "/dashboard/accounts/refund-history": ["accounts_refund_history"],
  "/dashboard/products/attributes": ["variant_management"],
  "/dashboard/products/homepage-videos": ["product_yt_reels"],
  "/dashboard/products/recommendations": ["product_ai_recommendation"],
  "/dashboard/brands": ["brands"],
  "/dashboard/suppliers": ["supplier_management"],
  "/dashboard/orders/create": ["orders_manual_create"],
  "/dashboard/orders/wholesale-create": ["orders_wholesale_create"],
  "/dashboard/orders/wholesale": ["orders_wholesale_create"],
  "/dashboard/orders/incomplete": ["orders_incomplete"],
  "/dashboard/orders/invoice": ["orders_invoice_manage"],
  "/dashboard/ai-calling-logs": ["ai_auto_calling"],
  "/dashboard/orders/assign-orders": ["employee_management"],
  "/dashboard/auto-order": ["employee_auto_order_distribution"],
  "/dashboard/roles": ["role_based_access_control"],
  "/dashboard/users": ["role_based_access_control"],
  "/dashboard/courier/steadfast": ["courier_steadfast"],
  "/dashboard/courier/pathao": ["courier_pathao"],
  "/dashboard/courier/redx": ["courier_redx"],
  "/dashboard/discounts": ["discounts"],
  "/dashboard/coupons": ["regular_coupons", "product_wise_coupon"],
  "/dashboard/reviews": ["product_review"],
  "/dashboard/testimonials": ["testimonials"],
  "/dashboard/blogs": ["blogs"],
  "/dashboard/landing-pages": ["landing_page_creation"],
  "/dashboard/flash-sales": ["flash_sale"],
  "/dashboard/reports/dashboard": ["reports_dashboard"],
  "/dashboard/reports/product": ["reports_product"],
  "/dashboard/reports/product-percent": ["reports_product_percent"],
  "/dashboard/reports/customer": ["reports_customer"],
  "/dashboard/reports/supplier": ["reports_supplier"],
  "/dashboard/reports/employee": ["reports_employee"],
  "/dashboard/reports/payment": ["reports_payment"],
  "/dashboard/reports/parcel": ["reports_parcel"],
  "/dashboard/reports/courier": ["reports_courier"],
  "/dashboard/reports/inventory": ["reports_inventory"],
  "/dashboard/fraud-checker": ["fraud_checker"],
  "/dashboard/user-behaviour-logs": ["user_behaviour_logs"],
  "/dashboard/blocklist": ["blocklist"],
};

export function requiredFeatures(pathname: string): string[] {
  if (pathname.startsWith("/invoice/")) {
    const format = pathname.endsWith("/pos")
      ? "orders_invoice_pos"
      : pathname.endsWith("/label")
        ? "orders_invoice_label"
        : "orders_invoice_a4";
    return [format];
  }
  const match = Object.keys(routes)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || (path !== "/dashboard/accounts" && pathname.startsWith(path + "/")));
  return match ? routes[match] : [];
}

export function featurePathEnabled(pathname: string, features?: ModularFeaturesData): boolean {
  const keys = requiredFeatures(pathname);
  return (
    keys.length === 0 || (!!features && keys.some((key) => features[key] === true || String(features[key]) === "1"))
  );
}
