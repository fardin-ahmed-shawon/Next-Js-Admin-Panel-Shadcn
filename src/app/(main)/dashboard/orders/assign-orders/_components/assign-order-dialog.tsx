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
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { EmployeeAssignmentPicker } from "../../_components/employee-assignment-picker";
import { useEmployeeOrders, EmployeeOrder } from "@/hooks/useEmployeeOrders";

interface AssignOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentToEdit?: EmployeeOrder | null;
  prefilledOrderNo?: string;
  onSuccess?: () => void;
}

export function AssignOrderDialog({
  open,
  onOpenChange,
  assignmentToEdit,
  prefilledOrderNo,
  onSuccess,
}: AssignOrderDialogProps) {
  const {
    data,
    error: loadError,
    isLoading: loadingUsers,
  } = useSWR(
    open
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/") +
          "order-assignments/recipients?assignment_type=agent"
      : null,
    async (url: string) => {
      const response = await fetchClient(url);
      if (!response.ok) throw new Error("Unable to load eligible employees");
      return response.json();
    },
  );
  const users = data?.data || [];
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
        await updateAssignment(assignmentToEdit.id, { user_id: Number(userId), order_no: orderNo.trim() });
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
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Change Order Agent" : "Assign Order Agent"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Choose the employee responsible for this order."
                : "Assign an order to an employee for fulfillment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && <div className="text-sm text-destructive">{error}</div>}

            {loadError && (
              <p role="alert" className="text-sm text-destructive">
                {loadError.message}
              </p>
            )}
            <EmployeeAssignmentPicker
              employees={users}
              value={userId}
              onChange={setUserId}
              loading={loadingUsers}
              disabled={isSubmitting || !!loadError}
            />

            <div className="grid gap-2">
              <Label htmlFor="orderNo">Order Number</Label>
              <Input
                id="orderNo"
                disabled={isEdit || !!prefilledOrderNo}
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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loadingUsers ||
                !!loadError ||
                !users.some((employee: { id: number }) => String(employee.id) === userId)
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
