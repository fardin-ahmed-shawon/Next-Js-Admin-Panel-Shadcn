export const manualOrderSources = ["Manual", "Repeat", "Whatsapp", "Inbox", "Offline"] as const;
export const emptyOrderListFilters = {
  order_agent: "All",
  packing_by: "All",
  return_confirmed_by: "All",
  customer_type: "All",
  invoice_status: "All",
  source: "All",
};
export type OrderListFilters = typeof emptyOrderListFilters;
export type AssignmentFilterOptions = Partial<
  Record<"order_agent" | "packing_by" | "return_confirmed_by", { id: number; full_name: string }[]>
>;
