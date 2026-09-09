"use client";
import { ModularFeature } from "@/components/modular-feature";

import * as React from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";
import {
  CirclePlus,
  ExternalLink,
  ImagePlus,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Upload,
  Wand2,
  X,
  Banknote,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useAttributes from "@/hooks/useAttributes";
import useCategories from "@/hooks/useCategories";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { fetchClient } from "@/lib/fetch-client";

import { ProductVariantsSection, type Variant } from "./product-variants-section";

const isDescriptionEmpty = (html: string) => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MediaItem {
  id: string;
  url: string;
  name: string;
  file: File;
  color?: string;
  size?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const generateSKU = () => "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddProductForm({ isAiMode = false }: { isAiMode?: boolean }) {
  const router = useRouter();
  const { features } = useModularFeatures();
  const { categories, loading: categoriesLoading } = useCategories();
  const { colors, sizes } = useAttributes();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingText, setIsGeneratingText] = React.useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);

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
  const [hasFreeShipping, setHasFreeShipping] = React.useState(false);
  const [sku, setSku] = React.useState(generateSKU());
  const [availableStock, setAvailableStock] = React.useState("");
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // Lot Details
  const [sourceType, setSourceType] = React.useState("vendor");
  const [suppliers, setSuppliers] = React.useState<{ id: number; name: string }[]>([]);
  const [supplierId, setSupplierId] = React.useState("0");
  const [purchaseDate, setPurchaseDate] = React.useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [invoiceNo, setInvoiceNo] = React.useState("");
  const [memoImage, setMemoImage] = React.useState<File | null>(null);
  const [memoImagePreview, setMemoImagePreview] = React.useState<string | null>(null);
  const [paidAmount, setPaidAmount] = React.useState("");
  const [lotComment, setLotComment] = React.useState("");

  const memoImageRef = React.useRef<HTMLInputElement>(null);

  // Pricing
  const [purchasePrice, setPurchasePrice] = React.useState("");
  const [regularPrice, setRegularPrice] = React.useState("");
  const [sellingPrice, setSellingPrice] = React.useState("");

  // Computed financial amounts
  const totalLotAmount = React.useMemo(() => {
    if (hasVariants && variants.length > 0) {
      return variants.reduce((sum, v) => {
        const vQty = Number(v.stock) || 0;
        const vPrice = hasVariantWisePricing && v.purchasePrice ? Number(v.purchasePrice) : Number(purchasePrice) || 0;
        return sum + vQty * vPrice;
      }, 0);
    }
    const qty = Number(availableStock) || 0;
    const price = Number(purchasePrice) || 0;
    return qty * price;
  }, [hasVariants, variants, hasVariantWisePricing, availableStock, purchasePrice]);

  const dueLotAmount = React.useMemo(() => {
    const paid = Number(paidAmount) || 0;
    return Math.max(0, totalLotAmount - paid);
  }, [totalLotAmount, paidAmount]);

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers?all=true`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSuppliers(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load suppliers in add product form", err);
      }
    };
    fetchSuppliers();
  }, []);

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

  const availableColors = React.useMemo(() => {
    if (!hasVariants) return [];
    const usedColorLabels = new Set(variants.map((v) => v.color).filter(Boolean));
    return colors.filter((c) => usedColorLabels.has(c.label));
  }, [hasVariants, variants, colors]);

  const availableSizes = React.useMemo(() => {
    if (!hasVariants) return [];
    const usedSizeLabels = new Set(variants.map((v) => v.size).filter(Boolean));
    return sizes.filter((s) => usedSizeLabels.has(s.label));
  }, [hasVariants, variants, sizes]);

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
      color: "",
    }));
    setMedia((p) => [...p, ...items]);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleMediaFiles(e.dataTransfer.files);
  }

  /* ---- AI actions ---- */
  async function handleGenerateDescriptions() {
    if (!productName || !category) {
      toast.error("Please enter a product name and select a main category first.");
      return;
    }
    setIsGeneratingText(true);
    try {
      const catName = categories.find((c) => String(c.id) === category)?.main_category_name || "";
      const subCatName = filteredSubCategories.find((c) => String(c.id) === subCategory)?.name || "";

      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, categoryName: catName, subCategoryName: subCatName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate description");
      }
      setShortDescription(data.data.shortDescription);
      setLongDescription(data.data.longDescription);
      toast.success("Descriptions generated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGeneratingText(false);
    }
  }

  async function handleGenerateImage() {
    if (!productName.trim()) {
      toast.error("Please enter a product name first.");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const categoryName = categories.find((c) => String(c.id) === category)?.main_category_name || "";
      const subCategoryName = filteredSubCategories.find((c) => String(c.id) === subCategory)?.name || "";
      const res = await fetch("/api/ai/generate-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, categoryName, subCategoryName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate product image");

      const imageResponse = await fetch(`data:${data.data.mimeType};base64,${data.data.imageBase64}`);
      const imageBlob = await imageResponse.blob();
      const safeName =
        productName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "product";
      const generatedFile = new File([imageBlob], `${safeName}-ai.png`, { type: data.data.mimeType });
      if (thumbnailUrl?.startsWith("blob:")) URL.revokeObjectURL(thumbnailUrl);
      setThumbnailFile(generatedFile);
      setThumbnailUrl(URL.createObjectURL(generatedFile));
      toast.success("Product image generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate product image");
    } finally {
      setIsGeneratingImage(false);
    }
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
    setHasFreeShipping(false);
    setVariants([]);
    setAvailableStock("");
    setSourceType("vendor");
    setSupplierId("0");
    setInvoiceNo("");
    setMemoImage(null);
    setMemoImagePreview(null);
    setPaidAmount("");
    setLotComment("");
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
    if (!hasVariantWisePricing && (!purchasePrice || !sellingPrice)) {
      toast.error("Pricing (Purchase, Selling) is required.");
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
          if (!variants[i].purchasePrice || !variants[i].sellingPrice) {
            toast.error(
              `Purchase and Selling pricing fields are required for Variant ${i + 1} when Variant-Wise Pricing is enabled.`,
            );
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
      if (sourceType) formData.append("source_type", sourceType);
      if (features?.supplier_management && supplierId) formData.append("supplier_id", supplierId);
      if (purchaseDate) {
        formData.append("purchase_date", purchaseDate);
        formData.append("date", purchaseDate);
        formData.append("created_at", `${purchaseDate} 00:00:00`);
      }
      if (lotComment) formData.append("comment", lotComment);
      if (invoiceNo.trim()) formData.append("invoice_no", invoiceNo.trim());
      if (memoImage) formData.append("memo_image", memoImage);

      const paidVal = Number(paidAmount) || 0;
      const dueVal = Math.max(0, totalLotAmount - paidVal);
      const paymentStatus = dueVal === 0 && totalLotAmount > 0 ? "paid" : paidVal > 0 ? "partial" : "due";

      formData.append("total_amount", totalLotAmount.toString());
      formData.append("paid_amount", paidVal.toString());
      formData.append("due_amount", dueVal.toString());
      formData.append("payment_status", paymentStatus);

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
      formData.append("has_free_shipping", hasFreeShipping ? "1" : "0");

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      media.forEach((item) => {
        formData.append(`gallery_images[]`, item.file);
        formData.append(`gallery_colors[]`, item.color || "null");
        formData.append(`gallery_sizes[]`, item.size || "null");
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
          <h1 className="text-3xl tracking-tight">{isAiMode ? "AI Product Generator" : "Add Product"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAiMode
              ? "Use AI to generate a product image and polished descriptions."
              : "Build a polished product record with pricing, media, availability, and variant data."}
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-primary font-medium">Thumbnail</Label>
                  <ModularFeature name="other_ai_features">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !productName.trim()}
                    >
                      {isGeneratingImage ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 size-4" />
                      )}
                      {isGeneratingImage ? "Generating..." : "Generate image"}
                    </Button>
                  </ModularFeature>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Much Larger Preview Box */}
                  {thumbnailUrl ? (
                    <div className="relative size-48 overflow-hidden rounded-lg border shadow-sm">
                      <img src={thumbnailUrl} alt="Thumbnail" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div
                      onClick={() => thumbnailRef.current?.click()}
                      className="flex size-48 cursor-pointer items-center justify-center rounded-lg border border-dashed bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Upload className="size-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-base font-medium">Product thumbnail</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      JPG or PNG. Keep it square and at least 1000 by 1000 pixels.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
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
                          className="h-auto p-0 text-xs text-destructive"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="short-desc">Short Description</Label>
                  <ModularFeature name="other_ai_features">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescriptions}
                      disabled={isGeneratingText}
                    >
                      {isGeneratingText ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 size-4" />
                      )}
                      Generate Descriptions
                    </Button>
                  </ModularFeature>
                </div>
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

              {/* Free Shipping */}
              <div className="flex items-start gap-3 mt-2">
                <Switch
                  id="has-free-shipping"
                  checked={hasFreeShipping}
                  onCheckedChange={setHasFreeShipping}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="has-free-shipping" className="text-sm font-medium cursor-pointer">
                    Free Shipping
                  </Label>
                  <p className="text-xs text-muted-foreground">Enable this to offer free shipping for this product.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---- Variants & Stock ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants & Stock</CardTitle>
              <CardDescription>Configure alternate sizes or colors with their own inventory.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {features?.variant_management !== false && String(features?.variant_management) !== "0" && (
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

                  {features?.variant_wise_pricing !== false && String(features?.variant_wise_pricing) !== "0" && (
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
                  )}
                </div>
              )}

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
                  <Separator className="mb-4" />
                  <ProductVariantsSection
                    hasVariantWisePricing={hasVariantWisePricing}
                    variants={variants}
                    setVariants={setVariants}
                    baseSku={sku}
                  />
                </>
              )}
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
                      <div key={item.id} className="group relative flex flex-col gap-2 rounded-lg border bg-muted p-2">
                        <div className="relative aspect-square overflow-hidden rounded-md">
                          <img src={item.url} alt={item.name} className="size-full object-cover" />
                          <button
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                        {features?.variant_management !== false &&
                          String(features?.variant_management) !== "0" &&
                          features?.variant_wise_image !== false &&
                          String(features?.variant_wise_image) !== "0" && (
                            <div className="grid grid-cols-2 gap-1">
                              <Select
                                value={item.color || "none"}
                                onValueChange={(val) => {
                                  setMedia((prev) =>
                                    prev.map((m) =>
                                      m.id === item.id ? { ...m, color: val === "none" ? "" : val } : m,
                                    ),
                                  );
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs px-2">
                                  <SelectValue placeholder="Color" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Color</SelectItem>
                                  {availableColors.map((c) => (
                                    <SelectItem key={c.id} value={c.label}>
                                      {c.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={item.size || "none"}
                                onValueChange={(val) => {
                                  setMedia((prev) =>
                                    prev.map((m) => (m.id === item.id ? { ...m, size: val === "none" ? "" : val } : m)),
                                  );
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs px-2">
                                  <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Size</SelectItem>
                                  {availableSizes.map((s) => (
                                    <SelectItem key={s.id} value={s.label}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
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
                    Regular Price (৳) (Optional)
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

          {/* ---- Lot Details ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-primary">Lot Details & Procurement</CardTitle>
              <CardDescription>
                Specify the initial lot details, vendor invoice, and payment for the inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-type" className="text-primary font-medium">
                  Source Type
                </Label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor / Purchase</SelectItem>
                    <SelectItem value="return">Customer Return</SelectItem>
                    <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                    <SelectItem value="production">In-house Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ModularFeature name="supplier_management">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="supplier-select" className="text-primary font-medium">
                      Supplier / Vendor
                    </Label>
                    <Link
                      href="/dashboard/suppliers"
                      target="_blank"
                      className="text-xs text-primary hover:underline flex items-center gap-0.5 font-normal"
                    >
                      <span>Manage</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger id="supplier-select" className="w-full">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Supplier / General</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </ModularFeature>

              {/* Purchase Date & Invoice No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lot-purchase-date" className="text-xs font-medium">
                    Purchase Date <span className="text-muted-foreground font-normal">(Custom Date)</span>
                  </Label>
                  <Input
                    id="lot-purchase-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lot-invoice-no" className="text-xs font-medium">
                    Invoice No <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="lot-invoice-no"
                    placeholder="e.g. INV-8821"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                  />
                </div>
              </div>

              {/* Memo Image */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Memo Image <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="flex items-center gap-2">
                  {memoImagePreview ? (
                    <div className="relative size-9 rounded border overflow-hidden bg-muted shrink-0">
                      <img src={memoImagePreview} alt="Memo preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setMemoImage(null);
                          setMemoImagePreview(null);
                        }}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="size-9 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30 shrink-0">
                      <ImageIcon className="size-4" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-1 text-xs"
                    onClick={() => memoImageRef.current?.click()}
                  >
                    <Upload className="size-3.5" />
                    {memoImage ? "Change" : "Upload Memo"}
                  </Button>
                  <input
                    ref={memoImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMemoImage(file);
                        setMemoImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Supplier Payment Summary Box */}
              <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="size-3.5 text-primary" /> Supplier Payment
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[10px] px-1.5 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setPaidAmount(totalLotAmount > 0 ? totalLotAmount.toFixed(2) : "0")}
                    >
                      Full Paid
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[10px] px-1.5 text-muted-foreground hover:bg-muted"
                      onClick={() => setPaidAmount("0")}
                    >
                      Due
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Total Amount</span>
                    <div className="h-8 px-2 flex items-center bg-background/90 rounded border font-semibold tabular-nums text-foreground">
                      ৳
                      {totalLotAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="lot-paid-amount" className="text-xs font-medium block">
                      Paid Amount
                    </Label>
                    <Input
                      id="lot-paid-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="h-8 bg-background text-xs font-medium px-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Due Amount</span>
                    <div
                      className={`h-8 px-2 flex items-center justify-between bg-background/90 rounded border font-bold tabular-nums ${dueLotAmount > 0 ? "text-red-500 border-red-200 dark:border-red-950" : "text-emerald-500 border-emerald-200 dark:border-emerald-950"}`}
                    >
                      <span>
                        ৳
                        {dueLotAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <Badge
                        variant={
                          dueLotAmount === 0
                            ? "default"
                            : dueLotAmount < totalLotAmount && Number(paidAmount) > 0
                              ? "outline"
                              : "destructive"
                        }
                        className="text-[9px] px-1 py-0 h-3.5 uppercase"
                      >
                        {dueLotAmount === 0
                          ? "Paid"
                          : dueLotAmount < totalLotAmount && Number(paidAmount) > 0
                            ? "Partial"
                            : "Due"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot-comment" className="text-primary font-medium">
                  Comment / Notes
                </Label>
                <Textarea
                  id="lot-comment"
                  placeholder="Optional notes about this lot entry..."
                  className="min-h-[70px] resize-y text-xs"
                  value={lotComment}
                  onChange={(e) => setLotComment(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ---- Pre-Order ---- */}
          {features?.product_pre_order !== false && String(features?.product_pre_order) !== "0" && (
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
          )}

          {/* ---- SEO Settings ---- */}
          {features?.product_seo_settings !== false && String(features?.product_seo_settings) !== "0" && (
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
          )}
        </div>
      </div>
    </>
  );
}
