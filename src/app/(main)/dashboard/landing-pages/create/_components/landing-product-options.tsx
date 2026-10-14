"use client";
import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/fetch-client";
import type { LandingProductSelection } from "@/lib/landing-pages";
import { Button } from "@/components/ui/button";

type Product = { title: string; is_bundle?: boolean; variants?: { id: number; sku: string; option_label?: string; sale_quantity?: number; sale_unit_code?: string; color?: { label: string }; size?: { label: string } }[] };

export function LandingProductOptions({ value, onChange, onRemove, primary, onPrimary }: { value: LandingProductSelection; onChange: (value: LandingProductSelection) => void; onRemove: () => void; primary: boolean; onPrimary: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    fetchClient(`${(process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "")}/product/${value.product_id}`, { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("Unable to load product options."); return response.json(); })
      .then(body => setProduct(body.data))
      .catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [value.product_id, retry]);
  const variants = product?.variants || [];
  return <div className="space-y-3 rounded-lg border p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><strong>{product?.title || `Product #${value.product_id}`}{product?.is_bundle ? " · Bundle" : ""}</strong><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={primary} onClick={onPrimary}>{primary ? "Primary product" : "Make primary"}</Button><Button type="button" size="sm" variant="ghost" onClick={onRemove}>Remove</Button></div></div>
    {error ? <p role="alert" className="text-sm text-destructive">{error} <button type="button" onClick={() => setRetry(v => v + 1)}>Retry</button></p> : !product ? <p className="text-sm">Loading options…</p> : variants.length > 0 && !product.is_bundle ? <>
      <label className="block space-y-2 text-sm"><span>Variants / packs shown in checkout</span><select className="w-full rounded-md border bg-background p-2" value={value.variant_mode} onChange={event => onChange({ ...value, variant_mode: event.target.value as "all" | "selected", variant_ids: [] })}><option value="all">All variants / packs — customer selects in checkout</option><option value="selected">Only selected variants / packs</option></select></label>
      {value.variant_mode === "selected" && <div className="grid max-h-64 gap-2 overflow-auto sm:grid-cols-2">{variants.map(variant => <label key={variant.id} className="flex items-center gap-2 rounded border p-2 text-sm"><input type="checkbox" checked={value.variant_ids.includes(variant.id)} onChange={event => onChange({ ...value, variant_ids: event.target.checked ? [...value.variant_ids, variant.id] : value.variant_ids.filter(id => id !== variant.id) })} />{variant.option_label || [variant.color?.label, variant.size?.label].filter(Boolean).join(" / ") || (variant.sale_quantity ? `${variant.sale_quantity} ${variant.sale_unit_code}` : variant.sku || `Variant #${variant.id}`)}</label>)}</div>}
    </> : <p className="text-sm text-muted-foreground">{product.is_bundle ? "Customers select this complete bundle in checkout. Stock follows its component products." : "Customers select this product and quantity in checkout."}</p>}
  </div>;
}
