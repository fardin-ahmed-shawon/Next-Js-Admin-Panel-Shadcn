"use client";

import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const products = [
  { id: "PRD-1001", name: "Classic Cotton T-Shirt" },
  { id: "PRD-1002", name: "Wireless Bluetooth Earbuds" },
  { id: "PRD-1003", name: "Leather Crossbody Bag" },
  { id: "PRD-1004", name: "Vitamin C Serum 30ml" },
  { id: "PRD-1005", name: "Running Shoes Pro" },
];

const customers = [
  { id: "CUS-1001", name: "Arham Khan" },
  { id: "CUS-1002", name: "Fatima Akter" },
  { id: "CUS-1003", name: "Rahim Uddin" },
  { id: "CUS-1004", name: "Nusrat Jahan" },
  { id: "CUS-1005", name: "Tanvir Hossain" },
];

interface EditReviewDialogProps {
  review: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReviewDialog({ review, open, onOpenChange }: EditReviewDialogProps) {
  const [formData, setFormData] = useState({
    productId: "",
    customerId: "",
    rating: "",
    text: "",
  });

  useEffect(() => {
    if (review) {
      setFormData({
        productId: review.productId || "",
        customerId: review.customerId || "",
        rating: String(review.rating || ""),
        text: review.text || "",
      });
    }
  }, [review]);

  const handleSave = () => {
    if (!formData.productId) {
      toast.error("Please select a product.");
      return;
    }
    if (!formData.customerId) {
      toast.error("Please select a customer.");
      return;
    }
    if (!formData.rating) {
      toast.error("Please select a rating.");
      return;
    }
    if (!formData.text.trim()) {
      toast.error("Please write review text.");
      return;
    }

    toast.success("Review updated successfully.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Modify the product review details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-product">
              Select Product <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.productId} onValueChange={(val) => setFormData({ ...formData, productId: val })}>
              <SelectTrigger className="w-full" id="edit-product">
                <SelectValue placeholder="-- Select Product --" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customer">
              Select Customer <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.customerId} onValueChange={(val) => setFormData({ ...formData, customerId: val })}>
              <SelectTrigger className="w-full" id="edit-customer">
                <SelectValue placeholder="-- Select Customer --" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rating">
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
              <SelectTrigger className="w-full" id="edit-rating">
                <SelectValue placeholder="-- Select Rating --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5 Stars)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Good (4 Stars)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Average (3 Stars)</SelectItem>
                <SelectItem value="2">⭐⭐ Poor (2 Stars)</SelectItem>
                <SelectItem value="1">⭐ Terrible (1 Star)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Select rating from 1 (worst) to 5 (best) stars</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-text">
              Review Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-text"
              className="min-h-[120px] resize-none"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
