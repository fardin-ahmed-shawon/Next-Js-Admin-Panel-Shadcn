"use client";

import { useState, type FormEvent } from "react";
import {
  Download,
  RefreshCw,
  Search,
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CalendarDays,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ReportProductSearch,
  ReportProductImage,
  type ReportProductSelection,
} from "./_components/report-product-search";
import { ProductReportPreview } from "./_components/product-report-preview";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import useInventoryReport, {
  inventoryReportUrl,
  reportFetch,
  type InventoryMovement,
} from "@/hooks/useInventoryReport";

const emptyFilters = {
  search: "",
  from: "",
  to: "",
  source: "",
  supplier_id: "",
  actor_id: "",
  product_id: "",
  product_variant_id: "",
  inventory_lot_id: "",
  order_no: "",
};
const timeRanges = [
  ["alltime", "All Time"],
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["weekly", "Weekly"],
  ["monthly", "Monthly"],
  ["4months", "Last 4 Months"],
  ["6months", "Last 6 Months"],
  ["yearly", "Yearly"],
  ["custom", "Custom Range"],
];
const types = [
  ["", "All movements"],
  ["purchase", "Purchases"],
  ["adjustment", "Stock adjustments"],
  ["order_deduction", "Order deductions"],
  ["return", "Returns"],
  ["lot_update", "Lot changes"],
  ["lot_deleted", "Deleted lots"],
];
const label = (value: string | null) =>
  value ? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
