"use client";

import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
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

interface Brand {
  id: string;
  name: string;
  logo: string;
}

interface EditBrandDialogProps {
  brand: Brand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, formData: FormData) => Promise<boolean>;
}

export function EditBrandDialog({ brand, open, onOpenChange, onUpdate }: EditBrandDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && brand) {
      setName(brand.name || "");
      setPreviewUrl(brand.logo || null);
      setSelectedFile(null);
    }
  }, [open, brand]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size must be less than 3MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", name.trim());

    if (selectedFile) {
      formData.append("logo", selectedFile);
    }

    try {
      const success = await onUpdate(brand.id, formData);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Update brand error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>Update brand details and logo image.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-brand-name">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nike"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Brand Logo</Label>
            <input
              ref={fileInputRef}
              type="file"
              id="edit-brand-logo-input"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            {previewUrl ? (
              <div className="relative border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/20 gap-3">
                <img
                  src={previewUrl}
                  alt="Brand Preview"
                  className="max-h-32 max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/80x80/1a1a2e/e0e0e0?text=${name.substring(0, 2).toUpperCase()}`;
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Change Logo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearImage}
                    disabled={isSubmitting}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="edit-brand-logo-input"
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload new logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF (Max 3MB)</p>
                </div>
              </label>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Brand"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
