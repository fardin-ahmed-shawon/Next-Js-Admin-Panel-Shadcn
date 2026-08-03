"use client";

import * as React from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const FLASH_SALE_API_URL = "flash-sales";

const getFlashSaleUrl = (flashSaleId: string, productId: string) => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  const fullPath = `${FLASH_SALE_API_URL}/${flashSaleId}/products/${productId}`;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface EditProductDialogProps {
  flashSaleId: string;
  flashSaleProduct: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated?: () => void;
}

export function EditProductDialog({ 
  flashSaleId, 
  flashSaleProduct, 
  open, 
  onOpenChange, 
  onProductUpdated 
}: EditProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [discountType, setDiscountType] = React.useState<"percent" | "fixed" | "fixed_price">("percent");
  const [discountAmount, setDiscountAmount] = React.useState("");
  const [quantity, setQuantity] = React.useState("");

  React.useEffect(() => {
    if (flashSaleProduct && open) {
      setDiscountType(flashSaleProduct.discount_type || "percent");
      setDiscountAmount(flashSaleProduct.discount_amount?.toString() || "");
      setQuantity(flashSaleProduct.quantity?.toString() || "");
    }
  }, [flashSaleProduct, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discountType || !discountAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const payload = {
        discount_type: discountType,
        discount_amount: parseFloat(discountAmount),
        quantity: quantity ? parseInt(quantity) : null,
      };

      const response = await fetch(getFlashSaleUrl(flashSaleId, flashSaleProduct.id.toString()), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update product (${response.status})`);
      }

      toast.success("Flash sale product updated successfully");
      
      onOpenChange(false);
      onProductUpdated?.();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Flash Sale Product</DialogTitle>
          <DialogDescription>
            Update discount rules for {flashSaleProduct?.product?.name || `Product #${flashSaleProduct?.product_id}`}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-discount_type">Discount Type <span className="text-red-500">*</span></Label>
                <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)} disabled={isSubmitting}>
                  <SelectTrigger id="edit-discount_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (-)</SelectItem>
                    <SelectItem value="fixed_price">Fixed Price ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-discount_amount">Discount Value <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-discount_amount"
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
              <Label htmlFor="edit-quantity">Quantity Limit (Optional)</Label>
              <Input
                id="edit-quantity"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
