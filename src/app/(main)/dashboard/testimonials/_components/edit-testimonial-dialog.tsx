"use client";

import React, { useEffect, useState } from "react";

import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";

export function EditTestimonialDialog({
  testimonial,
  open,
  onOpenChange,
}: {
  testimonial: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    photo: "",
    rating: "5",
    text: "",
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || "",
        position: testimonial.position || "",
        photo: testimonial.photo || "",
        rating: String(testimonial.rating || 5),
        text: testimonial.text || "",
      });
    }
  }, [testimonial]);

  const handleSave = () => {
    toast.success("Testimonial updated successfully.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Testimonial</DialogTitle>
          <DialogDescription>Modify the testimonial details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              User Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-position">Position / Title</Label>
            <Input
              id="edit-position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>User Photo</Label>
            <div className="flex items-center gap-4 border rounded-lg p-4 bg-muted/20">
              <Avatar className="size-16 border">
                <AvatarImage src={formData.photo} />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" className="mb-1">
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground">Accepted: JPG, PNG, GIF, WEBP (Max 2MB)</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rating">
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
              <SelectTrigger className="w-full">
                <SelectValue />
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
            <Label htmlFor="edit-text">
              Testimonial Text <span className="text-destructive">*</span>
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
