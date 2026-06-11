"use client";

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
import useMainCategories from "@/hooks/useMainCategories";

interface EditSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: string;
    name: string;
    parent?: string;
    status: string;
  };
}

export function EditSubCategoryDialog({ open, onOpenChange, category }: EditSubCategoryDialogProps) {
  const { mainCategories, loading } = useMainCategories();

  // Find matching category id by title for the default value
  const defaultParentId = mainCategories.find((c) => c.title === category.parent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Sub Category</DialogTitle>
          <DialogDescription>
            Update the details for <span className="font-medium text-foreground">{category.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="edit-choose-main-category">Parent Category</FieldLabel>
            <FieldContent>
              <Select defaultValue={defaultParentId ? String(defaultParentId.id) : undefined} disabled={loading}>
                <SelectTrigger id="edit-choose-main-category" className="w-full">
                  <SelectValue placeholder={loading ? "Loading..." : "Select Main Category"} />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {mainCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-sub-category-name">Sub Category Name</FieldLabel>
            <FieldContent>
              <Input id="edit-sub-category-name" defaultValue={category.name} placeholder="Enter sub category name" />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-sub-category-status">Status</FieldLabel>
            <FieldContent>
              <Select defaultValue={category.status}>
                <SelectTrigger id="edit-sub-category-status" className="w-full">
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
