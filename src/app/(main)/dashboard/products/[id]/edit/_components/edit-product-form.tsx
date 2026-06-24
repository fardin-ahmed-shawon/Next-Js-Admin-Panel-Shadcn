"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, CirclePlus, ImagePlus, Package, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import useProduct from "@/hooks/useProduct";
import useCategories from "@/hooks/useCategories";
import useAttributes from "@/hooks/useAttributes";

/* ---- Types ---- */
interface Variant {
  id?: number | string;
  color: string;
  size: string;
  sku: string;
  available_stock: string | number;
  purchasePrice?: string;
  regularPrice?: string;
  sellingPrice?: string;
}

interface MediaItem {
  id: number;
  url: string;
  name: string;
}



const getImageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

const generateSKU = () => 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();

export function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { product, loading: productLoading } = useProduct(productId);
  const { categories } = useCategories();
  const { colors, sizes, loading: attributesLoading } = useAttributes();

  // State initialization flag
  const [initialized, setInitialized] = React.useState(false);

  // Form State
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
  const [productName, setProductName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [subCategoryId, setSubCategoryId] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [longDescription, setLongDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  // Media (Existing + New)
  const [existingMedia, setExistingMedia] = React.useState<MediaItem[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = React.useState<number[]>([]);
  const [newMediaFiles, setNewMediaFiles] = React.useState<{ id: string; file: File; url: string }[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  // Pricing & Stock
  const [sku, setSku] = React.useState("");
  const [availableStock, setAvailableStock] = React.useState("0");
  const [purchasePrice, setPurchasePrice] = React.useState("0");
  const [regularPrice, setRegularPrice] = React.useState("0");
  const [sellingPrice, setSellingPrice] = React.useState("0");

  // Variants
  const [hasVariants, setHasVariants] = React.useState(false);
  const [hasVariantWisePricing, setHasVariantWisePricing] = React.useState(false);
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // Pre-Order
  const [isPreOrder, setIsPreOrder] = React.useState(false);
  const [availableDate, setAvailableDate] = React.useState("");
  const [preOrderNote, setPreOrderNote] = React.useState("");

  // SEO
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [metaKeywords, setMetaKeywords] = React.useState("");
  const [canonicalUrl, setCanonicalUrl] = React.useState("");

  const [saving, setSaving] = React.useState(false);

  const thumbnailRef = React.useRef<HTMLInputElement>(null);
  const mediaRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (product && !attributesLoading && !initialized) {
      setProductName(product.title || "");
      setCategoryId(product.main_category_id?.toString() || "");
      setSubCategoryId(product.sub_category_id?.toString() || "");
      setShortDescription(product.product_short_description || "");
      setLongDescription(product.product_long_description || "");
      setIsActive(product.status !== "Inactive");
      
      setSku(product.sku || "");
      setAvailableStock(product.available_stock?.toString() || "0");
      setPurchasePrice(product.purchase_price?.toString() || "0");
      setRegularPrice(product.regular_price?.toString() || "0");
      setSellingPrice(product.selling_price?.toString() || "0");

      if (product.product_thumbnail_img) {
        setThumbnailPreview(getImageUrl(product.product_thumbnail_img));
      }

      if (product.gallery && Array.isArray(product.gallery)) {
        setExistingMedia(product.gallery.map((g: any) => ({
          id: g.id,
          url: getImageUrl(g.product_img || g.image),
          name: `Image ${g.id}`
        })));
      }

      setHasVariants(!!product.has_variants);
      setHasVariantWisePricing(!!product.has_variant_wise_pricing);

      if (product.variants && Array.isArray(product.variants)) {
        setVariants(product.variants.map((v: any) => {
          const colorLabel = colors.find((c: any) => c.id == v.color_id)?.label || v.color?.name || v.color || "";
          const sizeLabel = sizes.find((s: any) => s.id == v.size_id)?.label || v.size?.name || v.size || "";
          
          return {
            id: v.id,
            color: colorLabel,
            size: sizeLabel,
            sku: v.sku || "",
            available_stock: v.available_stock || 0,
            purchasePrice: v.variant_pricing?.purchase_price?.toString() || "",
            regularPrice: v.variant_pricing?.regular_price?.toString() || "",
            sellingPrice: v.variant_pricing?.selling_price?.toString() || "",
          };
        }));
      }

      setIsPreOrder(!!product.is_preorder_active);
      setMetaTitle(product.meta_title || "");
      setMetaDescription(product.meta_description || "");
      setMetaKeywords(product.meta_keywords || "");
      setCanonicalUrl(product.canonical_url || "");

      setInitialized(true);
    }
  }, [product, initialized, attributesLoading, colors, sizes]);

  const filteredSubCategories = React.useMemo(() => {
    const main = categories.find(c => c.id.toString() === categoryId);
    return main?.["sub-categories"] || [];
  }, [categories, categoryId]);

  function addVariant() {
    setVariants((p) => [
      ...p,
      { 
        id: `new_${Date.now()}`, 
        color: "", 
        size: "", 
        sku: generateSKU(), 
        available_stock: 0,
        purchasePrice: purchasePrice,
        regularPrice: regularPrice,
        sellingPrice: sellingPrice
      },
    ]);
  }

  function removeVariant(id: number | string) {
    setVariants((p) => p.filter((v) => v.id !== id));
  }

  function updateVariant(id: number | string, field: keyof Variant, val: string) {
    setVariants((p) => p.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  }

  function removeExistingMedia(id: number) {
    setExistingMedia((p) => p.filter((m) => m.id !== id));
    setDeletedGalleryIds((p) => [...p, id]);
  }

  function removeNewMedia(id: string) {
    setNewMediaFiles((p) => p.filter((m) => m.id !== id));
  }

  function handleMediaFiles(files: FileList | null) {
    if (!files) return;
    const newItems = Array.from(files).map((f) => ({
      id: `new_${Date.now()}_${Math.random()}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setNewMediaFiles((p) => [...p, ...newItems]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleMediaFiles(e.dataTransfer.files);
  }

  async function handleUpdate() {
    if (!productName.trim()) {
      toast.error("Product name is required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", productName);
      if (categoryId) formData.append("main_category_id", categoryId);
      if (subCategoryId) formData.append("sub_category_id", subCategoryId);
      if (shortDescription) formData.append("short_description", shortDescription);
      if (longDescription) formData.append("long_description", longDescription);
      
      formData.append("status", isActive ? "Active" : "Inactive");
      formData.append("sku", sku);
      formData.append("available_stock", availableStock.toString());
      if (!hasVariantWisePricing) {
        formData.append("purchase_price", purchasePrice.toString());
        formData.append("regular_price", regularPrice.toString());
        formData.append("selling_price", sellingPrice.toString());
      }
      
      formData.append("is_preorder", isPreOrder ? "true" : "false");
      if (metaTitle) formData.append("meta_title", metaTitle);
      if (metaDescription) formData.append("meta_description", metaDescription);
      if (metaKeywords) formData.append("meta_keywords", metaKeywords);
      if (canonicalUrl) formData.append("canonical_url", canonicalUrl);

      formData.append("has_variants", hasVariants ? "1" : "0");
      formData.append("has_variant_wise_pricing", hasVariantWisePricing ? "1" : "0");

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      if (deletedGalleryIds.length > 0) {
        formData.append("deleted_gallery_ids", JSON.stringify(deletedGalleryIds));
      }

      newMediaFiles.forEach((m) => {
        formData.append(`gallery_images[]`, m.file);
      });

      if (hasVariants && variants.length > 0) {
        // Filter out temporary string IDs for new variants
        const mappedVariants = variants.map(v => {
          const mapped: any = { ...v };
          if (typeof mapped.id === 'string' && mapped.id.startsWith('new_')) {
            delete mapped.id;
          }
          mapped.color = mapped.color || null;
          mapped.size = mapped.size || null;
          mapped.available_stock = mapped.available_stock ? Number(mapped.available_stock) : undefined;
          
          if (hasVariantWisePricing) {
            mapped.purchase_price = mapped.purchasePrice ? Number(mapped.purchasePrice) : undefined;
            mapped.regular_price = mapped.regularPrice ? Number(mapped.regularPrice) : undefined;
            mapped.selling_price = mapped.sellingPrice ? Number(mapped.sellingPrice) : undefined;
          }
          
          delete mapped.purchasePrice;
          delete mapped.regularPrice;
          delete mapped.sellingPrice;
          
          return mapped;
        });
        formData.append("variants", JSON.stringify(mappedVariants));
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}product/${productId}`, {
        method: "POST", // POST with _method=PUT
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  if (productLoading) {
    return <div>Loading product data...</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/products`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Edit Product</h1>
            <p className="text-sm text-muted-foreground">Update product details for {productName}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products`}>Cancel</Link>
          </Button>
          <Button size="sm" onClick={handleUpdate} disabled={saving}>
            {saving ? "Saving..." : <><Save className="mr-2 size-4" /> Update Product</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="space-y-2">
                <Label className="text-primary font-medium">Thumbnail</Label>
                <div className="flex items-center gap-4">
                  {thumbnailPreview ? (
                    <div className="relative size-16 overflow-hidden rounded-lg border">
                      <img src={thumbnailPreview} alt="Thumbnail" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-lg border border-dashed">
                      <Upload className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Product thumbnail</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => thumbnailRef.current?.click()}>
                        {thumbnailPreview ? "Replace image" : "Upload image"}
                      </Button>
                      {thumbnailPreview && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); }}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setThumbnailFile(f);
                      setThumbnailPreview(URL.createObjectURL(f));
                    }
                  }} />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Main Category</Label>
                  <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubCategoryId(""); }}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.main_category_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub Category</Label>
                  <Select value={subCategoryId} onValueChange={setSubCategoryId} disabled={!categoryId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select sub category" /></SelectTrigger>
                    <SelectContent>
                      {filteredSubCategories.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-desc">Short Description</Label>
                <Textarea id="short-desc" className="min-h-[80px]" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long-desc">Long Description</Label>
                <Textarea id="long-desc" className="min-h-[140px]" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="is-active" className="text-sm font-medium">Is Active</Label>
                  <p className="text-xs text-muted-foreground">Turn this off to keep the product visible but unavailable.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Media</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {existingMedia.map((item) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    <img src={item.url} alt={item.name} className="size-full object-cover" />
                    <button onClick={() => removeExistingMedia(item.id)} className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><X className="size-3.5" /></button>
                  </div>
                ))}
                {newMediaFiles.map((item) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    <img src={item.url} alt="New Upload" className="size-full object-cover" />
                    <button onClick={() => removeNewMedia(item.id)} className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><X className="size-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => mediaRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <ImagePlus className="size-6" />
                  <span className="text-xs font-medium">Add images</span>
                </button>
              </div>
              <input ref={mediaRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleMediaFiles(e.target.files)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Variants & Stock</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <Switch
                    id="has-variants"
                    checked={hasVariants}
                    onCheckedChange={(val) => {
                      setHasVariants(val);
                      if (!val) {
                        setHasVariantWisePricing(false);
                      }
                    }}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="has-variants" className="text-sm font-medium cursor-pointer">
                      Has Variants
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable this if your product comes in multiple sizes or colors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Switch
                    id="has-variant-pricing"
                    checked={hasVariantWisePricing}
                    onCheckedChange={setHasVariantWisePricing}
                    disabled={!hasVariants}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="has-variant-pricing" className="text-sm font-medium cursor-pointer">
                      Variant-Wise Pricing
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable this to set distinct purchase, regular, and selling prices per variant.
                    </p>
                  </div>
                </div>
              </div>

              {!hasVariants && (
                <>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Base SKU</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Base Available Stock</Label><Input type="number" value={availableStock} onChange={(e) => setAvailableStock(e.target.value)} /></div>
                  </div>
                </>
              )}
              {hasVariants && (
                <>
                  <Separator />
              {variants.map((v, idx) => (
                <div key={v.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium">Variant {idx + 1}</p><Button variant="ghost" size="icon-sm" onClick={() => removeVariant(v.id!)}><X className="size-4" /></Button></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label className="text-xs">Color</Label><Select value={v.color} onValueChange={(val) => updateVariant(v.id!, "color", val)}><SelectTrigger><SelectValue placeholder="Color" /></SelectTrigger><SelectContent>{colors.map((o: any) => <SelectItem key={o.label} value={o.label}><div className="flex items-center gap-2">{o.hex_value && <div className="size-3 rounded-full border border-black/10" style={{ backgroundColor: o.hex_value }} />}{o.label}</div></SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label className="text-xs">Size</Label><Select value={v.size} onValueChange={(val) => updateVariant(v.id!, "size", val)}><SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger><SelectContent>{sizes.map((o: any) => <SelectItem key={o.label} value={o.label}>{o.label}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label className="text-xs">SKU</Label><Input value={v.sku} onChange={(e) => updateVariant(v.id!, "sku", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Stock</Label><Input type="number" value={v.available_stock} onChange={(e) => updateVariant(v.id!, "available_stock", e.target.value)} /></div>
                  </div>
                  {hasVariantWisePricing && (
                    <div className="grid gap-3 sm:grid-cols-3 bg-muted/30 p-3 rounded-md border border-dashed">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-primary">Purchase Price (৳)</Label>
                        <Input type="number" placeholder="0.00" value={v.purchasePrice || ""} onChange={(e) => updateVariant(v.id!, "purchasePrice", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-primary">Regular Price (৳)</Label>
                        <Input type="number" placeholder="0.00" value={v.regularPrice || ""} onChange={(e) => updateVariant(v.id!, "regularPrice", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-primary">Selling Price (৳)</Label>
                        <Input type="number" placeholder="0.00" value={v.sellingPrice || ""} onChange={(e) => updateVariant(v.id!, "sellingPrice", e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-fit" onClick={addVariant}><CirclePlus className="mr-2 size-4" /> Add Variant</Button>
              </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {!hasVariantWisePricing && (
            <Card>
              <CardHeader><CardTitle className="text-base text-primary">Pricing</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="space-y-2"><Label>Purchase Price (৳)</Label><Input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} /></div>
                <div className="space-y-2"><Label>Regular Price (৳)</Label><Input value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} /></div>
                <div className="space-y-2"><Label>Selling Price (৳)</Label><Input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base text-primary">Pre-Order</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <Checkbox id="is-preorder" checked={isPreOrder} onCheckedChange={(v) => setIsPreOrder(v === true)} className="mt-0.5" />
                <div className="space-y-0.5"><Label htmlFor="is-preorder">Is Pre-Order</Label></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base text-primary">SEO Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2"><Label>Meta Title</Label><Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Meta Description</Label><Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></div>
              <div className="space-y-2"><Label>Meta Keywords</Label><Input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} /></div>
              <div className="space-y-2"><Label>Canonical URL</Label><Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
