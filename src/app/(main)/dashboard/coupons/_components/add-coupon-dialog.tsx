"use client";

import * as React from "react";
import { Plus, Repeat } from "lucide-react";
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
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [code, setCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [usageLimit, setUsageLimit] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");

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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Coupon</DialogTitle>
          <DialogDescription>Create a new discount code for your customers.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
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
