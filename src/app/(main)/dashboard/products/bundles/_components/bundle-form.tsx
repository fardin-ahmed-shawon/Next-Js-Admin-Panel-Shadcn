"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { ImagePlus, Minus, Package, Plus, Search, ShoppingCart, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fetchClient } from "@/lib/fetch-client";

export default function BundleForm({ bundleId }: { bundleId?: string }) {
  const api = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]),
    [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", price: "", short: "", long: "", free: false, status: "active" });
  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [existingGallery, setExistingGallery] = useState<any[]>([]);
  const [loadingBundle, setLoadingBundle] = useState(Boolean(bundleId));
  const [loadError, setLoadError] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null),
    [gallery, setGallery] = useState<File[]>([]),
    [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState(""),
    [productCategory, setProductCategory] = useState("all"),
    [searchFocused, setSearchFocused] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null),
    galleryRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void Promise.all([
      fetchClient(api + "products?per_page=1000").then((r) => r.json()),
      fetchClient(api + "main-categories?per_page=1000").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts((p.data?.data || p.data || []).filter((x: any) => !x.is_bundle));
      setCategories(c.data?.data || c.data || []);
    });
  }, [api]);
  useEffect(() => {
    if (!bundleId) return;
    let active = true;
    fetchClient(api + "product-bundles/" + bundleId)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Unable to load bundle");
        if (!active) return;
        const bundle = payload.data;
        setForm({
          name: bundle.title,
          price: String(bundle.selling_price),
          short: bundle.product_short_description || "",
          long: bundle.product_long_description || "",
          free: Boolean(bundle.has_free_shipping),
          status: bundle.status,
        });
        setRows(
          bundle.bundle_items.map((item: any) => ({
            productId: String(item.component_product_id),
            variantId: item.component_variant_id ? String(item.component_variant_id) : "",
            quantity: item.quantity,
          })),
        );
        setExistingThumbnail(bundle.product_thumbnail_img || "");
        setExistingGallery(bundle.gallery || []);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoadingBundle(false);
      });
    return () => {
      active = false;
    };
  }, [api, bundleId]);
  const calculatedSellingPrice = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const product = products.find((item) => String(item.id) === row.productId);
        const variant = product?.variants?.find((item: any) => String(item.id) === row.variantId);
        const unitPrice = Number(
          variant?.variant_pricing?.selling_price ??
            variant?.variantPricing?.selling_price ??
            variant?.selling_price ??
            product?.selling_price ??
            0,
        );
        return sum + unitPrice * row.quantity;
      }, 0),
    [rows, products],
  );
  const patch = (i: number, x: any) => setRows((a) => a.map((r, n) => (n === i ? { ...r, ...x } : r)));
  async function save() {
    if ((!thumbnail && !existingThumbnail) || rows.length < 2 || rows.some((r) => !r.productId)) {
      toast.error("Complete all required fields.");
      return;
    }
    setSaving(true);
    const d = new FormData();
    d.append("name", form.name);
    d.append("selling_price", form.price);
    d.append("short_description", form.short);
    d.append("long_description", form.long);
    d.append("has_free_shipping", form.free ? "1" : "0");
    d.append("status", form.status);
    if (thumbnail) d.append("thumbnail", thumbnail);
    d.append("existing_gallery_ids", JSON.stringify(existingGallery.map((image) => image.id)));
    gallery.forEach((file) => {
      d.append("gallery_images[]", file);
    });
    d.append(
      "items",
      JSON.stringify(
        rows.map((r) => ({
          product_id: +r.productId,
          variant_id: r.variantId ? +r.variantId : null,
          quantity: +r.quantity,
        })),
      ),
    );
    try {
      const res = await fetchClient(api + "product-bundles" + (bundleId ? "/" + bundleId : ""), {
        method: "POST",
        body: d,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || (Object.values(json.errors || {}).flat()[0] as string));
      toast.success(bundleId ? "Bundle updated." : "Bundle created.");
      router.push("/dashboard/products/bundles");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create bundle");
    } finally {
      setSaving(false);
    }
  }
  const filteredProducts = products.filter(
    (p) =>
      (!productSearch ||
        p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
        String(p.id) === productSearch) &&
      (productCategory === "all" || String(p.main_category_id) === productCategory),
  );
  const productImage = (path?: string | null) => {
    if (!path) return "https://placehold.co/80x80/f4f4f5/71717a?text=No+Img";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
    return base + "/" + path.replace(/^\//, "");
  };
  const productPrice = (product: any) => {
    const prices = (product?.variants || [])
      .map((variant: any) =>
        Number(
          variant?.variant_pricing?.selling_price ?? variant?.variantPricing?.selling_price ?? variant?.selling_price,
        ),
      )
      .filter((price: number) => Number.isFinite(price) && price >= 0);
    if (!prices.length) return "৳" + Number(product?.selling_price || 0).toLocaleString();
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? "৳" + min.toLocaleString() : "৳" + min.toLocaleString() + " - ৳" + max.toLocaleString();
  };
  const addProduct = (product: any) => {
    if (rows.some((row) => row.productId === String(product.id))) {
      toast.info("This product is already in the bundle.");
      return;
    }
    setRows((current) => [...current, { productId: String(product.id), variantId: "", quantity: 1 }]);
    setProductSearch("");
    setSearchFocused(false);
  };
  if (loadingBundle) return <p>Loading bundle...</p>;
  if (loadError) return <p role="alert">{loadError}</p>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">{bundleId ? "Edit Product Bundle" : "Create Product Bundle"}</h1>
        <p className="text-muted-foreground">Combine exact products, variants and shared-stock packs.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Info</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set the essentials people need to identify and trust this bundle.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Thumbnail</Label>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => thumbnailRef.current?.click()}
                    className="flex size-52 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/20"
                  >
                    {thumbnail || existingThumbnail ? (
                      <img
                        src={thumbnail ? URL.createObjectURL(thumbnail) : productImage(existingThumbnail)}
                        className="size-full object-cover"
                        alt="Bundle thumbnail"
                      />
                    ) : (
                      <Upload className="size-10 text-muted-foreground" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold">Product thumbnail</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      JPG or PNG. Keep it square and at least 1000 by 1000 pixels.
                    </p>
                    <Button type="button" variant="link" className="px-0" onClick={() => thumbnailRef.current?.click()}>
                      Upload image
                    </Button>
                  </div>
                  <input
                    ref={thumbnailRef}
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <RichTextEditor
                  value={form.short}
                  onChange={(value) => setForm({ ...form, short: value })}
                  placeholder="A brief one-liner about the bundle."
                />
              </div>
              <div className="space-y-2">
                <Label>Long Description</Label>
                <RichTextEditor
                  value={form.long}
                  onChange={(value) => setForm({ ...form, long: value })}
                  placeholder="Detailed bundle information, features, materials, etc."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5" />
                  Products in this bundle
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Search and add products to this bundle.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by product name, SKU, or ID..."
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                  />
                  {searchFocused && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                      {filteredProducts.length ? (
                        filteredProducts.slice(0, 50).map((product) => (
                          <button
                            type="button"
                            key={product.id}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => addProduct(product)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                          >
                            <div className="size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                              <img
                                src={productImage(product.product_thumbnail_img)}
                                alt={product.title}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{product.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.sku || "No SKU"} · Stock: {product.available_stock ?? 0}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">{productPrice(product)}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No matching products found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Select value={productCategory} onValueChange={setProductCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {rows.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-muted p-4">
                    <ShoppingCart className="size-7 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-semibold">No products added yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Search above to find and add products to this bundle.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rows.map((row, index) => {
                    const product = products.find((item) => String(item.id) === row.productId);
                    const variant = product?.variants?.find((item: any) => String(item.id) === row.variantId);
                    const unitPrice = Number(
                      variant?.variant_pricing?.selling_price ??
                        variant?.variantPricing?.selling_price ??
                        variant?.selling_price ??
                        product?.selling_price ??
                        0,
                    );
                    return (
                      <div
                        key={row.productId}
                        className="flex flex-col gap-4 rounded-xl border p-3 md:flex-row md:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <img
                              src={productImage(product?.product_thumbnail_img)}
                              alt={product?.title || "Product"}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{product?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {product?.sku || "No SKU"} · ৳{unitPrice.toLocaleString()} each
                            </p>
                          </div>
                        </div>
                        {(product?.has_variants || product?.inventory_mode === "shared_bulk") && (
                          <Select value={row.variantId} onValueChange={(value) => patch(index, { variantId: value })}>
                            <SelectTrigger className="w-full md:w-44">
                              <SelectValue placeholder="Variant / pack" />
                            </SelectTrigger>
                            <SelectContent>
                              {product?.variants?.map((item: any) => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                  {item.option_label ||
                                    [item.size?.label, item.color?.label].filter(Boolean).join(" / ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => patch(index, { quantity: Math.max(1, row.quantity - 1) })}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-8 text-center font-medium tabular-nums">{row.quantity}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => patch(index, { quantity: row.quantity + 1 })}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                        <span className="min-w-20 text-right font-semibold tabular-nums">
                          ৳{(unitPrice * row.quantity).toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <div className="flex justify-between border-t pt-3 text-sm">
                    <span>{rows.length} product(s)</span>
                    <span className="font-semibold">Subtotal: ৳{calculatedSellingPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showcase the bundle from multiple angles before publishing.
              </p>
            </CardHeader>
            <CardContent>
              {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useSemanticElements: This composite drop zone supports drag-and-drop and keyboard activation. */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") galleryRef.current?.click();
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setGallery((current) => [
                    ...current,
                    ...Array.from(event.dataTransfer.files)
                      .filter((file) => file.type.startsWith("image/"))
                      .slice(0, 5 - current.length),
                  ]);
                }}
                className="flex min-h-80 flex-col items-center justify-center rounded-xl border-2 border-dashed"
              >
                <div className="rounded-full bg-muted p-4">
                  <ImagePlus className="size-6 text-muted-foreground" />
                </div>
                <h3 className="mt-5 font-semibold">Drop your images here</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  PNG or JPG up to 5MB. Add up to 5 product media assets.
                </p>
                <Button type="button" variant="outline" className="mt-5" onClick={() => galleryRef.current?.click()}>
                  <Upload className="mr-2 size-4" />
                  Select images
                </Button>
                <input
                  ref={galleryRef}
                  hidden
                  multiple
                  type="file"
                  accept="image/*"
                  onChange={(event) => setGallery(Array.from(event.target.files || []).slice(0, 5))}
                />
                {existingGallery.length > 0 && (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {existingGallery.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={productImage(image.product_img)}
                          alt="Bundle gallery"
                          className="size-20 rounded object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExistingGallery((current) => current.filter((item) => item.id !== image.id))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {gallery.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {gallery.map((file, index) => (
                      <div key={file.name + index} className="relative size-20 overflow-hidden rounded border">
                        <img src={URL.createObjectURL(file)} className="size-full object-cover" alt="" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                          onClick={() => setGallery((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Calculated selling price</Label>
              <div className="rounded border bg-muted p-3 font-bold">৳{calculatedSellingPrice.toLocaleString()}</div>
              <Label>Bundle selling price</Label>
              <Input
                type="number"
                min={1}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between">
                <Label>Free shipping</Label>
                <Switch checked={form.free} onCheckedChange={(value) => setForm({ ...form, free: value })} />
              </div>
              <Button className="w-full" disabled={saving} onClick={save}>
                {saving ? "Saving..." : bundleId ? "Save Bundle" : "Create Bundle"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
