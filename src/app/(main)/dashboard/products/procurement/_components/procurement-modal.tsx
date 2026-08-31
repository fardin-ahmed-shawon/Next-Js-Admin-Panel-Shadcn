"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Plus, Search, ExternalLink, Upload, X, Banknote, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";

interface Variant {
  id: number;
  sku: string;
  size?: { id: number; label: string } | null;
  color?: { id: number; label: string } | null;
}

interface LookupProduct {
  id: number;
  title: string;
  has_variants: boolean | number;
  product_thumbnail_img?: string | null;
  variants?: Variant[];
}

interface SupplierOption {
  id: number;
  name: string;
}

interface ProcurementModalProps {
  onSuccess: () => void;
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

export function ProcurementModal({ onSuccess }: ProcurementModalProps) {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<LookupProduct[]>([]);
  const [suppliers, setSuppliers] = React.useState<SupplierOption[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);

  // Search and selection popover state
  const [isOpenProductList, setIsOpenProductList] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Form State
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>("");
  const [purchasePrice, setPurchasePrice] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<string>("");
  const [sourceType, setSourceType] = React.useState<string>("vendor");
  const [supplierId, setSupplierId] = React.useState<string>("0");
  const [invoiceNo, setInvoiceNo] = React.useState<string>("");
  const [memoImage, setMemoImage] = React.useState<File | null>(null);
  const [memoImagePreview, setMemoImagePreview] = React.useState<string | null>(null);
  const [paidAmount, setPaidAmount] = React.useState<string>("");
  const [comment, setComment] = React.useState<string>("");
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

  // Fetch product lookup and suppliers when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchLookup = async () => {
        try {
          setLoadingProducts(true);
          const res = await fetchClient(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/products-lookup`
          );
          const data = await res.json();
          if (res.ok && data.success) {
            setProducts(data.data || []);
          } else {
            toast.error(data.message || "Failed to load product lookup list.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error loading products lookup.");
        } finally {
          setLoadingProducts(false);
        }
      };

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

      fetchLookup();
      fetchSuppliersList();
    }
  }, [open]);

  const selectedProduct = React.useMemo(() => {
    return products.find((p) => p.id.toString() === selectedProductId);
  }, [products, selectedProductId]);

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleProductChange = (val: string) => {
    setSelectedProductId(val);
    setSelectedVariantId(""); // Reset variant selection
  };

  const resetForm = () => {
    setSelectedProductId("");
    setSelectedVariantId("");
    setPurchasePrice("");
    setQuantity("");
    setSourceType("vendor");
    setSupplierId("0");
    setInvoiceNo("");
    setMemoImage(null);
    setMemoImagePreview(null);
    setPaidAmount("");
    setComment("");
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error("Please select a product.");
      return;
    }

    if (selectedProduct?.has_variants && !selectedVariantId) {
      toast.error("This product has variants. Please select a variant.");
      return;
    }

    if (!purchasePrice || Number(purchasePrice) < 0) {
      toast.error("Please enter a valid purchase price.");
      return;
    }

    if (!quantity || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      toast.error("Please enter a valid quantity (greater than 0).");
      return;
    }

    setSubmitting(true);
    try {
      const paidVal = Number(paidAmount) || 0;
      const paymentStatus = dueAmount === 0 ? "paid" : paidVal > 0 ? "partial" : "due";

      let options: RequestInit;

      if (memoImage) {
        const formData = new FormData();
        formData.append("product_id", selectedProductId);
        if (selectedVariantId) formData.append("product_variant_id", selectedVariantId);
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
          product_id: Number(selectedProductId),
          product_variant_id: selectedVariantId ? Number(selectedVariantId) : null,
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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        };
      }

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots`,
        options
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Stock procured successfully.");
        resetForm();
        setOpen(false);
        onSuccess();
      } else {
        toast.error(data.message || "Failed to submit procurement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during procurement submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" /> Procure Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Procure New Stock</DialogTitle>
          <DialogDescription>
            Acquire new stock lots. This will append a new lot record under the FIFO inventory system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Product Search & Selection Popover */}
          <div className="space-y-1.5">
            <Label>Select Product <span className="text-destructive">*</span></Label>
            <Popover open={isOpenProductList} onOpenChange={setIsOpenProductList}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal text-left h-11"
                  disabled={loadingProducts || submitting}
                >
                  {selectedProduct ? (
                    <div className="flex items-center gap-2.5 truncate max-w-[90%]">
                      <img
                        src={getImageUrl(selectedProduct.product_thumbnail_img)}
                        alt={selectedProduct.title}
                        className="size-7 rounded object-cover border bg-muted shrink-0"
                      />
                      <span className="truncate block max-w-[450px]" title={selectedProduct.title}>
                        {selectedProduct.title}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {loadingProducts ? "Loading products..." : "Choose product..."}
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex items-center border-b px-3 h-10">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    placeholder="Search product by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <ScrollArea className="h-64">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      No products found.
                    </div>
                  ) : (
                    <div className="p-1 space-y-0.5">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="flex items-center gap-3 w-full px-2.5 py-2 text-left text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => {
                            handleProductChange(p.id.toString());
                            setIsOpenProductList(false);
                            setSearchQuery("");
                          }}
                        >
                          <img
                            src={getImageUrl(p.product_thumbnail_img)}
                            alt={p.title}
                            className="size-8 rounded object-cover border bg-muted shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground truncate max-w-[450px]" title={p.title}>
                              {p.title}
                            </span>
                            {p.has_variants ? (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Has Variants
                              </span>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Variant Select (Conditionally shown) */}
          {selectedProduct?.has_variants ? (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label>Select Variant <span className="text-destructive">*</span></Label>
              <Select
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose variant option..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.variants?.map((v) => {
                    const sizeLabel = v.size?.label || "";
                    const colorLabel = v.color?.label || "";
                    const label = [
                      sizeLabel && `Size: ${sizeLabel}`,
                      colorLabel && `Color: ${colorLabel}`,
                      v.sku && `SKU: ${v.sku}`,
                    ]
                      .filter(Boolean)
                      .join(" / ");

                    return (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {label || `Variant ${v.id}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : null}

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
                <Label htmlFor="paid-amount" className="text-xs font-medium">
                  Paid Amount (৳)
                </Label>
                <Input
                  id="paid-amount"
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
                <Label htmlFor="supplier-select">Supplier</Label>
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
                <SelectTrigger id="supplier-select">
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
              <Label htmlFor="invoice-no" className="text-xs font-medium">
                Invoice / Memo No <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="invoice-no"
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
                  {memoImage ? "Change Memo Image" : "Upload Memo Image"}
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
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Procure Stock"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
