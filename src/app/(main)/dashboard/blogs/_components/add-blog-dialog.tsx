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

export function AddBlogDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      toast.success("Blog post created successfully");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Input id="title" placeholder="e.g. 10 Tips for Modern Web Design" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Write a short summary or excerpt..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Cover Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground">Max file size: 5MB (16:9 recommended)</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
