"use client";

import * as React from "react";
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
import { Switch } from "@/components/ui/switch";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const DISCOUNT_API_URL = process.env.NEXT_PUBLIC_API_DISCOUNT_URL || "discounts";

// Helper function for discount-specific URLs
const getDiscountUrl = (path: string = '') => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  
  const discountPath = DISCOUNT_API_URL.replace(/^\/|\/$/g, '');
  const cleanPath = path.replace(/^\/|\/$/g, '');
  const fullPath = cleanPath ? `${discountPath}/${cleanPath}` : discountPath;
  
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface EditDiscountDialogProps {
  discount: {
    id: string;
    purchaseAmount: number;
    discountAmount: number;
    type: string;
    freeShipping: boolean;
    status: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscountUpdated?: () => void;
}

export function EditDiscountDialog({ discount, open, onOpenChange, onDiscountUpdated }: EditDiscountDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form state
  const [minimumSubtotalAmount, setMinimumSubtotalAmount] = React.useState(discount.purchaseAmount.toString());
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">(
    discount.type === "Percentage" ? "percentage" : "fixed"
  );
  const [discountAmount, setDiscountAmount] = React.useState(discount.discountAmount.toString());
  const [freeShipping, setFreeShipping] = React.useState(discount.freeShipping);
  const [status, setStatus] = React.useState<"active" | "inactive">(
    discount.status === "Active" ? "active" : "inactive"
  );
  
  // Form validation
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when discount prop changes
  React.useEffect(() => {
    setMinimumSubtotalAmount(discount.purchaseAmount.toString());
    setDiscountType(discount.type === "Percentage" ? "percentage" : "fixed");
    setDiscountAmount(discount.discountAmount.toString());
    setFreeShipping(discount.freeShipping);
    setStatus(discount.status === "Active" ? "active" : "inactive");
    setErrors({});
  }, [discount]);

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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      };
      
      console.log("Updating discount data:", discountData);
      
      const url = getDiscountUrl(`${discount.id}`);
      console.log("Update URL:", url);
      
      const response = await fetch(url, {
        method: "PUT",
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
          Object.keys(responseData.errors).forEach(key => {
            apiErrors[key] = responseData.errors[key][0];
          });
          setErrors(apiErrors);
          toast.error("Please check the form for errors");
        } else {
          throw new Error(responseData.message || "Failed to update discount");
        }
        return;
      }
      
      toast.success(`Discount rule ${discount.id} updated successfully.`);
      onOpenChange(false);
      
      // Refresh the discounts list
      if (onDiscountUpdated) {
        onDiscountUpdated();
      }
      
    } catch (error) {
      console.error("Error updating discount:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update discount");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Discount</DialogTitle>
          <DialogDescription>Update rules for discount ID: {discount.id}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Minimum Purchase Amount */}
            <div className="grid gap-2">
              <Label htmlFor="edit-purchaseAmount">
                Minimum Purchase Amount (৳) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-purchaseAmount"
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
                <Label htmlFor="edit-discountType">Discount Type</Label>
                <Select 
                  value={discountType} 
                  onValueChange={(value: "fixed" | "percentage") => setDiscountType(value)}
                >
                  <SelectTrigger id="edit-discountType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-discountAmount">
                  Discount Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-discountAmount"
                  type="number"
                  step={discountType === "percentage" ? "1" : "0.01"}
                  placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  required
                  className={errors.discountAmount ? "border-destructive" : ""}
                />
                {errors.discountAmount && (
                  <p className="text-sm text-destructive">{errors.discountAmount}</p>
                )}
              </div>
            </div>

            {/* Free Shipping Switch */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs mt-2">
              <div className="space-y-0.5">
                <Label htmlFor="edit-freeShipping" className="text-base">
                  Free Shipping
                </Label>
                <p className="text-sm text-muted-foreground">Include free shipping with this discount</p>
              </div>
              <Switch 
                id="edit-freeShipping" 
                checked={freeShipping} 
                onCheckedChange={setFreeShipping} 
              />
            </div>

            {/* Status Selection */}
            <div className="grid gap-2 mt-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Discount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}