"use client";

import { Upload } from "lucide-react";
import { toast } from "sonner";

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
              <Input id="edit-main-category-name" defaultValue={category.name} placeholder="Enter category name" />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-main-category-description">Description</FieldLabel>
            <FieldContent>
              <Textarea
                id="edit-main-category-description"
                defaultValue={category.description}
                placeholder="Write a short description..."
                rows={3}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-main-category-image">Image</FieldLabel>
            <FieldContent>
              <label
                htmlFor="edit-main-category-image"
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
              >
                <Upload className="size-8 text-muted-foreground/60" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 2MB)</p>
                </div>
                <Input id="edit-main-category-image" type="file" accept="image/*" className="sr-only" />
              </label>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-main-category-status">Status</FieldLabel>
            <FieldContent>
              <Select defaultValue={category.status}>
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
          <Button
            type="submit"
            onClick={() => {
              onOpenChange(false);
              toast.success(`"${category.name}" has been updated successfully.`);
            }}
          >
            Save Changes
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