const number = (value: unknown) => Number(value || 0).toLocaleString("en-BD");
const money = (value: unknown) =>
  value == null
    ? "Unknown"
    : `৳${Number(value).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const selectClass = "h-9 w-full rounded-md border bg-background px-3 text-sm";
const dateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function InventoryReportPage() {
  const { features } = useModularFeatures();
  const disabled = features?.reports_inventory === false || String(features?.reports_inventory) === "0";
  const [timeRange, setTimeRange] = useState("alltime");
  const [customOpen, setCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [productSelection, setProductSelection] = useState<ReportProductSelection | null>(null);
  const [preview, setPreview] = useState<ReportProductSelection | null>(null);
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("25");
  const [view, setView] = useState("movements");
  const [selected, setSelected] = useState<InventoryMovement | null>(null);
  const [exporting, setExporting] = useState(false);
  const query = new URLSearchParams({ page: String(page), per_page: perPage, period: timeRange });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  if (eventType) query.set("event_type", eventType);
  const { data, error, isLoading, mutate } = useInventoryReport(query.toString(), !disabled);
  const timestamp = (value: string) =>
    new Date(value).toLocaleString("en-GB", {
      timeZone: data?.timezone || "Asia/Dhaka",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  const change = (key: keyof typeof draft, value: string) => setDraft((previous) => ({ ...previous, [key]: value }));
  const apply = (event: FormEvent) => {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) {
      toast.error("End time must be after start time.");
      return;
    }
    setFilters(draft);
    setPage(1);
  };
  const periodLabel = timeRanges.find(([value]) => value === timeRange)?.[1] || "All Time";
  const choosePeriod = (value: string) => {
    if (value === "custom") {
      setCustomRange({ from: filters.from, to: filters.to });
      setCustomOpen(true);
      return;
    }
    setTimeRange(value);
    setFilters((previous) => ({ ...previous, from: "", to: "" }));
    setDraft((previous) => ({ ...previous, from: "", to: "" }));
    setPage(1);
  };
  const selectProduct = (product: ReportProductSelection | null) => {
    const selection = {
      product_id: product ? String(product.id) : "",
      product_variant_id: product?.variant ? String(product.variant.id) : "",
      inventory_lot_id: "",
    };
    setProductSelection(product);
    setFilters((previous) => ({ ...previous, ...selection }));
    setDraft((previous) => ({ ...previous, ...selection }));
    setPage(1);
  };
  const openRowPreview = (row: InventoryMovement) =>
    setPreview({
      id: Number(row.product_id),
      title: row.product_title,
      sku: row.sku,
      product_thumbnail_img: row.product_thumbnail_img,
      ...(row.product_variant_id
        ? { variant: { id: row.product_variant_id, label: row.variant_label || "Variant", sku: row.sku } }
        : {}),
    });
  const download = async (format: string) => {
    setExporting(true);
    try {
      const params = new URLSearchParams(query);
      params.delete("page");
      params.delete("per_page");
      params.set("format", format);
      const response = await reportFetch(`${inventoryReportUrl}/export?${params}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `inventory-report-${dateInput(new Date())}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("All matching movements exported.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };
  const memoUrl = (path: string) => {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/api\/.*$/, "/");
    return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  };

  if (disabled)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Inventory Reports</h1>
        <p className="text-muted-foreground">This report is disabled in Modular Features.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trace purchases, adjustments, orders and returns across every recorded lot.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={choosePeriod}>
            <SelectTrigger className="h-9 w-40" aria-label="Report time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {timeRanges.map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeRange === "custom" && (
            <Button variant="outline" aria-label="Edit custom time range" onClick={() => choosePeriod("custom")}>
              <CalendarDays className="size-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => download("csv")} disabled={exporting}>
            CSV
          </Button>
          <Button onClick={() => download("xlsx")} disabled={exporting}>
            <Download className="size-4" />
            {exporting ? "Exporting…" : "Download Excel"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Purchased units",
            key: "purchased_units",
            icon: Archive,
            detail: `Purchase value: ${money(data?.summary.purchase_value ?? 0)}`,
          },
          {
            title: "Order deductions",
            key: "ordered_units",
            icon: ArrowUpRight,
            detail: `Purchase cost: ${money(data?.summary.order_cost ?? 0)}`,
          },
          { title: "Returned units", key: "returned_units", icon: RotateCcw, detail: "Received back into inventory" },
          {
            title: "Net recorded movement",
            key: "net_units",
            icon: ArrowDownLeft,
            detail: `${number(data?.summary.units_in)} in / ${number(data?.summary.units_out)} out`,
          },
        ].map(({ title, key, icon: Icon, detail }) => (
          <Card key={key}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {title}
                <Icon className="size-4" />
              </div>
              <div className="my-2 text-3xl font-semibold tabular-nums">
                {isLoading ? "…" : number(data?.summary[key])}
              </div>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={apply} className="space-y-4">
            <ReportProductSearch selected={productSelection} onSelect={selectProduct} onPreview={setPreview} />
            <p className="text-xs text-muted-foreground">
              {periodLabel}
              {timeRange === "custom"
                ? " · " + filters.from.replace("T", " ") + " — " + filters.to.replace("T", " ")
                : ""}{" "}
              · Times in {data?.timezone || "Asia/Dhaka"}. Weekly shows the last 7 days; month and year presets use
              rolling ranges.
            </p>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
              <label className="space-y-1 text-xs font-medium">
                Search logs
                <Input
                  placeholder="Invoice, vendor, user or comment…"
                  value={draft.search}
                  onChange={(e) => change("search", e.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs font-medium">
                Source
                <select className={selectClass} value={draft.source} onChange={(e) => change("source", e.target.value)}>
                  <option value="">All sources</option>
                  {data?.options.sources.map((source) => (
                    <option key={source} value={source}>
                      {label(source)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium">
                Vendor
                <select
                  className={selectClass}
                  value={draft.supplier_id}
                  onChange={(e) => change("supplier_id", e.target.value)}
                >
                  <option value="">All vendors</option>
                  {data?.options.suppliers.map((supplier) => (
                    <option key={`${supplier.supplier_id}-${supplier.supplier_name}`} value={supplier.supplier_id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium">
                Adjusted / recorded by
                <select
                  className={selectClass}
                  value={draft.actor_id}
                  onChange={(e) => change("actor_id", e.target.value)}
                >
                  <option value="">All users</option>
                  {data?.options.actors.map((actor) => (
                    <option key={`${actor.actor_id}-${actor.actor_name}`} value={actor.actor_id}>
                      {actor.actor_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium">
                Order number
                <Input
                  value={draft.order_no}
                  placeholder="Exact order number"
                  onChange={(e) => change("order_no", e.target.value)}
                />
              </label>
              <div className="flex items-end gap-2">
                <Button type="submit">
                  <Search className="size-4" />
                  Apply filters
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setDraft(emptyFilters);
                    setFilters(emptyFilters);
                    setEventType("");
                    setTimeRange("alltime");
                    setProductSelection(null);
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        {data?.history_notice ||
          "Historical records show surviving data. Full movement logging begins when this feature is installed."}
      </p>
      {error && (
        <div role="alert" className="rounded-lg border border-destructive p-4 text-destructive">
          {error.message}
          <Button className="ml-3" variant="outline" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2" aria-label="Movement types">
        {types.map(([value, text]) => (
          <Button
            key={value}
            size="sm"
            variant={eventType === value ? "default" : "outline"}
            onClick={() => {
              setEventType(value);
              setPage(1);
            }}
          >
            {text}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{number(data?.records.total)} matching movements</p>
        <div className="flex gap-2">
          <Button size="sm" variant={view === "movements" ? "secondary" : "ghost"} onClick={() => setView("movements")}>
            Movement log
          </Button>
          <Button size="sm" variant={view === "daily" ? "secondary" : "ghost"} onClick={() => setView("daily")}>
            Daily summary
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        {view === "movements" ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                {[
                  "Date / type",
                  "Product / variant",
                  "Lot / vendor",
                  "Qty change",
                  "Lot balance",
                  "Purchase cost",
                  "Order / source",
                  "User",
                  "Details",
                ].map((name) => (
                  <th key={name} className="whitespace-nowrap p-3 font-medium">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    Loading inventory movements…
                  </td>
                </tr>
              ) : !data?.records.data.length ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-muted-foreground">
                    {error ? "Report unavailable. Use Retry above." : "No movements match these filters."}
                  </td>
                </tr>
              ) : (
                data.records.data.map((row) => (
                  <tr key={row.id} className="border-t align-top hover:bg-muted/30">
                    <td className="whitespace-nowrap p-3">
                      <div className="text-xs">{timestamp(row.occurred_at)}</div>
                      <Badge variant="secondary" className="mt-1">
                        {label(row.event_type)}
                      </Badge>
                      {row.is_historical && <div className="mt-1 text-xs text-muted-foreground">Historical record</div>}
                    </td>
                    <td className="min-w-56 p-3">
                      <div className="flex items-start gap-3">
                        <ReportProductImage path={row.product_thumbnail_img} title={row.product_title} />
                        <div>
                          <button
                            type="button"
                            className="text-left font-medium hover:text-primary hover:underline"
                            onClick={() => openRowPreview(row)}
                          >
                            {row.product_title}
                          </button>
                          <div className="text-xs text-muted-foreground">
                            {row.variant_label || "Base product"} · {row.sku || "No SKU"}
                          </div>
                          <button
                            type="button"
                            className="mt-1 flex items-center gap-1 text-xs text-primary"
                            onClick={() => openRowPreview(row)}
                          >
                            <Eye className="size-3" />
                            Report preview
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span>Lot #{row.inventory_lot_id}</span>
                      <div className="text-xs">{row.supplier_name || "No vendor"}</div>
                      <div className="text-xs text-muted-foreground">{row.invoice_no}</div>
                    </td>
                    <td
                      className={`p-3 font-semibold tabular-nums ${row.quantity > 0 ? "text-emerald-600" : row.quantity < 0 ? "text-red-600" : ""}`}
                    >
                      {row.quantity > 0 ? "+" : ""}
                      {number(row.quantity)}
                    </td>
                    <td className="whitespace-nowrap p-3 tabular-nums">
                      {row.stock_before ?? "?"} → {row.stock_after ?? "?"}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {money(row.purchase_price)}
                      <div className="text-xs text-muted-foreground">
                        Total:{" "}
                        {row.purchase_price == null
                          ? "Unknown"
                          : money(Math.abs(row.quantity) * Number(row.purchase_price))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{row.order_no || "—"}</div>
                      <div className="text-xs text-muted-foreground">{label(row.source)}</div>
                    </td>
                    <td className="p-3">{row.actor_name || "Unknown"}</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                {["Date", "Movements", "Units in", "Units out", "Net movement"].map((name) => (
                  <th key={name} className="p-3">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.daily.map((day) => (
                <tr key={day.date} className="border-t">
                  <td className="p-3">{day.date}</td>
                  <td className="p-3">{number(day.movements)}</td>
                  <td className="p-3 text-emerald-600">+{number(day.units_in)}</td>
                  <td className="p-3 text-red-600">−{number(day.units_out)}</td>
                  <td className="p-3">{number(day.net_units)}</td>
                </tr>
              ))}
              {!data?.daily.length && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    No daily movements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {view === "movements" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            Rows
            <select
              className={selectClass}
              value={perPage}
              onChange={(e) => {
                setPerPage(e.target.value);
                setPage(1);
              }}
            >
              {["25", "50", "100"].map((count) => (
                <option key={count}>{count}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3 text-sm">
            <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            Page {page} of {data?.records.last_page || 1}
            <Button
              variant="outline"
              disabled={!data || page >= data.records.last_page || isLoading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Custom time range</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose the start and end time in {data?.timezone || "Asia/Dhaka"}.
          </p>
          <label className="space-y-1 text-sm">
            From
            <Input
              type="datetime-local"
              step="1"
              value={customRange.from}
              onChange={(event) => setCustomRange((previous) => ({ ...previous, from: event.target.value }))}
            />
          </label>
          <label className="space-y-1 text-sm">
            To
            <Input
              type="datetime-local"
              step="1"
              min={customRange.from || undefined}
              value={customRange.to}
              onChange={(event) => setCustomRange((previous) => ({ ...previous, to: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!customRange.from || !customRange.to || customRange.from > customRange.to) {
                  toast.error("Choose a valid start and end time.");
                  return;
                }
                setFilters((previous) => ({ ...previous, ...customRange }));
                setDraft((previous) => ({ ...previous, ...customRange }));
                setTimeRange("custom");
                setPage(1);
                setCustomOpen(false);
              }}
            >
              Apply range
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {preview && (
        <ProductReportPreview
          key={String(preview.id) + "-" + (preview.variant?.id || "all")}
          product={preview}
          query={query.toString()}
          periodLabel={periodLabel}
          onClose={() => setPreview(null)}
          onSelect={(product) => {
            selectProduct(product);
            setPreview(null);
          }}
        />
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Movement #{selected?.id} · {label(selected?.event_type || "")}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <p className="font-medium">
                {selected.product_title} · {selected.variant_label || "Base product"}
              </p>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ["Recorded time", timestamp(selected.occurred_at)],
                  ["Lot", selected.inventory_lot_id],
                  ["Vendor", selected.supplier_name],
                  ["Invoice", selected.invoice_no],
                  ["Quantity change", selected.quantity],
                  ["Unit purchase cost", money(selected.purchase_price)],
                  ["Invoice total", money(selected.total_amount)],
                  ["Paid", money(selected.paid_amount)],
                  ["Due", money(selected.due_amount)],
                  ["Payment status", selected.payment_status],
                  ["Order", selected.order_no],
                  ["Source", label(selected.source)],
                  ["User", selected.actor_name],
                  ["Record origin", selected.is_historical ? "Imported surviving record" : "Live movement"],
                ].map(([key, value]) => (
                  <div key={String(key)}>
                    <dt className="text-xs text-muted-foreground">{key}</dt>
                    <dd className="break-words">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="text-xs text-muted-foreground">Memo / comment</p>
                <p className="whitespace-pre-wrap">{selected.comment || "No comment recorded."}</p>
              </div>
              {selected.memo_image && (
                <a
                  className="inline-block text-primary underline"
                  href={memoUrl(selected.memo_image)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open purchase memo
                </a>
              )}
              {selected.metadata && Object.keys(selected.metadata).some((key) => key !== "lot_created") && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Recorded changes / provenance</p>
                  <dl className="space-y-2 rounded bg-muted p-3 text-xs">
                    {Object.entries(selected.metadata)
                      .filter(([key]) => key !== "lot_created")
                      .map(([key, value]) => (
                        <div key={key}>
                          <dt className="font-medium">{label(key)}</dt>
                          <dd className="break-words">
                            {value && typeof value === "object" && "before" in value && "after" in value
                              ? String(value.before ?? "—") + " → " + String(value.after ?? "—")
                              : String(value ?? "—")}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
