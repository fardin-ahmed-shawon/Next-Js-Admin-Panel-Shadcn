"use client";

import * as React from "react";

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
import { Textarea } from "@/components/ui/textarea";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_URL;
const API_URL = `${BASE}/${BLOG_PATH}`;

export function AddBlogDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        console.log("File name:", file.name);
        console.log("File type:", file.type);
        console.log("File size:", file.size);
        formData.append("img", file, file.name);
      }

      for (const [key, value] of formData.entries()) {
        console.log(`FormData → ${key}:`, value);
      }

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      console.log("Response:", json);

      if (!res.ok) {
        if (json?.errors) {
          const messages = Object.values(json.errors as Record<string, string[]>)
            .flat()
            .join(" ");
          throw new Error(messages);
        }
        throw new Error(json?.message ?? `HTTP ${res.status}`);
      }

      toast.success("Blog post published successfully.");
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Blog
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Blog Post</DialogTitle>
          <DialogDescription>Create a new article for your content marketing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. 10 Tips for Modern Web Design"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Write a short summary or excerpt..."
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Cover Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-32 w-full rounded-lg border overflow-hidden bg-muted p-1">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-full object-cover rounded-md"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="mr-2 size-4" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">
                      Accepted: JPEG, PNG, JPG, GIF · Max 3MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setOpen(false); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Blog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}