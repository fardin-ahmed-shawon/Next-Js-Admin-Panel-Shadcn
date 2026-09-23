"use client";

import { useRef, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchClient } from "@/lib/fetch-client";

interface ReturnLine {
  id: number;
  inventory_contract_version?: number;
  returnable_quantity_base?: number | string;
  required_quantity_base?: number | string;
  base_quantity_per_sale?: number | string;
  base_unit_code?: string;
  option_label_snapshot?: string;
  product?: { title?: string };
}
interface ReturnOrder {
  order_no: string;
  order_status: string;
  ordered_products?: ReturnLine[];
}

export function BulkReturnReceipts({ order, onSuccess }: { order: ReturnOrder | null; onSuccess: () => unknown }) {
  const lines = order?.ordered_products?.filter((line) => Number(line.inventory_contract_version) === 2) || [];
  if (!order || !lines.length) return null;
  const canReceive = ["delivered", "returned", "in-courier"].includes(order.order_status?.toLowerCase());
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">Receive returned bulk goods</h3>
        <p className="text-muted-foreground text-sm">
          A courier return status does not put bulk goods back in stock. Receive the physical return here and choose
          whether it can be sold again. This records inventory only; process any refund separately. Save other order
          edits first.
        </p>
      </div>
      {!canReceive && (
        <p className="text-muted-foreground text-sm">
          Available when the saved order status is Delivered, Returned, or In-Courier.
        </p>
      )}
      {lines.map((line) => (
        <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/30 p-3">
          <div>
            <p className="font-medium text-sm">
              {line.product?.title || "Product"} — {line.option_label_snapshot ?? "Pack"}
            </p>
            <p className="text-muted-foreground text-xs">
              Returnable:{" "}
              {Math.floor(
                Number(line.returnable_quantity_base ?? 0) / Math.max(1, Number(line.base_quantity_per_sale ?? 1)),
              )}{" "}
              packs
            </p>
          </div>
          <ReceiveReturnButton orderNo={order.order_no} line={line} canReceive={canReceive} onSuccess={onSuccess} />
        </div>
      ))}
    </div>
  );
}

function ReceiveReturnButton({
  orderNo,
  line,
  canReceive,
  onSuccess,
}: {
  orderNo: string;
  line: ReturnLine;
  canReceive: boolean;
  onSuccess: () => unknown;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [disposition, setDisposition] = useState("restock");
  const [saving, setSaving] = useState(false);
  const [retryPending, setRetryPending] = useState(false);
  const operationKey = useRef<string | null>(null);
  const max = Math.floor(
    Number(line.returnable_quantity_base ?? 0) / Math.max(1, Number(line.base_quantity_per_sale ?? 1)),
  );
  async function submit() {
    if (!Number.isInteger(Number(qty)) || Number(qty) <= 0 || (!retryPending && Number(qty) > max)) {
      toast.error("Enter a whole pack quantity within the returnable amount.");
      return;
    }
    operationKey.current ||= crypto.randomUUID();
    setSaving(true);
    setRetryPending(true);
    try {
      const response = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}orders/${encodeURIComponent(orderNo)}/items/${line.id}/return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ qty: Number(qty), disposition, operation_key: operationKey.current }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status >= 400 && response.status < 500 && response.status !== 408) {
          setRetryPending(false);
          operationKey.current = null;
        }
        throw new Error(data.message || "Could not receive return.");
      }
      setOpen(false);
      setRetryPending(false);
      operationKey.current = null;
      toast.success(
        disposition === "restock"
          ? "Returned goods received and stock restored."
          : "Returned goods recorded as discarded; saleable stock was not increased.",
      );
      await Promise.resolve(onSuccess()).catch(() =>
        toast.error("Receipt saved. Refresh the order to see the updated balance."),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not receive return. Retry the same receipt to avoid duplicates.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={!canReceive || (max < 1 && !retryPending)}>
          Receive return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive return — {line.option_label_snapshot ?? "Pack"}</DialogTitle>
          <DialogDescription>
            Record goods physically received for order {orderNo}. Returnable: {max} packs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`return-qty-${line.id}`}>Quantity (packs)</Label>
          <Input
            id={`return-qty-${line.id}`}
            type="number"
            min="1"
            max={max}
            step="1"
            value={qty}
            disabled={saving || retryPending}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Condition of received goods</Label>
          <Select value={disposition} disabled={saving || retryPending} onValueChange={setDisposition}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restock">Saleable — restore stock</SelectItem>
              <SelectItem value="discard">Damaged / spoiled — discard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-muted-foreground text-sm">
          Physical quantity: {Number(qty || 0) * Number(line.base_quantity_per_sale ?? 0)}{" "}
          {line.base_unit_code ?? "base units"}.{" "}
          {disposition === "restock"
            ? "This quantity will become available for sale."
            : "This quantity will remain unavailable for sale."}
        </p>
        {retryPending && !saving && (
          <p className="text-muted-foreground text-sm">
            The receipt has not been confirmed. Retry uses the same reference so it cannot be recorded twice.
          </p>
        )}
        <Button type="button" onClick={submit} disabled={saving}>
          {saving ? "Receiving…" : retryPending ? "Retry receipt" : "Confirm receipt"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
