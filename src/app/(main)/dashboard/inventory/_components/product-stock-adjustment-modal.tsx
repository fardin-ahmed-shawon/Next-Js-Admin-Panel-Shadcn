"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, FilePenLine, Loader2, PackageOpen } from "lucide-react";
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
  productId: number | string;
  variantId?: number | string;
  item: any;
  mutate?: () => void;
}

interface AdjustmentState {
  addQty: string;
  reduceQty: string;
  purchasePrice: string;
  sourceType: string;
  sourceName: string;
  comment: string;
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
  const [newSourceType, setNewSourceType] = React.useState("vendor");
  const [newSourceName, setNewSourceName] = React.useState("");
  const [newComment, setNewComment] = React.useState("");

  // Adjust Lots State
  const [lots, setLots] = React.useState<any[]>([]);
  const [loadingLots, setLoadingLots] = React.useState(false);
  const [adjustments, setAdjustments] = React.useState<Record<string, AdjustmentState>>({});

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setActiveTab(allowMultipleLot ? "new-lot" : "adjust-lots");
      resetNewLotForm();
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
                sourceName: lot.source_name || "",
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
      fetchLots();
    }
  }, [open, productId, variantId]);

  const resetNewLotForm = () => {
    setNewPurchasePrice("");
    setNewQuantity("");
    setNewSourceType("vendor");
    setNewSourceName("");
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
      const payload = {
        product_id: Number(productId),
        product_variant_id: variantId ? Number(variantId) : null,
        purchase_price: Number(newPurchasePrice),
        initial_qty: Number(newQuantity),
        source_type: newSourceType,
        source_name: newSourceName || null,
        comment: newComment || null,
      };

      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
            Manage stock for <span className="font-semibold text-foreground">{item.title || item.name}</span>.
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
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price (per unit)</Label>
                  <Input type="number" min="0" step="0.01" value={newPurchasePrice} onChange={(e) => setNewPurchasePrice(e.target.value)} disabled={submitting} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={newSourceType} onValueChange={setNewSourceType} disabled={submitting}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor / Purchase</SelectItem>
                      <SelectItem value="production">In-house Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source Name / Reference</Label>
                  <Input value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} placeholder="e.g. Acme Corp" disabled={submitting} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Optional comments" disabled={submitting} />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
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
                          <h3 className="font-semibold leading-none tracking-tight">Lot #{lot.id}</h3>
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
