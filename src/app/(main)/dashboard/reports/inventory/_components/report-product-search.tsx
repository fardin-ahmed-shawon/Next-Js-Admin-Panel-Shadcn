"use client";

import { useEffect, useId, useRef, useState } from "react";
import useSWR from "swr";
import { Eye, Loader2, Package, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventoryReportUrl, reportFetch } from "@/hooks/useInventoryReport";

export interface ReportProductSelection {
  id: number;
  title: string;
  sku: string | null;
  product_thumbnail_img: string | null;
  variant?: { id: number; label: string; sku: string | null };
}
interface SearchProduct extends ReportProductSelection {
  archived: boolean;
  variants: NonNullable<ReportProductSelection["variant"]>[];
}
interface SearchResponse {
  data: SearchProduct[];
  current_page: number;
  last_page: number;
  total: number;
}

export function ReportProductImage({
  path,
  title,
  className = "size-11",
}: {
  path: string | null;
  title: string;
  className?: string;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(
    /\/api\/.*$/,
    "/",
  );
  const src = path
    ? /^https?:\/\//i.test(path)
      ? path
      : `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
    : null;
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted`}
    >
      {src && failedPath !== src ? (
        <img
          src={src}
          alt={title}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailedPath(src)}
        />
      ) : (
        <Package className="size-5 text-muted-foreground" aria-label="No product image" />
      )}
    </div>
  );
}

export function ReportProductSearch({
  selected,
  onSelect,
  onPreview,
}: {
  selected: ReportProductSelection | null;
  onSelect: (product: ReportProductSelection | null) => void;
  onPreview: (product: ReportProductSelection) => void;
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [mode, setMode] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const resultsId = useId();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const params = new URLSearchParams({ search: debounced, search_mode: mode, page: String(page), per_page: "15" });
  const { data, error, isLoading, mutate } = useSWR<SearchResponse>(
    open ? `${inventoryReportUrl}/products?${params}` : null,
    async (url: string) => (await (await reportFetch(url)).json()).data,
    { revalidateOnFocus: false },
  );
  const choose = (product: ReportProductSelection) => {
    onSelect(product);
    setSearch("");
    setOpen(false);
  };
  const preview = (product: ReportProductSelection) => {
    onPreview(product);
    setOpen(false);
  };
  return (
    <div className="space-y-3">
      <div
        ref={root}
        className="relative"
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <div className="mb-1.5 text-xs font-medium">Product search</div>
        <div className="flex gap-2">
          <Select
            value={mode}
            onValueChange={(value) => {
              setMode(value);
              setPage(1);
              setOpen(true);
            }}
          >
            <SelectTrigger className="h-9 w-32 shrink-0" aria-label="Product search mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fields</SelectItem>
              <SelectItem value="name">Product name</SelectItem>
              <SelectItem value="sku">SKU</SelectItem>
              <SelectItem value="variant">Variant</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search products, SKUs and variants"
              aria-controls={open ? resultsId : undefined}
              className="pl-9"
              placeholder="Search product name, SKU, size or color…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
          </div>
        </div>
        {open && (
          <div
            id={resultsId}
            className="absolute left-0 right-0 top-full z-40 mt-1 max-h-96 overflow-auto rounded-lg border bg-popover shadow-lg"
            aria-label="Product search results"
          >
            {isLoading || search.trim() !== debounced ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Searching products…
              </div>
            ) : error ? (
              <div role="alert" className="p-4 text-sm">
                {error.message}
                <Button type="button" variant="outline" size="sm" className="ml-2" onClick={() => mutate()}>
                  Retry
                </Button>
              </div>
            ) : !data?.data.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No products with inventory history match this search.
              </div>
            ) : (
              <>
                {data.data.map((product) => (
                  <div key={product.id} className="border-b last:border-0">
                    <div className="flex items-center gap-2 p-2 hover:bg-muted/50">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 rounded p-1 text-left focus-visible:outline focus-visible:outline-primary"
                        onClick={() => choose(product)}
                      >
                        <ReportProductImage path={product.product_thumbnail_img} title={product.title} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{product.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {product.sku || "No SKU"} · {product.variants.length ? "All variants" : "Base product"}
                            {product.archived ? " · Archived" : ""}
                          </span>
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Preview report for ${product.title}, all variants`}
                        onClick={() => preview(product)}
                      >
                        <Eye className="size-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                    </div>
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center gap-2 border-t border-dashed py-1 pl-14 pr-2 hover:bg-muted/50"
                      >
                        <button
                          type="button"
                          className="flex-1 rounded py-1 text-left text-xs focus-visible:outline focus-visible:outline-primary"
                          onClick={() => choose({ ...product, variant })}
                        >
                          <span className="font-medium">{variant.label}</span>
                          <span className="ml-2 text-muted-foreground">SKU: {variant.sku || "—"}</span>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Preview ${product.title}, ${variant.label}`}
                          onClick={() => preview({ ...product, variant })}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 bg-muted/30 p-2 text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span>
                    {data.total} products · Page {page} / {data.last_page}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={page >= data.last_page}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {selected && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-primary/5 p-3">
          <ReportProductImage path={selected.product_thumbnail_img} title={selected.title} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{selected.title}</p>
            <p className="text-xs text-muted-foreground">
              {selected.variant?.label || "All product movements"} · SKU: {selected.variant?.sku || selected.sku || "—"}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => onPreview(selected)}>
            <Eye className="size-4" />
            Preview report
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear product filter"
            onClick={() => onSelect(null)}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
