"use client";

import * as React from "react";

import { Plus, Search, Package, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const DISCOUNT_API_URL = process.env.NEXT_PUBLIC_API_DISCOUNT_URL || "discounts";

// Helper function for discount-specific URLs
const getDiscountUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }

  const discountPath = DISCOUNT_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${discountPath}/${cleanPath}` : discountPath;

  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface AddDiscountDialogProps {
  onDiscountAdded?: () => void; // Callback to refresh the list after adding
}

export function AddDiscountDialog({ onDiscountAdded }: AddDiscountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [minimumSubtotalAmount, setMinimumSubtotalAmount] = React.useState("");
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">("fixed");
  const [discountAmount, setDiscountAmount] = React.useState("");
  const [freeShipping, setFreeShipping] = React.useState(false);
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
  const [giftProductId, setGiftProductId] = React.useState<string>("none");
  const [giftProductObj, setGiftProductObj] = React.useState<any>(null);
  const [variantId, setVariantId] = React.useState<string>("none");
  const [products, setProducts] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = React.useMemo(() => {
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id?.toString().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
    return `${base}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}products`);
        const data = await res.json();
        let productsData = [];
        if (data?.data?.data) {
          productsData = data.data.data;
        } else if (data?.data && Array.isArray(data.data)) {
          productsData = data.data;
        } else if (Array.isArray(data)) {
          productsData = data;
        }
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    
    if (open) {
      fetchProducts();
    }
  }, [open]);

  // Form validation
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!minimumSubtotalAmount || parseFloat(minimumSubtotalAmount) <= 0) {
      newErrors.minimumSubtotalAmount = "Minimum purchase amount is required and must be greater than 0";
    }

    if (!discountAmount || parseFloat(discountAmount) <= 0) {
      newErrors.discountAmount = "Discount amount is required and must be greater than 0";
    }

    if (discountType === "percentage" && parseFloat(discountAmount) > 100) {
      newErrors.discountAmount = "Percentage discount cannot exceed 100%";
    }

    if (giftProductObj && giftProductObj.has_variants && variantId === "none") {
      newErrors.variantId = "Please select a variant for the gift product";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setMinimumSubtotalAmount("");
    setDiscountType("fixed");
    setDiscountAmount("");
    setFreeShipping(false);
    setStatus("active");
    setGiftProductId("none");
    setGiftProductObj(null);
    setVariantId("none");
    setSearchQuery("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data to match database schema
      const discountData = {
        minimum_subtotal_amount: parseFloat(minimumSubtotalAmount),
        type: discountType,
        discount_amount: parseFloat(discountAmount),
        has_free_shipping: freeShipping ? 1 : 0,
        status: status,
        ...(giftProductId !== "none" && { gift_product_id: parseInt(giftProductId) }),
        ...(giftProductId === "none" && { gift_product_id: null }),
        ...(variantId !== "none" && { variant_id: parseInt(variantId) }),
        ...(variantId === "none" && { variant_id: null }),
      };

      console.log("Submitting discount data:", discountData);

      const url = getDiscountUrl();
      console.log("API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discountData),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        // Handle validation errors from Laravel
        if (response.status === 422 && responseData.errors) {
          const apiErrors: Record<string, string> = {};
          Object.keys(responseData.errors).forEach((key) => {
            apiErrors[key] = responseData.errors[key][0];
          });
          setErrors(apiErrors);
          toast.error("Please check the form for errors");
        } else {
          throw new Error(responseData.message || "Failed to add discount");
        }
        return;
      }

      toast.success("Discount rule added successfully");
      resetForm();
      setOpen(false);

      // Refresh the discounts list
      if (onDiscountAdded) {
        onDiscountAdded();
      }
    } catch (error) {
      console.error("Error adding discount:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add discount");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add New Discount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Discount</DialogTitle>
          <DialogDescription>Create an automated discount rule based on purchase totals.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            {/* Left Column: Other Fields */}
            <div className="flex flex-col gap-4">
              {/* Minimum Purchase Amount */}
              <div className="grid gap-2">
                <Label htmlFor="purchaseAmount">
                  Minimum Purchase Amount (৳) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purchaseAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter minimum purchase amount"
                  value={minimumSubtotalAmount}
                  onChange={(e) => setMinimumSubtotalAmount(e.target.value)}
                  required
                  className={errors.minimumSubtotalAmount ? "border-destructive" : ""}
                />
                {errors.minimumSubtotalAmount && (
                  <p className="text-sm text-destructive">{errors.minimumSubtotalAmount}</p>
                )}
              </div>

              {/* Discount Type and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: "fixed" | "percentage") => setDiscountType(value)}>
                    <SelectTrigger id="discountType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="discountAmount">
                    Discount Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    step={discountType === "percentage" ? "1" : "0.01"}
                    placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    required
                    className={errors.discountAmount ? "border-destructive" : ""}
                  />
                  {errors.discountAmount && <p className="text-sm text-destructive">{errors.discountAmount}</p>}
                </div>
              </div>

              {/* Free Shipping Switch */}
              <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs mt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="freeShipping" className="text-base">
                    Free Shipping
                  </Label>
                  <p className="text-sm text-muted-foreground">Include free shipping with this discount</p>
                </div>
                <Switch id="freeShipping" checked={freeShipping} onCheckedChange={setFreeShipping} />
              </div>

              {/* Status Selection */}
              <div className="grid gap-2 mt-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column: Gift Product Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="giftProduct">Gift Product (Optional)</Label>
              {giftProductObj ? (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={getImageUrl(giftProductObj.product_thumbnail_img)}
                        alt={giftProductObj.title}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{giftProductObj.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {giftProductObj.sku || "N/A"} · ৳{(giftProductObj.selling_price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setGiftProductObj(null);
                      setGiftProductId("none");
                      setVariantId("none");
                      setSearchQuery("");
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div ref={searchRef} className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by product name, SKU, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                  />
                  {searchFocused && filteredProducts.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                          onClick={() => {
                            setGiftProductObj(p);
                            setGiftProductId(p.id.toString());
                            setVariantId("none");
                            setSearchFocused(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <img
                              src={getImageUrl(p.product_thumbnail_img)}
                              alt={p.title}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">{p.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.sku || "N/A"} · Stock: {p.available_stock}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-semibold tabular-nums">
                              {p.has_variant_wise_pricing
                                ? "Variant Pricing"
                                : `৳${(p.selling_price || 0).toLocaleString()}`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchFocused && searchQuery.trim() && filteredProducts.length === 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-6 shadow-lg">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Package className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No products found</p>
                        <p className="text-xs text-muted-foreground">Try a different search term.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Variant Selection if applicable */}
              {giftProductObj && giftProductObj.has_variants ? (
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="variantId">
                    Select Variant <span className="text-destructive">*</span>
                  </Label>
                  <Select value={variantId} onValueChange={setVariantId}>
                    <SelectTrigger id="variantId" className={errors.variantId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Choose a variant</SelectItem>
                      {giftProductObj.variants?.map((v: any) => {
                        const sizeLabel = v.size?.label || "";
                        const colorLabel = v.color?.label || "";
                        const variantLabel = [sizeLabel, colorLabel].filter(Boolean).join(" - ") || v.sku;
                        return (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {variantLabel} {v.available_stock !== undefined ? `(Stock: ${v.available_stock})` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.variantId && <p className="text-sm text-destructive">{errors.variantId}</p>}
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Discount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
