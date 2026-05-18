"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { PartialPaymentForm } from "./partial-payment-form";

interface OrderData {
  id: string;
  total: number;
  paid: number;
  due: number;
  paymentStatus: string;
}

interface UpdatePaymentModalProps {
  order: OrderData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function UpdatePaymentModal({ order, open: controlledOpen, onOpenChange, children }: UpdatePaymentModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };
  
  // Form state
  const [accountNumber, setAccountNumber] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const [newPaidAmount, setNewPaidAmount] = React.useState<number | "">("");
  const [status, setStatus] = React.useState(order.paymentStatus);

  // Sync state when open
  React.useEffect(() => {
    if (open) {
      setAccountNumber("");
      setTransactionId("");
      setNewPaidAmount("");
      setStatus(order.paymentStatus);
    }
  }, [open, order]);

  const handleSave = () => {
    toast.success(`Payment updated for ${order.id}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="size-5" />
            Update Payment Info
          </DialogTitle>
          <DialogDescription>
            Record a new payment and update the payment status for order {order.id}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order Total</span>
              <span className="font-semibold text-foreground">৳ {order.total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paid Amount</span>
              <span className="font-semibold text-green-600 dark:text-green-500">৳ {order.paid.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Due Amount</span>
              <span className="font-semibold text-destructive">৳ {order.due.toFixed(2)}</span>
            </div>
          </div>

          <PartialPaymentForm 
            orderTotal={order.total}
            currentPaid={order.paid}
            status={status}
            onStatusChange={setStatus}
            paidAmount={newPaidAmount}
            onPaidAmountChange={setNewPaidAmount}
            accountNumber={accountNumber}
            onAccountNumberChange={setAccountNumber}
            transactionId={transactionId}
            onTransactionIdChange={setTransactionId}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave}>Save Changes</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
