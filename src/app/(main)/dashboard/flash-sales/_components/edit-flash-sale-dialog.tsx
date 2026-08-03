"use client";

import * as React from "react";
import { Edit } from "lucide-react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const FLASH_SALE_API_URL = "flash-sales";

const getFlashSaleUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  const fullPath = path ? `${FLASH_SALE_API_URL}/${path}` : FLASH_SALE_API_URL;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface EditFlashSaleDialogProps {
  flashSale: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlashSaleUpdated?: () => void;
}

export function EditFlashSaleDialog({ flashSale, open, onOpenChange, onFlashSaleUpdated }: EditFlashSaleDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [status, setStatus] = React.useState<"1" | "0">("1");

  // Initialize form when dialog opens or flashSale changes
  React.useEffect(() => {
    if (flashSale && open) {
      setTitle(flashSale.title || "");
      
      // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
      const formatForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };
      
      setStartDate(flashSale.start_date ? formatForInput(flashSale.start_date) : "");
      setEndDate(flashSale.end_date ? formatForInput(flashSale.end_date) : "");
      setStatus(flashSale.status ? "1" : "0");
    }
  }, [flashSale, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const payload = {
        title,
        start_date: startDate,
        end_date: endDate,
        status: status === "1",
      };

      const response = await fetch(getFlashSaleUrl(flashSale.id.toString()), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update flash sale (${response.status})`);
      }

      toast.success("Flash sale updated successfully");
      
      onOpenChange(false);
      onFlashSaleUpdated?.();
    } catch (error) {
      console.error("Error updating flash sale:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update flash sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Flash Sale</DialogTitle>
          <DialogDescription>Make changes to the flash sale event.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Sale 2026"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-start_date">Start Date <span className="text-red-500">*</span></Label>
              <Input
                id="edit-start_date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-end_date">End Date <span className="text-red-500">*</span></Label>
              <Input
                id="edit-end_date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(val: "1" | "0") => setStatus(val)} disabled={isSubmitting}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
