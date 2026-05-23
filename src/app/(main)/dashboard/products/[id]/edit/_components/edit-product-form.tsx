"use client";

import * as React from "react";

import Link from "next/link";

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

/* ---- Types ---- */

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

/* ---- Option data ---- */

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
  ],
  clothing: [
    { value: "mens-wear", label: "Men's Wear" },
    { value: "womens-wear", label: "Women's Wear" },
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
  { value: "ocean", label: "Ocean" },
  { value: "sand", label: "Sand" },
  { value: "rose", label: "Rose" },
];
const sizeOptions = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "free", label: "Free Size" },
];
const weightOptions = [
  { value: "100g", label: "100g" },
  { value: "250g", label: "250g" },
  { value: "500g", label: "500g" },
  { value: "1kg", label: "1 kg" },
  { value: "2kg", label: "2 kg" },
];

/* ---- Component ---- */

export function EditProductForm({ productId }: { productId: string }) {
  // Pre-populated state
  const [thumbnail, setThumbnail] = React.useState<string | null>("https://placehold.co/80x80/1a1a2e/e0e0e0?text=T");
  const [productName, setProductName] = React.useState("Radiance Ritual Set");
  const [category, setCategory] = React.useState("beauty");
  const [subCategory, setSubCategory] = React.useState("skincare");
  const [shortDescription, setShortDescription] = React.useState(
    "A curated trio of serums and moisturizers for a radiant glow.",
  );
  const [longDescription, setLongDescription] = React.useState(
    "The Radiance Ritual Set brings together our best-selling Vitamin C Serum, Hyaluronic Acid Moisturizer, and Gentle Foam Cleanser in one premium gift box.",
  );
  const [isActive, setIsActive] = React.useState(true);

  const [media, setMedia] = React.useState<MediaItem[]>([
    { id: "m1", url: "https://placehold.co/280x360/1a1a2e/e0e0e0?text=Main", name: "main.jpg" },
    { id: "m2", url: "https://placehold.co/280x360/1a1a2e/e0e0e0?text=Angle+1", name: "angle-1.jpg" },
    { id: "m3", url: "https://placehold.co/280x360/1a1a2e/e0e0e0?text=Angle+2", name: "angle-2.jpg" },
  ]);
  const [isDragging, setIsDragging] = React.useState(false);

  const [sku, setSku] = React.useState("SKU-SKIN-4006");
  const [availableStock, setAvailableStock] = React.useState("120");
  const [variants, setVariants] = React.useState<Variant[]>([
    {
      id: "v1",
      color: "ocean",
      size: "",
      weight: "",
      sku: "SKU-SKIN-4006-OCN",
      stock: "48",
      purchasePrice: "150",
      regularPrice: "389",
      sellingPrice: "249",
    },
    {
      id: "v2",
      color: "sand",
      size: "",
      weight: "",
      sku: "SKU-SKIN-4006-SND",
      stock: "22",
      purchasePrice: "150",
      regularPrice: "389",
      sellingPrice: "249",
    },
  ]);

  const [purchasePrice, setPurchasePrice] = React.useState("95");
  const [regularPrice, setRegularPrice] = React.useState("179");
  const [sellingPrice, setSellingPrice] = React.useState("149");

  const [isPreOrder, setIsPreOrder] = React.useState(false);
  const [availableDate, setAvailableDate] = React.useState("");
  const [preOrderNote, setPreOrderNote] = React.useState("");

  const [metaTitle, setMetaTitle] = React.useState("Radiance Ritual Set | Acme Store");
  const [metaDescription, setMetaDescription] = React.useState(
    "Premium skincare set with Vitamin C serum, moisturizer, and cleanser.",
  );
  const [metaKeywords, setMetaKeywords] = React.useState("skincare, gift set, best seller");
  const [canonicalUrl, setCanonicalUrl] = React.useState("");

  const thumbnailRef = React.useRef<HTMLInputElement>(null);
  const mediaRef = React.useRef<HTMLInputElement>(null);

  const filteredSubCategories = category ? subCategories[category] || [] : [];

  function addVariant() {
    setVariants((p) => [
      ...p,
      {
        id: `v${Date.now()}`,
        color: "",
        size: "",
        weight: "",
        sku: "",
        stock: "",
        purchasePrice: "",
        regularPrice: "",
        sellingPrice: "",
      },
    ]);
  }
  function removeVariant(id: string) {
    setVariants((p) => p.filter((v) => v.id !== id));
  }
  function updateVariant(id: string, field: keyof Variant, val: string) {
    setVariants((p) => p.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  }
  function removeMedia(id: string) {
    setMedia((p) => p.filter((m) => m.id !== id));
  }
  function handleMediaFiles(files: FileList | null) {
    if (!files) return;
    setMedia((p) => [
      ...p,
      ...Array.from(files).map((f, i) => ({ id: `m${Date.now()}-${i}`, url: URL.createObjectURL(f), name: f.name })),
    ]);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleMediaFiles(e.dataTransfer.files);
  }

  function handleUpdate() {
    if (!productName.trim()) {
      toast.error("Product name is required.");
      return;
    }
    toast.success(`"${productName}" has been updated successfully.`);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/products/${productId}`}>
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
            <Link href={`/dashboard/products/${productId}`}>Cancel</Link>
          </Button>
          <Button size="sm" onClick={handleUpdate}>
            <Save className="mr-2 size-4" />
            Update Product
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Info</CardTitle>
              <CardDescription>Set the essentials people need to identify and trust this item.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
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
                    <p className="text-xs text-muted-foreground">
                      JPG or PNG. Keep it square and at least 1000 by 1000 pixels.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => thumbnailRef.current?.click()}
                      >
                        {thumbnail ? "Replace image" : "Upload image"}
                      </Button>
                      {thumbnail && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => setThumbnail(null)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={thumbnailRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setThumbnail(URL.createObjectURL(f));
                    }}
                  />
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
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v);
                      setSubCategory("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub Category</Label>
                  <Select value={subCategory} onValueChange={setSubCategory} disabled={!category}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubCategories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-desc">Short Description</Label>
                <Textarea
                  id="short-desc"
                  className="min-h-[80px] resize-y"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long-desc">Long Description</Label>
                <Textarea
                  id="long-desc"
                  className="min-h-[140px] resize-y"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                />
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="is-active" className="text-sm font-medium cursor-pointer">
                    Is Active
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Turn this off to keep the product visible but unavailable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
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
                      <div
                        key={item.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                      >
                        <img src={item.url} alt={item.name} className="size-full object-cover" />
                        <button
                          onClick={() => removeMedia(item.id)}
                          className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => mediaRef.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <ImagePlus className="size-6" />
                      <span className="text-xs font-medium">Add images</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{media.length} of 5 media assets selected.</p>
                    <Button variant="outline" size="sm" onClick={() => mediaRef.current?.click()}>
                      <Upload className="mr-2 size-4" />
                      Add more images
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed py-16 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <ImagePlus className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold">Drop your images here</p>
                    <p className="text-xs text-muted-foreground">
                      PNG or JPG up to 5MB. Add up to 5 product media assets.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => mediaRef.current?.click()}>
                    <Upload className="mr-2 size-4" />
                    Select images
                  </Button>
                </div>
              )}
              <input
                ref={mediaRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleMediaFiles(e.target.files)}
              />
            </CardContent>
          </Card>

          {/* Variants & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants & Stock</CardTitle>
              <CardDescription>Configure alternate sizes, colors, or weights with their own inventory.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="base-sku">SKU</Label>
                  <Input id="base-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base-stock">Available Stock</Label>
                  <Input
                    id="base-stock"
                    type="number"
                    value={availableStock}
                    onChange={(e) => setAvailableStock(e.target.value)}
                  />
                </div>
              </div>
              <Separator />
              {variants.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <Package className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium">No variants added</p>
                    <p className="text-xs text-muted-foreground">
                      Add variants to offer different sizes, colors, or weights.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addVariant}>
                    <CirclePlus className="mr-2 size-4" />
                    Add Variant
                  </Button>
                </div>
              ) : (
                <>
                  {variants.map((v, idx) => (
                    <div key={v.id} className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Variant {idx + 1}</p>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeVariant(v.id)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Color <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Select value={v.color} onValueChange={(val) => updateVariant(v.id, "color", val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colorOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Size <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Select value={v.size} onValueChange={(val) => updateVariant(v.id, "size", val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {sizeOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Weight <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Select value={v.weight} onValueChange={(val) => updateVariant(v.id, "weight", val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select weight" />
                            </SelectTrigger>
                            <SelectContent>
                              {weightOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">SKU</Label>
                          <Input value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Available Stock</Label>
                          <Input
                            type="number"
                            value={v.stock}
                            onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Variant Pricing <span>(optional)</span>
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Purchase Price (৳)</Label>
                            <Input
                              value={v.purchasePrice}
                              onChange={(e) => updateVariant(v.id, "purchasePrice", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Regular Price (৳)</Label>
                            <Input
                              value={v.regularPrice}
                              onChange={(e) => updateVariant(v.id, "regularPrice", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Selling Price (৳)</Label>
                            <Input
                              value={v.sellingPrice}
                              onChange={(e) => updateVariant(v.id, "sellingPrice", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-fit" onClick={addVariant}>
                    <CirclePlus className="mr-2 size-4" />
                    Add Variant
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Pricing</CardTitle>
              <CardDescription>Set the base pricing for this product.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="purchase-price" className="text-primary font-medium">
                  Purchase Price (৳)
                </Label>
                <Input id="purchase-price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regular-price" className="text-primary font-medium">
                  Regular Price (৳)
                </Label>
                <Input id="regular-price" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling-price" className="text-primary font-medium">
                  Selling Price (৳)
                </Label>
                <Input id="selling-price" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Pre-Order</CardTitle>
              <CardDescription>Enable pre-order if the product is not yet available.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="is-preorder"
                  checked={isPreOrder}
                  onCheckedChange={(v) => setIsPreOrder(v === true)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="is-preorder" className="text-sm font-medium cursor-pointer">
                    Is Pre-Order
                  </Label>
                  <p className="text-xs text-muted-foreground">Mark this product as available for pre-order.</p>
                </div>
              </div>
              {isPreOrder && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="available-date" className="text-primary font-medium">
                      Available Date
                    </Label>
                    <Input
                      id="available-date"
                      type="date"
                      value={availableDate}
                      onChange={(e) => setAvailableDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preorder-note" className="text-primary font-medium">
                      Pre-Order Note
                    </Label>
                    <Textarea
                      id="preorder-note"
                      className="min-h-[80px] resize-y"
                      value={preOrderNote}
                      onChange={(e) => setPreOrderNote(e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">SEO Settings</CardTitle>
              <CardDescription>Optimize how this product appears in search results.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="meta-title" className="text-primary font-medium">
                  Meta Title
                </Label>
                <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters recommended.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-desc" className="text-primary font-medium">
                  Meta Description
                </Label>
                <Textarea
                  id="meta-desc"
                  className="min-h-[80px] resize-y"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters recommended.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-keywords" className="text-primary font-medium">
                  Meta Keywords
                </Label>
                <Input id="meta-keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical-url" className="text-primary font-medium">
                  Canonical URL
                </Label>
                <Input id="canonical-url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Set a canonical URL to avoid duplicate content issues.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
