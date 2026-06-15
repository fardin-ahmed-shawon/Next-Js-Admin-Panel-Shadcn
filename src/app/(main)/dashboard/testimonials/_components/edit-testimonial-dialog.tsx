"use client";

import React, { useEffect, useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  onUpdate,
}: {
  testimonial: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    rating: "5",
    text: "",
  });
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || "",
        position: testimonial.position || "",
        rating: String(testimonial.rating || 5),
        text: testimonial.text || "",
      });
      setImagePreview(testimonial.photo || null);
    }
  }, [testimonial]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, JPG, GIF, WEBP)");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.text) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user_name', formData.name);
      formDataToSend.append('user_position', formData.position);
      formDataToSend.append('testimonial_text', formData.text);
      formDataToSend.append('ratings', formData.rating);
      
      if (selectedImage) {
        formDataToSend.append('user_photo', selectedImage);
      }

      let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/admin';
      const testimonialEndpoint = process.env.NEXT_PUBLIC_API_TESTIMONIAL_URL || 'testimonials';
      
      const baseUrl = apiUrl.replace(/\/$/, '');
      const url = `${baseUrl}/${testimonialEndpoint}/${testimonial.id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-HTTP-Method-Override': 'PUT',
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to update testimonial";
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          errorMessage = errorMessages.join(", ");
        } else if (result.message) {
          errorMessage = result.message;
        }
        throw new Error(errorMessage);
      }

      if (result.success) {
        toast.success(result.message || "Testimonial updated successfully.");
        onOpenChange(false);
        router.refresh();
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.message || "Failed to update testimonial");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update testimonial");
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-position">Position / Title</Label>
            <Input
              id="edit-position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>User Photo</Label>
            <input
              ref={fileInputRef}
              type="file"
              id="edit-user_photo"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-4 border rounded-lg p-4 bg-muted/20">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded-full border" 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <Avatar className="size-16 border">
                  <AvatarImage src={formData.photo} />
                  <AvatarFallback>{formData.name?.substring(0, 2).toUpperCase() || "IMG"}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mb-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <UploadCloud className="size-4 mr-2" />
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
            <Select 
              value={formData.rating} 
              onValueChange={(val) => setFormData({ ...formData, rating: val })}
              disabled={isSubmitting}
            >
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
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}