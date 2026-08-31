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
import { Textarea } from "@/components/ui/textarea";

export interface EditSupplierData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface SupplierItem {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

interface EditSupplierDialogProps {
  supplier: SupplierItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSupplier: (id: number, data: EditSupplierData) => Promise<boolean>;
}

export function EditSupplierDialog({
  supplier,
  open,
  onOpenChange,
  onUpdateSupplier,
}: EditSupplierDialogProps) {
  const [name, setName] = React.useState(supplier?.name || "");
  const [phone, setPhone] = React.useState(supplier?.phone || "");
  const [email, setEmail] = React.useState(supplier?.email || "");
  const [address, setAddress] = React.useState(supplier?.address || "");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (supplier) {
      setName(supplier.name || "");
      setPhone(supplier.phone || "");
      setEmail(supplier.email || "");
      setAddress(supplier.address || "");
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
      const success = await onUpdateSupplier(supplier.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Update the contact details and information for this supplier.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-supplier-phone" className="text-xs font-medium">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input
                id="edit-supplier-phone"
                placeholder="e.g. +8801700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-supplier-email" className="text-xs font-medium">Email <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input
                id="edit-supplier-email"
                type="email"
                placeholder="e.g. vendor@apex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-supplier-address" className="text-xs font-medium">Address <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <Textarea
              id="edit-supplier-address"
              placeholder="e.g. 123 Factory Road, Gazipur, Dhaka"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={submitting}
              className="resize-none"
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
