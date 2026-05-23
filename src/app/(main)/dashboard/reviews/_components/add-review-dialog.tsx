"use client";

import React, { useState } from "react";
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

export function AddReviewDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    customerId: "",
    rating: "",
    text: "",
  });

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

    toast.success("Review added successfully.");
    setOpen(false);
    setFormData({ productId: "", customerId: "", rating: "", text: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="size-4" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new customer product review.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="product">
              Select Product <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.productId} onValueChange={(val) => setFormData({ ...formData, productId: val })}>
              <SelectTrigger className="w-full" id="product">
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
            <Label htmlFor="customer">
              Select Customer <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.customerId} onValueChange={(val) => setFormData({ ...formData, customerId: val })}>
              <SelectTrigger className="w-full" id="customer">
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
            <Label htmlFor="rating">
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
              <SelectTrigger className="w-full" id="rating">
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
            <Label htmlFor="text">
              Review Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="text"
              placeholder="Write the review content here..."
              className="min-h-[120px] resize-none"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
