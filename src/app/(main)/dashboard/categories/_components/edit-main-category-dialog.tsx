"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_MAIN_CATEGORIES_URL || "main-categories"}`;

interface EditMainCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
}

export function EditMainCategoryDialog({ open, onOpenChange, category }: EditMainCategoryDialogProps) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [status, setStatus] = useState(category.status || "Active");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(category.name);
      setDescription(category.description);
      setStatus(category.status || "Active");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open, category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a main category name.");
      return;
    }

    const numericId = category.id.replace("CAT-", "");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", name.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      formData.append("status", status);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_URL}/${numericId}`, {
        method: "POST", // The API uses POST with _method=PUT
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update main category");
      }

      toast.success(data.message || "Main category updated successfully");
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Main Category</DialogTitle>
          <DialogDescription>
            Update the details for <span className="font-medium text-foreground">{category.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="edit-main-category-name">Main Category Name</FieldLabel>
            <FieldContent>
              <Input
                id="edit-main-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-main-category-description">Description</FieldLabel>
            <FieldContent>
              <Textarea
                id="edit-main-category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description..."
                rows={3}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-main-category-image">Image</FieldLabel>
            <FieldContent>
              {imagePreview ? (
                <div className="relative flex h-32 w-full items-center justify-center rounded-lg border bg-muted">
                  <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 size-6 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="edit-main-category-image"
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                >
                  <Upload className="size-8 text-muted-foreground/60" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload new image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 2MB)</p>
                  </div>
                  <Input
                    id="edit-main-category-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-main-category-status">Status</FieldLabel>
            <FieldContent>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="edit-main-category-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
