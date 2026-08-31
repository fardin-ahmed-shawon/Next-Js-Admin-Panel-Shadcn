"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Edit, ExternalLink, Upload, X, Banknote, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
  invoice_no?: string | null;
  memo_image?: string | null;
  total_amount?: number | null;
  paid_amount?: number | null;
  due_amount?: number | null;
  payment_status?: string | null;
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
  const [invoiceNo, setInvoiceNo] = React.useState<string>(lot.invoice_no || "");
  const [memoImage, setMemoImage] = React.useState<File | null>(null);
  const [memoImagePreview, setMemoImagePreview] = React.useState<string | null>(lot.memo_image ? getImageUrl(lot.memo_image) : null);
  const [paidAmount, setPaidAmount] = React.useState<string>(lot.paid_amount !== undefined && lot.paid_amount !== null ? lot.paid_amount.toString() : "");
  const [comment, setComment] = React.useState<string>(lot.comment || "");
  const [suppliers, setSuppliers] = React.useState<SupplierOption[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const memoImageRef = React.useRef<HTMLInputElement>(null);

  // Computed financial amounts
  const totalAmount = React.useMemo(() => {
    const qty = Number(quantity) || 0;
    const price = Number(purchasePrice) || 0;
    return qty * price;
  }, [quantity, purchasePrice]);

  const dueAmount = React.useMemo(() => {
    const paid = Number(paidAmount) || 0;
    return Math.max(0, totalAmount - paid);
  }, [totalAmount, paidAmount]);

  React.useEffect(() => {
    if (open) {
      setPurchasePrice(lot.purchase_price.toString());
      setQuantity(lot.initial_qty.toString());
      setSourceType(lot.source_type || "vendor");
      setSupplierId(lot.supplier_id ? lot.supplier_id.toString() : (lot.supplier?.id ? lot.supplier.id.toString() : "0"));
      setInvoiceNo(lot.invoice_no || "");
      setMemoImage(null);
      setMemoImagePreview(lot.memo_image ? getImageUrl(lot.memo_image) : null);
      setPaidAmount(lot.paid_amount !== undefined && lot.paid_amount !== null ? lot.paid_amount.toString() : "");
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
      const paidVal = Number(paidAmount) || 0;
      const paymentStatus = dueAmount === 0 ? "paid" : paidVal > 0 ? "partial" : "due";

      let options: RequestInit;

      if (memoImage) {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("purchase_price", purchasePrice);
        formData.append("initial_qty", quantity);
        formData.append("source_type", sourceType);
        formData.append("supplier_id", supplierId || "0");
        if (comment) formData.append("comment", comment);
        if (invoiceNo) formData.append("invoice_no", invoiceNo);
        formData.append("memo_image", memoImage);
        formData.append("total_amount", totalAmount.toString());
        formData.append("paid_amount", paidVal.toString());
        formData.append("due_amount", dueAmount.toString());
        formData.append("payment_status", paymentStatus);

        options = {
          method: "POST",
          body: formData,
        };
      } else {
        const payload = {
          purchase_price: Number(purchasePrice),
          initial_qty: Number(quantity),
          source_type: sourceType,
          supplier_id: Number(supplierId) || 0,
          comment: comment || null,
          invoice_no: invoiceNo.trim() || null,
          total_amount: totalAmount,
          paid_amount: paidVal,
          due_amount: dueAmount,
          payment_status: paymentStatus,
        };

        options = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        };
      }

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots/${lot.id}`,
        options
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
      <DialogContent className="sm:max-w-[650px] max-w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Stock Lot #{lot.id}</DialogTitle>
          <DialogDescription>
            Modify purchase price, initial quantity, supplier details, or payment info.
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

          {/* Supplier Payment Create Box */}
          <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Banknote className="size-3.5 text-primary" /> Supplier Payment Summary
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setPaidAmount(totalAmount > 0 ? totalAmount.toFixed(2) : "0")}
                >
                  Full Paid
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] px-2 text-muted-foreground hover:bg-muted"
                  onClick={() => setPaidAmount("0")}
                >
                  Mark as Due
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Total Amount</Label>
                <div className="h-9 px-3 flex items-center bg-background/90 rounded-md border font-semibold text-sm tabular-nums text-foreground">
                  ৳{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-paid-amount" className="text-xs font-medium">
                  Paid Amount (৳)
                </Label>
                <Input
                  id="edit-paid-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  disabled={submitting}
                  className="bg-background text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Due Amount</Label>
                <div className={`h-9 px-3 flex items-center justify-between bg-background/90 rounded-md border font-bold text-sm tabular-nums ${dueAmount > 0 ? "text-red-500 border-red-200 dark:border-red-950" : "text-emerald-500 border-emerald-200 dark:border-emerald-950"}`}>
                  <span>৳{dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <Badge variant={dueAmount === 0 ? "default" : dueAmount < totalAmount && Number(paidAmount) > 0 ? "outline" : "destructive"} className="text-[10px] px-1.5 py-0 h-4 uppercase">
                    {dueAmount === 0 ? "Paid" : dueAmount < totalAmount && Number(paidAmount) > 0 ? "Partial" : "Due"}
                  </Badge>
                </div>
              </div>
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

          {/* Invoice No & Memo Image Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-invoice-no" className="text-xs font-medium">
                Invoice / Memo No <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="edit-invoice-no"
                placeholder="e.g. INV-2026-0891"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Memo Image <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <div className="flex items-center gap-2">
                {memoImagePreview ? (
                  <div className="relative size-9 rounded border overflow-hidden bg-muted shrink-0">
                    <img src={memoImagePreview} alt="Memo preview" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setMemoImage(null);
                        setMemoImagePreview(null);
                      }}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="size-9 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30 shrink-0">
                    <ImageIcon className="size-4" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 text-xs"
                  onClick={() => memoImageRef.current?.click()}
                  disabled={submitting}
                >
                  <Upload className="size-3.5" />
                  {memoImagePreview ? "Change Memo Image" : "Upload Memo Image"}
                </Button>
                <input
                  ref={memoImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMemoImage(file);
                      setMemoImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <Label htmlFor="comment">Procurement Note / Comments</Label>
            <Textarea
              id="comment"
              placeholder="Supplier invoice reference, adjustments details, etc..."
              rows={2}
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
