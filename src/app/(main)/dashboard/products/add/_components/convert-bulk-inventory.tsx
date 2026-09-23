"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchClient } from "@/lib/fetch-client";

import { BulkPackOptions, validateBulkPacks } from "./bulk-pack-options";
import type { Variant } from "./product-variants-section";

export function ConvertBulkInventory({ productId, stock, sku }: { productId: string; stock: number; sku: string }) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState("kg");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  async function convert() {
    const error = validateBulkPacks(variants);
    if (error) {
      toast.error(error);
      return;
    }
    if (!confirmed) return;
    setSaving(true);
    try {
      const response = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}products/${productId}/inventory/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            unit_code: unit,
            confirm: true,
            variants: variants.map((v) => ({
              sku: v.sku,
              option_label: v.option_label,
              sale_quantity: v.sale_quantity,
              sale_unit_code: v.sale_unit_code,
              regular_price: v.regularPrice || v.sellingPrice,
              selling_price: v.sellingPrice,
            })),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not convert inventory.");
      toast.success("Inventory converted. All pack sizes now use the shared stock.");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not convert inventory.");
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Convert existing stock to weight / volume
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Convert existing stock to shared bulk inventory</DialogTitle>
          <DialogDescription>
            Use this for a simple product whose saved quantities already represent weight or volume. Save other product
            edits before converting. Products with existing order history require a historical inventory migration before conversion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>What does one existing stock unit represent?</Label>
          <Select
            disabled={saving}
            value={unit}
            onValueChange={(value) => {
              setUnit(value);
              setVariants([]);
              setConfirmed(false);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">One kilogram</SelectItem>
              <SelectItem value="g">One gram</SelectItem>
              <SelectItem value="l">One litre</SelectItem>
              <SelectItem value="ml">One millilitre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border bg-muted p-4 text-sm">
          Existing stock: <strong>{stock} units</strong>. After conversion:{" "}
          <strong>
            {stock} {unit}
          </strong>
          . Purchase lots and their total value are preserved. Every pack will draw from this shared balance.
        </div>
        <BulkPackOptions variants={variants} setVariants={setVariants} unit={unit} baseSku={sku} />
        <div className="flex items-start gap-2">
          <Checkbox
            id="confirm-bulk-conversion"
            disabled={saving}
            checked={confirmed}
            onCheckedChange={(value) => setConfirmed(value === true)}
          />
          <Label htmlFor="confirm-bulk-conversion">
            I confirm the existing stock numbers represent {unit}. I understand this changes stock measurement and
            cannot be reversed in the product editor.
          </Label>
        </div>
        <Button type="button" disabled={saving || !confirmed || !variants.length} onClick={convert}>
          {saving ? "Converting…" : "Convert inventory and create pack sizes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
