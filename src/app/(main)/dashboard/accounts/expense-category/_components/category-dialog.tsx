import * as React from "react";

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
import { fetchClient } from "@/lib/fetch-client";

export type CategoryData = {
  id?: number;
  title: string;
};

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CategoryData | null;
  mode: "add" | "edit";
  onSuccess?: () => void;
}

export function CategoryDialog({ open, onOpenChange, initialData, mode, onSuccess }: CategoryDialogProps) {
  const [formData, setFormData] = React.useState<CategoryData>({
    title: "",
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          title: initialData.title,
        });
      } else {
        setFormData({
          title: "",
        });
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Category title is required.");
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const endpoint = process.env.NEXT_PUBLIC_API_EXPENSE_CATEGORIES_URL || "expense-categories";
      
      let url = `${baseUrl}${endpoint}`;
      let method = "POST";

      if (mode === "edit" && initialData?.id) {
        url = `${url}/${initialData.id}`;
        method = "PUT";
      }

      const res = await fetchClient(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success(data.message || `Expense Category successfully ${mode === "add" ? "added" : "updated"}!`);
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save expense category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new category for your expenses."
              : "Update the details of this expense category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Category Title</Label>
            <Input
              id="title"
              placeholder="e.g. Office Rent"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "add" ? "Create Category" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
