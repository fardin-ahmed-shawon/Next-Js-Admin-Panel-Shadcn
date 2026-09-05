"use client";

import React, { useState, useRef } from "react";
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

interface AddBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBrand: (formData: FormData) => Promise<boolean>;
}

export function AddBrandDialog({ open, onOpenChange, onAddBrand }: AddBrandDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      clearSelectedFile();
      if (formRef.current) {
        formRef.current.reset();
      }
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.set("logo", selectedFile);
    } else {
      formData.delete("logo");
    }

    try {
      const success = await onAddBrand(formData);
      if (success) {
        handleDialogClose(false);
      }
    } catch (error) {
      console.error("Add brand error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>Create a new product brand for your store catalog.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="brand-name">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brand-name"
              name="name"
              placeholder="e.g. Nike, Apple, Samsung"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Brand Logo (Optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              id="brand-logo-input"
              name="logo"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            {previewUrl ? (
              <div className="relative border rounded-lg p-4 flex items-center justify-center bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Brand Preview"
                  className="max-h-32 max-w-full object-contain rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    clearSelectedFile();
                  }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="brand-logo-input"
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF (Max 3MB)</p>
                </div>
              </label>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Brand"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
