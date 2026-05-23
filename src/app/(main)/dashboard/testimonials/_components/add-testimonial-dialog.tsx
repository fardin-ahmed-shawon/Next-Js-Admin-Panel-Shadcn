"use client";

import React, { useState } from "react";

import { Plus, UploadCloud } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export function AddTestimonialDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    photo: "",
    rating: "5",
    text: "",
  });

  const handleSave = () => {
    toast.success("Testimonial added successfully.");
    setOpen(false);
    setFormData({ name: "", position: "", photo: "", rating: "5", text: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="size-4" />
          Add Testimonial
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Testimonial</DialogTitle>
          <DialogDescription>Fill in the details to add a new customer testimonial.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              User Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position / Title</Label>
            <Input
              id="position"
              placeholder="e.g., CEO, Customer..."
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">Optional: Job title or role</p>
          </div>

          <div className="space-y-2">
            <Label>User Photo</Label>
            <div className="flex items-center gap-4 border-2 border-dashed rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer justify-center flex-col text-center">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <UploadCloud className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, GIF, WEBP (Max 2MB)</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5 Stars)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Good (4 Stars)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Average (3 Stars)</SelectItem>
                <SelectItem value="2">⭐⭐ Poor (2 Stars)</SelectItem>
                <SelectItem value="1">⭐ Terrible (1 Star)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">
              Testimonial Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="text"
              placeholder="Write the testimonial content here..."
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
          <Button onClick={handleSave}>Save Testimonial</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
