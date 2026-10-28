import type { CourierAmount } from "@/hooks/useSteadfastPayments";

export function paymentMoney(value: CourierAmount | undefined) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "—";
  return `৳${Number(value).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function paymentDate(value: string | null | undefined) {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? value.replace(" ", "T") + "+06:00" : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" });
}

export function trackingLink(value: string | null | undefined): string | null {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" &&
      (url.hostname === "steadfast.com.bd" || url.hostname.endsWith(".steadfast.com.bd")) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
