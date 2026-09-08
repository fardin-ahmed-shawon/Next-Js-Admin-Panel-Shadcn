"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import useInventoryReport from "@/hooks/useInventoryReport";
import { ReportProductImage, type ReportProductSelection } from "./report-product-search";

export function ProductReportPreview({
  product,
  query,
  periodLabel,
  onClose,
  onSelect,
}: {
  product: ReportProductSelection;
  query: string;
  periodLabel: string;
  onClose: () => void;
  onSelect: (product: ReportProductSelection) => void;
}) {
  const [page, setPage] = useState(1);
  const params = new URLSearchParams(query);
  params.set("product_id", String(product.id));
  params.delete("product_variant_id");
  params.delete("inventory_lot_id");
  if (product.variant) params.set("product_variant_id", String(product.variant.id));
  params.set("page", String(page));
  params.set("per_page", "10");
  const { data, error, isLoading, mutate } = useInventoryReport(params.toString());
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product report preview</DialogTitle>
          <DialogDescription>{periodLabel} · Uses your current report filters.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <ReportProductImage path={product.product_thumbnail_img} title={product.title} className="size-14" />
          <div>
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-sm text-muted-foreground">
              {product.variant?.label || "All variants"} · {product.variant?.sku || product.sku || "No SKU"}
            </p>
          </div>
        </div>
        {error ? (
          <div role="alert">
            {error.message}
            <Button variant="outline" onClick={() => mutate()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Purchased", "purchased_units"],
                ["Order deductions", "ordered_units"],
                ["Returned", "returned_units"],
                ["Net movement", "net_units"],
              ].map(([title, key]) => (
                <div key={key} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{title}</p>
                  <p className="mt-1 text-xl font-semibold">
                    {isLoading ? "…" : Number(data?.summary[key] || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    {["When", "Movement", "Variant / SKU", "Quantity", "Unit cost", "Order"].map((heading) => (
                      <th className="p-2" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center">
                        Loading preview…
                      </td>
                    </tr>
                  ) : data?.records.data.length ? (
                    data.records.data.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="whitespace-nowrap p-2 text-xs">
                          {new Date(row.occurred_at).toLocaleString("en-GB", { timeZone: data.timezone })}
                        </td>
                        <td className="p-2 capitalize">{row.event_type.replaceAll("_", " ")}</td>
                        <td className="p-2 text-xs">
                          {row.variant_label || "Base product"}
                          <div className="text-muted-foreground">{row.sku}</div>
                        </td>
                        <td className={`p-2 font-medium ${row.quantity < 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {row.quantity > 0 ? "+" : ""}
                          {row.quantity}
                        </td>
                        <td className="whitespace-nowrap p-2">
                          {row.purchase_price == null ? "Unknown" : `৳${Number(row.purchase_price).toLocaleString()}`}
                        </td>
                        <td className="p-2">{row.order_no || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        No movements for this product with the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>{data?.records.total || 0} matching movements</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={page === 1 || isLoading} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span>
                  {page} / {data?.records.last_page || 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!data || page >= data.records.last_page || isLoading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          Historical gaps and unknown costs also apply to this preview. Net movement is not a closing stock balance.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onSelect(product)}>View full report</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
