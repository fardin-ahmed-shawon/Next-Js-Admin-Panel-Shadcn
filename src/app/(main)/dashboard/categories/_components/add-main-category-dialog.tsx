"use client";

import { Plus, Upload } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

export function AddMainCategoryDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Main Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Main Category</DialogTitle>
          <DialogDescription>Create a new top-level category for your products.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="main-category-name">Main Category Name</FieldLabel>
            <FieldContent>
              <Input id="main-category-name" placeholder="Enter category name" />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="main-category-description">Description</FieldLabel>
            <FieldContent>
              <Textarea id="main-category-description" placeholder="Write a short description..." rows={3} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="main-category-image">Image</FieldLabel>
            <FieldContent>
              <label
                htmlFor="main-category-image"
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
              >
                <Upload className="size-8 text-muted-foreground/60" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 2MB)</p>
                </div>
                <Input id="main-category-image" type="file" accept="image/*" className="sr-only" />
              </label>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="main-category-status">Status</FieldLabel>
            <FieldContent>
              <Select defaultValue="Active">
                <SelectTrigger id="main-category-status" className="w-full">
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
          <Button type="submit">Submit</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
