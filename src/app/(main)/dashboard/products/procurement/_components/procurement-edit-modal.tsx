"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Edit, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";

interface Lot {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  purchase_price: number;
  initial_qty: number;
  remaining_qty: number;
  source_type: string;
  supplier_id?: number | null;
  comment: string | null;
  product?: {
    id: number;
    title: string;
    product_thumbnail_img?: string | null;
  } | null;
  variant?: {
    id: number;
    sku: string;
    size?: { id: number; label: string } | null;
    color?: { id: number; label: string } | null;
  } | null;
  supplier?: {
    id: number;
    name: string;
  } | null;
}

interface SupplierOption {
  id: number;
  name: string;
}

interface ProcurementEditModalProps {
  lot: Lot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

export function ProcurementEditModal({ lot, open, onOpenChange, onSuccess }: ProcurementEditModalProps) {
  const [purchasePrice, setPurchasePrice] = React.useState<string>(lot.purchase_price.toString());
  const [quantity, setQuantity] = React.useState<string>(lot.initial_qty.toString());
  const [sourceType, setSourceType] = React.useState<string>(lot.source_type || "vendor");
  const [supplierId, setSupplierId] = React.useState<string>(lot.supplier_id ? lot.supplier_id.toString() : (lot.supplier?.id ? lot.supplier.id.toString() : "0"));
  const [comment, setComment] = React.useState<string>(lot.comment || "");
  const [suppliers, setSuppliers] = React.useState<SupplierOption[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPurchasePrice(lot.purchase_price.toString());
      setQuantity(lot.initial_qty.toString());
      setSourceType(lot.source_type || "vendor");
      setSupplierId(lot.supplier_id ? lot.supplier_id.toString() : (lot.supplier?.id ? lot.supplier.id.toString() : "0"));
      setComment(lot.comment || "");

      const fetchSuppliersList = async () => {
        try {
          setLoadingSuppliers(true);
          const res = await fetchClient(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers?all=true`
          );
          const data = await res.json();
          if (res.ok && data.success) {
            setSuppliers(data.data || []);
          }
        } catch (err) {
          console.error("Failed to load suppliers:", err);
        } finally {
          setLoadingSuppliers(false);
        }
      };

      fetchSuppliersList();
    }
  }, [open, lot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!purchasePrice || Number(purchasePrice) < 0) {
      toast.error("Please enter a valid purchase price.");
      return;
    }

    if (!quantity || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      toast.error("Please enter a valid quantity (greater than 0).");
      return;
    }

    // Check if new quantity would result in negative remaining quantity
    const qtyDelta = Number(quantity) - lot.initial_qty;
    if (lot.remaining_qty + qtyDelta < 0) {
      toast.error("Cannot reduce quantity below the amount already consumed.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        purchase_price: Number(purchasePrice),
        initial_qty: Number(quantity),
        source_type: sourceType,
        supplier_id: Number(supplierId) || 0,
        comment: comment || null,
      };

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots/${lot.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Lot updated successfully.");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(data.message || "Failed to update lot.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during update.");
    } finally {
      setSubmitting(false);
    }
  };

  const variantLabel = lot.variant
    ? [
        lot.variant.size?.label && `Size: ${lot.variant.size.label}`,
        lot.variant.color?.label && `Color: ${lot.variant.color.label}`,
        lot.variant.sku && `SKU: ${lot.variant.sku}`,
      ]
        .filter(Boolean)
        .join(" / ")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-full">
        <DialogHeader>
          <DialogTitle>Edit Stock Lot #{lot.id}</DialogTitle>
          <DialogDescription>
            Modify purchase price, initial quantity, or supplier details. Remaining quantity will be adjusted automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Read-only product info */}
          <div className="rounded-md border bg-muted/50 p-3 flex gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-background">
              <img
                src={getImageUrl(lot.product?.product_thumbnail_img)}
                alt={lot.product?.title || "Product"}
                className="size-full object-cover"
              />
            </div>
            <div className="space-y-1 flex-1">
              <div className="font-medium text-sm">
                {lot.product?.title || "Unknown Product"}
              </div>
              {variantLabel && (
                <div className="text-xs text-muted-foreground">
                  {variantLabel}
                </div>
              )}
              <div className="flex gap-4 pt-1 mt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                      Current Consumed: <span className="font-semibold text-foreground">{lot.initial_qty - lot.remaining_qty}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                      Current Remaining: <span className="font-semibold text-foreground">{lot.remaining_qty}</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Quantity & Purchase Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Acquisition Quantity <span className="text-destructive">*</span></Label>
              <Input
                id="qty"
                type="number"
                min="1"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Purchase Price (৳) <span className="text-destructive">*</span></Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Source Type & Supplier Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Source Type</Label>
              <Select
                value={sourceType}
                onValueChange={setSourceType}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">Vendor / Purchase</SelectItem>
                  <SelectItem value="return">Customer Return</SelectItem>
                  <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                  <SelectItem value="production">In-house Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-supplier-select">Supplier</Label>
                <Link
                  href="/dashboard/suppliers"
                  target="_blank"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
              <Select
                value={supplierId}
                onValueChange={setSupplierId}
                disabled={submitting || loadingSuppliers}
              >
                <SelectTrigger id="edit-supplier-select">
                  <SelectValue placeholder="Select supplier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Supplier / General</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <Label htmlFor="comment">Procurement Note / Comments</Label>
            <Textarea
              id="comment"
              placeholder="Supplier invoice reference, adjustments details, etc..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
