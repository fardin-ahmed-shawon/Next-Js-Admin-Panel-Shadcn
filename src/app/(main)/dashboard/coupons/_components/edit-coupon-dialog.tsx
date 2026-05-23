"use client";

import * as React from "react";

import { Repeat } from "lucide-react";
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

interface EditCouponDialogProps {
  coupon: {
    id: string;
    code: string;
    type: string;
    value: string | number;
    expiryDate: string;
    usageLimit: string | number;
    status: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCouponDialog({ coupon, open, onOpenChange }: EditCouponDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [code, setCode] = React.useState(coupon.code);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success("Coupon updated successfully");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Coupon</DialogTitle>
          <DialogDescription>Update details for {coupon.code}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-code">
                Coupon Code <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="edit-code" 
                  value={code} 
                  className="font-mono uppercase"
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  required 
                />
                <Button type="button" variant="secondary" onClick={generateCode} className="shrink-0" title="Generate random code">
                  <Repeat className="mr-2 size-4" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-discountType">Type</Label>
                <Select defaultValue={coupon.type.toLowerCase()}>
                  <SelectTrigger id="edit-discountType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-discountValue">Value <span className="text-destructive">*</span></Label>
                <Input id="edit-discountValue" type="number" defaultValue={coupon.value} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                <Input id="edit-expiryDate" type="date" defaultValue={coupon.expiryDate} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-usageLimit">Usage Limit</Label>
                <Input id="edit-usageLimit" type="number" defaultValue={coupon.usageLimit !== "Unlimited" ? coupon.usageLimit : ""} placeholder="Leave empty for unlimited" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select defaultValue={coupon.status.toLowerCase()}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
