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
}

export function EditDiscountDialog({ discount, open, onOpenChange }: EditDiscountDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [freeShipping, setFreeShipping] = React.useState(discount.freeShipping);

  // Update internal state when prop changes
  React.useEffect(() => {
    setFreeShipping(discount.freeShipping);
  }, [discount.freeShipping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success("Discount rule updated successfully");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Discount</DialogTitle>
          <DialogDescription>Update rules for discount ID: {discount.id}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-purchaseAmount">
                Purchase Amount <span className="text-destructive">*</span>
              </Label>
              <Input id="edit-purchaseAmount" type="number" defaultValue={discount.purchaseAmount} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-discountType">Discount Type</Label>
                <Select defaultValue={discount.type.toLowerCase()}>
                  <SelectTrigger id="edit-discountType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-discountAmount">
                  Value <span className="text-destructive">*</span>
                </Label>
                <Input id="edit-discountAmount" type="number" defaultValue={discount.discountAmount} required />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs mt-2">
              <div className="space-y-0.5">
                <Label htmlFor="edit-freeShipping" className="text-base">
                  Free Shipping
                </Label>
                <p className="text-sm text-muted-foreground">
                  Include free shipping with this discount
                </p>
              </div>
              <Switch
                id="edit-freeShipping"
                checked={freeShipping}
                onCheckedChange={setFreeShipping}
              />
            </div>
            
            <div className="grid gap-2 mt-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select defaultValue={discount.status.toLowerCase()}>
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
              {isSubmitting ? "Saving..." : "Update Discount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
