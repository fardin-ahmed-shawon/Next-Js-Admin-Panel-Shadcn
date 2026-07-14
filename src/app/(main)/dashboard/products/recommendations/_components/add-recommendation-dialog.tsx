"use client";

import * as React from "react";

import { Plus, Search, X } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { type RecommendationProduct, useProductRecommendations } from "@/hooks/useProductRecommendations";
import { useProductSearch } from "@/hooks/useProductSearch";

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

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
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-2 animate-in fade-in duration-200">
          {selected.product_thumbnail_img && (
            <img
              src={getImageUrl(selected.product_thumbnail_img)}
              alt={selected.title}
              className="size-9 rounded-md object-cover border shrink-0"
            />
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-sm font-medium leading-none block truncate" title={selected.title}>
              {selected.title}
            </span>
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
        <div className="flex flex-col gap-1.5 relative">
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
            <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-lg border bg-popover shadow-md">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="py-3 text-center text-sm text-muted-foreground">No products found.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto overflow-x-hidden">
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
                        className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {p.product_thumbnail_img && (
                          <img
                            src={getImageUrl(p.product_thumbnail_img)}
                            alt={p.title}
                            className="size-8 rounded object-cover border shrink-0"
                          />
                        )}
                        <span className="flex-1 block truncate" title={p.title}>
                          {p.title}
                        </span>
                        {p.id === disabledId && <span className="text-xs text-muted-foreground">(selected)</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Inline multiple product picker ────────────────────────────── */

interface MultiProductPickerProps {
  label: string;
  id: string;
  selected: RecommendationProduct[];
  onSelect: (products: RecommendationProduct[]) => void;
  disabledId?: number;
}

function MultiProductPicker({ label, id, selected, onSelect, disabledId }: MultiProductPickerProps) {
  const [query, setQuery] = React.useState("");
  const { products, isLoading } = useProductSearch(query);

  const handleSelect = (p: RecommendationProduct) => {
    if (!selected.find((item) => item.id === p.id)) {
      onSelect([...selected, p]);
    }
    setQuery("");
  };

  const handleRemove = (idToRemove: number) => {
    onSelect(selected.filter((item) => item.id !== idToRemove));
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </Label>

      {selected.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {selected.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-muted/50 p-2 animate-in fade-in duration-200">
              {item.product_thumbnail_img && (
                <img
                  src={getImageUrl(item.product_thumbnail_img)}
                  alt={item.title}
                  className="size-9 rounded-md object-cover border shrink-0"
                />
              )}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium leading-none block truncate" title={item.title}>
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground">ID: {item.id}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(item.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5 relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            className="pl-8"
            placeholder="Search and add products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query.length >= 1 && (
          <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-lg border bg-popover shadow-md">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">No products found.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto overflow-x-hidden">
                <div className="p-1">
                  {products.map((p) => {
                    const isAlreadySelected = selected.some((item) => item.id === p.id);
                    const isDisabled = p.id === disabledId || isAlreadySelected;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSelect(p)}
                        className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {p.product_thumbnail_img && (
                          <img
                            src={getImageUrl(p.product_thumbnail_img)}
                            alt={p.title}
                            className="size-8 rounded object-cover border shrink-0"
                          />
                        )}
                        <span className="flex-1 block truncate" title={p.title}>
                          {p.title}
                        </span>
                        {p.id === disabledId && <span className="text-xs text-muted-foreground">(base)</span>}
                        {isAlreadySelected && <span className="text-xs text-muted-foreground">(added)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Dialog ────────────────────────────────────────────────── */

export function AddRecommendationDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [baseProduct, setBaseProduct] = React.useState<RecommendationProduct | null>(null);
  const [recommendedProducts, setRecommendedProducts] = React.useState<RecommendationProduct[]>([]);

  const { createRecommendation } = useProductRecommendations();

  const resetForm = () => {
    setBaseProduct(null);
    setRecommendedProducts([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseProduct || recommendedProducts.length === 0) return;

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const recommendedProduct of recommendedProducts) {
      try {
        await createRecommendation({
          product_id: baseProduct.id,
          recommended_product_id: recommendedProduct.id,
        });
        successCount++;
      } catch (err: any) {
        failCount++;
        const msg: string = err?.message ?? "Failed to add recommendation.";
        if (!msg.toLowerCase().includes("already") && !msg.toLowerCase().includes("conflict")) {
          console.error(err);
        }
      }
    }
    
    setIsSubmitting(false);

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} recommendation(s).`);
      if (failCount === 0) {
        setOpen(false);
        resetForm();
      }
    } else if (failCount > 0) {
      toast.error("Failed to add recommendations. They might already exist.");
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

      <DialogContent className="sm:max-w-xl">
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
            />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">recommends</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <MultiProductPicker
              label="Recommended Products"
              id="recommended-products"
              selected={recommendedProducts}
              onSelect={setRecommendedProducts}
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
              disabled={isSubmitting || !baseProduct || recommendedProducts.length === 0}
            >
              {isSubmitting ? "Saving…" : "Save Recommendation(s)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
