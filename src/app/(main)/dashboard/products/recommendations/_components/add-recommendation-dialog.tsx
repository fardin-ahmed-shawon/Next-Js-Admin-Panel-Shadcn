"use client";

import * as React from "react";

import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { useProductRecommendations, type RecommendationProduct } from "@/hooks/useProductRecommendations";
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
                        {p.id === disabledId && <span className="text-xs text-muted-foreground">(selected)</span>}
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

export function AddRecommendationDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [baseProduct, setBaseProduct] = React.useState<RecommendationProduct | null>(null);
  const [recommendedProduct, setRecommendedProduct] = React.useState<RecommendationProduct | null>(null);

  const { createRecommendation } = useProductRecommendations();

  const resetForm = () => {
    setBaseProduct(null);
    setRecommendedProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseProduct || !recommendedProduct) return;

    setIsSubmitting(true);
    try {
      await createRecommendation({
        product_id: baseProduct.id,
        recommended_product_id: recommendedProduct.id,
      });
      toast.success("Recommendation added successfully.");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      const msg: string = err?.message ?? "Failed to add recommendation.";
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button id="add-recommendation-btn">
          <Plus className="mr-2 size-4" />
          Add Recommendation
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Product Recommendation</DialogTitle>
          <DialogDescription>
            Link a recommended product to a base product. A product cannot recommend itself.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <ProductPicker
              label="Base Product"
              id="base-product"
              selected={baseProduct}
              onSelect={setBaseProduct}
              disabledId={recommendedProduct?.id}
            />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">recommends</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <ProductPicker
              label="Recommended Product"
              id="recommended-product"
              selected={recommendedProduct}
              onSelect={setRecommendedProduct}
              disabledId={baseProduct?.id}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              id="save-recommendation-btn"
              type="submit"
              disabled={isSubmitting || !baseProduct || !recommendedProduct}
            >
              {isSubmitting ? "Saving…" : "Save Recommendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
