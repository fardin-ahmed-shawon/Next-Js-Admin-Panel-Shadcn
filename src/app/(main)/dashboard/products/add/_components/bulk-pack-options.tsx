"use client";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Variant } from "./product-variants-section";

export function BulkPackOptions({
  variants,
  setVariants,
  unit,
  baseSku,
}: {
  variants: Variant[];
  setVariants: Dispatch<SetStateAction<Variant[]>>;
  unit: string;
  baseSku: string;
}) {
  const units = ["kg", "g"].includes(unit) ? ["kg", "g"] : ["l", "ml"];
  function update(id: string, field: keyof Variant, value: string) {
    setVariants((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [field]: value };
        if (field === "sale_quantity" || field === "sale_unit_code") {
          next.option_label = `${next.sale_quantity} ${next.sale_unit_code}`;
          next.size = next.option_label;
        }
        return next;
      }),
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Each pack draws from the same bulk stock. For example, two 5 kg packs consume 10 kg. Set the selling price for
        one pack using whole-number prices. To change a saved pack quantity, remove it and add a new option. Free shipping can be enabled per pack; product-wide free shipping applies to all packs.
      </p>
      <div className="space-y-3">
        {variants.map((v) => (
          <div key={v.id} className="rounded-lg border p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
<label className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Quantity</span>
                  <Input
                    aria-label="Pack quantity"
                    disabled={/^\d+$/.test(v.id)}
                    type="number"
                    min="0.001"
                    step="any"
                    value={v.sale_quantity || ""}
                    onChange={(e) => update(v.id, "sale_quantity", e.target.value)}
                  />
                </label>
<label className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Unit</span>
                  <select
                    aria-label="Pack unit"
                    disabled={/^\d+$/.test(v.id)}
                    className="h-9 w-full rounded-md border bg-background px-2"
                    value={v.sale_unit_code || unit}
                    onChange={(e) => update(v.id, "sale_unit_code", e.target.value)}
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
<label className="min-w-0 space-y-2 text-sm"><span className="block font-medium">SKU</span>
                  <Input aria-label="Pack SKU" value={v.sku} onChange={(e) => update(v.id, "sku", e.target.value)} />
                </label>
<label className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Regular price</span>
                  <Input
                    aria-label="Pack regular price"
                    type="number"
                    min="0"
                    step="1"
                    value={v.regularPrice || ""}
                    onChange={(e) => update(v.id, "regularPrice", e.target.value)}
                  />
                </label>
<label className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Selling price</span>
                  <Input
                    aria-label="Pack selling price"
                    type="number"
                    min="0"
                    step="1"
                    value={v.sellingPrice || ""}
                    onChange={(e) => update(v.id, "sellingPrice", e.target.value)}
                  />
                </label>
            </div>
            <div className="grid grid-cols-2 items-end gap-4 lg:grid-cols-4">
<div className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Available packs</span>{v.stock || "Calculated after saving"}</div>
<div className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Free shipping</span><input type="checkbox" aria-label="Pack free shipping" checked={!!v.has_free_shipping} onChange={e => setVariants(rows => rows.map(row => row.id === v.id ? { ...row, has_free_shipping: e.target.checked } : row))} /></div>
<div className="min-w-0 space-y-2 text-sm"><span className="block font-medium">Visibility</span>
                  <select
                    aria-label="Pack visibility"
                    className="h-9 w-full rounded-md border bg-background px-2 text-xs"
                    value={v.status || "active"}
                    onChange={(e) => update(v.id, "status" as any, e.target.value)}
                  >
                    <option value="active">Visible Everywhere</option>
                    <option value="hide_storefront">Hide from Store Front</option>
                    <option value="hidden">Hide from Full System</option>
                  </select>
                </div>
<div className="min-w-0 space-y-2 text-sm"><span className="block font-medium"></span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVariants((rows) => rows.filter((row) => row.id !== v.id))}
                  >
                    Remove
                  </Button>
                </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setVariants((rows) => [
            ...rows,
            {
              id: `v${crypto.randomUUID()}`,
              sku: `${baseSku}-PACK-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
              color: "",
              size: `1 ${unit}`,
              option_label: `1 ${unit}`,
              sale_quantity: "1",
              sale_unit_code: unit,
              stock: "",
              regularPrice: "",
              sellingPrice: "",
              status: "active",
            },
          ])
        }
      >
        Add pack size
      </Button>
    </div>
  );
}

export function validateBulkPacks(variants: Variant[]) {
  if (!variants.length) return "Add at least one pack size.";
  const keys = new Set<number>();
  for (const v of variants) {
    const base = Number(v.sale_quantity) * (["kg", "l"].includes(v.sale_unit_code || "") ? 1000 : 1);
    if (!Number.isFinite(base) || base <= 0 || Math.abs(base - Math.round(base)) > 0.000001)
      return "Pack sizes must be positive whole grams or millilitres.";
    if (keys.has(Math.round(base))) return "Each pack size must be unique.";
    keys.add(Math.round(base));
    if (!v.sku.trim()) return "Every pack needs a SKU.";
    if (!v.sellingPrice || !Number.isSafeInteger(Number(v.sellingPrice)) || Number(v.sellingPrice) < 0)
      return "Every pack needs a non-negative whole-number selling price.";
    if (v.regularPrice && (!Number.isSafeInteger(Number(v.regularPrice)) || Number(v.regularPrice) < 0))
      return "Pack regular prices must be non-negative whole numbers.";
  }
  return null;
}
