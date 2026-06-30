"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/hooks/useUsers";
import { useEmployeeOrders, EmployeeOrder } from "@/hooks/useEmployeeOrders";

interface AssignOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentToEdit?: EmployeeOrder | null;
  prefilledOrderNo?: string;
  onSuccess?: () => void;
}

export function AssignOrderDialog({ open, onOpenChange, assignmentToEdit, prefilledOrderNo, onSuccess }: AssignOrderDialogProps) {
  const { users, loading: loadingUsers } = useUsers();
  const { createAssignment, updateAssignment } = useEmployeeOrders();

  const [userId, setUserId] = React.useState<string>("");
  const [orderNo, setOrderNo] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setError("");
      if (assignmentToEdit) {
        setUserId(assignmentToEdit.user_id.toString());
        setOrderNo(assignmentToEdit.order_no);
      } else {
        setUserId("");
        setOrderNo(prefilledOrderNo || "");
      }
    }
  }, [open, assignmentToEdit, prefilledOrderNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !orderNo.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      if (assignmentToEdit) {
        await updateAssignment(assignmentToEdit.id, { order_no: orderNo.trim() });
      } else {
        await createAssignment({ user_id: parseInt(userId), order_no: orderNo.trim() });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!assignmentToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Assignment" : "Assign Order"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the order assigned to this employee."
                : "Assign an order to an employee for fulfillment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={userId} onValueChange={setUserId} disabled={isEdit}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder={loadingUsers ? "Loading employees..." : "Select an employee"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  You cannot change the employee for an existing assignment.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="orderNo">Order Number</Label>
              <Input
                id="orderNo"
                placeholder="e.g. ORD-12345"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
