"use client";

import * as React from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setMinimumSubtotalAmount("");
    setDiscountType("fixed");
    setDiscountAmount("");
    setFreeShipping(false);
    setStatus("active");
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
          Object.keys(responseData.errors).forEach(key => {
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Discount</DialogTitle>
          <DialogDescription>Create an automated discount rule based on purchase totals.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                <Select 
                  value={discountType} 
                  onValueChange={(value: "fixed" | "percentage") => setDiscountType(value)}
                >
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
                {errors.discountAmount && (
                  <p className="text-sm text-destructive">{errors.discountAmount}</p>
                )}
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
              <Switch 
                id="freeShipping" 
                checked={freeShipping} 
                onCheckedChange={setFreeShipping} 
              />
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