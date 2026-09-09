"use client";
import { ModularFeature } from "@/components/modular-feature";
import { useModularFeatures } from "@/hooks/useModularFeatures";

import * as React from "react";
import { Plus, Repeat, Search, Package, X } from "lucide-react";
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

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const COUPON_API_URL = process.env.NEXT_PUBLIC_API_COUPON_URL || "coupons";

// Helper function for coupon-specific URLs
const getCouponUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }

  const couponPath = COUPON_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${couponPath}/${cleanPath}` : couponPath;

  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface AddCouponDialogProps {
  onCouponAdded?: () => void;
}

export function AddCouponDialog({ onCouponAdded }: AddCouponDialogProps) {
  const { features } = useModularFeatures();

  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [code, setCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [usageLimit, setUsageLimit] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
  const [productId, setProductId] = React.useState<string>("none");
  const [productObj, setProductObj] = React.useState<any>(null);
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
        p.id?.toString().includes(searchQuery.toLowerCase()),
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

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "Coupon code is required";
    }

    if (!discountValue || parseFloat(discountValue) <= 0) {
      newErrors.discountValue = "Discount value is required and must be greater than 0";
    }

    if (discountType === "percentage" && parseFloat(discountValue) > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setExpiryDate("");
    setUsageLimit("");
    setStatus("active");
    setProductId("none");
    setProductObj(null);
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
      const couponData = {
        code: code.toUpperCase(),
        type: discountType,
        value: parseFloat(discountValue),
        expiry_date: expiryDate || null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        status: status,
        product_id: features?.product_wise_coupon && productId !== "none" ? parseInt(productId) : null,
      };

      console.log("Submitting coupon data:", couponData);

      const url = getCouponUrl();
      console.log("API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        if (response.status === 422 && responseData.errors) {
          const apiErrors: Record<string, string> = {};
          Object.keys(responseData.errors).forEach((key) => {
            apiErrors[key] = responseData.errors[key][0];
          });
          setErrors(apiErrors);
          toast.error("Please check the form for errors");
        } else {
          throw new Error(responseData.message || "Failed to add coupon");
        }
        return;
      }

      toast.success(`Coupon ${code.toUpperCase()} added successfully`);
      resetForm();
      setOpen(false);

      if (onCouponAdded) {
        onCouponAdded();
      }
    } catch (error) {
      console.error("Error adding coupon:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add coupon");
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
          Add Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Coupon</DialogTitle>
          <DialogDescription>Create a new discount code for your customers.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="flex flex-col gap-4">
              {/* Coupon Code */}
              <div className="grid gap-2">
                <Label htmlFor="code">
                  Coupon Code <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="code"
                    placeholder="e.g. SUMMER24"
                    className="font-mono uppercase"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateCode}
                    className="shrink-0"
                    title="Generate random code"
                  >
                    <Repeat className="mr-2 size-4" />
                    Generate
                  </Button>
                </div>
                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
              </div>

              {/* Discount Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discountType">Type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}
                  >
                    <SelectTrigger id="discountType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="discountValue">
                    Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step={discountType === "percentage" ? "1" : "0.01"}
                    placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    className={errors.discountValue ? "border-destructive" : ""}
                  />
                  {errors.discountValue && <p className="text-sm text-destructive">{errors.discountValue}</p>}
                </div>
              </div>

              {/* Expiry Date and Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid gap-2">
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

            {/* Product wise coupon optional (Right Column) */}
            <ModularFeature name="product_wise_coupon">
              <div className="flex flex-col gap-4 border-l pl-6">
                <Label>Specific Product {features?.regular_coupons ? "(Optional)" : "(Required)"}</Label>
                {!productObj ? (
                  <div className="relative" ref={searchRef}>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search product by name, SKU or ID..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                      />
                    </div>
                    {searchFocused && (
                      <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-60 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">No products found.</div>
                        ) : (
                          filteredProducts.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer transition-colors"
                              onClick={() => {
                                setProductId(p.id.toString());
                                setProductObj(p);
                                setSearchFocused(false);
                                setSearchQuery("");
                              }}
                            >
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                                <img
                                  src={getImageUrl(p.product_thumbnail_img)}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                    ID: {p.id}
                                  </Badge>
                                  {p.sku && <span className="text-xs text-muted-foreground truncate">{p.sku}</span>}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-accent/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-background">
                        <img
                          src={getImageUrl(productObj.product_thumbnail_img)}
                          alt={productObj.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{productObj.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-background">
                            ID: {productObj.id}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            ${productObj.selling_price || productObj.regular_price || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setProductObj(null);
                        setProductId("none");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </ModularFeature>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
