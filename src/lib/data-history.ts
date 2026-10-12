import { CalendarDays } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import type { User } from "@/hooks/useUsers";

export const HISTORY_LABELS = {
  alltime: "All Time", daily: "Today", yesterday: "Yesterday", weekly: "Weekly",
  monthly: "Monthly", "3months": "Last 3 Months", "4months": "Last 4 Months",
  "6months": "Last 6 Months", yearly: "Yearly", custom: "Custom Range",
};
export type HistoryPeriod = keyof typeof HISTORY_LABELS;
export function historyPeriods(user: User | null, module: "orders" | "customers"): HistoryPeriod[] {
  if (!user) return [];
  const access = user.role?.page_access as unknown as Record<string, unknown> | undefined;
  return (Object.keys(HISTORY_LABELS) as HistoryPeriod[]).filter(period => user.role?.role_name === "Admin" || Number(access?.[module + "_history_" + period] ?? 1) === 1);
}
export function historyDates(period: string, from = "", to = "") {
  if (period === "alltime") return { from: "", to: "" };
  if (period === "custom") return { from, to };
  const now = new Date();
  const start = period === "yesterday" ? subDays(now, 1) : period === "weekly" ? subDays(now, 7)
    : period === "monthly" ? subMonths(now, 1) : period === "yearly" ? subYears(now, 1)
    : period.endsWith("months") ? subMonths(now, Number.parseInt(period)) : now;
  return { from: format(start, "yyyy-MM-dd"), to: format(period === "yesterday" ? start : now, "yyyy-MM-dd") };
}
export function historyDefault(periods: HistoryPeriod[]): HistoryPeriod {
  return periods.includes("alltime") ? "alltime" : [...periods].reverse().find(p => p !== "custom") || "custom";
}
export const HISTORY_PERMISSION_GROUPS = (["orders", "customers"] as const).map(module => ({
  id: module + "_history", title: (module === "orders" ? "Orders (including Incomplete)" : "Customers") + " — Data Viewing Periods",
  icon: CalendarDays,
  items: (Object.entries(HISTORY_LABELS)).map(([period, label]) => ({
    id: module + "_history_" + period,
    label: label + (period === "custom" ? " (within maximum enabled period)" : period === "alltime" ? " (unlimited history)" : ""),
    icon: CalendarDays,
  })),
}));

export function historyMinimum(periods: HistoryPeriod[]): string | undefined {
  if (periods.includes("alltime")) return undefined;
  return periods.filter(p => p !== "custom").map(p => historyDates(p).from).filter(Boolean).sort()[0];
}
