"use client";

import * as React from "react";
import {
  CirclePlus,
  ImagePlus,
  Package,
  RefreshCw,
  Save,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Variant {
  id: string;
  color: string;
  size: string;
  weight: string;
  sku: string;
  stock: string;
  purchasePrice: string;
  regularPrice: string;
  sellingPrice: string;
}

interface MediaItem {
  id: string;
  url: string;
  name: string;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const mainCategories = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home-garden", label: "Home & Garden" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "beauty", label: "Beauty & Health" },
];

const subCategories: Record<string, { value: string; label: string }[]> = {
  electronics: [
    { value: "smartphones", label: "Smartphones" },
    { value: "laptops", label: "Laptops" },
    { value: "tablets", label: "Tablets" },
  ],
  clothing: [
    { value: "mens-wear", label: "Men's Wear" },
    { value: "womens-wear", label: "Women's Wear" },
    { value: "kids-wear", label: "Kids Wear" },
  ],
  "home-garden": [
    { value: "furniture", label: "Furniture" },
    { value: "decor", label: "Decor" },
  ],
  sports: [
    { value: "fitness", label: "Fitness" },
    { value: "outdoor", label: "Outdoor" },
  ],
  beauty: [
    { value: "skincare", label: "Skincare" },
    { value: "makeup", label: "Makeup" },
  ],
};

const colorOptions = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "yellow", label: "Yellow" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "brown", label: "Brown" },
  { value: "gray", label: "Gray" },
  { value: "navy", label: "Navy" },
  { value: "maroon", label: "Maroon" },
];

const sizeOptions = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "xxl", label: "XXL" },
  { value: "3xl", label: "3XL" },
  { value: "28", label: "28" },
  { value: "30", label: "30" },
  { value: "32", label: "32" },
  { value: "34", label: "34" },
  { value: "36", label: "36" },
  { value: "38", label: "38" },
  { value: "40", label: "40" },
  { value: "42", label: "42" },
  { value: "free", label: "Free Size" },
];

