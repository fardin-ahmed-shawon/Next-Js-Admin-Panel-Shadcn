"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, FilePenLine, Loader2, PackageOpen, ExternalLink, Banknote, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";
import { useModularFeatures } from "@/hooks/useModularFeatures";

interface ProductStockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: number | string;
  variantId?: number | string;
  item?: any;
  mutate?: () => void;
}

interface AdjustmentState {
  addQty: string;
  reduceQty: string;
  purchasePrice: string;
  sourceType: string;
  comment: string;
}

interface SupplierOption {
  id: number;
  name: string;
}

export function ProductStockAdjustmentModal({
  open,
  onOpenChange,
  productId,
  variantId,
  item,
  mutate,
}: ProductStockAdjustmentModalProps) {
  const { features } = useModularFeatures();
  const allowMultipleLot = features?.inventory_multiple_lot !== false && String(features?.inventory_multiple_lot) !== "0";

  const [activeTab, setActiveTab] = React.useState(allowMultipleLot ? "new-lot" : "adjust-lots");

  // New Lot State
  const [newPurchasePrice, setNewPurchasePrice] = React.useState("");
  const [newQuantity, setNewQuantity] = React.useState("");
  const [newPurchaseDate, setNewPurchaseDate] = React.useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [newSourceType, setNewSourceType] = React.useState("vendor");
  const [newSupplierId, setNewSupplierId] = React.useState("0");
  const [newInvoiceNo, setNewInvoiceNo] = React.useState("");
  const [newMemoImage, setNewMemoImage] = React.useState<File | null>(null);
  const [newMemoImagePreview, setNewMemoImagePreview] = React.useState<string | null>(null);
  const [newPaidAmount, setNewPaidAmount] = React.useState("");
  const [newComment, setNewComment] = React.useState("");

  const memoImageRef = React.useRef<HTMLInputElement>(null);

  // Computed amounts
  const totalLotAmount = React.useMemo(() => {
    const qty = Number(newQuantity) || 0;
    const price = Number(newPurchasePrice) || 0;
    return qty * price;
  }, [newQuantity, newPurchasePrice]);

  const dueLotAmount = React.useMemo(() => {
    const paid = Number(newPaidAmount) || 0;
    return Math.max(0, totalLotAmount - paid);
  }, [totalLotAmount, newPaidAmount]);

  // Suppliers & Lots State
  const [suppliers, setSuppliers] = React.useState<SupplierOption[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);
  const [lots, setLots] = React.useState<any[]>([]);
  const [loadingLots, setLoadingLots] = React.useState(false);
  const [adjustments, setAdjustments] = React.useState<Record<string, AdjustmentState>>({});

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && productId) {
      setActiveTab(allowMultipleLot ? "new-lot" : "adjust-lots");
      resetNewLotForm();

      const fetchSuppliersList = async () => {
        try {
          setLoadingSuppliers(true);
          const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers?all=true`);
          const data = await res.json();
          if (res.ok && data.success) {
            setSuppliers(data.data || []);
          }
        } catch (error) {
          console.error("Failed to load suppliers:", error);
        } finally {
          setLoadingSuppliers(false);
        }
      };

      const fetchLots = async () => {
        setLoadingLots(true);
        try {
          let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots?product_id=${productId}&per_page=100`;
          if (variantId) {
            url += `&product_variant_id=${variantId}`;
          } else {
            url += `&product_variant_id=null`;
          }
          const res = await fetchClient(url);
          const data = await res.json();
          if (res.ok && data.success) {
            let fetchedLots = data.data.data || [];
            setLots(fetchedLots);

            // Initialize adjustments state
            const initialAdj: Record<string, AdjustmentState> = {};
            fetchedLots.forEach((lot: any) => {
              initialAdj[lot.id] = {
                addQty: "",
                reduceQty: "",
                purchasePrice: lot.purchase_price.toString(),
                sourceType: lot.source_type === "return" || lot.source_type === "adjustment" ? lot.source_type : "adjustment",
                comment: lot.comment || "",
              };
            });
            setAdjustments(initialAdj);
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to load existing lots.");
        } finally {
          setLoadingLots(false);
        }
      };

      fetchSuppliersList();
      fetchLots();
    }
  }, [open, productId, variantId]);

  const resetNewLotForm = () => {
    setNewPurchasePrice("");
    setNewQuantity("");
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setNewPurchaseDate(`${year}-${month}-${day}`);
    setNewSourceType("vendor");
    setNewSupplierId("0");
    setNewInvoiceNo("");
    setNewMemoImage(null);
    setNewMemoImagePreview(null);
    setNewPaidAmount("");
    setNewComment("");
  };

  const handleAddNewLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchasePrice || Number(newPurchasePrice) < 0) {
      toast.error("Please enter a valid purchase price.");
      return;
    }
    if (!newQuantity || Number(newQuantity) <= 0 || !Number.isInteger(Number(newQuantity))) {
      toast.error("Please enter a valid quantity (greater than 0).");
      return;
    }

    setSubmitting(true);
    try {
      const paidVal = Number(newPaidAmount) || 0;
      const paymentStatus = dueLotAmount === 0 && totalLotAmount > 0 ? "paid" : paidVal > 0 ? "partial" : "due";

      let options: RequestInit;

      if (newMemoImage) {
        const formData = new FormData();
        formData.append("product_id", String(productId));
        if (variantId) formData.append("product_variant_id", String(variantId));
        formData.append("purchase_price", newPurchasePrice);
        formData.append("initial_qty", newQuantity);
        if (newPurchaseDate) {
          formData.append("purchase_date", newPurchaseDate);
          formData.append("date", newPurchaseDate);
          formData.append("created_at", `${newPurchaseDate} 00:00:00`);
        }
        formData.append("source_type", newSourceType);
        formData.append("supplier_id", newSupplierId || "0");
        if (newComment) formData.append("comment", newComment);
        if (newInvoiceNo.trim()) formData.append("invoice_no", newInvoiceNo.trim());
        formData.append("memo_image", newMemoImage);
        formData.append("total_amount", totalLotAmount.toString());
        formData.append("paid_amount", paidVal.toString());
        formData.append("due_amount", dueLotAmount.toString());
        formData.append("payment_status", paymentStatus);

        options = {
          method: "POST",
          body: formData,
        };
      } else {
        const payload = {
          product_id: Number(productId),
          product_variant_id: variantId ? Number(variantId) : null,
          purchase_price: Number(newPurchasePrice),
          initial_qty: Number(newQuantity),
          purchase_date: newPurchaseDate || null,
          date: newPurchaseDate || null,
          created_at: newPurchaseDate ? `${newPurchaseDate} 00:00:00` : undefined,
          source_type: newSourceType,
          supplier_id: Number(newSupplierId) || 0,
          comment: newComment || null,
          invoice_no: newInvoiceNo.trim() || null,
          total_amount: totalLotAmount,
          paid_amount: paidVal,
          due_amount: dueLotAmount,
          payment_status: paymentStatus,
        };

        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        };
      }

      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots`, options);

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "New stock lot procured successfully.");
        onOpenChange(false);
        if (mutate) mutate();
      } else {
        toast.error(data.message || "Failed to procure stock lot.");
      }
    } catch (error) {
      toast.error("An error occurred while procuring stock lot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustLotChange = (lotId: string, field: keyof AdjustmentState, value: string) => {
    setAdjustments((prev) => ({
      ...prev,
      [lotId]: {
        ...prev[lotId],
        [field]: value,
      },
    }));
  };

  const handleSaveAdjustments = async () => {
    // Find all lots that actually have an adjustment (add or reduce is not empty)
    const modifiedLotIds = Object.keys(adjustments).filter(
      (lotId) => adjustments[lotId].addQty !== "" || adjustments[lotId].reduceQty !== ""
    );

    if (modifiedLotIds.length === 0) {
      toast.error("No adjustments have been made.");
      return;
    }

    setSubmitting(true);
    try {
      const promises = modifiedLotIds.map(async (lotId) => {
        const lot = lots.find((l) => l.id.toString() === lotId);
        const adj = adjustments[lotId];

        const added = Number(adj.addQty) || 0;
        const reduced = Number(adj.reduceQty) || 0;

        if (added > 0 && reduced > 0) {
          throw new Error(`Lot #${lotId}: Cannot add and reduce stock simultaneously.`);
        }

        const delta = added - reduced;

        if (lot.remaining_qty + delta < 0) {
          throw new Error(`Lot #${lotId}: Cannot reduce more than the remaining quantity.`);
        }

        const payload = {
          purchase_price: Number(adj.purchasePrice),
          adjust_qty: delta,
          source_type: adj.sourceType,
          comment: adj.comment || null,
        };

        const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots/${lotId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to adjust Lot #${lotId}`);
        }
        return data;
      });

      await Promise.all(promises);

      toast.success(`${modifiedLotIds.length} lot(s) adjusted successfully.`);
      onOpenChange(false);
      if (mutate) mutate();

    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving adjustments.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-full flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
          <DialogDescription>
            Manage stock for <span className="font-semibold text-foreground">{item?.title || item?.name || "Selected Product"}</span>.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className={allowMultipleLot ? "grid w-full grid-cols-2" : "grid w-full grid-cols-1"}>
            {allowMultipleLot && <TabsTrigger value="new-lot">Procure New Stock</TabsTrigger>}
            <TabsTrigger value="adjust-lots">Adjust Existing Lots</TabsTrigger>
          </TabsList>

          {allowMultipleLot && (
            <TabsContent value="new-lot" className="mt-4 flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleAddNewLot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Quantity <span className="text-destructive">*</span></Label>
                  <Input type="number" min="1" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} disabled={submitting} />
                </div>
                <div className="space-y-1.5">
                  <Label>Purchase Price (per unit) <span className="text-destructive">*</span></Label>
                  <Input type="number" min="0" step="0.01" value={newPurchasePrice} onChange={(e) => setNewPurchasePrice(e.target.value)} disabled={submitting} />
                </div>
              </div>

              {/* Supplier Payment Summary Box */}
              <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="size-3.5 text-primary" /> Supplier Payment Summary
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setNewPaidAmount(totalLotAmount > 0 ? totalLotAmount.toFixed(2) : "0")}
                    >
                      Full Paid
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[11px] px-2 text-muted-foreground hover:bg-muted"
                      onClick={() => setNewPaidAmount("0")}
                    >
                      Mark as Due
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-xs">Total Amount</span>
                    <div className="h-8 px-2.5 flex items-center bg-background/90 rounded border font-semibold text-sm tabular-nums text-foreground">
                      ৳{totalLotAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="stock-adj-paid-amount" className="text-xs font-medium block">
                      Paid Amount (৳)
                    </Label>
                    <Input
                      id="stock-adj-paid-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newPaidAmount}
                      onChange={(e) => setNewPaidAmount(e.target.value)}
                      disabled={submitting}
                      className="h-8 bg-background text-xs font-medium px-2.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-xs">Due Amount</span>
                    <div className={`h-8 px-2.5 flex items-center justify-between bg-background/90 rounded border font-bold text-sm tabular-nums ${dueLotAmount > 0 ? "text-red-500 border-red-200 dark:border-red-950" : "text-emerald-500 border-emerald-200 dark:border-emerald-950"}`}>
                      <span>৳{dueLotAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <Badge variant={dueLotAmount === 0 ? "default" : dueLotAmount < totalLotAmount && Number(newPaidAmount) > 0 ? "outline" : "destructive"} className="text-[9px] px-1 py-0 h-3.5 uppercase">
                        {dueLotAmount === 0 ? "Paid" : dueLotAmount < totalLotAmount && Number(newPaidAmount) > 0 ? "Partial" : "Due"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Source & Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Source Type</Label>
                  <Select value={newSourceType} onValueChange={setNewSourceType} disabled={submitting}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor / Purchase</SelectItem>
                      <SelectItem value="production">In-house Production</SelectItem>
                      <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stock-adj-supplier-select">Supplier</Label>
                    <Link
                      href="/dashboard/suppliers"
                      target="_blank"
                      className="text-xs text-primary hover:underline flex items-center gap-0.5 font-normal"
                    >
                      <span>Manage</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                  <Select
                    value={newSupplierId}
                    onValueChange={setNewSupplierId}
                    disabled={submitting || loadingSuppliers}
                  >
                    <SelectTrigger id="stock-adj-supplier-select">
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

              {/* Purchase Date & Invoice No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adj-purchase-date" className="text-xs font-medium">
                    Purchase Date <span className="text-muted-foreground font-normal">(Custom Date)</span>
                  </Label>
                  <Input
                    id="adj-purchase-date"
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adj-invoice-no" className="text-xs font-medium">
                    Invoice No <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="adj-invoice-no"
                    placeholder="e.g. INV-2026-991"
                    value={newInvoiceNo}
                    onChange={(e) => setNewInvoiceNo(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Memo Image */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Memo Image <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="flex items-center gap-2">
                  {newMemoImagePreview ? (
                    <div className="relative size-9 rounded border overflow-hidden bg-muted shrink-0">
                      <img src={newMemoImagePreview} alt="Memo preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setNewMemoImage(null);
                          setNewMemoImagePreview(null);
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
                    {newMemoImage ? "Change Memo" : "Upload Memo"}
                  </Button>
                  <input
                    ref={memoImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewMemoImage(file);
                        setNewMemoImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Procurement Notes</Label>
                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Optional comments, reference numbers, etc..." rows={2} disabled={submitting} />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t mt-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting || !newQuantity || !newPurchasePrice}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Procure Stock
                </Button>
              </div>
            </form>
          </TabsContent>
          )}

          <TabsContent value="adjust-lots" className="mt-4 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
              {loadingLots ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading lots...
                </div>
              ) : lots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PackageOpen className="size-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">No existing lots</p>
                  <p className="text-sm text-muted-foreground">There are no existing stock lots for this item to adjust.</p>
                </div>
              ) : (
                lots.map((lot) => {
                  const adj = adjustments[lot.id];
                  if (!adj) return null;

                  const consumed = lot.initial_qty - lot.remaining_qty;
                  const added = Number(adj.addQty) || 0;
                  const reduced = Number(adj.reduceQty) || 0;
                  const afterAdjustment = lot.remaining_qty + added - reduced;

                  return (
                    <div key={lot.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="flex flex-col space-y-1.5 p-4 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold leading-none tracking-tight">Lot #{lot.id}</h3>
                            {lot.supplier?.name && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {lot.supplier.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {lot.created_at ? format(new Date(lot.created_at), "PPP") : "Unknown Date"}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 grid gap-4">
                        <div className="flex justify-between items-center rounded-md bg-muted/50 p-3">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Consumed</div>
                            <div className="font-medium text-lg">{consumed}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Remaining</div>
                            <div className="font-medium text-lg">{lot.remaining_qty}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">After Adj.</div>
                            <div className={`font-bold text-lg ${afterAdjustment < 0 ? 'text-destructive' : 'text-primary'}`}>
                              {afterAdjustment}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Add Stock</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="0"
                              value={adj.addQty}
                              onChange={(e) => {
                                handleAdjustLotChange(lot.id, "addQty", e.target.value);
                                handleAdjustLotChange(lot.id, "reduceQty", ""); // Reset reduce if add is typed
                              }}
                              disabled={submitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Reduce Stock</Label>
                            <Input
                              type="number"
                              min="1"
                              max={lot.remaining_qty.toString()}
                              placeholder="0"
                              value={adj.reduceQty}
                              onChange={(e) => {
                                handleAdjustLotChange(lot.id, "reduceQty", e.target.value);
                                handleAdjustLotChange(lot.id, "addQty", ""); // Reset add if reduce is typed
                              }}
                              disabled={submitting}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Source</Label>
                          <Select
                            value={adj.sourceType}
                            onValueChange={(val) => handleAdjustLotChange(lot.id, "sourceType", val)}
                            disabled={submitting}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                              <SelectItem value="return">Customer Return</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Comment</Label>
                          <Textarea
                            placeholder="Optional notes for this adjustment..."
                            value={adj.comment}
                            onChange={(e) => handleAdjustLotChange(lot.id, "comment", e.target.value)}
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {lots.length > 0 && (
              <div className="pt-4 flex justify-end gap-2 border-t mt-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
                <Button type="button" onClick={handleSaveAdjustments} disabled={submitting || loadingLots}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <FilePenLine className="mr-2 h-4 w-4" />
                  Save All Adjustments
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
