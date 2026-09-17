import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

/**
 * Safely parses a datetime string from the API/database into a local Date object.
 * Strips any trailing 'Z' or UTC indicators that falsely shift local database timestamps.
 */
export function parseDateTime(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const cleanStr = String(dateStr).trim().replace(/(\.\d+)?Z$/i, "").replace(" ", "T");
  const d = new Date(cleanStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats an order date and time cleanly matching database local time.
 */
export function formatOrderDateTime(dateStr?: string | null): { date: string; time: string } {
  const d = parseDateTime(dateStr);
  if (!d) return { date: "—", time: "" };

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

/**
 * Calculates human-readable relative time (e.g. "5m ago", "2h ago", "yesterday")
 */
export function getRelativeTime(dateStr?: string | null): string {
  const date = parseDateTime(dateStr);
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "just now";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const calendarDiffDays = Math.floor((today.getTime() - orderDate.getTime()) / 86400000);

  if (calendarDiffDays === 0) {
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  } else if (calendarDiffDays === 1) {
    return "yesterday";
  } else if (calendarDiffDays < 7) {
    return `${calendarDiffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }
}

/**
 * Formats a date string to a human-friendly format (e.g. "23 Jul 2026")
 */
export function formatDate(dateStr?: string | null): string {
  const date = parseDateTime(dateStr);
  if (!date) return typeof dateStr === "string" ? dateStr : "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
