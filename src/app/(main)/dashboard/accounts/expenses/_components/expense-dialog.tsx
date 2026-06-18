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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import useExpenseCategories from "@/hooks/useExpenseCategories";
import { fetchClient } from "@/lib/fetch-client";

export type ExpenseData = {
  id?: number;
  title: string;
  expense_category_id: number | "";
  amount: number | "";
  description: string;
};

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ExpenseData | null;
  mode: "add" | "edit";
  onSuccess?: () => void;
}

export function ExpenseDialog({ open, onOpenChange, initialData, mode, onSuccess }: ExpenseDialogProps) {
  const { expenseCategories } = useExpenseCategories();

  const [formData, setFormData] = React.useState<ExpenseData>({
    title: "",
    expense_category_id: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          title: initialData.title || "",
          expense_category_id: initialData.expense_category_id || "",
          amount: initialData.amount || "",
          description: initialData.description || "",
        });
      } else {
        setFormData({
          title: "",
          expense_category_id: "",
          amount: "",
          description: "",
        });
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.expense_category_id || formData.amount === "") {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const endpoint = process.env.NEXT_PUBLIC_API_EXPENSES_URL || "expenses";
      
      let url = `${baseUrl}${endpoint}`;
      let method = "POST";

      if (mode === "edit" && initialData?.id) {
        url = `${url}/${initialData.id}`;
        method = "PUT";
      }

      const payload = {
        title: formData.title,
        expense_category_id: Number(formData.expense_category_id),
        amount: Number(formData.amount),
        description: formData.description || null,
      };

      const res = await fetchClient(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success(data.message || `Expense successfully ${mode === "add" ? "added" : "updated"}!`);
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Expense" : "Edit Expense"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Enter the details of the new expense." : "Make changes to this expense record here."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. November Headquarters Rent"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
              <Select
                value={formData.expense_category_id.toString()}
                onValueChange={(val) => setFormData({ ...formData, expense_category_id: val })}
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (৳) <span className="text-destructive">*</span></Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional details here..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "add" ? "Save Expense" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
