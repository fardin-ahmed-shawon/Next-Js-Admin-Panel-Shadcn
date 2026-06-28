"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useMainCategories from "@/hooks/useMainCategories";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_SUB_CATEGORIES_URL || "sub-categories"}`;

export function AddSubCategoryDialog() {
  const { mainCategories, loading: fetchingMainCategories } = useMainCategories();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [status, setStatus] = useState("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a sub category name.");
      return;
    }
    if (!mainCategoryId) {
      toast.error("Please select a parent category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
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
        throw new Error(data.message || "Failed to create sub category");
      }

      toast.success(data.message || "Sub category created successfully");
      setOpen(false);
      setName("");
      setMainCategoryId("");
      setStatus("Active");

      // Reload to refresh the table data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Sub Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Sub Category</DialogTitle>
          <DialogDescription>Create a sub-category under an existing main category.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="choose-main-category">Parent Category</FieldLabel>
            <FieldContent>
              <Select disabled={fetchingMainCategories} value={mainCategoryId} onValueChange={setMainCategoryId}>
                <SelectTrigger id="choose-main-category" className="w-full">
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
            <FieldLabel htmlFor="sub-category-name">Sub Category Name</FieldLabel>
            <FieldContent>
              <Input
                id="sub-category-name"
                placeholder="Enter sub category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="sub-category-status">Status</FieldLabel>
            <FieldContent>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="sub-category-status" className="w-full">
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
            {isSubmitting ? "Submitting..." : "Submit"}
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
