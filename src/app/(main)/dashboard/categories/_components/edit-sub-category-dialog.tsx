"use client";

import { useEffect, useState } from "react";

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

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_SUB_CATEGORIES_URL || "sub-categories"}`;

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
  const { mainCategories, loading: fetchingMainCategories } = useMainCategories();

  const [name, setName] = useState(category.name);
  const [mainCategoryId, setMainCategoryId] = useState<string>("");
  const [status, setStatus] = useState(category.status || "Active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category.name);
      setStatus(category.status || "Active");
      const parent = mainCategories.find((c) => c.name === category.parent);
      if (parent) {
        setMainCategoryId(String(parent.id));
      } else {
        setMainCategoryId("");
      }
    }
  }, [open, category, mainCategories]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a sub category name.");
      return;
    }
    if (!mainCategoryId) {
      toast.error("Please select a parent category.");
      return;
    }

    const numericId = category.id.replace("SUB-", "");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/${numericId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          main_category_id: Number(mainCategoryId),
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update sub category");
      }

      toast.success(data.message || "Sub category updated successfully");
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
          <DialogTitle className="text-xl font-bold">Edit Sub Category</DialogTitle>
          <DialogDescription>
            Update the details for <span className="font-medium text-foreground">{category.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="edit-choose-main-category">Parent Category</FieldLabel>
            <FieldContent>
              <Select disabled={fetchingMainCategories} value={mainCategoryId} onValueChange={setMainCategoryId}>
                <SelectTrigger id="edit-choose-main-category" className="w-full">
                  <SelectValue placeholder={fetchingMainCategories ? "Loading..." : "Select Main Category"} />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {mainCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-sub-category-name">Sub Category Name</FieldLabel>
            <FieldContent>
              <Input
                id="edit-sub-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter sub category name"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-sub-category-status">Status</FieldLabel>
            <FieldContent>
              <Select value={status} onValueChange={setStatus}>
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
