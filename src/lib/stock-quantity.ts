/** Display each measurement separately; never add weight, volume, and pieces. */
export function formatStockQuantity(quantity: number | string | null | undefined, unit = "piece"): string {
  const numeric = Number(quantity ?? 0);
  const value = unit === "g" || unit === "ml" ? numeric / 1000 : numeric;
  const label = unit === "g" ? "kg" : unit === "ml" ? "L" : unit === "l" ? "L" : unit === "piece" ? "pcs" : unit;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${label}`;
}
