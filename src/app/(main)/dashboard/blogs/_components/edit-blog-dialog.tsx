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

interface EditBlogDialogProps {
  blog: {
    id: string;
    title: string;
    description: string;
    image: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBlogDialog({ blog, open, onOpenChange }: EditBlogDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success("Blog post updated successfully");
    }, 1000);
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
              <Input id="edit-title" defaultValue={blog.title} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea id="edit-description" defaultValue={blog.description} className="min-h-[100px]" required />
            </div>

            <div className="grid gap-2">
              <Label>Cover Image</Label>
              <div className="flex flex-col items-center gap-4 mb-2 mt-1">
                <div className="h-32 w-full rounded-lg border overflow-hidden bg-muted p-1">
                  <img src={blog.image} alt={blog.title} className="size-full object-cover rounded-md" />
                </div>
                <Button variant="outline" size="sm" type="button">
                  <UploadCloud className="mr-2 size-4" />
                  Change Cover Image
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
