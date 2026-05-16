"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Box,
  Calendar,
  Copy,
  Globe,
  Package,
  Pencil,
  Search,
  Tag,
  Trash,
  TrendingDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

/* ---- Demo product data (mirrors Add Product form fields) ---- */

const product = {
  id: "PRD-1001",
  name: "Radiance Ritual Set",
  status: "Active",

  // Product Info
  thumbnail: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=T",
  mainCategory: "Beauty & Health",
  subCategory: "Skincare",
  shortDescription: "A curated trio of serums and moisturizers for a radiant glow.",
  longDescription:
    "The Radiance Ritual Set brings together our best-selling Vitamin C Serum, Hyaluronic Acid Moisturizer, and Gentle Foam Cleanser in one premium gift box. Perfect for daily routines or as a luxe present.",
  isActive: true,

  // Media
  images: [
    "https://placehold.co/400x480/1a1a2e/e0e0e0?text=Main",
    "https://placehold.co/100x100/1a1a2e/e0e0e0?text=Angle+1",
    "https://placehold.co/100x100/1a1a2e/e0e0e0?text=Angle+2",
    "https://placehold.co/100x100/1a1a2e/e0e0e0?text=Angle+3",
    "https://placehold.co/100x100/1a1a2e/e0e0e0?text=Angle+4",
  ],

  // Variants & Stock
  sku: "SKU-SKIN-4006",
  availableStock: 120,
  variants: [
    { id: "v1", name: "Ocean / 3-piece set", color: "Ocean", size: "", weight: "500g", sku: "SKU-SKIN-4006-OCN", stock: 48, purchasePrice: 150, retailPrice: 389, sellingPrice: 249, primary: true, image: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=O" },
    { id: "v2", name: "Sand / 3-piece set", color: "Sand", size: "", weight: "500g", sku: "SKU-SKIN-4006-SND", stock: 22, purchasePrice: 150, retailPrice: 389, sellingPrice: 249, primary: false, image: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=S" },
    { id: "v3", name: "Stone / Travel trio", color: "Gray", size: "S", weight: "250g", sku: "SKU-SKIN-4006-STN", stock: 18, purchasePrice: 80, retailPrice: 179, sellingPrice: 116, primary: false, image: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=St", lowStock: true },
    { id: "v4", name: "Rose / Travel trio", color: "Pink", size: "S", weight: "250g", sku: "SKU-SKIN-4006-RSE", stock: 10, purchasePrice: 80, retailPrice: 179, sellingPrice: 116, primary: false, image: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=R", lowStock: true },
    { id: "v5", name: "Slate / Duo set", color: "Gray", size: "M", weight: "350g", sku: "SKU-SKIN-4006-SLT", stock: 14, purchasePrice: 110, retailPrice: 259, sellingPrice: 168, primary: false, image: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=Sl", lowStock: true },
    { id: "v6", name: "Cloud / Gift set", color: "White", size: "L", weight: "750g", sku: "SKU-SKIN-4006-CLD", stock: 8, purchasePrice: 200, retailPrice: 429, sellingPrice: 278, primary: false, image: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=C", lowStock: true },
  ],

  // Pricing
  purchasePrice: 95,
  regularPrice: 179,
  sellingPrice: 149,

  // Pre-Order
  isPreOrder: false,
  availableDate: "",
  preOrderNote: "",

  // SEO Settings
  metaTitle: "Radiance Ritual Set | Acme Store",
  metaDescription: "Premium skincare set with Vitamin C serum, moisturizer, and cleanser.",
  metaKeywords: "skincare, gift set, best seller",
  canonicalUrl: "https://yourstore.com/products/radiance-ritual-set",

  // Meta
  createdAt: "2025-11-12",
  updatedAt: "2026-05-10",
};

export function ProductDetails({ productId }: { productId: string }) {
  const [isActive, setIsActive] = React.useState(product.isActive);
  const [selectedImage, setSelectedImage] = React.useState(product.images[0]);

  const primaryVariant = product.variants.find((v) => v.primary);
  const lowStockCount = product.variants.filter((v) => (v as any).lowStock).length;
  const avgStock = Math.round(product.variants.reduce((sum, v) => sum + v.stock, 0) / product.variants.length);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/dashboard/products"><ArrowLeft className="size-4" /></Link>
            </Button>
            <h1 className="text-3xl tracking-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Active" : "Inactive"}</Badge>
            <span>•</span>
            <span>{product.variants.length} variants</span>
            <span>•</span>
            <span>{product.mainCategory}</span>
            <span>•</span>
            <span>{product.subCategory}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={(v) => { setIsActive(v); toast.success(v ? "Product activated." : "Product deactivated."); }} />
            <span className="text-sm font-medium">{isActive ? "Active" : "Inactive"}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products/${productId}/edit`}><Pencil className="mr-2 size-4" />Edit</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Product cloned.")}><Copy className="mr-2 size-4" />Clone</Button>
          <Button variant="destructive" size="sm" onClick={() => toast.success("Product deleted.")}><Trash className="mr-2 size-4" />Delete</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* ====== OVERVIEW TAB ====== */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left — Media & Info */}
            <div className="flex flex-col gap-6">
              {/* Media Card */}
              <Card className="overflow-hidden p-0">
                <div className="relative aspect-[3/4] bg-muted">
                  <img src={selectedImage} alt={product.name} className="size-full object-cover" />
                  <Badge className="absolute top-3 left-3" variant="default">PRIMARY</Badge>
                </div>
                <div className="flex gap-2 p-3">
                  {product.images.slice(1).map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(img)} className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === img ? "border-primary" : "border-transparent"}`}>
                      <img src={img} alt={`Angle ${i + 1}`} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Product Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">Product Info</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Main Category</p>
                      <p className="font-medium">{product.mainCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sub Category</p>
                      <p className="font-medium">{product.subCategory}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Short Description</p>
                    <p>{product.shortDescription}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Long Description</p>
                    <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
                  </div>
                </CardContent>
              </Card>


              {/* Pre-Order Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">Pre-Order</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {product.isPreOrder ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Pre-Order Enabled</Badge>
                      </div>
                      {product.availableDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-4" />
                          <span>Available: {product.availableDate}</span>
                        </div>
                      )}
                      {product.preOrderNote && <p className="text-muted-foreground">{product.preOrderNote}</p>}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Pre-order is not enabled for this product.</p>
                  )}
                </CardContent>
              </Card>

              {/* SEO Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Search className="size-3" />Meta Title</p>
                    <p className="font-medium">{product.metaTitle || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta Description</p>
                    <p className="text-muted-foreground">{product.metaDescription || <span className="italic">Not set</span>}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Tag className="size-3" />Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.metaKeywords.split(",").map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                  {product.canonicalUrl && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Globe className="size-3" />Canonical URL</p>
                        <p className="text-xs text-primary break-all">{product.canonicalUrl}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right — Stats & Variants */}
            <div className="flex flex-col gap-6">
              {/* Stock stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader><CardDescription className="text-xs uppercase tracking-wider">Total Stock</CardDescription></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-medium tabular-nums">{product.availableStock}</div>
                    <p className="text-xs text-muted-foreground">Across {product.variants.length} active variants</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardDescription className="text-xs uppercase tracking-wider">Low Stock</CardDescription></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-medium tabular-nums">{lowStockCount}</div>
                    <p className="text-xs text-muted-foreground">Variants below the 20-unit threshold</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardDescription className="text-xs uppercase tracking-wider">Average Stock</CardDescription></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-medium tabular-nums">{avgStock}</div>
                    <p className="text-xs text-muted-foreground">Average units held per variant</p>
                  </CardContent>
                </Card>
              </div>





              {/* Variant lineup */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Variant lineup</CardTitle>
                  <CardDescription>Click any row to update the media focus and selected context.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedImage(v.image)}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          <img src={v.image} alt={v.name} className="size-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{v.name}</span>
                            {v.primary && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Primary</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{v.sku}</span>
                            <span>•</span>
                            {(v as any).lowStock ? (
                              <span className="text-destructive flex items-center gap-0.5">
                                <TrendingDown className="size-3" />Stock: {v.stock} <span className="text-[10px]">low</span>
                              </span>
                            ) : (
                              <span>Stock: {v.stock}</span>
                            )}
                            {v.color && <><span>•</span><span>{v.color}</span></>}
                            {v.size && <><span>•</span><span>{v.size}</span></>}
                            {v.weight && <><span>•</span><span>{v.weight}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Purchase</p>
                          <p className="text-sm font-medium tabular-nums">৳{v.purchasePrice}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Regular</p>
                          <p className="text-sm font-medium tabular-nums line-through text-muted-foreground">৳{v.retailPrice}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Selling</p>
                          <p className="text-sm font-medium tabular-nums text-primary">৳{v.sellingPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ====== VARIANTS TAB ====== */}
        <TabsContent value="variants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Variants</CardTitle>
              <CardDescription>Manage pricing, stock, and attributes for each variant.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {product.variants.map((v, idx) => (
                  <div key={v.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          <img src={v.image} alt={v.name} className="size-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{v.name}</span>
                            {v.primary && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Primary</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{v.sku}</span>
                        </div>
                      </div>
                      <Badge variant={(v as any).lowStock ? "destructive" : "default"}>
                        Stock: {v.stock}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm sm:grid-cols-6">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Color</p>
                        <p className="font-medium">{v.color || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Size</p>
                        <p className="font-medium">{v.size || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weight</p>
                        <p className="font-medium">{v.weight || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Purchase</p>
                        <p className="font-medium tabular-nums">৳{v.purchasePrice}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Regular</p>
                        <p className="font-medium tabular-nums">৳{v.retailPrice}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Selling</p>
                        <p className="font-medium tabular-nums text-primary">৳{v.sellingPrice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== INVENTORY TAB ====== */}
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory History</CardTitle>
              <CardDescription>Track stock movements and adjustments over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted"><Box className="size-6 text-muted-foreground" /></div>
                <p className="text-sm font-medium">Inventory tracking coming soon</p>
                <p className="text-xs text-muted-foreground">Stock movement history will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== ACTIVITY TAB ====== */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription>Recent changes and actions for this product.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Product updated", detail: "Price changed from ৳159 to ৳149", time: "2 hours ago" },
                  { action: "Stock adjusted", detail: "Ocean variant restocked +50 units", time: "1 day ago" },
                  { action: "Variant added", detail: "Cloud / Gift set variant created", time: "3 days ago" },
                  { action: "Product created", detail: "Initial product listing published", time: "Nov 12, 2025" },
                ].map((log, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
