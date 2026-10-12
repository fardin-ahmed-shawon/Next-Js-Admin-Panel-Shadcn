"use client";

import { Users, BarChart3, RotateCcw, Truck } from "lucide-react";
import type { CustomerRow } from "./customers-table";

export function CustomersStats({ data }: { data: CustomerRow[] }) {
  const now = new Date();
  const newCount = data.filter((customer) => {
    const joined = new Date(customer.joinDate);
    return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
  }).length;
  const revenue = data.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const repeat = data.filter((customer) => customer.totalOrders > 1).length;
  const active = data.filter(
    (customer) => customer.daysSinceLastOrder !== null && customer.daysSinceLastOrder <= 30,
  ).length;
  const ordered = data.filter((customer) => customer.totalOrders > 0);
  const average = (key: "successRate" | "returnRate") =>
    ordered.length ? Math.round(ordered.reduce((sum, customer) => sum + customer[key], 0) / ordered.length) : 0;
  const risk = data.filter((customer) => customer.returnRate > 30).length;
  const cards = [
    {
      title: "Total Customers",
      value: data.length.toLocaleString(),
      detail: "+" + newCount + " new this month",
      icon: Users,
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      badge: "",
      suffix: "",
    },
    {
      title: "Cumulative Revenue",
      value: "৳" + revenue.toLocaleString(),
      detail: "Avg. LTV: ৳" + (data.length ? Math.round(revenue / data.length) : 0).toLocaleString() + " per customer",
      icon: BarChart3,
      color: "bg-emerald-500/10 text-emerald-600",
      badge: "",
      suffix: "",
    },
    {
      title: "Repeat & Retention",
      value: repeat.toLocaleString(),
      detail: active + " ordered within the last 30 days",
      icon: RotateCcw,
      color: "bg-blue-500/10 text-blue-600",
      badge: (data.length ? Math.round((repeat / data.length) * 100) : 0) + "%",
      suffix: "repeat buyers",
    },
    {
      title: "Fulfillment Reliability",
      value: ordered.length ? average("successRate") + "%" : "—",
      detail: "Avg. return rate: " + average("returnRate") + "%",
      icon: Truck,
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      badge: risk ? risk + " high risk" : "",
      suffix: "delivery success",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map(({ title, value, detail, icon: Icon, color, badge, suffix }) => (
        <div key={title} className="rounded-xl border bg-card p-4 flex items-start gap-4">
          <div className={"shrink-0 rounded-xl p-3 " + color}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
              <span className="text-xs text-muted-foreground">{suffix}</span>
            </div>
            <p className="text-xs text-muted-foreground">{detail}</p>
            {badge && (
              <span className={"inline-block rounded-full px-2 py-0.5 text-[10px] font-medium " + color}>{badge}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
