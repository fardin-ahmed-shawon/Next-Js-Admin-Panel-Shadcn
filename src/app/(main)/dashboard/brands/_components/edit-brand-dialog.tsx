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

interface EditBrandDialogProps {
  brand: {
    id: string;
    name: string;
    logo: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBrandDialog({ brand, open, onOpenChange }: EditBrandDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success("Brand updated successfully");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>Update details for {brand.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input id="edit-name" defaultValue={brand.name} required />
            </div>

            <div className="grid gap-2">
              <Label>Brand Logo</Label>
              <div className="flex flex-col items-center gap-4 mb-2 mt-1">
                <div className="size-24 rounded-lg border overflow-hidden bg-muted p-2">
                  <img src={brand.logo} alt={brand.name} className="size-full object-cover rounded-sm" />
                </div>
                <Button variant="outline" size="sm" type="button">
                  <UploadCloud className="mr-2 size-4" />
                  Change Logo
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
