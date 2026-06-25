"use client";

import * as React from "react";

import { Search } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import {
  type Recommendation,
  type RecommendationProduct,
  useProductRecommendations,
} from "@/hooks/useProductRecommendations";
import { useProductSearch } from "@/hooks/useProductSearch";

/* ── Inline product picker ─────────────────────────────────────── */

interface ProductPickerProps {
  label: string;
  id: string;
  selected: RecommendationProduct | null;
  onSelect: (p: RecommendationProduct | null) => void;
  disabledId?: number;
}

function ProductPicker({ label, id, selected, onSelect, disabledId }: ProductPickerProps) {
  const [query, setQuery] = React.useState("");
  const { products, isLoading } = useProductSearch(query);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </Label>

      {selected ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-2">
          {selected.product_thumbnail_img && (
            <img
              src={selected.product_thumbnail_img}
              alt={selected.title}
              className="size-9 rounded-md object-cover border shrink-0"
            />
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-sm font-medium leading-none truncate">{selected.title}</span>
            <span className="text-xs text-muted-foreground">ID: {selected.id}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={id}
              className="pl-8"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {query.length >= 1 && (
            <div className="rounded-lg border bg-popover shadow-md">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="py-3 text-center text-sm text-muted-foreground">No products found.</p>
              ) : (
                <ScrollArea className="max-h-48">
                  <div className="p-1">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={p.id === disabledId}
                        onClick={() => {
                          onSelect(p);
                          setQuery("");
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {p.product_thumbnail_img && (
                          <img
                            src={p.product_thumbnail_img}
                            alt={p.title}
                            className="size-8 rounded object-cover border shrink-0"
                          />
                        )}
                        <span className="flex-1 truncate">{p.title}</span>
                        {p.id === disabledId && <span className="text-xs text-muted-foreground">(current)</span>}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Dialog ────────────────────────────────────────────────── */

interface EditRecommendationDialogProps {
  recommendation: Recommendation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecommendationDialog({ recommendation, open, onOpenChange }: EditRecommendationDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newRecommended, setNewRecommended] = React.useState<RecommendationProduct | null>(null);

  const { updateRecommendation } = useProductRecommendations();

  // Reset picker when dialog opens
  React.useEffect(() => {
    if (open) setNewRecommended(null);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecommended) return;

    setIsSubmitting(true);
    try {
      await updateRecommendation(recommendation.id, {
        recommended_product_id: newRecommended.id,
      });
      toast.success("Recommendation updated successfully.");
      onOpenChange(false);
    } catch (err: any) {
      const msg: string = err?.message ?? "Failed to update recommendation.";
      if (msg.toLowerCase().includes("conflict") || msg.toLowerCase().includes("already")) {
        toast.error("This recommendation already exists.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Recommendation</DialogTitle>
          <DialogDescription>
            Changing the recommended product for{" "}
            <strong>{recommendation.product?.title ?? `Product #${recommendation.product_id}`}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            {/* Base product — read-only display */}
            <div className="grid gap-2">
              <Label>Base Product (read-only)</Label>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2 opacity-70">
                {recommendation.product?.product_thumbnail_img && (
                  <img
                    src={recommendation.product.product_thumbnail_img}
                    alt={recommendation.product.title}
                    className="size-9 rounded-md object-cover border shrink-0"
                  />
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium leading-none truncate">
                    {recommendation.product?.title ?? `Product #${recommendation.product_id}`}
                  </span>
                  <span className="text-xs text-muted-foreground">ID: {recommendation.product_id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">recommends</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Current recommended — shown when no new one selected */}
            {!newRecommended && (
              <div className="grid gap-2">
                <Label>Current Recommended Product</Label>
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
                  {recommendation.recommended_product?.product_thumbnail_img && (
                    <img
                      src={recommendation.recommended_product.product_thumbnail_img}
                      alt={recommendation.recommended_product.title}
                      className="size-9 rounded-md object-cover border shrink-0"
                    />
                  )}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium leading-none truncate">
                      {recommendation.recommended_product?.title ?? `Product #${recommendation.recommended_product_id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">ID: {recommendation.recommended_product_id}</span>
                  </div>
                </div>
              </div>
            )}

            {/* New recommended picker */}
            <ProductPicker
              label={newRecommended ? "New Recommended Product" : "Change to a Different Product"}
              id="edit-recommended-product"
              selected={newRecommended}
              onSelect={setNewRecommended}
              disabledId={recommendation.product_id}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button id="update-recommendation-btn" type="submit" disabled={isSubmitting || !newRecommended}>
              {isSubmitting ? "Saving…" : "Update Recommendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
