"use client";

import * as React from "react";
import { Loader2, PackageCheck } from "lucide-react";
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

interface SetPackedQuantityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: any;
  parentItem: any;
  mutate?: () => void;
}

export function SetPackedQuantityModal({
  open,
  onOpenChange,
  variant,
  parentItem,
  mutate,
}: SetPackedQuantityModalProps) {
  const [packedQty, setPackedQty] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && variant) {
      setPackedQty(String(variant.packed_qty ?? 0));
    }
  }, [open, variant]);

  const unit = parentItem?.inventory_unit_code || "unit";
  const currentPacked = variant?.packed_qty ?? 0;
  const unpackedDisplay = parentItem?.unpacked_display ?? 0;
  const totalStock = parentItem?.stock ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(packedQty, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid non-negative packed quantity.");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const baseClean = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      const response = await fetchClient(`${baseClean}inventory/variants/${variant.id}/packed-qty`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packed_qty: qty }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update packed quantity.");
      }

      toast.success("Ready packed quantity updated successfully.");
      onOpenChange(false);
      mutate?.();
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <PackageCheck className="size-5" />
              </div>
              <div>
                <DialogTitle>Set Ready Packed Quantity</DialogTitle>
                <DialogDescription>
                  Update ready-to-sell packets on shelf for {variant?.name}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            <div className="rounded-lg bg-muted/60 p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Total Stock:</span>
                <span className="font-medium">{totalStock} {unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Unpacked:</span>
                <span className="font-medium text-blue-600">{unpackedDisplay} {unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currently Ready Packed:</span>
                <span className="font-semibold text-emerald-600">{currentPacked} packs</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packed_qty">Actual Ready Packs (on shelf)</Label>
              <Input
                id="packed_qty"
                type="number"
                min="0"
                step="1"
                value={packedQty}
                onChange={(e) => setPackedQty(e.target.value)}
                placeholder="e.g. 50"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the number of physical packs of this size that are already weighed, packaged, and ready to ship.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
