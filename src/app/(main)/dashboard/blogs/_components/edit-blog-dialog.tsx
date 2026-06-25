"use client";

import * as React from "react";

import { UploadCloud } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import type { BlogRow } from "./blogs-table";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_URL || "blogs";
const API_URL = `${BASE}${BLOG_PATH}`;

const getImageUrl = (path: string | null) => {
  if (!path) return "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Blog";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}${cleanPath}`;
};

interface EditBlogDialogProps {
  blog: BlogRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updated: BlogRow) => void;
}

export function EditBlogDialog({ blog, open, onOpenChange, onUpdated }: EditBlogDialogProps) {
  const [title, setTitle] = React.useState(blog.title);
  const [description, setDescription] = React.useState(blog.description);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>(getImageUrl(blog.img));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync fields when blog prop changes (switching rows)
  React.useEffect(() => {
    setTitle(blog.title);
    setDescription(blog.description);
    setImageFile(null);
    setImagePreview(getImageUrl(blog.img));
  }, [blog]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (imageFile) formData.append("img", imageFile);
      // Laravel typically needs this for PUT via FormData
      formData.append("_method", "PUT");

      const res = await fetch(`${API_URL}/${blog.id}`, {
        method: "POST", // POST + _method=PUT for Laravel FormData
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }

      const json: { success: boolean; data: BlogRow } = await res.json();
      toast.success("Blog post updated successfully.");
      onUpdated(json.data);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
          <DialogDescription>Update details for your blog post.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Cover Image</Label>
              <div className="flex flex-col items-center gap-4 mb-2 mt-1">
                <div className="h-32 w-full rounded-lg border overflow-hidden bg-muted p-1">
                  <img
                    src={imagePreview}
                    alt={title}
                    className="size-full object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Blog";
                    }}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="mr-2 size-4" />
                  Change Cover Image
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Blog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
