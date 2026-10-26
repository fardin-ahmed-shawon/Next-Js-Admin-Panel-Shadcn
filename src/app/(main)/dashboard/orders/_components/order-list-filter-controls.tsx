"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { manualOrderSources, type OrderListFilters, type AssignmentFilterOptions } from "@/lib/order-list-filters";

export function OrderListFilterControls({
  filters,
  options,
  onChange,
}: {
  filters: OrderListFilters;
  options: AssignmentFilterOptions;
  onChange: (filters: OrderListFilters) => void;
}) {
  const selects = [
    ...(
      [
        ["order_agent", "Order Agent"],
        ["packing_by", "Packing By"],
        ["return_confirmed_by", "Return Confirmed By"],
      ] as const
    ).map(([key, label]) => ({
      key,
      label,
      items: [
        { value: "unassigned", label: "Unassigned" },
        ...(options[key] || []).map((user) => ({ value: String(user.id), label: user.full_name })),
      ],
    })),
    {
      key: "customer_type",
      label: "Customer Type",
      items: [
        { value: "new", label: "New Customer" },
        { value: "old", label: "Old Customer" },
      ],
    },
    {
      key: "invoice_status",
      label: "Invoice",
      items: [
        { value: "invoiced", label: "Invoiced" },
        { value: "not_invoiced", label: "Not Invoiced" },
      ],
    },
    {
      key: "source",
      label: "Order Source",
      items: [
        ...manualOrderSources.map((value) => ({ value, label: value })),
        { value: "Website", label: "Website" },
        { value: "Landing-Page", label: "Landing Page" },
        { value: "Incomplete", label: "From Incomplete" },
      ],
    },
  ];
  return (
    <>
      {selects.map(({ key, label, items }) => (
        <Select
          key={key}
          value={filters[key as keyof OrderListFilters]}
          onValueChange={(value) => onChange({ ...filters, [key]: value })}
        >
          <SelectTrigger aria-label={"Filter by " + label} title={label} className="h-8 w-[155px] text-xs">
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{label}: All</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </>
  );
}
