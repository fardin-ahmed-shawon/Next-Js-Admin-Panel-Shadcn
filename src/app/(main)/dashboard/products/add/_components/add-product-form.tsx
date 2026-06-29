"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { CirclePlus, ImagePlus, Loader2, Package, RefreshCw, Save, Upload, X } from "lucide-react";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import useAttributes from "@/hooks/useAttributes";
import useCategories from "@/hooks/useCategories";

const isDescriptionEmpty = (html: string) => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Variant {
  id: string;
  color: string;
  size: string;
  sku: string;
  stock: string;
  purchasePrice?: string;
  regularPrice?: string;
  sellingPrice?: string;
}

interface MediaItem {
  id: string;
  url: string;
  name: string;
  file: File;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const generateSKU = () => "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddProductForm() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { colors, sizes } = useAttributes();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Product info
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [productName, setProductName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [subCategory, setSubCategory] = React.useState("");
  const [productType, setProductType] = React.useState("none");
  const [shortDescription, setShortDescription] = React.useState("");
  const [longDescription, setLongDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  // Media
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  // Variants & Stock
  const [hasVariants, setHasVariants] = React.useState(false);
  const [hasVariantWisePricing, setHasVariantWisePricing] = React.useState(false);
  const [sku, setSku] = React.useState(generateSKU());
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

  const selectedMainCategory = categories.find((c) => String(c.id) === category);
  const filteredSubCategories = selectedMainCategory?.["sub-categories"] || [];

  /* ---- variant helpers ---- */
  function addVariant() {
    setVariants((p) => [
      ...p,
      {
        id: `v${Date.now()}`,
        color: "",
        size: "",
        sku: generateSKU(),
        stock: "",
        purchasePrice: purchasePrice,
        regularPrice: regularPrice,
        sellingPrice: sellingPrice,
      },
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
      file: f,
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
    setProductName("");
    setSku(generateSKU());
    setShortDescription("");
    setLongDescription("");
    setCategory("");
    setSubCategory("");
    setProductType("none");
    setThumbnailUrl(null);
    setThumbnailFile(null);
    setIsActive(true);
    setMedia([]);
    setHasVariants(false);
    setHasVariantWisePricing(false);
    setVariants([]);
    setAvailableStock("");
    setPurchasePrice("");
    setRegularPrice("");
    setSellingPrice("");
    setIsPreOrder(false);
    setAvailableDate("");
    setPreOrderNote("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setCanonicalUrl("");
    toast.info("Form has been reset.");
  }

  function handleSaveDraft() {
    toast.success("Product saved as draft.");
  }
  async function handleSaveProduct() {
    if (!thumbnailFile) {
      toast.error("Thumbnail image is required.");
      return;
    }
    if (!productName.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!category) {
      toast.error("Main category is required.");
      return;
    }
    if (!subCategory) {
      toast.error("Sub category is required.");
      return;
    }
    if (isDescriptionEmpty(shortDescription)) {
      toast.error("Short description is required.");
      return;
    }
    if (isDescriptionEmpty(longDescription)) {
      toast.error("Long description is required.");
      return;
    }
    if (!hasVariantWisePricing && (!purchasePrice || !regularPrice || !sellingPrice)) {
      toast.error("Pricing (Purchase, Regular, Selling) is required.");
      return;
    }

    if (!hasVariants) {
      if (!sku.trim()) {
        toast.error("SKU is required when there are no variants.");
        return;
      }
      if (!availableStock) {
        toast.error("Available stock is required when there are no variants.");
        return;
      }
    } else {
      if (variants.length === 0) {
        toast.error("Please add at least one variant since 'Has Variants' is enabled.");
        return;
      }
      for (let i = 0; i < variants.length; i++) {
        if (!variants[i].sku.trim() || !variants[i].stock) {
          toast.error(`SKU and Stock are required for Variant ${i + 1}.`);
          return;
        }
        if (hasVariantWisePricing) {
          if (!variants[i].purchasePrice || !variants[i].regularPrice || !variants[i].sellingPrice) {
            toast.error(`Pricing fields are required for Variant ${i + 1} when Variant-Wise Pricing is enabled.`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", productName.trim());
      formData.append("status", isActive ? "Active" : "Inactive");

      if (category) formData.append("main_category_id", category);
      if (subCategory) formData.append("sub_category_id", subCategory);
      formData.append("product_type", productType && productType !== "none" ? productType : "");

      if (!hasVariantWisePricing) {
        if (purchasePrice) formData.append("purchase_price", purchasePrice);
        if (regularPrice) formData.append("regular_price", regularPrice);
        if (sellingPrice) formData.append("selling_price", sellingPrice);
      }
      if (availableStock) formData.append("available_stock", availableStock);
      formData.append("is_preorder", isPreOrder ? "true" : "false");

      if (shortDescription) formData.append("short_description", shortDescription);
      if (longDescription) formData.append("long_description", longDescription);
      if (sku) formData.append("sku", sku);

      if (metaTitle) formData.append("meta_title", metaTitle);
      if (metaDescription) formData.append("meta_description", metaDescription);
      if (metaKeywords) formData.append("meta_keywords", metaKeywords);
      if (canonicalUrl) formData.append("canonical_url", canonicalUrl);

      formData.append("has_variants", hasVariants ? "1" : "0");
      formData.append("has_variant_wise_pricing", hasVariantWisePricing ? "1" : "0");

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      media.forEach((item) => {
        formData.append(`gallery_images[]`, item.file);
      });

      if (hasVariants && variants.length > 0) {
        const mappedVariants = variants.map((v) => ({
          sku: v.sku,
          color: v.color || null,
          size: v.size || null,
          available_stock: v.stock ? Number(v.stock) : undefined,
          purchase_price: hasVariantWisePricing && v.purchasePrice ? Number(v.purchasePrice) : undefined,
          regular_price: hasVariantWisePricing && v.regularPrice ? Number(v.regularPrice) : undefined,
          selling_price: hasVariantWisePricing && v.sellingPrice ? Number(v.sellingPrice) : undefined,
        }));
        formData.append("variants", JSON.stringify(mappedVariants));
      }

      const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_PRODUCT_URL || "product"}`;

      // Retrieve token from your preferred storage, e.g., localStorage or cookies
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create product");
      }

      toast.success(data.message || "Product created successfully");
      router.push("/dashboard/products");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
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
          <Button variant="outline" size="sm" onClick={resetForm}>
            <RefreshCw className="mr-2 size-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="mr-2 size-4" />
            Save draft
          </Button>
          <Button size="sm" onClick={handleSaveProduct} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
            Upload Product
          </Button>
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
                  {thumbnailUrl ? (
                    <div className="relative size-16 overflow-hidden rounded-lg border">
                      <img src={thumbnailUrl} alt="Thumbnail" className="size-full object-cover" />
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
                        {thumbnailUrl ? "Replace image" : "Upload image"}
                      </Button>
                      {thumbnailUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => {
                            setThumbnailUrl(null);
                            setThumbnailFile(null);
                          }}
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
                      if (f) {
                        setThumbnailUrl(URL.createObjectURL(f));
                        setThumbnailFile(f);
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  placeholder="Shirt, t-shirts, etc."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              {/* Category, Sub & Product Type */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Main Category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v);
                      setSubCategory("");
                    }}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.main_category_name}
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
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="new_arrival">New Arrival</SelectItem>
                      <SelectItem value="top_selling">Top Selling</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="short-desc">Short Description</Label>
                <RichTextEditor
                  value={shortDescription}
                  onChange={setShortDescription}
                  placeholder="A brief one-liner about the product."
                />
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <Label htmlFor="long-desc">Long Description</Label>
                <RichTextEditor
                  value={longDescription}
                  onChange={setLongDescription}
                  placeholder="Detailed product information, features, materials, etc."
                />
              </div>

              <Separator />

              {/* Is Active */}
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

          {/* ---- Variants & Stock ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants & Stock</CardTitle>
              <CardDescription>Configure alternate sizes or colors with their own inventory.</CardDescription>
            </CardHeader>
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
                  {/* Base SKU & Stock */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="base-sku">Base SKU</Label>
                      <Input
                        id="base-sku"
                        placeholder="eg. SKU-001"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="base-stock">Base Available Stock</Label>
                      <Input
                        id="base-stock"
                        type="number"
                        placeholder="0"
                        value={availableStock}
                        onChange={(e) => setAvailableStock(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {hasVariants && (
                <>
                  <Separator />

                  {/* Variants list or empty state */}
                  {variants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No variants added</p>
                        <p className="text-xs text-muted-foreground">
                          Add variants to offer different sizes or colors.
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
                          {/* Color, Size */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs">
                                Color <span className="text-muted-foreground">(optional)</span>
                              </Label>
                              <Select value={v.color} onValueChange={(val) => updateVariant(v.id, "color", val)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map((o: any) => (
                                    <SelectItem key={o.label} value={o.label}>
                                      <div className="flex items-center gap-2">
                                        {o.hex_value && (
                                          <div
                                            className="size-3 rounded-full border border-black/10"
                                            style={{ backgroundColor: o.hex_value }}
                                          />
                                        )}
                                        {o.label}
                                      </div>
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
                                  {sizes.map((o: any) => (
                                    <SelectItem key={o.label} value={o.label}>
                                      {o.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {/* SKU, Stock */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs">SKU</Label>
                              <Input
                                placeholder="SKU-001-RED-M"
                                value={v.sku}
                                onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Available Stock</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={v.stock}
                                onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                              />
                            </div>
                          </div>

                          {hasVariantWisePricing && (
                            <div className="grid gap-3 sm:grid-cols-3 bg-muted/30 p-3 rounded-md border border-dashed">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-primary">Purchase Price (৳)</Label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={v.purchasePrice || ""}
                                  onChange={(e) => updateVariant(v.id, "purchasePrice", e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-primary">Regular Price (৳)</Label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={v.regularPrice || ""}
                                  onChange={(e) => updateVariant(v.id, "regularPrice", e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-primary">Selling Price (৳)</Label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={v.sellingPrice || ""}
                                  onChange={(e) => updateVariant(v.id, "sellingPrice", e.target.value)}
                                />
                              </div>
                            </div>
                          )}

                          {/* End Variant Fields */}
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-fit" onClick={addVariant}>
                        <CirclePlus className="mr-2 size-4" />
                        Add Variant
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ======== RIGHT COLUMN ======== */}
        <div className="flex flex-col gap-6">
          {/* ---- Pricing ---- */}
          {!hasVariantWisePricing && (
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
                  <Input
                    id="purchase-price"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regular-price" className="text-primary font-medium">
                    Regular Price (৳)
                  </Label>
                  <Input
                    id="regular-price"
                    placeholder="0.00"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling-price" className="text-primary font-medium">
                    Selling Price (৳)
                  </Label>
                  <Input
                    id="selling-price"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ---- Pre-Order ---- */}
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
                      placeholder="Expected delivery by July 2026..."
                      className="min-h-[80px] resize-y"
                      value={preOrderNote}
                      onChange={(e) => setPreOrderNote(e.target.value)}
                    />
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
                <Label htmlFor="meta-title" className="text-primary font-medium">
                  Meta Title
                </Label>
                <Input
                  id="meta-title"
                  placeholder="Product Name | Your Store"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters recommended.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-desc" className="text-primary font-medium">
                  Meta Description
                </Label>
                <Textarea
                  id="meta-desc"
                  placeholder="A compelling summary for search engines..."
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
                <Input
                  id="meta-keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical-url" className="text-primary font-medium">
                  Youtube URL
                </Label>
                <Input
                  id="canonical-url"
                  placeholder="https://www.youtube.com/watch?v=xxxxxxxx"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Set a Youtube URL.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
