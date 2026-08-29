"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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

interface SupplierItem {
  id: number;
  name: string;
}

interface EditSupplierDialogProps {
  supplier: SupplierItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSupplier: (id: number, data: { name: string }) => Promise<boolean>;
}

export function EditSupplierDialog({
  supplier,
  open,
  onOpenChange,
  onUpdateSupplier,
}: EditSupplierDialogProps) {
  const [name, setName] = React.useState(supplier?.name || "");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (supplier) {
      setName(supplier.name);
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;
    if (!name.trim()) {
      toast.error("Please enter a supplier name.");
      return;
    }

    setSubmitting(true);
    try {
      const success = await onUpdateSupplier(supplier.id, { name: name.trim() });
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Update the name and details for this supplier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-supplier-name">Supplier / Vendor Name <span className="text-destructive">*</span></Label>
            <Input
              id="edit-supplier-name"
              placeholder="e.g. Apex Textiles Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
