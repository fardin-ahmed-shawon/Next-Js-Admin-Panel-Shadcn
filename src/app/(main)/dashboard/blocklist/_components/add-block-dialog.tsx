"use client";

import React, { useState } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (data: { block_type: string; block_value: string; reason?: string }) => Promise<void>;
}

export function AddBlockDialog({ open, onOpenChange, onAddBlock }: AddBlockDialogProps) {
  const [blockType, setBlockType] = React.useState("phone");
  const [blockValue, setBlockValue] = React.useState("");
  const [blockReason, setBlockReason] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockValue.trim()) {
      toast.error("Please enter a value to block");
      return;
    }

    setIsLoading(true);
    try {
      await onAddBlock({
        block_type: blockType,
        block_value: blockValue.trim(),
        reason: blockReason.trim() || undefined,
      });

      // Reset form
      setBlockValue("");
      setBlockReason("");
      setBlockType("phone");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Ban className="h-5 w-5 text-red-700 dark:text-red-500" />
            Add Manual Block
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="block-type" className="font-semibold text-slate-700 dark:text-slate-300">
              Block Type
            </FieldLabel>
            <FieldContent>
              <Select value={blockType} onValueChange={setBlockType}>
                <SelectTrigger
                  id="block-type"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Number</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="block-value" className="font-semibold text-slate-700 dark:text-slate-300">
              Value
            </FieldLabel>
            <FieldContent>
              <Input
                id="block-value"
                value={blockValue}
                onChange={(e) => setBlockValue(e.target.value)}
                placeholder={blockType === "phone" ? "e.g. 01712345678" : "e.g. 192.168.1.1"}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                required
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="block-reason" className="font-semibold text-slate-700 dark:text-slate-300">
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Fraudulent orders, spam calls..."
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </FieldContent>
          </Field>

          <div className="pt-4 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-semibold text-base py-5"
            >
              <Ban className="h-5 w-5" />
              {isLoading ? "Adding..." : "Block This Entry"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-1">
              This will prevent future orders matching this value.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