const weightOptions = [
  { value: "100g", label: "100g" },
  { value: "250g", label: "250g" },
  { value: "500g", label: "500g" },
  { value: "750g", label: "750g" },
  { value: "1kg", label: "1 kg" },
  { value: "1.5kg", label: "1.5 kg" },
  { value: "2kg", label: "2 kg" },
  { value: "3kg", label: "3 kg" },
  { value: "5kg", label: "5 kg" },
  { value: "10kg", label: "10 kg" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddProductForm() {
  // Product info
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  const [productName, setProductName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [subCategory, setSubCategory] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [longDescription, setLongDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  // Media
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  // Variants & Stock
  const [sku, setSku] = React.useState("");
  const [availableStock, setAvailableStock] = React.useState("");
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // Pricing
  const [purchasePrice, setPurchasePrice] = React.useState("");
  const [regularPrice, setRegularPrice] = React.useState("");
  const [sellingPrice, setSellingPrice] = React.useState("");

  // Pre-Order
  const [isPreOrder, setIsPreOrder] = React.useState(false);
  const [availableDate, setAvailableDate] = React.useState("");
  const [preOrderNote, setPreOrderNote] = React.useState("");

  // SEO
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [metaKeywords, setMetaKeywords] = React.useState("");
  const [canonicalUrl, setCanonicalUrl] = React.useState("");

  const thumbnailRef = React.useRef<HTMLInputElement>(null);
  const mediaRef = React.useRef<HTMLInputElement>(null);

  const filteredSubCategories = category ? subCategories[category] || [] : [];

  /* ---- variant helpers ---- */
  function addVariant() {
    setVariants((p) => [
      ...p,
      { id: `v${Date.now()}`, color: "", size: "", weight: "", sku: "", stock: "", purchasePrice: "", regularPrice: "", sellingPrice: "" },
    ]);
  }
  function removeVariant(id: string) {
    setVariants((p) => p.filter((v) => v.id !== id));
  }
  function updateVariant(id: string, field: keyof Variant, val: string) {
    setVariants((p) => p.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  }

  /* ---- media helpers ---- */
  function removeMedia(id: string) {
    setMedia((p) => p.filter((m) => m.id !== id));
  }
  function handleMediaFiles(files: FileList | null) {
    if (!files) return;
    const items: MediaItem[] = Array.from(files).map((f, i) => ({
      id: `m${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setMedia((p) => [...p, ...items]);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleMediaFiles(e.dataTransfer.files);
  }

  /* ---- actions ---- */
  function resetForm() {
    setProductName(""); setSku(""); setShortDescription(""); setLongDescription("");
    setCategory(""); setSubCategory(""); setThumbnail(null); setIsActive(true);
    setMedia([]); setVariants([]); setAvailableStock("");
    setPurchasePrice(""); setRegularPrice(""); setSellingPrice("");
    setIsPreOrder(false); setAvailableDate(""); setPreOrderNote("");
    setMetaTitle(""); setMetaDescription(""); setMetaKeywords(""); setCanonicalUrl("");
    toast.info("Form has been reset.");
  }

  function handleSaveDraft() { toast.success("Product saved as draft."); }
  function handleSaveProduct() {
    if (!productName.trim()) { toast.error("Product name is required."); return; }
    toast.success(`"${productName}" has been saved successfully.`);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Add Product</h1>
          <p className="text-sm text-muted-foreground">
            Build a polished product record with pricing, media, availability, and variant data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetForm}><RefreshCw className="mr-2 size-4" />Reset</Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}><Save className="mr-2 size-4" />Save draft</Button>
          <Button size="sm" onClick={handleSaveProduct}><Upload className="mr-2 size-4" />Upload Product</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ======== LEFT COLUMN ======== */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* ---- Product Info ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Info</CardTitle>
              <CardDescription>Set the essentials people need to identify and trust this item.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Thumbnail */}
              <div className="space-y-2">
                <Label className="text-primary font-medium">Thumbnail</Label>
                <div className="flex items-center gap-4">
                  {thumbnail ? (
                    <div className="relative size-16 overflow-hidden rounded-lg border">
                      <img src={thumbnail} alt="Thumbnail" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-lg border border-dashed">
                      <Upload className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Product thumbnail</p>
                    <p className="text-xs text-muted-foreground">JPG or PNG. Keep it square and at least 1000 by 1000 pixels.</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => thumbnailRef.current?.click()}>
                        {thumbnail ? "Replace image" : "Upload image"}
                      </Button>
                      {thumbnail && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setThumbnail(null)}>Remove</Button>
                      )}
                    </div>
                  </div>
                  <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setThumbnail(URL.createObjectURL(f)); }} />
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" placeholder="Shirt, t-shirts, etc." value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>

              {/* Category & Sub */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Main Category</Label>
                  <Select value={category} onValueChange={(v) => { setCategory(v); setSubCategory(""); }}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{mainCategories.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub Category</Label>
                  <Select value={subCategory} onValueChange={setSubCategory} disabled={!category}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select sub category" /></SelectTrigger>
                    <SelectContent>{filteredSubCategories.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="short-desc">Short Description</Label>
                <Textarea id="short-desc" placeholder="A brief one-liner about the product." className="min-h-[80px] resize-y" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <Label htmlFor="long-desc">Long Description</Label>
                <Textarea id="long-desc" placeholder="Detailed product information, features, materials, etc." className="min-h-[140px] resize-y" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
              </div>

              <Separator />

              {/* Is Active */}
              <div className="flex items-start gap-3">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="is-active" className="text-sm font-medium cursor-pointer">Is Active</Label>
                  <p className="text-xs text-muted-foreground">Turn this off to keep the product visible but unavailable.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---- Media ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media</CardTitle>
              <CardDescription>Showcase the product from multiple angles before publishing.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {media.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {media.map((item) => (
                      <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                        <img src={item.url} alt={item.name} className="size-full object-cover" />
                        <button onClick={() => removeMedia(item.id)} className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => mediaRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                      <ImagePlus className="size-6" />
                      <span className="text-xs font-medium">Add images</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{media.length} of 5 media assets selected.</p>
                    <Button variant="outline" size="sm" onClick={() => mediaRef.current?.click()}>
                      <Upload className="mr-2 size-4" />Add more images
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed py-16 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <ImagePlus className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold">Drop your images here</p>
                    <p className="text-xs text-muted-foreground">PNG or JPG up to 5MB. Add up to 5 product media assets.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => mediaRef.current?.click()}>
                    <Upload className="mr-2 size-4" />Select images
                  </Button>
                </div>
              )}
              <input ref={mediaRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleMediaFiles(e.target.files)} />
            </CardContent>
          </Card>

          {/* ---- Variants & Stock ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants & Stock</CardTitle>
              <CardDescription>Configure alternate sizes, colors, or weights with their own inventory.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Base SKU & Stock */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="base-sku">SKU</Label>
                  <Input id="base-sku" placeholder="eg. SKU-001" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base-stock">Available Stock</Label>
                  <Input id="base-stock" type="number" placeholder="0" value={availableStock} onChange={(e) => setAvailableStock(e.target.value)} />
                </div>
              </div>

              <Separator />

              {/* Variants list or empty state */}
              {variants.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <Package className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium">No variants added</p>
                    <p className="text-xs text-muted-foreground">Add variants to offer different sizes, colors, or weights.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addVariant}>
                    <CirclePlus className="mr-2 size-4" />Add Variant
                  </Button>
                </div>
              ) : (
                <>
                  {variants.map((v, idx) => (
                    <div key={v.id} className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Variant {idx + 1}</p>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeVariant(v.id)}><X className="size-4" /></Button>
                      </div>
                      {/* Color, Size, Weight */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Color <span className="text-muted-foreground">(optional)</span></Label>
                          <Select value={v.color} onValueChange={(val) => updateVariant(v.id, "color", val)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select color" /></SelectTrigger>
                            <SelectContent>{colorOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Size <span className="text-muted-foreground">(optional)</span></Label>
                          <Select value={v.size} onValueChange={(val) => updateVariant(v.id, "size", val)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select size" /></SelectTrigger>
                            <SelectContent>{sizeOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Weight <span className="text-muted-foreground">(optional)</span></Label>
                          <Select value={v.weight} onValueChange={(val) => updateVariant(v.id, "weight", val)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select weight" /></SelectTrigger>
                            <SelectContent>{weightOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* SKU & Stock */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">SKU</Label>
                          <Input placeholder="SKU-001-RED-M" value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Available Stock</Label>
                          <Input type="number" placeholder="0" value={v.stock} onChange={(e) => updateVariant(v.id, "stock", e.target.value)} />
                        </div>
                      </div>
                      {/* Variant Pricing (optional) */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Variant Pricing <span>(optional)</span></p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Purchase Price (৳)</Label>
                            <Input placeholder="0.00" value={v.purchasePrice} onChange={(e) => updateVariant(v.id, "purchasePrice", e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Regular Price (৳)</Label>
                            <Input placeholder="0.00" value={v.regularPrice} onChange={(e) => updateVariant(v.id, "regularPrice", e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Selling Price  (৳)</Label>
                            <Input placeholder="0.00" value={v.sellingPrice} onChange={(e) => updateVariant(v.id, "sellingPrice", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-fit" onClick={addVariant}>
                    <CirclePlus className="mr-2 size-4" />Add Variant
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ======== RIGHT COLUMN ======== */}
        <div className="flex flex-col gap-6">
          {/* ---- Pricing ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Pricing</CardTitle>
              <CardDescription>Set the base pricing for this product.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="purchase-price" className="text-primary font-medium">Purchase Price (৳)</Label>
                <Input id="purchase-price" placeholder="0.00" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regular-price" className="text-primary font-medium">Regular Price (৳)</Label>
                <Input id="regular-price" placeholder="0.00" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling-price" className="text-primary font-medium">Selling Price (৳)</Label>
                <Input id="selling-price" placeholder="0.00" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* ---- Pre-Order ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Pre-Order</CardTitle>
              <CardDescription>Enable pre-order if the product is not yet available.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <Checkbox id="is-preorder" checked={isPreOrder} onCheckedChange={(v) => setIsPreOrder(v === true)} className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="is-preorder" className="text-sm font-medium cursor-pointer">Is Pre-Order</Label>
                  <p className="text-xs text-muted-foreground">Mark this product as available for pre-order.</p>
                </div>
              </div>
              {isPreOrder && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="available-date" className="text-primary font-medium">Available Date</Label>
                    <Input id="available-date" type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preorder-note" className="text-primary font-medium">Pre-Order Note</Label>
                    <Textarea id="preorder-note" placeholder="Expected delivery by July 2026..." className="min-h-[80px] resize-y" value={preOrderNote} onChange={(e) => setPreOrderNote(e.target.value)} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ---- SEO Settings ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">SEO Settings</CardTitle>
              <CardDescription>Optimize how this product appears in search results.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="meta-title" className="text-primary font-medium">Meta Title</Label>
                <Input id="meta-title" placeholder="Product Name | Your Store" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters recommended.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-desc" className="text-primary font-medium">Meta Description</Label>
                <Textarea id="meta-desc" placeholder="A compelling summary for search engines..." className="min-h-[80px] resize-y" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters recommended.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-keywords" className="text-primary font-medium">Meta Keywords</Label>
                <Input id="meta-keywords" placeholder="keyword1, keyword2, keyword3" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical-url" className="text-primary font-medium">Canonical URL</Label>
                <Input id="canonical-url" placeholder="https://yourstore.com/products/product-name" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Set a canonical URL to avoid duplicate content issues.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
