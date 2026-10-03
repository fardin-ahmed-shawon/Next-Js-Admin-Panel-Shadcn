"use client";

import * as React from "react";
import { AlertTriangle, Box, Droplets, Loader2, Scale, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchClient } from "@/lib/fetch-client";
import type { InventoryLowStockRule } from "@/hooks/useInventory";

interface LowStockRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRule?: InventoryLowStockRule;
  onRulesSaved?: () => void;
}

export function LowStockRulesModal({
  open,
  onOpenChange,
  currentRule,
  onRulesSaved,
}: LowStockRulesModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Form state
  const [pieceThreshold, setPieceThreshold] = React.useState("10");
  const [weightThreshold, setWeightThreshold] = React.useState("10");
  const [weightUnit, setWeightUnit] = React.useState<"kg" | "g">("kg");
  const [volumeThreshold, setVolumeThreshold] = React.useState("10");
  const [volumeUnit, setVolumeUnit] = React.useState<"l" | "ml">("l");

  // Load rules when opened
  React.useEffect(() => {
    if (!open) return;

    if (currentRule) {
      setPieceThreshold(String(currentRule.piece_threshold ?? 10));
      setWeightThreshold(String(currentRule.weight_threshold ?? 10));
      setWeightUnit((currentRule.weight_unit === "g" || currentRule.weight_unit === "gm") ? "g" : "kg");
      setVolumeThreshold(String(currentRule.volume_threshold ?? 10));
      setVolumeUnit(currentRule.volume_unit === "ml" ? "ml" : "l");
      return;
    }

    const fetchRules = async () => {
      try {
        setLoading(true);
        const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/low-stock-rules`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const r = json.data;
          setPieceThreshold(String(r.piece_threshold ?? 10));
          setWeightThreshold(String(r.weight_threshold ?? 10));
          setWeightUnit((r.weight_unit === "g" || r.weight_unit === "gm") ? "g" : "kg");
          setVolumeThreshold(String(r.volume_threshold ?? 10));
          setVolumeUnit(r.volume_unit === "ml" ? "ml" : "l");
        }
      } catch (error) {
        console.error("Failed to load low stock rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [open, currentRule]);

  // Handle unit toggle with instant conversion
  const handleWeightUnitChange = (newUnit: "kg" | "g") => {
    if (newUnit === weightUnit) return;
    const num = Number(weightThreshold);
    if (!isNaN(num) && num > 0) {
      if (newUnit === "g" && weightUnit === "kg") {
        setWeightThreshold(String(Math.round(num * 1000)));
      } else if (newUnit === "kg" && weightUnit === "g") {
        setWeightThreshold(String(Number((num / 1000).toFixed(3))));
      }
    }
    setWeightUnit(newUnit);
  };

  const handleVolumeUnitChange = (newUnit: "l" | "ml") => {
    if (newUnit === volumeUnit) return;
    const num = Number(volumeThreshold);
    if (!isNaN(num) && num > 0) {
      if (newUnit === "ml" && volumeUnit === "l") {
        setVolumeThreshold(String(Math.round(num * 1000)));
      } else if (newUnit === "l" && volumeUnit === "ml") {
        setVolumeThreshold(String(Number((num / 1000).toFixed(3))));
      }
    }
    setVolumeUnit(newUnit);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const p = Number(pieceThreshold);
    if (isNaN(p) || p < 0 || !Number.isInteger(p)) {
      toast.error("Please enter a valid piece count threshold (integer >= 0).");
      return;
    }

    const w = Number(weightThreshold);
    if (isNaN(w) || w < 0) {
      toast.error("Please enter a valid weight threshold (>= 0).");
      return;
    }

    const v = Number(volumeThreshold);
    if (isNaN(v) || v < 0) {
      toast.error("Please enter a valid volume threshold (>= 0).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        piece_threshold: p,
        weight_threshold: w,
        weight_unit: weightUnit,
        volume_threshold: v,
        volume_unit: volumeUnit,
      };

      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/low-stock-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Low stock alert rules saved successfully.");
        onOpenChange(false);
        if (onRulesSaved) {
          onRulesSaved();
        }
      } else {
        toast.error(json.message || "Failed to save low stock rules.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving rules.");
    } finally {
      setSaving(false);
    }
  };

  const parsedWeight = Number(weightThreshold) || 0;
  const parsedVolume = Number(volumeThreshold) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-w-full">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Low Stock Product Setup Rules</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set threshold rules to determine which products trigger the Low Stock badge on the Inventory page.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            Loading rules...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* 1. Piece unit products */}
            <div className="p-3.5 rounded-lg border bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="size-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Piece Unit Products
                  </span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">Standard items</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="piece-threshold" className="text-xs font-medium">
                    Low Stock Threshold (pieces)
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="piece-threshold"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 10"
                    value={pieceThreshold}
                    onChange={(e) => setPieceThreshold(e.target.value)}
                    disabled={saving}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                    pieces
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Products with available stock at or below this count will be flagged as Low Stock.
                </p>
              </div>
            </div>

            {/* 2. Shared Bulk Products - Weight */}
            <div className="p-3.5 rounded-lg border bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-emerald-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Shared Bulk Stock — Weight (kg / g)
                  </span>
                </div>
                {/* Unit Toggle Pill */}
                <div className="inline-flex items-center gap-1 bg-muted p-0.5 rounded-md border text-xs">
                  <button
                    type="button"
                    onClick={() => handleWeightUnitChange("kg")}
                    className={`px-2 py-0.5 text-xs font-semibold rounded transition-all ${
                      weightUnit === "kg"
                        ? "bg-background text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Kilogram (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeightUnitChange("g")}
                    className={`px-2 py-0.5 text-xs font-semibold rounded transition-all ${
                      weightUnit === "g"
                        ? "bg-background text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Gram (g)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weight-threshold" className="text-xs font-medium">
                    Low Stock Threshold ({weightUnit === "kg" ? "kg" : "g"})
                  </Label>
                  {parsedWeight > 0 && (
                    <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                      = {weightUnit === "kg" ? `${(parsedWeight * 1000).toLocaleString()} g base` : `${(parsedWeight / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="weight-threshold"
                    type="number"
                    min="0"
                    step={weightUnit === "kg" ? "any" : "1"}
                    placeholder="e.g. 100"
                    value={weightThreshold}
                    onChange={(e) => setWeightThreshold(e.target.value)}
                    disabled={saving}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground uppercase pointer-events-none">
                    {weightUnit}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Bulk weight products (e.g. Dates) with stock at or below this weight will show as Low Stock.
                </p>
              </div>
            </div>

            {/* 3. Shared Bulk Products - Volume */}
            <div className="p-3.5 rounded-lg border bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="size-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Shared Bulk Stock — Volume (L / ml)
                  </span>
                </div>
                {/* Unit Toggle Pill */}
                <div className="inline-flex items-center gap-1 bg-muted p-0.5 rounded-md border text-xs">
                  <button
                    type="button"
                    onClick={() => handleVolumeUnitChange("l")}
                    className={`px-2 py-0.5 text-xs font-semibold rounded transition-all ${
                      volumeUnit === "l"
                        ? "bg-background text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Litre (L)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVolumeUnitChange("ml")}
                    className={`px-2 py-0.5 text-xs font-semibold rounded transition-all ${
                      volumeUnit === "ml"
                        ? "bg-background text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Millilitre (ml)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume-threshold" className="text-xs font-medium">
                    Low Stock Threshold ({volumeUnit === "l" ? "L" : "ml"})
                  </Label>
                  {parsedVolume > 0 && (
                    <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                      = {volumeUnit === "l" ? `${(parsedVolume * 1000).toLocaleString()} ml base` : `${(parsedVolume / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} L`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="volume-threshold"
                    type="number"
                    min="0"
                    step={volumeUnit === "l" ? "any" : "1"}
                    placeholder="e.g. 50"
                    value={volumeThreshold}
                    onChange={(e) => setVolumeThreshold(e.target.value)}
                    disabled={saving}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground uppercase pointer-events-none">
                    {volumeUnit}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Bulk liquid products (e.g. Mustard Oil) with stock at or below this volume will show as Low Stock.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || loading}>
                {saving && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Save Rules
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
