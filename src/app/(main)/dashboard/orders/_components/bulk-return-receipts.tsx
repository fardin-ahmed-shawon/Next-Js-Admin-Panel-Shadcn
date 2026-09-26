"use client";

import useSWR from "swr";
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
import { ReturnProductThumbnail } from "@/components/return-product-thumbnail";
import { fetchClient } from "@/lib/fetch-client";

interface ReturnLine {
  id: number;
  qty?: number;
  return_received_qty?: number;
  bundle_snapshot?: { title?: string };
  returnable_qty?: number;
  size_label?: string;
  color_label?: string;
  inventory_contract_version?: number;
  returnable_quantity_base?: number | string;
  required_quantity_base?: number | string;
  base_quantity_per_sale?: number | string;
  base_unit_code?: string;
  option_label_snapshot?: string;
  product?: { title?: string; product_thumbnail_img?: string | null };
}
interface ReturnOrder {
  order_no: string;
  order_status: string;
  ordered_products?: ReturnLine[];
}

export function BulkReturnReceipts({ order, onSuccess }: { order: ReturnOrder | null; onSuccess: () => unknown }) {
  const lines = order?.ordered_products || [];
  const { data: history, mutate: refreshHistory } = useSWR(
    order ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}orders/${encodeURIComponent(order.order_no)}/returns` : null,
    async (url: string) => {
      const r = await fetchClient(url);
      if (!r.ok) throw new Error("Could not load receipts");
      return r.json();
    },
  );
  const received = async () => {
    await refreshHistory();
    await onSuccess();
  };
  if (!order || !lines.length) return null;
  const canReceive = ["delivered", "returned", "in-courier", "pending-return", "partial"].includes(
    order.order_status?.toLowerCase(),
  );
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">Confirm returned products</h3>
        <p className="text-muted-foreground text-sm">
          Pending-Return does not put goods back in stock. Receive the physical return here and choose whether it can be
          sold again. This records inventory only; process any refund separately. Save other order edits first.
        </p>
      </div>
      {!canReceive && (
        <p className="text-muted-foreground text-sm">
          Save the order as Pending-Return before confirming returned products.
        </p>
      )}
      {lines.map((line) => (
        <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/30 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <ReturnProductThumbnail
              src={line.product?.product_thumbnail_img}
              title={line.product?.title || "Product"}
            />
            <div>
              <p className="font-medium text-sm">
                {line.product?.title || "Product"} —{" "}
                {line.option_label_snapshot ||
                  [line.size_label, line.color_label].filter(Boolean).join(" / ") ||
                  "Piece"}
              </p>
              <p className="text-muted-foreground text-xs">
                {line.bundle_snapshot?.title && <>Combo: {line.bundle_snapshot.title} · </>}Returned:{" "}
                {Number(line.return_received_qty || 0)} / {line.qty || 0} · Returnable:{" "}
                {Number(line.returnable_qty ?? 0)} {Number(line.inventory_contract_version) === 2 ? "packs" : "units"}
              </p>
            </div>
          </div>
          <ReceiveReturnButton orderNo={order.order_no} line={line} canReceive={canReceive} onSuccess={received} />
        </div>
      ))}
      {history?.data?.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <h4 className="font-medium">Return history</h4>
          {history.data.map((receipt: any) => (
            <div className="flex items-start gap-3 text-sm rounded border p-3" key={receipt.id}>
              <ReturnProductThumbnail src={receipt.product_thumbnail_img} title={receipt.product_title || "Product"} />
              <div className="min-w-0">
                <strong>
                  {receipt.product_title} · {receipt.option_label} × {receipt.qty}
                </strong>
                <p>
                  {receipt.disposition === "restock" ? "Restocked" : "Discarded"} · {receipt.actor_name} ·{" "}
                  {new Date(receipt.created_at).toLocaleString()}
                </p>
                <p>Reason: {receipt.reason}</p>
                <p className="whitespace-pre-wrap">Note: {receipt.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [disposition, setDisposition] = useState("restock");
  const [saving, setSaving] = useState(false);
  const [retryPending, setRetryPending] = useState(false);
  const operationKey = useRef<string | null>(null);
  const max = Number(line.returnable_qty ?? 0);
  async function submit() {
    if (!reason.trim() || !note.trim()) {
      toast.error("Reason and note are required.");
      return;
    }
    if (!Number.isInteger(Number(qty)) || Number(qty) <= 0 || (!retryPending && Number(qty) > max)) {
      toast.error("Enter a whole quantity within the returnable amount.");
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
          body: JSON.stringify({
            qty: Number(qty),
            disposition,
            reason: reason.trim(),
            note: note.trim(),
            operation_key: operationKey.current,
          }),
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
          Mark as Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Mark as Return —{" "}
            {line.option_label_snapshot || [line.size_label, line.color_label].filter(Boolean).join(" / ") || "Piece"}
          </DialogTitle>
          <DialogDescription>
            Record goods physically received for order {orderNo}. Returnable: {max} units.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`return-qty-${line.id}`}>Quantity</Label>
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
        <div className="space-y-2">
          <Label htmlFor={`return-reason-${line.id}`}>Reason (required)</Label>
          <Input
            id={`return-reason-${line.id}`}
            maxLength={255}
            value={reason}
            disabled={saving || retryPending}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Damaged, wrong item, customer refused…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`return-note-${line.id}`}>Note (required)</Label>
          <textarea
            id={`return-note-${line.id}`}
            className="w-full border rounded p-2"
            rows={3}
            maxLength={5000}
            value={note}
            disabled={saving || retryPending}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Inspection details and return context"
          />
        </div>
        <p className="text-muted-foreground text-sm">
          Physical quantity:{" "}
          {Number(qty || 0) *
            Number(line.base_quantity_per_sale ?? (/^(\d+)\s*Pieces?$/i.exec(line.size_label || "")?.[1] || 1))}{" "}
          {line.base_unit_code ?? "piece"}.{" "}
          {disposition === "restock"
            ? "Stock returns to the original lot. Blocked or expired bulk lots remain unavailable."
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
