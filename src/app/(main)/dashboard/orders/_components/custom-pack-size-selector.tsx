"use client";

import * as React from "react";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchClient } from "@/lib/fetch-client";

interface CustomPackSizeSelectorProps {
  item: any;
  updateCartItem: (id: string | number, field: string, value: any) => void;
  updateUnitPrice: (id: string | number, price: number) => void;
}

export function calculateSharedBulkPrice(product: any, qty: number, unit: string): number {
  if (!qty || qty <= 0) return 0;

  const productUnit = (product.inventory_unit_code || "kg").toLowerCase();
  const productPrice = Number(product.selling_price || 0);

  // Normalize custom qty to base unit (grams or ml)
  let baseQty = qty;
  if (unit === "kg" || unit === "l") {
    baseQty = qty * 1000;
  }

  // Derive unit rate from existing variant if available
  const variants = product.variants || [];
  const variantWithPrice = variants.find((v: any) => {
    const bq = Number(v.base_quantity_per_sale || 0);
    const vp = Number(v.variant_pricing?.selling_price || v.selling_price || 0);
    return bq > 0 && vp > 0;
  });

  if (variantWithPrice) {
    const bq = Number(variantWithPrice.base_quantity_per_sale);
    const vp = Number(variantWithPrice.variant_pricing?.selling_price || variantWithPrice.selling_price);
    const ratePerBase = vp / bq;
    return Math.round(ratePerBase * baseQty * 100) / 100;
  }

  // Fallback to product selling_price
  const baseDivider = (productUnit === "kg" || productUnit === "l") ? 1000 : 1;
  const ratePerBase = productPrice / baseDivider;
  return Math.round(ratePerBase * baseQty * 100) / 100;
}

export function CustomPackSizeSelector({
  item,
  updateCartItem,
  updateUnitPrice,
}: CustomPackSizeSelectorProps) {
  const isSharedBulk = item?.product?.inventory_mode === "shared_bulk";
  if (!isSharedBulk) return null;

  const productUnit = (item.product.inventory_unit_code || "kg").toLowerCase();
  const isWeight = ["kg", "g"].includes(productUnit);
  const isVolume = ["l", "ml", "liter", "litre"].includes(productUnit);

  const defaultUnit = isWeight ? "g" : isVolume ? "ml" : productUnit;

  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [customQty, setCustomQty] = React.useState("");
  const [customUnit, setCustomUnit] = React.useState(defaultUnit);
  const [loading, setLoading] = React.useState(false);

  const livePrice = React.useMemo(() => {
    const q = parseFloat(customQty);
    if (isNaN(q) || q <= 0) return 0;
    return calculateSharedBulkPrice(item.product, q, customUnit);
  }, [item.product, customQty, customUnit]);

  const handleApply = async () => {
    const q = parseFloat(customQty);
    if (isNaN(q) || q <= 0) {
      toast.error("Please enter a valid pack size quantity.");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const baseClean = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

      const response = await fetchClient(`${baseClean}products/${item.product.id}/custom-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: q,
          unit: customUnit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create custom pack.");
      }

      const resData = await response.json();
      if (resData.variant) {
        if (!item.product.variants) item.product.variants = [];
        const exists = item.product.variants.some((v: any) => v.id === resData.variant.id);
        if (!exists) {
          item.product.variants.push(resData.variant);
        }
      }

      const itemId = item.lineId ?? item.product.id;
      updateCartItem(itemId, "size", resData.size_label);
      updateUnitPrice(itemId, Number(resData.price));

      toast.success(`Custom pack size (${resData.size_label}) applied at ৳${Number(resData.price).toFixed(2)}`);
      setIsCustomMode(false);
      setCustomQty("");
    } catch (err: any) {
      toast.error(err.message || "Failed to apply custom pack size.");
    } finally {
      setLoading(false);
    }
  };

  if (!isCustomMode) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsCustomMode(true)}
        className="h-7 text-xs px-2 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary shrink-0"
        title="Create a custom pack size with auto-calculated price"
      >
        <Plus className="size-3 mr-1" />
        Custom Pack
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap bg-primary/5 p-1.5 rounded-md border border-primary/20 animate-in fade-in-50">
      <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
        <Sparkles className="size-3" /> Custom Pack:
      </span>
      <Input
        type="number"
        min="0.01"
        step="any"
        className="h-7 w-20 text-xs bg-background"
        placeholder="e.g. 750"
        value={customQty}
        onChange={(e) => setCustomQty(e.target.value)}
        autoFocus
      />
      <Select value={customUnit} onValueChange={setCustomUnit}>
        <SelectTrigger className="h-7 w-20 text-xs bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {isWeight ? (
            <>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
            </>
          ) : isVolume ? (
            <>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="l">L</SelectItem>
            </>
          ) : (
            <SelectItem value={productUnit}>{productUnit}</SelectItem>
          )}
        </SelectContent>
      </Select>

      <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
        ৳{livePrice.toFixed(2)}
      </div>

      <Button
        type="button"
        size="sm"
        className="h-7 text-xs px-2.5"
        disabled={loading || !customQty || Number(customQty) <= 0}
        onClick={handleApply}
      >
        {loading && <Loader2 className="mr-1 size-3 animate-spin" />}
        Apply
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        disabled={loading}
        onClick={() => {
          setIsCustomMode(false);
          setCustomQty("");
        }}
        title="Cancel"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
