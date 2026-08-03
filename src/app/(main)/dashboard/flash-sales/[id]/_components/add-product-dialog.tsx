"use client";

import * as React from "react";
import { Plus, Search, X } from "lucide-react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

interface AddProductDialogProps {
  flashSaleId: string;
  onProductAdded?: () => void;
}

export function AddProductDialog({ flashSaleId, onProductAdded }: AddProductDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [productId, setProductId] = React.useState<string>("");
  const [discountType, setDiscountType] = React.useState<"fixed">("fixed");
  const [discountAmount, setDiscountAmount] = React.useState("");
  const [quantity, setQuantity] = React.useState("");

  // Product search state
  const [products, setProducts] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [productObj, setProductObj] = React.useState<any>(null);
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

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
    return `${base}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  React.useEffect(() => {
    const searchProducts = async () => {
      try {
        setIsSearching(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        // Use your app's actual products API endpoint.
        const response = await fetch(`${API_BASE_URL}products?search=${searchQuery}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Extract array from paginated Laravel response
          const productsArray = Array.isArray(result.data?.data) 
            ? result.data.data 
            : Array.isArray(result.data) 
              ? result.data 
              : Array.isArray(result) 
                ? result 
                : [];
          setProducts(productsArray);
        }
      } catch (error) {
        console.error("Failed to search products", error);
      } finally {
        setIsSearching(false);
      }
    };

    if (open) {
      const delayDebounceFn = setTimeout(() => {
        searchProducts();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || !discountType || !discountAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const payload = {
        product_id: parseInt(productId),
        discount_type: discountType,
        discount_amount: parseFloat(discountAmount),
        quantity: quantity ? parseInt(quantity) : null,
      };

      const response = await fetch(`${API_BASE_URL}flash-sales/${flashSaleId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add product (${response.status})`);
      }

      toast.success("Product added to flash sale successfully");
      
      // Reset form
      setProductId("");
      setDiscountType("fixed");
      setDiscountAmount("");
      setQuantity("");
      
      setOpen(false);
      onProductAdded?.();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Product to Flash Sale</DialogTitle>
          <DialogDescription>Select a product and set its discount rules.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <Label>Specific Product <span className="text-red-500">*</span></Label>
              <div className="relative" ref={searchRef}>
                {!productObj ? (
                  <>
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
                        {products.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {isSearching ? "Searching..." : "No products found."}
                          </div>
                        ) : (
                          products.map((p) => (
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
                                  alt={p.title || p.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.title || p.name}</p>
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
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-accent/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-background">
                        <img
                          src={getImageUrl(productObj.product_thumbnail_img)}
                          alt={productObj.title || productObj.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{productObj.title || productObj.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-background">
                            ID: {productObj.id}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            Tk {productObj.selling_price || productObj.regular_price || 0}
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
                        setProductId("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount_type">Discount Type <span className="text-red-500">*</span></Label>
                <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)} disabled={isSubmitting}>
                  <SelectTrigger id="discount_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discount_amount">Discount Value <span className="text-red-500">*</span></Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="e.g., 10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity Limit (Optional)</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Leave empty for unlimited"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                How many items of this product are available in the flash sale.
              </p>
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
