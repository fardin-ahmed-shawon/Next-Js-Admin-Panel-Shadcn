"use client";

import * as React from "react";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface PartialPaymentFormProps {
  orderTotal: number;
  currentPaid?: number; // Optional, defaults to 0
  status: string;
  onStatusChange: (status: string) => void;
  paidAmount: number | "";
  onPaidAmountChange: (amount: number | "") => void;
  accountNumber?: string;
  onAccountNumberChange?: (acc: string) => void;
  transactionId: string;
  onTransactionIdChange: (txn: string) => void;
  paymentMethod?: string;
}

export function PartialPaymentForm({
  orderTotal,
  currentPaid = 0,
  status,
  onStatusChange,
  paidAmount,
  onPaidAmountChange,
  accountNumber,
  onAccountNumberChange,
  transactionId,
  onTransactionIdChange,
  paymentMethod,
}: PartialPaymentFormProps) {
  const paymentInput = typeof paidAmount === "number" ? paidAmount : 0;
  const projectedTotal = currentPaid + paymentInput;
  const remainingDue = Math.max(0, orderTotal - projectedTotal);

  const handleStatusChange = (val: string) => {
    if (!val) return;
    onStatusChange(val);
    if (val === "Full Paid") {
      onPaidAmountChange(Math.max(0, orderTotal - currentPaid));
    } else if (val === "Unpaid" || val === "Refund") {
      onPaidAmountChange(0);
    }
  };

  const handleAmountChange = (val: number | "") => {
    onPaidAmountChange(val);

    const inputAmt = typeof val === "number" ? val : 0;
    const proj = currentPaid + inputAmt;

    if (proj >= orderTotal) {
      onStatusChange("Full Paid");
    } else if (proj <= 0) {
      onStatusChange("Unpaid");
    } else {
      onStatusChange("Partially Paid");
    }
  };

  return (
    <div className="space-y-4">
      {onAccountNumberChange !== undefined && paymentMethod !== "cod" && (
        <Field>
          <FieldLabel htmlFor="account">Account / Mobile Number</FieldLabel>
          <FieldContent>
            <Input
              id="account"
              placeholder="017XXXXXXXX"
              value={accountNumber}
              onChange={(e) => onAccountNumberChange(e.target.value)}
            />
          </FieldContent>
        </Field>
      )}

      {paymentMethod !== "cod" && (
        <Field>
          <FieldLabel htmlFor="txnid">Transaction ID</FieldLabel>
          <FieldContent>
            <Input
              id="txnid"
              placeholder="TXN123456"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value)}
            />
          </FieldContent>
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="paidAmt">Paid Amount</FieldLabel>
        <FieldContent>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 border-r border-input pr-3 bg-muted/50 rounded-l-md text-muted-foreground text-sm">
              ৳
            </div>
            <Input
              id="paidAmt"
              type="number"
              className="pl-12"
              placeholder="0"
              value={paidAmount}
              onChange={(e) => {
                const val = e.target.value;
                handleAmountChange(val === "" ? "" : Number(val));
              }}
            />
          </div>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Payment Status</FieldLabel>
        <FieldContent>
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={handleStatusChange}
            className="justify-start gap-2 flex-wrap"
          >
            <ToggleGroupItem
              value="Unpaid"
              className="border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
            >
              Unpaid
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Partially Paid"
              className="border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
            >
              Partially Paid
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Full Paid"
              className="border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
            >
              Full Paid
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Refund"
              className="border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
            >
              Refund
            </ToggleGroupItem>
          </ToggleGroup>
        </FieldContent>
      </Field>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4 mt-2">
        <span className="font-semibold text-sm">Remaining Amount</span>
        <span className={`font-bold ${remainingDue > 0 ? "text-destructive" : "text-green-600 dark:text-green-500"}`}>
          ৳ {remainingDue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
